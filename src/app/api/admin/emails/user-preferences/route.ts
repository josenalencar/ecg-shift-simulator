import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

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

// GET - Fetch aggregate user email preferences
export async function GET() {
  try {
    const supabase = await createClient()

    // Check if user is master admin
    const adminId = await checkMasterAdmin(supabase)
    if (!adminId) {
      return NextResponse.json({ error: 'Forbidden - Master admin only' }, { status: 403 })
    }

    const supabaseAdmin = createServiceRoleClient()

    // Define preference type
    interface UserEmailPreference {
      emails_enabled: boolean
      marketing_emails: boolean
      onboarding_emails: boolean
      streak_emails: boolean
      achievement_emails: boolean
      weekly_digest: boolean
      monthly_report: boolean
    }

    // Get all user email preferences
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: preferences, error } = await (supabaseAdmin as any)
      .from('user_email_preferences')
      .select('*') as { data: UserEmailPreference[] | null; error: Error | null }

    if (error) {
      console.error('[User Preferences] Error fetching:', error)
      return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 })
    }

    // Get total user count
    const { count: totalUsers } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    // Calculate aggregates
    const stats = {
      total_users: totalUsers || 0,
      users_with_preferences: preferences?.length || 0,
      by_preference: {
        emails_enabled: { enabled: 0, disabled: 0 },
        marketing_emails: { enabled: 0, disabled: 0 },
        onboarding_emails: { enabled: 0, disabled: 0 },
        streak_emails: { enabled: 0, disabled: 0 },
        achievement_emails: { enabled: 0, disabled: 0 },
        weekly_digest: { enabled: 0, disabled: 0 },
        monthly_report: { enabled: 0, disabled: 0 }
      }
    }

    preferences?.forEach(pref => {
      // emails_enabled (master switch)
      if (pref.emails_enabled) {
        stats.by_preference.emails_enabled.enabled++
      } else {
        stats.by_preference.emails_enabled.disabled++
      }

      // marketing_emails
      if (pref.marketing_emails) {
        stats.by_preference.marketing_emails.enabled++
      } else {
        stats.by_preference.marketing_emails.disabled++
      }

      // onboarding_emails
      if (pref.onboarding_emails) {
        stats.by_preference.onboarding_emails.enabled++
      } else {
        stats.by_preference.onboarding_emails.disabled++
      }

      // streak_emails
      if (pref.streak_emails) {
        stats.by_preference.streak_emails.enabled++
      } else {
        stats.by_preference.streak_emails.disabled++
      }

      // achievement_emails
      if (pref.achievement_emails) {
        stats.by_preference.achievement_emails.enabled++
      } else {
        stats.by_preference.achievement_emails.disabled++
      }

      // weekly_digest
      if (pref.weekly_digest) {
        stats.by_preference.weekly_digest.enabled++
      } else {
        stats.by_preference.weekly_digest.disabled++
      }

      // monthly_report
      if (pref.monthly_report) {
        stats.by_preference.monthly_report.enabled++
      } else {
        stats.by_preference.monthly_report.disabled++
      }
    })

    return NextResponse.json(stats)
  } catch (error) {
    console.error('[User Preferences] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
