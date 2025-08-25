# Authentication Utilities

This module provides comprehensive authentication utilities for the Rotary Club Tunis Doyen CMS, optimized for Tunisia's network conditions and volunteer management requirements.

## 🔐 Features

- **JWT Token Management**: Secure token generation, verification, and refresh
- **Password Security**: bcrypt hashing with 12+ salt rounds
- **Session Management**: User session validation and cleanup
- **Tunisia Network Optimization**: 7-day token expiration for network conditions
- **Multilingual Support**: French language feedback for volunteers
- **Role-Based Access Control**: Admin, Editor, and Volunteer roles
- **Comprehensive Error Handling**: Custom error classes and detailed feedback

## 📦 Installation

The required dependencies are already installed:
- `jsonwebtoken` - JWT token handling
- `bcryptjs` - Password hashing
- `@types/jsonwebtoken` - TypeScript types
- `@types/bcryptjs` - TypeScript types

## 🚀 Usage

### JWT Token Management

```typescript
import { generateToken, verifyToken, refreshToken } from '@/lib/auth';

// Generate a new JWT token
const userData = {
  id: 'user-123',
  email: 'volunteer@rotary-tunis.org',
  firstName: 'Ahmed',
  lastName: 'Ben Ali',
  role: 'volunteer',
  languagePreference: 'fr'
};

const token = generateToken(userData);

// Verify a token
const verificationResult = verifyToken(token);
if (verificationResult.valid) {
  console.log('User:', verificationResult.payload);
} else {
  console.error('Token error:', verificationResult.error);
}

// Refresh a token (if needed)
const newToken = refreshToken(token);
if (newToken) {
  console.log('Token refreshed successfully');
}
```

### Password Security

```typescript
import { hashPassword, verifyPassword, validatePasswordStrength } from '@/lib/auth';

// Hash a password
const hashedPassword = await hashPassword('SecurePassword123!');

// Verify a password
const isValid = await verifyPassword('SecurePassword123!', hashedPassword);

// Validate password strength
const validation = validatePasswordStrength('WeakPass');
if (!validation.valid) {
  console.log('Password issues:', validation.feedback);
}
```

### Session Management

```typescript
import { validateSession, extractUserFromToken, invalidateSession } from '@/lib/auth';

// Validate a session
const sessionResult = validateSession(token);
if (sessionResult.valid) {
  console.log('Session active for:', sessionResult.user?.email);
  
  if (sessionResult.needsRefresh) {
    // Token needs refresh
    const newToken = refreshToken(token);
  }
}

// Extract user data from token
const userData = extractUserFromToken(token);

// Invalidate a session (logout)
const logoutResult = invalidateSession(token);
```

### Utility Functions

```typescript
import { hasRequiredRole, getUserDisplayName, isTokenCloseToExpiration } from '@/lib/auth';

// Check role permissions
const canAccess = hasRequiredRole('volunteer', 'editor'); // false
const canAccessAdmin = hasRequiredRole('admin', 'volunteer'); // true

// Get display name
const displayName = getUserDisplayName(userPayload);

// Check token expiration
const needsRefresh = isTokenCloseToExpiration(token, 60); // 60 minutes threshold
```

## 🔧 Configuration

### Environment Variables

Set the following environment variables:

```bash
# JWT Secret (required)
PAYLOAD_SECRET=your-very-long-and-secure-secret-key-here
# or
JWT_SECRET=your-very-long-and-secure-secret-key-here
```

### Token Configuration

The JWT tokens are configured for Tunisia's network conditions:

- **Expiration**: 7 days (optimized for network reliability)
- **Issuer**: `rotary-tunis-doyen-cms`
- **Audience**: `rotary-tunis-doyen.vercel.app`, `localhost:3000`
- **Algorithm**: HS256
- **Refresh Threshold**: 24 hours before expiration

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character
- Maximum 128 characters

## 🧪 Testing

Run the comprehensive test suite:

```bash
npm test
```

The test suite includes:
- 37 test cases
- JWT token generation and verification
- Password hashing and validation
- Session management
- Error handling
- Utility functions

## 🔒 Security Features

### JWT Security
- Secure token generation with proper claims
- Token expiration and refresh mechanism
- Protection against common JWT vulnerabilities

### Password Security
- bcrypt hashing with 12 salt rounds
- Password strength validation
- Protection against common passwords

### Session Security
- Session validation and cleanup
- Role-based access control
- Secure error handling

## 🌍 Tunisia-Specific Optimizations

- **7-day token expiration**: Accommodates network connectivity issues
- **French language feedback**: User-friendly error messages for volunteers
- **Network-optimized refresh**: Automatic token refresh before expiration

## 📝 Error Handling

The module provides custom error classes:

```typescript
import { AuthenticationError, AuthorizationError, TokenError } from '@/lib/auth';

try {
  const token = generateToken(userData);
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Authentication failed:', error.message);
  }
}
```

## 🔄 Integration with Payload CMS

This module integrates seamlessly with Payload CMS:

- Compatible with Payload's user collection
- Supports Payload's authentication flow
- Works with existing middleware

## 📚 API Reference

### Types

- `JWTPayload`: JWT token payload structure
- `UserTokenData`: User data for token generation
- `TokenVerificationResult`: Token verification response
- `SessionValidationResult`: Session validation response
- `PasswordValidationResult`: Password strength validation response

### Functions

- `generateToken(userData, sessionId?)`: Generate JWT token
- `verifyToken(token)`: Verify JWT token
- `refreshToken(token)`: Refresh JWT token
- `hashPassword(password)`: Hash password with bcrypt
- `verifyPassword(password, hash)`: Verify password against hash
- `validatePasswordStrength(password)`: Validate password strength
- `extractUserFromToken(token)`: Extract user data from token
- `validateSession(token)`: Validate user session
- `invalidateSession(token)`: Invalidate user session
- `hasRequiredRole(userRole, requiredRole)`: Check role permissions
- `getUserDisplayName(payload)`: Get user display name
- `isTokenCloseToExpiration(token, threshold?)`: Check token expiration

## 🤝 Contributing

When contributing to this module:

1. Maintain 100% test coverage
2. Follow TypeScript best practices
3. Update documentation for new features
4. Consider Tunisia-specific requirements
5. Test with French language feedback

## 📄 License

This module is part of the Rotary Club Tunis Doyen CMS project.
