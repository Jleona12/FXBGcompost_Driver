import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// PATCH update driver notes on a stop (public — used by drivers in the field)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { stopId: string } }
) {
  try {
    const stopId = parseInt(params.stopId, 10)

    if (isNaN(stopId) || stopId < 1) {
      return NextResponse.json(
        { error: 'Invalid stop ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { driver_notes } = body

    if (typeof driver_notes !== 'string') {
      return NextResponse.json(
        { error: 'driver_notes must be a string' },
        { status: 400 }
      )
    }

    // Write to the flags field (used for persistent driver-visible notes)
    const { data, error } = await supabase
      .from('stops')
      .update({ flags: driver_notes.trim() || null })
      .eq('id', stopId)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Stop not found' },
          { status: 404 }
        )
      }
      console.error('Error updating driver notes:', error)
      return NextResponse.json(
        { error: 'Failed to update driver notes' },
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
