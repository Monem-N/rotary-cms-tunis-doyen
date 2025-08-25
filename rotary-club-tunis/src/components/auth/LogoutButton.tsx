'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';

// Multi-language messages
const messages = {
  fr: {
    logout: 'Se déconnecter',
    loggingOut: 'Déconnexion...',
    error: 'Erreur lors de la déconnexion'
  },
  ar: {
    logout: 'تسجيل الخروج',
    loggingOut: 'جاري تسجيل الخروج...',
    error: 'خطأ في تسجيل الخروج'
  },
  en: {
    logout: 'Logout',
    loggingOut: 'Logging out...',
    error: 'Logout error'
  }
};

interface LogoutButtonProps {
  locale?: 'fr' | 'ar' | 'en';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  redirectTo?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function LogoutButton({
  locale = 'fr',
  variant = 'outline',
  size = 'default',
  className = '',
  redirectTo = '/login',
  onSuccess,
  onError
}: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const t = messages[locale];

  const handleLogout = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Successful logout
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(redirectTo);
          router.refresh();
        }
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || t.error;

        if (onError) {
          onError(errorMessage);
        } else {
          console.error('Logout failed:', errorMessage);
          // Still redirect even if logout API fails
          router.push(redirectTo);
          router.refresh();
        }
      }
    } catch (error) {
      console.error('Logout error:', error);

      if (onError) {
        onError(t.error);
      } else {
        // Still redirect even if logout API fails
        router.push(redirectTo);
        router.refresh();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleLogout}
      disabled={isLoading}
    >
      {isLoading ? t.loggingOut : t.logout}
    </Button>
  );
}