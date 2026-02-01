import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { CreateStopPayload } from '@/lib/types'

// POST create new stop
export async function POST(request: NextRequest) {
  try {
    const body: CreateStopPayload = await request.json()

    // Validate required fields
    if (!body.route_id) {
      return NextResponse.json(
        { error: 'route_id is required' },
        { status: 400 }
      )
    }

    if (!body.customer_id) {
      return NextResponse.json(
        { error: 'customer_id is required' },
        { status: 400 }
      )
    }

    if (typeof body.stop_order !== 'number' || body.stop_order < 1) {
      return NextResponse.json(
        { error: 'stop_order must be a positive integer' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('stops')
      .insert([{
        route_id: body.route_id,
        customer_id: body.customer_id,
        stop_order: body.stop_order,
        stop_type: body.stop_type || 'pickup',
        visible_to_driver: body.visible_to_driver !== false,
        flags: body.flags || '',
        flag_notes: body.flag_notes || '',
      }])
      .select(`
        *,
        customer:customers(*)
      `)
      .single()

    if (error) {
      console.error('Error creating stop:', error)
      return NextResponse.json(
        { error: 'Failed to create stop' },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
