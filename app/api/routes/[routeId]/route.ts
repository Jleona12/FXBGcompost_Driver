import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { StopWithCustomer } from '@/lib/types'

export async function GET(
  request: NextRequest,
  { params }: { params: { routeId: string } }
) {
  try {
    const { routeId } = params

    // Parse routeId as integer
    const routeIdNum = Number(routeId)
    if (isNaN(routeIdNum) || routeIdNum < 1) {
      return NextResponse.json(
        { error: 'Invalid route ID' },
        { status: 400 }
      )
    }

    // Fetch stops for the route with customer information
    const { data: stops, error } = await supabase
      .from('stops')
      .select(`
        *,
        customer:customers(*)
      `)
      .eq('route_id', routeIdNum)
      .eq('visible_to_driver', true)
      .order('stop_order', { ascending: true })

    if (error) {
      console.error('Supabase stops query error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch stops' },
        { status: 500 }
      )
    }

    // Transform the data to match StopWithCustomer type
    const stopsWithCustomers: StopWithCustomer[] = (stops || []).map((stop: any) => ({
      ...stop,
      customer: stop.customer,
    }))

    return NextResponse.json(stopsWithCustomers)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
