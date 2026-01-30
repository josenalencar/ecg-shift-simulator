import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

// Service role client for updating stats (bypasses RLS)
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } }
)

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

interface AttemptDate {
  user_id: string
  created_at: string
}

interface StreakResult {
  userId: string
  previousCurrentStreak: number
  previousLongestStreak: number
  newCurrentStreak: number
  newLongestStreak: number
  uniqueDays: number
  fixed: boolean
}

function calculateStreakFromDates(dates: Date[]): { currentStreak: number; longestStreak: number } {
  if (dates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 }
  }

  // Sort dates ascending
  const sortedDates = [...dates].sort((a, b) => a.getTime() - b.getTime())

  // Get unique days only
  const uniqueDays: Date[] = []
  for (const date of sortedDates) {
    const dayStr = date.toISOString().split('T')[0]
    if (uniqueDays.length === 0 || uniqueDays[uniqueDays.length - 1].toISOString().split('T')[0] !== dayStr) {
      uniqueDays.push(new Date(dayStr))
    }
  }

  if (uniqueDays.length === 0) {
    return { currentStreak: 0, longestStreak: 0 }
  }

  let longestStreak = 1
  let tempStreak = 1

  // Calculate longest streak
  for (let i = 1; i < uniqueDays.length; i++) {
    const prevDay = uniqueDays[i - 1]
    const currDay = uniqueDays[i]
    const diffDays = Math.floor((currDay.getTime() - prevDay.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      tempStreak++
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak
      }
    } else {
      tempStreak = 1
    }
  }

  // Calculate current streak (must include today or yesterday)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const lastActivity = uniqueDays[uniqueDays.length - 1]
  lastActivity.setHours(0, 0, 0, 0)

  let currentStreak = 0
  if (lastActivity.getTime() >= yesterday.getTime()) {
    // Streak is still active, count backwards
    currentStreak = 1
    for (let i = uniqueDays.length - 2; i >= 0; i--) {
      const currDay = uniqueDays[i + 1]
      const prevDay = uniqueDays[i]
      const diffDays = Math.floor((currDay.getTime() - prevDay.getTime()) / (1000 * 60 * 60 * 24))

      if (diffDays === 1) {
        currentStreak++
      } else {
        break
      }
    }
  }

  return { currentStreak, longestStreak }
}

/**
 * POST /api/admin/recalculate-streaks
 *
 * Recalculates all user streaks from their actual attempt history.
 * This fixes any data corruption where streaks don't match consecutive days.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check if user is master admin
    const adminId = await checkMasterAdmin(supabase)
    if (!adminId) {
      return NextResponse.json({ error: 'Forbidden - Master admin only' }, { status: 403 })
    }

    // Get optional userId from request body
    let targetUserId: string | null = null
    try {
      const body = await request.json()
      targetUserId = body.userId || null
    } catch {
      // No body - recalculate all users
    }

    // Get all attempts
    let attemptsQuery = supabaseAdmin
      .from('attempts')
      .select('user_id, created_at')
      .order('created_at', { ascending: true })

    if (targetUserId) {
      attemptsQuery = attemptsQuery.eq('user_id', targetUserId)
    }

    const { data: attempts, error: attemptsError } = await attemptsQuery

    if (attemptsError) {
      console.error('Failed to fetch attempts:', attemptsError)
      return NextResponse.json({ error: 'Failed to fetch attempts' }, { status: 500 })
    }

    if (!attempts || attempts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No attempts found',
        usersProcessed: 0,
        usersFixed: 0,
        details: [],
      })
    }

    // Group attempts by user
    const userAttempts = new Map<string, Date[]>()
    for (const attempt of attempts as AttemptDate[]) {
      if (!userAttempts.has(attempt.user_id)) {
        userAttempts.set(attempt.user_id, [])
      }
      userAttempts.get(attempt.user_id)!.push(new Date(attempt.created_at))
    }

    // Get current stats for all users
    const userIds = Array.from(userAttempts.keys())
    const { data: existingStats } = await supabaseAdmin
      .from('user_gamification_stats')
      .select('user_id, current_streak, longest_streak')
      .in('user_id', userIds)

    type StatsRow = { user_id: string; current_streak: number; longest_streak: number }
    const existingStatsMap = new Map<string, StatsRow>()
    ;(existingStats as StatsRow[] | null)?.forEach(stat => {
      existingStatsMap.set(stat.user_id, stat)
    })

    // Recalculate and update each user
    const results: StreakResult[] = []
    let usersFixed = 0

    for (const [userId, dates] of userAttempts) {
      const currentStats = existingStatsMap.get(userId)
      const { currentStreak, longestStreak } = calculateStreakFromDates(dates)

      const prevCurrent = currentStats?.current_streak ?? 0
      const prevLongest = currentStats?.longest_streak ?? 0

      const needsUpdate = prevCurrent !== currentStreak || prevLongest !== longestStreak

      if (needsUpdate) {
        const lastActivity = dates.length > 0
          ? dates[dates.length - 1].toISOString().split('T')[0]
          : null

        await supabaseAdmin
          .from('user_gamification_stats')
          .update({
            current_streak: currentStreak,
            longest_streak: longestStreak,
            last_activity_date: lastActivity,
          })
          .eq('user_id', userId)

        usersFixed++
      }

      // Get unique days count
      const uniqueDays = new Set(dates.map(d => d.toISOString().split('T')[0])).size

      results.push({
        userId,
        previousCurrentStreak: prevCurrent,
        previousLongestStreak: prevLongest,
        newCurrentStreak: currentStreak,
        newLongestStreak: longestStreak,
        uniqueDays,
        fixed: needsUpdate,
      })
    }

    return NextResponse.json({
      success: true,
      usersProcessed: results.length,
      usersFixed,
      details: results.filter(r => r.fixed).slice(0, 100), // Limit to first 100 for response size
    })
  } catch (error) {
    console.error('Error recalculating streaks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/admin/recalculate-streaks
 *
 * Preview which users have incorrect streak values.
 */
