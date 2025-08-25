import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// In-memory CSRF token store (in production, use Redis or database)
const csrfTokens = new Map<string, { token: string; expires: number }>();
const CSRF_TOKEN_TTL = 60 * 60 * 1000; // 1 hour

function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function cleanupExpiredTokens(): void {
  const now = Date.now();
  for (const [sessionId, data] of csrfTokens.entries()) {
    if (now > data.expires) {
      csrfTokens.delete(sessionId);
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    // Generate a session identifier (in production, use actual session ID)
    const sessionId = crypto.randomBytes(16).toString('hex');
    const csrfToken = generateCsrfToken();
    const expires = Date.now() + CSRF_TOKEN_TTL;

    // Store token with expiration
    csrfTokens.set(sessionId, { token: csrfToken, expires });

    // Clean up expired tokens periodically
    cleanupExpiredTokens();

    // Set session cookie
    const response = NextResponse.json({
      csrfToken,
      sessionId
    });

    response.cookies.set('csrf-session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: CSRF_TOKEN_TTL / 1000,
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('CSRF token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { csrfToken } = await request.json();
    const sessionId = request.cookies.get('csrf-session')?.value;

    if (!csrfToken || !sessionId) {
      return NextResponse.json(
        { error: 'CSRF token or session missing' },
        { status: 400 }
      );
    }

    const storedToken = csrfTokens.get(sessionId);

    if (!storedToken || storedToken.token !== csrfToken) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }

    if (Date.now() > storedToken.expires) {
      csrfTokens.delete(sessionId);
      return NextResponse.json(
        { error: 'CSRF token expired' },
        { status: 403 }
      );
    }

    // Token is valid, remove it to prevent reuse
    csrfTokens.delete(sessionId);

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('CSRF validation error:', error);
    return NextResponse.json(
      { error: 'CSRF validation failed' },
      { status: 500 }
    );
  }
}

// Clean up expired tokens every 30 minutes
if (typeof globalThis !== 'undefined') {
  setInterval(cleanupExpiredTokens, 30 * 60 * 1000);
}