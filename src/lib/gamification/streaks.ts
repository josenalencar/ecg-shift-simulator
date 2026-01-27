import type { GamificationConfig } from '@/types/database'

export interface StreakStatus {
  isActive: boolean
  currentStreak: number
  shouldReset: boolean
  hoursUntilReset: number | null
  isWithinGracePeriod: boolean
}

/**
 * Check the status of a user's streak
 *
 * Streak rules:
 * - Streak continues if user practices on consecutive days
 * - Grace period: User has X hours (configurable) after midnight to maintain streak
 * - If no activity within grace period, streak resets to 0
 */
export function checkStreakStatus(
  lastActivityDate: string | null,
  currentStreak: number,
  config: GamificationConfig
): StreakStatus {
  if (!lastActivityDate) {
    return {
      isActive: false,
      currentStreak: 0,
      shouldReset: false,
      hoursUntilReset: null,
      isWithinGracePeriod: false,
    }
  }

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const lastActivity = new Date(lastActivityDate)
  const lastActivityDay = new Date(
    lastActivity.getFullYear(),
    lastActivity.getMonth(),
    lastActivity.getDate()
  )

  // Calculate days difference
  const daysDiff = Math.floor(
    (today.getTime() - lastActivityDay.getTime()) / (1000 * 60 * 60 * 24)
  )

  // Same day - streak is active
  if (daysDiff === 0) {
    return {
      isActive: true,
      currentStreak,
      shouldReset: false,
      hoursUntilReset: null,
      isWithinGracePeriod: false,
    }
  }

  // Yesterday - streak continues
  if (daysDiff === 1) {
    return {
      isActive: true,
      currentStreak,
      shouldReset: false,
      hoursUntilReset: null,
      isWithinGracePeriod: false,
    }
  }

  // Check grace period
  // Grace period starts at midnight after the last activity day
  const gracePeriodStart = new Date(lastActivityDay)
  gracePeriodStart.setDate(gracePeriodStart.getDate() + 1) // Next day midnight

  const gracePeriodEnd = new Date(gracePeriodStart)
  gracePeriodEnd.setHours(gracePeriodEnd.getHours() + config.streak_grace_period_hours)

  const isWithinGracePeriod = now < gracePeriodEnd

  if (isWithinGracePeriod) {
    const hoursUntilReset = Math.max(
      0,
      Math.floor((gracePeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60))
    )

    return {
      isActive: true,
      currentStreak,
      shouldReset: false,
      hoursUntilReset,
      isWithinGracePeriod: true,
    }
  }

  // Outside grace period - streak should reset
  return {
    isActive: false,
    currentStreak: 0,
    shouldReset: true,
    hoursUntilReset: null,
    isWithinGracePeriod: false,
  }
}

/**
 * Calculate the new streak value after an activity
 */
export function calculateNewStreak(
  lastActivityDate: string | null,
  currentStreak: number,
  config: GamificationConfig
): { newStreak: number; isNewDay: boolean; streakExtended: boolean } {
  const status = checkStreakStatus(lastActivityDate, currentStreak, config)

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  if (!lastActivityDate) {
    // First activity ever
    return { newStreak: 1, isNewDay: true, streakExtended: true }
  }

  const lastActivity = new Date(lastActivityDate)
  const lastActivityDay = new Date(
    lastActivity.getFullYear(),
    lastActivity.getMonth(),
    lastActivity.getDate()
  )

  const isSameDay = today.getTime() === lastActivityDay.getTime()

  if (isSameDay) {
    // Same day, streak doesn't increase
    return { newStreak: currentStreak, isNewDay: false, streakExtended: false }
  }

  if (status.shouldReset) {
    // Streak was broken, start fresh
    return { newStreak: 1, isNewDay: true, streakExtended: true }
  }

  // New day within valid period, extend streak
  return { newStreak: currentStreak + 1, isNewDay: true, streakExtended: true }
}

/**
 * Get streak milestone achievements that should be checked
 */
export function getStreakMilestones(streak: number): number[] {
  const milestones = [3, 7, 14, 30, 60, 90, 180, 365]
  return milestones.filter((m) => streak >= m)
}

/**
 * Check if streak just hit a milestone
 */
export function isStreakMilestone(previousStreak: number, newStreak: number): number | null {
  const milestones = [3, 7, 14, 30, 60, 90, 180, 365]

  for (const milestone of milestones) {
    if (previousStreak < milestone && newStreak >= milestone) {
      return milestone
    }
  }

  return null
}
