import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET pickup events with full context (stop, customer, route)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)
    const routeId = searchParams.get('route_id')
    const driverInitials = searchParams.get('driver_initials')
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')
    const completedOnly = searchParams.get('completed') === 'true'

    // Build query with nested joins
    let query = supabase
      .from('pickup_events')
      .select(`
        *,
        stop:stops(
          id,
          stop_order,
          stop_type,
          route_id,
          customer:customers(*),
          route:routes(*)
        )
      `)
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (completedOnly) {
      query = query.eq('completed', true)
    }

    if (driverInitials) {
      query = query.ilike('driver_initials', `%${driverInitials}%`)
    }

    if (dateFrom) {
      query = query.gte('timestamp', dateFrom)
    }

    if (dateTo) {
      // Add a day to include the entire end date
      const endDate = new Date(dateTo)
      endDate.setDate(endDate.getDate() + 1)
      query = query.lt('timestamp', endDate.toISOString())
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching pickup events:', error)
      return NextResponse.json(
        { error: 'Failed to fetch pickup events' },
        { status: 500 }
      )
    }

    // Filter by route_id if specified (need to do this post-query due to nested relation)
    let filteredData = data || []
    if (routeId) {
      const routeIdNum = parseInt(routeId, 10)
      filteredData = filteredData.filter(
        (event: any) => event.stop?.route_id === routeIdNum
      )
    }

    return NextResponse.json(filteredData)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
