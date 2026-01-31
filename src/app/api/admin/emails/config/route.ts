import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

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

// GET - Fetch all email configurations
export async function GET() {
  try {
    const supabase = await createClient()

    // Check if user is master admin
    const adminId = await checkMasterAdmin(supabase)
    if (!adminId) {
      return NextResponse.json({ error: 'Forbidden - Master admin only' }, { status: 403 })
    }

    const supabaseAdmin = createServiceRoleClient()

    const { data: configs, error } = await supabaseAdmin
      .from('email_config')
      .select('*')
      .order('category')
      .order('email_type')

    if (error) {
      console.error('[Email Config] Error fetching configs:', error)
      return NextResponse.json({ error: 'Failed to fetch email configs' }, { status: 500 })
    }

    return NextResponse.json({ configs })
  } catch (error) {
    console.error('[Email Config] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update email configuration
export async function PUT(request: Request) {
  try {
    const supabase = await createClient()

    // Check if user is master admin
    const adminId = await checkMasterAdmin(supabase)
    if (!adminId) {
      return NextResponse.json({ error: 'Forbidden - Master admin only' }, { status: 403 })
    }

    const body = await request.json()
    const { email_type, is_enabled, trigger_config } = body

    if (!email_type) {
      return NextResponse.json({ error: 'email_type is required' }, { status: 400 })
    }

    const supabaseAdmin = createServiceRoleClient()

    // Build update object
    const updateData: Record<string, unknown> = {}
    if (typeof is_enabled === 'boolean') {
      updateData.is_enabled = is_enabled
    }
    if (trigger_config !== undefined) {
      updateData.trigger_config = trigger_config
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabaseAdmin as any)
      .from('email_config')
      .update(updateData)
      .eq('email_type', email_type)
      .select()
      .single()

    if (error) {
      console.error('[Email Config] Error updating config:', error)
      return NextResponse.json({ error: 'Failed to update email config' }, { status: 500 })
    }

    console.log(`[Email Config] Updated ${email_type}:`, updateData)

    return NextResponse.json({ config: data })
  } catch (error) {
    console.error('[Email Config] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
