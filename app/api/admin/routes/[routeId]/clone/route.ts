import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST clone a route — creates a new route with the same stops and a new date
export async function POST(
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

    const body = await request.json()
    const newDate = body.date // optional new date for the cloned route

    // Fetch the source route
    const { data: sourceRoute, error: routeError } = await supabase
      .from('routes')
      .select('*')
      .eq('id', routeId)
      .single()

    if (routeError || !sourceRoute) {
      return NextResponse.json(
        { error: 'Source route not found' },
        { status: 404 }
      )
    }

    // Fetch all stops for the source route
    const { data: sourceStops, error: stopsError } = await supabase
      .from('stops')
      .select('*')
      .eq('route_id', routeId)
      .order('stop_order', { ascending: true })

    if (stopsError) {
      console.error('Error fetching source stops:', stopsError)
      return NextResponse.json(
        { error: 'Failed to fetch source route stops' },
        { status: 500 }
      )
    }

    // Create the new route
    const { data: newRoute, error: createError } = await supabase
      .from('routes')
      .insert([{
        date: newDate || sourceRoute.date,
        driver: sourceRoute.driver,
        notes: sourceRoute.notes,
      }])
      .select()
      .single()

    if (createError || !newRoute) {
      console.error('Error creating cloned route:', createError)
      return NextResponse.json(
        { error: 'Failed to create cloned route' },
        { status: 500 }
      )
    }

    // Clone all stops to the new route (without pickup events)
    if (sourceStops && sourceStops.length > 0) {
      const clonedStops = sourceStops.map((stop) => ({
        route_id: newRoute.id,
        customer_id: stop.customer_id,
        stop_order: stop.stop_order,
        stop_type: stop.stop_type,
        visible_to_driver: stop.visible_to_driver,
        flags: stop.flags,
        flag_notes: stop.flag_notes,
        customer_flags: stop.customer_flags,
      }))

      const { error: insertError } = await supabase
        .from('stops')
        .insert(clonedStops)

      if (insertError) {
        console.error('Error cloning stops:', insertError)
        // Clean up the route we created since stops failed
        await supabase.from('routes').delete().eq('id', newRoute.id)
        return NextResponse.json(
          { error: 'Failed to clone stops' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      { ...newRoute, stop_count: sourceStops?.length || 0 },
      { status: 201 }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
