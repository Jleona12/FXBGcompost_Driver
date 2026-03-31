'use client'

import { StopWithStatus } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  CheckCircle2,
  XCircle,
  MapPin,
  ChevronRight,
  ArrowLeft,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react'
import { getMapLink } from '@/lib/utils'

interface StopListProps {
  stops: StopWithStatus[]
  driverInitials: string
  onSelectStop: (index: number) => void
  onBackToRoutes: () => void
  onRefresh: () => void
}

export default function StopList({
  stops,
  driverInitials,
  onSelectStop,
  onBackToRoutes,
  onRefresh,
}: StopListProps) {
  const collected = stops.filter((s) => s.latest_pickup?.completed === true).length
  const failed = stops.filter((s) => s.latest_pickup && !s.latest_pickup.completed).length
  const remaining = stops.length - collected - failed

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
                  style={{ width: `${(collected / stops.length) * 100}%` }}
                />
              )}
              {failed > 0 && (
                <div
                  className="h-full bg-red-400 transition-all duration-300"
                  style={{ width: `${(failed / stops.length) * 100}%` }}
                />
              )}
            </div>
          </div>
          <span className="text-ios-subheadline font-bold text-gray-700 tabular-nums whitespace-nowrap">
            {collected} / {stops.length}
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
              Route complete! All {stops.length} stops handled.
            </AlertDescription>
          </Alert>
        )}

        {/* Stop List */}
        <div className="space-y-2">
          {stops.map((stop, index) => {
            const pickup = stop.latest_pickup
            const isCollected = pickup?.completed === true
            const isFailed = pickup != null && !pickup.completed
            const mapLink = getMapLink(stop.customer.address)

            return (
              <Card
                key={stop.id}
                className={`active:scale-[0.98] transition-all cursor-pointer ${
                  isCollected
                    ? 'border-l-4 border-l-fxbg-green bg-green-50/50'
                    : isFailed
                    ? 'border-l-4 border-l-red-400 bg-red-50/50'
                    : 'border-l-4 border-l-gray-200'
                }`}
                onClick={() => onSelectStop(index)}
              >
                <div className="p-4">
                  <div className="flex items-center gap-3">
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

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-ios-body font-semibold truncate ${
                            isCollected ? 'text-gray-500' : 'text-gray-900'
                          }`}
                        >
                          {stop.customer.name}
                        </span>
                        {stop.flags && stop.flags.trim() && (
                          <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                        )}
                      </div>

                      {/* Address as maps link */}
                      {stop.customer.address && (
                        <a
                          href={mapLink || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-ios-footnote text-gray-500 truncate block hover:text-fxbg-green"
                        >
                          <MapPin className="w-3 h-3 inline mr-1" />
                          {stop.customer.address}
                        </a>
                      )}

                      {/* Pickup info */}
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
                    <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
