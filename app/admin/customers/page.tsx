'use client'

import { useEffect, useState, useCallback } from 'react'
import { Customer } from '@/lib/types'
import { fetchCustomers } from '@/lib/data/customers'
import CustomerCard from '@/components/admin/CustomerCard'
import CustomerSearch from '@/components/admin/CustomerSearch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, AlertCircle } from 'lucide-react'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const loadCustomers = useCallback(async (search?: string) => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await fetchCustomers(search)

    if (fetchError) {
      setError(fetchError.message)
      setCustomers([])
    } else {
      setCustomers(data || [])
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    loadCustomers()
  }, [loadCustomers])

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term)
    loadCustomers(term)
  }, [loadCustomers])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-ios-large-title font-bold text-gray-900">Customers</h1>
        <p className="text-ios-body text-gray-600 mt-1">
          View and search all customers
        </p>
      </div>

      {/* Search */}
      <CustomerSearch onSearch={handleSearch} />

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      )}

      {/* Customer List */}
      {!loading && !error && customers.length > 0 && (
        <div className="space-y-3">
          <p className="text-ios-footnote text-gray-500">
            {customers.length} customer{customers.length !== 1 ? 's' : ''}
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
          {customers.map((customer) => (
            <CustomerCard key={customer.stripe_customer_id} customer={customer} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && customers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-ios-headline text-gray-900 mb-1">
            {searchTerm ? 'No customers found' : 'No customers yet'}
          </h3>
          <p className="text-ios-body text-gray-500">
            {searchTerm
              ? `No customers match "${searchTerm}"`
              : 'Customers will appear here once added to the system'}
          </p>
        </div>
      )}
    </div>
  )
}
