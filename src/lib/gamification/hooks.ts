import { SupabaseClient } from '@supabase/supabase-js'
import type {
  GamificationConfig,
  UserGamificationStats,
  XPEvent,
  Difficulty,
  Category,
  Finding,
  XPEventType,
} from '@/types/database'
import { getGamificationConfig } from './config'
import { calculateXP, checkLevelUp, XPCalculationResult } from './xp'
import { calculateNewStreak, isStreakMilestone } from './streaks'
import { checkAchievements, UnlockedAchievement } from './achievements'
import { getActiveEvent, recordEventParticipation } from './events'

export interface AttemptData {
  ecgId: string
  score: number
  difficulty: Difficulty
  isPerfect: boolean
  categories: Category[]
  findings: Finding[]
  isFirstAttempt: boolean
}

export interface GamificationResult {
  xpEarned: number
  xpCalculation: XPCalculationResult
  newTotalXP: number
  levelUp: boolean
  previousLevel: number
  newLevel: number
  streakUpdated: boolean
  previousStreak: number
  newStreak: number
  streakMilestone: number | null
  achievementsUnlocked: UnlockedAchievement[]
  activeEvent: XPEvent | null
  stats: UserGamificationStats
}

/**
 * Initialize gamification stats for a new user
 */
export async function initializeUserStats(
  userId: string,
  supabase: SupabaseClient
): Promise<UserGamificationStats | null> {
  // Check if stats already exist
  const { data: existing } = await supabase
    .from('user_gamification_stats')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (existing) {
    return existing as UserGamificationStats
  }

  // Create new stats
  const { data, error } = await supabase
    .from('user_gamification_stats')
    .insert({
      user_id: userId,
      total_xp: 0,
      current_level: 1,
      current_streak: 0,
      longest_streak: 0,
      last_activity_date: null,
      total_ecgs_completed: 0,
      total_perfect_scores: 0,
      ecgs_by_difficulty: { easy: 0, medium: 0, hard: 0 },
      correct_by_category: {},
      correct_by_finding: {},
      perfect_streak: 0,
      events_participated: 0,
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to initialize user stats:', error)
    return null
  }

  return data as UserGamificationStats
}

/**
 * Get user gamification stats
 */
export async function getUserStats(
  userId: string,
  supabase: SupabaseClient
): Promise<UserGamificationStats | null> {
  const { data, error } = await supabase
    .from('user_gamification_stats')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    // If not found, try to initialize
    if (error.code === 'PGRST116') {
      return initializeUserStats(userId, supabase)
    }
    console.error('Failed to get user stats:', error)
    return null
  }

  return data as UserGamificationStats
}

/**
 * Main hook called after each ECG attempt
 * Handles all gamification updates:
 * - Calculate XP
 * - Update streak
 * - Check achievements
 * - Update level
 */
