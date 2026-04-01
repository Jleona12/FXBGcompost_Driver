'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { RouteTemplateWithStopCount, InstanceForDriver } from '@/lib/types'
import { fetchTemplates, deleteTemplate } from '@/lib/data/templates'
import { fetchAdminInstances, deleteInstance } from '@/lib/data/instances'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Route,
  Plus,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  Trash2,
  Play,
  MapPin,
  Calendar,
  Archive,
} from 'lucide-react'
import { format } from 'date-fns'
import { parseLocalDate } from '@/lib/utils'

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<RouteTemplateWithStopCount[]>([])
  const [instances, setInstances] = useState<InstanceForDriver[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'template' | 'instance'; id: number } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    const [templatesRes, instancesRes] = await Promise.all([
      fetchTemplates(),
      fetchAdminInstances('active'),
    ])

    if (templatesRes.error) {
      setError(templatesRes.error.message)
    } else {
      setTemplates(templatesRes.data || [])
    }

    setInstances(instancesRes.data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleDeleteTemplate = async (id: number) => {
    if (!deleteConfirm || deleteConfirm.type !== 'template' || deleteConfirm.id !== id) {
      setDeleteConfirm({ type: 'template', id })
      return
    }
    const { error: err } = await deleteTemplate(id)
    if (err) setError(err.message)
    else setTemplates(prev => prev.filter(t => t.id !== id))
    setDeleteConfirm(null)
  }

  const handleDeleteInstance = async (id: number) => {
    if (!deleteConfirm || deleteConfirm.type !== 'instance' || deleteConfirm.id !== id) {
      setDeleteConfirm({ type: 'instance', id })
      return
    }
    const { error: err } = await deleteInstance(id)
    if (err) setError(err.message)
    else setInstances(prev => prev.filter(i => i.id !== id))
    setDeleteConfirm(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-ios-large-title font-bold text-gray-900">Templates</h1>
          <p className="text-ios-body text-gray-600 mt-1">
            Manage reusable route templates and activate them for pickup days
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={load}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Link href="/admin/templates/new">
            <Button className="bg-fxbg-green hover:bg-fxbg-green/90">
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Button>
          </Link>
        </div>
      </div>

      {/* Delete confirmation */}
      {deleteConfirm && (
        <Alert>
          <AlertDescription className="flex items-center justify-between">
            <span>
              {deleteConfirm.type === 'template'
                ? 'Retire this template? It will be hidden but not deleted.'
                : 'Delete this active route? Pickup data will be lost.'}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() =>
                  deleteConfirm.type === 'template'
                    ? handleDeleteTemplate(deleteConfirm.id)
                    : handleDeleteInstance(deleteConfirm.id)
                }
              >
                {deleteConfirm.type === 'template' ? 'Retire' : 'Delete'}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}
        </div>
      )}

      {/* Active Route Instances */}
      {!loading && instances.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-ios-title-2 font-semibold text-gray-900 flex items-center gap-2">
            <Play className="w-5 h-5 text-fxbg-green" />
            Active Routes ({instances.length})
          </h2>
          {instances.map(instance => (
            <Card key={instance.id} className="border-l-4 border-l-fxbg-green">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-ios-headline text-gray-900">
                      {instance.template_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-ios-subheadline text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {instance.date && parseLocalDate(instance.date)
                          ? format(parseLocalDate(instance.date)!, 'EEEE, MMMM d, yyyy')
                          : instance.date}
                      </span>
                    </div>
                    <Badge variant="secondary" className="mt-2 flex items-center gap-1 w-fit">
                      <MapPin className="w-3 h-3" />
                      {instance.stop_count} stop{instance.stop_count !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                      onClick={() => handleDeleteInstance(instance.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Route Templates */}
      {!loading && !error && templates.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-ios-title-2 font-semibold text-gray-900 flex items-center gap-2">
            <Route className="w-5 h-5 text-gray-500" />
            Templates ({templates.length})
          </h2>
          {templates.map(template => (
            <Card key={template.id} className="hover:bg-accent/50 transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-ios-headline text-gray-900">
                      {template.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {template.stop_count} stop{template.stop_count !== 1 ? 's' : ''}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {template.frequency}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Link href={`/admin/templates/${template.id}/activate`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-fxbg-green hover:text-fxbg-green hover:bg-green-50"
                        title="Start route"
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Link href={`/admin/templates/${template.id}/edit`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-gray-600"
                        title="Edit template"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                      onClick={() => handleDeleteTemplate(template.id)}
                      title="Retire template"
                    >
                      <Archive className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && templates.length === 0 && instances.length === 0 && (
        <div className="text-center py-12">
          <Route className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-ios-headline text-gray-900 mb-1">No templates yet</h3>
          <p className="text-ios-body text-gray-500 mb-4">
            Create a template for your recurring routes
          </p>
          <Link href="/admin/templates/new">
            <Button className="bg-fxbg-green hover:bg-fxbg-green/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
