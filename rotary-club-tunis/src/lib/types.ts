/**
 * Type Definitions for Rotary CMS
 * Enhanced type safety for authentication and security
 */

// Extended User interface for Payload CMS
export interface ExtendedUser {
  id: string;
  email: string;
  role?: 'admin' | 'editor' | 'volunteer';
  firstName?: string;
  lastName?: string;
  languagePreference?: 'fr' | 'ar' | 'en';
  loginAttempts?: number;
  lockUntil?: string;
  lastLogin?: string;
  password?: string; // For authentication operations
  createdAt?: string;
  updatedAt?: string;
}

// Authentication request/response types
export interface LoginRequest {
  email: string;
  password: string;
  csrfToken: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    email: string;
    role: string;
    firstName?: string;
    lastName?: string;
    languagePreference?: string;
  };
}

export interface AuthError {
  error: string;
  retryAfter?: number;
}

// CSRF token types
export interface CsrfTokenResponse {
  csrfToken: string;
  sessionId: string;
}

export interface CsrfValidationRequest {
  csrfToken: string;
}

export interface CsrfValidationResponse {
  valid: boolean;
}

// Rate limiting types
export interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remainingTime?: number;
  backoff?: number;
}

// Performance monitoring types
export interface MemoryUsage {
  rss: number;
  heapTotal: number;
  heapUsed: number;
  external: number;
}

export interface PerformanceMetrics {
  avg: number;
  min: number;
  max: number;
  count: number;
}

export interface HealthCheckResult {
  status: 'healthy' | 'warning' | 'critical';
  checks: Record<string, unknown>;
  performance?: {
    responseTime: number;
    memoryUsage: number;
    errorRate: number;
  };
}

// Security event types
export interface SecurityEvent {
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  event: string;
  details: Record<string, unknown>;
  ip: string;
  userAgent?: string;
}

// API response types
export interface ApiResponse<T = unknown> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form validation types
export interface FormErrors {
  [key: string]: string;
}

export interface FormData {
  email: string;
  password: string;
}

// Multi-language support types
export type SupportedLocale = 'fr' | 'ar' | 'en';

export interface LocaleMessages {
  title: string;
  description: string;
  email: string;
  password: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  loginButton: string;
  loggingIn: string;
  errors: {
    required: string;
    invalidEmail: string;
    loginFailed: string;
    rateLimit: string;
    accountLocked: string;
    networkError: string;
  };
}

// Component prop types
export interface LoginFormProps {
  locale?: SupportedLocale;
  onSuccess?: () => void;
  redirectTo?: string;
}

export interface LogoutButtonProps {
  locale?: SupportedLocale;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Database operation types
export interface DatabaseQueryOptions {
  select?: Record<string, boolean>;
  where?: Record<string, unknown>;
  limit?: number;
  sort?: string;
}

export interface DatabaseResult<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}