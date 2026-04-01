'use client'

import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { StopWithStatus, BatchStopOrderUpdate } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  CheckCircle2,
  XCircle,
  ChevronRight,
  ArrowLeft,
  AlertTriangle,
  RefreshCw,
  GripVertical,
} from 'lucide-react'

interface StopListProps {
  stops: StopWithStatus[]
  driverInitials: string
  onSelectStop: (index: number) => void
  onBackToRoutes: () => void
  onRefresh: () => void
  onReorder: (updates: BatchStopOrderUpdate[]) => void
}

// Individual sortable stop row
function SortableStopRow({
  stop,
  index,
  onSelectStop,
}: {
  stop: StopWithStatus
  index: number
  onSelectStop: (index: number) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stop.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.9 : 1,
  }

  const pickup = stop.latest_pickup
  const isCollected = pickup?.completed === true
  const isFailed = pickup != null && !pickup.completed

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        className={`transition-shadow ${
          isDragging ? 'shadow-lg ring-2 ring-fxbg-green/30' : ''
        } ${
          isCollected
            ? 'border-l-4 border-l-fxbg-green bg-green-50/50'
            : isFailed
            ? 'border-l-4 border-l-red-400 bg-red-50/50'
            : 'border-l-4 border-l-gray-200'
        }`}
      >
        <div className="p-4">
          <div className="flex items-center gap-2">
            {/* Drag handle */}
            <button
              className="p-1 text-gray-300 touch-none flex-shrink-0 cursor-grab active:cursor-grabbing"
              aria-label="Drag to reorder"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="w-5 h-5" />
            </button>

            {/* Status icon */}
            <div className="flex-shrink-0">
              {isCollected ? (
                <CheckCircle2 className="w-7 h-7 text-fxbg-green" />
              ) : isFailed ? (
                <XCircle className="w-7 h-7 text-red-400" />
              ) : (
                <div className="w-7 h-7 rounded-full border-2 border-gray-300 flex items-center justify-center text-ios-footnote font-bold text-gray-400">
                  {stop.stop_order}
                </div>
              )}
            </div>

            {/* Content — tappable to open detail */}
            <div
              className="flex-1 min-w-0 cursor-pointer active:opacity-70"
              onClick={() => onSelectStop(index)}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`text-ios-body font-semibold truncate ${
                    isCollected ? 'text-gray-500' : 'text-gray-900'
                  }`}
                >
                  {stop.customer.name}
                </span>
                {stop.driver_notes && stop.driver_notes.trim() && (
                  <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                )}
              </div>

              {stop.customer.address && (
                <span className="text-ios-footnote text-gray-500 truncate block">
                  {stop.customer.address}
                </span>
              )}

              {pickup && (
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="secondary"
                    className={`text-[10px] px-1.5 py-0 ${
                      isCollected
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {pickup.driver_initials}
                  </Badge>
                  {isFailed && pickup.notes && (
                    <span className="text-[11px] text-red-500 truncate">
                      {pickup.notes}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Chevron */}
            <ChevronRight
              className="w-5 h-5 text-gray-300 flex-shrink-0 cursor-pointer"
              onClick={() => onSelectStop(index)}
            />
          </div>
        </div>
      </Card>
    </div>
  )
}

export default function StopList({
  stops,
  driverInitials,
  onSelectStop,
  onBackToRoutes,
  onRefresh,
  onReorder,
}: StopListProps) {
  const [localStops, setLocalStops] = useState(stops)

  // Sync when parent stops change (from polling or refresh)
  if (stops !== localStops && !isDraggingRef()) {
    // Only sync if the stop IDs/order actually changed
    const parentIds = stops.map((s) => s.id).join(',')
    const localIds = localStops.map((s) => s.id).join(',')
    if (parentIds !== localIds || stopsDataChanged(stops, localStops)) {
      setLocalStops(stops)
    }
  }

  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = localStops.findIndex((s) => s.id === active.id)
      const newIndex = localStops.findIndex((s) => s.id === over.id)
      const reordered = arrayMove(localStops, oldIndex, newIndex)

      // Update local state immediately
      setLocalStops(reordered)

      // Build updates with new sequential stop_order
      const updates: BatchStopOrderUpdate[] = reordered.map((stop, i) => ({
        stop_id: stop.id,
        stop_order: i + 1,
      }))

      onReorder(updates)
    }
  }

  const collected = localStops.filter((s) => s.latest_pickup?.completed === true).length
  const failed = localStops.filter((s) => s.latest_pickup && !s.latest_pickup.completed).length
  const remaining = localStops.length - collected - failed

  return (
    <div className="min-h-screen bg-ios-bg-secondary">
      {/* Header */}
      <div className="bg-white border-b border-ios-separator sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={onBackToRoutes} className="gap-1 -ml-2">
              <ArrowLeft className="w-4 h-4" />
              Routes
            </Button>
            <span className="text-ios-footnote text-ios-label-tertiary font-medium">
              {driverInitials}
            </span>
            <Button variant="ghost" size="sm" onClick={onRefresh} className="-mr-2">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 space-y-4">
        {/* Progress Summary */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden flex">
              {collected > 0 && (
                <div
                  className="h-full bg-fxbg-green transition-all duration-300"
                  style={{ width: `${(collected / localStops.length) * 100}%` }}
                />
              )}
              {failed > 0 && (
                <div
                  className="h-full bg-red-400 transition-all duration-300"
                  style={{ width: `${(failed / localStops.length) * 100}%` }}
                />
              )}
            </div>
          </div>
          <span className="text-ios-subheadline font-bold text-gray-700 tabular-nums whitespace-nowrap">
            {collected} / {localStops.length}
          </span>
        </div>

        {/* Stats row */}
        <div className="flex gap-3 text-ios-footnote font-medium">
          <span className="text-fxbg-green">{collected} collected</span>
          {failed > 0 && <span className="text-red-500">{failed} missed</span>}
          <span className="text-gray-400">{remaining} remaining</span>
        </div>

        {/* All done banner */}
        {remaining === 0 && collected > 0 && (
          <Alert className="border-fxbg-green bg-green-50">
            <CheckCircle2 className="h-5 w-5 text-fxbg-green" />
            <AlertDescription className="text-fxbg-green font-semibold">
              Route complete! All {localStops.length} stops handled.
            </AlertDescription>
          </Alert>
        )}

        {/* Sortable Stop List */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={localStops.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {localStops.map((stop, index) => (
                <SortableStopRow
                  key={stop.id}
                  stop={stop}
                  index={index}
                  onSelectStop={onSelectStop}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  )
}

// Helpers to avoid overwriting local reorder with stale polling data
let _isDragging = false
function isDraggingRef() {
  return _isDragging
}

function stopsDataChanged(a: StopWithStatus[], b: StopWithStatus[]): boolean {
  if (a.length !== b.length) return true
  for (let i = 0; i < a.length; i++) {
    const aPickup = a[i].latest_pickup
    const bPickup = b[i].latest_pickup
    if (a[i].id !== b[i].id) return true
    if (aPickup?.id !== bPickup?.id) return true
    if (aPickup?.completed !== bPickup?.completed) return true
    if (aPickup?.driver_initials !== bPickup?.driver_initials) return true
    if (aPickup?.notes !== bPickup?.notes) return true
  }
  return false
}
