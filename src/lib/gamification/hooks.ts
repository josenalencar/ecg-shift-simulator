import { SupabaseClient } from '@supabase/supabase-js'
import type {
  GamificationConfig,
  UserGamificationStats,
  Achievement,
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

  // Calculate streak
  const streakResult = calculateNewStreak(
    stats.last_activity_date,
    stats.current_streak,
    config
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

  // Track event participation
  let newEventsParticipated = stats.events_participated
  if (activeEvent) {
    await recordEventParticipation(userId, activeEvent.id, supabase)
    // Only increment if first time in this event (simplified - could be more sophisticated)
    newEventsParticipated++
  }

  const today = new Date().toISOString().split('T')[0]

  const updatedStats: Partial<UserGamificationStats> = {
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
  userPercentile: number
  isInTopN: boolean
  config: GamificationConfig
}> {
  const config = await getGamificationConfig(supabase)

  // Get all users ordered by XP
  const { data: allUsers, error } = await supabase
    .from('user_gamification_stats')
    .select(`
      *,
      profiles:user_id (
        full_name,
        email
      )
    `)
    .order('total_xp', { ascending: false })

  if (error || !allUsers) {
    console.error('Failed to load leaderboard:', error)
    return {
      topUsers: [],
      userRank: null,
      userPercentile: 0,
      isInTopN: false,
      config,
    }
  }

  // Find user's position
  const userIndex = allUsers.findIndex((u) => u.user_id === userId)
  const totalUsers = allUsers.length

  // Calculate percentile
  let userPercentile = 0
  let userRank: number | null = null
  let isInTopN = false

  if (userIndex !== -1) {
    userRank = userIndex + 1
    userPercentile = Math.floor(((totalUsers - userIndex) / totalUsers) * 100)
    isInTopN = userRank <= config.ranking_top_n_visible
  }

  // Get top N users
  const topUsers = allUsers.slice(0, limit).map((user, index) => ({
    ...user,
    rank: index + 1,
  }))

  return {
    topUsers: topUsers as Array<UserGamificationStats & { rank: number; profiles: { full_name: string | null; email: string } }>,
    userRank: isInTopN ? userRank : null, // Only return rank if in top N
    userPercentile,
    isInTopN,
    config,
  }
}
