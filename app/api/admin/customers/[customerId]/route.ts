import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { customerId: string } }
) {
  try {
    const { customerId } = params

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      )
    }

    // Fetch customer
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('stripe_customer_id', customerId)
      .single()

    if (customerError) {
      if (customerError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Customer not found' },
          { status: 404 }
        )
      }
      console.error('Error fetching customer:', customerError)
      return NextResponse.json(
        { error: 'Failed to fetch customer' },
        { status: 500 }
      )
    }

    // Fetch route assignments for this customer
    const { data: stops, error: stopsError } = await supabase
      .from('stops')
      .select(`
        id,
        route_id,
        stop_order,
        stop_type,
        routes (
          id,
          date,
          driver
        )
      `)
      .eq('customer_id', customerId)
      .order('route_id', { ascending: false })

    if (stopsError) {
      console.error('Error fetching stops:', stopsError)
      // Return customer without assignments if stops fail
      return NextResponse.json({
        ...customer,
        assignments: []
      })
    }

    // Transform stops to assignments format
    const assignments = (stops || []).map((stop: any) => ({
      stop_id: stop.id,
      route_id: stop.route_id,
      route_date: stop.routes?.date,
      route_driver: stop.routes?.driver,
      stop_order: stop.stop_order,
      stop_type: stop.stop_type,
    }))

    return NextResponse.json({
      ...customer,
      assignments,
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
