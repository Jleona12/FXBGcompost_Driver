'use client'

import { StopWithCustomer } from '@/lib/types'
import StopCard from './StopCard'

interface StopListProps {
  stops: StopWithCustomer[]
}

export default function StopList({ stops }: StopListProps) {
  if (stops.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-ios-bg-secondary flex items-center justify-center">
          <svg className="w-10 h-10 text-ios-label-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <p className="text-ios-title-3 font-semibold text-ios-label-secondary">
          No stops found for this route
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-ios-title-2 font-bold text-fxbg-dark-brown tracking-tight mb-4">
        Stops ({stops.length})
      </h2>
      {stops.map((stop) => (
        <StopCard key={stop.id} stop={stop} />
      ))}
    </div>
  )
}
