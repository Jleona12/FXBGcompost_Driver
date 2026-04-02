import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Supabase before importing the route handler
const mockInsert = vi.fn()
const mockSelect = vi.fn()
const mockSingle = vi.fn()

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({
      insert: (...args: unknown[]) => {
        mockInsert(...args)
        return {
          select: (...sArgs: unknown[]) => {
            mockSelect(...sArgs)
            return {
              single: () => {
                mockSingle()
                return {
                  data: {
                    id: 1,
                    instance_stop_id: 1,
                    driver_initials: 'JL',
                    completed: true,
                    timestamp: '2024-01-15T12:00:00Z',
                  },
                  error: null,
                }
              },
            }
          },
        }
      },
    }),
  },
}))

import { POST } from '@/app/api/v2-pickups/route'
import { NextRequest } from 'next/server'

function createPostRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost:3000/api/v2-pickups', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('POST /api/v2-pickups', () => {
  it('returns 400 when instance_stop_id is missing', async () => {
    const req = createPostRequest({ driver_initials: 'JL', completed: true })
    const res = await POST(req)
    expect(res.status).toBe(400)

    const body = await res.json()
    expect(body.error).toContain('instance_stop_id')
  })

  it('returns 400 when driver_initials is missing', async () => {
    const req = createPostRequest({ instance_stop_id: 1, completed: true })
    const res = await POST(req)
    expect(res.status).toBe(400)

    const body = await res.json()
    expect(body.error).toContain('driver_initials')
  })

  it('returns 400 when completed is not a boolean', async () => {
    const req = createPostRequest({
      instance_stop_id: 1,
      driver_initials: 'JL',
      completed: 'yes',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 for invalid driver initials format', async () => {
    const req = createPostRequest({
      instance_stop_id: 1,
      driver_initials: 'X',
      completed: true,
    })
    const res = await POST(req)
    expect(res.status).toBe(400)

    const body = await res.json()
    expect(body.error).toContain('2-3 alphanumeric')
  })

  it('returns 201 with valid payload', async () => {
    const req = createPostRequest({
      instance_stop_id: 1,
      driver_initials: 'JL',
      completed: true,
      notes: 'Left at door',
    })
    const res = await POST(req)
    expect(res.status).toBe(201)

    const body = await res.json()
    expect(body.id).toBe(1)
    expect(body.driver_initials).toBe('JL')
  })
})
