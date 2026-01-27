import type { GamificationConfig, Difficulty, XPEventType } from '@/types/database'

export interface XPCalculationParams {
  score: number
  difficulty: Difficulty
  currentLevel: number
  currentStreak: number
  isPerfect: boolean
  activeEvent: XPEventType | null
  config: GamificationConfig
}

export interface XPCalculationResult {
  rawXP: number
  finalXP: number
  levelMultiplier: number
  difficultyMultiplier: number
  eventBonus: number
  streakBonus: number
  perfectBonus: number
  breakdown: {
    base: number
    scoreBonus: number
    difficultyMultiplier: number
    streakBonus: number
    perfectBonus: number
    levelMultiplier: number
    eventBonus: number
  }
}

/**
 * Calculate XP earned for a single ECG attempt
 *
 * Formula:
 * base_xp = config.xp_per_ecg_base + (score × config.xp_per_score_point)
 * streak_bonus = min(streak_days × config.xp_streak_bonus_per_day, config.xp_streak_bonus_max)
 * perfect_bonus = isPerfect ? config.xp_perfect_bonus : 0
 *
 * raw_xp = (base_xp + streak_bonus + perfect_bonus) × difficulty_multiplier
 * level_multiplier = 1 + (level - 1) × config.level_multiplier_per_level
 * event_bonus = activeEvent === '2x' ? config.event_2x_bonus : (activeEvent === '3x' ? config.event_3x_bonus : 0)
 *
 * final_xp = raw_xp × (level_multiplier + event_bonus)
 */
export function calculateXP(params: XPCalculationParams): XPCalculationResult {
  const { score, difficulty, currentLevel, currentStreak, isPerfect, activeEvent, config } = params

  // Get difficulty multiplier
  const difficultyMultipliers = config.xp_difficulty_multipliers
  const difficultyMultiplier = difficultyMultipliers[difficulty] ?? 1.0

  // Calculate base XP
  const base = config.xp_per_ecg_base
  const scoreBonus = Math.floor(score * config.xp_per_score_point)

  // Calculate streak bonus (capped)
  const streakBonus = Math.min(
    Math.floor(currentStreak * config.xp_streak_bonus_per_day),
    config.xp_streak_bonus_max
  )

  // Calculate perfect bonus
  const perfectBonus = isPerfect ? config.xp_perfect_bonus : 0

  // Calculate raw XP (before level/event multipliers)
  const rawXP = Math.floor((base + scoreBonus + streakBonus + perfectBonus) * difficultyMultiplier)

  // Calculate level multiplier: 1 + (level - 1) × multiplier_per_level
  // Level 1 = 1.0, Level 100 = 1.25
  const levelMultiplier = 1 + (currentLevel - 1) * config.level_multiplier_per_level

  // Calculate event bonus (additive, not multiplicative)
  let eventBonus = 0
  if (activeEvent === '2x') {
    eventBonus = config.event_2x_bonus
  } else if (activeEvent === '3x') {
    eventBonus = config.event_3x_bonus
  }

  // Calculate final XP
  const totalMultiplier = levelMultiplier + eventBonus
  const finalXP = Math.floor(rawXP * totalMultiplier)

  return {
    rawXP,
    finalXP,
    levelMultiplier,
    difficultyMultiplier,
    eventBonus,
    streakBonus,
    perfectBonus,
    breakdown: {
      base,
      scoreBonus,
      difficultyMultiplier,
      streakBonus,
      perfectBonus,
      levelMultiplier,
      eventBonus,
    },
  }
}

/**
 * Calculate the XP required to reach a specific level
 * Uses exponential growth: xp_per_level_base × (xp_per_level_growth ^ (level - 2))
 *
 * Level 2: 100 XP
 * Level 3: 115 XP
 * Level 4: 132 XP
 * etc.
 */
export function xpRequiredForLevel(level: number, config: GamificationConfig): number {
  if (level <= 1) return 0
  if (level === 2) return config.xp_per_level_base

  // Exponential growth
  return Math.floor(
    config.xp_per_level_base * Math.pow(config.xp_per_level_growth, level - 2)
  )
}

/**
 * Calculate total XP required to reach a level from level 1
 */
export function totalXPForLevel(level: number, config: GamificationConfig): number {
  if (level <= 1) return 0

  let total = 0
  for (let l = 2; l <= level; l++) {
    total += xpRequiredForLevel(l, config)
  }
  return total
}

/**
 * Calculate level from total XP
 */
export function calculateLevelFromXP(totalXP: number, config: GamificationConfig): number {
  if (totalXP <= 0) return 1

  let level = 1
  let xpNeeded = 0

  while (level < config.max_level) {
    const nextLevelXP = xpRequiredForLevel(level + 1, config)
    if (xpNeeded + nextLevelXP > totalXP) break
    xpNeeded += nextLevelXP
    level++
  }

  return Math.min(level, config.max_level)
}

/**
 * Calculate XP progress towards next level
 */
export function xpProgressToNextLevel(
  totalXP: number,
  config: GamificationConfig
): { currentXP: number; requiredXP: number; percentage: number } {
  const currentLevel = calculateLevelFromXP(totalXP, config)

  if (currentLevel >= config.max_level) {
    return { currentXP: 0, requiredXP: 0, percentage: 100 }
  }

  const xpAtCurrentLevel = totalXPForLevel(currentLevel, config)
  const xpForNextLevel = xpRequiredForLevel(currentLevel + 1, config)
  const currentXP = totalXP - xpAtCurrentLevel
  const percentage = Math.min(100, Math.floor((currentXP / xpForNextLevel) * 100))

  return {
    currentXP,
    requiredXP: xpForNextLevel,
    percentage,
  }
}

/**
 * Check if a level up occurred
 */
export function checkLevelUp(
  previousTotalXP: number,
  newTotalXP: number,
  config: GamificationConfig
): { leveledUp: boolean; previousLevel: number; newLevel: number } {
  const previousLevel = calculateLevelFromXP(previousTotalXP, config)
  const newLevel = calculateLevelFromXP(newTotalXP, config)

  return {
    leveledUp: newLevel > previousLevel,
    previousLevel,
    newLevel,
  }
}
