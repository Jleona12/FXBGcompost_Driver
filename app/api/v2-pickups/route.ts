import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { validateDriverInitials } from '@/lib/utils'

// POST — log a pickup event against an instance stop
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.instance_stop_id) {
      return NextResponse.json({ error: 'instance_stop_id is required' }, { status: 400 })
    }

    if (!body.driver_initials) {
      return NextResponse.json({ error: 'driver_initials is required' }, { status: 400 })
    }

    if (typeof body.completed !== 'boolean') {
      return NextResponse.json({ error: 'completed must be a boolean' }, { status: 400 })
    }

    if (!validateDriverInitials(body.driver_initials)) {
      return NextResponse.json({ error: 'driver_initials must be 2-3 alphanumeric characters' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('v2_pickup_events')
      .insert({
        instance_stop_id: body.instance_stop_id,
        driver_initials: body.driver_initials.trim().toUpperCase(),
        completed: body.completed,
        notes: body.notes?.trim() || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error inserting pickup event:', error)
      return NextResponse.json({ error: 'Failed to create pickup event' }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
