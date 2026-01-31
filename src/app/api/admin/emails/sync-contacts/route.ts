import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { bulkSyncUsersToResend, getSyncStatus } from '@/lib/resend-sync'

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

// GET - Get sync status
export async function GET() {
  try {
    const supabase = await createClient()

    // Check if user is master admin
    const adminId = await checkMasterAdmin(supabase)
    if (!adminId) {
      return NextResponse.json({ error: 'Forbidden - Master admin only' }, { status: 403 })
    }

    const status = await getSyncStatus()

    return NextResponse.json(status)
  } catch (error) {
    console.error('[Sync Contacts] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Bulk sync all users to Resend
export async function POST(_request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is master admin
    const adminId = await checkMasterAdmin(supabase)
    if (!adminId) {
      return NextResponse.json({ error: 'Forbidden - Master admin only' }, { status: 403 })
    }

    console.log('[Sync Contacts] Starting bulk sync...')

    const result = await bulkSyncUsersToResend()

    if (!result.success && result.errors.length > 0) {
      return NextResponse.json({
        ...result,
        message: 'Sync failed'
      }, { status: 500 })
    }

    return NextResponse.json({
      ...result,
      message: `Synced ${result.synced} users, ${result.failed} failed`
    })
  } catch (error) {
    console.error('[Sync Contacts] Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: `Internal server error: ${errorMessage}` }, { status: 500 })
  }
}
