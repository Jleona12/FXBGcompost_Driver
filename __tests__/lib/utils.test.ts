import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  validateDriverInitials,
  formatPhoneNumber,
  getPhoneLink,
  getSmsLink,
  getMapLink,
  parseLocalDate,
  queuePickupEvent,
  getQueuedEvents,
  clearQueuedEvents,
  isOnline,
  STORAGE_KEYS,
} from '@/lib/utils'

describe('validateDriverInitials', () => {
  it('accepts 2-character alphanumeric initials', () => {
    expect(validateDriverInitials('JL')).toBe(true)
    expect(validateDriverInitials('A1')).toBe(true)
  })

  it('accepts 3-character alphanumeric initials', () => {
    expect(validateDriverInitials('JKL')).toBe(true)
    expect(validateDriverInitials('AB3')).toBe(true)
  })

  it('rejects single character', () => {
    expect(validateDriverInitials('J')).toBe(false)
  })

  it('rejects 4+ characters', () => {
    expect(validateDriverInitials('ABCD')).toBe(false)
  })

  it('rejects special characters', () => {
    expect(validateDriverInitials('J!')).toBe(false)
    expect(validateDriverInitials('A B')).toBe(false)
  })

  it('rejects empty and null-ish values', () => {
    expect(validateDriverInitials('')).toBe(false)
    expect(validateDriverInitials(null as unknown as string)).toBe(false)
    expect(validateDriverInitials(undefined as unknown as string)).toBe(false)
  })

  it('trims whitespace before validating', () => {
    expect(validateDriverInitials(' JL ')).toBe(true)
  })
})

describe('formatPhoneNumber', () => {
  it('formats 10-digit numbers as (XXX) XXX-XXXX', () => {
    expect(formatPhoneNumber('5401234567')).toBe('(540) 123-4567')
  })

  it('formats 11-digit numbers starting with 1', () => {
    expect(formatPhoneNumber('15401234567')).toBe('+1 (540) 123-4567')
  })

  it('strips non-numeric characters before formatting', () => {
    expect(formatPhoneNumber('(540) 123-4567')).toBe('(540) 123-4567')
  })

  it('returns original for unrecognized formats', () => {
    expect(formatPhoneNumber('123')).toBe('123')
  })

  it('returns "No phone" for undefined', () => {
    expect(formatPhoneNumber(undefined)).toBe('No phone')
  })
})

describe('getPhoneLink', () => {
  it('generates tel: link', () => {
    expect(getPhoneLink('(540) 123-4567')).toBe('tel:5401234567')
  })

  it('returns null for undefined', () => {
    expect(getPhoneLink(undefined)).toBeNull()
  })
})

describe('getSmsLink', () => {
  it('generates sms: link', () => {
    expect(getSmsLink('5401234567')).toBe('sms:5401234567')
  })

  it('returns null for undefined', () => {
    expect(getSmsLink(undefined)).toBeNull()
  })
})

describe('getMapLink', () => {
  it('generates Google Maps link with encoded address', () => {
    const link = getMapLink('123 Main St, Fredericksburg VA')
    expect(link).toBe(
      'https://www.google.com/maps/search/?api=1&query=123%20Main%20St%2C%20Fredericksburg%20VA'
    )
  })

  it('returns null for undefined', () => {
    expect(getMapLink(undefined)).toBeNull()
  })
})

describe('parseLocalDate', () => {
  it('parses YYYY-MM-DD without timezone shift', () => {
    const date = parseLocalDate('2024-01-15')
    expect(date).not.toBeNull()
    expect(date!.getFullYear()).toBe(2024)
    expect(date!.getMonth()).toBe(0) // January = 0
    expect(date!.getDate()).toBe(15)
  })

  it('returns null for undefined', () => {
    expect(parseLocalDate(undefined)).toBeNull()
  })

  it('returns null for invalid format', () => {
    expect(parseLocalDate('not-a-date')).toBeNull()
  })
})

describe('offline queue', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('queues and retrieves events', () => {
    const event = { stop_id: 1, driver_initials: 'JL', completed: true }
    queuePickupEvent(event)

    const queued = getQueuedEvents()
    expect(queued).toHaveLength(1)
    expect(queued[0].stop_id).toBe(1)
    expect(queued[0].queued_at).toBeDefined()
  })

  it('queues multiple events', () => {
    queuePickupEvent({ stop_id: 1, driver_initials: 'JL', completed: true })
    queuePickupEvent({ stop_id: 2, driver_initials: 'JL', completed: true })

    expect(getQueuedEvents()).toHaveLength(2)
  })

  it('clears queue and sets last sync timestamp', () => {
    queuePickupEvent({ stop_id: 1, driver_initials: 'JL', completed: true })
    clearQueuedEvents()

    expect(getQueuedEvents()).toHaveLength(0)
    expect(localStorage.getItem(STORAGE_KEYS.LAST_SYNC)).toBeDefined()
  })

  it('returns empty array when queue is empty', () => {
    expect(getQueuedEvents()).toEqual([])
  })
})

describe('isOnline', () => {
  it('returns a boolean', () => {
    expect(typeof isOnline()).toBe('boolean')
  })
})
