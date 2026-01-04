'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { StopWithCustomer } from '@/lib/types'
import { fetchStopsByRoute } from '@/lib/data/stops'
import StopList from '@/components/StopList'
import MapWidget from '@/components/MapWidget'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ChevronLeft, Loader2 } from 'lucide-react'

export default function RoutePage() {
  const params = useParams()
  const router = useRouter()
  const routeId = params?.routeId as string

  const [stops, setStops] = useState<StopWithCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStopId, setSelectedStopId] = useState<number | undefined>()

  useEffect(() => {
    if (routeId) {
      loadStops()
    }
  }, [routeId])

  async function loadStops() {
    try {
      setLoading(true)
      setError(null)

      const routeIdNum = Number(routeId)
      const { data, error: fetchError } = await fetchStopsByRoute(routeIdNum)

      if (fetchError) {
        setError('Failed to load route stops. Please try again.')
        return
      }

      setStops(data || [])
    } catch (err) {
      console.error('Error loading stops:', err)
      setError('Failed to load route stops. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleStopClick = (stopId: number) => {
    setSelectedStopId(stopId)
    // Scroll to stop card
    const element = document.getElementById(`stop-${stopId}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-ios-bg-secondary">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-12 h-12 text-fxbg-green animate-spin" />
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-ios-bg-secondary">
        <div className="container mx-auto px-4 py-6">
          <Alert variant="destructive" className="mb-4">
            <AlertDescription className="space-y-3">
              <p>{error}</p>
              <div className="flex gap-2">
                <Button onClick={loadStops} variant="outline" size="sm">
                  Retry
                </Button>
                <Button onClick={() => router.push('/')} variant="outline" size="sm">
                  Back to Routes
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-ios-bg-secondary">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            onClick={() => router.push('/')}
            variant="ghost"
            size="icon"
            className="rounded-full h-10 w-10"
            aria-label="Back to routes"
          >
            <ChevronLeft className="w-6 h-6 text-ios-blue" />
          </Button>
          <div>
            <h1 className="text-ios-title-1 font-bold text-fxbg-dark-brown tracking-tight">
              Route {routeId}
            </h1>
            <p className="text-ios-subheadline text-ios-label-secondary">
              {stops.length} stop{stops.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Map Widget */}
        {stops.length > 0 && (
          <div className="mb-6">
            <MapWidget
              stops={stops}
              selectedStopId={selectedStopId}
              onStopClick={handleStopClick}
            />
          </div>
        )}

        {/* Stop List */}
        <StopList stops={stops} />
      </div>
    </main>
  )
}
