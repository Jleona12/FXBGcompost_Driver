import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { routeId: string } }
) {
  try {
    const { routeId } = params

    // Parse routeId as integer
    const routeIdNum = Number(routeId)
    if (isNaN(routeIdNum) || routeIdNum < 1) {
      return NextResponse.json(
        { error: 'Invalid route ID' },
        { status: 400 }
      )
    }

    // Fetch stops with customer info and only the latest pickup event per stop
    const { data: stops, error } = await supabase
      .from('stops')
      .select(`
        *,
        customer:customers(*),
        pickup_events(*)
      `)
      .eq('route_id', routeIdNum)
      .eq('visible_to_driver', true)
      .order('stop_order', { ascending: true })

    if (error) {
      console.error('Supabase stops query error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch stops' },
        { status: 500 }
      )
    }

    // Attach only the latest pickup event to each stop
    const stopsWithStatus = (stops || []).map((stop: any) => {
      const events = stop.pickup_events || []
      // Pick the most recent event by timestamp
      let latest = null
      for (const e of events) {
        if (!latest || e.timestamp > latest.timestamp) {
          latest = e
        }
      }

      const { pickup_events, ...rest } = stop
      return {
        ...rest,
        customer: stop.customer,
        latest_pickup: latest,
      }
    })

    return NextResponse.json(stopsWithStatus)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
