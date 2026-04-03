import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { validateDriverInitials } from '@/lib/utils'

const MAX_NOTES_LENGTH = 1000

// POST — log a pickup event against an instance stop
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.instance_stop_id || typeof body.instance_stop_id !== 'number') {
      return NextResponse.json({ error: 'instance_stop_id must be a number' }, { status: 400 })
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

    const notes = body.notes?.trim() || null
    if (notes && notes.length > MAX_NOTES_LENGTH) {
      return NextResponse.json({ error: `notes must be ${MAX_NOTES_LENGTH} characters or less` }, { status: 400 })
    }

    // Idempotency: if a key is provided, check for existing event with same key
    if (body.idempotency_key) {
      const { data: existing } = await supabase
        .from('v2_pickup_events')
        .select('id')
        .eq('idempotency_key', body.idempotency_key)
        .maybeSingle()

      if (existing) {
        // Already processed — return success without creating a duplicate
        return NextResponse.json(existing, { status: 200 })
      }
    }

    const insertData: Record<string, unknown> = {
      instance_stop_id: body.instance_stop_id,
      driver_initials: body.driver_initials.trim().toUpperCase(),
      completed: body.completed,
      notes,
    }

    // Store idempotency key if provided (column may not exist yet — gracefully ignore)
    if (body.idempotency_key) {
      insertData.idempotency_key = body.idempotency_key
    }

    const { data, error } = await supabase
      .from('v2_pickup_events')
      .insert(insertData)
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
