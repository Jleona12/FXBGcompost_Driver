'use client'

import { useState } from 'react'
import { StopWithCustomer } from '@/lib/types'
import ContactWidget from './ContactWidget'
import PickupLogger from './PickupLogger'
import { getMapLink } from '@/lib/utils'

interface StopCardProps {
  stop: StopWithCustomer
}

export default function StopCard({ stop }: StopCardProps) {
  const [showLogger, setShowLogger] = useState(false)
  const mapLink = getMapLink(stop.customer.address)

  return (
    <div className="card card-green p-4">
      <div className="flex gap-4">
        {/* Stop Order Badge */}
        <div className="stop-order">
          {stop.stop_order}
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
                  className="text-ios-footnote text-ios-blue font-semibold inline-flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Open in Maps
                </a>
              )}
            </div>
          )}

          {/* Stop Type Badge */}
          <div>
            <span className="badge">
              {stop.stop_type.toUpperCase()}
            </span>
          </div>

          {/* Flags */}
          {stop.flags && stop.flags.trim().length > 0 && (
            <div>
              <p className="text-ios-caption-1 font-semibold text-ios-label-secondary mb-2 uppercase tracking-wide">
                Driver Instructions
              </p>
              <div className="p-3 bg-ios-orange bg-opacity-10 rounded-lg">
                <p className="text-ios-footnote font-medium text-ios-orange whitespace-pre-wrap">
                  {stop.flags}
                </p>
              </div>
            </div>
          )}

          {/* Stop Notes */}
          {stop.notes && (
            <div className="p-3 bg-ios-bg-secondary rounded-lg">
              <p className="text-ios-caption-1 font-semibold text-ios-label-secondary mb-1 uppercase tracking-wide">
                Stop Notes
              </p>
              <p className="text-ios-subheadline text-fxbg-dark-brown">{stop.notes}</p>
            </div>
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
            <button
              onClick={() => setShowLogger(true)}
              className="btn-primary w-full"
            >
              Log Pickup
            </button>
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
    </div>
  )
}
