import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET — fetch instance stops for the driver view (with customer info + latest pickup)
export async function GET(
  request: NextRequest,
  { params }: { params: { instanceId: string } }
) {
  try {
    const instanceId = parseInt(params.instanceId, 10)
    if (isNaN(instanceId) || instanceId < 1) {
      return NextResponse.json({ error: 'Invalid instance ID' }, { status: 400 })
    }

    const { data: stops, error } = await supabase
      .from('instance_stops')
      .select('*, customer:customers(*), pickup_events:v2_pickup_events(*)')
      .eq('instance_id', instanceId)
      .eq('visible_to_driver', true)
      .order('stop_order', { ascending: true })

    if (error) {
      console.error('Error fetching instance stops:', error)
      return NextResponse.json({ error: 'Failed to fetch stops' }, { status: 500 })
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

    return NextResponse.json(stopsWithStatus)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
