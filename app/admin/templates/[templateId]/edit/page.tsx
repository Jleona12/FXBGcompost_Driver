'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { RouteTemplate, TemplateStopWithCustomer, Customer, BatchStopOrderUpdate } from '@/lib/types'
import {
  fetchTemplateForEdit,
  updateTemplate,
  addTemplateStop,
  deleteTemplateStop,
  batchUpdateTemplateStopOrders,
} from '@/lib/data/templates'
import SortableStopList from '@/components/admin/SortableStopList'
import CustomerSelector from '@/components/admin/CustomerSelector'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ArrowLeft,
  Plus,
  AlertCircle,
  Settings,
  X,
  Check,
  Loader2,
} from 'lucide-react'

export default function TemplateEditorPage() {
  const params = useParams()
  const templateId = parseInt(params.templateId as string, 10)

  const [template, setTemplate] = useState<RouteTemplate | null>(null)
  const [stops, setStops] = useState<TemplateStopWithCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCustomerSelector, setShowCustomerSelector] = useState(false)
  const [showEditDetails, setShowEditDetails] = useState(false)
  const [editName, setEditName] = useState('')
  const [savingDetails, setSavingDetails] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  const loadTemplate = useCallback(async () => {
    if (isNaN(templateId)) {
      setError('Invalid template ID')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await fetchTemplateForEdit(templateId)

    if (fetchError) {
      setError(fetchError.message)
    } else if (data) {
      setTemplate(data)
      setStops(data.stops || [])
      setEditName(data.name)
    }

    setLoading(false)
  }, [templateId])

  useEffect(() => {
    loadTemplate()
  }, [loadTemplate])

  const handleAddCustomer = async (customer: Customer) => {
    const nextOrder = stops.length + 1

    const { data: newStop, error: createError } = await addTemplateStop(templateId, {
      customer_id: customer.stripe_customer_id,
      stop_order: nextOrder,
      stop_type: 'pickup',
    })

    if (createError) {
      setError(createError.message)
    } else if (newStop) {
      setStops(prev => [...prev, newStop])
    }

    setShowCustomerSelector(false)
  }

  const stopsForList = stops.map(s => ({
    id: s.id,
    stop_type: s.stop_type,
    stop_order: s.stop_order,
    flags: s.driver_notes || undefined,
    customer: s.customer,
  }))

  const handleReorder = async (updates: BatchStopOrderUpdate[]) => {
    const reordered = [...stops].sort((a, b) => {
      const aU = updates.find(u => u.stop_id === a.id)
      const bU = updates.find(u => u.stop_id === b.id)
      return (aU?.stop_order || a.stop_order) - (bU?.stop_order || b.stop_order)
    }).map((stop, i) => ({ ...stop, stop_order: i + 1 }))

    setStops(reordered)

    const { error: batchError } = await batchUpdateTemplateStopOrders(templateId, updates)
    if (batchError) {
      setError(batchError.message)
      loadTemplate()
    }
  }

  const handleDeleteStop = async (stopId: number) => {
    if (deleteConfirm !== stopId) {
      setDeleteConfirm(stopId)
      return
    }

    const { error: delError } = await deleteTemplateStop(templateId, stopId)
    if (delError) {
      setError(delError.message)
    } else {
      const updated = stops
        .filter(s => s.id !== stopId)
        .map((s, i) => ({ ...s, stop_order: i + 1 }))
      setStops(updated)

      if (updated.length > 0) {
        await batchUpdateTemplateStopOrders(
          templateId,
          updated.map(s => ({ stop_id: s.id, stop_order: s.stop_order }))
        )
      }
    }
    setDeleteConfirm(null)
  }

  const handleSaveDetails = async () => {
    setSavingDetails(true)
    const { error: updateError } = await updateTemplate(templateId, {
      name: editName.trim(),
    })
    if (updateError) {
      setError(updateError.message)
    } else {
      setTemplate(prev => prev ? { ...prev, name: editName.trim() } : prev)
      setShowEditDetails(false)
    }
    setSavingDetails(false)
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

  if (error && !template) {
    return (
      <div className="space-y-6">
        <Link href="/admin/templates">
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
      <Link href="/admin/templates">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Routes
        </Button>
      </Link>

      {/* Template Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-ios-title-1">
                {template?.name}
              </CardTitle>
              <p className="text-ios-body text-gray-600 mt-1">
                {stops.length} stop{stops.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditDetails(!showEditDetails)}
            >
              {showEditDetails ? (
                <><X className="w-4 h-4 mr-2" /> Cancel</>
              ) : (
                <><Settings className="w-4 h-4 mr-2" /> Edit</>
              )}
            </Button>
          </div>
        </CardHeader>

        {showEditDetails && (
          <CardContent className="border-t space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Route Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                disabled={savingDetails}
              />
            </div>
            <Button
              onClick={handleSaveDetails}
              disabled={savingDetails}
              className="bg-fxbg-green hover:bg-fxbg-green/90"
            >
              {savingDetails ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </CardContent>
        )}
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {deleteConfirm && (
        <Alert>
          <AlertDescription className="flex items-center justify-between">
            <span>Remove this stop from the route?</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleDeleteStop(deleteConfirm)}>
                Remove
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Stops */}
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
          stops={stopsForList}
          onReorder={handleReorder}
          onDelete={handleDeleteStop}
          onToggleVisibility={() => {}}
        />
      </div>

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
