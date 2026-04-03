import { describe, it, expect, vi, beforeAll } from 'vitest'
import { NextRequest } from 'next/server'

// Set env before importing middleware
beforeAll(() => {
  vi.stubEnv('ADMIN_PASSWORD', 'test-secret')
})

function createRequest(path: string, cookie?: { name: string; value: string }) {
  const url = `http://localhost:3000${path}`
  const req = new NextRequest(url)
  if (cookie) {
    req.cookies.set(cookie.name, cookie.value)
  }
  return req
}

/** Create a valid HMAC-signed token using Web Crypto (same algo as middleware). */
async function createValidToken(): Promise<string> {
  const secret = 'test-secret'
  const expires = Date.now() + 60_000
  const payload = `session:${expires}`

  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sigBuf = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
  const sig = Array.from(new Uint8Array(sigBuf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  return `${payload}.${sig}`
}

describe('admin auth middleware', () => {
  // Dynamic import so env is set first
  let middleware: typeof import('@/middleware').middleware

  beforeAll(async () => {
    const mod = await import('@/middleware')
    middleware = mod.middleware
  })

  it('allows requests to /api/admin/auth without cookie', async () => {
    const req = createRequest('/api/admin/auth')
    const res = await middleware(req)
    expect(res.status).not.toBe(401)
  })

  it('blocks unauthenticated requests to /api/admin/templates', async () => {
    const req = createRequest('/api/admin/templates')
    const res = await middleware(req)
    expect(res.status).toBe(401)

    const body = await res.json()
    expect(body.error).toBe('Unauthorized')
  })

  it('blocks requests with wrong cookie value', async () => {
    const req = createRequest('/api/admin/templates', {
      name: 'admin_auth',
      value: 'wrong-value',
    })
    const res = await middleware(req)
    expect(res.status).toBe(401)
  })

  it('allows authenticated requests with valid HMAC token', async () => {
    const token = await createValidToken()
    const req = createRequest('/api/admin/templates', {
      name: 'admin_auth',
      value: token,
    })
    const res = await middleware(req)
    expect(res.status).not.toBe(401)
  })

  it('blocks unauthenticated requests to nested admin paths', async () => {
    const req = createRequest('/api/admin/customers/cus_123')
    const res = await middleware(req)
    expect(res.status).toBe(401)
  })

  it('allows authenticated requests to nested admin paths', async () => {
    const token = await createValidToken()
    const req = createRequest('/api/admin/instances/1', {
      name: 'admin_auth',
      value: token,
    })
    const res = await middleware(req)
    expect(res.status).not.toBe(401)
  })

  it('rejects expired tokens', async () => {
    // Manually craft an expired token
    const secret = 'test-secret'
    const expires = Date.now() - 1000 // already expired
    const payload = `session:${expires}`

    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    const sigBuf = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
    const sig = Array.from(new Uint8Array(sigBuf))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    const req = createRequest('/api/admin/templates', {
      name: 'admin_auth',
      value: `${payload}.${sig}`,
    })
    const res = await middleware(req)
    expect(res.status).toBe(401)
  })
})
