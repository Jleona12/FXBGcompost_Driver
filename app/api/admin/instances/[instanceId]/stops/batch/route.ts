import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const MAX_BATCH_SIZE = 200

// POST — batch update stop orders for an instance
export async function POST(
  request: NextRequest,
  { params }: { params: { instanceId: string } }
) {
  try {
    const instanceId = parseInt(params.instanceId, 10)
    if (isNaN(instanceId) || instanceId < 1) {
      return NextResponse.json({ error: 'Invalid instance ID' }, { status: 400 })
    }

    const { updates } = await request.json()

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ error: 'updates array is required' }, { status: 400 })
    }

    if (updates.length > MAX_BATCH_SIZE) {
      return NextResponse.json({ error: `Maximum ${MAX_BATCH_SIZE} updates per batch` }, { status: 400 })
    }

    // Validate all entries before writing anything
    for (const update of updates) {
      if (typeof update.stop_id !== 'number' || typeof update.stop_order !== 'number') {
        return NextResponse.json({ error: 'Each update must have numeric stop_id and stop_order' }, { status: 400 })
      }
    }

    // Execute updates — bail on first failure
    for (const update of updates) {
      const { error } = await supabase
        .from('instance_stops')
        .update({ stop_order: update.stop_order })
        .eq('id', update.stop_id)
        .eq('instance_id', instanceId)

      if (error) {
        console.error('Error updating stop order:', error)
        return NextResponse.json({ error: 'Failed to update stop orders' }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
