import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Production rate limiter using Upstash Redis.
 * Works correctly across Vercel serverless function invocations.
 *
 * Requires env vars:
 * - UPSTASH_REDIS_REST_URL
 * - UPSTASH_REDIS_REST_TOKEN
 *
 * Falls back to a permissive no-op if Upstash is not configured (dev mode).
 */

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn(
      "[rate-limit] UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set. Rate limiting disabled."
    );
    return null;
  }

  redis = new Redis({ url, token });
  return redis;
}

// Analysis creation: 5 per minute per user
const analysisLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "60 s"),
  analytics: true,
  prefix: "ratelimit:analysis",
});

// General API: 60 per minute per user
const apiLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(60, "60 s"),
  analytics: true,
  prefix: "ratelimit:api",
});

// Auth attempts: 10 per minute per IP
const authLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "60 s"),
  analytics: true,
  prefix: "ratelimit:auth",
});

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

type LimiterType = "analysis" | "api" | "auth";

const limiters: Record<LimiterType, Ratelimit> = {
  analysis: analysisLimiter,
  api: apiLimiter,
  auth: authLimiter,
};

/**
 * Check rate limit for a given identifier.
 * Returns a permissive result if Upstash is not configured.
 */
export async function checkRateLimit(
  identifier: string,
  type: LimiterType = "analysis"
): Promise<RateLimitResult> {
  const redisClient = getRedis();

  // Permissive fallback for development without Upstash
  if (!redisClient) {
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
