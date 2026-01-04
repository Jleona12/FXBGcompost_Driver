'use client'

import { useState } from 'react'
import { validateDriverInitials } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { UserCircle } from 'lucide-react'

interface InitialsPromptProps {
  onStart: (initials: string) => void
  routeId: string
  stopCount: number
}

export default function InitialsPrompt({ onStart, routeId, stopCount }: InitialsPromptProps) {
  const [initials, setInitials] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!initials.trim()) {
      setError('Driver initials are required')
      return
    }

    if (!validateDriverInitials(initials)) {
      setError('Initials must be 2-3 alphanumeric characters')
      return
    }

    // Store in localStorage for convenience
    if (typeof window !== 'undefined') {
      localStorage.setItem('fxbg_driver_initials', initials.trim())
    }

    onStart(initials.trim())
  }

  return (
    <main className="min-h-screen bg-ios-bg-secondary flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-fxbg-green/10 flex items-center justify-center">
            <UserCircle className="w-12 h-12 text-fxbg-green" />
          </div>
          <h1 className="text-ios-title-1 font-bold text-fxbg-dark-brown mb-2">
            Route {routeId}
          </h1>
          <p className="text-ios-body text-ios-label-secondary">
            {stopCount} stop{stopCount !== 1 ? 's' : ''} on this route
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="initials" className="text-ios-footnote font-semibold text-ios-label-secondary uppercase tracking-wide">
              Your Initials *
            </Label>
            <Input
              id="initials"
              type="text"
              value={initials}
              onChange={(e) => {
                setInitials(e.target.value.toUpperCase())
                setError(null)
              }}
              placeholder="e.g., JD"
              maxLength={3}
              className={`h-14 text-center text-2xl font-bold tracking-wider ${error ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              autoFocus
              aria-invalid={!!error}
              aria-describedby={error ? 'initials-error' : undefined}
            />
            {error && (
              <p id="initials-error" className="text-red-600 text-ios-footnote font-medium text-center">
                {error}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full min-h-[56px] text-ios-title-3 font-bold"
            size="lg"
          >
            Start Route
          </Button>
        </form>

        <p className="text-ios-footnote text-ios-label-tertiary text-center mt-6">
          Your initials will be used to log all pickups on this route
        </p>
      </Card>
    </main>
  )
}
