import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET single instance with all stops + customer info + latest pickup
export async function GET(
  request: NextRequest,
  { params }: { params: { instanceId: string } }
) {
  try {
    const instanceId = parseInt(params.instanceId, 10)
    if (isNaN(instanceId) || instanceId < 1) {
      return NextResponse.json({ error: 'Invalid instance ID' }, { status: 400 })
    }

    const { data: instance, error: instError } = await supabase
      .from('route_instances')
      .select('*, template:route_templates(name, frequency)')
      .eq('id', instanceId)
      .single()

    if (instError) {
      if (instError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Instance not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch instance' }, { status: 500 })
    }

    const { data: stops, error: stopsError } = await supabase
      .from('instance_stops')
      .select('*, customer:customers(*), pickup_events:v2_pickup_events(*)')
      .eq('instance_id', instanceId)
      .order('stop_order', { ascending: true })

    if (stopsError) {
      console.error('Error fetching instance stops:', stopsError)
    }

    // Attach latest pickup to each stop
    const stopsWithStatus = (stops || []).map((stop: any) => {
      const events = stop.pickup_events || []
      let latest = null
      for (const e of events) {
        if (!latest || e.timestamp > latest.timestamp) {
          latest = e
        }
      }
      const { pickup_events, ...rest } = stop
      return { ...rest, latest_pickup: latest }
    })

    return NextResponse.json({
      ...instance,
      template_name: instance.template?.name || 'Unknown',
      stops: stopsWithStatus,
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT — update instance (status, notes)
export async function PUT(
  request: NextRequest,
  { params }: { params: { instanceId: string } }
) {
  try {
    const instanceId = parseInt(params.instanceId, 10)
    if (isNaN(instanceId) || instanceId < 1) {
      return NextResponse.json({ error: 'Invalid instance ID' }, { status: 400 })
    }

    const body = await request.json()
    const updateData: Record<string, any> = {}
    if (body.status !== undefined) updateData.status = body.status
    if (body.notes !== undefined) updateData.notes = body.notes

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('route_instances')
      .update(updateData)
      .eq('id', instanceId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to update instance' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE — delete instance (cascades to instance_stops and pickup_events)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { instanceId: string } }
) {
  try {
    const instanceId = parseInt(params.instanceId, 10)
    if (isNaN(instanceId) || instanceId < 1) {
      return NextResponse.json({ error: 'Invalid instance ID' }, { status: 400 })
    }

    const { error } = await supabase
      .from('route_instances')
      .delete()
      .eq('id', instanceId)

    if (error) {
      console.error('Error deleting instance:', error)
      return NextResponse.json({ error: 'Failed to delete instance' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
