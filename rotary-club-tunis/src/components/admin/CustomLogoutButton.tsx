// Custom Logout Button Component for Rotary Club Tunis Doyen CMS
// Enhanced security-focused logout with proper session cleanup
import React from 'react'
import { Button } from '../ui/button'

// Note: useAuth hook import may need to be adjusted based on Payload CMS version
// For now, we'll use a simplified approach that works with the current setup

const CustomLogoutButton: React.FC = () => {
  const handleLogout = async () => {
    try {
      // Log security event before logout
      console.log('🔐 User initiated logout')

      // Clear any local storage or session data
      if (typeof window !== 'undefined') {
        // Clear any cached authentication data
        localStorage.removeItem('payload-auth')
        sessionStorage.clear()

        // Clear any custom application data
        localStorage.removeItem('rotary-tunis-preferences')
        localStorage.removeItem('rotary-tunis-language')
      }

      // Perform logout via API call
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        // Redirect to login page with success message
        window.location.href = '/admin/login?message=logout-success'
      } else {
        throw new Error('Logout request failed')
      }

    } catch (error) {
      console.error('❌ Logout error:', error)

      // Fallback: force logout even if there's an error
      if (typeof window !== 'undefined') {
        localStorage.removeItem('payload-auth')
        sessionStorage.clear()
        window.location.href = '/admin/login?message=logout-error'
      }
    }
  }

  return (
    <Button
      onClick={handleLogout}
      variant="outline"
      size="sm"
      className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16,17 21,12 16,7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
      <span className="hidden sm:inline">Logout</span>
      <span className="sm:hidden">🚪</span>
    </Button>
  )
}

export default CustomLogoutButton