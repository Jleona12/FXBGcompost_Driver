'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { StopWithCustomer } from '@/lib/types'
import StopList from '@/components/StopList'
import MapWidget from '@/components/MapWidget'

export default function RoutePage() {
  const params = useParams()
  const router = useRouter()
  const routeId = params?.routeId as string

  const [stops, setStops] = useState<StopWithCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStopId, setSelectedStopId] = useState<number | undefined>()

  useEffect(() => {
    if (routeId) {
      // Validate routeId is a valid number
      const routeIdNum = Number(routeId)
      if (isNaN(routeIdNum) || routeIdNum < 1) {
        setError('Invalid route ID')
        setLoading(false)
        return
      }
      fetchStops()
    }
  }, [routeId])

  async function fetchStops() {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/routes/${routeId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch stops')
      }

      const data = await response.json()
      setStops(data)
    } catch (err) {
      console.error('Error fetching stops:', err)
      setError('Failed to load route stops. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleStopClick = (stopId: number) => {
    setSelectedStopId(stopId)
    // Scroll to stop card
    const element = document.getElementById(`stop-${stopId}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-ios-bg-secondary">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-center items-center py-12">
            <div className="spinner w-12 h-12 border-4 border-fxbg-green border-t-transparent rounded-full"></div>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-ios-bg-secondary">
        <div className="container mx-auto px-4 py-6">
          <div className="error-message">
            <p>{error}</p>
            <button onClick={fetchStops} className="btn-secondary mt-2">
              Retry
            </button>
            <button onClick={() => router.push('/')} className="btn-secondary mt-2 ml-2">
              Back to Routes
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-ios-bg-secondary">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push('/')}
            className="w-10 h-10 flex items-center justify-center bg-ios-bg-secondary rounded-full transition-colors hover:bg-ios-bg-tertiary active:scale-95"
            aria-label="Back to routes"
          >
            <svg className="w-6 h-6 text-ios-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-ios-title-1 font-bold text-fxbg-dark-brown tracking-tight">
              Route {routeId}
            </h1>
            <p className="text-ios-subheadline text-ios-label-secondary">
              {stops.length} stop{stops.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Map Widget */}
        {stops.length > 0 && (
          <div className="mb-6">
            <MapWidget
              stops={stops}
              selectedStopId={selectedStopId}
              onStopClick={handleStopClick}
            />
          </div>
        )}

        {/* Stop List */}
        <StopList stops={stops} />
      </div>
    </main>
  )
}
