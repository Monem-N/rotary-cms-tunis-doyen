// Enhanced Login API Route for Rotary Club Tunis Doyen CMS
// Implements security logging, rate limiting, and session management
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
const RATE_LIMIT_MAX_ATTEMPTS = 5

// Simple security logging function (will be enhanced with Payload integration)
async function logLoginAttempt(data: {
  email: string
  ipAddress: string
  userAgent: string
  success: boolean
  failureReason?: string
  sessionFingerprint?: string
  rateLimitExceeded?: boolean
}) {
  // For now, log to console - will be enhanced with Payload integration
  const logData = {
    ...data,
    timestamp: new Date().toISOString(),
    country: 'TN', // Default to Tunisia, could be enhanced with geolocation
    riskLevel: data.success ? 'low' : 'medium'
  }

  if (data.success) {
    console.log('✅ Successful login:', logData)
  } else {
    console.warn('⚠️ Failed login attempt:', logData)
  }
}

// Mock user database (replace with Payload integration)
const mockUsers = [
  {
    id: '1',
    email: 'admin@rotary-tunis.tn',
    password: '$2a$10$example.hash.here', // bcrypt hash for 'password123'
    role: 'admin',
    languagePreference: 'fr',
    locked: false
  },
  {
    id: '2',
    email: 'volunteer@rotary-tunis.tn',
    password: '$2a$10$example.hash.here', // bcrypt hash for 'password123'
    role: 'volunteer',
    languagePreference: 'ar',
    locked: false
  }
]

// Rate limiting function
function checkRateLimit(ipAddress: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const windowKey = ipAddress
  const windowData = rateLimitStore.get(windowKey)

  if (!windowData || now > windowData.resetTime) {
    // New window or expired window
    rateLimitStore.set(windowKey, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return { allowed: true, remaining: RATE_LIMIT_MAX_ATTEMPTS - 1 }
  }

  if (windowData.count >= RATE_LIMIT_MAX_ATTEMPTS) {
    return { allowed: false, remaining: 0 }
  }

  windowData.count++
  return { allowed: true, remaining: RATE_LIMIT_MAX_ATTEMPTS - windowData.count }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Input validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Get client IP for rate limiting and logging
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown'

    // Check rate limiting
    const rateLimit = checkRateLimit(ipAddress)
    if (!rateLimit.allowed) {
      await logLoginAttempt({
        email,
        ipAddress,
        userAgent: request.headers.get('user-agent') || 'unknown',
        success: false,
        failureReason: 'rate_limited',
        rateLimitExceeded: true
      })

      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      )
    }

    // Find user (using mock database - replace with Payload integration)
    const user = mockUsers.find(u => u.email === email)

    if (!user) {
      await logLoginAttempt({
        email,
        ipAddress,
        userAgent: request.headers.get('user-agent') || 'unknown',
        success: false,
        failureReason: 'invalid_credentials'
      })

      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check if account is locked
    if (user.locked) {
      await logLoginAttempt({
        email,
        ipAddress,
        userAgent: request.headers.get('user-agent') || 'unknown',
        success: false,
        failureReason: 'account_locked'
      })

      return NextResponse.json(
        { error: 'Account is locked. Please contact support.' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password || '')
    if (!isValidPassword) {
      await logLoginAttempt({
        email,
        ipAddress,
        userAgent: request.headers.get('user-agent') || 'unknown',
        success: false,
        failureReason: 'invalid_credentials'
      })

      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        languagePreference: user.languagePreference
      },
      process.env.PAYLOAD_SECRET || 'fallback-secret-key',
      { expiresIn: '7d' }
    )

    // Log successful login
    await logLoginAttempt({
      email,
      ipAddress,
      userAgent: request.headers.get('user-agent') || 'unknown',
      success: true,
      sessionFingerprint: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    })

    // Create response with secure cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        languagePreference: user.languagePreference
      }
    })

    // Set secure HTTP-only cookie
    response.cookies.set('payload-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}