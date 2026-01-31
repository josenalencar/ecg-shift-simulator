import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

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

// Calculate next run time based on schedule configuration
function calculateNextRunAt(
  triggerType: string,
  scheduleType: string | null,
  scheduleDay: number | null,
  scheduleHour: number,
  oneTimeDatetime: string | null
): string | null {
  const now = new Date()

  if (triggerType === 'one_time' && oneTimeDatetime) {
    return oneTimeDatetime
  }

  if (triggerType === 'scheduled' && scheduleType) {
    const nextRun = new Date(now)
    nextRun.setHours(scheduleHour, 0, 0, 0)

    if (scheduleType === 'daily') {
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1)
      }
    } else if (scheduleType === 'weekly' && scheduleDay !== null) {
      const currentDay = now.getDay()
      let daysUntil = scheduleDay - currentDay
      if (daysUntil < 0 || (daysUntil === 0 && nextRun <= now)) {
        daysUntil += 7
      }
      nextRun.setDate(nextRun.getDate() + daysUntil)
    } else if (scheduleType === 'monthly' && scheduleDay !== null) {
      nextRun.setDate(scheduleDay)
      if (nextRun <= now) {
        nextRun.setMonth(nextRun.getMonth() + 1)
      }
    }

    return nextRun.toISOString()
  }

  return null
}

interface RouteContext {
  params: Promise<{ id: string }>
}

// GET - Get single automation
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const supabase = await createClient()
    const { id } = await context.params

    const adminId = await checkMasterAdmin(supabase)
    if (!adminId) {
      return NextResponse.json({ error: 'Forbidden - Master admin only' }, { status: 403 })
    }

    const supabaseAdmin = createServiceRoleClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: automation, error } = await (supabaseAdmin as any)
      .from('email_automations')
      .select(`
        *,
        email_config!email_type (
          name_pt,
          category
        ),
        creator:profiles!created_by (
          full_name,
          email
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('[Automations] Error fetching:', error)
      return NextResponse.json({ error: 'Automation not found' }, { status: 404 })
    }

    // Get send history for this automation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: sends } = await (supabaseAdmin as any)
      .from('email_automation_sends')
      .select('id, sent_at, status')
      .eq('automation_id', id)
      .order('sent_at', { ascending: false })
      .limit(100)

    return NextResponse.json({ automation, sends })
  } catch (error) {
    console.error('[Automations] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update automation
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const supabase = await createClient()
    const { id } = await context.params

    const adminId = await checkMasterAdmin(supabase)
    if (!adminId) {
      return NextResponse.json({ error: 'Forbidden - Master admin only' }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      description,
      email_type,
      segment_type,
      trigger_type,
      trigger_event,
      trigger_delay_hours,
      schedule_type,
      schedule_day,
      schedule_hour,
      one_time_datetime,
      max_sends_per_user,
      min_days_between_sends,
      is_enabled,
      is_paused
    } = body

    const supabaseAdmin = createServiceRoleClient()

    // Build update object
    const updateData: Record<string, unknown> = {}

    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (email_type !== undefined) updateData.email_type = email_type
    if (segment_type !== undefined) updateData.segment_type = segment_type
    if (trigger_type !== undefined) updateData.trigger_type = trigger_type
    if (trigger_event !== undefined) updateData.trigger_event = trigger_event
    if (trigger_delay_hours !== undefined) updateData.trigger_delay_hours = trigger_delay_hours
    if (schedule_type !== undefined) updateData.schedule_type = schedule_type
    if (schedule_day !== undefined) updateData.schedule_day = schedule_day
    if (schedule_hour !== undefined) updateData.schedule_hour = schedule_hour
    if (one_time_datetime !== undefined) updateData.one_time_datetime = one_time_datetime
    if (max_sends_per_user !== undefined) updateData.max_sends_per_user = max_sends_per_user
    if (min_days_between_sends !== undefined) updateData.min_days_between_sends = min_days_between_sends
    if (typeof is_enabled === 'boolean') updateData.is_enabled = is_enabled
    if (typeof is_paused === 'boolean') updateData.is_paused = is_paused

    // Recalculate next_run_at if schedule changed
    if (trigger_type || schedule_type || schedule_day || schedule_hour || one_time_datetime) {
      // Fetch current values for fields not being updated
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: current } = await (supabaseAdmin as any)
        .from('email_automations')
        .select('trigger_type, schedule_type, schedule_day, schedule_hour, one_time_datetime')
        .eq('id', id)
        .single()

      if (current) {
        const finalTriggerType = trigger_type ?? current.trigger_type
        const finalScheduleType = schedule_type ?? current.schedule_type
        const finalScheduleDay = schedule_day ?? current.schedule_day
        const finalScheduleHour = schedule_hour ?? current.schedule_hour
        const finalOneTime = one_time_datetime ?? current.one_time_datetime

        updateData.next_run_at = calculateNextRunAt(
          finalTriggerType,
          finalScheduleType,
          finalScheduleDay,
          finalScheduleHour,
          finalOneTime
        )
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: automation, error } = await (supabaseAdmin as any)
      .from('email_automations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[Automations] Error updating:', error)
      return NextResponse.json({ error: 'Failed to update automation' }, { status: 500 })
    }

    return NextResponse.json({ automation })
  } catch (error) {
    console.error('[Automations] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete automation
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const supabase = await createClient()
    const { id } = await context.params

    const adminId = await checkMasterAdmin(supabase)
    if (!adminId) {
      return NextResponse.json({ error: 'Forbidden - Master admin only' }, { status: 403 })
    }

    const supabaseAdmin = createServiceRoleClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabaseAdmin as any)
      .from('email_automations')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[Automations] Error deleting:', error)
      return NextResponse.json({ error: 'Failed to delete automation' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Automations] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
