import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET all templates with stop counts
export async function GET() {
  try {
    const { data: templates, error } = await supabase
      .from('route_templates')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching templates:', error)
      return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
    }

    // Get stop counts
    const templateIds = (templates || []).map(t => t.id)
    const { data: stops } = await supabase
      .from('template_stops')
      .select('template_id')
      .in('template_id', templateIds.length > 0 ? templateIds : [-1])

    const countMap: Record<number, number> = {}
    for (const s of stops || []) {
      countMap[s.template_id] = (countMap[s.template_id] || 0) + 1
    }

    const result = (templates || []).map(t => ({
      ...t,
      stop_count: countMap[t.id] || 0,
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST create new template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.name?.trim()) {
      return NextResponse.json({ error: 'Template name is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('route_templates')
      .insert({
        name: body.name.trim(),
        frequency: body.frequency || 'weekly',
        notes: body.notes || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating template:', error)
      return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
    }

    return NextResponse.json({ ...data, stop_count: 0 }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
