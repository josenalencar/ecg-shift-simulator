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
    const { email_type, is_enabled, trigger_config, custom_html, custom_subject, use_custom_template } = body

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
    if (custom_html !== undefined) {
      updateData.custom_html = custom_html
    }
    if (custom_subject !== undefined) {
      updateData.custom_subject = custom_subject
    }
    if (typeof use_custom_template === 'boolean') {
      updateData.use_custom_template = use_custom_template
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

// POST - Create new email configuration
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check if user is master admin
    const adminId = await checkMasterAdmin(supabase)
    if (!adminId) {
      return NextResponse.json({ error: 'Forbidden - Master admin only' }, { status: 403 })
    }

    const body = await request.json()
    const {
      email_type,
      category,
      name_pt,
      description_pt,
      is_enabled = false,
      trigger_config = {},
      custom_html,
      custom_subject,
      use_custom_template = false
    } = body

    if (!email_type || !category || !name_pt) {
      return NextResponse.json({ error: 'email_type, category, and name_pt are required' }, { status: 400 })
    }

    const supabaseAdmin = createServiceRoleClient()

    // Check if email_type already exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (supabaseAdmin as any)
      .from('email_config')
      .select('email_type')
      .eq('email_type', email_type)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Email type already exists' }, { status: 409 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabaseAdmin as any)
      .from('email_config')
      .insert({
        email_type,
        category,
        name_pt,
        description_pt,
        is_enabled,
        trigger_config,
        custom_html,
        custom_subject,
        use_custom_template
      })
      .select()
      .single()

    if (error) {
      console.error('[Email Config] Error creating config:', error)
      return NextResponse.json({ error: 'Failed to create email config' }, { status: 500 })
    }

    console.log(`[Email Config] Created new email type: ${email_type}`)

    return NextResponse.json({ config: data }, { status: 201 })
  } catch (error) {
    console.error('[Email Config] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete email configuration
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()

    // Check if user is master admin
    const adminId = await checkMasterAdmin(supabase)
    if (!adminId) {
      return NextResponse.json({ error: 'Forbidden - Master admin only' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const email_type = searchParams.get('email_type')

    if (!email_type) {
      return NextResponse.json({ error: 'email_type is required' }, { status: 400 })
    }

    // Prevent deleting core email types
    const coreEmailTypes = [
      'welcome', 'subscription_activated', 'subscription_canceled', 'payment_failed',
      'password_reset', 'renewal_reminder', 'first_case', 'day2', 'day3', 'day5', 'day7',
      'streak_starter', 'streak_at_risk', 'streak_milestone', 'level_up', 'achievement',
      'weekly_digest', 'monthly_report', 'xp_event_announcement'
    ]

    if (coreEmailTypes.includes(email_type)) {
      return NextResponse.json({ error: 'Cannot delete core email types' }, { status: 403 })
    }

    const supabaseAdmin = createServiceRoleClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabaseAdmin as any)
      .from('email_config')
      .delete()
      .eq('email_type', email_type)

    if (error) {
      console.error('[Email Config] Error deleting config:', error)
      return NextResponse.json({ error: 'Failed to delete email config' }, { status: 500 })
    }

    console.log(`[Email Config] Deleted email type: ${email_type}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Email Config] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
