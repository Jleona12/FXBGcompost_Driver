import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { BatchStopOrderUpdate } from '@/lib/types'

// POST batch update stop orders
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const updates: BatchStopOrderUpdate[] = body.updates

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: 'updates array is required' },
        { status: 400 }
      )
    }

    // Validate all updates
    for (const update of updates) {
      if (!update.stop_id || typeof update.stop_id !== 'number') {
        return NextResponse.json(
          { error: 'Each update must have a valid stop_id' },
          { status: 400 }
        )
      }
      if (typeof update.stop_order !== 'number' || update.stop_order < 1) {
        return NextResponse.json(
          { error: 'Each update must have a valid stop_order (positive integer)' },
          { status: 400 }
        )
      }
    }

    // Update each stop's order
    // Note: In production, you might want to use a transaction
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
