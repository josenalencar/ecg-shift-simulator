/**
 * Stats Calculation Library
 *
 * Functions for calculating and storing weekly/monthly user statistics
 * Used by email digest and report features
 */

import { createServiceRoleClient } from '@/lib/supabase/server'
import type { WeeklyStats, MonthlyStats, MonthlyComparison, EmailType } from '@/types/database'

// ============================================
// Helper Functions
// ============================================

/**
 * Get ISO week number for a date
 */
export function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

/**
 * Get start of week (Monday) for a given date
 */
export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Get end of week (Sunday) for a given date
 */
export function getWeekEnd(date: Date = new Date()): Date {
  const start = getWeekStart(date)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return end
}

/**
 * Get start of month for a given date
 */
export function getMonthStart(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0)
}

/**
 * Get end of month for a given date
 */
export function getMonthEnd(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
}

// ============================================
// Weekly Stats Calculation
// ============================================

/**
 * Calculate weekly stats for a user
 */
export async function calculateWeeklyStats(
  userId: string,
  weekStart: Date
): Promise<WeeklyStats> {
  const supabase = createServiceRoleClient()
  const weekEnd = getWeekEnd(weekStart)

  // Get attempts for this week
  const { data: attempts } = await supabase
    .from('attempts')
    .select('score, difficulty, created_at')
    .eq('user_id', userId)
    .gte('created_at', weekStart.toISOString())
    .lt('created_at', new Date(weekEnd.getTime() + 1).toISOString())

  // Get user's current gamification state
  const { data: userStats } = await supabase
    .from('user_gamification_stats')
    .select('current_streak, current_level, total_xp')
    .eq('user_id', userId)
    .single()

  // Get achievements earned this week
  const { data: achievements } = await supabase
    .from('user_achievements')
    .select('achievement_id, achievements(slug)')
    .eq('user_id', userId)
    .gte('earned_at', weekStart.toISOString())
    .lt('earned_at', new Date(weekEnd.getTime() + 1).toISOString())

  // Get previous week snapshot for comparison
  const prevWeekStart = new Date(weekStart)
  prevWeekStart.setDate(prevWeekStart.getDate() - 7)
  const { data: prevWeekSnapshot } = await supabase
    .from('weekly_stats_snapshots')
    .select('ecgs_completed, total_xp_earned, average_score')
    .eq('user_id', userId)
    .eq('week_start', prevWeekStart.toISOString().split('T')[0])
    .single()

  // Calculate aggregates
  const scores = attempts?.map(a => a.score) || []
  const difficulties: Record<string, number> = {}
  const activeDaysSet = new Set<string>()

  attempts?.forEach(a => {
    // Count difficulties
    difficulties[a.difficulty] = (difficulties[a.difficulty] || 0) + 1

    // Track active days
    activeDaysSet.add(new Date(a.created_at).toDateString())
  })

  const ecgsCompleted = attempts?.length || 0
  const perfectScores = scores.filter(s => s === 100).length
  const bestScore = scores.length ? Math.max(...scores) : 0
  const worstScore = scores.length ? Math.min(...scores) : 0
  const averageScore = scores.length
    ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100
    : 0

  // Estimate XP earned (simplified calculation)
  const totalXpEarned = scores.reduce((total, score) => {
    return total + Math.floor(5 + score * 1.0)
  }, 0)

  // Extract achievement slugs
  const achievementSlugs = achievements
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ?.map(a => (a.achievements as any)?.slug)
    .filter(Boolean) || []

  return {
    ecgsCompleted,
    perfectScores,
    totalXpEarned,
    activeDays: activeDaysSet.size,
    streakAtEnd: userStats?.current_streak || 0,
    levelAtEnd: userStats?.current_level || 1,
    totalXpAtEnd: userStats?.total_xp || 0,
    bestScore,
    worstScore,
    averageScore,
    categoriesPracticed: {}, // Would need to join with ECG data
    difficultiesPracticed: difficulties,
    achievementsEarned: achievementSlugs,
    ecgsDelta: ecgsCompleted - (prevWeekSnapshot?.ecgs_completed || 0),
    xpDelta: totalXpEarned - (prevWeekSnapshot?.total_xp_earned || 0),
    averageScoreDelta: averageScore - (prevWeekSnapshot?.average_score || 0),
  }
}

