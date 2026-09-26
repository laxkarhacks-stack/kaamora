/**
 * In-memory rate limiter foundation.
 * Production: move to Redis/Upstash for multi-instance.
 * Spec: layered abuse signals, not invasive surveillance.
 */

import { DEFAULTS } from "@/lib/config";

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(
  key: string,
  max = DEFAULTS.rateLimitMaxRequests,
  windowMs = DEFAULTS.rateLimitWindowMs
): RateLimitResult {
  const now = Date.now();
  let bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(key, bucket);
  }

  bucket.count += 1;

  if (bucket.count > max) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: bucket.resetAt,
    };
  }

  return {
    allowed: true,
    remaining: Math.max(0, max - bucket.count),
    resetAt: bucket.resetAt,
  };
}

/** Best-effort client key from request headers (no invasive fingerprinting) */
export function clientKeyFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || headers.get("x-real-ip") || "unknown";
  return `ip:${ip}`;
}
