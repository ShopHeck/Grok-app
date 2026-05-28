/**
 * Simple in-memory rate limiter for development/single-instance deployments.
 *
 * For production with multiple instances (e.g., Vercel serverless), replace with:
 * - @upstash/ratelimit (recommended)
 * - Redis-based solution
 *
 * This implementation uses a sliding window approach.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) {
      store.delete(key);
    }
  }
}, 60_000); // Clean every 60s

export interface RateLimitConfig {
  /** Max requests allowed in the window */
  maxRequests: number;
  /** Window duration in seconds */
  windowSeconds: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check rate limit for a given identifier (e.g., user ID or IP).
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;
  const key = `${identifier}`;

  const entry = store.get(key);

  // No existing entry or window expired — allow
  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetAt: now + windowMs,
    };
  }

  // Within window — check count
  if (entry.count >= config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  // Increment
  entry.count++;
  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Pre-configured rate limits for different endpoints.
 */
export const RATE_LIMITS = {
  /** Analysis creation: 5 per minute per user */
  analysis: { maxRequests: 5, windowSeconds: 60 },
  /** Auth attempts: 10 per minute per IP */
  auth: { maxRequests: 10, windowSeconds: 60 },
  /** General API: 60 per minute per user */
  api: { maxRequests: 60, windowSeconds: 60 },
} as const;
