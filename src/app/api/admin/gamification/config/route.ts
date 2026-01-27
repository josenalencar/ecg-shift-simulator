import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getGamificationConfig, updateGamificationConfig } from '@/lib/gamification'

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

    // Get config
    const config = await getGamificationConfig(supabase)

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error in get config:', error)
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

    // Get updates from request body
    const updates = await request.json()

    // Remove fields that shouldn't be updated directly
    delete updates.id
    delete updates.updated_at
    delete updates.updated_by

    // Update config
    const result = await updateGamificationConfig(supabase, updates, adminId)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    // Return updated config
    const config = await getGamificationConfig(supabase)

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error in update config:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
