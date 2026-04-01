import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST — add a customer stop to a template
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

    if (!body.customer_id) {
      return NextResponse.json({ error: 'customer_id is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('template_stops')
      .insert({
        template_id: templateId,
        customer_id: body.customer_id,
        stop_order: body.stop_order || 1,
        stop_type: body.stop_type || 'pickup',
        driver_notes: body.driver_notes || null,
      })
      .select('*, customer:customers(*)')
      .single()

    if (error) {
      console.error('Error creating template stop:', error)
      return NextResponse.json({ error: 'Failed to add stop' }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE — remove a stop from a template (by stop id in query param)
export async function DELETE(request: NextRequest) {
  try {
    const stopId = request.nextUrl.searchParams.get('stopId')
    if (!stopId) {
      return NextResponse.json({ error: 'stopId query param required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('template_stops')
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
