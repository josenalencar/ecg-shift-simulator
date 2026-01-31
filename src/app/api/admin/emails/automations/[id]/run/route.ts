import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { sendAutomationEmail } from '@/lib/email'

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

interface RouteContext {
  params: Promise<{ id: string }>
}

// POST - Manually trigger an automation
export async function POST(
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

    // Get automation details
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: automation, error: autoError } = await (supabaseAdmin as any)
      .from('email_automations')
      .select('*')
      .eq('id', id)
      .single()

    if (autoError || !automation) {
      return NextResponse.json({ error: 'Automation not found' }, { status: 404 })
    }

    // Get email config
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: emailConfig, error: configError } = await (supabaseAdmin as any)
      .from('email_config')
      .select('*')
      .eq('email_type', automation.email_type)
      .single()

    if (configError || !emailConfig) {
      return NextResponse.json({ error: 'Email config not found' }, { status: 404 })
    }

    // Build users query based on segment
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let usersQuery = (supabaseAdmin as any)
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        granted_plan,
        subscriptions (
          plan,
          status
        ),
        user_gamification_stats (
          last_activity_date
        )
      `)
      .not('email', 'is', null)

    // Apply segment filter
    const segment = automation.segment_type
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

    switch (segment) {
      case 'free':
        usersQuery = usersQuery
          .is('granted_plan', null)
          .or('subscriptions.is.null,subscriptions.status.neq.active')
        break
      case 'premium':
        usersQuery = usersQuery.or(
          'granted_plan.eq.premium,granted_plan.eq.ai'
        )
        break
      case 'premium_ai':
        usersQuery = usersQuery.eq('granted_plan', 'ai')
        break
      case 'ecg_com_ja':
        usersQuery = usersQuery.eq('granted_plan', 'aluno_ecg')
        break
      case 'cortesia':
        usersQuery = usersQuery.not('granted_plan', 'is', null)
        break
      case 'active_7d':
        // Will filter after query
        break
      case 'inactive_30d':
        // Will filter after query
        break
      // 'all_users' - no filter
    }

    const { data: users, error: usersError } = await usersQuery

    if (usersError) {
      console.error('[Automation Run] Error fetching users:', usersError)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    type UserRow = {
      id: string
      email: string | null
      full_name: string | null
      granted_plan: string | null
      subscriptions: { plan: string; status: string }[] | null
      user_gamification_stats: { last_activity_date: string }[] | null
    }

    // Filter users by activity if needed
    let filteredUsers = (users || []) as UserRow[]
    if (segment === 'active_7d') {
      filteredUsers = filteredUsers.filter((u: UserRow) => {
        const stats = u.user_gamification_stats
        const lastActivity = stats?.[0]?.last_activity_date
        return lastActivity && new Date(lastActivity) >= new Date(sevenDaysAgo)
      })
    } else if (segment === 'inactive_30d') {
      filteredUsers = filteredUsers.filter((u: UserRow) => {
        const stats = u.user_gamification_stats
        const lastActivity = stats?.[0]?.last_activity_date
        return !lastActivity || new Date(lastActivity) < new Date(thirtyDaysAgo)
      })
    }

    // Filter by max_sends_per_user and min_days_between_sends
    if (automation.max_sends_per_user || automation.min_days_between_sends > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: previousSends } = await (supabaseAdmin as any)
        .from('email_automation_sends')
        .select('user_id, sent_at')
        .eq('automation_id', id)

      type SendRecord = { user_id: string; sent_at: string }
      const sendsByUser = new Map<string, { count: number; lastSent: Date | null }>()
      ;(previousSends as SendRecord[] | null)?.forEach((send: SendRecord) => {
        const existing = sendsByUser.get(send.user_id) || { count: 0, lastSent: null }
        existing.count++
        const sentAt = new Date(send.sent_at)
        if (!existing.lastSent || sentAt > existing.lastSent) {
          existing.lastSent = sentAt
        }
        sendsByUser.set(send.user_id, existing)
      })

      const minDaysMs = (automation.min_days_between_sends || 1) * 24 * 60 * 60 * 1000

      filteredUsers = filteredUsers.filter((user: UserRow) => {
        const userSends = sendsByUser.get(user.id)
        if (!userSends) return true

        // Check max sends
        if (automation.max_sends_per_user && userSends.count >= automation.max_sends_per_user) {
          return false
        }

        // Check min days between sends
        if (userSends.lastSent && now.getTime() - userSends.lastSent.getTime() < minDaysMs) {
          return false
        }

        return true
      })
    }

    // Send emails
    let sent = 0
    let failed = 0
    const errors: string[] = []

    for (const user of filteredUsers) {
      if (!user.email) continue

      try {
        const result = await sendAutomationEmail(
          user.email,
          automation.email_type,
          {
            name: user.full_name?.split(' ')[0] || user.email.split('@')[0],
            email: user.email
          }
        )

        // Record the send
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabaseAdmin as any)
          .from('email_automation_sends')
          .insert({
            automation_id: id,
            user_id: user.id,
            email_type: automation.email_type,
            resend_email_id: result.emailId || null,
            status: result.success ? 'sent' : 'failed',
            error_message: result.success ? null : result.error
          })

        if (result.success) {
          sent++
        } else {
          failed++
          errors.push(`${user.email}: ${result.error}`)
        }
      } catch (err) {
        failed++
        const errMsg = err instanceof Error ? err.message : 'Unknown error'
        errors.push(`${user.email}: ${errMsg}`)
      }
    }

    // Update automation stats
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabaseAdmin as any)
      .from('email_automations')
      .update({
        last_run_at: new Date().toISOString(),
        total_sent: automation.total_sent + sent
      })
      .eq('id', id)

    return NextResponse.json({
      success: true,
      sent,
      failed,
      total: filteredUsers.length,
      errors: errors.slice(0, 10) // Limit errors returned
    })
  } catch (error) {
    console.error('[Automation Run] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
