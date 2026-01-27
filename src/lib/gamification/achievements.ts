import { SupabaseClient } from '@supabase/supabase-js'
import type {
  Achievement,
  UserGamificationStats,
  AchievementWithProgress,
  Category,
  Finding,
  Difficulty,
} from '@/types/database'

export interface AchievementCheckContext {
  stats: UserGamificationStats
  attemptData?: {
    score: number
    difficulty: Difficulty
    isPerfect: boolean
    categories: Category[]
    findings: Finding[]
    attemptTime: Date
    isFirstAttempt: boolean
  }
  previousStats?: UserGamificationStats
}

export interface UnlockedAchievement {
  achievement: Achievement
  xpReward: number
}

/**
 * Check if an achievement should be unlocked based on current stats
 */
export function evaluateAchievement(
  achievement: Achievement,
  context: AchievementCheckContext
): boolean {
  const { stats, attemptData, previousStats } = context
  const conditions = achievement.unlock_conditions as Record<string, unknown>
  const type = conditions.type as string

  switch (type) {
    case 'total_ecgs':
      return stats.total_ecgs_completed >= (conditions.threshold as number)

    case 'perfect_scores':
      return stats.total_perfect_scores >= (conditions.threshold as number)

    case 'level':
      return stats.current_level >= (conditions.threshold as number)

    case 'streak':
      return stats.current_streak >= (conditions.threshold as number)

    case 'category_correct': {
      const category = conditions.category as string
      const threshold = conditions.threshold as number
      const count = stats.correct_by_category[category] || 0
      return count >= threshold
    }

    case 'finding_correct': {
      const finding = conditions.finding as string
      const threshold = conditions.threshold as number
      // For ischemia, we aggregate multiple findings
      if (finding === 'ischemia') {
        const ischemicFindings = ['ste', 'hyperacute_t', 'std_v1v4', 'aslanger', 'de_winter', 'subtle_ste', 'sgarbossa_modified']
        let count = 0
        for (const f of ischemicFindings) {
          count += stats.correct_by_finding[f] || 0
        }
        return count >= threshold
      }
      const count = stats.correct_by_finding[finding] || 0
      return count >= threshold
    }

    case 'finding_group': {
      const group = conditions.group as string
      const threshold = conditions.threshold as number
      let count = 0

      if (group === 'blocks') {
        const blockFindings = ['rbbb', 'lbbb', 'lafb', 'lpfb', 'avb_1st', 'avb_2nd_type1', 'avb_2nd_type2', 'avb_3rd']
        for (const f of blockFindings) {
          count += stats.correct_by_finding[f] || 0
        }
      }

      return count >= threshold
    }

    case 'hospital_type': {
      // This would need to be tracked separately based on user's hospital setting
      // For now, return false until we implement hospital-specific tracking
      return false
    }

    case 'difficulty_correct': {
      const difficulty = conditions.difficulty as Difficulty
      const threshold = conditions.threshold as number
      const count = stats.ecgs_by_difficulty[difficulty] || 0
      return count >= threshold
    }

    case 'perfect_hard': {
      // This needs separate tracking - perfect scores on hard difficulty
      // For now, estimate based on available data
      return false
    }

    case 'first_perfect_hard': {
      if (!attemptData) return false
      return attemptData.isPerfect && attemptData.difficulty === 'hard' && stats.total_perfect_scores === 1
    }

    case 'perfect_streak': {
      const threshold = conditions.threshold as number
      return stats.perfect_streak >= threshold
    }

    case 'daily_ecgs': {
      // This needs real-time tracking of today's ECGs
      // Will be implemented with attempt timestamp checking
      return false
    }

    case 'weekend_ecgs': {
      if (!attemptData) return false
      const day = attemptData.attemptTime.getDay()
      return day === 0 || day === 6 // Sunday or Saturday
    }

    case 'time_of_day': {
      if (!attemptData) return false
      const hour = attemptData.attemptTime.getHours()
      const afterHour = parseInt((conditions.after as string).split(':')[0], 10)
      const beforeHour = parseInt((conditions.before as string).split(':')[0], 10)

      if (afterHour < beforeHour) {
        return hour >= afterHour && hour < beforeHour
      }
      // Handle overnight (e.g., 22:00 to 06:00)
      return hour >= afterHour || hour < beforeHour
    }

    case 'all_categories': {
      const categories: Category[] = ['arrhythmia', 'ischemia', 'structural', 'normal', 'emergency', 'routine', 'advanced', 'rare']
      return categories.every((cat) => (stats.correct_by_category[cat] || 0) >= 1)
    }

    case 'all_difficulties': {
      const threshold = conditions.threshold as number
      const { easy, medium, hard } = stats.ecgs_by_difficulty
      return easy >= threshold && medium >= threshold && hard >= threshold
    }

    case 'comeback': {
      // Check if user was inactive for 30+ days before this session
      if (!previousStats || !previousStats.last_activity_date) return false
      const lastActivity = new Date(previousStats.last_activity_date)
      const daysSinceActivity = Math.floor(
        (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
      )
      return daysSinceActivity >= (conditions.days as number)
    }

    case 'event_participation': {
      if (!attemptData) return false
      // This is checked elsewhere when event is active
      return false
    }

    case 'events_participated': {
      const threshold = conditions.threshold as number
      return stats.events_participated >= threshold
    }

    case 'achievements_unlocked': {
      // This needs to be checked against user_achievements count
      // Will be implemented in checkAchievements function
      return false
    }

    case 'total_xp': {
      const threshold = conditions.threshold as number
      return stats.total_xp >= threshold
    }

    default:
      return false
  }
}

/**
 * Check all achievements and return newly unlocked ones
 */
export async function checkAchievements(
  userId: string,
  context: AchievementCheckContext,
  supabase: SupabaseClient
): Promise<UnlockedAchievement[]> {
  // Get all active achievements
  const { data: achievements, error: achievementsError } = await supabase
    .from('achievements')
    .select('*')
    .eq('is_active', true)
    .order('display_order')

  if (achievementsError || !achievements) {
    console.error('Failed to load achievements:', achievementsError)
    return []
  }

  // Get user's already earned achievements
  const { data: earnedAchievements, error: earnedError } = await supabase
    .from('user_achievements')
    .select('achievement_id')
    .eq('user_id', userId)

  if (earnedError) {
    console.error('Failed to load earned achievements:', earnedError)
    return []
  }

  const earnedIds = new Set(earnedAchievements?.map((ua) => ua.achievement_id) || [])

  // For achievements that check achievement count
  const earnedCount = earnedIds.size

  // Check each achievement
  const newlyUnlocked: UnlockedAchievement[] = []

  for (const achievement of achievements) {
    // Skip if already earned
    if (earnedIds.has(achievement.id)) continue

    // Special handling for achievement count achievements
    const conditions = achievement.unlock_conditions as Record<string, unknown>
    if (conditions.type === 'achievements_unlocked') {
      const threshold = conditions.threshold as number
      if (earnedCount >= threshold) {
        newlyUnlocked.push({
          achievement: achievement as Achievement,
          xpReward: achievement.xp_reward,
        })
      }
      continue
    }

    // Evaluate the achievement
    if (evaluateAchievement(achievement as Achievement, context)) {
      newlyUnlocked.push({
        achievement: achievement as Achievement,
        xpReward: achievement.xp_reward,
      })
    }
  }

  // Insert newly unlocked achievements
  if (newlyUnlocked.length > 0) {
    const inserts = newlyUnlocked.map((ua) => ({
      user_id: userId,
      achievement_id: ua.achievement.id,
      notified: false,
    }))

    const { error: insertError } = await supabase
      .from('user_achievements')
      .insert(inserts)

    if (insertError) {
      console.error('Failed to insert achievements:', insertError)
    }
  }

  return newlyUnlocked
}

/**
 * Get all achievements with user's progress
 */
export async function getAchievementsWithProgress(
  userId: string,
  supabase: SupabaseClient
): Promise<AchievementWithProgress[]> {
  // Get all active achievements (and non-hidden or earned ones)
  const { data: achievements, error: achievementsError } = await supabase
    .from('achievements')
    .select('*')
    .eq('is_active', true)
    .order('display_order')

  if (achievementsError || !achievements) {
    console.error('Failed to load achievements:', achievementsError)
    return []
  }

  // Get user's earned achievements
  const { data: earnedAchievements, error: earnedError } = await supabase
    .from('user_achievements')
    .select('achievement_id, earned_at')
    .eq('user_id', userId)

  if (earnedError) {
    console.error('Failed to load earned achievements:', earnedError)
    return []
  }

  const earnedMap = new Map(
    earnedAchievements?.map((ua) => [ua.achievement_id, ua.earned_at]) || []
  )

  // Map achievements with progress
  return achievements
    .filter((a) => {
      // Show if earned, or if not hidden
      return earnedMap.has(a.id) || !a.is_hidden
    })
    .map((a) => ({
      ...a,
      earned: earnedMap.has(a.id),
      earned_at: earnedMap.get(a.id) || null,
    })) as AchievementWithProgress[]
}

/**
 * Mark achievements as notified
 */
export async function markAchievementsNotified(
  userId: string,
  achievementIds: string[],
  supabase: SupabaseClient
): Promise<void> {
  if (achievementIds.length === 0) return

  const { error } = await supabase
    .from('user_achievements')
    .update({ notified: true })
    .eq('user_id', userId)
    .in('achievement_id', achievementIds)

  if (error) {
    console.error('Failed to mark achievements as notified:', error)
  }
}
