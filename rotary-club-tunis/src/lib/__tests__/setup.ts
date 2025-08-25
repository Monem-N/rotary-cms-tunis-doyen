/**
 * Test setup file for authentication utilities
 * Sets up environment variables and test configuration
 */

// Set up environment variables for testing
process.env.PAYLOAD_SECRET = 'test-secret-key-for-jwt-authentication-rotary-tunis-doyen-cms-system-very-long-and-secure';
process.env.JWT_SECRET = 'test-secret-key-for-jwt-authentication-rotary-tunis-doyen-cms-system-very-long-and-secure';

// Set bcrypt salt rounds to lower value for faster tests (production uses 12)
process.env.BCRYPT_ROUNDS = '4';

// Increase timeout for async operations
jest.setTimeout(30000);

// Mock console methods to reduce noise during tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  // Suppress console warnings and errors during tests unless they're test-related
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].includes('Test')) {
      originalConsoleError(...args);
    }
  };

  console.warn = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].includes('Test')) {
      originalConsoleWarn(...args);
    }
  };
});

afterAll(() => {
  // Restore original console methods
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});
