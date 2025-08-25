/**
 * Utility functions for retrying operations with exponential backoff
 */

export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryCondition?: (error: Error, attempt: number) => boolean;
}

export const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  baseDelay: 100, // 100ms
  maxDelay: 5000, // 5 seconds
  backoffFactor: 2,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  retryCondition: (_error: Error, _attempt: number) => true, // Retry on any error by default
};

/**
 * Retry a function with exponential backoff
 * @param fn - Function to retry
 * @param options - Retry configuration options
 * @returns Promise resolving to the function result
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };

  // Handle edge case: if maxAttempts is 0 or negative, don't retry
  if (config.maxAttempts <= 0) {
    try {
      return await fn();
    } catch (error) {
      // Re-throw the original error without wrapping
      throw error;
    }
  }

  // Ensure positive values for delay calculations
  const safeBaseDelay = Math.max(0, config.baseDelay);
  const safeBackoffFactor = Math.max(1, config.backoffFactor);
  const safeMaxDelay = Math.max(0, config.maxDelay);

  let lastError: unknown;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // For primitive non-Error exceptions, don't retry them
      if (!(error instanceof Error) && typeof error !== 'object') {
        throw error;
      }

      // Check retry condition for Error instances only
      if (error instanceof Error && !config.retryCondition(error, attempt)) {
        throw error;
      }

      // If this was the last attempt, throw the original error
      if (attempt === config.maxAttempts) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        safeBaseDelay * Math.pow(safeBackoffFactor, attempt - 1),
        safeMaxDelay
      );

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // This should never be reached, but TypeScript requires it
  throw lastError;
}

/**
 * Specific retry function for file operations
 * @param fn - File operation function to retry
 * @param options - Retry configuration options
 * @returns Promise resolving to the file operation result
 */
export async function retryFileOperation<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const fileRetryOptions: RetryOptions = {
    maxAttempts: 3,
    baseDelay: 200,
    maxDelay: 2000,
    backoffFactor: 1.5,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    retryCondition: (error: Error, _attempt: number) => {
      // Retry on common file operation errors
      const retryableErrors = [
        'EACCES', // Permission denied
        'EMFILE', // Too many open files
        'ENFILE', // File table overflow
        'EBUSY', // Device or resource busy
        'ETXTBSY', // Text file busy
        'EAGAIN', // Resource temporarily unavailable
        'EIO', // I/O error
        'ENOSPC', // No space left on device
      ];

      return error.message.includes('Tool call repetition limit reached') ||
             retryableErrors.some(code => error.message.includes(code));
    },
    ...options,
  };

  return withRetry(fn, fileRetryOptions);
}

/**
 * Specific retry function for network operations
 * @param fn - Network operation function to retry
 * @param options - Retry configuration options
 * @returns Promise resolving to the network operation result
 */
export async function retryNetworkOperation<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const networkRetryOptions: RetryOptions = {
    maxAttempts: 5,
    baseDelay: 500,
    maxDelay: 10000,
    backoffFactor: 2,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    retryCondition: (error: Error, _attempt: number) => {
      // Retry on network-related errors
      const networkErrors = [
        'ECONNRESET', // Connection reset
        'ETIMEDOUT', // Connection timed out
        'ENOTFOUND', // DNS resolution failed
        'ECONNREFUSED', // Connection refused
        'EPIPE', // Broken pipe
        'NetworkError',
        'fetch failed',
        'timeout',
      ];

      return networkErrors.some(code =>
        error.message.toLowerCase().includes(code.toLowerCase())
      );
    },
    ...options,
  };

  return withRetry(fn, networkRetryOptions);
}
