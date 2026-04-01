import { InstanceForDriver, StopWithStatus } from '@/lib/types'

// --- Driver-facing: fetch active instances ---

export async function fetchActiveInstances(): Promise<{
  data: InstanceForDriver[] | null
  error: Error | null
}> {
  try {
    const response = await fetch('/api/instances')
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      return { data: null, error: new Error(err.error || `HTTP ${response.status}`) }
    }
    return { data: await response.json(), error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error('Network error') }
  }
}

// --- Driver-facing: fetch stops for an instance ---

export async function fetchInstanceStops(
  instanceId: number
): Promise<{ data: StopWithStatus[] | null; error: Error | null }> {
  try {
    if (isNaN(instanceId) || instanceId < 1) {
      return { data: null, error: new Error('Invalid instance ID') }
    }
    const response = await fetch(`/api/instances/${instanceId}`)
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      return { data: null, error: new Error(err.error || `HTTP ${response.status}`) }
    }
    return { data: await response.json(), error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error('Network error') }
  }
}

// --- Admin-facing: fetch all instances ---

export async function fetchAdminInstances(status?: string): Promise<{
  data: InstanceForDriver[] | null
  error: Error | null
}> {
  try {
    const url = status
      ? `/api/admin/instances?status=${status}`
      : '/api/admin/instances'
    const response = await fetch(url)
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      return { data: null, error: new Error(err.error || `HTTP ${response.status}`) }
    }
    return { data: await response.json(), error: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err : new Error('Network error') }
  }
}

// --- Admin-facing: delete instance ---

export async function deleteInstance(
  instanceId: number
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const response = await fetch(`/api/admin/instances/${instanceId}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      return { success: false, error: new Error(err.error || `HTTP ${response.status}`) }
    }
    return { success: true, error: null }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err : new Error('Network error') }
  }
}
