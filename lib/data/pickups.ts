import { PickupEventPayload } from '@/lib/types'
import { queuePickupEvent, isOnline } from '@/lib/utils'

export interface CreatePickupResult {
  success: boolean
  offline?: boolean
  error?: string
  data?: any
}

/**
 * Creates a pickup event - handles both online API submission and offline queueing
 * CRITICAL: Preserves existing offline queue behavior exactly
 * @param payload - Pickup event data
 * @returns Result object with success/error status
 */
export async function createPickupEvent(
  payload: PickupEventPayload
): Promise<CreatePickupResult> {
  try {
    // Check if online - PRESERVE OFFLINE QUEUE LOGIC
    if (!isOnline()) {
      console.log('[data/pickups] Offline mode - queueing pickup event')
      queuePickupEvent(payload)
      return {
        success: true,
        offline: true,
        error: 'Saved offline. Will sync when online.'
      }
    }

    // Submit to API - PRESERVE EXACT REQUEST
    console.log('[data/pickups] Submitting pickup event online')
    const response = await fetch('/api/pickups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('[data/pickups] API error:', response.status, data)
      return {
        success: false,
        error: data.error || 'Failed to log pickup'
      }
    }

    console.log('[data/pickups] Pickup event created successfully:', data.id)
    return {
      success: true,
      data
    }
  } catch (err) {
    console.error('[data/pickups] Unexpected createPickupEvent error:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to log pickup'
    }
  }
}
