import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { GrantedPlan } from '@/types/database'

// Helper to create admin client (bypasses RLS)
function getSupabaseAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json()
    const { userId, grantedPlan } = body as { userId: string; grantedPlan: GrantedPlan | null }

    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário é obrigatório' }, { status: 400 })
    }

    // Validate grantedPlan
    const validPlans: (GrantedPlan | null)[] = ['premium', 'ai', 'aluno_ecg', null]
    if (!validPlans.includes(grantedPlan)) {
      return NextResponse.json({ error: 'Plano inválido' }, { status: 400 })
    }

    // Use admin client to bypass RLS
    const supabaseAdmin = getSupabaseAdmin()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabaseAdmin as any)
      .from('profiles')
      .update({ granted_plan: grantedPlan })
      .eq('id', userId)

    if (error) {
      console.error('[Grant Plan] Error:', error)
      return NextResponse.json({ error: 'Erro ao atualizar plano' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Grant Plan] API error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
