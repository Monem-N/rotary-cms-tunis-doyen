// Password Reset API Route for Rotary Club Tunis Doyen CMS
// Implements secure password reset with email verification and rate limiting
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Rate limiting for password reset requests
const resetRateLimit = new Map<string, { count: number; resetTime: number }>()
const RESET_RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour
const RESET_RATE_LIMIT_MAX = 3

// Mock user database (replace with Payload integration)
const mockUsers = [
  {
    id: '1',
    email: 'admin@rotary-tunis.tn',
    password: '$2a$10$example.hash.here',
    role: 'admin',
    languagePreference: 'fr',
    locked: false,
    resetToken: null as string | null,
    resetTokenExpiry: null as Date | null
  },
  {
    id: '2',
    email: 'volunteer@rotary-tunis.tn',
    password: '$2a$10$example.hash.here',
    role: 'volunteer',
    languagePreference: 'ar',
    locked: false,
    resetToken: null as string | null,
    resetTokenExpiry: null as Date | null
  }
]

// Rate limiting function for password reset
function checkResetRateLimit(email: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const windowKey = `reset_${email}`
  const windowData = resetRateLimit.get(windowKey)

  if (!windowData || now > windowData.resetTime) {
    resetRateLimit.set(windowKey, { count: 1, resetTime: now + RESET_RATE_LIMIT_WINDOW })
    return { allowed: true, remaining: RESET_RATE_LIMIT_MAX - 1 }
  }

  if (windowData.count >= RESET_RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 }
  }

  windowData.count++
  return { allowed: true, remaining: RESET_RATE_LIMIT_MAX - windowData.count }
}

// Security logging function
async function logPasswordResetAttempt(data: {
  email: string
  ipAddress: string
  userAgent: string
  success: boolean
  failureReason?: string
  rateLimitExceeded?: boolean
}) {
  const logData = {
    ...data,
    timestamp: new Date().toISOString(),
    eventType: 'password_reset_request'
  }

  if (data.success) {
    console.log('✅ Password reset request:', logData)
  } else {
    console.warn('⚠️ Password reset request failed:', logData)
  }
}

// Generate secure reset token
function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// Send reset email (mock implementation - replace with actual email service)
async function sendResetEmail(email: string, resetToken: string, locale: string = 'fr'): Promise<boolean> {
  const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`

  const emailContent = {
    fr: {
      subject: 'Réinitialisation de votre mot de passe - Rotary Club Tunis Doyen',
      body: `Bonjour,

Vous avez demandé la réinitialisation de votre mot de passe pour votre compte Rotary Club Tunis Doyen.

Cliquez sur le lien suivant pour réinitialiser votre mot de passe :
${resetUrl}

Ce lien expire dans 1 heure pour des raisons de sécurité.

Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.

Cordialement,
L'équipe Rotary Club Tunis Doyen`
    },
    ar: {
      subject: 'إعادة تعيين كلمة المرور - نادي روتاري تونس دوايان',
      body: `مرحباً،

لقد طلبت إعادة تعيين كلمة المرور لحسابك في نادي روتاري تونس دوايان.

انقر على الرابط التالي لإعادة تعيين كلمة المرور:
${resetUrl}

هذا الرابط ينتهي في غضون ساعة واحدة لأسباب أمنية.

إذا لم تطلب هذه المعادة، تجاهل هذا البريد الإلكتروني.

مع خالص التحية،
فريق نادي روتاري تونس دوايان`
    },
    en: {
      subject: 'Password Reset - Rotary Club Tunis Doyen',
      body: `Hello,

You have requested a password reset for your Rotary Club Tunis Doyen account.

Click the following link to reset your password:
${resetUrl}

This link expires in 1 hour for security reasons.

If you did not request this reset, please ignore this email.

Best regards,
Rotary Club Tunis Doyen Team`
    }
  }

  const content = emailContent[locale as keyof typeof emailContent] || emailContent.fr

  try {
    // Mock email sending - replace with actual email service (SendGrid, Mailgun, etc.)
    console.log('📧 Sending password reset email:')
    console.log(`To: ${email}`)
    console.log(`Subject: ${content.subject}`)
    console.log(`Body: ${content.body.substring(0, 100)}...`)

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    return true
  } catch (error) {
    console.error('Email sending error:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Input validation
    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Get client IP for rate limiting and logging
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown'

    // Check rate limiting
    const rateLimit = checkResetRateLimit(email)
    if (!rateLimit.allowed) {
      await logPasswordResetAttempt({
        email,
        ipAddress,
        userAgent: request.headers.get('user-agent') || 'unknown',
        success: false,
        failureReason: 'rate_limited',
        rateLimitExceeded: true
      })

      return NextResponse.json(
        { error: 'Too many password reset requests. Please try again later.' },
        { status: 429 }
      )
    }

    // Find user (using mock database - replace with Payload integration)
    const user = mockUsers.find(u => u.email === email)

    if (!user) {
      // Don't reveal if email exists for security reasons
      // Still return success to prevent email enumeration attacks
      await logPasswordResetAttempt({
        email,
        ipAddress,
        userAgent: request.headers.get('user-agent') || 'unknown',
        success: false,
        failureReason: 'email_not_found'
      })

      return NextResponse.json({
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent.'
      })
    }

    // Generate secure reset token
    const resetToken = generateResetToken()
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

    // Store reset token in user record (in production, use database)
    user.resetToken = resetToken
    user.resetTokenExpiry = resetTokenExpiry

    // Send reset email
    const emailSent = await sendResetEmail(email, resetToken, user.languagePreference)

    if (!emailSent) {
      await logPasswordResetAttempt({
        email,
        ipAddress,
        userAgent: request.headers.get('user-agent') || 'unknown',
        success: false,
        failureReason: 'email_send_failed'
      })

      return NextResponse.json(
        { error: 'Failed to send reset email. Please try again.' },
        { status: 500 }
      )
    }

    // Log successful reset request
    await logPasswordResetAttempt({
      email,
      ipAddress,
      userAgent: request.headers.get('user-agent') || 'unknown',
      success: true
    })

    return NextResponse.json({
      success: true,
      message: 'Password reset link has been sent to your email.'
    })

  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
