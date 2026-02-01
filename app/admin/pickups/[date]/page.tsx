'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { PickupEventWithDetails } from '@/lib/types'
import { fetchPickupEvents } from '@/lib/data/admin-pickup-events'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  ArrowLeft,
  ClipboardCheck,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Calendar,
  User,
  MapPin,
  Clock,
  Phone,
  MessageSquare
} from 'lucide-react'
import { format } from 'date-fns'
import { parseLocalDate, formatPhoneNumber, getPhoneLink, getSmsLink } from '@/lib/utils'

export default function PickupDateDetailPage() {
  const params = useParams()
  const dateParam = params.date as string

  const [events, setEvents] = useState<PickupEventWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadEvents = useCallback(async () => {
    setLoading(true)
    setError(null)

    // Fetch events for this specific date
    const { data, error: fetchError } = await fetchPickupEvents({
      dateFrom: dateParam,
      dateTo: dateParam,
      limit: 500,
    })

    if (fetchError) {
      setError(fetchError.message)
      setEvents([])
    } else {
      // Sort by timestamp
      const sorted = (data || []).sort((a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
      setEvents(sorted)
    }

    setLoading(false)
  }, [dateParam])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  // Parse the date for display
  const parsedDate = parseLocalDate(dateParam)
  const formattedDate = parsedDate
    ? format(parsedDate, 'EEEE, MMMM d, yyyy')
    : dateParam

  // Calculate stats for this date
  const totalEvents = events.length
  const completedEvents = events.filter(e => e.completed).length
  const pendingEvents = totalEvents - completedEvents
  const uniqueDrivers = Array.from(new Set(events.map(e => e.driver_initials.toUpperCase())))

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/admin/pickups">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Pickups
        </Button>
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-ios-large-title font-bold text-gray-900 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-fxbg-green" />
            {formattedDate}
          </h1>
          <p className="text-ios-body text-gray-600 mt-1">
            {loading ? 'Loading...' : `${totalEvents} pickup event${totalEvents !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={loadEvents}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <ClipboardCheck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-ios-footnote text-gray-500">Total</p>
                <p className="text-ios-title-2 font-bold text-gray-900">
                  {loading ? '-' : totalEvents}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-ios-footnote text-gray-500">Completed</p>
                <p className="text-ios-title-2 font-bold text-gray-900">
                  {loading ? '-' : completedEvents}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-ios-footnote text-gray-500">Not Completed</p>
                <p className="text-ios-title-2 font-bold text-gray-900">
                  {loading ? '-' : pendingEvents}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-ios-footnote text-gray-500">Drivers</p>
                <p className="text-ios-title-2 font-bold text-gray-900">
                  {loading ? '-' : uniqueDrivers.join(', ') || '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Events List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <ClipboardCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-ios-headline font-semibold text-gray-900 mb-2">
                No pickup events for this date
              </h3>
              <p className="text-ios-body text-gray-500">
                No pickup activity was recorded on {formattedDate}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {events.map((event, index) => {
            const customer = event.stop?.customer
            const phoneLink = getPhoneLink(customer?.phone)
            const smsLink = getSmsLink(customer?.phone)

            return (
              <Card key={event.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex">
                    {/* Status indicator bar */}
                    <div className={`w-1.5 flex-shrink-0 ${
                      event.completed ? 'bg-green-500' : 'bg-yellow-500'
                    }`} />

                    <div className="flex-1 p-4">
                      <div className="flex items-start gap-4">
                        {/* Stop number */}
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-ios-headline font-bold text-gray-700">
                            {index + 1}
                          </span>
                        </div>

                        {/* Main content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="text-ios-headline font-semibold text-gray-900">
                                {customer?.name || 'Unknown Customer'}
                              </h3>
                              {customer?.address && (
                                <p className="text-ios-subheadline text-gray-600 flex items-center gap-1 mt-1">
                                  <MapPin className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{customer.address}</span>
                                </p>
                              )}
                            </div>
                            <Badge
                              variant={event.completed ? 'default' : 'secondary'}
                              className={`flex-shrink-0 ${event.completed
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {event.completed ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Completed
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Not Completed
                                </>
                              )}
                            </Badge>
                          </div>

                          {/* Meta info */}
                          <div className="flex flex-wrap items-center gap-4 mt-3 text-ios-footnote text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {format(new Date(event.timestamp), 'h:mm a')}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {event.driver_initials.toUpperCase()}
                            </span>
                            {event.stop?.route?.driver && (
                              <span>
                                Route Driver: {event.stop.route.driver}
                              </span>
                            )}
                            {event.stop?.stop_order && (
                              <span>
                                Stop #{event.stop.stop_order}
                              </span>
                            )}
                          </div>

                          {/* Customer contact */}
                          {customer?.phone && (
                            <div className="flex items-center gap-2 mt-3">
                              <span className="text-ios-footnote text-gray-500">
                                {formatPhoneNumber(customer.phone)}
                              </span>
                              {phoneLink && (
                                <a
                                  href={phoneLink}
                                  className="inline-flex items-center gap-1 text-ios-footnote text-fxbg-green hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Phone className="w-3 h-3" />
                                  Call
                                </a>
                              )}
                              {smsLink && (
                                <a
                                  href={smsLink}
                                  className="inline-flex items-center gap-1 text-ios-footnote text-fxbg-green hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MessageSquare className="w-3 h-3" />
                                  Text
                                </a>
                              )}
                            </div>
                          )}

                          {/* Notes */}
                          {event.notes && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-ios-footnote text-gray-700">
                                <span className="font-medium">Driver Notes:</span> {event.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
