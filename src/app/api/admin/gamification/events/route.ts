import { NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { getAllEvents, createGlobalEvent, deactivateEvent } from '@/lib/gamification'
import { sendXPEventAnnouncementEmail } from '@/lib/email'
import type { XPEventType } from '@/types/database'

// Track active background sends to prevent concurrent execution for same event
const activeEventSends = new Set<string>()

/**
 * Convert datetime-local string to Date object treating input as Brazil time (UTC-3)
 * datetime-local format: "2024-01-30T14:00" (no timezone info)
 */
function parseBrazilDateTime(dateString: string): Date {
  // datetime-local gives us "2024-01-30T14:00" without seconds or timezone
  // Append seconds and Brazil timezone offset (UTC-3)
  const normalized = dateString.includes(':') && dateString.split(':').length === 2
    ? dateString + ':00'
    : dateString
  return new Date(normalized + '-03:00')
}

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

/**
 * Send XP event announcement emails to all users with notifications enabled
 * Runs in background with rate limiting and deduplication tracking
 */
async function sendEventEmailsInBackground(
  eventId: string,
  eventName: string,
  eventType: '2x' | '3x',
  endDate: Date
) {
  // Prevent concurrent sends for the same event
  if (activeEventSends.has(eventId)) {
    console.log('[XP Event] Email send already in progress for event:', eventId)
    return
  }

  activeEventSends.add(eventId)
  console.log('[XP Event] Starting background email send for event:', eventName, '(ID:', eventId, ')')

  // Use service role client for database operations
  const supabase = createServiceRoleClient()

  try {
    // Get all users with email notifications enabled
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: users, error } = await (supabase as any)
      .from('profiles')
      .select('id, email, full_name, unsubscribe_token, email_notifications_enabled')

    if (error) {
      console.error('[XP Event] Failed to fetch users:', error)
      return
    }

    // Get users who already received email for this event
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: alreadySent } = await (supabase as any)
      .from('xp_event_email_sends')
      .select('user_id')
      .eq('event_id', eventId)

    const alreadySentUserIds = new Set((alreadySent || []).map((s: { user_id: string }) => s.user_id))

    // Filter users who have notifications enabled and haven't received this email
    type UserProfile = {
      id: string
      email: string
      full_name: string | null
      unsubscribe_token: string | null
      email_notifications_enabled?: boolean
    }

    const eligibleUsers = (users || []).filter(
      (u: UserProfile) =>
        u.email_notifications_enabled !== false &&
        !alreadySentUserIds.has(u.id)
    ) as UserProfile[]

    if (eligibleUsers.length === 0) {
      console.log('[XP Event] No new users to send emails to (all already received)')
      return
    }

    console.log(`[XP Event] Sending emails to ${eligibleUsers.length} users (${alreadySentUserIds.size} already received)`)

    const formattedEndDate = endDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    // Send emails sequentially with rate limiting (Resend limit: 2 req/sec = 500ms between emails)
    const DELAY_BETWEEN_EMAILS_MS = 500

    let sentCount = 0
    let failedCount = 0

    for (const user of eligibleUsers) {
      try {
        const result = await sendXPEventAnnouncementEmail(
          user.email,
          user.full_name,
          eventName,
          eventType,
          formattedEndDate,
          user.unsubscribe_token || undefined
        )

        // Track the send in the database
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('xp_event_email_sends')
          .insert({
            event_id: eventId,
            user_id: user.id,
            email: user.email,
            resend_email_id: result?.data?.id || null,
            status: result?.success ? 'sent' : 'failed'
          })
          .onConflict('event_id,user_id')
          .ignore() // Skip if already exists (race condition protection)

        if (result?.success) {
          sentCount++
        } else {
          failedCount++
        }
      } catch (err) {
        console.error(`[XP Event] Failed to send to ${user.email}:`, err)
        failedCount++

        // Still track the failed attempt
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('xp_event_email_sends')
          .insert({
            event_id: eventId,
            user_id: user.id,
            email: user.email,
            status: 'failed'
          })
          .onConflict('event_id,user_id')
          .ignore()
      }

      // Delay between emails to respect rate limit
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_EMAILS_MS))
    }

    console.log(`[XP Event] Finished: ${sentCount} sent, ${failedCount} failed out of ${eligibleUsers.length} users`)
  } finally {
    activeEventSends.delete(eventId)
  }
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

    // Validate dates - treat input as Brazil time (UTC-3)
    const startDate = parseBrazilDateTime(start_at)
    const endDate = parseBrazilDateTime(end_at)

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

    // Create event (use already parsed Brazil time dates)
    const event = await createGlobalEvent(
      name,
      description || '',
      multiplier_type as XPEventType,
      startDate,
      endDate,
      adminId,
      supabase
    )

    if (!event) {
      return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
    }

    // Check if XP event email automation is enabled before sending
    if (target_type === 'all' || !target_type) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: automation } = await (supabase as any)
        .from('email_automations')
        .select('is_enabled, is_paused')
        .eq('trigger_event', 'xp_event_created')
        .eq('email_type', 'xp_event_announcement')
        .single()

      // Only send if automation exists and is enabled and not paused
      if (automation?.is_enabled && !automation?.is_paused) {
        sendEventEmailsInBackground(
          event.id,
          name,
          multiplier_type as '2x' | '3x',
          endDate
        ).catch(err => console.error('[XP Event] Background email sending failed:', err))
      } else {
        console.log('[XP Event] Email automation is disabled or paused, skipping email send')
      }
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
