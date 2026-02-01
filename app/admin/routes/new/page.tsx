'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import RouteForm from '@/components/admin/RouteForm'
import { createRoute } from '@/lib/data/admin-routes'
import { CreateRoutePayload } from '@/lib/types'
import { ArrowLeft, AlertCircle } from 'lucide-react'

export default function CreateRoutePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: CreateRoutePayload) => {
    setLoading(true)
    setError(null)

    const { data: newRoute, error: createError } = await createRoute(data)

    if (createError) {
      setError(createError.message)
      setLoading(false)
      return
    }

    // Redirect to route editor to add stops
    if (newRoute) {
      router.push(`/admin/routes/${newRoute.id}/edit`)
    } else {
      router.push('/admin/routes')
    }
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/routes">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Routes
        </Button>
      </Link>

      <div>
        <h1 className="text-ios-large-title font-bold text-gray-900">Create Route</h1>
        <p className="text-ios-body text-gray-600 mt-1">
          Set up a new route, then add customers as stops
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <RouteForm
        onSubmit={handleSubmit}
        submitLabel="Create Route"
        isLoading={loading}
      />
    </div>
  )
}
