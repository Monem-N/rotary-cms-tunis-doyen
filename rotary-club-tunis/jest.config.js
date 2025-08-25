/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.test.+(ts|tsx|js)',
    '**/*.(test|spec).+(ts|tsx|js)'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/node_modules/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/src/lib/__tests__/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testTimeout: 10000,

  // Performance optimizations
  maxWorkers: '50%', // Use 50% of available cores for parallel execution
  cache: true, // Enable Jest cache for faster subsequent runs
  clearMocks: true, // Clear mocks between tests for better isolation
  resetMocks: true, // Reset mocks between tests
  restoreMocks: true, // Restore mocks to original implementations

  // Optimize for CI/CD environments
  detectOpenHandles: true, // Detect handles that prevent Jest from exiting
  forceExit: false, // Don't force exit to allow proper cleanup

  // Performance settings for large test suites
  testSequencer: '@jest/test-sequencer', // Use default sequencer for optimal performance
  haste: {
    computeSha1: false, // Disable SHA1 computation for better performance
  },

  // Coverage optimization
  coverageProvider: 'v8', // Use V8 coverage provider for better performance
  collectCoverage: false, // Only collect coverage when explicitly requested
};

module.exports = config;
