// Gamification System - ECG Shift Simulator
// Main exports

// Config
export {
  getGamificationConfig,
  updateGamificationConfig,
  invalidateConfigCache,
  DEFAULT_CONFIG,
} from './config'

// XP Calculations
export {
  calculateXP,
  calculateLevelFromXP,
  xpRequiredForLevel,
  totalXPForLevel,
  xpProgressToNextLevel,
  checkLevelUp,
  type XPCalculationParams,
  type XPCalculationResult,
} from './xp'

// Streaks
export {
  checkStreakStatus,
  calculateNewStreak,
  getStreakMilestones,
  isStreakMilestone,
  type StreakStatus,
} from './streaks'

// Achievements
export {
  evaluateAchievement,
  checkAchievements,
  getAchievementsWithProgress,
  markAchievementsNotified,
  type UnlockedAchievement,
  type AchievementCheckContext,
} from './achievements'

// Events
export {
  getActiveEvent,
  getActiveGlobalEvents,
  recordEventParticipation,
  createPersonalEvent,
  createGlobalEvent,
  deactivateEvent,
  getAllEvents,
} from './events'

// Main Hooks
export {
  onAttemptComplete,
  initializeUserStats,
  getUserStats,
  getXPLeaderboard,
  type AttemptData,
  type GamificationResult,
} from './hooks'
