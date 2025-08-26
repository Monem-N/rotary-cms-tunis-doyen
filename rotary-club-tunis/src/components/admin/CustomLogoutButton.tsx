// Enhanced Custom Logout Button Component for Rotary Club Tunis Doyen CMS
// Multilingual support with comprehensive session cleanup and security logging
'use client'

import React, { useState } from 'react'
import { Button } from '../ui/button'

// Multi-language messages
const messages = {
  fr: {
    logout: 'Déconnexion',
    loggingOut: 'Déconnexion...',
    logoutSuccess: 'Déconnexion réussie',
    logoutError: 'Erreur de déconnexion'
  },
  ar: {
    logout: 'تسجيل الخروج',
    loggingOut: 'جاري تسجيل الخروج...',
    logoutSuccess: 'تم تسجيل الخروج بنجاح',
    logoutError: 'خطأ في تسجيل الخروج'
  },
  en: {
    logout: 'Logout',
    loggingOut: 'Logging out...',
    logoutSuccess: 'Logged out successfully',
    logoutError: 'Logout error'
  }
}

interface CustomLogoutButtonProps {
  locale?: 'fr' | 'ar' | 'en'
  onLogoutSuccess?: () => void
  onLogoutError?: (error: Error) => void
  redirectTo?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  showIcon?: boolean
  showText?: boolean
}

const CustomLogoutButton: React.FC<CustomLogoutButtonProps> = ({
  locale = 'fr',
  onLogoutSuccess,
  onLogoutError,
  redirectTo = '/login',
  variant = 'outline',
  size = 'sm',
  showIcon = true,
  showText = true
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const t = messages[locale]

  const handleLogout = async () => {
    if (isLoading) return

    setIsLoading(true)

    try {
      // Log security event before logout
      console.log('🔐 User initiated logout')

      // Clear all authentication and session data
      if (typeof window !== 'undefined') {
        // Clear authentication tokens
        localStorage.removeItem('payload-auth')
        localStorage.removeItem('payload-token')
        sessionStorage.clear()

        // Clear application-specific data
        localStorage.removeItem('rotary-tunis-preferences')
        localStorage.removeItem('rotary-tunis-language')
        localStorage.removeItem('rotary-tunis-theme')
        localStorage.removeItem('rotary-tunis-settings')

        // Clear any cached user data
        localStorage.removeItem('user-profile')
        localStorage.removeItem('user-permissions')
        localStorage.removeItem('last-login')

        // Clear any form data or temporary state
        localStorage.removeItem('draft-content')
        localStorage.removeItem('unsaved-changes')

        // Clear any cached API responses
        const keysToRemove = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (key.startsWith('api-cache-') || key.startsWith('payload-query-'))) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key))
      }

      // Perform logout via API call with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      try {
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (response.ok) {
          // Successful logout
          if (onLogoutSuccess) {
            onLogoutSuccess()
          }

          // Redirect with success message
          const redirectUrl = `${redirectTo}?locale=${locale}&message=logout_success`
          window.location.href = redirectUrl
        } else {
          throw new Error(`Logout request failed with status ${response.status}`)
        }
      } catch (fetchError) {
        clearTimeout(timeoutId)

        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new Error('Logout request timed out')
        }
        throw fetchError
      }

    } catch (error) {
      console.error('❌ Logout error:', error)

      // Log the error for monitoring
      if (onLogoutError) {
        onLogoutError(error instanceof Error ? error : new Error('Unknown logout error'))
      }

      // Fallback: force logout even if there's an error
      if (typeof window !== 'undefined') {
        // Clear all data as fallback
        localStorage.clear()
        sessionStorage.clear()

        // Redirect with error message
        const redirectUrl = `${redirectTo}?locale=${locale}&message=logout_error`
        window.location.href = redirectUrl
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleLogout}
      variant={variant}
      size={size}
      disabled={isLoading}
      className={`flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors ${
        locale === 'ar' ? 'flex-row-reverse' : ''
      }`}
      aria-label={t.logout}
      title={t.logout}
    >
      {showIcon && (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={isLoading ? 'animate-spin' : ''}
          aria-hidden="true"
        >
          {isLoading ? (
            // Loading spinner
            <circle cx="12" cy="12" r="10" className="opacity-25" />
          ) : (
            // Logout icon
            <>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16,17 21,12 16,7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </>
          )}
        </svg>
      )}

      {showText && (
        <span className={locale === 'ar' ? 'font-arabic' : ''}>
          {isLoading ? t.loggingOut : t.logout}
        </span>
      )}
    </Button>
  )
}

export default CustomLogoutButton
