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
    title: 'Nouveau mot de passe',
    description: 'Entrez votre nouveau mot de passe',
    newPassword: 'Nouveau mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    newPasswordPlaceholder: 'Votre nouveau mot de passe',
    confirmPasswordPlaceholder: 'Confirmer votre mot de passe',
    submitButton: 'Réinitialiser le mot de passe',
    resetting: 'Réinitialisation en cours...',
    success: 'Mot de passe réinitialisé avec succès !',
    backToLogin: 'Retour à la connexion',
    passwordRequirements: 'Le mot de passe doit contenir au moins 8 caractères avec lettres majuscules, minuscules, chiffres et caractères spéciaux.',
    errors: {
      required: 'Ce champ est requis',
      passwordMismatch: 'Les mots de passe ne correspondent pas',
      passwordWeak: 'Le mot de passe ne respecte pas les exigences de sécurité',
      invalidToken: 'Lien de réinitialisation invalide ou expiré',
      networkError: 'Erreur de réseau. Veuillez réessayer.'
    }
  },
  ar: {
    title: 'كلمة مرور جديدة',
    description: 'أدخل كلمة مرورك الجديدة',
    newPassword: 'كلمة المرور الجديدة',
    confirmPassword: 'تأكيد كلمة المرور',
    newPasswordPlaceholder: 'كلمة مرورك الجديدة',
    confirmPasswordPlaceholder: 'تأكيد كلمة مرورك',
    submitButton: 'إعادة تعيين كلمة المرور',
    resetting: 'جاري إعادة التعيين...',
    success: 'تم إعادة تعيين كلمة المرور بنجاح!',
    backToLogin: 'العودة إلى تسجيل الدخول',
    passwordRequirements: 'يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل مع حروف كبيرة وصغيرة وأرقام ورموز خاصة.',
    errors: {
      required: 'هذا الحقل مطلوب',
      passwordMismatch: 'كلمات المرور غير متطابقة',
      passwordWeak: 'كلمة المرور لا تستوفي متطلبات الأمان',
      invalidToken: 'رابط إعادة التعيين غير صحيح أو منتهي الصلاحية',
      networkError: 'خطأ في الشبكة. يرجى المحاولة مرة أخرى.'
    }
  },
  en: {
    title: 'New Password',
    description: 'Enter your new password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password',
    newPasswordPlaceholder: 'Your new password',
    confirmPasswordPlaceholder: 'Confirm your password',
    submitButton: 'Reset Password',
    resetting: 'Resetting...',
    success: 'Password reset successfully!',
    backToLogin: 'Back to Login',
    passwordRequirements: 'Password must contain at least 8 characters with uppercase, lowercase, numbers, and special characters.',
    errors: {
      required: 'This field is required',
      passwordMismatch: 'Passwords do not match',
      passwordWeak: 'Password does not meet security requirements',
      invalidToken: 'Reset link is invalid or expired',
      networkError: 'Network error. Please try again.'
    }
  }
};

interface PasswordResetConfirmFormProps {
  locale?: 'fr' | 'ar' | 'en';
  email: string;
  token: string;
  onSuccess?: () => void;
  onBackToLogin?: () => void;
}

export default function PasswordResetConfirmForm({
  locale = 'fr',
  email,
  token,
  onSuccess,
  onBackToLogin
}: PasswordResetConfirmFormProps) {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const router = useRouter();

  const t = messages[locale];

  const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('At least 8 characters required');
    }

    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Lowercase letter required');
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Uppercase letter required');
    }

    if (!/(?=.*\d)/.test(password)) {
      errors.push('Number required');
    }

    if (!/(?=.*[!@#$%^&*])/.test(password)) {
      errors.push('Special character required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = t.errors.required;
    } else {
      const passwordValidation = validatePassword(formData.newPassword);
      if (!passwordValidation.valid) {
        newErrors.newPassword = t.errors.passwordWeak;
        setShowPasswordRequirements(true);
      }
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = t.errors.required;
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = t.errors.passwordMismatch;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/password-reset/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          token,
          newPassword: formData.newPassword
        }),
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
          if (data.error.includes('invalid') || data.error.includes('expired')) {
            errorMessage = t.errors.invalidToken;
          } else if (data.error.includes('password') && data.error.includes('security')) {
            errorMessage = t.errors.passwordWeak;
            setShowPasswordRequirements(true);
          }
        }

        setErrors({ general: errorMessage });
      }
    } catch (error) {
      console.error('Password reset confirmation error:', error);
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

    // Hide password requirements when user starts typing a new password
    if (field === 'newPassword' && showPasswordRequirements) {
      setShowPasswordRequirements(false);
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
            {locale === 'ar' ? '✅ تم بنجاح' :
             locale === 'en' ? '✅ Success' :
             '✅ Réussi'}
          </CardTitle>
          <CardDescription className="text-center">
            {t.success}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            {locale === 'ar' ? 'يمكنك الآن تسجيل الدخول باستخدام كلمة مرورك الجديدة.' :
             locale === 'en' ? 'You can now log in with your new password.' :
             'Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.'}
          </p>
          <Button
            onClick={handleBackToLogin}
            className="w-full btn-primary"
          >
            {t.backToLogin}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto" role="main" aria-labelledby="reset-confirm-title">
      <CardHeader className="text-center">
        <CardTitle id="reset-confirm-title" className="text-2xl font-bold">{t.title}</CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          role="form"
          aria-labelledby="reset-confirm-title"
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

          {showPasswordRequirements && (
            <div
              className="p-3 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-md"
              role="alert"
              aria-live="polite"
            >
              {t.passwordRequirements}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="newPassword" id="newPassword-label">{t.newPassword}</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              placeholder={t.newPasswordPlaceholder}
              value={formData.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              className={errors.newPassword ? 'border-red-500' : ''}
              disabled={isLoading}
              dir={locale === 'ar' ? 'rtl' : 'ltr'}
              autoComplete="new-password"
              aria-describedby={errors.newPassword ? "newPassword-error newPassword-label" : "newPassword-label"}
              aria-invalid={errors.newPassword ? 'true' : 'false'}
              required
            />
            {errors.newPassword && (
              <div
                id="newPassword-error"
                className="text-sm text-red-600"
                role="alert"
                aria-live="polite"
              >
                {errors.newPassword}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" id="confirmPassword-label">{t.confirmPassword}</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder={t.confirmPasswordPlaceholder}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className={errors.confirmPassword ? 'border-red-500' : ''}
              disabled={isLoading}
              dir={locale === 'ar' ? 'rtl' : 'ltr'}
              autoComplete="new-password"
              aria-describedby={errors.confirmPassword ? "confirmPassword-error confirmPassword-label" : "confirmPassword-label"}
              aria-invalid={errors.confirmPassword ? 'true' : 'false'}
              required
            />
            {errors.confirmPassword && (
              <div
                id="confirmPassword-error"
                className="text-sm text-red-600"
                role="alert"
                aria-live="polite"
              >
                {errors.confirmPassword}
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            aria-describedby="reset-confirm-status"
          >
            {isLoading ? t.resetting : t.submitButton}
          </Button>

          <div id="reset-confirm-status" className="sr-only" aria-live="polite">
            {isLoading && 'Resetting password...'}
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
