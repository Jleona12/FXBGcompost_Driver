'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { RouteWithStopCount } from '@/lib/types'
import { fetchAdminRoutes, deleteRoute } from '@/lib/data/admin-routes'
import RouteCard from '@/components/admin/RouteCard'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Route, Plus, AlertCircle, RefreshCw } from 'lucide-react'

export default function RoutesPage() {
  const [routes, setRoutes] = useState<RouteWithStopCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  const loadRoutes = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await fetchAdminRoutes()

    if (fetchError) {
      setError(fetchError.message)
      setRoutes([])
    } else {
      setRoutes(data || [])
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    loadRoutes()
  }, [loadRoutes])

  const handleDelete = async (routeId: number) => {
    if (deleteConfirm !== routeId) {
      setDeleteConfirm(routeId)
      return
    }

    const { error: deleteError } = await deleteRoute(routeId)

    if (deleteError) {
      setError(deleteError.message)
    } else {
      setRoutes(prev => prev.filter(r => r.id !== routeId))
    }

    setDeleteConfirm(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-ios-large-title font-bold text-gray-900">Routes</h1>
          <p className="text-ios-body text-gray-600 mt-1">
            Manage pickup routes and assign customers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={loadRoutes}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Link href="/admin/routes/new">
            <Button className="bg-fxbg-green hover:bg-fxbg-green/90">
              <Plus className="w-4 h-4 mr-2" />
              New Route
            </Button>
          </Link>
        </div>
      </div>

      {/* Delete confirmation */}
      {deleteConfirm && (
        <Alert>
          <AlertDescription className="flex items-center justify-between">
            <span>Are you sure you want to delete this route? This will also remove all stops.</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(deleteConfirm)}
              >
                Delete
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      )}

      {/* Route List */}
      {!loading && !error && routes.length > 0 && (
        <div className="space-y-3">
          <p className="text-ios-footnote text-gray-500">
            {routes.length} route{routes.length !== 1 ? 's' : ''}
          </p>
          {routes.map((route) => (
            <RouteCard
              key={route.id}
              route={route}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && routes.length === 0 && (
        <div className="text-center py-12">
          <Route className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-ios-headline text-gray-900 mb-1">No routes yet</h3>
          <p className="text-ios-body text-gray-500 mb-4">
            Create your first route to start assigning customers
          </p>
          <Link href="/admin/routes/new">
            <Button className="bg-fxbg-green hover:bg-fxbg-green/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Route
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
