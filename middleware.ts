import { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME = 'admin_auth'

/**
 * Verify HMAC-signed session token using Web Crypto API (Edge-compatible).
 * Token format: "session:<expiryMs>.<hexSignature>"
 */
async function verifySessionToken(token: string): Promise<boolean> {
  const secret = process.env.ADMIN_PASSWORD
  if (!secret) return false

  const lastDot = token.lastIndexOf('.')
  if (lastDot === -1) return false

  const payload = token.slice(0, lastDot)
  const sig = token.slice(lastDot + 1)

  // Compute expected HMAC-SHA256 using Web Crypto
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
  const expected = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  // Constant-length comparison (both are hex strings of same hash)
  if (sig.length !== expected.length) return false
  let mismatch = 0
  for (let i = 0; i < sig.length; i++) {
    mismatch |= sig.charCodeAt(i) ^ expected.charCodeAt(i)
  }
  if (mismatch !== 0) return false

  // Check expiry
  const parts = payload.split(':')
  const expires = parseInt(parts[1], 10)
  if (isNaN(expires) || Date.now() > expires) return false

  return true
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/api/admin/auth') {
    return NextResponse.next()
  }

  const authCookie = request.cookies.get(COOKIE_NAME)

  if (!authCookie || !(await verifySessionToken(authCookie.value))) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/admin/:path*',
}
