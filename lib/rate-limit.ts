import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Production rate limiter using Upstash Redis.
 * Works correctly across Vercel serverless function invocations.
 *
 * IMPORTANT: All Redis/Ratelimit instances are lazy-initialized to prevent
 * crashes when env vars are missing (e.g., during build or in middleware context).
 *
 * Requires env vars:
 * - UPSTASH_REDIS_REST_URL
 * - UPSTASH_REDIS_REST_TOKEN
 *
 * Falls back to a permissive no-op if Upstash is not configured.
 */

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

type LimiterType = "analysis" | "api" | "auth";

// Lazy-initialized limiters (created on first use, not at import time)
let _limiters: Record<LimiterType, Ratelimit> | null = null;

function getLimiters(): Record<LimiterType, Ratelimit> | null {
  if (_limiters) return _limiters;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  const redis = new Redis({ url, token });

  _limiters = {
    analysis: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "60 s"),
      analytics: true,
      prefix: "ratelimit:analysis",
    }),
    api: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, "60 s"),
      analytics: true,
      prefix: "ratelimit:api",
    }),
    auth: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "60 s"),
      analytics: true,
      prefix: "ratelimit:auth",
    }),
  };

  return _limiters;
}

/**
 * Check rate limit for a given identifier.
 * Returns a permissive result if Upstash is not configured.
 */
export async function checkRateLimit(
  identifier: string,
  type: LimiterType = "analysis"
): Promise<RateLimitResult> {
  const limiters = getLimiters();

  // Permissive fallback when Upstash is not configured
  if (!limiters) {
    return { success: true, remaining: 999, resetAt: Date.now() + 60000 };
  }

  const limiter = limiters[type];
  const result = await limiter.limit(identifier);

  return {
    success: result.success,
    remaining: result.remaining,
    resetAt: result.reset,
  };
}

/**
 * Pre-configured rate limit configs (kept for reference/documentation).
 */
export const RATE_LIMITS = {
  /** Analysis creation: 5 per minute per user */
  analysis: { maxRequests: 5, windowSeconds: 60 },
  /** Auth attempts: 10 per minute per IP */
  auth: { maxRequests: 10, windowSeconds: 60 },
  /** General API: 60 per minute per user */
  api: { maxRequests: 60, windowSeconds: 60 },
} as const;
