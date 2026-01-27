import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAchievementsWithProgress } from '@/lib/gamification'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get achievements with progress
    const achievements = await getAchievementsWithProgress(user.id, supabase)

    // Calculate stats
    const earned = achievements.filter(a => a.earned).length
    const total = achievements.length

    return NextResponse.json({
      achievements,
      stats: {
        earned,
        total,
        percentage: Math.round((earned / total) * 100),
      },
    })
  } catch (error) {
    console.error('Error in achievements:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
