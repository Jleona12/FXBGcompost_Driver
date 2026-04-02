import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getTodayEastern } from '@/lib/utils'

// GET all instances (with template name + stop counts), filterable by status
export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get('status') // 'active', 'archived', or null for all

    // Auto-archive past instances (same as driver endpoint)
    if (status === 'active') {
      const today = getTodayEastern()
      await supabase
        .from('route_instances')
        .update({ status: 'archived' })
        .eq('status', 'active')
        .lt('date', today)
    }

    let query = supabase
      .from('route_instances')
      .select('*, template:route_templates(name)')
      .order('date', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data: instances, error } = await query

    if (error) {
      console.error('Error fetching instances:', error)
      return NextResponse.json({ error: 'Failed to fetch instances' }, { status: 500 })
    }

    // Get stop counts
    const instanceIds = (instances || []).map(i => i.id)
    const { data: stops } = await supabase
      .from('instance_stops')
      .select('instance_id')
      .in('instance_id', instanceIds.length > 0 ? instanceIds : [-1])

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
      template_name: inst.template?.name || 'Unknown',
      stop_count: countMap[inst.id] || 0,
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
