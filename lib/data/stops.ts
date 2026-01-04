import { StopWithCustomer } from '@/lib/types'

/**
 * Fetches stops for a specific route with customer information
 * @param routeId - Numeric route ID
 * @returns Array of stops with customers, or null on error
 */
export async function fetchStopsByRoute(
  routeId: number
): Promise<{ data: StopWithCustomer[] | null; error: Error | null }> {
  try {
    // Validate input
    if (isNaN(routeId) || routeId < 1) {
      return { data: null, error: new Error('Invalid route ID') }
    }

    const response = await fetch(`/api/routes/${routeId}`)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('[data/stops] API error:', response.status, errorData)
      return {
        data: null,
        error: new Error(errorData.error || `HTTP ${response.status}`)
      }
    }

    const data = await response.json()
    return { data, error: null }
  } catch (err) {
    console.error('[data/stops] Unexpected fetchStopsByRoute error:', err)
    return { data: null, error: err instanceof Error ? err : new Error('Network error') }
  }
}
