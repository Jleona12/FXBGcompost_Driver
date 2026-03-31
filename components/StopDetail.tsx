'use client'

import { useState } from 'react'
import { StopWithStatus, PickupEventPayload } from '@/lib/types'
import { createPickupEvent } from '@/lib/data/pickups'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  ArrowLeft,
  MapPin,
  AlertTriangle,
  Phone,
  Loader2,
  CheckCircle2,
  XCircle,
  ChevronDown,
  StickyNote,
  Check,
} from 'lucide-react'
import { formatPhoneNumber, getPhoneLink, getMapLink } from '@/lib/utils'

const NOT_COLLECTED_REASONS = [
  'Bucket not outside',
  'Driveway blocked',
  'Other',
] as const

interface StopDetailProps {
  stop: StopWithStatus
  driverInitials: string
  onBack: () => void
  onPickupLogged: () => void
}

export default function StopDetail({
  stop,
  driverInitials,
  onBack,
  onPickupLogged,
}: StopDetailProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showReasons, setShowReasons] = useState(false)
  const [otherReason, setOtherReason] = useState('')
  const [driverNotes, setDriverNotes] = useState(stop.flags || '')
  const [savingNotes, setSavingNotes] = useState(false)
  const [notesSaved, setNotesSaved] = useState(false)
  const notesChanged = driverNotes !== (stop.flags || '')

  const pickup = stop.latest_pickup
  const isCollected = pickup?.completed === true
  const isFailed = pickup != null && !pickup.completed
  const mapLink = getMapLink(stop.customer.address)
  const phoneLink = getPhoneLink(stop.customer.phone)
  const formattedPhone = formatPhoneNumber(stop.customer.phone)

  const logPickup = async (completed: boolean, notes?: string) => {
    setLoading(true)
    setError(null)

    const payload: PickupEventPayload = {
      stop_id: stop.id,
      driver_initials: driverInitials,
      completed,
      notes,
    }

    const result = await createPickupEvent(payload)

    if (!result.success && !result.offline) {
      setError(result.error || 'Failed to log pickup')
      setLoading(false)
      return
    }

    setLoading(false)
    onPickupLogged()
  }

  const handleSaveNotes = async () => {
    setSavingNotes(true)
    try {
      const response = await fetch(`/api/stops/${stop.id}/notes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driver_notes: driverNotes }),
      })
      if (response.ok) {
        setNotesSaved(true)
        setTimeout(() => setNotesSaved(false), 2000)
      } else {
        setError('Failed to save note')
      }
    } catch {
      setError('Failed to save note')
    } finally {
      setSavingNotes(false)
    }
  }

  const handleCollected = () => logPickup(true)

  const handleNotCollected = (reason: string) => {
    if (reason === 'Other' && !otherReason.trim()) {
      setError('Please enter a reason')
      return
    }
    logPickup(false, reason === 'Other' ? otherReason.trim() : reason)
  }

  return (
    <div className="min-h-screen bg-ios-bg-secondary flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-ios-separator sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-1 -ml-2">
            <ArrowLeft className="w-4 h-4" />
            Back to list
          </Button>
        </div>
      </div>

      {/* Stop Content */}
      <div className="flex-1 container mx-auto px-4 py-6 pb-56">
        <Card>
          <div className="p-6 space-y-5">
            {/* Stop header */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-fxbg-green text-white flex items-center justify-center text-ios-title-2 font-bold shadow-md flex-shrink-0">
                {stop.stop_order}
              </div>
              <div className="flex-1">
                <h2 className="text-ios-title-2 font-bold text-gray-900 mb-1">
                  {stop.customer.name}
                </h2>
                <Badge variant="secondary" className="text-xs font-bold">
                  {stop.stop_type?.toUpperCase() || 'PICKUP'}
                </Badge>
              </div>
            </div>

            {/* Address — single tappable link to maps */}
            {stop.customer.address && (
              <a
                href={mapLink || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 active:bg-gray-100 transition-colors"
              >
                <MapPin className="w-5 h-5 text-fxbg-green flex-shrink-0" />
                <span className="text-ios-body text-fxbg-green font-medium underline underline-offset-2">
                  {stop.customer.address}
                </span>
              </a>
            )}

            {/* Driver Notes — editable, persists to next visit */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <StickyNote className="w-4 h-4 text-orange-500" />
                <span className="text-ios-caption-1 font-semibold text-gray-500 uppercase tracking-wide">
                  Driver Notes
                </span>
                {notesSaved && (
                  <span className="text-ios-caption-1 text-fxbg-green font-medium flex items-center gap-1">
                    <Check className="w-3 h-3" /> Saved
                  </span>
                )}
              </div>
              <textarea
                value={driverNotes}
                onChange={(e) => setDriverNotes(e.target.value)}
                placeholder="Gate code, bucket location, access notes..."
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-ios-body resize-none focus:outline-none focus:ring-2 focus:ring-fxbg-green/50 focus:border-fxbg-green bg-orange-50/50"
              />
              {notesChanged && (
                <Button
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  variant="outline"
                  size="sm"
                  className="text-orange-700 border-orange-300 hover:bg-orange-50"
                >
                  {savingNotes ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Check className="w-3 h-3 mr-1" />
                  )}
                  Save Note
                </Button>
              )}
            </div>

            {/* Contact */}
            {phoneLink && (
              <a
                href={phoneLink}
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 active:bg-gray-100 transition-colors"
              >
                <Phone className="w-5 h-5 text-gray-500 flex-shrink-0" />
                <span className="text-ios-body text-gray-700 font-medium">
                  {formattedPhone}
                </span>
              </a>
            )}

            {/* Current status */}
            {pickup && (
              <div
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  isCollected ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                {isCollected ? (
                  <CheckCircle2 className="w-5 h-5 text-fxbg-green flex-shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                )}
                <div>
                  <span
                    className={`text-ios-subheadline font-semibold ${
                      isCollected ? 'text-fxbg-green' : 'text-red-600'
                    }`}
                  >
                    {isCollected ? 'Collected' : 'Not collected'}
                  </span>
                  <span className="text-ios-footnote text-gray-500 ml-2">
                    by {pickup.driver_initials}
                  </span>
                  {isFailed && pickup.notes && (
                    <p className="text-ios-footnote text-red-500 mt-1">{pickup.notes}</p>
                  )}
                </div>
              </div>
            )}

            {/* Error */}
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
        <div className="container mx-auto px-4 py-4 space-y-3">
          {/* Collected button */}
          <Button
            onClick={handleCollected}
            disabled={loading}
            className="w-full min-h-[56px] text-ios-title-3 font-bold bg-fxbg-green hover:bg-fxbg-green/90 text-white"
            size="lg"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <CheckCircle2 className="w-5 h-5 mr-2" />
            )}
            Collected
          </Button>

          {/* Not Collected */}
          {!showReasons ? (
            <Button
              onClick={() => setShowReasons(true)}
              disabled={loading}
              variant="outline"
              className="w-full min-h-[48px] text-red-600 border-red-300 hover:bg-red-50"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Not Collected
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <div className="space-y-2">
              {NOT_COLLECTED_REASONS.map((reason) => (
                <div key={reason}>
                  {reason === 'Other' ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={otherReason}
                        onChange={(e) => {
                          setOtherReason(e.target.value)
                          setError(null)
                        }}
                        placeholder="Other reason..."
                        className="flex-1 h-12 px-3 rounded-lg border border-red-300 text-ios-body focus:outline-none focus:ring-2 focus:ring-red-400"
                      />
                      <Button
                        onClick={() => handleNotCollected('Other')}
                        disabled={loading || !otherReason.trim()}
                        variant="outline"
                        className="h-12 px-4 text-red-600 border-red-300 hover:bg-red-50"
                      >
                        Submit
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleNotCollected(reason)}
                      disabled={loading}
                      variant="outline"
                      className="w-full min-h-[48px] text-red-600 border-red-300 hover:bg-red-50 justify-start"
                    >
                      <XCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                      {reason}
                    </Button>
                  )}
                </div>
              ))}
              <Button
                onClick={() => {
                  setShowReasons(false)
                  setError(null)
                }}
                disabled={loading}
                variant="ghost"
                className="w-full text-gray-500"
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
