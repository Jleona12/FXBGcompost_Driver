import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

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

    // Fetch route assignments — which templates include this customer
    const { data: templateStops, error: stopsError } = await supabase
      .from('template_stops')
      .select(`
        id,
        template_id,
        stop_order,
        stop_type,
        template:route_templates(id, name, is_active)
      `)
      .eq('customer_id', customerId)
      .order('template_id', { ascending: true })

    if (stopsError) {
      console.error('Error fetching template stops:', stopsError)
      return NextResponse.json({
        ...customer,
        assignments: []
      })
    }

    const assignments = (templateStops || []).map((stop: any) => ({
      stop_id: stop.id,
      template_id: stop.template_id,
      template_name: stop.template?.name || 'Unknown',
      template_active: stop.template?.is_active ?? false,
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
