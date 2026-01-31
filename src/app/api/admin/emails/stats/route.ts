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

// GET - Fetch email send statistics
export async function GET() {
  try {
    const supabase = await createClient()

    // Check if user is master admin
    const adminId = await checkMasterAdmin(supabase)
    if (!adminId) {
      return NextResponse.json({ error: 'Forbidden - Master admin only' }, { status: 403 })
    }

    const supabaseAdmin = createServiceRoleClient()

    // Get totals
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

    // Total all time
    const { count: allTimeCount } = await supabaseAdmin
      .from('email_tracking')
      .select('*', { count: 'exact', head: true })

    // Last 7 days
    const { count: last7DaysCount } = await supabaseAdmin
      .from('email_tracking')
      .select('*', { count: 'exact', head: true })
      .gte('sent_at', sevenDaysAgo)

    // Last 30 days
    const { count: last30DaysCount } = await supabaseAdmin
      .from('email_tracking')
      .select('*', { count: 'exact', head: true })
      .gte('sent_at', thirtyDaysAgo)

    // Get enabled count from email_config
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: configs } = await (supabaseAdmin as any)
      .from('email_config')
      .select('is_enabled') as { data: Array<{ is_enabled: boolean }> | null }

    const enabledCount = configs?.filter(c => c.is_enabled).length || 0
    const totalCount = configs?.length || 19

    // Stats by email type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: byTypeData } = await (supabaseAdmin as any)
      .from('email_tracking')
      .select('email_type, sent_at')
      .order('sent_at', { ascending: false }) as { data: Array<{ email_type: string; sent_at: string }> | null }

    // Process by type stats
    const typeStats: Record<string, { count: number; last_7_days: number; last_30_days: number; last_sent: string | null }> = {}

    byTypeData?.forEach(record => {
      if (!typeStats[record.email_type]) {
        typeStats[record.email_type] = {
          count: 0,
          last_7_days: 0,
          last_30_days: 0,
          last_sent: null
        }
      }

      typeStats[record.email_type].count++

      if (!typeStats[record.email_type].last_sent) {
        typeStats[record.email_type].last_sent = record.sent_at
      }

      if (record.sent_at >= sevenDaysAgo) {
        typeStats[record.email_type].last_7_days++
      }
      if (record.sent_at >= thirtyDaysAgo) {
        typeStats[record.email_type].last_30_days++
      }
    })

    const byType = Object.entries(typeStats).map(([email_type, stats]) => ({
      email_type,
      ...stats
    }))

    // Stats by day (last 30 days)
    const byDayMap: Record<string, number> = {}
    byTypeData?.forEach(record => {
      if (record.sent_at >= thirtyDaysAgo) {
        const date = record.sent_at.split('T')[0]
        byDayMap[date] = (byDayMap[date] || 0) + 1
      }
    })

    const byDay = Object.entries(byDayMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return NextResponse.json({
      totals: {
        all_time: allTimeCount || 0,
        last_7_days: last7DaysCount || 0,
        last_30_days: last30DaysCount || 0,
        enabled: enabledCount,
        total: totalCount
      },
      by_type: byType,
      by_day: byDay
    })
  } catch (error) {
    console.error('[Email Stats] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
