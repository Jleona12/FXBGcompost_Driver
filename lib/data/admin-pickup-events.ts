import { PickupEventWithDetails } from '@/lib/types'
import { adminGet } from './admin-fetch'

export interface FetchPickupEventsParams {
  limit?: number
  offset?: number
  routeId?: number
  driverInitials?: string
  dateFrom?: string
  dateTo?: string
  completedOnly?: boolean
}

export const fetchPickupEvents = (params: FetchPickupEventsParams = {}) => {
  const sp = new URLSearchParams()

  if (params.limit) sp.set('limit', params.limit.toString())
  if (params.offset) sp.set('offset', params.offset.toString())
  if (params.routeId) sp.set('route_id', params.routeId.toString())
  if (params.driverInitials) sp.set('driver_initials', params.driverInitials)
  if (params.dateFrom) sp.set('date_from', params.dateFrom)
  if (params.dateTo) sp.set('date_to', params.dateTo)
  if (params.completedOnly) sp.set('completed', 'true')

  const qs = sp.toString()
  return adminGet<PickupEventWithDetails[]>(`/api/admin/pickup-events${qs ? `?${qs}` : ''}`)
}
