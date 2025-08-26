// Password Reset Confirmation API Route for Rotary Club Tunis Doyen CMS
// Verifies reset token and updates user password securely
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

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

// Password validation function
function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }

  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  if (!/(?=.*[!@#$%^&*])/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// Security logging function
async function logPasswordResetConfirmation(data: {
  email: string
  ipAddress: string
  userAgent: string
  success: boolean
  failureReason?: string
  passwordStrength?: 'weak' | 'medium' | 'strong'
}) {
  const logData = {
    ...data,
    timestamp: new Date().toISOString(),
    eventType: 'password_reset_confirmation'
  }

  if (data.success) {
    console.log('✅ Password reset successful:', logData)
  } else {
    console.warn('⚠️ Password reset failed:', logData)
  }
}

// Assess password strength
function assessPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
  let score = 0

  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[!@#$%^&*]/.test(password)) score++
  if (password.length >= 16) score++

  if (score >= 6) return 'strong'
  if (score >= 4) return 'medium'
  return 'weak'
}

export async function POST(request: NextRequest) {
  try {
    const { email, token, newPassword } = await request.json()

    // Input validation
    if (!email || !token || !newPassword) {
      return NextResponse.json(
        { error: 'Email, reset token, and new password are required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Validate password strength
    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        {
          error: 'Password does not meet security requirements',
          details: passwordValidation.errors
        },
        { status: 400 }
      )
    }

    // Get client IP for logging
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown'

    // Find user (using mock database - replace with Payload integration)
    const user = mockUsers.find(u => u.email === email)

    if (!user) {
      await logPasswordResetConfirmation({
        email,
        ipAddress,
        userAgent: request.headers.get('user-agent') || 'unknown',
        success: false,
        failureReason: 'user_not_found'
      })

      return NextResponse.json(
        { error: 'Invalid reset request' },
        { status: 400 }
      )
    }

    // Check if reset token exists and is valid
    if (!user.resetToken || user.resetToken !== token) {
      await logPasswordResetConfirmation({
        email,
        ipAddress,
        userAgent: request.headers.get('user-agent') || 'unknown',
        success: false,
        failureReason: 'invalid_token'
      })

      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    // Check if reset token has expired
    if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      // Clear expired token
      user.resetToken = null
      user.resetTokenExpiry = null

      await logPasswordResetConfirmation({
        email,
        ipAddress,
        userAgent: request.headers.get('user-agent') || 'unknown',
        success: false,
        failureReason: 'token_expired'
      })

      return NextResponse.json(
        { error: 'Reset token has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update user password and clear reset token
    user.password = hashedPassword
    user.resetToken = null
    user.resetTokenExpiry = null

    // Assess password strength for logging
    const passwordStrength = assessPasswordStrength(newPassword)

    // Log successful password reset
    await logPasswordResetConfirmation({
      email,
      ipAddress,
      userAgent: request.headers.get('user-agent') || 'unknown',
      success: true,
      passwordStrength
    })

    return NextResponse.json({
      success: true,
      message: 'Password has been successfully reset. You can now log in with your new password.'
    })

  } catch (error) {
    console.error('Password reset confirmation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
