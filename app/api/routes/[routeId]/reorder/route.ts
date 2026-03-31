import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { BatchStopOrderUpdate } from '@/lib/types'

// POST reorder stops within a route (public — used by drivers)
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
    const updates: BatchStopOrderUpdate[] = body.updates

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: 'updates array is required' },
        { status: 400 }
      )
    }

    // Validate and cap at 200 stops
    if (updates.length > 200) {
      return NextResponse.json(
        { error: 'Too many updates' },
        { status: 400 }
      )
    }

    for (const update of updates) {
      if (!update.stop_id || typeof update.stop_id !== 'number') {
        return NextResponse.json(
          { error: 'Each update must have a valid stop_id' },
          { status: 400 }
        )
      }
      if (typeof update.stop_order !== 'number' || update.stop_order < 1) {
        return NextResponse.json(
          { error: 'Each update must have a valid stop_order' },
          { status: 400 }
        )
      }
    }

    // Verify all stops belong to this route
    const stopIds = updates.map((u) => u.stop_id)
    const { data: existingStops, error: verifyError } = await supabase
      .from('stops')
      .select('id')
      .eq('route_id', routeId)
      .in('id', stopIds)

    if (verifyError) {
      console.error('Error verifying stops:', verifyError)
      return NextResponse.json(
        { error: 'Failed to verify stops' },
        { status: 500 }
      )
    }

    if (!existingStops || existingStops.length !== stopIds.length) {
      return NextResponse.json(
        { error: 'Some stops do not belong to this route' },
        { status: 400 }
      )
    }

    // Apply updates
    const errors: string[] = []
    for (const update of updates) {
      const { error } = await supabase
        .from('stops')
        .update({ stop_order: update.stop_order })
        .eq('id', update.stop_id)

      if (error) {
        console.error(`Error updating stop ${update.stop_id}:`, error)
        errors.push(`Failed to update stop ${update.stop_id}`)
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: errors.join(', '), partial: true },
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
