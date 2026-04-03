import { createHmac, timingSafeEqual } from 'crypto'

const SECRET = process.env.ADMIN_PASSWORD!

/** Create an HMAC-signed session token with an expiry timestamp. */
export function createSessionToken(maxAgeSeconds: number): string {
  const expires = Date.now() + maxAgeSeconds * 1000
  const payload = `session:${expires}`
  const sig = createHmac('sha256', SECRET).update(payload).digest('hex')
  return `${payload}.${sig}`
}

/** Verify a session token. Returns true if valid and not expired. */
export function verifySessionToken(token: string): boolean {
  const lastDot = token.lastIndexOf('.')
  if (lastDot === -1) return false

  const payload = token.slice(0, lastDot)
  const sig = token.slice(lastDot + 1)

  const expected = createHmac('sha256', SECRET).update(payload).digest('hex')

  // Constant-time comparison to prevent timing attacks
  if (sig.length !== expected.length) return false
  const sigBuf = Buffer.from(sig, 'utf8')
  const expectedBuf = Buffer.from(expected, 'utf8')
  if (!timingSafeEqual(sigBuf, expectedBuf)) return false

  // Check expiry
  const parts = payload.split(':')
  const expires = parseInt(parts[1], 10)
  if (isNaN(expires) || Date.now() > expires) return false

  return true
}
