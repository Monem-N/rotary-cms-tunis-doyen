import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * JWT Payload structure for Rotary CMS authentication
 * Optimized for Tunisia network conditions and volunteer management
 */
export interface JWTPayload {
  /** User unique identifier */
  id: string;
  /** User email address */
  email: string;
  /** User's first name */
  firstName?: string;
  /** User's last name */
  lastName?: string;
  /** User role for RBAC */
  role: 'admin' | 'editor' | 'volunteer';
  /** User's preferred language */
  languagePreference: 'fr' | 'ar' | 'en';
  /** Token issued at timestamp */
  iat: number;
  /** Token expiration timestamp */
  exp: number;
  /** Token issuer */
  iss: string;
  /** Token audience */
  aud: string[];
  /** Session identifier for tracking */
  sessionId?: string;
}

/**
 * User data structure for token generation
 */
export interface UserTokenData {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'editor' | 'volunteer';
  languagePreference: 'fr' | 'ar' | 'en';
}

/**
 * Token verification result
 */
export interface TokenVerificationResult {
  valid: boolean;
  payload?: JWTPayload;
  error?: string;
  expired?: boolean;
}

/**
 * Session validation result
 */
export interface SessionValidationResult {
  valid: boolean;
  user?: JWTPayload;
  error?: string;
  needsRefresh?: boolean;
}

/**
 * Password validation result
 */
export interface PasswordValidationResult {
  valid: boolean;
  score: number; // 0-4 strength score
  feedback: string[];
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumbers: boolean;
    hasSpecialChars: boolean;
  };
}

// ============================================================================
// CONFIGURATION CONSTANTS
// ============================================================================

/**
 * JWT Configuration optimized for Tunisia network conditions
 */
const JWT_CONFIG = {
  get secret() {
    return process.env.PAYLOAD_SECRET || process.env.JWT_SECRET || '';
  },
  expiresIn: '7d', // 7 days for Tunisia's network conditions
  issuer: 'rotary-tunis-doyen-cms',
  audience: ['rotary-tunis-doyen.vercel.app', 'localhost:3000'],
  algorithm: 'HS256' as const,
  // Refresh threshold - refresh token when less than 1 day remaining
  refreshThreshold: 24 * 60 * 60 * 1000, // 1 day in milliseconds
};

/**
 * Password security configuration
 */
const getValidSaltRounds = (): number => {
  const raw = process.env.BCRYPT_ROUNDS;
  const parsed = raw ? parseInt(raw, 10) : 12;
  if (isNaN(parsed) || parsed < 10 || parsed > 15) {
    return 12; // Default value
  }
  return parsed;
};

const PASSWORD_CONFIG = {
  saltRounds: getValidSaltRounds(), // Validated salt rounds
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?',
};

// ============================================================================
// JWT TOKEN MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Generate JWT token with Rotary-specific claims and Tunisia network optimization
 * @param userData - User data to encode in token
 * @param sessionId - Optional session identifier
 * @returns JWT token string
 */
