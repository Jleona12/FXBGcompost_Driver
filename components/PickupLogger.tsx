'use client'

import { useState } from 'react'
import { validateDriverInitials } from '@/lib/utils'
import { PickupEventPayload } from '@/lib/types'
import { createPickupEvent } from '@/lib/data/pickups'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, Loader2 } from 'lucide-react'

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

    const result = await createPickupEvent(payload)

    if (!result.success) {
      setError(result.error || 'Failed to log pickup')
      setLoading(false)
      return
    }

    // Handle offline message
    if (result.offline) {
      setError(result.error || null) // "Saved offline..."
    }

    setSuccess(true)

    // Reset form
    setInitials('')
    setNotes('')
    setCompleted(false)
    setLoading(false)

    if (onSuccess) {
      onSuccess()
    }
  }

  if (success) {
    return (
      <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800 dark:text-green-200">
          Pickup logged successfully!
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="initials" className="text-ios-footnote font-semibold text-ios-label-secondary uppercase tracking-wide">
          Driver Initials *
        </Label>
        <Input
          id="initials"
          type="text"
          value={initials}
          onChange={(e) => handleInitialsChange(e.target.value.toUpperCase())}
          placeholder="e.g., JD"
          maxLength={3}
          disabled={loading}
          className={`h-11 ${initialsError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
          aria-invalid={!!initialsError}
          aria-describedby={initialsError ? 'initials-error' : undefined}
        />
        {initialsError && (
          <p id="initials-error" className="text-red-600 text-ios-footnote font-medium">
            {initialsError}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes" className="text-ios-footnote font-semibold text-ios-label-secondary uppercase tracking-wide">
          Notes (Optional)
        </Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g., No bucket, left at door"
          rows={3}
          disabled={loading}
          className="resize-none"
        />
      </div>

      <div className="flex items-center gap-3 p-4 bg-ios-bg-secondary rounded-lg">
        <Checkbox
          id="completion"
          checked={completed}
          onCheckedChange={(checked) => setCompleted(checked === true)}
          disabled={loading}
          className="h-5 w-5"
        />
        <Label htmlFor="completion" className="text-ios-body font-medium text-fxbg-dark-brown cursor-pointer select-none">
          Pickup Complete
        </Label>
      </div>

      {error && (
        <Alert variant={error.includes('offline') ? 'default' : 'destructive'}>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full min-h-[48px] text-ios-body font-semibold"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Logging...
          </>
        ) : (
          'Log Pickup'
        )}
      </Button>
    </form>
  )
}
