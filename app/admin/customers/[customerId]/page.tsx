'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { fetchCustomerById, CustomerWithAssignments } from '@/lib/data/customers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Route,
  AlertCircle,
  ExternalLink
} from 'lucide-react'
import { formatPhoneNumber, getPhoneLink, getSmsLink, getMapLink, parseLocalDate } from '@/lib/utils'
import { format } from 'date-fns'

export default function CustomerDetailPage() {
  const params = useParams()
  const customerId = params.customerId as string

  const [customer, setCustomer] = useState<CustomerWithAssignments | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadCustomer()
  }, [customerId])

  const loadCustomer = async () => {
    if (!customerId) return

    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await fetchCustomerById(customerId)

    if (fetchError) {
      setError(fetchError.message)
      setCustomer(null)
    } else {
      setCustomer(data)
    }

    setLoading(false)
  }

  const statusColor = customer?.status === 'active'
    ? 'bg-green-100 text-green-800'
    : customer?.status === 'paused'
    ? 'bg-yellow-100 text-yellow-800'
    : 'bg-gray-100 text-gray-800'

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Link href="/admin/customers">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Customers
          </Button>
        </Link>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="space-y-6">
        <Link href="/admin/customers">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Customers
          </Button>
        </Link>
        <Alert>
          <AlertDescription>Customer not found</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/admin/customers">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Customers
        </Button>
      </Link>

      {/* Customer Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-ios-title-1">{customer.name}</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                {customer.status && (
                  <Badge className={statusColor}>{customer.status}</Badge>
                )}
                {customer.subscription_type && (
                  <Badge variant="outline">{customer.subscription_type}</Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Address */}
          {customer.address && (
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-ios-body text-gray-900">{customer.address}</p>
                {getMapLink(customer.address) && (
                  <a
                    href={getMapLink(customer.address)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ios-footnote text-fxbg-green hover:underline flex items-center gap-1 mt-1"
                  >
                    Open in Maps <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Phone */}
          {customer.phone && (
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-ios-body text-gray-900">
                  {formatPhoneNumber(customer.phone)}
                </p>
                <div className="flex gap-2 mt-1">
                  {getPhoneLink(customer.phone) && (
                    <a
                      href={getPhoneLink(customer.phone)!}
                      className="text-ios-footnote text-fxbg-green hover:underline"
                    >
                      Call
                    </a>
                  )}
                  {getSmsLink(customer.phone) && (
                    <a
                      href={getSmsLink(customer.phone)!}
                      className="text-ios-footnote text-fxbg-green hover:underline"
                    >
                      Text
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {customer.notes && Object.keys(customer.notes).length > 0 && (
            <div className="pt-4 border-t border-ios-separator">
              <h4 className="text-ios-footnote font-medium text-gray-500 mb-2">Notes</h4>
              <pre className="text-ios-body text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                {JSON.stringify(customer.notes, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Route Assignments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-ios-title-3 flex items-center gap-2">
            <Route className="w-5 h-5" />
            Route Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {customer.assignments && customer.assignments.length > 0 ? (
            <div className="space-y-3">
              {customer.assignments.map((assignment) => (
                <Link
                  key={assignment.stop_id}
                  href={`/admin/routes/${assignment.route_id}/edit`}
                  className="block"
                >
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-fxbg-green/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-fxbg-green">
                          {assignment.stop_order}
                        </span>
                      </div>
                      <div>
                        <p className="text-ios-body font-medium text-gray-900">
                          {assignment.route_date && parseLocalDate(assignment.route_date)
                            ? format(parseLocalDate(assignment.route_date)!, 'EEEE, MMM d, yyyy')
                            : `Route ${assignment.route_id}`}
                        </p>
                        {assignment.route_driver && (
                          <p className="text-ios-footnote text-gray-500">
                            Driver: {assignment.route_driver}
                          </p>
                        )}
                      </div>
                    </div>
                    {assignment.stop_type && (
                      <Badge variant="outline">{assignment.stop_type}</Badge>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-ios-body text-gray-500">
                Not assigned to any routes yet
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
