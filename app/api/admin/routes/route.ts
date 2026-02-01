import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { CreateRoutePayload } from '@/lib/types'

// GET all routes with stop counts
export async function GET() {
  try {
    // Fetch routes
    const { data: routes, error: routesError } = await supabase
      .from('routes')
      .select('*')
      .order('date', { ascending: false })

    if (routesError) {
      console.error('Error fetching routes:', routesError)
      return NextResponse.json(
        { error: 'Failed to fetch routes' },
        { status: 500 }
      )
    }

    // Fetch stop counts for each route
    const routeIds = (routes || []).map(r => r.id)

    if (routeIds.length === 0) {
      return NextResponse.json([])
    }

    const { data: stopCounts, error: stopsError } = await supabase
      .from('stops')
      .select('route_id')
      .in('route_id', routeIds)

    if (stopsError) {
      console.error('Error fetching stop counts:', stopsError)
      // Return routes without stop counts
      return NextResponse.json(
        (routes || []).map(route => ({ ...route, stop_count: 0 }))
      )
    }

    // Count stops per route
    const countsByRoute: Record<number, number> = {}
    for (const stop of stopCounts || []) {
      countsByRoute[stop.route_id] = (countsByRoute[stop.route_id] || 0) + 1
    }

    // Combine routes with stop counts
    const routesWithCounts = (routes || []).map(route => ({
      ...route,
      stop_count: countsByRoute[route.id] || 0
    }))

    return NextResponse.json(routesWithCounts)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST create new route
export async function POST(request: NextRequest) {
  try {
    const body: CreateRoutePayload = await request.json()

    const { data, error } = await supabase
      .from('routes')
      .insert([{
        date: body.date || null,
        driver: body.driver || null,
        notes: body.notes || {},
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating route:', error)
      return NextResponse.json(
        { error: 'Failed to create route' },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
