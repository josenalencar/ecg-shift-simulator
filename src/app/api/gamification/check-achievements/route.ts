import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { checkAchievements, getUserStats, type AchievementCheckContext } from '@/lib/gamification'

// Service role client for inserting achievements (bypasses RLS)
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } }
)

/**
 * POST /api/gamification/check-achievements
 *
 * Checks and awards any achievements the user has earned but not yet received.
 * Uses service_role to bypass RLS and insert achievements securely.
 */
export async function POST() {
  try {
    // Get current user from session
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's current stats
    const stats = await getUserStats(user.id, supabase)
    if (!stats) {
      return NextResponse.json({ error: 'User stats not found' }, { status: 404 })
    }

    // Build context for achievement checking
    const context: AchievementCheckContext = {
      stats,
      // No attemptData since this is a retroactive check
    }

    // Check achievements using the admin client (service_role)
    const achievementsUnlocked = await checkAchievements(user.id, context, supabaseAdmin)

    // If achievements were unlocked, add the XP reward to user's total
    if (achievementsUnlocked.length > 0) {
      let totalXpReward = 0
      for (const ua of achievementsUnlocked) {
        totalXpReward += ua.xpReward
      }

      if (totalXpReward > 0) {
        await supabaseAdmin
          .from('user_gamification_stats')
          .update({
            total_xp: stats.total_xp + totalXpReward,
          })
          .eq('user_id', user.id)
      }
    }

    return NextResponse.json({
      success: true,
      achievementsUnlocked: achievementsUnlocked.map(ua => ({
        id: ua.achievement.id,
        name: ua.achievement.name_pt,
        xpReward: ua.xpReward,
      })),
      totalNewXp: achievementsUnlocked.reduce((sum, ua) => sum + ua.xpReward, 0),
    })
  } catch (error) {
    console.error('Error checking achievements:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
