/**
 * Simple in-memory rate limiter for Edge/Node.
 * For production at scale, use Upstash Redis instead.
 * 
 * Security rationale: Prevents brute-force submission flooding and
 * token-guessing attacks on approval endpoints.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  windowMs: number;   // time window in milliseconds
  max: number;        // max requests per window
}

export function rateLimit(key: string, config: RateLimitConfig): { success: boolean; remaining: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return { success: true, remaining: config.max - 1 };
  }

  if (entry.count >= config.max) {
    return { success: false, remaining: 0 };
  }

  entry.count++;
  return { success: true, remaining: config.max - entry.count };
}

// Clean up expired entries periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of Array.from(store.entries())) {
      if (entry.resetAt < now) store.delete(key);
    }
  }, 60_000);
}
