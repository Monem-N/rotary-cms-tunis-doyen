'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';

interface CustomLogoutButtonProps {
  children?: React.ReactNode;
}

export const CustomLogoutButton: React.FC<CustomLogoutButtonProps> = ({ children }) => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Clear all client-side storage
      localStorage.clear();
      sessionStorage.clear();

      // Clear cookies by setting them to expire
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // Call Payload's logout endpoint
      const response = await fetch('/api/users/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Redirect to login page
        router.push('/login');
        router.refresh();
      } else {
        console.error('Logout failed');
        // Force redirect even if logout fails
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect on error
      router.push('/login');
    }
  };

  return (
    <Button
      onClick={handleLogout}
      variant="outline"
      className="logout-button"
      type="button"
    >
      {children || 'Logout'}
    </Button>
  );
};

export default CustomLogoutButton;