export async function onAttemptComplete(
  userId: string,
  attemptData: AttemptData,
  supabase: SupabaseClient
): Promise<GamificationResult> {
  // Load config
  const config = await getGamificationConfig(supabase)

  // Get or initialize user stats
  let stats = await getUserStats(userId, supabase)
  if (!stats) {
    stats = await initializeUserStats(userId, supabase)
    if (!stats) {
      throw new Error('Failed to initialize user gamification stats')
    }
  }

  const previousStats = { ...stats }

  // Check for active event
  const activeEvent = await getActiveEvent(userId, supabase)
  const eventType: XPEventType | null = activeEvent?.multiplier_type ?? null

  // Get user creation date for streak sanity check
  const { data: profileForStreak } = await supabase
    .from('profiles')
    .select('created_at')
    .eq('id', userId)
    .single()

  // Calculate streak with sanity check
  const streakResult = calculateNewStreak(
    stats.last_activity_date,
    stats.current_streak,
    config,
    profileForStreak?.created_at
  )

  // Calculate XP
  const xpResult = calculateXP({
    score: attemptData.score,
    difficulty: attemptData.difficulty,
    currentLevel: stats.current_level,
    currentStreak: streakResult.newStreak,
    isPerfect: attemptData.isPerfect,
    activeEvent: eventType,
    config,
  })

  // Calculate new total XP
  const newTotalXP = stats.total_xp + xpResult.finalXP

  // Check level up
  const levelResult = checkLevelUp(stats.total_xp, newTotalXP, config)

  // Check streak milestone
  const streakMilestone = streakResult.streakExtended
    ? isStreakMilestone(stats.current_streak, streakResult.newStreak)
    : null

  // Update stats
  const updatedDifficulty = { ...stats.ecgs_by_difficulty }
  updatedDifficulty[attemptData.difficulty] = (updatedDifficulty[attemptData.difficulty] || 0) + 1

  const updatedCategories = { ...stats.correct_by_category }
  for (const cat of attemptData.categories) {
    updatedCategories[cat] = (updatedCategories[cat] || 0) + 1
  }

  const updatedFindings = { ...stats.correct_by_finding }
  for (const finding of attemptData.findings) {
    updatedFindings[finding] = (updatedFindings[finding] || 0) + 1
  }

  // Update perfect streak
  let newPerfectStreak = stats.perfect_streak
  if (attemptData.isPerfect) {
    newPerfectStreak++
  } else {
    newPerfectStreak = 0
  }

  // Update longest streak
  const newLongestStreak = Math.max(stats.longest_streak, streakResult.newStreak)

  // Track ECGs by hospital type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentEcgsByHospital = (stats as any).ecgs_by_hospital || {}
  const updatedEcgsByHospital = { ...currentEcgsByHospital }

  // Get user's hospital type from profile
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('hospital_type')
    .eq('id', userId)
    .single()

  if (userProfile?.hospital_type) {
    updatedEcgsByHospital[userProfile.hospital_type] =
      (updatedEcgsByHospital[userProfile.hospital_type] || 0) + 1
  }

  // Track event participation
  let newEventsParticipated = stats.events_participated
  if (activeEvent) {
    // Check if this is the first participation in this event before incrementing
    const supabaseClient = supabase
    const { data: existingParticipation } = await supabaseClient
      .from('user_xp_events')
      .select('id, participated')
      .eq('user_id', userId)
      .eq('event_id', activeEvent.id)
      .single()

    await recordEventParticipation(userId, activeEvent.id, supabase)

    // Only increment if first time participating in this event
    if (!existingParticipation?.participated) {
      newEventsParticipated++
    }
  }

  const today = new Date().toISOString().split('T')[0]

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updatedStats: Partial<UserGamificationStats> & { ecgs_by_hospital?: Record<string, number> } = {
    total_xp: newTotalXP,
    current_level: levelResult.newLevel,
    current_streak: streakResult.newStreak,
    longest_streak: newLongestStreak,
    last_activity_date: today,
    total_ecgs_completed: stats.total_ecgs_completed + 1,
    total_perfect_scores: stats.total_perfect_scores + (attemptData.isPerfect ? 1 : 0),
    ecgs_by_difficulty: updatedDifficulty,
    correct_by_category: updatedCategories,
    correct_by_finding: updatedFindings,
    perfect_streak: newPerfectStreak,
    events_participated: newEventsParticipated,
    ecgs_by_hospital: updatedEcgsByHospital,
  }

  // Update in database
  const { error: updateError } = await supabase
    .from('user_gamification_stats')
    .update(updatedStats)
    .eq('user_id', userId)

  if (updateError) {
    console.error('Failed to update user stats:', updateError)
  }

  // Get updated stats
  const newStats: UserGamificationStats = {
    ...stats,
    ...updatedStats,
  } as UserGamificationStats

  // Check achievements
  const achievementsUnlocked = await checkAchievements(
    userId,
    {
      stats: newStats,
      attemptData: {
        ...attemptData,
        attemptTime: new Date(),
      },
      previousStats,
    },
    supabase
  )

  // Add achievement XP rewards
  if (achievementsUnlocked.length > 0) {
    let achievementXP = 0
    for (const ua of achievementsUnlocked) {
      achievementXP += ua.xpReward
    }

    if (achievementXP > 0) {
      const newTotalWithAchievements = newTotalXP + achievementXP
      const newLevelWithAchievements = checkLevelUp(newTotalXP, newTotalWithAchievements, config)

      await supabase
        .from('user_gamification_stats')
        .update({
          total_xp: newTotalWithAchievements,
          current_level: newLevelWithAchievements.newLevel,
        })
        .eq('user_id', userId)

      newStats.total_xp = newTotalWithAchievements
      newStats.current_level = newLevelWithAchievements.newLevel
    }
  }

  return {
    xpEarned: xpResult.finalXP,
    xpCalculation: xpResult,
    newTotalXP: newStats.total_xp,
    levelUp: levelResult.leveledUp,
    previousLevel: levelResult.previousLevel,
    newLevel: newStats.current_level,
    streakUpdated: streakResult.streakExtended,
    previousStreak: stats.current_streak,
    newStreak: streakResult.newStreak,
    streakMilestone,
    achievementsUnlocked,
    activeEvent,
    stats: newStats,
  }
}

