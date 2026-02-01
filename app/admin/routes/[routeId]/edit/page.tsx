'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Route, StopWithCustomer, Customer, BatchStopOrderUpdate } from '@/lib/types'
import { fetchRouteForEdit, updateRoute } from '@/lib/data/admin-routes'
import { createStop, deleteStop, updateStop, batchUpdateStopOrders } from '@/lib/data/admin-stops'
import SortableStopList from '@/components/admin/SortableStopList'
import CustomerSelector from '@/components/admin/CustomerSelector'
import RouteForm from '@/components/admin/RouteForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ArrowLeft,
  Plus,
  Calendar,
  User,
  AlertCircle,
  Settings,
  X,
  Check
} from 'lucide-react'
import { format } from 'date-fns'
import { parseLocalDate } from '@/lib/utils'

export default function RouteEditorPage() {
  const params = useParams()
  const routeId = parseInt(params.routeId as string, 10)

  const [route, setRoute] = useState<Route | null>(null)
  const [stops, setStops] = useState<StopWithCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCustomerSelector, setShowCustomerSelector] = useState(false)
  const [showEditRoute, setShowEditRoute] = useState(false)
  const [savingRoute, setSavingRoute] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  const loadRoute = useCallback(async () => {
    if (isNaN(routeId)) {
      setError('Invalid route ID')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await fetchRouteForEdit(routeId)

    if (fetchError) {
      setError(fetchError.message)
      setRoute(null)
      setStops([])
    } else if (data) {
      setRoute(data)
      setStops(data.stops || [])
    }

    setLoading(false)
  }, [routeId])

  useEffect(() => {
    loadRoute()
  }, [loadRoute])

  const handleAddCustomer = async (customer: Customer) => {
    const nextOrder = stops.length + 1

    const { data: newStop, error: createError } = await createStop({
      route_id: routeId,
      customer_id: customer.stripe_customer_id,
      stop_order: nextOrder,
      stop_type: 'pickup',
      visible_to_driver: true,
    })

    if (createError) {
      setError(createError.message)
    } else if (newStop) {
      setStops(prev => [...prev, newStop])
    }

    setShowCustomerSelector(false)
  }

  const handleReorder = async (updates: BatchStopOrderUpdate[]) => {
    // Optimistic update
    const reorderedStops = [...stops].sort((a, b) => {
      const aUpdate = updates.find(u => u.stop_id === a.id)
      const bUpdate = updates.find(u => u.stop_id === b.id)
      return (aUpdate?.stop_order || a.stop_order) - (bUpdate?.stop_order || b.stop_order)
    }).map((stop, index) => ({
      ...stop,
      stop_order: index + 1
    }))

    setStops(reorderedStops)

    const { error: batchError } = await batchUpdateStopOrders(updates)

    if (batchError) {
      setError(batchError.message)
      // Reload to get correct order
      loadRoute()
    }
  }

  const handleDeleteStop = async (stopId: number) => {
    if (deleteConfirm !== stopId) {
      setDeleteConfirm(stopId)
      return
    }

    const { error: deleteError } = await deleteStop(stopId)

    if (deleteError) {
      setError(deleteError.message)
    } else {
      // Remove from list and recalculate orders
      const updatedStops = stops
        .filter(s => s.id !== stopId)
        .map((stop, index) => ({
          ...stop,
          stop_order: index + 1
        }))

      setStops(updatedStops)

      // Update orders in database
      if (updatedStops.length > 0) {
        const updates = updatedStops.map(s => ({
          stop_id: s.id,
          stop_order: s.stop_order
        }))
        await batchUpdateStopOrders(updates)
      }
    }

    setDeleteConfirm(null)
  }

  const handleToggleVisibility = async (stopId: number, visible: boolean) => {
    const { error: updateError } = await updateStop(stopId, {
      visible_to_driver: visible
    })

    if (updateError) {
      setError(updateError.message)
    } else {
      setStops(prev => prev.map(s =>
        s.id === stopId ? { ...s, visible_to_driver: visible } : s
      ))
    }
  }

  const handleUpdateRoute = async (data: any) => {
    setSavingRoute(true)

    const { data: updated, error: updateError } = await updateRoute(routeId, data)

    if (updateError) {
      setError(updateError.message)
    } else if (updated) {
      setRoute(updated)
      setShowEditRoute(false)
    }

    setSavingRoute(false)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error && !route) {
    return (
      <div className="space-y-6">
        <Link href="/admin/routes">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Routes
          </Button>
        </Link>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const assignedCustomerIds = stops.map(s => s.customer_id)

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/admin/routes">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Routes
        </Button>
      </Link>

      {/* Route Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-ios-title-1 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-fxbg-green" />
                {route?.date && parseLocalDate(route.date)
                  ? format(parseLocalDate(route.date)!, 'EEEE, MMMM d, yyyy')
                  : 'No date set'}
              </CardTitle>
              {route?.driver && (
                <p className="text-ios-body text-gray-600 mt-1 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {route.driver}
                </p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditRoute(!showEditRoute)}
            >
              {showEditRoute ? (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Details
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        {showEditRoute && route && (
          <CardContent className="border-t">
            <RouteForm
              initialData={route}
              onSubmit={handleUpdateRoute}
              submitLabel="Save Changes"
              isLoading={savingRoute}
            />
          </CardContent>
        )}
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <Alert>
          <AlertDescription className="flex items-center justify-between">
            <span>Remove this stop from the route?</span>
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
                onClick={() => handleDeleteStop(deleteConfirm)}
              >
                Remove
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Stops Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-ios-title-2 font-semibold">
            Stops ({stops.length})
          </h2>
          <Button
            onClick={() => setShowCustomerSelector(true)}
            className="bg-fxbg-green hover:bg-fxbg-green/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
          </Button>
        </div>

        <SortableStopList
          stops={stops}
          onReorder={handleReorder}
          onDelete={handleDeleteStop}
          onToggleVisibility={handleToggleVisibility}
        />
      </div>

      {/* Customer Selector Modal */}
      {showCustomerSelector && (
        <CustomerSelector
          onSelect={handleAddCustomer}
          onClose={() => setShowCustomerSelector(false)}
          excludeCustomerIds={assignedCustomerIds}
        />
      )}
    </div>
  )
}
