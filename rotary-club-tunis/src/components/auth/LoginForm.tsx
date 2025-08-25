'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

// Multi-language messages
const messages = {
  fr: {
    title: 'Connexion',
    description: 'Connectez-vous à votre compte Rotary',
    email: 'Adresse e-mail',
    password: 'Mot de passe',
    emailPlaceholder: 'votre.email@exemple.com',
    passwordPlaceholder: 'Votre mot de passe',
    loginButton: 'Se connecter',
    loggingIn: 'Connexion en cours...',
    errors: {
      required: 'Ce champ est requis',
      invalidEmail: 'Adresse e-mail invalide',
      loginFailed: 'Email ou mot de passe incorrect',
      rateLimit: 'Trop de tentatives. Réessayez plus tard.',
      accountLocked: 'Compte temporairement verrouillé',
      networkError: 'Erreur de réseau. Veuillez réessayer.'
    }
  },
  ar: {
    title: 'تسجيل الدخول',
    description: 'تسجيل الدخول إلى حسابك في روتاري',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    emailPlaceholder: 'بريدك@مثال.com',
    passwordPlaceholder: 'كلمة المرور الخاصة بك',
    loginButton: 'تسجيل الدخول',
    loggingIn: 'جاري تسجيل الدخول...',
    errors: {
      required: 'هذا الحقل مطلوب',
      invalidEmail: 'البريد الإلكتروني غير صحيح',
      loginFailed: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
      rateLimit: 'محاولات كثيرة جداً. حاول مرة أخرى لاحقاً.',
      accountLocked: 'الحساب مؤقتاً مقفل',
      networkError: 'خطأ في الشبكة. يرجى المحاولة مرة أخرى.'
    }
  },
  en: {
    title: 'Login',
    description: 'Sign in to your Rotary account',
    email: 'Email address',
    password: 'Password',
    emailPlaceholder: 'your.email@example.com',
    passwordPlaceholder: 'Your password',
    loginButton: 'Sign in',
    loggingIn: 'Signing in...',
    errors: {
      required: 'This field is required',
      invalidEmail: 'Invalid email address',
      loginFailed: 'Invalid email or password',
      rateLimit: 'Too many attempts. Please try again later.',
      accountLocked: 'Account temporarily locked',
      networkError: 'Network error. Please try again.'
    }
  }
};

interface LoginFormProps {
  locale?: 'fr' | 'ar' | 'en';
  onSuccess?: () => void;
  redirectTo?: string;
}

export default function LoginForm({
  locale = 'fr',
  onSuccess,
  redirectTo = '/admin'
}: LoginFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string>('');
  const [csrfError, setCsrfError] = useState<string>('');
  const router = useRouter();

  const t = messages[locale];

  // Fetch CSRF token on component mount
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch('/api/auth/csrf');
        if (response.ok) {
          const data = await response.json();
          setCsrfToken(data.csrfToken);
          setCsrfError('');
        } else {
          setCsrfError('Failed to load security token');
        }
      } catch (error) {
        console.error('CSRF token fetch error:', error);
        setCsrfError('Security token error');
      }
    };

    fetchCsrfToken();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = t.errors.required;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.errors.invalidEmail;
    }

    if (!formData.password.trim()) {
      newErrors.password = t.errors.required;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!csrfToken) {
      setErrors({ general: 'Security token not available. Please refresh the page.' });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          csrfToken
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Successful login
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(redirectTo);
          router.refresh();
        }
      } else {
        // Handle different error types
        let errorMessage = t.errors.loginFailed;

        if (data.error) {
          if (data.error.includes('verrouillé') || data.error.includes('locked')) {
            errorMessage = t.errors.accountLocked;
          } else if (data.error.includes('trop de tentatives') || data.error.includes('too many')) {
            errorMessage = t.errors.rateLimit;
          } else if (data.error.includes('réseau') || data.error.includes('network')) {
            errorMessage = t.errors.networkError;
          }
        }

        setErrors({ general: errorMessage });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: t.errors.networkError });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto" role="main" aria-labelledby="login-title">
      <CardHeader className="text-center">
        <CardTitle id="login-title" className="text-2xl font-bold">{t.title}</CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          role="form"
          aria-labelledby="login-title"
          noValidate
        >
          {(errors.general || csrfError) && (
            <div
              className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md"
              role="alert"
              aria-live="polite"
            >
              {errors.general || csrfError}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" id="email-label">{t.email}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder={t.emailPlaceholder}
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={errors.email ? 'border-red-500' : ''}
              disabled={isLoading || !csrfToken}
              dir={locale === 'ar' ? 'rtl' : 'ltr'}
              autoComplete="email"
              aria-describedby={errors.email ? "email-error email-label" : "email-label"}
              aria-invalid={errors.email ? 'true' : 'false'}
              required
            />
            {errors.email && (
              <div
                id="email-error"
                className="text-sm text-red-600"
                role="alert"
                aria-live="polite"
              >
                {errors.email}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" id="password-label">{t.password}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder={t.passwordPlaceholder}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={errors.password ? 'border-red-500' : ''}
              disabled={isLoading || !csrfToken}
              dir={locale === 'ar' ? 'rtl' : 'ltr'}
              autoComplete="current-password"
              aria-describedby={errors.password ? "password-error password-label" : "password-label"}
              aria-invalid={errors.password ? 'true' : 'false'}
              required
            />
            {errors.password && (
              <div
                id="password-error"
                className="text-sm text-red-600"
                role="alert"
                aria-live="polite"
              >
                {errors.password}
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !csrfToken}
            aria-describedby="login-status"
          >
            {isLoading ? t.loggingIn : t.loginButton}
          </Button>

          <div id="login-status" className="sr-only" aria-live="polite">
            {!csrfToken && 'Loading security token...'}
            {isLoading && 'Processing login...'}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}