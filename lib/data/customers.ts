import { Customer } from '@/lib/types'
import { adminGet } from './admin-fetch'

export interface CustomerWithAssignments extends Customer {
  assignments: Array<{
    stop_id: number
    template_id: number
    template_name: string
    template_active: boolean
    stop_order: number
    stop_type?: string
  }>
}

export const fetchCustomers = (search?: string) => {
  const url = new URL('/api/admin/customers', window.location.origin)
  if (search?.trim()) url.searchParams.set('search', search.trim())
  return adminGet<Customer[]>(url.toString())
}

export const fetchCustomerById = (customerId: string) => {
  if (!customerId) {
    return Promise.resolve({ data: null, error: new Error('Customer ID is required') })
  }
  return adminGet<CustomerWithAssignments>(`/api/admin/customers/${encodeURIComponent(customerId)}`)
}
