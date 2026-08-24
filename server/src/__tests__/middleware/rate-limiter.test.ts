/**
 * Rate Limiter — Unit Tests
 *
 * Tests in-memory rate limiting logic.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Simplified rate limiter logic for unit testing ───
class RateLimiterStore {
  private entries = new Map<string, { count: number; resetAt: number }>();

  check(key: string, max: number, windowMs: number): { allowed: boolean; remaining: number; retryAfter?: number } {
    const now = Date.now();
    let entry = this.entries.get(key);

    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs };
      this.entries.set(key, entry);
    }

    entry.count++;
    const remaining = Math.max(0, max - entry.count);

    if (entry.count > max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      return { allowed: false, remaining: 0, retryAfter };
    }

    return { allowed: true, remaining };
  }

  reset() {
    this.entries.clear();
  }
}

describe('Rate Limiter', () => {
  let store: RateLimiterStore;

  beforeEach(() => {
    store = new RateLimiterStore();
  });

  it('first request within limit → allowed', () => {
    const result = store.check('192.168.1.1', 10, 60_000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(9);
  });

  it('requests at limit → last one allowed', () => {
    for (let i = 0; i < 9; i++) {
      store.check('192.168.1.1', 10, 60_000);
    }
    const result = store.check('192.168.1.1', 10, 60_000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it('request exceeding limit → blocked', () => {
    for (let i = 0; i < 10; i++) {
      store.check('192.168.1.1', 10, 60_000);
    }
    const result = store.check('192.168.1.1', 10, 60_000);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.retryAfter).toBeDefined();
    expect(result.retryAfter!).toBeGreaterThan(0);
  });

  it('different IPs tracked separately', () => {
    for (let i = 0; i < 10; i++) {
      store.check('192.168.1.1', 10, 60_000);
    }

    // First IP is exhausted
    expect(store.check('192.168.1.1', 10, 60_000).allowed).toBe(false);

    // Second IP should still have quota
    const result = store.check('192.168.1.2', 10, 60_000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(9);
  });

  it('window reset → requests allowed again', () => {
    vi.useFakeTimers();

    for (let i = 0; i < 10; i++) {
      store.check('192.168.1.1', 10, 60_000);
    }
    expect(store.check('192.168.1.1', 10, 60_000).allowed).toBe(false);

    // Advance time past the window
    vi.advanceTimersByTime(61_000);

    const result = store.check('192.168.1.1', 10, 60_000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(9);

    vi.useRealTimers();
  });

  it('small window (1 second) with low max', () => {
    for (let i = 0; i < 3; i++) {
      store.check('ip1', 3, 1_000);
    }
    expect(store.check('ip1', 3, 1_000).allowed).toBe(false);
  });

  it('reset clears all entries', () => {
    for (let i = 0; i < 10; i++) {
      store.check('ip1', 10, 60_000);
    }
    store.reset();
    const result = store.check('ip1', 10, 60_000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(9);
  });
});
