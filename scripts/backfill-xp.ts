/**
 * Script to backfill XP for users with historical attempts
 * Run with: npx tsx scripts/backfill-xp.ts
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

// Load environment variables from .env.local
function loadEnv() {
  try {
    const envPath = join(process.cwd(), '.env.local')
    const envFile = readFileSync(envPath, 'utf-8')
    const lines = envFile.split('\n')

    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=')
        if (key && valueParts.length > 0) {
          process.env[key] = valueParts.join('=').replace(/^["']|["']$/g, '')
        }
      }
    }
  } catch {
    console.error('Could not load .env.local')
  }
}

loadEnv()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// Accept service role key from command line argument or environment variable
const supabaseServiceKey = process.argv[2] || process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL in .env.local')
  process.exit(1)
}

if (!supabaseServiceKey) {
  console.error('Usage: npx tsx scripts/backfill-xp.ts <SUPABASE_SERVICE_ROLE_KEY>')
  console.error('')
  console.error('Get your service role key from:')
  console.error('https://supabase.com/dashboard/project/hwgsjpjbyydpittefnjd/settings/api')
  console.error('')
  console.error('Or set SUPABASE_SERVICE_ROLE_KEY environment variable')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Default config values (same as in the app)
const config = {
  xp_per_ecg_base: 10,
  xp_per_score_point: 0.5,
  xp_difficulty_multipliers: { easy: 0.8, medium: 1.0, hard: 1.3 } as Record<string, number>,
  xp_perfect_bonus: 25,
  xp_per_level_base: 100,
  xp_per_level_growth: 1.15,
  max_level: 100,
}

type Difficulty = 'easy' | 'medium' | 'hard'

interface AttemptWithDifficulty {
  user_id: string
  score: number
  created_at: string
  ecgs: { difficulty: Difficulty }[] | null
}

function calculateLevelFromXP(totalXP: number): number {
  if (totalXP <= 0) return 1

  let level = 1
  let xpNeeded = 0

  while (level < config.max_level) {
    const nextLevelXP = level === 1
      ? config.xp_per_level_base
      : Math.floor(config.xp_per_level_base * Math.pow(config.xp_per_level_growth, level - 1))

    if (xpNeeded + nextLevelXP > totalXP) break
    xpNeeded += nextLevelXP
    level++
  }

  return Math.min(level, config.max_level)
}

async function backfillXP() {
  console.log('🚀 Starting XP backfill...\n')

  // Get gamification config from database (if exists)
  const { data: dbConfig } = await supabase
    .from('gamification_config')
    .select('*')
    .eq('id', 'default')
    .single()

  if (dbConfig) {
    Object.assign(config, {
      xp_per_ecg_base: dbConfig.xp_per_ecg_base,
      xp_per_score_point: dbConfig.xp_per_score_point,
      xp_difficulty_multipliers: dbConfig.xp_difficulty_multipliers,
      xp_perfect_bonus: dbConfig.xp_perfect_bonus,
    })
    console.log('✅ Loaded config from database')
  } else {
    console.log('⚠️  Using default config values')
  }

  console.log(`   Base XP: ${config.xp_per_ecg_base}`)
  console.log(`   XP per score point: ${config.xp_per_score_point}`)
  console.log(`   Difficulty multipliers:`, config.xp_difficulty_multipliers)
  console.log(`   Perfect bonus: ${config.xp_perfect_bonus}\n`)

  // Get all attempts with ECG difficulty
  const { data: allAttempts, error: attemptsError } = await supabase
    .from('attempts')
    .select('user_id, score, created_at, ecgs(difficulty)')
    .order('created_at', { ascending: true })

  if (attemptsError) {
    console.error('❌ Failed to fetch attempts:', attemptsError)
    process.exit(1)
  }

  const attempts = allAttempts as AttemptWithDifficulty[] | null

  if (!attempts || attempts.length === 0) {
    console.log('ℹ️  No attempts found to backfill')
    return
  }

  console.log(`📊 Found ${attempts.length} total attempts\n`)

  // Group attempts by user
  const userAttempts = new Map<string, AttemptWithDifficulty[]>()
  for (const attempt of attempts) {
    if (!userAttempts.has(attempt.user_id)) {
      userAttempts.set(attempt.user_id, [])
    }
    userAttempts.get(attempt.user_id)!.push(attempt)
  }

  console.log(`👥 Found ${userAttempts.size} unique users\n`)

  // Get current stats for all users
  const userIds = Array.from(userAttempts.keys())
  const { data: existingStats } = await supabase
    .from('user_gamification_stats')
    .select('user_id, total_xp')
    .in('user_id', userIds)

  const existingStatsMap = new Map<string, number>()
  existingStats?.forEach((stat: { user_id: string; total_xp: number }) => {
    existingStatsMap.set(stat.user_id, stat.total_xp || 0)
  })

  // Get user names
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .in('id', userIds)

  const profilesMap = new Map<string, { full_name: string | null; email: string }>()
  profiles?.forEach((p: { id: string; full_name: string | null; email: string }) => {
    profilesMap.set(p.id, { full_name: p.full_name, email: p.email })
  })

  // Process each user
  let totalUsersProcessed = 0
  let totalXPAwarded = 0

  console.log('Processing users...\n')
  console.log('─'.repeat(80))

  for (const [userId, userAttemptsData] of userAttempts) {
    const previousXP = existingStatsMap.get(userId) || 0

    // Calculate XP for each attempt
    let calculatedXP = 0
    let perfectScores = 0
    const ecgsByDifficulty: Record<Difficulty, number> = { easy: 0, medium: 0, hard: 0 }

    for (const attempt of userAttemptsData) {
      const difficulty: Difficulty = attempt.ecgs?.[0]?.difficulty || 'medium'
      const difficultyMultiplier = config.xp_difficulty_multipliers[difficulty] ?? 1.0

      // Calculate XP: (base + score bonus) × difficulty multiplier
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
    const xpToAward = Math.max(0, calculatedXP - previousXP)
    const newTotalXP = previousXP + xpToAward
    const newLevel = calculateLevelFromXP(newTotalXP)

    const profile = profilesMap.get(userId)
    const userName = profile?.full_name || profile?.email?.split('@')[0] || 'Unknown'

    if (xpToAward > 0) {
      // Upsert user_gamification_stats
      const { error: upsertError } = await supabase
        .from('user_gamification_stats')
        .upsert({
          user_id: userId,
          total_xp: newTotalXP,
          current_level: newLevel,
          total_ecgs_completed: userAttemptsData.length,
          total_perfect_scores: perfectScores,
          ecgs_by_difficulty: ecgsByDifficulty,
          current_streak: 0,
          longest_streak: 0,
          last_activity_date: userAttemptsData[userAttemptsData.length - 1]?.created_at?.split('T')[0] || null,
          correct_by_category: {},
          correct_by_finding: {},
          perfect_streak: 0,
          events_participated: 0,
        }, {
          onConflict: 'user_id',
        })

      if (upsertError) {
        console.error(`❌ Failed to update ${userName}:`, upsertError.message)
        continue
      }

      console.log(`✅ ${userName.padEnd(25)} | ${userAttemptsData.length.toString().padStart(3)} ECGs | +${xpToAward.toString().padStart(5)} XP | Level ${newLevel}`)
      totalUsersProcessed++
      totalXPAwarded += xpToAward
    } else {
      console.log(`⏭️  ${userName.padEnd(25)} | ${userAttemptsData.length.toString().padStart(3)} ECGs | Already has ${previousXP} XP`)
    }
  }

  console.log('─'.repeat(80))
  console.log(`\n🎉 Backfill complete!`)
  console.log(`   Users processed: ${totalUsersProcessed}`)
  console.log(`   Total XP awarded: ${totalXPAwarded.toLocaleString()}`)
}

backfillXP().catch(console.error)
