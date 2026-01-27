import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

// Helper to create admin client (lazy to avoid build-time issues)
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

// Difficulty weights for scoring
const DIFFICULTY_WEIGHTS: Record<string, number> = {
  easy: 1.0,
  medium: 1.25,
  hard: 1.5,
}

function calculateWeightedScore(avgScore: number, attemptCount: number, maxAttempts: number): number {
  const normalizedActivity = maxAttempts > 0 ? Math.min(attemptCount / maxAttempts, 1) : 0
  return (avgScore * 0.7) + (normalizedActivity * 100 * 0.3)
}

function calculateDifficultyWeightedAvg(attempts: { score: number; difficulty: string | null }[]): number {
  if (attempts.length === 0) return 0

  let totalWeightedScore = 0
  let totalWeight = 0

  for (const attempt of attempts) {
    const weight = DIFFICULTY_WEIGHTS[attempt.difficulty || 'medium'] || 1.0
    totalWeightedScore += Number(attempt.score) * weight
    totalWeight += weight
  }

  return totalWeight > 0 ? totalWeightedScore / totalWeight : 0
}

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin()

    // Get the current user to identify them in rankings
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    const currentUserId = user?.id

    // Get all profiles (only id, full_name, email for anonymization)
    const { data: profilesData, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, role')

    if (profilesError) {
      console.error('Failed to fetch profiles for rankings:', profilesError)
      return NextResponse.json({ error: 'Failed to fetch rankings' }, { status: 500 })
    }

    // Get all attempts with ECG difficulty
    const { data: attemptsData, error: attemptsError } = await supabaseAdmin
      .from('attempts')
      .select('user_id, score, ecgs(difficulty)')

    if (attemptsError) {
      console.error('Failed to fetch attempts for rankings:', attemptsError)
      return NextResponse.json({ error: 'Failed to fetch rankings' }, { status: 500 })
    }

    type ProfileInfo = { id: string; full_name: string | null; email: string; role: string }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type AttemptData = { user_id: string; score: number; ecgs: any }

    const profiles = profilesData as ProfileInfo[]
    const attempts = attemptsData as AttemptData[]

    // Calculate user attempts map
    const userAttemptsMap = new Map<string, { score: number; difficulty: string | null }[]>()
    attempts?.forEach(attempt => {
      if (!userAttemptsMap.has(attempt.user_id)) {
        userAttemptsMap.set(attempt.user_id, [])
      }
      userAttemptsMap.get(attempt.user_id)!.push({
        score: Number(attempt.score),
        difficulty: attempt.ecgs?.difficulty || null
      })
    })

    const maxAttempts = Math.max(...Array.from(userAttemptsMap.values()).map(a => a.length), 1)

    // Calculate rankings (excluding admins from public ranking)
    const rankings = Array.from(userAttemptsMap.entries())
      .map(([userId, userAttempts]) => {
        const profileInfo = profiles?.find(p => p.id === userId)
        // Skip admins in public ranking
        if (profileInfo?.role === 'admin') {
          return null
        }
        const avgScore = calculateDifficultyWeightedAvg(userAttempts)
        const weightedScore = calculateWeightedScore(avgScore, userAttempts.length, maxAttempts)
        return {
          userId,
          name: profileInfo?.full_name || profileInfo?.email?.split('@')[0] || 'Anonimo',
          avgScore: Math.round(avgScore),
          attemptCount: userAttempts.length,
          weightedScore: Math.round(weightedScore * 100) / 100,
          isCurrentUser: userId === currentUserId
        }
      })
      .filter(Boolean)
      .sort((a, b) => b!.weightedScore - a!.weightedScore)
      .map((entry, index) => ({ ...entry, rank: index + 1 }))

    const currentUserRank = rankings.find(r => r?.isCurrentUser)?.rank || 0
    const totalUsers = rankings.length
    const percentile = totalUsers > 1 && currentUserRank > 0
      ? Math.round(((totalUsers - currentUserRank) / (totalUsers - 1)) * 100)
      : 0

    return NextResponse.json({
      rankings: rankings.slice(0, 50), // Return top 50
      currentUserRank,
      totalUsers,
      percentile
    })
  } catch (error) {
    console.error('Rankings API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
