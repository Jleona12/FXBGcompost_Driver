import { PickupEventPayload } from '@/lib/types'
import { queuePickupEvent, isOnline } from '@/lib/utils'

export interface CreatePickupResult {
  success: boolean
  offline?: boolean
  error?: string
  data?: any
}

/**
 * Creates a pickup event — handles both online API submission and offline queueing
 * V2: Posts to /api/v2-pickups with instance_stop_id
 */
export async function createPickupEvent(
  payload: PickupEventPayload
): Promise<CreatePickupResult> {
  try {
    if (!isOnline()) {
      console.log('[data/pickups] Offline mode - queueing pickup event')
      queuePickupEvent(payload)
      return {
        success: true,
        offline: true,
        error: 'Saved offline. Will sync when online.'
      }
    }

    console.log('[data/pickups] Submitting pickup event online')
    const response = await fetch('/api/v2-pickups', {
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
    return { success: true, data }
  } catch (err) {
    console.error('[data/pickups] Unexpected createPickupEvent error:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to log pickup'
    }
  }
}
