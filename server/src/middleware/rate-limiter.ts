/**
 * Rate Limiter Middleware — In-Memory Token Bucket
 *
 * Simple per-IP rate limiting for Phase 1.
 * Phase 2: Replace with Redis-based limiter for multi-instance support.
 */

import type { Context, Next } from 'hono';
import { RateLimitError } from '../shared/errors.js';
import { logger } from '../shared/logger.js';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const stores = new Map<string, Map<string, RateLimitEntry>>();

// Cleanup expired entries every 60 seconds
setInterval(() => {
  const now = Date.now();
  for (const [, store] of stores) {
    for (const [key, entry] of store) {
      if (now > entry.resetAt) {
        store.delete(key);
      }
    }
  }
}, 60_000).unref();

/**
 * Creates a rate limiting middleware.
 *
 * @param opts.windowMs - Time window in milliseconds (default: 60000 = 1 minute)
 * @param opts.max - Maximum requests per window (default: 20)
 * @param opts.keyGenerator - Custom key generator function (default: IP-based)
 * @param opts.name - Name for this limiter (for separate tracking)
 */
export function rateLimiter(opts: {
  windowMs?: number;
  max?: number;
  keyGenerator?: (c: Context) => string;
  name?: string;
} = {}) {
  const windowMs = opts.windowMs || 60_000;
  const max = opts.max || 20;
  const name = opts.name || 'default';
  const keyGen = opts.keyGenerator || ((c: Context) => {
    // Extract IP from common headers or connection
    const forwarded = c.req.header('x-forwarded-for');
    if (forwarded) return forwarded.split(',')[0].trim();
    const realIp = c.req.header('x-real-ip');
    if (realIp) return realIp;
    return 'unknown';
  });

  // Get or create store for this limiter
  if (!stores.has(name)) {
    stores.set(name, new Map());
  }
  const store = stores.get(name)!;

  return async (c: Context, next: Next) => {
    const key = keyGen(c);
    const now = Date.now();
    let entry = store.get(key);

    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs };
      store.set(key, entry);
    }

    entry.count++;

    // Set rate limit headers
    c.header('X-RateLimit-Limit', String(max));
    c.header('X-RateLimit-Remaining', String(Math.max(0, max - entry.count)));
    c.header('X-RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)));

    if (entry.count > max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      c.header('Retry-After', String(retryAfter));

      logger.warn({ ip: key, count: entry.count, max, limiter: name }, 'Rate limit exceeded');
      throw new RateLimitError(`Rate limit exceeded. Try again in ${retryAfter} seconds.`);
    }

    await next();
  };
}
