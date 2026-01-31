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
      // If the hour has passed today, schedule for tomorrow
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1)
      }
    } else if (scheduleType === 'weekly' && scheduleDay !== null) {
      // scheduleDay is 0-6 (Sun-Sat)
      const currentDay = now.getDay()
      let daysUntil = scheduleDay - currentDay
      if (daysUntil < 0 || (daysUntil === 0 && nextRun <= now)) {
        daysUntil += 7
      }
      nextRun.setDate(nextRun.getDate() + daysUntil)
    } else if (scheduleType === 'monthly' && scheduleDay !== null) {
      // scheduleDay is 1-31
      nextRun.setDate(scheduleDay)
      if (nextRun <= now) {
        nextRun.setMonth(nextRun.getMonth() + 1)
      }
    }

    return nextRun.toISOString()
  }

  // Event-based triggers don't have a next_run_at
  return null
}

// GET - List all automations
export async function GET() {
  try {
    const supabase = await createClient()

    const adminId = await checkMasterAdmin(supabase)
    if (!adminId) {
      return NextResponse.json({ error: 'Forbidden - Master admin only' }, { status: 403 })
    }

    const supabaseAdmin = createServiceRoleClient()

    // Get automations with email config name
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: automations, error } = await (supabaseAdmin as any)
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
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[Automations] Error fetching:', error)
      return NextResponse.json({ error: 'Failed to fetch automations' }, { status: 500 })
    }

    return NextResponse.json({ automations })
  } catch (error) {
    console.error('[Automations] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new automation
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

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
      is_enabled
    } = body

    // Validate required fields
    if (!name || !email_type || !trigger_type) {
      return NextResponse.json(
        { error: 'name, email_type, and trigger_type are required' },
        { status: 400 }
      )
    }

    // Validate trigger-specific fields
    if (trigger_type === 'event' && !trigger_event) {
      return NextResponse.json(
        { error: 'trigger_event is required for event-based automations' },
        { status: 400 }
      )
    }

    if (trigger_type === 'scheduled' && !schedule_type) {
      return NextResponse.json(
        { error: 'schedule_type is required for scheduled automations' },
        { status: 400 }
      )
    }

    if (trigger_type === 'one_time' && !one_time_datetime) {
      return NextResponse.json(
        { error: 'one_time_datetime is required for one-time automations' },
        { status: 400 }
      )
    }

    const supabaseAdmin = createServiceRoleClient()

    // Calculate next run time
    const next_run_at = calculateNextRunAt(
      trigger_type,
      schedule_type || null,
      schedule_day ?? null,
      schedule_hour ?? 10,
      one_time_datetime || null
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: automation, error } = await (supabaseAdmin as any)
      .from('email_automations')
      .insert({
        name,
        description: description || null,
        email_type,
        segment_type: segment_type || 'all_users',
        trigger_type,
        trigger_event: trigger_type === 'event' ? trigger_event : null,
        trigger_delay_hours: trigger_delay_hours ?? 0,
        schedule_type: trigger_type === 'scheduled' ? schedule_type : null,
        schedule_day: schedule_day ?? null,
        schedule_hour: schedule_hour ?? 10,
        one_time_datetime: trigger_type === 'one_time' ? one_time_datetime : null,
        max_sends_per_user: max_sends_per_user ?? null,
        min_days_between_sends: min_days_between_sends ?? 1,
        is_enabled: is_enabled ?? false,
        next_run_at,
        created_by: adminId
      })
      .select()
      .single()

    if (error) {
      console.error('[Automations] Error creating:', error)
      return NextResponse.json({ error: 'Failed to create automation: ' + error.message }, { status: 500 })
    }

    return NextResponse.json({ automation }, { status: 201 })
  } catch (error) {
    console.error('[Automations] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
