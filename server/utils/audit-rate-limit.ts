/**
 * Design Audit — in-memory rate limiter for /api/audit.
 *
 * Keeps a rolling window of request timestamps per IP. When the window
 * exceeds the limit, returns the time remaining until the oldest
 * timestamp ages out.
 *
 * In-memory means each serverless instance has its own counter. For a
 * low-traffic marketing site that's acceptable — worst case is someone
 * hits two cold containers in parallel and gets 2× the limit before
 * either warms up. If we see real abuse we'll swap for Vercel KV or
 * Upstash Redis.
 *
 * Tuning — 5 audits per IP per hour:
 *   - A real prospect kicking the tyres won't run 5 audits in an hour.
 *   - A scraper/abuser would burn through the Anthropic budget fast.
 *   - Easy to bump later once we see how the endpoint gets used.
 */

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 5;
const CLEANUP_INTERVAL_MS = 60 * 1000; // prune stale entries once a minute

interface Entry {
  timestamps: number[];
}

const store = new Map<string, Entry>();
let lastCleanup = Date.now();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSec: number; // only meaningful when !allowed
}

export function checkRateLimit(key: string): RateLimitResult {
  maybePrune();

  const now = Date.now();
  const entry = store.get(key) ?? { timestamps: [] };

  // Drop timestamps that have aged out of the window.
  entry.timestamps = entry.timestamps.filter((t) => now - t < WINDOW_MS);

  if (entry.timestamps.length >= MAX_REQUESTS) {
    const oldest = entry.timestamps[0];
    const retryAfterMs = WINDOW_MS - (now - oldest);
    // Keep the pruned entry around so the next check sees the same state.
    store.set(key, entry);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSec: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    };
  }

  entry.timestamps.push(now);
  store.set(key, entry);

  return {
    allowed: true,
    remaining: MAX_REQUESTS - entry.timestamps.length,
    retryAfterSec: 0,
  };
}

/**
 * Periodic sweep to keep the Map from growing forever when IPs stop
 * hitting the endpoint. Cheap — runs at most once a minute and only
 * iterates what's in the store.
 */
function maybePrune(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, entry] of store.entries()) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < WINDOW_MS);
    if (entry.timestamps.length === 0) {
      store.delete(key);
    }
  }
}

/**
 * Extract the caller's IP from Vercel/proxy headers. Falls back to
 * 'unknown' so we still rate-limit traffic that somehow arrives without
 * the expected headers (treating them all as one bucket is safer than
 * letting them through).
 */
import type { H3Event } from 'h3';

export function getRequestIp(event: H3Event): string {
  return (
    getRequestHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim() ||
    getRequestHeader(event, 'x-real-ip') ||
    'unknown'
  );
}
