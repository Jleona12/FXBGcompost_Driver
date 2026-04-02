import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET pickup events with full context (instance stop, customer, route instance)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const MAX_LIMIT = 500
    const limit = Math.min(
      Math.max(1, parseInt(searchParams.get('limit') || '100', 10) || 100),
      MAX_LIMIT
    )
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0', 10) || 0)
    const driverInitials = searchParams.get('driver_initials')
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')
    const completedOnly = searchParams.get('completed') === 'true'

    let query = supabase
      .from('v2_pickup_events')
      .select(`
        *,
        instance_stop:instance_stops(
          id,
          stop_order,
          stop_type,
          instance_id,
          customer:customers(*),
          instance:route_instances(*)
        )
      `)
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1)

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

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
