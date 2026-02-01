'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GripVertical, MapPin, Phone, Trash2, Eye, EyeOff } from 'lucide-react'
import { StopWithCustomer } from '@/lib/types'
import { formatPhoneNumber } from '@/lib/utils'

interface SortableStopCardProps {
  stop: StopWithCustomer
  onDelete: (stopId: number) => void
  onToggleVisibility: (stopId: number, visible: boolean) => void
}

export default function SortableStopCard({
  stop,
  onDelete,
  onToggleVisibility
}: SortableStopCardProps) {
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
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={`${isDragging ? 'shadow-lg' : ''} ${!stop.visible_to_driver ? 'opacity-60' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Drag handle */}
            <button
              className="mt-1 p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing touch-none"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="w-5 h-5" />
            </button>

            {/* Stop number */}
            <div className="w-8 h-8 rounded-full bg-fxbg-green flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-white">{stop.stop_order}</span>
            </div>

            {/* Customer info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-ios-headline text-gray-900 truncate">
                {stop.customer?.name || 'Unknown Customer'}
              </h4>

              {stop.customer?.address && (
                <div className="flex items-start gap-1.5 mt-1 text-ios-subheadline text-gray-600">
                  <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span className="truncate">{stop.customer.address}</span>
                </div>
              )}

              {stop.customer?.phone && (
                <div className="flex items-center gap-1.5 mt-1 text-ios-footnote text-gray-500">
                  <Phone className="w-3 h-3" />
                  <span>{formatPhoneNumber(stop.customer.phone)}</span>
                </div>
              )}

              {/* Badges */}
              <div className="flex items-center gap-2 mt-2">
                {stop.stop_type && (
                  <Badge variant="outline" className="text-xs">
                    {stop.stop_type}
                  </Badge>
                )}
                {stop.flags && (
                  <Badge variant="secondary" className="text-xs">
                    Has instructions
                  </Badge>
                )}
                {!stop.visible_to_driver && (
                  <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                    Hidden
                  </Badge>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-400 hover:text-gray-600"
                onClick={() => onToggleVisibility(stop.id, !stop.visible_to_driver)}
                title={stop.visible_to_driver ? 'Hide from driver' : 'Show to driver'}
              >
                {stop.visible_to_driver ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-400 hover:text-red-500"
                onClick={() => onDelete(stop.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
