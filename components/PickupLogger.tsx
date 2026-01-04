'use client'

import { useState } from 'react'
import { validateDriverInitials, queuePickupEvent, isOnline } from '@/lib/utils'
import { PickupEventPayload } from '@/lib/types'

interface PickupLoggerProps {
  stopId: number
  onSuccess?: () => void
}

export default function PickupLogger({ stopId, onSuccess }: PickupLoggerProps) {
  const [initials, setInitials] = useState('')
  const [notes, setNotes] = useState('')
  const [completed, setCompleted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [initialsError, setInitialsError] = useState<string | null>(null)

  const handleInitialsChange = (value: string) => {
    setInitials(value)
    setInitialsError(null)
    setError(null)
  }

  const validateForm = (): boolean => {
    if (!initials.trim()) {
      setInitialsError('Driver initials are required')
      return false
    }

    if (!validateDriverInitials(initials)) {
      setInitialsError('Initials must be 2-3 alphanumeric characters')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError(null)

    const payload: PickupEventPayload = {
      stop_id: stopId,
      driver_initials: initials.trim(),
      completed: completed,
      notes: notes.trim() || undefined,
    }

    try {
      // Check if online
      if (!isOnline()) {
        // Queue the event for later sync
        queuePickupEvent(payload)
        setSuccess(true)
        setError('Saved offline. Will sync when online.')

        // Reset form
        setInitials('')
        setNotes('')
        setCompleted(false)

        if (onSuccess) {
          onSuccess()
        }
        return
      }

      // Submit to API
      const response = await fetch('/api/pickups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to log pickup')
      }

      setSuccess(true)

      // Reset form
      setInitials('')
      setNotes('')
      setCompleted(false)

      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      console.error('Error logging pickup:', err)
      setError(err instanceof Error ? err.message : 'Failed to log pickup')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="success-message">
        Pickup logged successfully!
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="initials" className="block text-ios-footnote font-semibold text-ios-label-secondary mb-2 uppercase tracking-wide">
          Driver Initials *
        </label>
        <input
          id="initials"
          type="text"
          value={initials}
          onChange={(e) => handleInitialsChange(e.target.value.toUpperCase())}
          placeholder="e.g., JD"
          maxLength={3}
          disabled={loading}
          className={`w-full ${initialsError ? 'error' : ''}`}
          aria-invalid={!!initialsError}
          aria-describedby={initialsError ? 'initials-error' : undefined}
        />
        {initialsError && (
          <p id="initials-error" className="text-ios-red text-ios-footnote mt-2 font-medium">
            {initialsError}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="notes" className="block text-ios-footnote font-semibold text-ios-label-secondary mb-2 uppercase tracking-wide">
          Notes (Optional)
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g., No bucket, left at door"
          rows={3}
          disabled={loading}
          className="w-full resize-none"
        />
      </div>

      <div className="flex items-center gap-3 p-3 bg-ios-bg-secondary rounded-lg">
        <input
          id="completion"
          type="checkbox"
          checked={completed}
          onChange={(e) => setCompleted(e.target.checked)}
          disabled={loading}
          className="cursor-pointer"
        />
        <label htmlFor="completion" className="text-ios-body font-medium text-fxbg-dark-brown cursor-pointer select-none">
          Pickup Complete
        </label>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="spinner w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span>
            Logging...
          </span>
        ) : (
          'Log Pickup'
        )}
      </button>
    </form>
  )
}
