// Secure Logout API Route for Rotary Club Tunis Doyen CMS
// Implements secure session cleanup and security logging
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Security logging function (will be enhanced with Payload integration)
async function logLogoutAttempt(data: {
  ipAddress: string
  userAgent: string
  success: boolean
  sessionFingerprint?: string
  reason?: string
}) {
  // For now, log to console - will be enhanced with Payload integration
  const logData = {
    ...data,
    timestamp: new Date().toISOString(),
    country: 'TN', // Default to Tunisia, could be enhanced with geolocation
    eventType: 'logout'
  }

  if (data.success) {
    console.log('✅ Successful logout:', logData)
  } else {
    console.warn('⚠️ Logout issue:', logData)
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for logging
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown'

    // Get user agent for logging
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Get session fingerprint from cookie or header
    const sessionFingerprint = request.cookies.get('session-fingerprint')?.value ||
                              request.headers.get('x-session-fingerprint') ||
                              'unknown'

    // Clear the authentication cookie
    const response = NextResponse.json({
      success: true,
      message: 'Successfully logged out'
    })

    // Clear the authentication cookie with secure settings
    response.cookies.set('payload-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Expire immediately
      path: '/'
    })

    // Clear any additional session cookies
    response.cookies.set('session-fingerprint', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    })

    // Log the successful logout
    await logLogoutAttempt({
      ipAddress,
      userAgent,
      success: true,
      sessionFingerprint,
      reason: 'user_initiated'
    })

    return response

  } catch (error) {
    console.error('Logout error:', error)

    // Log the failed logout attempt
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown'

    await logLogoutAttempt({
      ipAddress,
      userAgent: request.headers.get('user-agent') || 'unknown',
      success: false,
      reason: 'system_error'
    })

    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}

// Also support GET requests for logout (useful for simple logout links)
export async function GET(request: NextRequest) {
  // Redirect to login page after logout
  const loginUrl = new URL('/login', request.url)

  const response = NextResponse.redirect(loginUrl)

  // Clear cookies on redirect
  response.cookies.set('payload-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/'
  })

  response.cookies.set('session-fingerprint', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/'
  })

  // Log the logout
  const ipAddress = request.headers.get('x-forwarded-for') ||
                   request.headers.get('x-real-ip') ||
                   'unknown'

  await logLogoutAttempt({
    ipAddress,
    userAgent: request.headers.get('user-agent') || 'unknown',
    success: true,
    reason: 'get_request_logout'
  })

  return response
}