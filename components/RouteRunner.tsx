'use client'

import { useState } from 'react'
import { StopWithCustomer } from '@/lib/types'
import { createPickupEvent } from '@/lib/data/pickups'
import { PickupEventPayload } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  AlertTriangle,
  Phone,
  MessageSquare,
  Loader2,
  CheckCircle2,
  Flag
} from 'lucide-react'
import { formatPhoneNumber, getPhoneLink, getSmsLink, getMapLink } from '@/lib/utils'

interface RouteRunnerProps {
  stops: StopWithCustomer[]
  driverInitials: string
  onComplete: () => void
}

export default function RouteRunner({ stops, driverInitials, onComplete }: RouteRunnerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [notes, setNotes] = useState('')
  const [showFlagForm, setShowFlagForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentStop = stops[currentIndex]
  const isLastStop = currentIndex === stops.length - 1
  const isFirstStop = currentIndex === 0

  const handleSuccess = async () => {
    await logPickup(true, notes.trim() || undefined)
  }

  const handleFlag = async () => {
    if (!notes.trim()) {
      setError('Please provide a reason for the issue')
      return
    }
    await logPickup(false, notes.trim())
  }

  const logPickup = async (completed: boolean, pickupNotes?: string) => {
    setLoading(true)
    setError(null)

    const payload: PickupEventPayload = {
      stop_id: currentStop.id,
      driver_initials: driverInitials,
      completed,
      notes: pickupNotes,
    }

    const result = await createPickupEvent(payload)

    if (!result.success && !result.offline) {
      setError(result.error || 'Failed to log pickup')
      setLoading(false)
      return
    }

    // Show offline message if applicable
    if (result.offline) {
      setError(result.error || null)
    }

    setLoading(false)

    // Advance to next stop or complete
    if (isLastStop) {
      onComplete()
    } else {
      setCurrentIndex(currentIndex + 1)
      setNotes('')
      setShowFlagForm(false)
      setError(null)
    }
  }

  const handlePrevious = () => {
    if (!isFirstStop) {
      setCurrentIndex(currentIndex - 1)
      setNotes('')
      setShowFlagForm(false)
      setError(null)
    }
  }

  const mapLink = getMapLink(currentStop.customer.address)
  const phoneLink = getPhoneLink(currentStop.customer.phone)
  const smsLink = getSmsLink(currentStop.customer.phone)
  const formattedPhone = formatPhoneNumber(currentStop.customer.phone)

  return (
    <div className="min-h-screen bg-ios-bg-secondary flex flex-col">
      {/* Progress Header */}
      <div className="bg-white border-b border-ios-separator sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-ios-footnote font-bold">
                Stop {currentIndex + 1} of {stops.length}
              </Badge>
              <span className="text-ios-footnote text-ios-label-tertiary">
                {driverInitials}
              </span>
            </div>
            <div className="flex-1 mx-4">
              <div className="h-2 bg-ios-bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-fxbg-green transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / stops.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stop Content */}
      <div className="flex-1 container mx-auto px-4 py-6 pb-32">
        <Card className="border-l-4 border-l-fxbg-green">
          <div className="p-6 space-y-4">
            {/* Stop Number Badge */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-fxbg-green text-white flex items-center justify-center text-ios-title-2 font-bold shadow-md flex-shrink-0">
                {currentStop.stop_order}
              </div>
              <div className="flex-1">
                <h2 className="text-ios-title-2 font-bold text-fxbg-dark-brown mb-1">
                  {currentStop.customer.name}
                </h2>
                <Badge variant="secondary" className="text-xs font-bold">
                  {currentStop.stop_type.toUpperCase()}
                </Badge>
              </div>
            </div>

            {/* Address */}
            {currentStop.customer.address && (
              <div className="space-y-2">
                <p className="text-ios-body text-ios-label-secondary">
                  {currentStop.customer.address}
                </p>
                {mapLink && (
                  <a
                    href={mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-ios-blue font-semibold text-ios-subheadline hover:underline"
                  >
                    <MapPin className="w-4 h-4" />
                    Open in Maps
                  </a>
                )}
              </div>
            )}

            {/* Driver Instructions / Flags */}
            {currentStop.flags && currentStop.flags.trim().length > 0 && (
              <Alert className="border-orange-500 bg-orange-50 dark:bg-orange-950/20">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <AlertDescription>
                  <p className="text-ios-caption-1 font-semibold text-orange-800 dark:text-orange-200 mb-1 uppercase tracking-wide">
                    Driver Instructions
                  </p>
                  <p className="text-ios-footnote font-medium text-orange-700 dark:text-orange-300 whitespace-pre-wrap">
                    {currentStop.flags}
                  </p>
                </AlertDescription>
              </Alert>
            )}

            {/* Stop Notes */}
            {currentStop.notes && (
              <div className="p-3 bg-ios-bg-secondary rounded-lg">
                <p className="text-ios-caption-1 font-semibold text-ios-label-secondary mb-1 uppercase tracking-wide">
                  Stop Notes
                </p>
                <p className="text-ios-subheadline text-fxbg-dark-brown">{currentStop.notes}</p>
              </div>
            )}

            {/* Contact */}
            {phoneLink && (
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  size="default"
                  className="text-ios-subheadline font-medium min-h-[44px]"
                  asChild
                >
                  <a href={phoneLink}>
                    <Phone className="w-4 h-4" />
                    Call
                  </a>
                </Button>
                {smsLink && (
                  <Button
                    variant="outline"
                    size="default"
                    className="text-ios-subheadline font-medium min-h-[44px]"
                    asChild
                  >
                    <a href={smsLink}>
                      <MessageSquare className="w-4 h-4" />
                      Text
                    </a>
                  </Button>
                )}
                <span className="flex items-center text-ios-subheadline text-ios-label-secondary font-medium">
                  {formattedPhone}
                </span>
              </div>
            )}

            {/* Notes Section */}
            <div className="space-y-2 pt-2">
              <Label htmlFor="notes" className="text-ios-footnote font-semibold text-ios-label-secondary uppercase tracking-wide">
                Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Left at front door, No bucket present"
                rows={3}
                disabled={loading}
                className="resize-none"
              />
            </div>

            {/* Error Display */}
            {error && (
              <Alert variant={error.includes('offline') ? 'default' : 'destructive'}>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </Card>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-ios-separator safe-area-padding-bottom">
        <div className="container mx-auto px-4 py-4">
          {!showFlagForm ? (
            <div className="space-y-3">
              {/* Primary Action: Next/Complete */}
              <Button
                onClick={handleSuccess}
                disabled={loading}
                className="w-full min-h-[56px] text-ios-title-3 font-bold"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Logging...
                  </>
                ) : isLastStop ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Complete Route
                  </>
                ) : (
                  <>
                    Next Stop
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>

              {/* Secondary Actions Row */}
              <div className="flex gap-3">
                {!isFirstStop && (
                  <Button
                    onClick={handlePrevious}
                    disabled={loading}
                    variant="outline"
                    className="flex-1 min-h-[48px]"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                )}
                <Button
                  onClick={() => setShowFlagForm(true)}
                  disabled={loading}
                  variant="outline"
                  className="flex-1 min-h-[48px] text-orange-600 border-orange-500 hover:bg-orange-50"
                >
                  <Flag className="w-4 h-4 mr-2" />
                  Flag Issue
                </Button>
              </div>
            </div>
          ) : (
            // Flag Issue Form
            <div className="space-y-3">
              <Alert className="border-orange-500 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  Please explain why this pickup could not be completed
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleFlag}
                disabled={loading || !notes.trim()}
                className="w-full min-h-[56px] text-ios-title-3 font-bold bg-orange-600 hover:bg-orange-700"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Logging Issue...
                  </>
                ) : (
                  'Log Issue & Continue'
                )}
              </Button>

              <Button
                onClick={() => {
                  setShowFlagForm(false)
                  setError(null)
                }}
                disabled={loading}
                variant="ghost"
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
