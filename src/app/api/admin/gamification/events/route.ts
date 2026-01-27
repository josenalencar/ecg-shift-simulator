import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAllEvents, createGlobalEvent, deactivateEvent } from '@/lib/gamification'
import type { XPEventType } from '@/types/database'

async function checkMasterAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('is_master_admin')
    .eq('id', user.id)
    .single()

  return profile?.is_master_admin ? user.id : null
}

export async function GET() {
  try {
    const supabase = await createClient()

    // Check if user is master admin
    const adminId = await checkMasterAdmin(supabase)
    if (!adminId) {
      return NextResponse.json({ error: 'Forbidden - Master admin only' }, { status: 403 })
    }

    // Get all events
    const events = await getAllEvents(supabase)

    return NextResponse.json({ events })
  } catch (error) {
    console.error('Error in get events:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check if user is master admin
    const adminId = await checkMasterAdmin(supabase)
    if (!adminId) {
      return NextResponse.json({ error: 'Forbidden - Master admin only' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, multiplier_type, start_at, end_at, target_type } = body

    // Validate required fields
    if (!name || !multiplier_type || !start_at || !end_at) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate multiplier type
    if (!['2x', '3x'].includes(multiplier_type)) {
      return NextResponse.json({ error: 'Invalid multiplier type' }, { status: 400 })
    }

    // Validate dates
    const startDate = new Date(start_at)
    const endDate = new Date(end_at)

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
    }

    if (endDate <= startDate) {
      return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 })
    }

    // Validate that event is not too far in the past (allow up to 1 hour grace period)
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    if (endDate < oneHourAgo) {
      return NextResponse.json({ error: 'Event end date is in the past' }, { status: 400 })
    }

    // Create event
    const event = await createGlobalEvent(
      name,
      description || '',
      multiplier_type as XPEventType,
      new Date(start_at),
      new Date(end_at),
      adminId,
      supabase
    )

    if (!event) {
      return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
    }

    return NextResponse.json({ event }, { status: 201 })
  } catch (error) {
    console.error('Error in create event:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()

    // Check if user is master admin
    const adminId = await checkMasterAdmin(supabase)
    if (!adminId) {
      return NextResponse.json({ error: 'Forbidden - Master admin only' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('id')

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 })
    }

    // Deactivate event
    const success = await deactivateEvent(eventId, supabase)

    if (!success) {
      return NextResponse.json({ error: 'Failed to deactivate event' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in delete event:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
