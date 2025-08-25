/**
 * Comprehensive test suite for authentication utilities
 * Tests JWT token management, password security, and session management
 */

import {
  generateToken,
  verifyToken,
  refreshToken,
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
  extractUserFromToken,
  validateSession,
  invalidateSession,
  hasRequiredRole,
  getUserDisplayName,
  isTokenCloseToExpiration,
  AuthenticationError,
  AuthorizationError,
  TokenError,
  type UserTokenData,
  type JWTPayload,
} from '../auth';

// Environment variables are set up in setup.ts

describe('Authentication Utilities', () => {
  const mockUserData: UserTokenData = {
    id: 'user-123',
    email: 'volunteer@rotary-tunis.org',
    firstName: 'Ahmed',
    lastName: 'Ben Ali',
    role: 'volunteer',
    languagePreference: 'fr',
  };

  describe('JWT Token Management', () => {
    describe('generateToken', () => {
      it('should generate a valid JWT token', () => {
        const token = generateToken(mockUserData);
        expect(typeof token).toBe('string');
        expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
      });

      it('should include all required claims in token', () => {
        const token = generateToken(mockUserData);
        const verificationResult = verifyToken(token);
        
        expect(verificationResult.valid).toBe(true);
        expect(verificationResult.payload).toMatchObject({
          id: mockUserData.id,
          email: mockUserData.email,
          firstName: mockUserData.firstName,
          lastName: mockUserData.lastName,
          role: mockUserData.role,
          languagePreference: mockUserData.languagePreference,
          iss: 'rotary-tunis-doyen-cms',
        });
      });

      it('should throw error when JWT secret is missing', () => {
        const originalSecret = process.env.PAYLOAD_SECRET;
        delete process.env.PAYLOAD_SECRET;
        delete process.env.JWT_SECRET;

        expect(() => generateToken(mockUserData)).toThrow('JWT secret not configured');

        // Restore secret
        process.env.PAYLOAD_SECRET = originalSecret;
      });

      it('should generate token with custom session ID', () => {
        const customSessionId = 'custom-session-123';
        const token = generateToken(mockUserData, customSessionId);
        const verificationResult = verifyToken(token);
        
        expect(verificationResult.valid).toBe(true);
        expect(verificationResult.payload?.sessionId).toBe(customSessionId);
      });
    });

    describe('verifyToken', () => {
      it('should verify valid token successfully', () => {
        const token = generateToken(mockUserData);
        const result = verifyToken(token);
        
        expect(result.valid).toBe(true);
        expect(result.payload).toBeDefined();
        expect(result.error).toBeUndefined();
      });

      it('should reject empty token', () => {
        const result = verifyToken('');
        
        expect(result.valid).toBe(false);
        expect(result.error).toBe('No token provided');
      });

      it('should reject malformed token', () => {
        const result = verifyToken('invalid.token.format');

        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      });

      it('should handle missing JWT secret', () => {
        const originalSecret = process.env.PAYLOAD_SECRET;
        delete process.env.PAYLOAD_SECRET;
        delete process.env.JWT_SECRET;

        const result = verifyToken('some.token.here');

        expect(result.valid).toBe(false);
        expect(result.error).toBe('JWT secret not configured');

        // Restore secret
        process.env.PAYLOAD_SECRET = originalSecret;
      });
    });

    describe('refreshToken', () => {
      it('should return null for valid token that does not need refresh', () => {
        const token = generateToken(mockUserData);
        const refreshedToken = refreshToken(token);
        
        expect(refreshedToken).toBeNull();
      });

      it('should return null for invalid token', () => {
        const refreshedToken = refreshToken('invalid.token');
        
        expect(refreshedToken).toBeNull();
      });
    });
  });

  describe('Password Security', () => {
    const testPassword = 'SecurePass123!';
    
    describe('hashPassword', () => {
      it('should hash password successfully', async () => {
        const hash = await hashPassword(testPassword);

        expect(typeof hash).toBe('string');
        expect(hash).not.toBe(testPassword);
        expect(hash.startsWith('$2b$') || hash.startsWith('$2a$')).toBe(true); // bcrypt format
        expect(hash).toMatch(/^\$2[ab]\$\d{2}\$/); // bcrypt format with any number of rounds
      });

      it('should throw error for empty password', async () => {
        await expect(hashPassword('')).rejects.toThrow('Password is required');
      });

      it('should throw error for overly long password', async () => {
        const longPassword = 'a'.repeat(200);
        await expect(hashPassword(longPassword)).rejects.toThrow('Password must be less than 128 characters');
      });
    });

    describe('verifyPassword', () => {
      it('should verify correct password', async () => {
        const hash = await hashPassword(testPassword);
        const isValid = await verifyPassword(testPassword, hash);
        
        expect(isValid).toBe(true);
      });

      it('should reject incorrect password', async () => {
        const hash = await hashPassword(testPassword);
        const isValid = await verifyPassword('WrongPassword123!', hash);
        
        expect(isValid).toBe(false);
      });

      it('should return false for empty inputs', async () => {
        const isValid1 = await verifyPassword('', 'hash');
        const isValid2 = await verifyPassword('password', '');
        
        expect(isValid1).toBe(false);
        expect(isValid2).toBe(false);
      });
    });

    describe('validatePasswordStrength', () => {
      it('should validate strong password', () => {
        const result = validatePasswordStrength('StrongPass123!');
        
        expect(result.valid).toBe(true);
        expect(result.score).toBeGreaterThanOrEqual(4);
        expect(result.feedback).toHaveLength(0);
        expect(result.requirements.minLength).toBe(true);
        expect(result.requirements.hasUppercase).toBe(true);
        expect(result.requirements.hasLowercase).toBe(true);
        expect(result.requirements.hasNumbers).toBe(true);
        expect(result.requirements.hasSpecialChars).toBe(true);
      });

      it('should reject weak password', () => {
        const result = validatePasswordStrength('weak');
        
        expect(result.valid).toBe(false);
        expect(result.score).toBeLessThan(4);
        expect(result.feedback.length).toBeGreaterThan(0);
      });

      it('should provide French feedback messages', () => {
        const result = validatePasswordStrength('weak');
        
        expect(result.feedback.some(msg => msg.includes('caractères'))).toBe(true);
      });

      it('should detect common patterns', () => {
        const result = validatePasswordStrength('Password123!');
        
        expect(result.feedback.some(msg => msg.includes('communes'))).toBe(true);
      });
    });
  });

  describe('Session Management', () => {
    describe('extractUserFromToken', () => {
      it('should extract user data from valid token', () => {
        const token = generateToken(mockUserData);
        const userData = extractUserFromToken(token);
        
        expect(userData).not.toBeNull();
        expect(userData?.id).toBe(mockUserData.id);
        expect(userData?.email).toBe(mockUserData.email);
        expect(userData?.role).toBe(mockUserData.role);
      });

      it('should return null for invalid token', () => {
        const userData = extractUserFromToken('invalid.token');
        
        expect(userData).toBeNull();
      });
    });

    describe('validateSession', () => {
      it('should validate active session', () => {
        const token = generateToken(mockUserData);
        const result = validateSession(token);
        
        expect(result.valid).toBe(true);
        expect(result.user).toBeDefined();
        expect(result.error).toBeUndefined();
      });

      it('should reject empty token', () => {
        const result = validateSession('');
        
        expect(result.valid).toBe(false);
        expect(result.error).toBe('No token provided');
      });
    });

    describe('invalidateSession', () => {
      it('should invalidate valid session', () => {
        const token = generateToken(mockUserData);
        const result = invalidateSession(token);
        
        expect(result.success).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should handle invalid token', () => {
        const result = invalidateSession('invalid.token');
        
        expect(result.success).toBe(false);
        expect(result.error).toBe('Invalid token');
      });
    });
  });

  describe('Utility Functions', () => {
    describe('hasRequiredRole', () => {
      it('should allow admin access to all roles', () => {
        expect(hasRequiredRole('admin', 'admin')).toBe(true);
        expect(hasRequiredRole('admin', 'editor')).toBe(true);
        expect(hasRequiredRole('admin', 'volunteer')).toBe(true);
      });

      it('should allow editor access to editor and volunteer', () => {
        expect(hasRequiredRole('editor', 'admin')).toBe(false);
        expect(hasRequiredRole('editor', 'editor')).toBe(true);
        expect(hasRequiredRole('editor', 'volunteer')).toBe(true);
      });

      it('should allow volunteer access only to volunteer', () => {
        expect(hasRequiredRole('volunteer', 'admin')).toBe(false);
        expect(hasRequiredRole('volunteer', 'editor')).toBe(false);
        expect(hasRequiredRole('volunteer', 'volunteer')).toBe(true);
      });
    });

    describe('getUserDisplayName', () => {
      it('should return full name when available', () => {
        const payload = { firstName: 'Ahmed', lastName: 'Ben Ali', email: 'test@example.com' } as JWTPayload;
        expect(getUserDisplayName(payload)).toBe('Ahmed Ben Ali');
      });

      it('should return first name only when last name missing', () => {
        const payload = { firstName: 'Ahmed', email: 'test@example.com' } as JWTPayload;
        expect(getUserDisplayName(payload)).toBe('Ahmed');
      });

      it('should return email when names missing', () => {
        const payload = { email: 'test@example.com' } as JWTPayload;
        expect(getUserDisplayName(payload)).toBe('test@example.com');
      });
    });

    describe('isTokenCloseToExpiration', () => {
      it('should return false for fresh token', () => {
        const token = generateToken(mockUserData);
        expect(isTokenCloseToExpiration(token)).toBe(false);
      });

      it('should return true for invalid token', () => {
        expect(isTokenCloseToExpiration('invalid.token')).toBe(true);
      });
    });
  });

  describe('Error Classes', () => {
    it('should create AuthenticationError correctly', () => {
      const error = new AuthenticationError('Test auth error', 'AUTH_001');
      expect(error.name).toBe('AuthenticationError');
      expect(error.message).toBe('Test auth error');
      expect(error.code).toBe('AUTH_001');
    });

    it('should create AuthorizationError correctly', () => {
      const error = new AuthorizationError('Test authz error', 'admin');
      expect(error.name).toBe('AuthorizationError');
      expect(error.message).toBe('Test authz error');
      expect(error.requiredRole).toBe('admin');
    });

    it('should create TokenError correctly', () => {
      const error = new TokenError('Test token error', true);
      expect(error.name).toBe('TokenError');
      expect(error.message).toBe('Test token error');
      expect(error.expired).toBe(true);
    });
  });
});
