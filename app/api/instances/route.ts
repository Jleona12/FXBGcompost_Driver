import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getTodayEastern } from '@/lib/utils'

// GET — list active route instances for the driver home screen
export async function GET() {
  try {
    const today = getTodayEastern()

    // Auto-archive past instances
    await supabase
      .from('route_instances')
      .update({ status: 'archived' })
      .eq('status', 'active')
      .lt('date', today)

    // Fetch active instances with template name
    const { data: instances, error } = await supabase
      .from('route_instances')
      .select('*, template:route_templates(name)')
      .eq('status', 'active')
      .order('date', { ascending: true })

    if (error) {
      console.error('Error fetching instances:', error)
      return NextResponse.json({ error: 'Failed to fetch routes' }, { status: 500 })
    }

    // Get stop counts
    const instanceIds = (instances || []).map(i => i.id)
    const { data: stops } = await supabase
      .from('instance_stops')
      .select('instance_id')
      .in('instance_id', instanceIds.length > 0 ? instanceIds : [-1])
      .eq('visible_to_driver', true)

    const countMap: Record<number, number> = {}
    for (const s of stops || []) {
      countMap[s.instance_id] = (countMap[s.instance_id] || 0) + 1
    }

    const result = (instances || []).map((inst: any) => ({
      id: inst.id,
      template_id: inst.template_id,
      date: inst.date,
      status: inst.status,
      notes: inst.notes,
      created_at: inst.created_at,
      template_name: inst.template?.name || 'Route',
      stop_count: countMap[inst.id] || 0,
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
