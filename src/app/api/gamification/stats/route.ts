import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserStats, xpProgressToNextLevel, getGamificationConfig } from '@/lib/gamification'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user stats
    const stats = await getUserStats(user.id, supabase)
    if (!stats) {
      return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 })
    }

    // Get config for XP progress calculation
    const config = await getGamificationConfig(supabase)
    const xpProgress = xpProgressToNextLevel(stats.total_xp, config)

    return NextResponse.json({
      stats,
      xpProgress,
    })
  } catch (error) {
    console.error('Error in gamification stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
