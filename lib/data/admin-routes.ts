import {
  Route,
  RouteWithStopCount,
  StopWithCustomer,
  CreateRoutePayload,
  UpdateRoutePayload
} from '@/lib/types'

export interface RouteWithStops extends Route {
  stops: StopWithCustomer[]
}

export async function fetchAdminRoutes(): Promise<{
  data: RouteWithStopCount[] | null
  error: Error | null
}> {
  try {
    const response = await fetch('/api/admin/routes')

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
    console.error('[data/admin-routes] fetchAdminRoutes error:', err)
    return {
      data: null,
      error: err instanceof Error ? err : new Error('Network error'),
    }
  }
}

export async function fetchRouteForEdit(
  routeId: number
): Promise<{ data: RouteWithStops | null; error: Error | null }> {
  try {
    if (isNaN(routeId) || routeId < 1) {
      return { data: null, error: new Error('Invalid route ID') }
    }

    const response = await fetch(`/api/admin/routes/${routeId}`)

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
    console.error('[data/admin-routes] fetchRouteForEdit error:', err)
    return {
      data: null,
      error: err instanceof Error ? err : new Error('Network error'),
    }
  }
}

export async function createRoute(
  payload: CreateRoutePayload
): Promise<{ data: Route | null; error: Error | null }> {
  try {
    const response = await fetch('/api/admin/routes', {
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
    console.error('[data/admin-routes] createRoute error:', err)
    return {
      data: null,
      error: err instanceof Error ? err : new Error('Network error'),
    }
  }
}

export async function updateRoute(
  routeId: number,
  payload: UpdateRoutePayload
): Promise<{ data: Route | null; error: Error | null }> {
  try {
    if (isNaN(routeId) || routeId < 1) {
      return { data: null, error: new Error('Invalid route ID') }
    }

    const response = await fetch(`/api/admin/routes/${routeId}`, {
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
    console.error('[data/admin-routes] updateRoute error:', err)
    return {
      data: null,
      error: err instanceof Error ? err : new Error('Network error'),
    }
  }
}

export async function deleteRoute(
  routeId: number
): Promise<{ success: boolean; error: Error | null }> {
  try {
    if (isNaN(routeId) || routeId < 1) {
      return { success: false, error: new Error('Invalid route ID') }
    }

    const response = await fetch(`/api/admin/routes/${routeId}`, {
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
    console.error('[data/admin-routes] deleteRoute error:', err)
    return {
      success: false,
      error: err instanceof Error ? err : new Error('Network error'),
    }
  }
}
