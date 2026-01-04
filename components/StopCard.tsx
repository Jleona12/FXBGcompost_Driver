'use client'

import { useState } from 'react'
import { StopWithCustomer } from '@/lib/types'
import ContactWidget from './ContactWidget'
import PickupLogger from './PickupLogger'
import { getMapLink } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MapPin, AlertTriangle } from 'lucide-react'

interface StopCardProps {
  stop: StopWithCustomer
}

export default function StopCard({ stop }: StopCardProps) {
  const [showLogger, setShowLogger] = useState(false)
  const mapLink = getMapLink(stop.customer.address)

  return (
    <Card className="border-l-4 border-l-fxbg-green bg-green-50/30 dark:bg-green-950/10">
      <div className="flex gap-4 p-4">
        {/* Stop Order Badge */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-fxbg-green text-white flex items-center justify-center text-ios-title-3 font-bold shadow-md">
            {stop.stop_order}
          </div>
        </div>

        {/* Stop Details */}
        <div className="flex-1 space-y-3">
          {/* Customer Name */}
          <h3 className="text-ios-title-3 font-bold text-fxbg-dark-brown tracking-tight">
            {stop.customer.name}
          </h3>

          {/* Address */}
          {stop.customer.address && (
            <div>
              <p className="text-ios-subheadline text-ios-label-secondary mb-2">
                {stop.customer.address}
              </p>
              {mapLink && (
                <a
                  href={mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ios-footnote text-ios-blue font-semibold inline-flex items-center gap-1 hover:underline"
                >
                  <MapPin className="w-4 h-4" />
                  Open in Maps
                </a>
              )}
            </div>
          )}

          {/* Stop Type Badge */}
          <div>
            <Badge variant="secondary" className="text-xs font-bold">
              {stop.stop_type?.toUpperCase() || 'UNKNOWN'}
            </Badge>
          </div>

          {/* Flags */}
          {stop.flags && stop.flags.trim().length > 0 && (
            <Alert className="border-orange-500 bg-orange-50 dark:bg-orange-950/20">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription>
                <p className="text-ios-caption-1 font-semibold text-orange-800 dark:text-orange-200 mb-1 uppercase tracking-wide">
                  Driver Instructions
                </p>
                <p className="text-ios-footnote font-medium text-orange-700 dark:text-orange-300 whitespace-pre-wrap">
                  {stop.flags}
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* Contact Widget */}
          <div>
            <ContactWidget
              phone={stop.customer.phone}
              customerName={stop.customer.name}
            />
          </div>

          {/* Pickup Logger Toggle */}
          {!showLogger ? (
            <Button
              onClick={() => setShowLogger(true)}
              className="w-full min-h-[48px] text-ios-body font-semibold"
              size="lg"
            >
              Log Pickup
            </Button>
          ) : (
            <div className="border-t border-ios-separator pt-4 mt-4">
              <PickupLogger
                stopId={stop.id}
                onSuccess={() => {
                  // Keep logger visible after success to show success message
                  setTimeout(() => setShowLogger(false), 3000)
                }}
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
