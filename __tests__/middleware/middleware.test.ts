import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import { middleware } from '@/middleware'

function createRequest(path: string, cookie?: { name: string; value: string }) {
  const url = `http://localhost:3000${path}`
  const req = new NextRequest(url)
  if (cookie) {
    req.cookies.set(cookie.name, cookie.value)
  }
  return req
}

describe('admin auth middleware', () => {
  it('allows requests to /api/admin/auth without cookie', () => {
    const req = createRequest('/api/admin/auth')
    const res = middleware(req)
    // NextResponse.next() doesn't set status to 401
    expect(res.status).not.toBe(401)
  })

  it('blocks unauthenticated requests to /api/admin/templates', async () => {
    const req = createRequest('/api/admin/templates')
    const res = middleware(req)
    expect(res.status).toBe(401)

    const body = await res.json()
    expect(body.error).toBe('Unauthorized')
  })

  it('blocks requests with wrong cookie value', async () => {
    const req = createRequest('/api/admin/templates', {
      name: 'admin_auth',
      value: 'wrong-value',
    })
    const res = middleware(req)
    expect(res.status).toBe(401)
  })

  it('allows authenticated requests through', () => {
    const req = createRequest('/api/admin/templates', {
      name: 'admin_auth',
      value: 'authenticated',
    })
    const res = middleware(req)
    expect(res.status).not.toBe(401)
  })

  it('blocks unauthenticated requests to nested admin paths', async () => {
    const req = createRequest('/api/admin/customers/cus_123')
    const res = middleware(req)
    expect(res.status).toBe(401)
  })

  it('allows authenticated requests to nested admin paths', () => {
    const req = createRequest('/api/admin/instances/1', {
      name: 'admin_auth',
      value: 'authenticated',
    })
    const res = middleware(req)
    expect(res.status).not.toBe(401)
  })
})
