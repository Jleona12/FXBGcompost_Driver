import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getTodayEastern } from '@/lib/utils'

// POST — one-tap "Send to Driver": creates an instance with today's date and all template stops
export async function POST(
  request: NextRequest,
  { params }: { params: { templateId: string } }
) {
  try {
    const templateId = parseInt(params.templateId, 10)
    if (isNaN(templateId) || templateId < 1) {
      return NextResponse.json({ error: 'Invalid template ID' }, { status: 400 })
    }

    // Get optional date from body, default to today in Eastern time
    let date: string
    try {
      const body = await request.json()
      date = body.date || getTodayEastern()
    } catch {
      date = getTodayEastern()
    }

    // Fetch template + its stops in parallel
    const [templateRes, stopsRes] = await Promise.all([
      supabase
        .from('route_templates')
        .select('id, name')
        .eq('id', templateId)
        .single(),
      supabase
        .from('template_stops')
        .select('id, customer_id, stop_order, stop_type, driver_notes')
        .eq('template_id', templateId)
        .order('stop_order', { ascending: true }),
    ])

    if (templateRes.error || !templateRes.data) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    if (stopsRes.error) {
      console.error('Error fetching template stops:', stopsRes.error)
      return NextResponse.json({ error: 'Failed to read route stops' }, { status: 500 })
    }

    const stops = stopsRes.data || []
    if (stops.length === 0) {
      return NextResponse.json(
        { error: 'This route has no stops. Add customers before sending.' },
        { status: 400 }
      )
    }

    // Check for duplicate: same template + same date already active
    const { data: existing } = await supabase
      .from('route_instances')
      .select('id')
      .eq('template_id', templateId)
      .eq('date', date)
      .eq('status', 'active')
      .limit(1)

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: 'This route is already active for today. Delete it first to resend.' },
        { status: 409 }
      )
    }

    // Create the route instance
    const { data: instance, error: instanceError } = await supabase
      .from('route_instances')
      .insert({
        template_id: templateId,
        date,
        status: 'active',
      })
      .select()
      .single()

    if (instanceError || !instance) {
      console.error('Error creating instance:', instanceError)
      return NextResponse.json({ error: 'Failed to create route instance' }, { status: 500 })
    }

    // Create instance stops from all template stops
    const instanceStopsData = stops.map((stop) => ({
      instance_id: instance.id,
      template_stop_id: stop.id,
      customer_id: stop.customer_id,
      stop_order: stop.stop_order,
      stop_type: stop.stop_type || 'pickup',
      driver_notes: stop.driver_notes || null,
      visible_to_driver: true,
    }))

    const { data: insertedStops, error: stopsError } = await supabase
      .from('instance_stops')
      .insert(instanceStopsData)
      .select('id')

    if (stopsError) {
      console.error('Error creating instance stops:', stopsError)
      // Clean up the instance on failure
      await supabase.from('route_instances').delete().eq('id', instance.id)
      return NextResponse.json(
        { error: `Failed to create instance stops: ${stopsError.message}` },
        { status: 500 }
      )
    }

    const actualStopCount = insertedStops?.length ?? 0

    if (actualStopCount === 0) {
      console.error('Instance stops insert returned 0 rows — possible RLS or constraint issue')
      // Clean up the empty instance
      await supabase.from('route_instances').delete().eq('id', instance.id)
      return NextResponse.json(
        { error: 'Stops were not created. Check database permissions.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ...instance,
      template_name: templateRes.data.name,
      stop_count: actualStopCount,
    }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
