import { SupabaseClient } from '@supabase/supabase-js'
import type { GamificationConfig } from '@/types/database'

// Default configuration values (matches database defaults)
export const DEFAULT_CONFIG: GamificationConfig = {
  id: 'default',
  xp_per_ecg_base: 10,
  xp_per_score_point: 0.5,
  xp_difficulty_multipliers: { easy: 0.8, medium: 1.0, hard: 1.3 },
  xp_streak_bonus_per_day: 0.5,
  xp_streak_bonus_max: 15,
  xp_perfect_bonus: 25,
  level_multiplier_per_level: 0.002525,
  max_level: 100,
  xp_per_level_base: 100,
  xp_per_level_growth: 1.15,
  event_2x_bonus: 0.125,
  event_3x_bonus: 0.25,
  streak_grace_period_hours: 36,
  inactivity_email_days: [7, 30, 60],
  inactivity_event_duration_hours: 24,
  ranking_top_n_visible: 10,
  updated_at: new Date().toISOString(),
  updated_by: null,
}

// Cache for config
let configCache: GamificationConfig | null = null
let configCacheTime: number = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export async function getGamificationConfig(
  supabase: SupabaseClient
): Promise<GamificationConfig> {
  // Check cache
  if (configCache && Date.now() - configCacheTime < CACHE_TTL) {
    return configCache
  }

  const { data, error } = await supabase
    .from('gamification_config')
    .select('*')
    .eq('id', 'default')
    .single()

  if (error || !data) {
    console.warn('Failed to load gamification config, using defaults:', error)
    return DEFAULT_CONFIG
  }

  // Update cache
  configCache = data as GamificationConfig
  configCacheTime = Date.now()

  return configCache
}

export async function updateGamificationConfig(
  supabase: SupabaseClient,
  updates: Partial<GamificationConfig>,
  updatedBy: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('gamification_config')
    .update({
      ...updates,
      updated_by: updatedBy,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 'default')

  if (error) {
    return { success: false, error: error.message }
  }

  // Invalidate cache
  configCache = null

  return { success: true }
}

export function invalidateConfigCache(): void {
  configCache = null
}
