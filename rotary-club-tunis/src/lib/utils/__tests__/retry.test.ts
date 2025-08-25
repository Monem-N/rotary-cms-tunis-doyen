/**
 * Comprehensive test suite for retry utility functions
 * Tests retry mechanisms, exponential backoff, and error handling
 */

import {
  withRetry,
  retryFileOperation,
  retryNetworkOperation,
  DEFAULT_RETRY_OPTIONS,
} from '../retry';

// Mock setTimeout for testing
jest.useFakeTimers();

describe('Retry Utilities', () => {
  beforeEach(() => {
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('withRetry', () => {
    it('should return result on first successful attempt', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      const result = await withRetry(mockFn);

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and succeed on second attempt', async () => {
      const firstError = new Error('First failure');
      const mockFn = jest.fn()
        .mockRejectedValueOnce(firstError)
        .mockResolvedValueOnce('success');

      const result = await withRetry(mockFn, { maxAttempts: 3 });

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should exhaust all attempts and throw last error', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Persistent failure'));

      await expect(withRetry(mockFn, { maxAttempts: 2 }))
        .rejects
        .toThrow('Persistent failure');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should preserve function arguments across retries', async () => {
      const firstError = new Error('First failure');
      const mockFn = jest.fn()
        .mockRejectedValueOnce(firstError)
        .mockResolvedValueOnce('success');

      const args = ['arg1', 42, { key: 'value' }];
      const wrappedFn = () => mockFn(...args);
      const result = await withRetry(wrappedFn, { maxAttempts: 3 });

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(2);
      // Both calls should have received the same arguments
      expect(mockFn).toHaveBeenNthCalledWith(1, ...args);
      expect(mockFn).toHaveBeenNthCalledWith(2, ...args);
    });

    it('should respect retry condition', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Should not retry'));
      const retryCondition = jest.fn().mockReturnValue(false);

      await expect(withRetry(mockFn, { retryCondition }))
        .rejects
        .toThrow('Should not retry');
      expect(mockFn).toHaveBeenCalledTimes(1); // No retry due to condition
      expect(retryCondition).toHaveBeenCalledWith(expect.any(Error), 1);
    });

    it('should pass attempt number to retry condition', async () => {
      const mockFn = jest.fn()
        .mockRejectedValueOnce(new Error('First attempt'))
        .mockRejectedValueOnce(new Error('Second attempt'))
        .mockResolvedValueOnce('success');
      
      const retryCondition = jest.fn()
        .mockReturnValueOnce(true)   // Retry after first attempt
        .mockReturnValueOnce(true)   // Retry after second attempt
        .mockReturnValueOnce(false); // Don't retry after third

      await withRetry(mockFn, { maxAttempts: 4, retryCondition });

      expect(retryCondition).toHaveBeenCalledTimes(2);
      expect(retryCondition).toHaveBeenNthCalledWith(1, expect.any(Error), 1);
      expect(retryCondition).toHaveBeenNthCalledWith(2, expect.any(Error), 2);
    });

    it('should implement exponential backoff', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Failure'));
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

      const retryPromise = withRetry(mockFn, {
        maxAttempts: 3,
        baseDelay: 100,
        backoffFactor: 2
      });

      // Fast-forward timers
      jest.runAllTimers();
      await retryPromise.catch(() => {}); // Ignore rejection

      // Check that setTimeout was called with the correct delays
      const delays = setTimeoutSpy.mock.calls.map(call => call[1]);
      expect(delays).toContain(100); // First retry
      expect(delays).toContain(200); // Second retry (100 * 2)
    });

    it('should respect maxDelay limit', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Failure'));
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

      const retryPromise = withRetry(mockFn, {
        maxAttempts: 5,
        baseDelay: 1000,
        backoffFactor: 2,
        maxDelay: 2000
      });

      jest.runAllTimers();
      await retryPromise.catch(() => {});

      // Should cap delay at maxDelay (2000ms)
      const delays = setTimeoutSpy.mock.calls.map(call => call[1] as number);
      const maxActualDelay = Math.max(...delays);
      expect(maxActualDelay).toBe(2000);
    });

    it('should handle zero or negative configuration values gracefully', async () => {
      const mockFn = jest.fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockResolvedValueOnce('success');

      // Test with zero maxAttempts (should behave like 1 attempt)
      await expect(withRetry(mockFn, { maxAttempts: 0 }))
        .rejects
        .toThrow('First failure');
      
      // Reset mock
      mockFn.mockClear();
      mockFn.mockRejectedValueOnce(new Error('First failure'))
            .mockResolvedValueOnce('success');
      
      // Test with negative baseDelay (should use default)
      const result = await withRetry(mockFn, { 
        maxAttempts: 2, 
        baseDelay: -100,
        backoffFactor: 1.5 
      });
      
      expect(result).toBe('success');
    });
  });

  describe('retryFileOperation', () => {
    it('should retry on file-related errors', async () => {
      const mockFn = jest.fn()
        .mockRejectedValueOnce(new Error('EACCES: Permission denied'))
        .mockResolvedValueOnce('file content');

      const result = await retryFileOperation(mockFn);

      expect(result).toBe('file content');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should retry on tool call repetition limit errors', async () => {
      const mockFn = jest.fn()
        .mockRejectedValueOnce(new Error('Tool call repetition limit reached'))
        .mockResolvedValueOnce('success');

      const result = await retryFileOperation(mockFn);

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should not retry on non-file errors', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Validation error'));

      await expect(retryFileOperation(mockFn))
        .rejects
        .toThrow('Validation error');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should use file-specific retry configuration', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('EIO: I/O error'));
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

      const retryPromise = retryFileOperation(mockFn);
      jest.runAllTimers();
      await retryPromise.catch(() => {});

      // File operations use 200ms base delay, 1.5 backoff factor
      const delays = setTimeoutSpy.mock.calls.map(call => call[1] as number);
      expect(delays).toContain(200);
      expect(delays).toContain(300); // 200 * 1.5
    });

    it('should retry on various file system errors', async () => {
      // Test individual file errors separately to avoid Jest setup issues
      const mockFn1 = jest.fn()
        .mockRejectedValueOnce(new Error('EBUSY: resource busy'))
        .mockResolvedValueOnce('success');
      const result1 = await retryFileOperation(mockFn1);
      expect(result1).toBe('success');
      expect(mockFn1).toHaveBeenCalledTimes(2);

      const mockFn2 = jest.fn()
        .mockRejectedValueOnce(new Error('EMFILE: too many open files'))
        .mockResolvedValueOnce('success');
      const result2 = await retryFileOperation(mockFn2);
      expect(result2).toBe('success');
      expect(mockFn2).toHaveBeenCalledTimes(2);
    });
  });

  describe('retryNetworkOperation', () => {
    it('should retry on network-related errors', async () => {
      const mockFn = jest.fn()
        .mockRejectedValueOnce(new Error('ECONNRESET: Connection reset'))
        .mockResolvedValueOnce('network response');

      const result = await retryNetworkOperation(mockFn);

      expect(result).toBe('network response');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should retry on timeout errors', async () => {
      const mockFn = jest.fn()
        .mockRejectedValueOnce(new Error('Request timeout'))
        .mockResolvedValueOnce('success');

      const result = await retryNetworkOperation(mockFn);

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should retry on network errors', async () => {
      // Create error object separately to avoid Jest environment issues
      let networkError: Error;
      try {
        networkError = new Error('Connection timeout');
      } catch (err) {
        // If creating Error fails, skip this test
        console.warn('Skipping test due to Jest environment issue');
        return;
      }

      const mockFn = jest.fn()
        .mockRejectedValueOnce(networkError)
        .mockResolvedValueOnce('success');

      const result = await retryNetworkOperation(mockFn);
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should not retry on non-network errors', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Invalid input'));

      await expect(retryNetworkOperation(mockFn))
        .rejects
        .toThrow('Invalid input');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should not retry on 4xx HTTP errors', async () => {
      interface ErrorWithResponse extends Error {
        response?: { status: number };
      }
      
      const httpError: ErrorWithResponse = new Error('HTTP Error 404');
      httpError.response = { status: 404 };
      
      const mockFn = jest.fn().mockRejectedValue(httpError);

      await expect(retryNetworkOperation(mockFn))
        .rejects
        .toThrow('HTTP Error 404');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should use network-specific retry configuration', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('ENOTFOUND'));
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

      const retryPromise = retryNetworkOperation(mockFn);
      jest.runAllTimers();
      await retryPromise.catch(() => {});

      // Network operations use 500ms base delay, 2 backoff factor, 5 max attempts
      const delays = setTimeoutSpy.mock.calls.map(call => call[1] as number);
      expect(delays).toContain(500);
      expect(delays).toContain(1000); // 500 * 2
    });
  });

  describe('DEFAULT_RETRY_OPTIONS', () => {
    it('should have sensible default values', () => {
      expect(DEFAULT_RETRY_OPTIONS).toEqual({
        maxAttempts: 3,
        baseDelay: 100,
        maxDelay: 5000,
        backoffFactor: 2,
        retryCondition: expect.any(Function),
      });
    });

    it('should retry on any error by default', () => {
      const retryCondition = DEFAULT_RETRY_OPTIONS.retryCondition;
      expect(retryCondition(new Error('Any error'), 1)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle non-Error exceptions', async () => {
      const mockFn = jest.fn().mockRejectedValue('String error');

      await expect(withRetry(mockFn))
        .rejects
        .toBe('String error');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should preserve error stack traces', async () => {
      const originalError = new Error('Original error');
      originalError.stack = 'Custom stack trace';
      const mockFn = jest.fn().mockRejectedValue(originalError);

      try {
        await withRetry(mockFn, { maxAttempts: 1 });
        fail('Expected function to throw');
      } catch (error) {
        expect(error).toBe(originalError);
        expect((error as Error).stack).toBe('Custom stack trace');
      }
    });

    it('should handle errors with no message property', async () => {
      const mockFn = jest.fn().mockRejectedValue({ customProperty: 'value' });

      await expect(withRetry(mockFn, { maxAttempts: 2 }))
        .rejects
        .toEqual({ customProperty: 'value' });
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });
});
