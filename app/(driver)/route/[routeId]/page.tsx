'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { StopWithStatus, PickupEvent, BatchStopOrderUpdate } from '@/lib/types'
import { fetchStopsByRoute } from '@/lib/data/stops'
import { supabase } from '@/lib/supabase'
import InitialsPrompt from '@/components/InitialsPrompt'
import StopList from '@/components/StopList'
import StopDetail from '@/components/StopDetail'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

const POLL_INTERVAL = 30_000 // 30s fallback (Realtime handles instant updates)

export default function RoutePage() {
  const params = useParams()
  const router = useRouter()
  const routeId = params?.routeId as string

  const [stops, setStops] = useState<StopWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [driverInitials, setDriverInitials] = useState<string | null>(null)
  const [selectedStopIndex, setSelectedStopIndex] = useState<number | null>(null)
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  const loadStops = useCallback(async () => {
    try {
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
  }, [routeId])

  // Initial load
  useEffect(() => {
    if (routeId) {
      setLoading(true)
      loadStops()
    }
  }, [routeId, loadStops])

  // Fallback poll — catches anything Realtime misses (e.g. reconnecting after phone sleep)
  useEffect(() => {
    if (!driverInitials || selectedStopIndex !== null) {
      // Don't poll before login or while in detail view
      if (pollRef.current) clearInterval(pollRef.current)
      return
    }

    pollRef.current = setInterval(() => {
      loadStops()
    }, POLL_INTERVAL)

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [driverInitials, selectedStopIndex, loadStops])

  // Supabase Realtime — apply pickup events directly to local state (no refetch)
  useEffect(() => {
    if (!driverInitials || !routeId) return

    const channel = supabase
      .channel(`route-${routeId}-pickups`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pickup_events',
        },
        (payload) => {
          const newEvent = payload.new as PickupEvent
          // Patch directly into local state — no round-trip
          setStops((prev) => {
            const match = prev.find((s) => s.id === newEvent.stop_id)
            if (!match) return prev // not our route
            // Only apply if newer than what we have
            const existing = match.latest_pickup
            if (existing && new Date(existing.timestamp) >= new Date(newEvent.timestamp)) {
              return prev
            }
            return prev.map((s) =>
              s.id === newEvent.stop_id
                ? { ...s, latest_pickup: newEvent }
                : s
            )
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [driverInitials, routeId])

  const handleStartRoute = (initials: string) => {
    setDriverInitials(initials)
  }

  const handleBackToRoutes = () => {
    router.push('/')
  }

  const handlePickupLogged = (stopId: number, completed: boolean, notes?: string) => {
    // Optimistic update — show the change immediately
    setStops((prev) =>
      prev.map((s) =>
        s.id === stopId
          ? {
              ...s,
              latest_pickup: {
                id: 0,
                stop_id: stopId,
                driver_initials: driverInitials!,
                completed,
                notes: notes || undefined,
                timestamp: new Date().toISOString(),
              } as PickupEvent,
            }
          : s
      )
    )
    setSelectedStopIndex(null)
    // No loadStops() here — Realtime subscription will bring in the
    // authoritative event, and the 30s fallback poll handles drift.
    // Calling loadStops() here caused a race condition where the API
    // returned stale data and overwrote the optimistic/Realtime state.
  }

  const handleReorder = async (updates: BatchStopOrderUpdate[]) => {
    // Optimistic local reorder already handled by StopList
    // Persist to server
    try {
      const response = await fetch(`/api/routes/${routeId}/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      })

      if (!response.ok) {
        console.error('Failed to save reorder')
        // Reload to get server truth
        loadStops()
      }
    } catch {
      console.error('Failed to save reorder')
      loadStops()
    }
  }

  // Loading State
  if (loading && stops.length === 0) {
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
  if (error && stops.length === 0) {
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

  // Initials Prompt (before viewing route)
  if (!driverInitials) {
    return (
      <InitialsPrompt
        onStart={handleStartRoute}
        routeId={routeId}
        stopCount={stops.length}
      />
    )
  }

  // Stop Detail view (when a stop is selected)
  if (selectedStopIndex !== null && stops[selectedStopIndex]) {
    return (
      <StopDetail
        stop={stops[selectedStopIndex]}
        driverInitials={driverInitials}
        onBack={() => setSelectedStopIndex(null)}
        onPickupLogged={handlePickupLogged}
      />
    )
  }

  // Stop List (main view)
  return (
    <StopList
      stops={stops}
      driverInitials={driverInitials}
      onSelectStop={setSelectedStopIndex}
      onBackToRoutes={handleBackToRoutes}
      onRefresh={loadStops}
      onReorder={handleReorder}
    />
  )
}
