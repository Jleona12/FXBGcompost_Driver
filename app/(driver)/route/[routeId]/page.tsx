'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { StopWithStatus, PickupEvent, BatchStopOrderUpdate } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import InitialsPrompt from '@/components/InitialsPrompt'
import StopList from '@/components/StopList'
import StopDetail from '@/components/StopDetail'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

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
      const instanceId = Number(routeId)
      if (isNaN(instanceId) || instanceId < 1) {
        setError('Invalid route ID.')
        return
      }

      // Query Supabase directly — no API route
      const { data: rawStops, error: dbError } = await supabase
        .from('instance_stops')
        .select('*, customer:customers(*), pickup_events:v2_pickup_events(*)')
        .eq('instance_id', instanceId)
        .order('stop_order', { ascending: true })

      if (dbError) {
        console.error('Supabase error:', dbError)
        setError('Failed to load route stops.')
        return
      }

      // Attach latest pickup to each stop
      const stopsWithStatus: StopWithStatus[] = (rawStops || []).map((stop: any) => {
        const events = stop.pickup_events || []
        let latest: PickupEvent | null = null
        for (const e of events) {
          if (!latest || e.timestamp > latest.timestamp) {
            latest = e
          }
        }
        const { pickup_events, ...rest } = stop
        return { ...rest, latest_pickup: latest }
      })

      setStops(stopsWithStatus)
    } catch (err) {
      console.error('Error loading stops:', err)
      setError('Failed to load route stops.')
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

  // Fallback poll — catches anything Realtime misses
  useEffect(() => {
    if (!driverInitials || selectedStopIndex !== null) {
      if (pollRef.current) clearInterval(pollRef.current)
      return
    }

    pollRef.current = setInterval(loadStops, 30_000)

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [driverInitials, selectedStopIndex, loadStops])

  // Supabase Realtime — apply pickup events directly to local state
  useEffect(() => {
    if (!driverInitials || !routeId) return

    const channel = supabase
      .channel(`instance-${routeId}-pickups`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'v2_pickup_events',
        },
        (payload) => {
          const newEvent = payload.new as PickupEvent
          setStops((prev) => {
            const match = prev.find((s) => s.id === newEvent.instance_stop_id)
            if (!match) return prev
            const existing = match.latest_pickup
            if (existing && new Date(existing.timestamp) >= new Date(newEvent.timestamp)) {
              return prev
            }
            return prev.map((s) =>
              s.id === newEvent.instance_stop_id
                ? { ...s, latest_pickup: newEvent }
                : s
            )
          })
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error(`Realtime pickup subscription ${status} — polling is active as fallback`)
        }
      })

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
    setStops((prev) =>
      prev.map((s) =>
        s.id === stopId
          ? {
              ...s,
              latest_pickup: {
                id: 0,
                instance_stop_id: stopId,
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
  }

  const handleReorder = async (updates: BatchStopOrderUpdate[]) => {
    try {
      // Reorder directly via Supabase
      for (const update of updates) {
        await supabase
          .from('instance_stops')
          .update({ stop_order: update.stop_order })
          .eq('id', update.stop_id)
      }
    } catch {
      console.error('Failed to save reorder')
      loadStops()
    }
  }

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

  if (!driverInitials) {
    return (
      <InitialsPrompt
        onStart={handleStartRoute}
        routeId={routeId}
        stopCount={stops.length}
      />
    )
  }

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
