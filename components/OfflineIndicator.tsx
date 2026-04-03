'use client'

import { useState, useEffect } from 'react'
import { getQueuedEvents, setQueuedEvents, isOnline } from '@/lib/utils'

export default function OfflineIndicator() {
  const [online, setOnline] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [queuedCount, setQueuedCount] = useState(0)

  useEffect(() => {
    setOnline(isOnline())
    updateQueuedCount()

    const handleOnline = () => {
      setOnline(true)
      syncQueuedEvents()
    }

    const handleOffline = () => {
      setOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    const interval = setInterval(updateQueuedCount, 5000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateQueuedCount = () => {
    setQueuedCount(getQueuedEvents().length)
  }

  const syncQueuedEvents = async () => {
    const queued = getQueuedEvents()
    if (queued.length === 0) return

    setSyncing(true)

    try {
      // Sync each event individually and track which succeeded
      const results = await Promise.allSettled(
        queued.map((event) =>
          fetch('/api/v2-pickups', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              instance_stop_id: event.instance_stop_id,
              driver_initials: event.driver_initials,
              completed: event.completed,
              notes: event.notes,
              idempotency_key: event.idempotency_key,
            }),
          })
        )
      )

      // Keep only the events that failed — discard succeeded ones
      const failed = queued.filter((_, i) => {
        const result = results[i]
        return result.status === 'rejected' || !result.value.ok
      })

      setQueuedEvents(failed)
      updateQueuedCount()
    } catch (error) {
      console.error('Failed to sync queued events:', error)
    } finally {
      setSyncing(false)
    }
  }

  if (online && queuedCount === 0) {
    return null
  }

  if (!online) {
    return (
      <div className="offline-banner">
        <div className="flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-ios-subheadline font-semibold">
            Offline Mode
            {queuedCount > 0 && ` - ${queuedCount} event${queuedCount > 1 ? 's' : ''} queued`}
          </span>
        </div>
      </div>
    )
  }

  if (queuedCount > 0) {
    return (
      <div className="bg-fxbg-green-light border-b border-ios-separator py-3 px-4 sticky top-0 z-50">
        <div className="flex items-center justify-center gap-3">
          {syncing ? (
            <>
              <span className="spinner w-4 h-4 border-2 border-fxbg-green border-t-transparent rounded-full"></span>
              <span className="text-ios-subheadline font-semibold text-fxbg-green">
                Syncing {queuedCount} event{queuedCount > 1 ? 's' : ''}...
              </span>
            </>
          ) : (
            <>
              <span className="text-ios-subheadline font-semibold text-fxbg-green">
                {queuedCount} event{queuedCount > 1 ? 's' : ''} pending sync
              </span>
              <button
                onClick={syncQueuedEvents}
                className="btn-tertiary text-ios-footnote py-1.5 px-3 bg-fxbg-green text-white min-h-0"
              >
                Sync Now
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  return null
}
