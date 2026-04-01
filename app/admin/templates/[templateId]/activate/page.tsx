'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { RouteTemplate, TemplateStopWithCustomer, Customer } from '@/lib/types'
import { fetchTemplateForEdit, activateTemplate } from '@/lib/data/templates'
import CustomerSelector from '@/components/admin/CustomerSelector'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ArrowLeft,
  AlertCircle,
  Loader2,
  Play,
  X,
  Eye,
  EyeOff,
  GripVertical,
  MapPin,
  Plus,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'

interface ActivationStop {
  template_stop_id: number
  customer_id: string
  customer_name: string
  customer_address?: string
  stop_order: number
  stop_type: string
  driver_notes?: string
  visible_to_driver: boolean
  included: boolean  // whether to include in this instance
}

export default function ActivateTemplatePage() {
  const params = useParams()
  const router = useRouter()
  const templateId = parseInt(params.templateId as string, 10)

  const [template, setTemplate] = useState<RouteTemplate | null>(null)
  const [activationStops, setActivationStops] = useState<ActivationStop[]>([])
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(true)
  const [activating, setActivating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCustomerSelector, setShowCustomerSelector] = useState(false)

  const loadTemplate = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await fetchTemplateForEdit(templateId)

    if (fetchError) {
      setError(fetchError.message)
    } else if (data) {
      setTemplate(data)
      setActivationStops(
        (data.stops || []).map((s: TemplateStopWithCustomer) => ({
          template_stop_id: s.id,
          customer_id: s.customer_id,
          customer_name: s.customer.name,
          customer_address: s.customer.address,
          stop_order: s.stop_order,
          stop_type: s.stop_type,
          driver_notes: s.driver_notes,
          visible_to_driver: true,
          included: true,
        }))
      )
    }

    setLoading(false)
  }, [templateId])

  useEffect(() => {
    loadTemplate()
  }, [loadTemplate])

  const toggleIncluded = (index: number) => {
    setActivationStops(prev =>
      prev.map((s, i) => i === index ? { ...s, included: !s.included } : s)
    )
  }

  const moveStop = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= activationStops.length) return

    setActivationStops(prev => {
      const arr = [...prev]
      const temp = arr[index]
      arr[index] = arr[newIndex]
      arr[newIndex] = temp
      return arr.map((s, i) => ({ ...s, stop_order: i + 1 }))
    })
  }

  const handleAddCustomer = (customer: Customer) => {
    setActivationStops(prev => [
      ...prev,
      {
        template_stop_id: 0, // no template stop for ad-hoc additions
        customer_id: customer.stripe_customer_id,
        customer_name: customer.name,
        customer_address: customer.address,
        stop_order: prev.length + 1,
        stop_type: 'pickup',
        driver_notes: undefined,
        visible_to_driver: true,
        included: true,
      },
    ])
    setShowCustomerSelector(false)
  }

  const removeStop = (index: number) => {
    setActivationStops(prev =>
      prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, stop_order: i + 1 }))
    )
  }

  const handleActivate = async () => {
    const includedStops = activationStops.filter(s => s.included)
    if (includedStops.length === 0) {
      setError('Include at least one stop')
      return
    }
    if (!date) {
      setError('Date is required')
      return
    }

    setActivating(true)
    setError(null)

    const { error: activateError } = await activateTemplate(templateId, {
      date,
      stops: includedStops.map((s, i) => ({
        template_stop_id: s.template_stop_id || undefined,
        customer_id: s.customer_id,
        stop_order: i + 1,
        stop_type: s.stop_type,
        driver_notes: s.driver_notes,
        visible_to_driver: s.visible_to_driver,
      })),
    })

    if (activateError) {
      setError(activateError.message)
      setActivating(false)
      return
    }

    router.push('/admin/templates')
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

  const includedCount = activationStops.filter(s => s.included).length
  const assignedCustomerIds = activationStops.map(s => s.customer_id)

  return (
    <div className="space-y-6">
      <Link href="/admin/templates">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Templates
        </Button>
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-ios-large-title font-bold text-gray-900">
          Start Route
        </h1>
        <p className="text-ios-body text-gray-600 mt-1">
          Review and customize <strong>{template?.name}</strong> before activating
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Date picker */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            <Label htmlFor="route-date">Route Date</Label>
            <Input
              id="route-date"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              disabled={activating}
            />
          </div>
        </CardContent>
      </Card>

      {/* Stop list — editable */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-ios-title-2 font-semibold">
            Stops ({includedCount} of {activationStops.length})
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCustomerSelector(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>

        <div className="space-y-2">
          {activationStops.map((stop, index) => (
            <Card
              key={`${stop.customer_id}-${index}`}
              className={`transition-opacity ${!stop.included ? 'opacity-40' : ''}`}
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  {/* Reorder buttons */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => moveStop(index, 'up')}
                      disabled={index === 0}
                      className="p-0.5 text-gray-300 hover:text-gray-500 disabled:invisible"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveStop(index, 'down')}
                      disabled={index === activationStops.length - 1}
                      className="p-0.5 text-gray-300 hover:text-gray-500 disabled:invisible"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Stop number */}
                  <div className="w-7 h-7 rounded-full bg-fxbg-green flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-white">{index + 1}</span>
                  </div>

                  {/* Customer info */}
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-sm text-gray-900 truncate block">
                      {stop.customer_name}
                    </span>
                    {stop.customer_address && (
                      <span className="text-xs text-gray-500 truncate block">
                        {stop.customer_address}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400"
                    onClick={() => toggleIncluded(index)}
                    title={stop.included ? 'Skip this stop' : 'Include this stop'}
                  >
                    {stop.included ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-red-500"
                    onClick={() => removeStop(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {activationStops.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
            <p className="text-ios-body text-gray-500">No stops in this template</p>
          </div>
        )}
      </div>

      {/* Activate button */}
      <Button
        onClick={handleActivate}
        disabled={activating || includedCount === 0}
        className="w-full min-h-[56px] text-ios-title-3 font-bold bg-fxbg-green hover:bg-fxbg-green/90 text-white"
        size="lg"
      >
        {activating ? (
          <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Activating...</>
        ) : (
          <><Play className="w-5 h-5 mr-2" /> Start Route ({includedCount} stops)</>
        )}
      </Button>

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