/**
 * Save weekly stats snapshot to database
 */
export async function saveWeeklySnapshot(
  userId: string,
  stats: WeeklyStats,
  weekStart: Date
): Promise<boolean> {
  const supabase = createServiceRoleClient()
  const weekEnd = getWeekEnd(weekStart)

  const { error } = await supabase.from('weekly_stats_snapshots').upsert({
    user_id: userId,
    week_start: weekStart.toISOString().split('T')[0],
    week_end: weekEnd.toISOString().split('T')[0],
    year: weekStart.getFullYear(),
    week_number: getISOWeekNumber(weekStart),
    ecgs_completed: stats.ecgsCompleted,
    perfect_scores: stats.perfectScores,
    total_xp_earned: stats.totalXpEarned,
    active_days: stats.activeDays,
    streak_at_end: stats.streakAtEnd,
    level_at_end: stats.levelAtEnd,
    total_xp_at_end: stats.totalXpAtEnd,
    best_score: stats.bestScore,
    worst_score: stats.worstScore,
    average_score: stats.averageScore,
    categories_practiced: stats.categoriesPracticed,
    difficulties_practiced: stats.difficultiesPracticed,
    achievements_earned: stats.achievementsEarned,
    ecgs_delta: stats.ecgsDelta,
    xp_delta: stats.xpDelta,
    average_score_delta: stats.averageScoreDelta,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,week_start' })

  if (error) {
    console.error('[Stats] Error saving weekly snapshot:', error)
    return false
  }

  return true
}

// ============================================
// Monthly Stats Calculation
// ============================================

/**
 * Calculate monthly stats for a user
 */
export async function calculateMonthlyStats(
  userId: string,
  year: number,
  month: number
): Promise<MonthlyStats> {
  const supabase = createServiceRoleClient()
  const monthStart = new Date(year, month - 1, 1)
  const monthEnd = getMonthEnd(monthStart)

  // Get attempts for this month
  const { data: attempts } = await supabase
    .from('attempts')
    .select('score, difficulty, created_at')
    .eq('user_id', userId)
    .gte('created_at', monthStart.toISOString())
    .lt('created_at', new Date(monthEnd.getTime() + 1).toISOString())

  // Get user's current gamification state
  const { data: userStats } = await supabase
    .from('user_gamification_stats')
    .select('current_streak, current_level, total_xp, longest_streak')
    .eq('user_id', userId)
    .single()

  // Get achievements earned this month
  const { data: achievements } = await supabase
    .from('user_achievements')
    .select('achievement_id, achievements(slug)')
    .eq('user_id', userId)
    .gte('earned_at', monthStart.toISOString())
    .lt('earned_at', new Date(monthEnd.getTime() + 1).toISOString())

  // Get total achievements count
  const { count: totalAchievements } = await supabase
    .from('user_achievements')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  // Get previous month stats for comparison
  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear = month === 1 ? year - 1 : year
  const { data: prevMonthSnapshot } = await supabase
    .from('monthly_stats_snapshots')
    .select('*')
    .eq('user_id', userId)
    .eq('year', prevYear)
    .eq('month', prevMonth)
    .single()

  // Get user rank
  const { data: leaderboard } = await supabase
    .from('user_gamification_stats')
    .select('user_id, total_xp')
    .order('total_xp', { ascending: false })
    .limit(1000)

  let rankAtEnd: number | null = null
  let rankPercentile: number | null = null
  if (leaderboard) {
    const userIndex = leaderboard.findIndex(u => u.user_id === userId)
    if (userIndex >= 0) {
      rankAtEnd = userIndex + 1
      rankPercentile = ((leaderboard.length - userIndex) / leaderboard.length) * 100
    }
  }

  // Calculate aggregates
  const scores = attempts?.map(a => a.score) || []
  const difficulties: Record<string, number> = {}
  const activeDaysSet = new Set<string>()

  attempts?.forEach(a => {
    difficulties[a.difficulty] = (difficulties[a.difficulty] || 0) + 1
    activeDaysSet.add(new Date(a.created_at).toDateString())
  })

  const ecgsCompleted = attempts?.length || 0
  const perfectScores = scores.filter(s => s === 100).length
  const bestScore = scores.length ? Math.max(...scores) : 0
  const worstScore = scores.length ? Math.min(...scores) : 0
  const averageScore = scores.length
    ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100
    : 0

  const totalXpEarned = scores.reduce((total, score) => {
    return total + Math.floor(5 + score * 1.0)
  }, 0)

  const achievementSlugs = achievements
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ?.map(a => (a.achievements as any)?.slug)
    .filter(Boolean) || []

  // Calculate level progression (estimate)
  const levelEnd = userStats?.current_level || 1
  const levelStart = prevMonthSnapshot?.level_at_end || levelEnd

  return {
    ecgsCompleted,
    perfectScores,
    totalXpEarned,
    activeDays: activeDaysSet.size,
    streakAtEnd: userStats?.current_streak || 0,
    levelAtEnd: levelEnd,
    totalXpAtEnd: userStats?.total_xp || 0,
    bestScore,
    worstScore,
    averageScore,
    categoriesPracticed: {},
    difficultiesPracticed: difficulties,
    achievementsEarned: achievementSlugs,
    ecgsDelta: ecgsCompleted - (prevMonthSnapshot?.ecgs_completed || 0),
    xpDelta: totalXpEarned - (prevMonthSnapshot?.total_xp_earned || 0),
    averageScoreDelta: averageScore - (prevMonthSnapshot?.average_score || 0),
    levelStart,
    levelEnd,
    levelsGained: levelEnd - levelStart,
    xpStart: prevMonthSnapshot?.total_xp_at_end || 0,
    xpEnd: userStats?.total_xp || 0,
    streakBest: userStats?.longest_streak || 0,
    rankAtEnd,
    rankPercentile,
    totalAchievementsAtEnd: totalAchievements || 0,
    perfectDelta: perfectScores - (prevMonthSnapshot?.perfect_scores || 0),
    activeDaysDelta: activeDaysSet.size - (prevMonthSnapshot?.active_days || 0),
    rankDelta: prevMonthSnapshot?.rank_at_end
      ? (prevMonthSnapshot.rank_at_end - (rankAtEnd || 0))
      : 0,
  }
}

/**
 * Save monthly stats snapshot to database
 */
export async function saveMonthlySnapshot(
  userId: string,
  stats: MonthlyStats,
  year: number,
  month: number
): Promise<boolean> {
  const supabase = createServiceRoleClient()
  const monthStart = new Date(year, month - 1, 1)
  const monthEnd = getMonthEnd(monthStart)

  const { error } = await supabase.from('monthly_stats_snapshots').upsert({
    user_id: userId,
    year,
    month,
    month_start: monthStart.toISOString().split('T')[0],
    month_end: monthEnd.toISOString().split('T')[0],
    ecgs_completed: stats.ecgsCompleted,
    perfect_scores: stats.perfectScores,
    total_xp_earned: stats.totalXpEarned,
    active_days: stats.activeDays,
    level_start: stats.levelStart,
    level_end: stats.levelEnd,
    levels_gained: stats.levelsGained,
    xp_start: stats.xpStart,
    xp_end: stats.xpEnd,
    streak_best: stats.streakBest,
    streak_at_end: stats.streakAtEnd,
    best_score: stats.bestScore,
    worst_score: stats.worstScore,
    average_score: stats.averageScore,
    rank_at_end: stats.rankAtEnd,
    rank_percentile: stats.rankPercentile,
    categories_practiced: stats.categoriesPracticed,
    difficulties_practiced: stats.difficultiesPracticed,
    achievements_earned: stats.achievementsEarned,
    total_achievements_at_end: stats.totalAchievementsAtEnd,
    ecgs_delta: stats.ecgsDelta,
    xp_delta: stats.xpDelta,
    perfect_delta: stats.perfectDelta,
    average_score_delta: stats.averageScoreDelta,
    active_days_delta: stats.activeDaysDelta,
    rank_delta: stats.rankDelta,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,year,month' })

  if (error) {
    console.error('[Stats] Error saving monthly snapshot:', error)
    return false
  }

  return true
}

/**
 * Get monthly comparison data from previous month
 */
export async function getMonthlyComparison(
  userId: string,
  currentStats: MonthlyStats,
  year: number,
  month: number
): Promise<MonthlyComparison> {
  const supabase = createServiceRoleClient()

  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear = month === 1 ? year - 1 : year

  const { data: prevStats } = await supabase
    .from('monthly_stats_snapshots')
    .select('*')
    .eq('user_id', userId)
    .eq('year', prevYear)
    .eq('month', prevMonth)
    .single()

  return {
    ecgsDelta: currentStats.ecgsCompleted - (prevStats?.ecgs_completed || 0),
    perfectScoresDelta: currentStats.perfectScores - (prevStats?.perfect_scores || 0),
    xpDelta: currentStats.totalXpEarned - (prevStats?.total_xp_earned || 0),
    levelDelta: currentStats.levelEnd - (prevStats?.level_at_end || currentStats.levelEnd),
    averageScoreDelta: currentStats.averageScore - (prevStats?.average_score || 0),
    activeDaysDelta: currentStats.activeDays - (prevStats?.active_days || 0),
  }
}

// ============================================
// Email Tracking
// ============================================

/**
 * Track that an email was sent
 */
export async function trackEmailSent(
  userId: string,
  emailType: EmailType,
  metadata: Record<string, unknown> = {}
): Promise<boolean> {
  const supabase = createServiceRoleClient()

  const { error } = await supabase.from('email_tracking').insert({
    user_id: userId,
    email_type: emailType,
    metadata,
  })

  if (error) {
    console.error('[Stats] Error tracking email:', error)
    return false
  }

  return true
}

/**
 * Check if email was already sent
 */
export async function wasEmailSent(
  userId: string,
  emailType: EmailType,
  withinDays?: number
): Promise<boolean> {
  const supabase = createServiceRoleClient()

  let query = supabase
    .from('email_tracking')
    .select('id')
    .eq('user_id', userId)
    .eq('email_type', emailType)

  if (withinDays) {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - withinDays)
    query = query.gte('sent_at', cutoff.toISOString())
  }

  const { data } = await query.limit(1)
  return !!data?.length
}

/**
 * Check if user has email preferences enabled for a specific type
 */
export async function isEmailTypeEnabled(
  userId: string,
  emailType: EmailType
): Promise<boolean> {
  const supabase = createServiceRoleClient()

  // First check global email_notifications_enabled on profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('email_notifications_enabled')
    .eq('id', userId)
    .single()

  if (profile?.email_notifications_enabled === false) {
    return false
  }

  // Then check specific preferences if they exist
  const { data: prefs } = await supabase
    .from('user_email_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!prefs) {
    return true // Default to enabled if no preferences set
  }

  // Map email type to preference field
  const prefMap: Record<EmailType, keyof typeof prefs> = {
    first_case: 'onboarding_emails',
    day2: 'onboarding_emails',
    day3: 'onboarding_emails',
    day5: 'onboarding_emails',
    day7: 'onboarding_emails',
    streak_starter: 'streak_emails',
    streak_at_risk: 'streak_emails',
    streak_milestone: 'streak_emails',
    level_up: 'level_up_emails',
    achievement: 'achievement_emails',
    weekly_digest: 'weekly_digest',
    monthly_report: 'monthly_report',
  }

  const prefKey = prefMap[emailType]
  return prefs[prefKey] !== false
}

// ============================================
// Batch Operations for Cron Jobs
// ============================================

interface UserForEmail {
  user_id: string
  email: string
  full_name: string | null
  unsubscribe_token: string | null
}

/**
 * Get users who need weekly digest emails
 */
export async function getUsersForWeeklyDigest(): Promise<UserForEmail[]> {
  const supabase = createServiceRoleClient()

  const { data: users } = await supabase
    .from('profiles')
    .select('id, email, full_name, unsubscribe_token, email_notifications_enabled')
    .eq('email_notifications_enabled', true)

  if (!users) return []

  // Filter out users who have disabled weekly digest
  const filteredUsers: UserForEmail[] = []
  for (const user of users) {
    const { data: prefs } = await supabase
      .from('user_email_preferences')
      .select('weekly_digest')
      .eq('user_id', user.id)
      .single()

    if (prefs?.weekly_digest !== false) {
      filteredUsers.push({
        user_id: user.id,
        email: user.email,
        full_name: user.full_name,
        unsubscribe_token: user.unsubscribe_token,
      })
    }
  }

  return filteredUsers
}

/**
 * Get users who need monthly report emails
 */
export async function getUsersForMonthlyReport(): Promise<UserForEmail[]> {
  const supabase = createServiceRoleClient()

  const { data: users } = await supabase
    .from('profiles')
    .select('id, email, full_name, unsubscribe_token, email_notifications_enabled')
    .eq('email_notifications_enabled', true)

  if (!users) return []

  // Filter out users who have disabled monthly report
  const filteredUsers: UserForEmail[] = []
  for (const user of users) {
    const { data: prefs } = await supabase
      .from('user_email_preferences')
      .select('monthly_report')
      .eq('user_id', user.id)
      .single()

    if (prefs?.monthly_report !== false) {
      filteredUsers.push({
        user_id: user.id,
        email: user.email,
        full_name: user.full_name,
        unsubscribe_token: user.unsubscribe_token,
      })
    }
  }

  return filteredUsers
}

/**
 * Get users with streaks at risk (inactive 20+ hours with 5+ day streak)
 */
export async function getUsersWithStreakAtRisk(): Promise<(UserForEmail & { current_streak: number })[]> {
  const supabase = createServiceRoleClient()

  // Get users with 5+ day streak who haven't been active today
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  const { data: users } = await supabase
    .from('user_gamification_stats')
    .select(`
      user_id,
      current_streak,
      last_activity_date,
      profiles (id, email, full_name, unsubscribe_token, email_notifications_enabled)
    `)
    .gte('current_streak', 5)
    .eq('last_activity_date', yesterdayStr)

  if (!users) return []

  // Filter users who have streak emails enabled and haven't been notified today
  const result: (UserForEmail & { current_streak: number })[] = []
  const today = new Date().toISOString().split('T')[0]

  for (const user of users) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profile = (user as any).profiles
    if (!profile || profile.email_notifications_enabled === false) continue

    // Check if already sent today
    const { data: existingEmail } = await supabase
      .from('email_tracking')
      .select('id')
      .eq('user_id', user.user_id)
      .eq('email_type', 'streak_at_risk')
      .gte('sent_at', today)
      .limit(1)

    if (existingEmail?.length) continue

    // Check preferences
    const enabled = await isEmailTypeEnabled(user.user_id, 'streak_at_risk')
    if (!enabled) continue

    result.push({
      user_id: user.user_id,
      email: profile.email,
      full_name: profile.full_name,
      unsubscribe_token: profile.unsubscribe_token,
      current_streak: user.current_streak,
    })
  }

  return result
}

/**
 * Get users who lost their streak and could use re-engagement
 */
export async function getUsersForStreakStarter(): Promise<(UserForEmail & { longest_streak: number })[]> {
  const supabase = createServiceRoleClient()

  // Get users with 0 streak who had a meaningful streak before
  // and were active 2-7 days ago
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const twoDaysAgo = new Date()
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

  const { data: users } = await supabase
    .from('user_gamification_stats')
    .select(`
      user_id,
      longest_streak,
      last_activity_date,
      total_ecgs_completed,
      profiles (id, email, full_name, unsubscribe_token, email_notifications_enabled)
    `)
    .eq('current_streak', 0)
    .gte('longest_streak', 3)
    .gte('total_ecgs_completed', 5)
    .gte('last_activity_date', weekAgo.toISOString().split('T')[0])
    .lte('last_activity_date', twoDaysAgo.toISOString().split('T')[0])

  if (!users) return []

  const result: (UserForEmail & { longest_streak: number })[] = []

  for (const user of users) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profile = (user as any).profiles
    if (!profile || profile.email_notifications_enabled === false) continue

    // Check if sent in last 7 days
    const sent = await wasEmailSent(user.user_id, 'streak_starter', 7)
    if (sent) continue

    // Check preferences
    const enabled = await isEmailTypeEnabled(user.user_id, 'streak_starter')
    if (!enabled) continue

    result.push({
      user_id: user.user_id,
      email: profile.email,
      full_name: profile.full_name,
      unsubscribe_token: profile.unsubscribe_token,
      longest_streak: user.longest_streak,
    })
  }

  return result
}

/**
 * Snapshot all active users' weekly stats (run on Sunday night)
 */
export async function snapshotAllWeeklyStats(): Promise<{ success: number; failed: number }> {
  const supabase = createServiceRoleClient()
  const weekStart = getWeekStart()

  // Get all users with activity this week
  const { data: users } = await supabase
    .from('user_gamification_stats')
    .select('user_id')
    .gte('last_activity_date', weekStart.toISOString().split('T')[0])

  if (!users) return { success: 0, failed: 0 }

  let success = 0
  let failed = 0

  for (const user of users) {
    try {
      const stats = await calculateWeeklyStats(user.user_id, weekStart)
      const saved = await saveWeeklySnapshot(user.user_id, stats, weekStart)
      if (saved) success++
      else failed++
    } catch (error) {
      console.error(`[Stats] Failed to snapshot weekly stats for ${user.user_id}:`, error)
      failed++
    }
  }

  return { success, failed }
}

/**
 * Snapshot all active users' monthly stats (run on 1st of month)
 */
export async function snapshotAllMonthlyStats(): Promise<{ success: number; failed: number }> {
  const supabase = createServiceRoleClient()
  const now = new Date()
  const lastMonth = now.getMonth() === 0 ? 12 : now.getMonth()
  const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
  const monthStart = new Date(lastMonthYear, lastMonth - 1, 1)

  // Get all users with activity last month
  const { data: users } = await supabase
    .from('user_gamification_stats')
    .select('user_id')
    .gte('last_activity_date', monthStart.toISOString().split('T')[0])

  if (!users) return { success: 0, failed: 0 }

  let success = 0
  let failed = 0

  for (const user of users) {
    try {
      const stats = await calculateMonthlyStats(user.user_id, lastMonthYear, lastMonth)
      const saved = await saveMonthlySnapshot(user.user_id, stats, lastMonthYear, lastMonth)
      if (saved) success++
      else failed++
    } catch (error) {
      console.error(`[Stats] Failed to snapshot monthly stats for ${user.user_id}:`, error)
      failed++
    }
  }

  return { success, failed }
}