export async function GET() {
  try {
    const supabase = await createClient()

    // Check if user is master admin
    const adminId = await checkMasterAdmin(supabase)
    if (!adminId) {
      return NextResponse.json({ error: 'Forbidden - Master admin only' }, { status: 403 })
    }

    // Get all attempts
    const { data: attempts, error: attemptsError } = await supabaseAdmin
      .from('attempts')
      .select('user_id, created_at')
      .order('created_at', { ascending: true })

    if (attemptsError) {
      console.error('Failed to fetch attempts:', attemptsError)
      return NextResponse.json({ error: 'Failed to fetch attempts' }, { status: 500 })
    }

    if (!attempts || attempts.length === 0) {
      return NextResponse.json({
        preview: true,
        usersWithWrongStreaks: 0,
        details: [],
      })
    }

    // Group attempts by user
    const userAttempts = new Map<string, Date[]>()
    for (const attempt of attempts as AttemptDate[]) {
      if (!userAttempts.has(attempt.user_id)) {
        userAttempts.set(attempt.user_id, [])
      }
      userAttempts.get(attempt.user_id)!.push(new Date(attempt.created_at))
    }

    // Get current stats for all users
    const userIds = Array.from(userAttempts.keys())
    const { data: existingStats } = await supabaseAdmin
      .from('user_gamification_stats')
      .select('user_id, current_streak, longest_streak, total_ecgs_completed')
      .in('user_id', userIds)

    type StatsRow = { user_id: string; current_streak: number; longest_streak: number; total_ecgs_completed: number }
    const existingStatsMap = new Map<string, StatsRow>()
    ;(existingStats as StatsRow[] | null)?.forEach(stat => {
      existingStatsMap.set(stat.user_id, stat)
    })

    // Find users with wrong streaks
    const wrongStreaks: Array<{
      userId: string
      currentStreak: number
      correctCurrentStreak: number
      longestStreak: number
      correctLongestStreak: number
      totalEcgs: number
      uniqueDays: number
    }> = []

    for (const [userId, dates] of userAttempts) {
      const currentStats = existingStatsMap.get(userId)
      const { currentStreak, longestStreak } = calculateStreakFromDates(dates)

      const uniqueDays = new Set(dates.map(d => d.toISOString().split('T')[0])).size

      if (
        currentStats &&
        (currentStats.current_streak !== currentStreak || currentStats.longest_streak !== longestStreak)
      ) {
        wrongStreaks.push({
          userId,
          currentStreak: currentStats.current_streak,
          correctCurrentStreak: currentStreak,
          longestStreak: currentStats.longest_streak,
          correctLongestStreak: longestStreak,
          totalEcgs: currentStats.total_ecgs_completed,
          uniqueDays,
        })
      }
    }

    return NextResponse.json({
      preview: true,
      usersWithWrongStreaks: wrongStreaks.length,
      details: wrongStreaks.slice(0, 100), // Limit response size
    })
  } catch (error) {
    console.error('Error previewing streak recalculation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
