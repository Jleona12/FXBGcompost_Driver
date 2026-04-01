import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST — driver reorder stops within an instance
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

    if (!Array.isArray(updates) || updates.length === 0 || updates.length > 200) {
      return NextResponse.json({ error: 'Invalid updates array' }, { status: 400 })
    }

    for (const update of updates) {
      const { error } = await supabase
        .from('instance_stops')
        .update({ stop_order: update.stop_order })
        .eq('id', update.stop_id)
        .eq('instance_id', instanceId)

      if (error) {
        console.error('Error updating stop order:', error)
        return NextResponse.json({ error: 'Failed to reorder' }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
