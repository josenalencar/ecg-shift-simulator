import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

export async function GET() {
  try {
    const supabase = await createClient()

    // Check if user is master admin
    const adminId = await checkMasterAdmin(supabase)
    if (!adminId) {
      return NextResponse.json({ error: 'Forbidden - Master admin only' }, { status: 403 })
    }

    // Get all achievements
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: achievements, error } = await (supabase as any)
      .from('achievements')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching achievements:', error)
      return NextResponse.json({ error: 'Failed to fetch achievements' }, { status: 500 })
    }

    // Get total user count for percentage calculation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count: totalUsers } = await (supabase as any)
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    // Get unlock counts for each achievement
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: unlockCounts } = await (supabase as any)
      .from('user_achievements')
      .select('achievement_id')

    const countMap: Record<string, number> = {}
    if (unlockCounts) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const unlock of unlockCounts as any[]) {
        countMap[unlock.achievement_id] = (countMap[unlock.achievement_id] || 0) + 1
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const achievementsWithStats = (achievements || []).map((a: any) => ({
      ...a,
      unlocks: countMap[a.id] || 0,
      unlock_percentage: totalUsers ? Math.round(((countMap[a.id] || 0) / totalUsers) * 100) : 0,
    }))

    return NextResponse.json({
      achievements: achievementsWithStats,
      total_users: totalUsers || 0,
    })
  } catch (error) {
    console.error('Error in get achievements:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()

    // Check if user is master admin
    const adminId = await checkMasterAdmin(supabase)
    if (!adminId) {
      return NextResponse.json({ error: 'Forbidden - Master admin only' }, { status: 403 })
    }

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Achievement ID required' }, { status: 400 })
    }

    // Only allow updating specific fields
    const allowedFields = ['is_active', 'is_hidden', 'xp_reward', 'name_pt', 'description_pt']
    const filteredUpdates: Record<string, unknown> = {}

    for (const field of allowedFields) {
      if (field in updates) {
        filteredUpdates[field] = updates[field]
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    // Update achievement
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: achievement, error } = await (supabase as any)
      .from('achievements')
      .update(filteredUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating achievement:', error)
      return NextResponse.json({ error: 'Failed to update achievement' }, { status: 500 })
    }

    return NextResponse.json({ achievement })
  } catch (error) {
    console.error('Error in update achievement:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()

    // Check if user is master admin
    const adminId = await checkMasterAdmin(supabase)
    if (!adminId) {
      return NextResponse.json({ error: 'Forbidden - Master admin only' }, { status: 403 })
    }

    const body = await request.json()
    const { action, category, is_active } = body

    if (action !== 'bulk_toggle') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    if (typeof is_active !== 'boolean') {
      return NextResponse.json({ error: 'is_active must be boolean' }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from('achievements')
      .update({ is_active })

    if (category) {
      query = query.eq('category', category)
    }

    const { error } = await query

    if (error) {
      console.error('Error bulk updating achievements:', error)
      return NextResponse.json({ error: 'Failed to update achievements' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in bulk update achievements:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