export const generateToken = (userData: UserTokenData, sessionId?: string): string => {
  if (!JWT_CONFIG.secret) {
    throw new Error('JWT secret not configured. Please set PAYLOAD_SECRET or JWT_SECRET environment variable.');
  }

  const now = Math.floor(Date.now() / 1000);
  const expirationTime = now + (7 * 24 * 60 * 60); // 7 days in seconds

  const payload: JWTPayload = {
    id: userData.id,
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    role: userData.role,
    languagePreference: userData.languagePreference,
    iat: now,
    exp: expirationTime,
    iss: JWT_CONFIG.issuer,
    aud: JWT_CONFIG.audience,
    sessionId: sessionId || `session_${userData.id}_${now}`,
  };

  try {
    return jwt.sign(payload, JWT_CONFIG.secret, {
      algorithm: JWT_CONFIG.algorithm,
    });
  } catch (error) {
    throw new Error(`Token generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Verify JWT token with comprehensive error handling
 * @param token - JWT token to verify
 * @returns Token verification result
 */
export const verifyToken = (token: string): TokenVerificationResult => {
  if (!token) {
    return {
      valid: false,
      error: 'No token provided',
    };
  }

  if (!JWT_CONFIG.secret) {
    return {
      valid: false,
      error: 'JWT secret not configured',
    };
  }

  try {
    const decoded = jwt.verify(token, JWT_CONFIG.secret, {
      algorithms: [JWT_CONFIG.algorithm],
    }) as JWTPayload;

    return {
      valid: true,
      payload: decoded,
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return {
        valid: false,
        error: 'Token expired',
        expired: true,
      };
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return {
        valid: false,
        error: `Invalid token: ${error.message}`,
      };
    }

    return {
      valid: false,
      error: `Token verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
};

/**
 * Refresh JWT token for extended volunteer sessions
 * @param token - Current JWT token
 * @returns New JWT token or null if refresh not needed/possible
 */
export const refreshToken = (token: string): string | null => {
  const verificationResult = verifyToken(token);

  if (!verificationResult.valid || !verificationResult.payload) {
    return null;
  }

  const payload = verificationResult.payload;
  const now = Date.now();
  const tokenExpiration = payload.exp * 1000; // Convert to milliseconds
  const timeUntilExpiration = tokenExpiration - now;

  // Only refresh if token expires within the refresh threshold
  if (timeUntilExpiration > JWT_CONFIG.refreshThreshold) {
    return null; // Token doesn't need refresh yet
  }

  // Generate new token with same user data
  const userData: UserTokenData = {
    id: payload.id,
    email: payload.email,
    firstName: payload.firstName,
    lastName: payload.lastName,
    role: payload.role,
    languagePreference: payload.languagePreference,
  };

  try {
    return generateToken(userData, payload.sessionId);
  } catch (error) {
    console.error('Token refresh failed:', error);
    return null;
  }
};

// ============================================================================
// PASSWORD SECURITY FUNCTIONS
// ============================================================================

/**
 * Hash password using bcrypt with high security salt rounds
 * @param password - Plain text password to hash
 * @returns Promise resolving to hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  if (!password) {
    throw new Error('Password is required');
  }

  if (password.length > PASSWORD_CONFIG.maxLength) {
    throw new Error(`Password must be less than ${PASSWORD_CONFIG.maxLength} characters`);
  }

  try {
    return await bcrypt.hash(password, PASSWORD_CONFIG.saltRounds);
  } catch (error) {
    throw new Error(`Password hashing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Verify password against hash
 * @param password - Plain text password to verify
 * @param hash - Hashed password to compare against
 * @returns Promise resolving to boolean indicating match
 */
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  if (!password || !hash) {
    return false;
  }

  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error('Password verification failed:', error);
    return false;
  }
};

/**
 * Validate password strength for volunteer accounts
 * @param password - Password to validate
 * @returns Password validation result with score and feedback
 */
export const validatePasswordStrength = (password: string): PasswordValidationResult => {
  const feedback: string[] = [];
  let score = 0;

  // Check requirements
  const requirements = {
    minLength: password.length >= PASSWORD_CONFIG.minLength,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSpecialChars: new RegExp(`[${PASSWORD_CONFIG.specialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`).test(password),
  };

  // Evaluate each requirement
  if (!requirements.minLength) {
    feedback.push(`Le mot de passe doit contenir au moins ${PASSWORD_CONFIG.minLength} caractères`);
  } else {
    score += 1;
  }

  if (!requirements.hasUppercase) {
    feedback.push('Le mot de passe doit contenir au moins une lettre majuscule');
  } else {
    score += 1;
  }

  if (!requirements.hasLowercase) {
    feedback.push('Le mot de passe doit contenir au moins une lettre minuscule');
  } else {
    score += 1;
  }

  if (!requirements.hasNumbers) {
    feedback.push('Le mot de passe doit contenir au moins un chiffre');
  } else {
    score += 1;
  }

  if (!requirements.hasSpecialChars) {
    feedback.push('Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*...)');
  } else {
    score += 1;
  }

  // Additional strength checks
  if (password.length >= 12) {
    score += 0.5; // Bonus for longer passwords
  }

  if (password.length >= 16) {
    score += 0.5; // Additional bonus for very long passwords
  }

  // Check for common patterns (reduce score)
  const commonPatterns = [
    /123456/,
    /password/i,
    /rotary/i,
    /tunisia/i,
    /tunis/i,
    /admin/i,
  ];

  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      score -= 1;
      feedback.push('Évitez les mots ou séquences communes dans votre mot de passe');
      break;
    }
  }

  // Ensure score is within bounds
  score = Math.max(0, Math.min(4, score));

  const valid = Object.values(requirements).every(req => req) && score >= 4;

  return {
    valid,
    score: Math.floor(score),
    feedback,
    requirements,
  };
};

