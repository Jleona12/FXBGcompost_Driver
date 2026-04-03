import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST — duplicate a route template and all its stops
export async function POST(
  request: NextRequest,
  { params }: { params: { templateId: string } }
) {
  try {
    const templateId = parseInt(params.templateId, 10)
    if (isNaN(templateId) || templateId < 1) {
      return NextResponse.json({ error: 'Invalid template ID' }, { status: 400 })
    }

    // Fetch original template + stops
    const [templateRes, stopsRes] = await Promise.all([
      supabase
        .from('route_templates')
        .select('*')
        .eq('id', templateId)
        .single(),
      supabase
        .from('template_stops')
        .select('customer_id, stop_order, stop_type, driver_notes')
        .eq('template_id', templateId)
        .order('stop_order', { ascending: true }),
    ])

    if (templateRes.error || !templateRes.data) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    const original = templateRes.data

    // Create copy with "(Copy)" suffix
    const { data: newTemplate, error: createError } = await supabase
      .from('route_templates')
      .insert({
        name: `${original.name} (Copy)`,
        notes: original.notes,
        is_active: true,
      })
      .select()
      .single()

    if (createError || !newTemplate) {
      console.error('Error copying template:', createError)
      return NextResponse.json({ error: 'Failed to copy route' }, { status: 500 })
    }

    // Copy stops
    const originalStops = stopsRes.data || []
    if (originalStops.length > 0) {
      const newStops = originalStops.map((s) => ({
        template_id: newTemplate.id,
        customer_id: s.customer_id,
        stop_order: s.stop_order,
        stop_type: s.stop_type,
        driver_notes: s.driver_notes,
      }))

      const { error: stopsError } = await supabase
        .from('template_stops')
        .insert(newStops)

      if (stopsError) {
        console.error('Error copying stops:', stopsError)
        // Clean up the new template
        await supabase.from('route_templates').delete().eq('id', newTemplate.id)
        return NextResponse.json({ error: 'Failed to copy route stops' }, { status: 500 })
      }
    }

    return NextResponse.json(
      { ...newTemplate, stop_count: originalStops.length },
      { status: 201 }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
