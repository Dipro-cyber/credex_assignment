/**
 * Rate limiting for the /api/leads endpoint.
 *
 * Strategy: sliding window, 5 requests per IP per 10 minutes.
 *
 * Implementation:
 * - Production: Upstash Redis REST API (serverless-compatible, no persistent
 *   connection needed). Chosen over Vercel KV because it's free tier is more
 *   generous and works identically locally with the REST API.
 * - Development / fallback: in-memory Map. Resets on server restart.
 *   Acceptable for dev; not suitable for multi-instance production.
 *
 * Why not middleware-level rate limiting?
 * The /api/leads route is the only endpoint that needs protection. Adding
 * rate limiting at the route level keeps it explicit and easy to tune per
 * endpoint without affecting the rest of the app.
 *
 * Documented in README.md → Decisions section.
 */

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS = 5;

// ---------------------------------------------------------------------------
// In-memory fallback (dev / no Redis configured)
// ---------------------------------------------------------------------------

interface MemoryEntry {
  count: number;
  resetAt: number;
}

// Module-level map — persists across requests within the same server process
const memoryStore = new Map<string, MemoryEntry>();

function checkMemoryRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || now > entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: MAX_REQUESTS - entry.count };
}

// ---------------------------------------------------------------------------
// Upstash Redis (production)
// ---------------------------------------------------------------------------

async function checkRedisRateLimit(
  key: string
): Promise<{ allowed: boolean; remaining: number }> {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!redisUrl || !redisToken) {
    // Fall back to in-memory if Redis not configured
    return checkMemoryRateLimit(key);
  }

  const windowKey = `ratelimit:leads:${key}`;

  try {
    // INCR atomically increments and returns the new value
    const incrRes = await fetch(`${redisUrl}/incr/${windowKey}`, {
      headers: { Authorization: `Bearer ${redisToken}` },
    });

    if (!incrRes.ok) {
      // Redis error — fail open (allow the request)
      console.warn("[rate-limit] Redis INCR failed, failing open");
      return { allowed: true, remaining: MAX_REQUESTS };
    }

    const { result: count } = (await incrRes.json()) as { result: number };

    // On first request, set the expiry
    if (count === 1) {
      await fetch(
        `${redisUrl}/expire/${windowKey}/${Math.ceil(WINDOW_MS / 1000)}`,
        { headers: { Authorization: `Bearer ${redisToken}` } }
      );
    }

    const allowed = count <= MAX_REQUESTS;
    return { allowed, remaining: Math.max(0, MAX_REQUESTS - count) };
  } catch (err) {
    console.warn("[rate-limit] Redis error, failing open:", err);
    return { allowed: true, remaining: MAX_REQUESTS };
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Check rate limit for a given identifier (IP address).
 * Returns { allowed, remaining }.
 *
 * Always fails open on errors — we'd rather accept a few extra requests
 * than block legitimate users due to a Redis outage.
 */
export async function checkRateLimit(
  identifier: string
): Promise<{ allowed: boolean; remaining: number }> {
  const hasRedis =
    !!process.env.UPSTASH_REDIS_REST_URL &&
    !!process.env.UPSTASH_REDIS_REST_TOKEN;

  if (hasRedis) {
    return checkRedisRateLimit(identifier);
  }

  return checkMemoryRateLimit(identifier);
}
