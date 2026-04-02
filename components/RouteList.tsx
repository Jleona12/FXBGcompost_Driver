'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import { parseLocalDate, getTodayEastern } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { MapPin, RefreshCw, ChevronRight, Map, Calendar } from 'lucide-react'

interface RouteInstance {
  id: number
  template_id: number
  date: string
  status: string
  template_name: string
  stop_count: number
}

export default function RouteList() {
  const [instances, setInstances] = useState<RouteInstance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const initialLoad = useRef(true)

  const loadInstances = useCallback(async () => {
    try {
      if (initialLoad.current) setLoading(true)
      setError(null)

      const today = getTodayEastern()

      // Query Supabase directly — no API route, no caching layers
      const { data: rows, error: dbError } = await supabase
        .from('route_instances')
        .select('id, template_id, date, status, created_at, template:route_templates(name)')
        .eq('status', 'active')
        .gte('date', today)
        .order('date', { ascending: true })

      if (dbError) {
        console.error('Supabase error:', dbError)
        setError('Failed to load routes.')
        return
      }

      if (!rows || rows.length === 0) {
        setInstances([])
        return
      }

      // Get stop counts
      const ids = rows.map((r: any) => r.id)
      const { data: stops } = await supabase
        .from('instance_stops')
        .select('instance_id')
        .in('instance_id', ids)

      const countMap: Record<number, number> = {}
      for (const s of stops || []) {
        countMap[s.instance_id] = (countMap[s.instance_id] || 0) + 1
      }

      const result: RouteInstance[] = rows.map((r: any) => ({
        id: r.id,
        template_id: r.template_id,
        date: r.date,
        status: r.status,
        template_name: (r.template as any)?.name || 'Route',
        stop_count: countMap[r.id] || 0,
      }))

      setInstances(result)
    } catch (err) {
      console.error('Error loading instances:', err)
      setError('Failed to load routes.')
    } finally {
      setLoading(false)
      initialLoad.current = false
    }
  }, [])

  // Load on mount + subscribe to Realtime for instant updates
  useEffect(() => {
    loadInstances()

    // Realtime: reload whenever route_instances changes (INSERT, UPDATE, DELETE)
    const channel = supabase
      .channel('driver-route-list')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'route_instances' },
        () => {
          loadInstances()
        }
      )
      .subscribe()

    // Also poll every 30s as a fallback
    const interval = setInterval(loadInstances, 30_000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [loadInstances])

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
          <Button variant="outline" size="sm" onClick={loadInstances} className="ml-3">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (instances.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-ios-bg-secondary flex items-center justify-center">
          <Map className="w-10 h-10 text-ios-label-tertiary" />
        </div>
        <p className="text-ios-title-3 font-semibold text-gray-500 mb-4">
          No active routes
        </p>
        <p className="text-ios-body text-gray-400 mb-4">
          Waiting for admin to send a route
        </p>
        <Button variant="outline" onClick={loadInstances}>
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
          Active Routes ({instances.length})
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={loadInstances}
          className="text-ios-subheadline"
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Refresh
        </Button>
      </div>

      <div className="space-y-3">
        {instances.map((instance) => (
          <Link key={instance.id} href={`/route/${instance.id}`}>
            <Card className="p-4 hover:bg-accent/50 active:scale-[0.98] transition-all cursor-pointer">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <h3 className="text-ios-headline font-semibold text-gray-900 mb-1 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-fxbg-green" />
                    {instance.template_name}
                  </h3>
                  {instance.date && parseLocalDate(instance.date) && (
                    <p className="text-ios-subheadline text-gray-600 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {format(parseLocalDate(instance.date)!, 'EEEE, MMMM d')}
                    </p>
                  )}
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {instance.stop_count} stop{instance.stop_count !== 1 ? 's' : ''}
                  </Badge>
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
