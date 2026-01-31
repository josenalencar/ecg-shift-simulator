import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { sendAutomationEmail } from '@/lib/email'

// Verify cron secret for security
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.warn('[Cron Automations] CRON_SECRET not set')
    return false
  }

  return authHeader === `Bearer ${cronSecret}`
}

// Calculate next run time based on schedule
function calculateNextRunAt(
  scheduleType: string,
  scheduleDay: number | null,
  scheduleHour: number
): string {
  const now = new Date()
  const nextRun = new Date(now)
  nextRun.setHours(scheduleHour, 0, 0, 0)

  if (scheduleType === 'daily') {
    nextRun.setDate(nextRun.getDate() + 1)
  } else if (scheduleType === 'weekly' && scheduleDay !== null) {
    nextRun.setDate(nextRun.getDate() + 7)
  } else if (scheduleType === 'monthly') {
    nextRun.setMonth(nextRun.getMonth() + 1)
  }

  return nextRun.toISOString()
}

// GET - Execute due automations (called by Vercel Cron)
export async function GET(request: NextRequest) {
  // Verify cron secret
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceRoleClient()
  const results: Array<{ automationId: string; name: string; sent: number; failed: number }> = []

  try {
    console.log('[Cron Automations] Starting scheduled execution...')

    // Find due automations
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: automations, error: fetchError } = await (supabase as any)
      .from('email_automations')
      .select('*')
      .eq('is_enabled', true)
      .eq('is_paused', false)
      .lte('next_run_at', new Date().toISOString())
      .not('next_run_at', 'is', null)

    if (fetchError) {
      console.error('[Cron Automations] Error fetching automations:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch automations' }, { status: 500 })
    }

    if (!automations || automations.length === 0) {
      console.log('[Cron Automations] No automations due')
      return NextResponse.json({ message: 'No automations due', results: [] })
    }

    console.log(`[Cron Automations] Found ${automations.length} automations to execute`)

    // Process each automation
    for (const automation of automations) {
      let sent = 0
      let failed = 0

      try {
        // Build users query based on segment
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let usersQuery = (supabase as any)
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
        }

        const { data: users, error: usersError } = await usersQuery

        if (usersError) {
          console.error(`[Cron Automations] Error fetching users for ${automation.name}:`, usersError)
          continue
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
          const { data: previousSends } = await (supabase as any)
            .from('email_automation_sends')
            .select('user_id, sent_at')
            .eq('automation_id', automation.id)

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

            if (automation.max_sends_per_user && userSends.count >= automation.max_sends_per_user) {
              return false
            }

            if (userSends.lastSent && now.getTime() - userSends.lastSent.getTime() < minDaysMs) {
              return false
            }

            return true
          })
        }

        // Send emails (batch to avoid rate limits)
        const BATCH_SIZE = 50
        for (let i = 0; i < filteredUsers.length; i += BATCH_SIZE) {
          const batch = filteredUsers.slice(i, i + BATCH_SIZE)

          await Promise.all(
            batch.map(async (user: UserRow) => {
              if (!user.email) return

              try {
                const result = await sendAutomationEmail(
                  user.email,
                  automation.email_type,
                  {
                    name: user.full_name?.split(' ')[0] || user.email.split('@')[0],
                    email: user.email
                  }
                )

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await (supabase as any)
                  .from('email_automation_sends')
                  .insert({
                    automation_id: automation.id,
                    user_id: user.id,
                    email_type: automation.email_type,
                    resend_email_id: result.emailId || null,
                    status: result.success ? 'sent' : 'failed',
                    error_message: result.success ? null : result.error
                  })

                if (result.success) sent++
                else failed++
              } catch {
                failed++
              }
            })
          )

          // Small delay between batches
          if (i + BATCH_SIZE < filteredUsers.length) {
            await new Promise(resolve => setTimeout(resolve, 100))
          }
        }

        // Update automation stats and next run
        const updateData: Record<string, unknown> = {
          last_run_at: new Date().toISOString(),
          total_sent: automation.total_sent + sent
        }

        // Calculate next run for scheduled automations
        if (automation.trigger_type === 'scheduled') {
          updateData.next_run_at = calculateNextRunAt(
            automation.schedule_type,
            automation.schedule_day,
            automation.schedule_hour
          )
        } else if (automation.trigger_type === 'one_time') {
          // Disable one-time automations after execution
          updateData.is_enabled = false
          updateData.next_run_at = null
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('email_automations')
          .update(updateData)
          .eq('id', automation.id)

        results.push({
          automationId: automation.id,
          name: automation.name,
          sent,
          failed
        })

        console.log(`[Cron Automations] ${automation.name}: ${sent} sent, ${failed} failed`)
      } catch (err) {
        console.error(`[Cron Automations] Error processing ${automation.name}:`, err)
        results.push({
          automationId: automation.id,
          name: automation.name,
          sent,
          failed: failed + 1
        })
      }
    }

    console.log('[Cron Automations] Execution complete')

    return NextResponse.json({
      success: true,
      executed: results.length,
      results
    })
  } catch (error) {
    console.error('[Cron Automations] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
