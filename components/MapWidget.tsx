'use client'

import { useEffect, useRef, useState } from 'react'
import { StopWithCustomer } from '@/lib/types'
import { Loader } from '@googlemaps/js-api-loader'

interface MapWidgetProps {
  stops: StopWithCustomer[]
  selectedStopId?: number
  onStopClick?: (stopId: number) => void
}

export default function MapWidget({ stops, selectedStopId, onStopClick }: MapWidgetProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [markers, setMarkers] = useState<google.maps.Marker[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      setError('Google Maps API key not configured')
      setLoading(false)
      return
    }

    const loader = new Loader({
      apiKey,
      version: 'weekly',
    })

    loader
      .load()
      .then(() => {
        if (!mapRef.current) return

        const mapInstance = new google.maps.Map(mapRef.current, {
          zoom: 12,
          center: { lat: 38.3032, lng: -77.4605 }, // Fredericksburg, VA
          mapTypeControl: false,
          streetViewControl: false,
        })

        setMap(mapInstance)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error loading Google Maps:', err)
        setError('Failed to load Google Maps')
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (!map || stops.length === 0) return

    // Clear existing markers
    markers.forEach((marker) => marker.setMap(null))

    const newMarkers: google.maps.Marker[] = []
    const bounds = new google.maps.LatLngBounds()

    // Geocode each stop address and create markers
    const geocoder = new google.maps.Geocoder()

    stops.forEach((stop) => {
      if (!stop.customer.address) return

      geocoder.geocode(
        { address: stop.customer.address },
        (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const position = results[0].geometry.location

            const marker = new google.maps.Marker({
              position,
              map,
              title: `${stop.stop_order}. ${stop.customer.name}`,
              label: {
                text: stop.stop_order.toString(),
                color: 'white',
                fontWeight: 'bold',
              },
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 22,
                fillColor: selectedStopId === stop.id ? '#7CB342' : '#0D3D0D',
                fillOpacity: 1,
                strokeColor: 'white',
                strokeWeight: 3,
              },
            })

            marker.addListener('click', () => {
              if (onStopClick) {
                onStopClick(stop.id)
              }
            })

            newMarkers.push(marker)
            bounds.extend(position)

            // Fit map to bounds after last marker
            if (newMarkers.length === stops.filter((s) => s.customer.address).length) {
              map.fitBounds(bounds)
            }
          }
        }
      )
    })

    setMarkers(newMarkers)
  }, [map, stops, selectedStopId, onStopClick])

  if (error) {
    return (
      <div className="card p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-ios-red bg-opacity-10 flex items-center justify-center">
          <svg className="w-8 h-8 text-ios-red" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-ios-body text-ios-red font-medium">{error}</p>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-ios-bg-primary bg-opacity-90 z-10 backdrop-blur-sm">
          <div className="spinner w-8 h-8 border-4 border-fxbg-green border-t-transparent rounded-full"></div>
        </div>
      )}
      <div
        ref={mapRef}
        className="w-full h-80 md:h-96"
        style={{ minHeight: '320px' }}
      />
    </div>
  )
}
