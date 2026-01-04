'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Route } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'

export default function RouteList() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRoutes()
  }, [])

  async function fetchRoutes() {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('routes')
        .select('id,date,driver,notes')
        .order('id', { ascending: false })

      if (fetchError) {
        console.error('Supabase error details:', fetchError)
        throw fetchError
      }

      setRoutes(data || [])
    } catch (err) {
      console.error('Error fetching routes:', err)
      setError('Failed to load routes. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="spinner w-12 h-12 border-4 border-fxbg-green border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-message">
        <p className="text-ios-body mb-3">{error}</p>
        <button onClick={fetchRoutes} className="btn-secondary">
          Retry
        </button>
      </div>
    )
  }

  if (routes.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-ios-bg-secondary flex items-center justify-center">
          <svg className="w-10 h-10 text-ios-label-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </div>
        <p className="text-ios-title-3 font-semibold text-ios-label-secondary mb-4">No routes available</p>
        <button onClick={fetchRoutes} className="btn-secondary">
          Refresh
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-ios-title-2 font-bold text-fxbg-dark-brown tracking-tight">
          Available Routes ({routes.length})
        </h2>
        <button onClick={fetchRoutes} className="btn-tertiary">
          Refresh
        </button>
      </div>

      <div className="space-y-3">
        {routes.map((route) => (
          <Link
            key={route.id}
            href={`/route/${route.id}`}
            className="block card p-4 active:scale-98 transition-transform"
          >
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <h3 className="text-ios-headline font-semibold text-fxbg-dark-brown mb-1">
                  Route {route.id}
                </h3>
                {route.date && (
                  <p className="text-ios-subheadline text-ios-label-secondary">
                    {format(new Date(route.date), 'MMMM d, yyyy')}
                  </p>
                )}
                {route.driver && (
                  <p className="text-ios-subheadline text-ios-label-secondary mt-1">
                    Driver: {route.driver}
                  </p>
                )}
              </div>
              <svg
                className="w-6 h-6 text-ios-label-tertiary flex-shrink-0 ml-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
