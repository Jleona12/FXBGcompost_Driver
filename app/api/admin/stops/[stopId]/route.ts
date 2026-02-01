import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { UpdateStopPayload } from '@/lib/types'

// PUT update stop
export async function PUT(
  request: NextRequest,
  { params }: { params: { stopId: string } }
) {
  try {
    const stopId = parseInt(params.stopId, 10)

    if (isNaN(stopId) || stopId < 1) {
      return NextResponse.json(
        { error: 'Invalid stop ID' },
        { status: 400 }
      )
    }

    const body: UpdateStopPayload = await request.json()

    const updateData: Record<string, any> = {}
    if (body.stop_order !== undefined) updateData.stop_order = body.stop_order
    if (body.stop_type !== undefined) updateData.stop_type = body.stop_type
    if (body.visible_to_driver !== undefined) updateData.visible_to_driver = body.visible_to_driver
    if (body.flags !== undefined) updateData.flags = body.flags
    if (body.flag_notes !== undefined) updateData.flag_notes = body.flag_notes

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('stops')
      .update(updateData)
      .eq('id', stopId)
      .select(`
        *,
        customer:customers(*)
      `)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Stop not found' },
          { status: 404 }
        )
      }
      console.error('Error updating stop:', error)
      return NextResponse.json(
        { error: 'Failed to update stop' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE stop
export async function DELETE(
  request: NextRequest,
  { params }: { params: { stopId: string } }
) {
  try {
    const stopId = parseInt(params.stopId, 10)

    if (isNaN(stopId) || stopId < 1) {
      return NextResponse.json(
        { error: 'Invalid stop ID' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('stops')
      .delete()
      .eq('id', stopId)

    if (error) {
      console.error('Error deleting stop:', error)
      return NextResponse.json(
        { error: 'Failed to delete stop' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
