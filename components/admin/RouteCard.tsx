'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, User, MapPin, ChevronRight, Trash2 } from 'lucide-react'
import { RouteWithStopCount } from '@/lib/types'
import { format } from 'date-fns'
import { parseLocalDate } from '@/lib/utils'

interface RouteCardProps {
  route: RouteWithStopCount
  onDelete?: (routeId: number) => void
}

export default function RouteCard({ route, onDelete }: RouteCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onDelete) {
      onDelete(route.id)
    }
  }

  return (
    <Link href={`/admin/routes/${route.id}/edit`}>
      <Card className="hover:bg-accent/50 active:scale-[0.99] transition-all cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Date */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-fxbg-green" />
                <h3 className="font-semibold text-ios-headline text-gray-900">
                  {route.date && parseLocalDate(route.date)
                    ? format(parseLocalDate(route.date)!, 'EEEE, MMMM d, yyyy')
                    : 'No date set'}
                </h3>
              </div>

              {/* Driver */}
              {route.driver && (
                <div className="flex items-center gap-2 mt-2 text-ios-subheadline text-gray-600">
                  <User className="w-4 h-4" />
                  <span>{route.driver}</span>
                </div>
              )}

              {/* Stop count */}
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {route.stop_count} stop{route.stop_count !== 1 ? 's' : ''}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                  onClick={handleDelete}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
              <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
