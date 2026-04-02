'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { InstanceForDriver } from '@/lib/types'
import { fetchActiveInstances } from '@/lib/data/instances'
import { format } from 'date-fns'
import { parseLocalDate } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { MapPin, RefreshCw, ChevronRight, Map, Calendar } from 'lucide-react'

export default function RouteList() {
  const [instances, setInstances] = useState<InstanceForDriver[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadInstances()
  }, [])

  async function loadInstances() {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await fetchActiveInstances()

      if (fetchError) {
        setError('Failed to load routes. Please try again.')
        return
      }

      setInstances(data || [])
    } catch (err) {
      console.error('Error loading instances:', err)
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
