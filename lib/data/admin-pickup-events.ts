import { PickupEventWithDetails } from '@/lib/types'

export interface FetchPickupEventsParams {
  limit?: number
  offset?: number
  routeId?: number
  driverInitials?: string
  dateFrom?: string
  dateTo?: string
  completedOnly?: boolean
}

export async function fetchPickupEvents(
  params: FetchPickupEventsParams = {}
): Promise<{ data: PickupEventWithDetails[] | null; error: Error | null }> {
  try {
    const searchParams = new URLSearchParams()

    if (params.limit) searchParams.set('limit', params.limit.toString())
    if (params.offset) searchParams.set('offset', params.offset.toString())
    if (params.routeId) searchParams.set('route_id', params.routeId.toString())
    if (params.driverInitials) searchParams.set('driver_initials', params.driverInitials)
    if (params.dateFrom) searchParams.set('date_from', params.dateFrom)
    if (params.dateTo) searchParams.set('date_to', params.dateTo)
    if (params.completedOnly) searchParams.set('completed', 'true')

    const queryString = searchParams.toString()
    const url = `/api/admin/pickup-events${queryString ? `?${queryString}` : ''}`

    const response = await fetch(url)

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
    console.error('[data/admin-pickup-events] fetchPickupEvents error:', err)
    return {
      data: null,
      error: err instanceof Error ? err : new Error('Network error'),
    }
  }
}
