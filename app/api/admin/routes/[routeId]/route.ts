import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { UpdateRoutePayload } from '@/lib/types'

// GET single route with all stops
export async function GET(
  request: NextRequest,
  { params }: { params: { routeId: string } }
) {
  try {
    const routeId = parseInt(params.routeId, 10)

    if (isNaN(routeId) || routeId < 1) {
      return NextResponse.json(
        { error: 'Invalid route ID' },
        { status: 400 }
      )
    }

    // Fetch route
    const { data: route, error: routeError } = await supabase
      .from('routes')
      .select('*')
      .eq('id', routeId)
      .single()

    if (routeError) {
      if (routeError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Route not found' },
          { status: 404 }
        )
      }
      console.error('Error fetching route:', routeError)
      return NextResponse.json(
        { error: 'Failed to fetch route' },
        { status: 500 }
      )
    }

    // Fetch stops with customer info
    const { data: stops, error: stopsError } = await supabase
      .from('stops')
      .select(`
        *,
        customer:customers(*)
      `)
      .eq('route_id', routeId)
      .order('stop_order', { ascending: true })

    if (stopsError) {
      console.error('Error fetching stops:', stopsError)
      return NextResponse.json({
        ...route,
        stops: []
      })
    }

    return NextResponse.json({
      ...route,
      stops: stops || []
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT update route
export async function PUT(
  request: NextRequest,
  { params }: { params: { routeId: string } }
) {
  try {
    const routeId = parseInt(params.routeId, 10)

    if (isNaN(routeId) || routeId < 1) {
      return NextResponse.json(
        { error: 'Invalid route ID' },
        { status: 400 }
      )
    }

    const body: UpdateRoutePayload = await request.json()

    const updateData: Record<string, any> = {}
    if (body.date !== undefined) updateData.date = body.date
    if (body.driver !== undefined) updateData.driver = body.driver
    if (body.notes !== undefined) updateData.notes = body.notes

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('routes')
      .update(updateData)
      .eq('id', routeId)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Route not found' },
          { status: 404 }
        )
      }
      console.error('Error updating route:', error)
      return NextResponse.json(
        { error: 'Failed to update route' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE route (cascades to stops)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { routeId: string } }
) {
  try {
    const routeId = parseInt(params.routeId, 10)

    if (isNaN(routeId) || routeId < 1) {
      return NextResponse.json(
        { error: 'Invalid route ID' },
        { status: 400 }
      )
    }

    // First delete all stops for this route
    const { error: stopsError } = await supabase
      .from('stops')
      .delete()
      .eq('route_id', routeId)

    if (stopsError) {
      console.error('Error deleting stops:', stopsError)
      return NextResponse.json(
        { error: 'Failed to delete route stops' },
        { status: 500 }
      )
    }

    // Then delete the route
    const { error } = await supabase
      .from('routes')
      .delete()
      .eq('id', routeId)

    if (error) {
      console.error('Error deleting route:', error)
      return NextResponse.json(
        { error: 'Failed to delete route' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
