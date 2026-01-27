import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getGamificationConfig, calculateLevelFromXP } from '@/lib/gamification'
import type { Difficulty } from '@/types/database'

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

interface AttemptWithDifficulty {
  user_id: string
  score: number
  created_at: string
  ecgs: { difficulty: Difficulty } | null
}

interface BackfillResult {
  userId: string
  userName: string | null
  attempts: number
  previousXP: number
  newXP: number
  xpAwarded: number
  level: number
}

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
      // No body or invalid JSON - backfill all users
    }

    // Get gamification config
    const config = await getGamificationConfig(supabase)

    // Get all attempts with ECG difficulty
    let attemptsQuery = supabase
      .from('attempts')
      .select('user_id, score, created_at, ecgs(difficulty)')
      .order('created_at', { ascending: true })

    if (targetUserId) {
      attemptsQuery = attemptsQuery.eq('user_id', targetUserId)
    }

    const { data: allAttempts, error: attemptsError } = await attemptsQuery

    if (attemptsError) {
      console.error('Failed to fetch attempts:', attemptsError)
      return NextResponse.json({ error: 'Failed to fetch attempts' }, { status: 500 })
    }

    const attempts = allAttempts as AttemptWithDifficulty[] | null

    if (!attempts || attempts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No attempts found to backfill',
        usersProcessed: 0,
        totalXPAwarded: 0,
        details: [],
      })
    }

    // Group attempts by user
    const userAttempts = new Map<string, AttemptWithDifficulty[]>()
    for (const attempt of attempts) {
      if (!userAttempts.has(attempt.user_id)) {
        userAttempts.set(attempt.user_id, [])
      }
      userAttempts.get(attempt.user_id)!.push(attempt)
    }

    // Get current stats for all users
    const userIds = Array.from(userAttempts.keys())
    const { data: existingStats } = await supabase
      .from('user_gamification_stats')
      .select('user_id, total_xp')
      .in('user_id', userIds)

    type StatsRow = { user_id: string; total_xp: number | null }
    const existingStatsMap = new Map<string, number>()
    ;(existingStats as StatsRow[] | null)?.forEach(stat => {
      existingStatsMap.set(stat.user_id, stat.total_xp || 0)
    })

    // Get user names for reporting
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', userIds)

    type ProfileRow = { id: string; full_name: string | null; email: string }
    const profilesMap = new Map<string, { full_name: string | null; email: string }>()
    ;(profiles as ProfileRow[] | null)?.forEach(p => {
      profilesMap.set(p.id, { full_name: p.full_name, email: p.email })
    })

    // Calculate XP for each user
    const results: BackfillResult[] = []
    let totalXPAwarded = 0

    for (const [userId, userAttemptsData] of userAttempts) {
      const previousXP = existingStatsMap.get(userId) || 0

      // Calculate XP for each attempt
      let calculatedXP = 0
      let perfectScores = 0
      const ecgsByDifficulty: Record<Difficulty, number> = { easy: 0, medium: 0, hard: 0 }

      for (const attempt of userAttemptsData) {
        const difficulty: Difficulty = attempt.ecgs?.difficulty || 'medium'
        const difficultyMultiplier = config.xp_difficulty_multipliers[difficulty] ?? 1.0

        // Calculate XP: (base + score bonus) × difficulty multiplier
        // Skip streak/event bonuses for historical data
        const baseXP = config.xp_per_ecg_base + Math.floor(attempt.score * config.xp_per_score_point)
        const attemptXP = Math.floor(baseXP * difficultyMultiplier)

        calculatedXP += attemptXP
        ecgsByDifficulty[difficulty]++

        if (attempt.score === 100) {
          perfectScores++
          calculatedXP += config.xp_perfect_bonus
        }
      }

      // Only add XP if calculated XP is greater than current XP
      // This handles the case where user already has some XP from new attempts
      const xpToAward = Math.max(0, calculatedXP - previousXP)
      const newTotalXP = previousXP + xpToAward
      const newLevel = calculateLevelFromXP(newTotalXP, config)

      if (xpToAward > 0) {
        // Upsert user_gamification_stats
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: upsertError } = await (supabase as any)
          .from('user_gamification_stats')
          .upsert({
            user_id: userId,
            total_xp: newTotalXP,
            current_level: newLevel,
            total_ecgs_completed: userAttemptsData.length,
            total_perfect_scores: perfectScores,
            ecgs_by_difficulty: ecgsByDifficulty,
            // Preserve existing values or set defaults for other fields
            current_streak: 0,
            longest_streak: 0,
            last_activity_date: userAttemptsData[userAttemptsData.length - 1]?.created_at?.split('T')[0] || null,
            correct_by_category: {},
            correct_by_finding: {},
            perfect_streak: 0,
            events_participated: 0,
          }, {
            onConflict: 'user_id',
            ignoreDuplicates: false,
          })

        if (upsertError) {
          console.error(`Failed to update stats for user ${userId}:`, upsertError)
          continue
        }

        totalXPAwarded += xpToAward
      }

      const profile = profilesMap.get(userId)
      results.push({
        userId,
        userName: profile?.full_name || profile?.email?.split('@')[0] || null,
        attempts: userAttemptsData.length,
        previousXP,
        newXP: newTotalXP,
        xpAwarded: xpToAward,
        level: newLevel,
      })
    }

    return NextResponse.json({
      success: true,
      usersProcessed: results.length,
      totalXPAwarded,
      details: results.sort((a, b) => b.xpAwarded - a.xpAwarded),
    })
  } catch (error) {
    console.error('Error in backfill XP:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET endpoint to preview what would be backfilled without making changes
export async function GET() {
  try {
    const supabase = await createClient()

    // Check if user is master admin
    const adminId = await checkMasterAdmin(supabase)
    if (!adminId) {
      return NextResponse.json({ error: 'Forbidden - Master admin only' }, { status: 403 })
    }

    // Get gamification config
    const config = await getGamificationConfig(supabase)

    // Get all attempts with ECG difficulty
    const { data: allAttempts, error: attemptsError } = await supabase
      .from('attempts')
      .select('user_id, score, ecgs(difficulty)')

    if (attemptsError) {
      console.error('Failed to fetch attempts:', attemptsError)
      return NextResponse.json({ error: 'Failed to fetch attempts' }, { status: 500 })
    }

    const attempts = allAttempts as AttemptWithDifficulty[] | null

    if (!attempts || attempts.length === 0) {
      return NextResponse.json({
        preview: true,
        usersToProcess: 0,
        totalXPToAward: 0,
        details: [],
      })
    }

    // Group attempts by user
    const userAttempts = new Map<string, AttemptWithDifficulty[]>()
    for (const attempt of attempts) {
      if (!userAttempts.has(attempt.user_id)) {
        userAttempts.set(attempt.user_id, [])
      }
      userAttempts.get(attempt.user_id)!.push(attempt)
    }

    // Get current stats for all users
    const userIds = Array.from(userAttempts.keys())
    const { data: existingStats } = await supabase
      .from('user_gamification_stats')
      .select('user_id, total_xp')
      .in('user_id', userIds)

    type StatsRow = { user_id: string; total_xp: number | null }
    const existingStatsMap = new Map<string, number>()
    ;(existingStats as StatsRow[] | null)?.forEach(stat => {
      existingStatsMap.set(stat.user_id, stat.total_xp || 0)
    })

    // Get user names
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', userIds)

    type ProfileRow = { id: string; full_name: string | null; email: string }
    const profilesMap = new Map<string, { full_name: string | null; email: string }>()
    ;(profiles as ProfileRow[] | null)?.forEach(p => {
      profilesMap.set(p.id, { full_name: p.full_name, email: p.email })
    })

    // Calculate what XP would be awarded
    const preview: Array<{
      userId: string
      userName: string | null
      attempts: number
      currentXP: number
      calculatedXP: number
      xpToAward: number
    }> = []
    let totalXPToAward = 0

    for (const [userId, userAttemptsData] of userAttempts) {
      const currentXP = existingStatsMap.get(userId) || 0

      let calculatedXP = 0
      for (const attempt of userAttemptsData) {
        const difficulty: Difficulty = attempt.ecgs?.difficulty || 'medium'
        const difficultyMultiplier = config.xp_difficulty_multipliers[difficulty] ?? 1.0
        const baseXP = config.xp_per_ecg_base + Math.floor(attempt.score * config.xp_per_score_point)
        calculatedXP += Math.floor(baseXP * difficultyMultiplier)

        if (attempt.score === 100) {
          calculatedXP += config.xp_perfect_bonus
        }
      }

      const xpToAward = Math.max(0, calculatedXP - currentXP)

      if (xpToAward > 0) {
        totalXPToAward += xpToAward
        const profile = profilesMap.get(userId)
        preview.push({
          userId,
          userName: profile?.full_name || profile?.email?.split('@')[0] || null,
          attempts: userAttemptsData.length,
          currentXP,
          calculatedXP,
          xpToAward,
        })
      }
    }

    return NextResponse.json({
      preview: true,
      usersToProcess: preview.length,
      totalXPToAward,
      details: preview.sort((a, b) => b.xpToAward - a.xpToAward),
    })
  } catch (error) {
    console.error('Error in preview backfill:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
