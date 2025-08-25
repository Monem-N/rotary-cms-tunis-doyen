/**
 * Performance Optimization Utilities
 * Lightweight optimizations for Tunisia network environment
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface User {
  id: string;
  email: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  languagePreference?: string;
  loginAttempts?: number;
  lockUntil?: string;
}

class OptimizedRateLimiter {
  private cache: Map<string, RateLimitEntry>;
  private windowMs: number;
  private maxRequests: number;
  private maxSize: number;
  private violations: Map<string, number>;

  constructor(windowMs: number = 15 * 60 * 1000, maxRequests: number = 5, maxSize: number = 10000) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.maxSize = maxSize;
    this.cache = new Map();
    this.violations = new Map();
  }

  check(identifier: string): { allowed: boolean; remainingTime?: number; backoff?: number } {
    const now = Date.now();
    const entry = this.cache.get(identifier);
    const violations = this.violations.get(identifier) || 0;

    // Enforce max size before any operations
    if (this.cache.size >= this.maxSize) {
      this.evictOldEntries();
    }

    if (!entry || now > entry.resetTime) {
      // First request or window expired
      this.cache.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      });

      // Reset violations on successful new window
      if (entry && now > entry.resetTime) {
        this.violations.delete(identifier);
      }

      return { allowed: true };
    }

    if (entry.count >= this.maxRequests) {
      // Exponential backoff: 15min * 2^violations
      const backoffMultiplier = Math.pow(2, violations);
      const remainingTime = Math.ceil((entry.resetTime - now) / 1000) * backoffMultiplier;

      // Increment violation count
      this.violations.set(identifier, violations + 1);

      return {
        allowed: false,
        remainingTime,
        backoff: backoffMultiplier
      };
    }

    // Increment counter
    entry.count++;
    this.cache.set(identifier, entry);
    return { allowed: true };
  }

  // Evict old entries when cache is full (LRU-style)
  private evictOldEntries(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());

    // Sort by reset time (oldest first) and remove expired entries
    entries.sort((a, b) => a[1].resetTime - b[1].resetTime);

    let removedCount = 0;
    const targetSize = Math.floor(this.maxSize * 0.8); // Target 80% of max size

    for (const [key, entry] of entries) {
      if (now > entry.resetTime || removedCount < (this.maxSize - targetSize)) {
        this.cache.delete(key);
        this.violations.delete(key); // Also clean up violations
        removedCount++;
      }
      if (this.cache.size <= targetSize) break;
    }

    // Force garbage collection hint if available
    if (typeof global !== 'undefined' && global.gc) {
      global.gc();
    }
  }

  // Cleanup expired entries (called periodically)
  cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.resetTime) {
        expiredKeys.push(key);
      }
    }

    // Batch delete expired entries
    for (const key of expiredKeys) {
      this.cache.delete(key);
      this.violations.delete(key);
    }

    // Periodic violation cleanup (remove very old violations)
    for (const [key, violations] of this.violations.entries()) {
      if (violations > 10) { // Reset after too many violations
        this.violations.set(key, 5);
      }
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      violationCount: this.violations.size,
      memoryUsage: this.estimateMemoryUsage(),
    };
  }

  // Estimate memory usage for monitoring
  private estimateMemoryUsage(): number {
    // Rough estimate: each entry ~100 bytes
    return this.cache.size * 100 + this.violations.size * 20;
  }
}

// Global rate limiter instance
export const loginRateLimiter = new OptimizedRateLimiter();

// Periodic cleanup (every 5 minutes)
if (typeof globalThis !== 'undefined') {
  setInterval(() => {
    loginRateLimiter.cleanup();
  }, 5 * 60 * 1000);
}

// Authentication performance optimizations
export class AuthPerformanceOptimizer {
  private static tokenCache = new Map<string, { user: User; expires: number }>();
  private static readonly TOKEN_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  static cacheTokenValidation(token: string, user: User): void {
    this.tokenCache.set(token, {
      user,
      expires: Date.now() + this.TOKEN_CACHE_TTL
    });
  }

  static getCachedTokenValidation(token: string): User | null {
    const cached = this.tokenCache.get(token);
    if (!cached || Date.now() > cached.expires) {
      this.tokenCache.delete(token);
      return null;
    }
    return cached.user;
  }

  static cleanupExpiredTokens(): void {
    const now = Date.now();
    for (const [token, data] of this.tokenCache.entries()) {
      if (now > data.expires) {
        this.tokenCache.delete(token);
      }
    }
  }

  static getCacheStats() {
    return {
      size: this.tokenCache.size,
      ttl: this.TOKEN_CACHE_TTL,
    };
  }
}

// Periodic token cache cleanup
if (typeof globalThis !== 'undefined') {
  setInterval(() => {
    AuthPerformanceOptimizer.cleanupExpiredTokens();
  }, 10 * 60 * 1000);
}

// Memory usage monitoring
export class MemoryMonitor {
  static getMemoryUsage() {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage();
      return {
        rss: Math.round(usage.rss / 1024 / 1024), // MB
        heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
        heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
        external: Math.round(usage.external / 1024 / 1024), // MB
      };
    }
    return null;
  }

  static logMemoryUsage(): void {
    const usage = this.getMemoryUsage();
    if (usage) {
      console.log(`[MEMORY] RSS: ${usage.rss}MB, Heap: ${usage.heapUsed}/${usage.heapTotal}MB`);
    }
  }
}

// Tunisia network optimizations
export const tunisiaNetworkOptimizations = {
  // Adjust timeouts for Tunisia network latency
  networkTimeouts: {
    databaseQuery: 10000, // 10 seconds
    externalAPI: 15000,   // 15 seconds
    fileUpload: 30000,    // 30 seconds
  },

  // Optimize for slower connections
  connectionOptimizations: {
    enableCompression: true,
    useCDN: true,
    cacheStaticAssets: true,
    optimizeImages: true,
  },

  // JWT token optimization for network issues
  tokenOptimizations: {
    refreshBeforeExpiry: 60 * 60 * 1000, // Refresh 1 hour before expiry
    offlineTokenStorage: true,
    retryFailedRequests: true,
  },
};

// Health check
export class HealthChecker {
  static async runHealthCheck(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    checks: Record<string, unknown>;
  }> {
    const checks = {
      memory: MemoryMonitor.getMemoryUsage(),
      rateLimiter: loginRateLimiter.getStats(),
      authCache: AuthPerformanceOptimizer.getCacheStats(),
    };

    // Determine overall status
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    // Memory check
    if (checks.memory && typeof checks.memory === 'object' && 'heapUsed' in checks.memory) {
      const memUsage = checks.memory as { heapUsed: number };
      if (memUsage.heapUsed > 200) { // 200MB threshold
        status = 'warning';
      }
      if (memUsage.heapUsed > 400) { // 400MB threshold
        status = 'critical';
      }
    }

    return { status, checks };
  }

  static logHealthStatus(): void {
    this.runHealthCheck().then(({ status, checks }) => {
      console.log(`[HEALTH] Status: ${status.toUpperCase()}`);
      console.log(`[HEALTH] Memory: ${JSON.stringify(checks.memory)}`);
      console.log(`[HEALTH] Rate Limiter: ${JSON.stringify(checks.rateLimiter)}`);
    });
  }
}

// Initialize performance monitoring
if (typeof globalThis !== 'undefined') {
  // Log health status every 5 minutes
  setInterval(() => {
    HealthChecker.logHealthStatus();
  }, 5 * 60 * 1000);

  // Log memory usage every minute
  setInterval(() => {
    MemoryMonitor.logMemoryUsage();
  }, 60 * 1000);
}

export default {
  loginRateLimiter,
  AuthPerformanceOptimizer,
  MemoryMonitor,
  tunisiaNetworkOptimizations,
  HealthChecker,
};