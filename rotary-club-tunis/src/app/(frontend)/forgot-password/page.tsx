import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import PasswordResetRequestForm from '../../../components/auth/PasswordResetRequestForm';

// This would typically come from a context or middleware
async function getUserFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get('payload-token')?.value;

  if (!token) return null;

  try {
    // Verify token on server side
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Cookie': `payload-token=${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      return data.user;
    }
  } catch (error) {
    console.error('Token verification error:', error);
  }

  return null;
}

interface ForgotPasswordPageProps {
  searchParams: {
    locale?: string;
  };
}

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  // Check if user is already authenticated
  const user = await getUserFromToken();

  if (user) {
    // Redirect to admin dashboard if already logged in
    redirect('/admin');
  }

  // Determine locale from search params or default to French
  const locale = (searchParams.locale as 'fr' | 'ar' | 'en') || 'fr';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Suspense fallback={<div>Loading...</div>}>
          <PasswordResetRequestForm
            locale={locale}
            onSuccess={() => {
              // Optional: Handle success navigation or show additional message
            }}
            onBackToLogin={() => {
              // Navigate back to login
              window.location.href = `/login?locale=${locale}`;
            }}
          />
        </Suspense>
      </div>
    </div>
  );
}
