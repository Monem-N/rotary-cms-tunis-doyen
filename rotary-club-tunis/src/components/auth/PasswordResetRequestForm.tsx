'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

// Multi-language messages
const messages = {
  fr: {
    title: 'Réinitialiser le mot de passe',
    description: 'Entrez votre adresse e-mail pour recevoir un lien de réinitialisation',
    email: 'Adresse e-mail',
    emailPlaceholder: 'votre.email@exemple.com',
    submitButton: 'Envoyer le lien de réinitialisation',
    sending: 'Envoi en cours...',
    success: 'Si un compte existe avec cette adresse, un lien de réinitialisation a été envoyé.',
    backToLogin: 'Retour à la connexion',
    errors: {
      required: 'Ce champ est requis',
      invalidEmail: 'Adresse e-mail invalide',
      rateLimit: 'Trop de demandes. Réessayez plus tard.',
      networkError: 'Erreur de réseau. Veuillez réessayer.'
    }
  },
  ar: {
    title: 'إعادة تعيين كلمة المرور',
    description: 'أدخل بريدك الإلكتروني لتلقي رابط إعادة التعيين',
    email: 'البريد الإلكتروني',
    emailPlaceholder: 'بريدك@مثال.com',
    submitButton: 'إرسال رابط إعادة التعيين',
    sending: 'جاري الإرسال...',
    success: 'إذا كان هناك حساب بهذا البريد الإلكتروني، تم إرسال رابط إعادة التعيين.',
    backToLogin: 'العودة إلى تسجيل الدخول',
    errors: {
      required: 'هذا الحقل مطلوب',
      invalidEmail: 'البريد الإلكتروني غير صحيح',
      rateLimit: 'طلبات كثيرة جداً. حاول مرة أخرى لاحقاً.',
      networkError: 'خطأ في الشبكة. يرجى المحاولة مرة أخرى.'
    }
  },
  en: {
    title: 'Reset Password',
    description: 'Enter your email address to receive a reset link',
    email: 'Email address',
    emailPlaceholder: 'your.email@example.com',
    submitButton: 'Send Reset Link',
    sending: 'Sending...',
    success: 'If an account exists with this email, a reset link has been sent.',
    backToLogin: 'Back to Login',
    errors: {
      required: 'This field is required',
      invalidEmail: 'Invalid email address',
      rateLimit: 'Too many requests. Please try again later.',
      networkError: 'Network error. Please try again.'
    }
  }
};

interface PasswordResetRequestFormProps {
  locale?: 'fr' | 'ar' | 'en';
  onSuccess?: () => void;
  onBackToLogin?: () => void;
}

export default function PasswordResetRequestForm({
  locale = 'fr',
  onSuccess,
  onBackToLogin
}: PasswordResetRequestFormProps) {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const t = messages[locale];

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = t.errors.required;
    } else if (!validateEmail(email)) {
      newErrors.email = t.errors.invalidEmail;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSuccess(true);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        let errorMessage = t.errors.networkError;

        if (data.error) {
          if (data.error.includes('rate limit') || data.error.includes('trop de')) {
            errorMessage = t.errors.rateLimit;
          }
        }

        setErrors({ general: errorMessage });
      }
    } catch (error) {
      console.error('Password reset request error:', error);
      setErrors({ general: t.errors.networkError });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const handleBackToLogin = () => {
    if (onBackToLogin) {
      onBackToLogin();
    } else {
      router.push('/login');
    }
  };

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto" role="main" aria-labelledby="reset-success-title">
        <CardHeader className="text-center">
          <CardTitle id="reset-success-title" className="text-2xl font-bold text-green-600">
            {locale === 'ar' ? '✅ تم الإرسال' :
             locale === 'en' ? '✅ Sent' :
             '✅ Envoyé'}
          </CardTitle>
          <CardDescription className="text-center">
            {t.success}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            {locale === 'ar' ? 'تحقق من بريدك الإلكتروني واتبع التعليمات لإعادة تعيين كلمة المرور.' :
             locale === 'en' ? 'Check your email and follow the instructions to reset your password.' :
             'Vérifiez votre email et suivez les instructions pour réinitialiser votre mot de passe.'}
          </p>
          <Button
            onClick={handleBackToLogin}
            variant="outline"
            className="w-full"
          >
            {t.backToLogin}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto" role="main" aria-labelledby="reset-title">
      <CardHeader className="text-center">
        <CardTitle id="reset-title" className="text-2xl font-bold">{t.title}</CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          role="form"
          aria-labelledby="reset-title"
          noValidate
        >
          {errors.general && (
            <div
              className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md"
              role="alert"
              aria-live="polite"
            >
              {errors.general}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" id="email-label">{t.email}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder={t.emailPlaceholder}
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              className={errors.email ? 'border-red-500' : ''}
              disabled={isLoading}
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

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            aria-describedby="reset-status"
          >
            {isLoading ? t.sending : t.submitButton}
          </Button>

          <div id="reset-status" className="sr-only" aria-live="polite">
            {isLoading && 'Sending reset link...'}
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={handleBackToLogin}
              className="text-sm text-primary hover:text-primary/80 underline"
            >
              {t.backToLogin}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
