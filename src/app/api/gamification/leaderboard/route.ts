import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getXPLeaderboard } from '@/lib/gamification'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get limit from query params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    // Get leaderboard
    const leaderboard = await getXPLeaderboard(user.id, supabase, limit)

    return NextResponse.json(leaderboard)
  } catch (error) {
    console.error('Error in leaderboard:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
