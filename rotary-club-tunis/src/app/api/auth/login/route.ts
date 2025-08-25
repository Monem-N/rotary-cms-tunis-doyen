import { NextRequest, NextResponse } from 'next/server';
import payload from 'payload';
import { generateToken, verifyPassword } from '../../../../lib/auth';
import { LoginRequest, LoginResponse, AuthError, ExtendedUser } from '../../../../lib/types';

// Security headers for Tunisia network
const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

// Rate limiting for login attempts (5 per 15 minutes)
const LOGIN_RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const LOGIN_RATE_LIMIT_MAX_ATTEMPTS = 5;
const loginRateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkLoginRateLimit(identifier: string): { allowed: boolean; remainingTime?: number } {
  const now = Date.now();
  const userLimit = loginRateLimitStore.get(identifier);

  if (!userLimit || now > userLimit.resetTime) {
    loginRateLimitStore.set(identifier, { count: 1, resetTime: now + LOGIN_RATE_LIMIT_WINDOW });
    return { allowed: true };
  }

  if (userLimit.count >= LOGIN_RATE_LIMIT_MAX_ATTEMPTS) {
    const remainingTime = Math.ceil((userLimit.resetTime - now) / 1000 / 60); // minutes
    return { allowed: false, remainingTime };
  }

  userLimit.count++;
  return { allowed: true };
}

function logLoginAttempt(email: string, ip: string, success: boolean, failureReason?: string) {
  console.log(`[LOGIN ATTEMPT] ${new Date().toISOString()} - Email: ${email}, IP: ${ip}, Success: ${success}${failureReason ? `, Reason: ${failureReason}` : ''}`);

  // TODO: Implement database logging for login attempts
  // This would involve creating a LoginAttempts collection and storing attempts there
}

export async function POST(request: NextRequest) {
  const response = NextResponse.next();

  // Add security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  try {
    const body = await request.json();
    const { email, password, csrfToken }: LoginRequest = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400, headers: response.headers }
      );
    }

    // Validate CSRF token
    if (!csrfToken) {
      return NextResponse.json(
        { error: 'Jeton de sécurité manquant' },
        { status: 403, headers: response.headers }
      );
    }

    // Validate CSRF token with server
    const csrfResponse = await fetch(`${request.nextUrl.origin}/api/auth/csrf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || ''
      },
      body: JSON.stringify({ csrfToken })
    });

    if (!csrfResponse.ok) {
      return NextResponse.json(
        { error: 'Jeton de sécurité invalide' },
        { status: 403, headers: response.headers }
      );
    }

    const csrfValidation = await csrfResponse.json();
    if (!csrfValidation.valid) {
      return NextResponse.json(
        { error: 'Jeton de sécurité invalide' },
        { status: 403, headers: response.headers }
      );
    }

    // Get client IP for rate limiting
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';

    // Check rate limiting (use email + IP as identifier)
    const rateLimitKey = `${email}:${ip}`;
    const rateLimitCheck = checkLoginRateLimit(rateLimitKey);

    if (!rateLimitCheck.allowed) {
      logLoginAttempt(email, ip, false, 'Rate limit exceeded');
      return NextResponse.json(
        {
          error: `Trop de tentatives de connexion. Réessayez dans ${rateLimitCheck.remainingTime} minutes.`,
          retryAfter: rateLimitCheck.remainingTime
        },
        {
          status: 429,
          headers: {
            ...response.headers,
            'Retry-After': (rateLimitCheck.remainingTime! * 60).toString()
          }
        }
      );
    }

    // Find user by email
    const users = await payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      limit: 1
    });

    if (users.docs.length === 0) {
      logLoginAttempt(email, ip, false, 'User not found');
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401, headers: response.headers }
      );
    }

    const user = users.docs[0];

    // Cast user to access custom fields
    const extendedUser = user as unknown as ExtendedUser;

    // Check if account is locked
    if (extendedUser.lockUntil && new Date(extendedUser.lockUntil) > new Date()) {
      const remainingTime = Math.ceil((new Date(extendedUser.lockUntil).getTime() - Date.now()) / 1000 / 60);
      logLoginAttempt(email, ip, false, 'Account locked');
      return NextResponse.json(
        {
          error: `Compte temporairement verrouillé. Réessayez dans ${remainingTime} minutes.`,
          retryAfter: remainingTime
        },
        {
          status: 423,
          headers: {
            ...response.headers,
            'Retry-After': (remainingTime * 60).toString()
          }
        }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, extendedUser.password || '');

    if (!isValidPassword) {
      // Increment failed login attempts using Payload's built-in field
      const currentUser = user as unknown as ExtendedUser;
      const failedAttempts = (currentUser.loginAttempts as number || 0) + 1;
      const maxAttempts = 5; // From Users collection config

      if (failedAttempts >= maxAttempts) {
        // Lock the account using Payload's built-in lockTime
        const lockUntil = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await payload.update({
          collection: 'users',
          id: extendedUser.id,
          data: {
            loginAttempts: failedAttempts,
            lockUntil: lockUntil.toISOString()
          }
        });

        logLoginAttempt(email, ip, false, 'Account locked due to failed attempts');
        return NextResponse.json(
          { error: 'Compte verrouillé en raison de trop de tentatives échouées. Réessayez dans 1 heure.' },
          { status: 423, headers: response.headers }
        );
      } else {
        // Update failed attempts count
        await payload.update({
          collection: 'users',
          id: extendedUser.id,
          data: { loginAttempts: failedAttempts }
        });

        logLoginAttempt(email, ip, false, 'Invalid password');
        return NextResponse.json(
          { error: 'Email ou mot de passe incorrect' },
          { status: 401, headers: response.headers }
        );
      }
    }

    // Successful login - reset failed attempts
    await payload.update({
      collection: 'users',
      id: extendedUser.id,
      data: {
        loginAttempts: 0,
        lockUntil: null
      }
    });

    // Generate JWT token
    const token = generateToken({
      id: extendedUser.id,
      email: extendedUser.email,
      role: extendedUser.role ?? 'volunteer',
      firstName: extendedUser.firstName,
      lastName: extendedUser.lastName,
      languagePreference: extendedUser.languagePreference ?? 'fr'
    });

    // Set HTTP-only cookie
    response.cookies.set('payload-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    logLoginAttempt(email, ip, true);

    return NextResponse.json(
      {
        success: true,
        message: 'Connexion réussie',
        user: {
          id: extendedUser.id,
          email: extendedUser.email,
          role: extendedUser.role,
          firstName: extendedUser.firstName,
          lastName: extendedUser.lastName,
          languagePreference: extendedUser.languagePreference
        }
      },
      { headers: response.headers }
    );

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500, headers: response.headers }
    );
  }
}