// ============================================================================
// SESSION MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Extract user data from JWT token payload
 * @param token - JWT token to extract user data from
 * @returns User data or null if extraction fails
 */
export const extractUserFromToken = (token: string): JWTPayload | null => {
  const verificationResult = verifyToken(token);

  if (!verificationResult.valid || !verificationResult.payload) {
    return null;
  }

  return verificationResult.payload;
};

/**
 * Validate session and check if token needs refresh
 * @param token - JWT token to validate
 * @returns Session validation result
 */
export const validateSession = (token: string): SessionValidationResult => {
  if (!token) {
    return {
      valid: false,
      error: 'No token provided',
    };
  }

  const verificationResult = verifyToken(token);

  if (!verificationResult.valid) {
    return {
      valid: false,
      error: verificationResult.error,
    };
  }

  const payload = verificationResult.payload!;
  const now = Date.now();
  const tokenExpiration = payload.exp * 1000; // Convert to milliseconds
  const timeUntilExpiration = tokenExpiration - now;

  // Check if token needs refresh
  const needsRefresh = timeUntilExpiration <= JWT_CONFIG.refreshThreshold;

  return {
    valid: true,
    user: payload,
    needsRefresh,
  };
};

/**
 * Invalidate session (for logout and cleanup)
 * Note: Since we're using stateless JWT tokens, this function primarily
 * serves as a placeholder for future session store implementation
 * @param token - JWT token to invalidate
 * @returns Success status
 */
export const invalidateSession = (token: string): { success: boolean; error?: string } => {
  if (!token) {
    return {
      success: false,
      error: 'No token provided',
    };
  }

  const verificationResult = verifyToken(token);

  if (!verificationResult.valid) {
    return {
      success: false,
      error: 'Invalid token',
    };
  }

  // For stateless JWT tokens, we can't truly invalidate them server-side
  // without maintaining a blacklist. For now, we'll return success
  // and rely on client-side token removal.
  // TODO: Implement token blacklist or session store for true invalidation

  return {
    success: true,
  };
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if user has required role for access control
 * @param userRole - User's current role
 * @param requiredRole - Required role for access
 * @returns Boolean indicating if user has sufficient permissions
 */
export const hasRequiredRole = (
  userRole: 'admin' | 'editor' | 'volunteer',
  requiredRole: 'admin' | 'editor' | 'volunteer'
): boolean => {
  const roleHierarchy = {
    admin: 3,
    editor: 2,
    volunteer: 1,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

/**
 * Get user display name from token payload
 * @param payload - JWT payload containing user data
 * @returns Formatted display name
 */
export const getUserDisplayName = (payload: JWTPayload): string => {
  if (payload.firstName && payload.lastName) {
    return `${payload.firstName} ${payload.lastName}`;
  }

  if (payload.firstName) {
    return payload.firstName;
  }

  if (payload.lastName) {
    return payload.lastName;
  }

  return payload.email;
};

/**
 * Check if token is close to expiration
 * @param token - JWT token to check
 * @param thresholdMinutes - Minutes before expiration to consider "close" (default: 60)
 * @returns Boolean indicating if token is close to expiration
 */
export const isTokenCloseToExpiration = (token: string, thresholdMinutes: number = 60): boolean => {
  const verificationResult = verifyToken(token);

  if (!verificationResult.valid || !verificationResult.payload) {
    return true; // Consider invalid tokens as expired
  }

  const payload = verificationResult.payload;
  const now = Date.now();
  const tokenExpiration = payload.exp * 1000; // Convert to milliseconds
  const threshold = thresholdMinutes * 60 * 1000; // Convert to milliseconds

  return (tokenExpiration - now) <= threshold;
};

// ============================================================================
// ERROR CLASSES
// ============================================================================

/**
 * Custom error class for authentication-related errors
 */
export class AuthenticationError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

/**
 * Custom error class for authorization-related errors
 */
export class AuthorizationError extends Error {
  constructor(message: string, public requiredRole?: string) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

/**
 * Custom error class for token-related errors
 */
export class TokenError extends Error {
  constructor(message: string, public expired?: boolean) {
    super(message);
    this.name = 'TokenError';
  }
}
