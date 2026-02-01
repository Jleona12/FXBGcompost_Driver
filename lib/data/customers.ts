import { Customer } from '@/lib/types'

export interface CustomerWithAssignments extends Customer {
  assignments: Array<{
    stop_id: number
    route_id: number
    route_date?: string
    route_driver?: string
    stop_order: number
    stop_type?: string
  }>
}

export async function fetchCustomers(
  search?: string
): Promise<{ data: Customer[] | null; error: Error | null }> {
  try {
    const url = new URL('/api/admin/customers', window.location.origin)
    if (search && search.trim()) {
      url.searchParams.set('search', search.trim())
    }

    const response = await fetch(url.toString())

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
    console.error('[data/customers] Unexpected fetchCustomers error:', err)
    return {
      data: null,
      error: err instanceof Error ? err : new Error('Network error'),
    }
  }
}

export async function fetchCustomerById(
  customerId: string
): Promise<{ data: CustomerWithAssignments | null; error: Error | null }> {
  try {
    if (!customerId) {
      return { data: null, error: new Error('Customer ID is required') }
    }

    const response = await fetch(`/api/admin/customers/${encodeURIComponent(customerId)}`)

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
    console.error('[data/customers] Unexpected fetchCustomerById error:', err)
    return {
      data: null,
      error: err instanceof Error ? err : new Error('Network error'),
    }
  }
}
