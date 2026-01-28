import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { sendRenewalReminderEmail } from '@/lib/email'

// Helper to create admin client (bypasses RLS)
function getSupabaseAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

// Cron job runs daily - sends reminder 3 days before renewal
export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.log('[Renewal Reminder] Unauthorized request')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabaseAdmin = getSupabaseAdmin()

    // Calculate the target date (3 days from now)
    const now = new Date()
    const targetDate = new Date(now)
    targetDate.setDate(targetDate.getDate() + 3)

    // Set to start and end of the target day (in UTC)
    const targetStart = new Date(targetDate)
    targetStart.setUTCHours(0, 0, 0, 0)
    const targetEnd = new Date(targetDate)
    targetEnd.setUTCHours(23, 59, 59, 999)

    console.log('[Renewal Reminder] Looking for subscriptions renewing between:',
      targetStart.toISOString(), 'and', targetEnd.toISOString())

    // Find active subscriptions that renew in 3 days and are NOT set to cancel
    const { data: subscriptions, error } = await supabaseAdmin
      .from('subscriptions')
      .select('user_id, plan, current_period_end')
      .eq('status', 'active')
      .eq('cancel_at_period_end', false)
      .gte('current_period_end', targetStart.toISOString())
      .lte('current_period_end', targetEnd.toISOString())

    if (error) {
      console.error('[Renewal Reminder] Error fetching subscriptions:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    console.log('[Renewal Reminder] Found', subscriptions?.length || 0, 'subscriptions to remind')

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No subscriptions to remind',
        count: 0
      })
    }

    // Get user profiles for these subscriptions
    const userIds = subscriptions.map(s => s.user_id)
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name')
      .in('id', userIds)

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])

    // Send emails
    let sentCount = 0
    let errorCount = 0

    for (const sub of subscriptions) {
      const profile = profileMap.get(sub.user_id)
      if (!profile) {
        console.log('[Renewal Reminder] No profile found for user:', sub.user_id)
        errorCount++
        continue
      }

      // Determine plan type and amount
      const plan = sub.plan === 'ai' ? 'ai' : 'premium'
      const amount = plan === 'ai' ? 'R$ 39,90/mês' : 'R$ 19,90/mês'
      const renewalDate = new Date(sub.current_period_end).toLocaleDateString('pt-BR')

      const result = await sendRenewalReminderEmail(
        profile.email,
        profile.full_name,
        plan,
        amount,
        renewalDate
      )

      if (result.success) {
        sentCount++
        console.log('[Renewal Reminder] Sent to:', profile.email)
      } else {
        errorCount++
        console.error('[Renewal Reminder] Failed to send to:', profile.email, result.error)
      }
    }

    console.log('[Renewal Reminder] Complete. Sent:', sentCount, 'Errors:', errorCount)

    return NextResponse.json({
      success: true,
      message: `Sent ${sentCount} renewal reminders`,
      sent: sentCount,
      errors: errorCount
    })
  } catch (error) {
    console.error('[Renewal Reminder] API error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
