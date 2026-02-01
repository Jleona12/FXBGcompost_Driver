'use client'

import { useState, useEffect, useCallback } from 'react'
import { Customer } from '@/lib/types'
import { fetchCustomers } from '@/lib/data/customers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, X, MapPin, Phone, Plus, Check } from 'lucide-react'
import { formatPhoneNumber } from '@/lib/utils'

interface CustomerSelectorProps {
  onSelect: (customer: Customer) => void
  onClose: () => void
  excludeCustomerIds?: string[]
}

export default function CustomerSelector({
  onSelect,
  onClose,
  excludeCustomerIds = []
}: CustomerSelectorProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const loadCustomers = useCallback(async (search?: string) => {
    setLoading(true)
    const { data } = await fetchCustomers(search)

    // Filter out already assigned customers
    const filtered = (data || []).filter(
      c => !excludeCustomerIds.includes(c.stripe_customer_id)
    )

    setCustomers(filtered)
    setLoading(false)
  }, [excludeCustomerIds])

  useEffect(() => {
    loadCustomers()
  }, [loadCustomers])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCustomers(searchTerm)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm, loadCustomers])

  const handleSelect = (customer: Customer) => {
    setSelectedId(customer.stripe_customer_id)
    onSelect(customer)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg max-h-[80vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-ios-title-3">Add Customer</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name, address, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto">
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          )}

          {!loading && customers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-ios-body text-gray-500">
                {searchTerm
                  ? `No customers match "${searchTerm}"`
                  : 'No customers available to add'}
              </p>
            </div>
          )}

          {!loading && customers.length > 0 && (
            <div className="space-y-2">
              {customers.map((customer) => {
                const isSelected = selectedId === customer.stripe_customer_id

                return (
                  <button
                    key={customer.stripe_customer_id}
                    onClick={() => handleSelect(customer)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      isSelected
                        ? 'border-fxbg-green bg-fxbg-green/5'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-ios-body text-gray-900 truncate">
                          {customer.name}
                        </h4>

                        {customer.address && (
                          <div className="flex items-start gap-1.5 mt-1 text-ios-footnote text-gray-600">
                            <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5" />
                            <span className="truncate">{customer.address}</span>
                          </div>
                        )}

                        {customer.phone && (
                          <div className="flex items-center gap-1.5 mt-1 text-ios-footnote text-gray-500">
                            <Phone className="w-3 h-3" />
                            <span>{formatPhoneNumber(customer.phone)}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 mt-2">
                          {customer.status && (
                            <Badge
                              variant="secondary"
                              className={`text-xs ${
                                customer.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {customer.status}
                            </Badge>
                          )}
                          {customer.subscription_type && (
                            <Badge variant="outline" className="text-xs">
                              {customer.subscription_type}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {isSelected ? (
                        <Check className="w-5 h-5 text-fxbg-green flex-shrink-0" />
                      ) : (
                        <Plus className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
