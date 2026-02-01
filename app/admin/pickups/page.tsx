'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { PickupEventWithDetails } from '@/lib/types'
import { fetchPickupEvents, FetchPickupEventsParams } from '@/lib/data/admin-pickup-events'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import {
  ClipboardCheck,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Calendar,
  User,
  Filter,
  ChevronDown,
  ChevronUp,
  ChevronRight
} from 'lucide-react'
import { format } from 'date-fns'
import { parseLocalDate } from '@/lib/utils'

interface DateSummary {
  date: string
  totalEvents: number
  completedEvents: number
  pendingEvents: number
  uniqueDrivers: string[]
}

export default function PickupEventsPage() {
  const [events, setEvents] = useState<PickupEventWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // Filter state
  const [filters, setFilters] = useState<FetchPickupEventsParams>({
    limit: 500,
    completedOnly: false,
  })
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [driverInitials, setDriverInitials] = useState('')

  const loadEvents = useCallback(async () => {
    setLoading(true)
    setError(null)

    const params: FetchPickupEventsParams = {
      ...filters,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      driverInitials: driverInitials || undefined,
    }

    const { data, error: fetchError } = await fetchPickupEvents(params)

    if (fetchError) {
      setError(fetchError.message)
      setEvents([])
    } else {
      setEvents(data || [])
    }

    setLoading(false)
  }, [filters, dateFrom, dateTo, driverInitials])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  const handleApplyFilters = () => {
    loadEvents()
  }

  const handleClearFilters = () => {
    setDateFrom('')
    setDateTo('')
    setDriverInitials('')
    setFilters({ limit: 500, completedOnly: false })
  }

  // Calculate overall stats
  const totalEvents = events.length
  const completedEvents = events.filter(e => e.completed).length
  const pendingEvents = totalEvents - completedEvents
  const uniqueDrivers = new Set(events.map(e => e.driver_initials.toUpperCase())).size

  // Group events by date and calculate per-date stats
  const dateSummaries: DateSummary[] = Object.entries(
    events.reduce((acc, event) => {
      const date = event.timestamp.split('T')[0]
      if (!acc[date]) {
        acc[date] = {
          date,
          totalEvents: 0,
          completedEvents: 0,
          pendingEvents: 0,
          uniqueDrivers: new Set<string>(),
        }
      }
      acc[date].totalEvents++
      if (event.completed) {
        acc[date].completedEvents++
      } else {
        acc[date].pendingEvents++
      }
      acc[date].uniqueDrivers.add(event.driver_initials.toUpperCase())
      return acc
    }, {} as Record<string, { date: string; totalEvents: number; completedEvents: number; pendingEvents: number; uniqueDrivers: Set<string> }>)
  )
    .map(([date, stats]) => ({
      date,
      totalEvents: stats.totalEvents,
      completedEvents: stats.completedEvents,
      pendingEvents: stats.pendingEvents,
      uniqueDrivers: Array.from(stats.uniqueDrivers),
    }))
    .sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-ios-large-title font-bold text-gray-900">Pickup Activity</h1>
          <p className="text-ios-body text-gray-600 mt-1">
            View and track completed pickups by date
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <ClipboardCheck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-ios-footnote text-gray-500">Total Events</p>
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
                  {loading ? '-' : uniqueDrivers}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader
          className="cursor-pointer"
          onClick={() => setShowFilters(!showFilters)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-ios-headline flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </CardTitle>
            {showFilters ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </CardHeader>

        {showFilters && (
          <CardContent className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateFrom">From Date</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateTo">To Date</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="driverInitials">Driver Initials</Label>
                <Input
                  id="driverInitials"
                  type="text"
                  placeholder="e.g. JD"
                  value={driverInitials}
                  onChange={(e) => setDriverInitials(e.target.value)}
                  maxLength={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex items-center gap-2 h-10">
                  <Checkbox
                    id="completedOnly"
                    checked={filters.completedOnly}
                    onCheckedChange={(checked) =>
                      setFilters(prev => ({ ...prev, completedOnly: checked === true }))
                    }
                  />
                  <Label htmlFor="completedOnly" className="font-normal cursor-pointer">
                    Completed only
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button onClick={handleApplyFilters} className="bg-fxbg-green hover:bg-fxbg-green/90">
                Apply Filters
              </Button>
              <Button variant="outline" onClick={handleClearFilters}>
                Clear
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Date List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : dateSummaries.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <ClipboardCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-ios-headline font-semibold text-gray-900 mb-2">
                No pickup events found
              </h3>
              <p className="text-ios-body text-gray-500">
                {dateFrom || dateTo || driverInitials
                  ? 'Try adjusting your filters'
                  : 'Pickup events will appear here once drivers log their activities'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {dateSummaries.map((summary) => {
            const parsedDate = parseLocalDate(summary.date)
            const completionRate = summary.totalEvents > 0
              ? Math.round((summary.completedEvents / summary.totalEvents) * 100)
              : 0

            return (
              <Link key={summary.date} href={`/admin/pickups/${summary.date}`}>
                <Card className="hover:bg-accent/50 active:scale-[0.99] transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-full bg-fxbg-green/10 flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-6 h-6 text-fxbg-green" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-ios-headline text-gray-900">
                            {parsedDate
                              ? format(parsedDate, 'EEEE, MMMM d, yyyy')
                              : summary.date}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 mt-1 text-ios-subheadline text-gray-600">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {summary.uniqueDrivers.join(', ')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                          <div className="flex items-center gap-2 justify-end">
                            <Badge
                              variant="secondary"
                              className="bg-green-100 text-green-800"
                            >
                              {summary.completedEvents} completed
                            </Badge>
                            {summary.pendingEvents > 0 && (
                              <Badge
                                variant="secondary"
                                className="bg-yellow-100 text-yellow-800"
                              >
                                {summary.pendingEvents} pending
                              </Badge>
                            )}
                          </div>
                          <p className="text-ios-footnote text-gray-500 mt-1">
                            {summary.totalEvents} total · {completionRate}% complete
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      </div>
                    </div>

                    {/* Mobile stats */}
                    <div className="flex items-center gap-2 mt-3 sm:hidden">
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800"
                      >
                        {summary.completedEvents} completed
                      </Badge>
                      {summary.pendingEvents > 0 && (
                        <Badge
                          variant="secondary"
                          className="bg-yellow-100 text-yellow-800"
                        >
                          {summary.pendingEvents} pending
                        </Badge>
                      )}
                      <span className="text-ios-footnote text-gray-500">
                        · {completionRate}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
