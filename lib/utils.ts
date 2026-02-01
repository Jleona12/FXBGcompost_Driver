import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Validates driver initials format (2-3 alphanumeric characters)
 */
export function validateDriverInitials(initials: string): boolean {
  if (!initials || typeof initials !== 'string') return false
  const trimmed = initials.trim()
  return /^[a-zA-Z0-9]{2,3}$/.test(trimmed)
}

/**
 * Formats phone number for display
 */
export function formatPhoneNumber(phone: string | undefined): string {
  if (!phone) return 'No phone'

  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '')

  // Format as (XXX) XXX-XXXX
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }

  // Format as +X (XXX) XXX-XXXX for 11 digits starting with 1
  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
  }

  // Return original if format is unknown
  return phone
}

/**
 * Generates tel: link for phone calls
 */
export function getPhoneLink(phone: string | undefined): string | null {
  if (!phone) return null
  const cleaned = phone.replace(/\D/g, '')
  return cleaned ? `tel:${cleaned}` : null
}

/**
 * Generates sms: link for text messages
 */
export function getSmsLink(phone: string | undefined): string | null {
  if (!phone) return null
  const cleaned = phone.replace(/\D/g, '')
  return cleaned ? `sms:${cleaned}` : null
}

/**
 * Formats address for Google Maps link
 */
export function getMapLink(address: string | undefined): string | null {
  if (!address) return null
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}

/**
 * Storage keys for offline queue
 */
export const STORAGE_KEYS = {
  PICKUP_QUEUE: 'fxbg_pickup_queue',
  LAST_SYNC: 'fxbg_last_sync',
} as const

/**
 * Queue pickup event for offline sync
 */
export function queuePickupEvent(event: any): void {
  if (typeof window === 'undefined') return

  try {
    const queue = JSON.parse(localStorage.getItem(STORAGE_KEYS.PICKUP_QUEUE) || '[]')
    queue.push({
      ...event,
      queued_at: new Date().toISOString(),
    })
    localStorage.setItem(STORAGE_KEYS.PICKUP_QUEUE, JSON.stringify(queue))
  } catch (error) {
    console.error('Failed to queue pickup event:', error)
  }
}

/**
 * Get queued pickup events
 */
export function getQueuedEvents(): any[] {
  if (typeof window === 'undefined') return []

  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PICKUP_QUEUE) || '[]')
  } catch (error) {
    console.error('Failed to get queued events:', error)
    return []
  }
}

/**
 * Clear queued events after successful sync
 */
export function clearQueuedEvents(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(STORAGE_KEYS.PICKUP_QUEUE)
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString())
  } catch (error) {
    console.error('Failed to clear queued events:', error)
  }
}

/**
 * Check if browser is online
 */
export function isOnline(): boolean {
  if (typeof window === 'undefined') return true
  return navigator.onLine
}

/**
 * Parse a date string (YYYY-MM-DD) into a Date object without timezone issues.
 * Using new Date("2024-01-15") parses as midnight UTC, which shifts to the
 * previous day in US timezones. This function parses the date parts manually
 * to create a local date.
 */
export function parseLocalDate(dateString: string | undefined): Date | null {
  if (!dateString) return null

  // Extract YYYY-MM-DD from the string
  const match = dateString.trim().match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return null

  const year = parseInt(match[1], 10)
  const month = parseInt(match[2], 10) - 1 // JS months are 0-indexed
  const day = parseInt(match[3], 10)

  return new Date(year, month, day)
}
