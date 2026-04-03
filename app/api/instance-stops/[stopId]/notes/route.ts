import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const MAX_NOTES_LENGTH = 2000

// PATCH — driver saves notes from the field (writes back to template too)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { stopId: string } }
) {
  try {
    const stopId = parseInt(params.stopId, 10)
    if (isNaN(stopId) || stopId < 1) {
      return NextResponse.json({ error: 'Invalid stop ID' }, { status: 400 })
    }

    const { driver_notes } = await request.json()
    const notes = typeof driver_notes === 'string' ? driver_notes.trim() : ''

    if (notes.length > MAX_NOTES_LENGTH) {
      return NextResponse.json({ error: `Notes must be ${MAX_NOTES_LENGTH} characters or less` }, { status: 400 })
    }

    // Update the instance stop
    const { data: stop, error } = await supabase
      .from('instance_stops')
      .update({ driver_notes: notes || null })
      .eq('id', stopId)
      .select('template_stop_id')
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to save notes' }, { status: 500 })
    }

    // Write back to template stop so notes persist to future instances.
    // Await the result so we know if it failed.
    if (stop?.template_stop_id) {
      const { error: templateError } = await supabase
        .from('template_stops')
        .update({ driver_notes: notes || null })
        .eq('id', stop.template_stop_id)

      if (templateError) {
        // Instance notes saved, but template persistence failed.
        // Log but don't fail the request — the driver's current note is saved.
        console.error('Failed to persist notes to template_stop:', templateError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
