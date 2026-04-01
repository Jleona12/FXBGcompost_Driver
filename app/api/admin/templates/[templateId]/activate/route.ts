import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST — create a route instance from a template
export async function POST(
  request: NextRequest,
  { params }: { params: { templateId: string } }
) {
  try {
    const templateId = parseInt(params.templateId, 10)
    if (isNaN(templateId) || templateId < 1) {
      return NextResponse.json({ error: 'Invalid template ID' }, { status: 400 })
    }

    const body = await request.json()

    if (!body.date) {
      return NextResponse.json({ error: 'date is required' }, { status: 400 })
    }

    if (!Array.isArray(body.stops) || body.stops.length === 0) {
      return NextResponse.json({ error: 'stops array is required' }, { status: 400 })
    }

    // Verify template exists
    const { data: template, error: templateError } = await supabase
      .from('route_templates')
      .select('id, name')
      .eq('id', templateId)
      .single()

    if (templateError || !template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Create the route instance
    const { data: instance, error: instanceError } = await supabase
      .from('route_instances')
      .insert({
        template_id: templateId,
        date: body.date,
        status: 'active',
        notes: body.notes || null,
      })
      .select()
      .single()

    if (instanceError || !instance) {
      console.error('Error creating instance:', instanceError)
      return NextResponse.json({ error: 'Failed to create route instance' }, { status: 500 })
    }

    // Create instance stops from the provided stops
    const instanceStops = body.stops.map((stop: any) => ({
      instance_id: instance.id,
      template_stop_id: stop.template_stop_id || null,
      customer_id: stop.customer_id,
      stop_order: stop.stop_order,
      stop_type: stop.stop_type || 'pickup',
      driver_notes: stop.driver_notes || null,
      visible_to_driver: stop.visible_to_driver !== false,
    }))

    const { error: stopsError } = await supabase
      .from('instance_stops')
      .insert(instanceStops)

    if (stopsError) {
      console.error('Error creating instance stops:', stopsError)
      // Clean up the instance on failure
      await supabase.from('route_instances').delete().eq('id', instance.id)
      return NextResponse.json({ error: 'Failed to create instance stops' }, { status: 500 })
    }

    return NextResponse.json({
      ...instance,
      template_name: template.name,
      stop_count: instanceStops.length,
    }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
