'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Route } from '@/lib/types'
import { fetchRoutes as fetchRoutesData } from '@/lib/data/routes'
import { format } from 'date-fns'
import { parseLocalDate } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { MapPin, RefreshCw, ChevronRight, Map } from 'lucide-react'

export default function RouteList() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadRoutes()
  }, [])

  async function loadRoutes() {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await fetchRoutesData()

      if (fetchError) {
        setError('Failed to load routes. Please try again.')
        return
      }

      setRoutes(data || [])
    } catch (err) {
      console.error('Error loading routes:', err)
      setError('Failed to load routes. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-20" />
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={loadRoutes}
            className="ml-3"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (routes.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-ios-bg-secondary flex items-center justify-center">
          <Map className="w-10 h-10 text-ios-label-tertiary" />
        </div>
        <p className="text-ios-title-3 font-semibold text-gray-500 mb-4">
          No routes available
        </p>
        <Button variant="outline" onClick={loadRoutes}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-ios-title-2 font-bold text-gray-900 tracking-tight">
          Available Routes ({routes.length})
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={loadRoutes}
          className="text-ios-subheadline"
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Refresh
        </Button>
      </div>

      <div className="space-y-3">
        {routes.map((route) => (
          <Link key={route.id} href={`/route/${route.id}`}>
            <Card className="p-4 hover:bg-accent/50 active:scale-[0.98] transition-all cursor-pointer">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <h3 className="text-ios-headline font-semibold text-gray-900 mb-1 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-fxbg-green" />
                    Route {route.id}
                  </h3>
                  {route.date && parseLocalDate(route.date) && (
                    <p className="text-ios-subheadline text-gray-600">
                      {format(parseLocalDate(route.date)!, 'MMMM d, yyyy')}
                    </p>
                  )}
                  {route.driver && (
                    <p className="text-ios-subheadline text-gray-600 mt-1">
                      Driver: {route.driver}
                    </p>
                  )}
                </div>
                <ChevronRight className="w-6 h-6 text-ios-label-tertiary flex-shrink-0 ml-3" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
