'use client'

import React from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; retry: () => void }>
  locale?: 'fr' | 'ar' | 'en'
}

const ErrorFallback: React.FC<{ error?: Error; retry: () => void; locale?: 'fr' | 'ar' | 'en' }> = ({
  error,
  retry,
  locale = 'fr'
}) => {
  const getErrorMessage = () => {
    switch (locale) {
      case 'ar':
        return {
          title: 'حدث خطأ',
          description: 'حدث خطأ غير متوقع. يرجى تحديث الصفحة أو المحاولة مرة أخرى.',
          retry: 'إعادة المحاولة',
          details: 'تفاصيل الخطأ'
        }
      case 'en':
        return {
          title: 'Something went wrong',
          description: 'An unexpected error occurred. Please refresh the page or try again.',
          retry: 'Try Again',
          details: 'Error Details'
        }
      default: // French
        return {
          title: 'Une erreur s\'est produite',
          description: 'Une erreur inattendue s\'est produite. Veuillez rafraîchir la page ou réessayer.',
          retry: 'Réessayer',
          details: 'Détails de l\'erreur'
        }
    }
  }

  const messages = getErrorMessage()

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-red-600">{messages.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-center">
            {messages.description}
          </p>

          <div className="flex flex-col gap-2">
            <Button onClick={retry} className="w-full">
              {messages.retry}
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="w-full"
            >
              {locale === 'ar' ? 'تحديث الصفحة' : locale === 'en' ? 'Refresh Page' : 'Rafraîchir la page'}
            </Button>
          </div>

          {process.env.NODE_ENV === 'development' && error && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-muted-foreground">
                {messages.details}
              </summary>
              <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service in production
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    this.setState({
      error,
      errorInfo
    })
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback, locale } = this.props

      if (Fallback) {
        return <Fallback error={this.state.error} retry={this.retry} />
      }

      return (
        <ErrorFallback
          error={this.state.error}
          retry={this.retry}
          locale={locale}
        />
      )
    }

    return this.props.children
  }
}

// Hook version for functional components
export const useErrorHandler = () => {
  return (error: Error, errorInfo?: { componentStack?: string }) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo)

    // In production, send to error monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: sendErrorToMonitoring(error, errorInfo)
    }
  }
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}

export default ErrorBoundary
