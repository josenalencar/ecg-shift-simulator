import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

const resend = new Resend(process.env.RESEND_API_KEY)

// User segment types
const SEGMENT_DEFINITIONS = [
  { id: 'free', name: 'Usuários Free', description: 'Usuários no plano gratuito' },
  { id: 'premium', name: 'Premium', description: 'Assinantes do plano Premium' },
  { id: 'premium_ai', name: 'Premium + IA', description: 'Assinantes do plano Premium com IA' },
  { id: 'ecg_com_ja', name: 'ECG com JA', description: 'Usuários do ECG com JA' },
  { id: 'cortesia', name: 'Cortesia', description: 'Usuários com acesso de cortesia' },
  { id: 'all_users', name: 'Todos os Usuários', description: 'Todos os usuários cadastrados' },
  { id: 'active_7d', name: 'Ativos (7 dias)', description: 'Usuários ativos nos últimos 7 dias' },
  { id: 'inactive_30d', name: 'Inativos (30+ dias)', description: 'Usuários inativos há mais de 30 dias' },
]

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

// GET - List all audiences/segments from Resend
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is master admin
    const adminId = await checkMasterAdmin(supabase)
    if (!adminId) {
      return NextResponse.json({ error: 'Forbidden - Master admin only' }, { status: 403 })
    }

    // Get audiences from Resend
    const { data: audiences, error } = await resend.audiences.list()

    if (error) {
      console.error('[Segments] Error fetching audiences:', error)
      return NextResponse.json({ error: 'Failed to fetch audiences' }, { status: 500 })
    }

    // Get contact counts for each audience
    const audiencesWithCounts = await Promise.all(
      (audiences?.data || []).map(async (audience) => {
        try {
          const { data: contacts } = await resend.contacts.list({ audienceId: audience.id })
          return {
            ...audience,
            contactCount: contacts?.data?.length || 0,
          }
        } catch {
          return { ...audience, contactCount: 0 }
        }
      })
    )

    return NextResponse.json({
      audiences: audiencesWithCounts,
      segmentDefinitions: SEGMENT_DEFINITIONS,
    })
  } catch (error) {
    console.error('[Segments] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new audience/segment in Resend
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is master admin
    const adminId = await checkMasterAdmin(supabase)
    if (!adminId) {
      return NextResponse.json({ error: 'Forbidden - Master admin only' }, { status: 403 })
    }

    const body = await request.json()
    const { name } = body

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    // Create audience in Resend
    const { data, error } = await resend.audiences.create({ name })

    if (error) {
      console.error('[Segments] Error creating audience:', error)
      return NextResponse.json({ error: 'Failed to create audience' }, { status: 500 })
    }

    console.log(`[Segments] Created audience: ${name}`)

    return NextResponse.json({ audience: data }, { status: 201 })
  } catch (error) {
    console.error('[Segments] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Sync users to a segment/audience based on criteria
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is master admin
    const adminId = await checkMasterAdmin(supabase)
    if (!adminId) {
      return NextResponse.json({ error: 'Forbidden - Master admin only' }, { status: 403 })
    }

    const body = await request.json()
    const { audienceId, segmentType } = body

    if (!audienceId || !segmentType) {
      return NextResponse.json({ error: 'audienceId and segmentType are required' }, { status: 400 })
    }

    const supabaseAdmin = createServiceRoleClient()

    // Get users based on segment type
    // Use correct field names: full_name (not name), granted_plan, and join subscriptions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let usersQuery = (supabaseAdmin as any)
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        granted_plan,
        updated_at,
        subscriptions (
          plan,
          status
        ),
        user_gamification_stats (
          last_activity_date
        )
      `)

    // Apply filters based on segment type
    // Note: granted_plan can be 'premium', 'ai', 'ecg_com_ja', 'cortesia', or null
    // subscriptions.plan can be 'premium' or 'ai', subscriptions.status can be 'active', 'canceled', etc.
    switch (segmentType) {
      case 'free':
        // Users with no granted_plan AND no active subscription
        usersQuery = usersQuery.is('granted_plan', null)
        break
      case 'premium':
        // Users with granted_plan='premium' OR active subscription with plan='premium'
        usersQuery = usersQuery.eq('granted_plan', 'premium')
        break
      case 'premium_ai':
        // Users with granted_plan='ai' OR active subscription with plan='ai'
        usersQuery = usersQuery.eq('granted_plan', 'ai')
        break
      case 'ecg_com_ja':
        usersQuery = usersQuery.eq('granted_plan', 'ecg_com_ja')
        break
      case 'cortesia':
        usersQuery = usersQuery.eq('granted_plan', 'cortesia')
        break
      case 'all_users':
        // No filter - get all users
        break
      case 'active_7d': {
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        usersQuery = usersQuery.gte('updated_at', sevenDaysAgo.toISOString())
        break
      }
      case 'inactive_30d': {
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        usersQuery = usersQuery.lte('updated_at', thirtyDaysAgo.toISOString())
        break
      }
      default:
        return NextResponse.json({ error: 'Invalid segment type' }, { status: 400 })
    }

    const { data: users, error: usersError } = await usersQuery

    if (usersError) {
      console.error('[Segments] Error fetching users:', usersError)
      return NextResponse.json({ error: `Failed to fetch users: ${usersError.message}` }, { status: 500 })
    }

    // For 'free' segment, we need to also filter out users with active subscriptions
    let filteredUsers = users || []
    if (segmentType === 'free') {
      filteredUsers = filteredUsers.filter((user: { subscriptions?: Array<{ status: string }> }) => {
        const hasActiveSubscription = user.subscriptions?.some(
          (sub: { status: string }) => sub.status === 'active'
        )
        return !hasActiveSubscription
      })
    }

    // For premium/ai segments, also include users with active subscriptions of that type
    if (segmentType === 'premium' || segmentType === 'premium_ai') {
      // Get users with active subscriptions of the target plan
      const targetPlan = segmentType === 'premium' ? 'premium' : 'ai'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: subUsers } = await (supabaseAdmin as any)
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          granted_plan,
          subscriptions!inner (
            plan,
            status
          )
        `)
        .eq('subscriptions.plan', targetPlan)
        .eq('subscriptions.status', 'active')

      // Merge and deduplicate
      const existingIds = new Set(filteredUsers.map((u: { id: string }) => u.id))
      for (const user of subUsers || []) {
        if (!existingIds.has(user.id)) {
          filteredUsers.push(user)
        }
      }
    }

    // Add users to the audience as contacts
    let added = 0
    let skipped = 0
    const errors: string[] = []

    for (const user of filteredUsers) {
      if (!user.email) {
        skipped++
        continue
      }

      try {
        await resend.contacts.create({
          audienceId,
          email: user.email,
          firstName: user.full_name?.split(' ')[0] || '',
          lastName: user.full_name?.split(' ').slice(1).join(' ') || '',
        })
        added++
      } catch (err) {
        // Contact might already exist, that's okay
        const error = err as { message?: string }
        if (error.message && !error.message.includes('already exists')) {
          errors.push(`${user.email}: ${error.message}`)
        } else {
          // Already exists is not an error, just skip
          skipped++
        }
      }
    }

    console.log(`[Segments] Synced ${added} contacts to audience ${audienceId} (skipped: ${skipped})`)

    return NextResponse.json({
      success: true,
      added,
      skipped,
      total: filteredUsers.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('[Segments] Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: `Internal server error: ${errorMessage}` }, { status: 500 })
  }
}

// DELETE - Delete an audience
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is master admin
    const adminId = await checkMasterAdmin(supabase)
    if (!adminId) {
      return NextResponse.json({ error: 'Forbidden - Master admin only' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const audienceId = searchParams.get('audienceId')

    if (!audienceId) {
      return NextResponse.json({ error: 'audienceId is required' }, { status: 400 })
    }

    const { error } = await resend.audiences.remove(audienceId)

    if (error) {
      console.error('[Segments] Error deleting audience:', error)
      return NextResponse.json({ error: 'Failed to delete audience' }, { status: 500 })
    }

    console.log(`[Segments] Deleted audience: ${audienceId}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Segments] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
