'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Route, ArrowRight, Loader2 } from 'lucide-react'

interface DashboardStats {
  routeCount: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const routesRes = await fetch('/api/admin/routes')
      const routes = routesRes.ok ? await routesRes.json() : []

      setStats({
        routeCount: Array.isArray(routes) ? routes.length : 0,
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
      setStats({ routeCount: 0 })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-ios-large-title font-bold text-gray-900">Dashboard</h1>
        <p className="text-ios-body text-gray-600 mt-1">
          Manage customers and routes for FXBG Compost
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-fxbg-green" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Customers Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-ios-title-3 font-medium">Customers</CardTitle>
              <Users className="w-5 h-5 text-fxbg-green" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                View and search customer database
              </CardDescription>
              <Link href="/admin/customers">
                <Button variant="ghost" className="mt-4 p-0 h-auto text-fxbg-green hover:text-fxbg-dark-green">
                  View all customers
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Routes Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-ios-title-3 font-medium">Routes</CardTitle>
              <Route className="w-5 h-5 text-fxbg-green" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {stats?.routeCount ?? '-'}
              </div>
              <CardDescription className="mt-1">
                Total routes configured
              </CardDescription>
              <Link href="/admin/routes">
                <Button variant="ghost" className="mt-4 p-0 h-auto text-fxbg-green hover:text-fxbg-dark-green">
                  Manage routes
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-ios-title-3">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href="/admin/routes/new">
            <Button className="bg-fxbg-green hover:bg-fxbg-green/90">
              Create New Route
            </Button>
          </Link>
          <Link href="/admin/customers">
            <Button variant="outline">
              Search Customers
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
