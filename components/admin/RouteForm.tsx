'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Calendar, User } from 'lucide-react'
import { CreateRoutePayload, UpdateRoutePayload, Route } from '@/lib/types'

// Normalize date to YYYY-MM-DD format for HTML date input
// IMPORTANT: Avoid using new Date() to prevent timezone shifting
function normalizeDate(dateString?: string): string {
  if (!dateString) return ''

  const trimmed = dateString.trim()

  // Extract YYYY-MM-DD from the beginning of the string
  // This handles "2024-01-15", "2024-01-15T00:00:00", "2024-01-15T00:00:00.000Z", etc.
  const match = trimmed.match(/^(\d{4}-\d{2}-\d{2})/)
  if (match) {
    return match[1]
  }

  return ''
}

interface RouteFormProps {
  initialData?: Route
  onSubmit: (data: CreateRoutePayload | UpdateRoutePayload) => Promise<void>
  submitLabel?: string
  isLoading?: boolean
}

export default function RouteForm({
  initialData,
  onSubmit,
  submitLabel = 'Create Route',
  isLoading = false
}: RouteFormProps) {
  const [date, setDate] = useState(normalizeDate(initialData?.date))
  const [driver, setDriver] = useState(initialData?.driver || '')
  const [notes, setNotes] = useState(
    initialData?.notes ? JSON.stringify(initialData.notes, null, 2) : ''
  )
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      let parsedNotes: Record<string, any> = {}
      if (notes.trim()) {
        try {
          parsedNotes = JSON.parse(notes)
        } catch {
          setError('Notes must be valid JSON')
          return
        }
      }

      await onSubmit({
        date: date || undefined,
        driver: driver || undefined,
        notes: Object.keys(parsedNotes).length > 0 ? parsedNotes : undefined,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-ios-title-3">Route Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="driver" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Driver Name
            </Label>
            <Input
              id="driver"
              type="text"
              value={driver}
              onChange={(e) => setDriver(e.target.value)}
              placeholder="Enter driver name"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (JSON format, optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder='{"key": "value"}'
              rows={3}
              disabled={isLoading}
              className="font-mono text-sm"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-fxbg-green hover:bg-fxbg-green/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
