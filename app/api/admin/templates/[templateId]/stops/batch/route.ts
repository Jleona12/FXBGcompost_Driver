import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST — batch update stop orders for a template
export async function POST(
  request: NextRequest,
  { params }: { params: { templateId: string } }
) {
  try {
    const templateId = parseInt(params.templateId, 10)
    if (isNaN(templateId) || templateId < 1) {
      return NextResponse.json({ error: 'Invalid template ID' }, { status: 400 })
    }

    const { updates } = await request.json()

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json({ error: 'updates array is required' }, { status: 400 })
    }

    // Update each stop order
    for (const update of updates) {
      const { error } = await supabase
        .from('template_stops')
        .update({ stop_order: update.stop_order })
        .eq('id', update.stop_id)
        .eq('template_id', templateId)

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
