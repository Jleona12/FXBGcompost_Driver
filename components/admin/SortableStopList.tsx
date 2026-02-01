'use client'

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { StopWithCustomer, BatchStopOrderUpdate } from '@/lib/types'
import SortableStopCard from './SortableStopCard'
import { MapPin } from 'lucide-react'

interface SortableStopListProps {
  stops: StopWithCustomer[]
  onReorder: (updates: BatchStopOrderUpdate[]) => void
  onDelete: (stopId: number) => void
  onToggleVisibility: (stopId: number, visible: boolean) => void
}

export default function SortableStopList({
  stops,
  onReorder,
  onDelete,
  onToggleVisibility
}: SortableStopListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = stops.findIndex((s) => s.id === active.id)
      const newIndex = stops.findIndex((s) => s.id === over.id)

      const reorderedStops = arrayMove(stops, oldIndex, newIndex)

      // Create updates with new sequential stop_order values
      const updates: BatchStopOrderUpdate[] = reorderedStops.map((stop, index) => ({
        stop_id: stop.id,
        stop_order: index + 1,
      }))

      onReorder(updates)
    }
  }

  if (stops.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
        <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-ios-body text-gray-500">No stops yet</p>
        <p className="text-ios-footnote text-gray-400 mt-1">
          Add customers to this route to create stops
        </p>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={stops.map((s) => s.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {stops.map((stop) => (
            <SortableStopCard
              key={stop.id}
              stop={stop}
              onDelete={onDelete}
              onToggleVisibility={onToggleVisibility}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
