import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { validateDriverInitials } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body: any = await request.json()

    // Normalize field names (support both completed and legacy completion_status)
    const completed = body.completed ?? body.completion_status
    const stopId = body.stop_id

    // Validate required fields
    if (!stopId) {
      return NextResponse.json(
        { error: 'stop_id is required' },
        { status: 400 }
      )
    }

    if (!body.driver_initials) {
      return NextResponse.json(
        { error: 'driver_initials is required' },
        { status: 400 }
      )
    }

    if (typeof completed !== 'boolean') {
      return NextResponse.json(
        { error: 'completed (or completion_status) is required and must be a boolean' },
        { status: 400 }
      )
    }

    // Validate driver initials format (2-3 alphanumeric characters)
    if (!validateDriverInitials(body.driver_initials)) {
      return NextResponse.json(
        { error: 'driver_initials must be 2-3 alphanumeric characters' },
        { status: 400 }
      )
    }

    // Insert new pickup event (append-only, never update)
    const { data, error } = await supabase
      .from('pickup_events')
      .insert([
        {
          stop_id: stopId,
          driver_initials: body.driver_initials.trim().toUpperCase(),
          completed: completed,
          notes: body.notes?.trim() || null,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Error inserting pickup event:', error)
      return NextResponse.json(
        { error: 'Failed to create pickup event' },
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
