'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { StopWithCustomer } from '@/lib/types'
import { fetchStopsByRoute } from '@/lib/data/stops'
import InitialsPrompt from '@/components/InitialsPrompt'
import RouteRunner from '@/components/RouteRunner'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
import { Loader2, CheckCircle2 } from 'lucide-react'

export default function RoutePage() {
  const params = useParams()
  const router = useRouter()
  const routeId = params?.routeId as string

  const [stops, setStops] = useState<StopWithCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [driverInitials, setDriverInitials] = useState<string | null>(null)
  const [routeComplete, setRouteComplete] = useState(false)

  useEffect(() => {
    if (routeId) {
      loadStops()
      // Try to load cached initials
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('fxbg_driver_initials')
        if (cached) {
          // Don't auto-set, let user confirm
        }
      }
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

  const handleStartRoute = (initials: string) => {
    setDriverInitials(initials)
  }

  const handleRouteComplete = () => {
    setRouteComplete(true)
  }

  const handleBackToRoutes = () => {
    router.push('/')
  }

  // Loading State
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

  // Error State
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
                <Button onClick={handleBackToRoutes} variant="outline" size="sm">
                  Back to Routes
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </main>
    )
  }

  // Route Complete State
  if (routeComplete) {
    return (
      <main className="min-h-screen bg-ios-bg-secondary flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-ios-title-1 font-bold text-gray-900 mb-2">
            Route Complete!
          </h1>
          <p className="text-ios-body text-gray-600 mb-6">
            You&apos;ve completed all {stops.length} stops on Route {routeId}
          </p>
          <Button
            onClick={handleBackToRoutes}
            className="w-full min-h-[56px] text-ios-title-3 font-bold bg-fxbg-green hover:bg-fxbg-green/90 text-white"
            size="lg"
          >
            Back to Routes
          </Button>
        </Card>
      </main>
    )
  }

  // Initials Prompt (before route starts)
  if (!driverInitials) {
    return (
      <InitialsPrompt
        onStart={handleStartRoute}
        routeId={routeId}
        stopCount={stops.length}
      />
    )
  }

  // Route Runner (main flow)
  return (
    <RouteRunner
      stops={stops}
      driverInitials={driverInitials}
      onComplete={handleRouteComplete}
    />
  )
}
