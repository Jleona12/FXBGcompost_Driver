/**
 * Simple in-memory sliding-window rate limiter.
 * Suitable for single-instance deployments (Vercel serverless resets on cold start).
 * For multi-instance, swap for Redis-backed limiter.
 */

interface RateLimitEntry {
  timestamps: number[]
}

const store = new Map<string, RateLimitEntry>()

// Clean up stale entries every 60 seconds
setInterval(() => {
  const cutoff = Date.now()
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter(t => t > cutoff - 60_000)
    if (entry.timestamps.length === 0) store.delete(key)
  }
}, 60_000)

/**
 * Check if a request should be rate limited.
 * @param key - Unique identifier (e.g., IP address)
 * @param maxRequests - Maximum requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns true if the request should be BLOCKED
 */
export function isRateLimited(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = store.get(key) || { timestamps: [] }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter(t => t > now - windowMs)

  if (entry.timestamps.length >= maxRequests) {
    return true
  }

  entry.timestamps.push(now)
  store.set(key, entry)
  return false
}
