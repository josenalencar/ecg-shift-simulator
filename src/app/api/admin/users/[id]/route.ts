import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

// Helper to create admin client (bypasses RLS)
function getSupabaseAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params
    const supabase = await createClient()

    // Check if current user is authenticated and is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if ((adminProfile as { role?: string } | null)?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Get subscription info
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    // Get gamification stats
    const { data: gamification } = await supabaseAdmin
      .from('user_gamification_stats')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    // Get achievements
    const { data: achievements } = await supabaseAdmin
      .from('user_achievements')
      .select('*, achievements(*)')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false })

    // Get attempt stats
    const { data: attempts } = await supabaseAdmin
      .from('attempts')
      .select('id, score, created_at, ecg_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)

    // Calculate stats
    const totalAttempts = attempts?.length || 0
    const avgScore = totalAttempts > 0
      ? attempts!.reduce((sum, a) => sum + Number(a.score), 0) / totalAttempts
      : 0
    const passCount = attempts?.filter(a => Number(a.score) >= 80).length || 0
    const passRate = totalAttempts > 0 ? (passCount / totalAttempts) * 100 : 0

    return NextResponse.json({
      profile,
      subscription,
      gamification: gamification || {
        total_xp: 0,
        current_level: 1,
        current_streak: 0,
        longest_streak: 0,
        total_ecgs_completed: 0,
        perfect_scores: 0
      },
      achievements: achievements || [],
      stats: {
        totalAttempts,
        avgScore: Math.round(avgScore * 10) / 10,
        passCount,
        passRate: Math.round(passRate * 10) / 10
      },
      recentAttempts: attempts || []
    })
  } catch (error) {
    console.error('[User Details] API error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