/**
 * Get leaderboard with XP ranking
 */
export async function getXPLeaderboard(
  userId: string,
  supabase: SupabaseClient,
  limit: number = 10
): Promise<{
  topUsers: Array<UserGamificationStats & { rank: number; profiles: { full_name: string | null; email: string } }>
  userRank: number | null
  userTotalXP: number
  userPercentile: number
  isInTopN: boolean
  totalUsers: number
  config: GamificationConfig
}> {
  const config = await getGamificationConfig(supabase)

  // Enforce maximum limit to prevent performance issues
  const maxLimit = 100
  const safeLimit = Math.min(Math.max(1, limit), maxLimit)

  // Get total user count for percentile calculation
  const { count: totalUsers, error: countError } = await supabase
    .from('user_gamification_stats')
    .select('*', { count: 'exact', head: true })

  if (countError) {
    console.error('Failed to count users:', countError)
    return {
      topUsers: [],
      userRank: null,
      userTotalXP: 0,
      userPercentile: 0,
      isInTopN: false,
      totalUsers: 0,
      config,
    }
  }

  // Get user's XP to determine their rank
  const { data: userStats } = await supabase
    .from('user_gamification_stats')
    .select('total_xp')
    .eq('user_id', userId)
    .single()

  // Calculate user's rank by counting users with more XP
  let userRank: number | null = null
  let userPercentile = 0
  let isInTopN = false

  if (userStats && totalUsers) {
    const { count: usersAhead } = await supabase
      .from('user_gamification_stats')
      .select('*', { count: 'exact', head: true })
      .gt('total_xp', userStats.total_xp)

    userRank = (usersAhead ?? 0) + 1
    userPercentile = Math.floor(((totalUsers - userRank + 1) / totalUsers) * 100)
    isInTopN = userRank <= config.ranking_top_n_visible
  }

  // Get top N users with pagination (only fetch what we need)
  const { data: topUsersData, error } = await supabase
    .from('user_gamification_stats')
    .select(`
      *,
      profiles:user_id (
        full_name,
        email,
        avatar
      )
    `)
    .order('total_xp', { ascending: false })
    .limit(safeLimit)

  if (error || !topUsersData) {
    console.error('Failed to load leaderboard:', error)
    return {
      topUsers: [],
      userRank: null,
      userTotalXP: 0,
      userPercentile: 0,
      isInTopN: false,
      totalUsers: 0,
      config,
    }
  }

  // Map top users with rank
  const topUsers = topUsersData.map((user, index) => ({
    ...user,
    rank: index + 1,
  }))

  return {
    topUsers: topUsers as Array<UserGamificationStats & { rank: number; profiles: { full_name: string | null; email: string } }>,
    userRank,
    userTotalXP: userStats?.total_xp || 0,
    userPercentile,
    isInTopN,
    totalUsers: totalUsers || 0,
    config,
  }
}
