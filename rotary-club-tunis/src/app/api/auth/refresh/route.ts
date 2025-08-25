import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, generateToken } from '../../../../lib/auth';

// Security headers for Tunisia network
const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

export async function POST(request: NextRequest) {
  const response = NextResponse.next();

  // Add security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  try {
    // Get the current token from cookies
    const token = request.cookies.get('payload-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Token manquant' },
        { status: 401, headers: response.headers }
      );
    }

    // Verify the current token
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401, headers: response.headers }
      );
    }

    // Cast decoded token to access custom fields
    const userData = decoded as unknown as {
      id: string;
      email: string;
      role?: string;
      firstName?: string;
      lastName?: string;
      languagePreference?: string;
    };

    // Generate a new token with fresh expiration
    const newToken = generateToken({
      id: userData.id,
      email: userData.email,
      role: (userData.role as 'admin' | 'editor' | 'volunteer') || 'volunteer',
      firstName: userData.firstName,
      lastName: userData.lastName,
      languagePreference: (userData.languagePreference as 'fr' | 'ar' | 'en') || 'fr'
    });

    // Set the new token in cookies
    response.cookies.set('payload-token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Token rafraîchi avec succès',
        user: {
          id: userData.id,
          email: userData.email,
          role: userData.role,
          firstName: userData.firstName,
          lastName: userData.lastName,
          languagePreference: userData.languagePreference
        }
      },
      { headers: response.headers }
    );

  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du rafraîchissement du token' },
      { status: 500, headers: response.headers }
    );
  }
}