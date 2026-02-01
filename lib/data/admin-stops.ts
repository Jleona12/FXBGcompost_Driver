import {
  Stop,
  StopWithCustomer,
  CreateStopPayload,
  UpdateStopPayload,
  BatchStopOrderUpdate
} from '@/lib/types'

export async function createStop(
  payload: CreateStopPayload
): Promise<{ data: StopWithCustomer | null; error: Error | null }> {
  try {
    const response = await fetch('/api/admin/stops', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        data: null,
        error: new Error(errorData.error || `HTTP ${response.status}`),
      }
    }

    const data = await response.json()
    return { data, error: null }
  } catch (err) {
    console.error('[data/admin-stops] createStop error:', err)
    return {
      data: null,
      error: err instanceof Error ? err : new Error('Network error'),
    }
  }
}

export async function updateStop(
  stopId: number,
  payload: UpdateStopPayload
): Promise<{ data: StopWithCustomer | null; error: Error | null }> {
  try {
    if (isNaN(stopId) || stopId < 1) {
      return { data: null, error: new Error('Invalid stop ID') }
    }

    const response = await fetch(`/api/admin/stops/${stopId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        data: null,
        error: new Error(errorData.error || `HTTP ${response.status}`),
      }
    }

    const data = await response.json()
    return { data, error: null }
  } catch (err) {
    console.error('[data/admin-stops] updateStop error:', err)
    return {
      data: null,
      error: err instanceof Error ? err : new Error('Network error'),
    }
  }
}

export async function deleteStop(
  stopId: number
): Promise<{ success: boolean; error: Error | null }> {
  try {
    if (isNaN(stopId) || stopId < 1) {
      return { success: false, error: new Error('Invalid stop ID') }
    }

    const response = await fetch(`/api/admin/stops/${stopId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: new Error(errorData.error || `HTTP ${response.status}`),
      }
    }

    return { success: true, error: null }
  } catch (err) {
    console.error('[data/admin-stops] deleteStop error:', err)
    return {
      success: false,
      error: err instanceof Error ? err : new Error('Network error'),
    }
  }
}

export async function batchUpdateStopOrders(
  updates: BatchStopOrderUpdate[]
): Promise<{ success: boolean; error: Error | null }> {
  try {
    if (!updates || updates.length === 0) {
      return { success: true, error: null }
    }

    const response = await fetch('/api/admin/stops/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error: new Error(errorData.error || `HTTP ${response.status}`),
      }
    }

    return { success: true, error: null }
  } catch (err) {
    console.error('[data/admin-stops] batchUpdateStopOrders error:', err)
    return {
      success: false,
      error: err instanceof Error ? err : new Error('Network error'),
    }
  }
}
