'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Phone, ChevronRight } from 'lucide-react'
import { Customer } from '@/lib/types'
import { formatPhoneNumber } from '@/lib/utils'

interface CustomerCardProps {
  customer: Customer
}

export default function CustomerCard({ customer }: CustomerCardProps) {
  const statusColor = customer.status === 'active'
    ? 'bg-green-100 text-green-800'
    : customer.status === 'paused'
    ? 'bg-yellow-100 text-yellow-800'
    : 'bg-gray-100 text-gray-800'

  return (
    <Link href={`/admin/customers/${encodeURIComponent(customer.stripe_customer_id)}`}>
      <Card className="hover:bg-accent/50 active:scale-[0.99] transition-all cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Name */}
              <h3 className="font-semibold text-ios-headline text-gray-900 truncate">
                {customer.name}
              </h3>

              {/* Address */}
              {customer.address && (
                <div className="flex items-start gap-1.5 mt-1.5 text-ios-subheadline text-gray-600">
                  <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span className="truncate">{customer.address}</span>
                </div>
              )}

              {/* Phone */}
              {customer.phone && (
                <div className="flex items-center gap-1.5 mt-1 text-ios-subheadline text-gray-600">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>{formatPhoneNumber(customer.phone)}</span>
                </div>
              )}

              {/* Badges */}
              <div className="flex items-center gap-2 mt-2">
                {customer.status && (
                  <Badge variant="secondary" className={statusColor}>
                    {customer.status}
                  </Badge>
                )}
                {customer.subscription_type && (
                  <Badge variant="outline">
                    {customer.subscription_type}
                  </Badge>
                )}
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
