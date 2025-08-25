import { NextRequest, NextResponse } from 'next/server';
import { extractUserFromToken } from '../lib/auth';


// Security headers for Tunisia network
const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

// Rate limiting for Tunisia network connectivity
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 100;
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

async function checkRateLimit(ip: string): Promise<boolean> {
  const key = `rate-limit:${ip}`;
  const current = await redis.get(key);

  if (!current) {
    await redis.set(key, '1', 'PX', RATE_LIMIT_WINDOW);
    return true;
  }

  if (parseInt(current) >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  await redis.incr(key);
  return true;
}

export async function authMiddleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Get client IP for rate limiting
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';

  // Apply rate limiting
  if (!(await checkRateLimit(ip))) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  // Get the pathname
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/api/graphql',
    '/api/graphql-playground',
    '/login',
    '/register',
    '/forgot-password',
  ];

  // Admin routes that require authentication
  const adminRoutes = [
    '/admin',
    '/api/users',
  ];

  // Check if the route requires authentication
  const requiresAuth = adminRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  if (requiresAuth && !isPublicRoute) {
    try {
      // Validate JWT token
      const payloadToken = request.cookies.get('payload-token')?.value;

      if (!payloadToken) {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      const user = extractUserFromToken(payloadToken);

      if (!user) {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      // Add user info to response headers for client-side access
      response.headers.set('x-user-id', user.id);
      response.headers.set('x-user-role', user.role);

    } catch (error) {
      console.error('Authentication error:', error);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return response;
}

// Export the middleware configuration
export const middlewareConfig = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
