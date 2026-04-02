'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react'
import { createTemplate } from '@/lib/data/templates'

export default function CreateTemplatePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Template name is required')
      return
    }

    setLoading(true)
    setError(null)

    const { data, error: createError } = await createTemplate({
      name: name.trim(),
    })

    if (createError) {
      setError(createError.message)
      setLoading(false)
      return
    }

    if (data) {
      router.push(`/admin/templates/${data.id}/edit`)
    } else {
      router.push('/admin/templates')
    }
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/templates">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Routes
        </Button>
      </Link>

      <div>
        <h1 className="text-ios-large-title font-bold text-gray-900">Create Route</h1>
        <p className="text-ios-body text-gray-600 mt-1">
          Name your route, then add customers
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-ios-title-3">Route Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Route Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Thursday Route + Agora"
                disabled={loading}
                autoFocus
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-fxbg-green hover:bg-fxbg-green/90"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Route'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
