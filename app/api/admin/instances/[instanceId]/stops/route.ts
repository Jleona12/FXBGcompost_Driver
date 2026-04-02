import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST — add a stop to an instance
export async function POST(
  request: NextRequest,
  { params }: { params: { instanceId: string } }
) {
  try {
    const instanceId = parseInt(params.instanceId, 10)
    if (isNaN(instanceId) || instanceId < 1) {
      return NextResponse.json({ error: 'Invalid instance ID' }, { status: 400 })
    }

    const body = await request.json()
    if (!body.customer_id) {
      return NextResponse.json({ error: 'customer_id is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('instance_stops')
      .insert({
        instance_id: instanceId,
        template_stop_id: body.template_stop_id || null,
        customer_id: body.customer_id,
        stop_order: body.stop_order || 1,
        stop_type: body.stop_type || 'pickup',
        driver_notes: body.driver_notes || null,
        visible_to_driver: true,
      })
      .select('*, customer:customers(*)')
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to add stop' }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE — remove a stop from an instance
export async function DELETE(request: NextRequest) {
  try {
    const stopId = request.nextUrl.searchParams.get('stopId')
    if (!stopId) {
      return NextResponse.json({ error: 'stopId query param required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('instance_stops')
      .delete()
      .eq('id', parseInt(stopId, 10))

    if (error) {
      return NextResponse.json({ error: 'Failed to delete stop' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
