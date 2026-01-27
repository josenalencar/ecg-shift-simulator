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

type ImportUser = {
  email: string
  plan: GrantedPlan | 'free'
}

type ImportResult = {
  email: string
  success: boolean
  error?: string
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
    const { users } = body as { users: ImportUser[] }

    if (!users || !Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: 'Lista de usuários vazia' }, { status: 400 })
    }

    if (users.length > 100) {
      return NextResponse.json({ error: 'Máximo de 100 usuários por importação' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()
    const results: ImportResult[] = []
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const validPlans = ['free', 'premium', 'ai', 'aluno_ecg']

    for (const importUser of users) {
      const email = importUser.email?.trim().toLowerCase()
      const plan = importUser.plan?.trim().toLowerCase() as GrantedPlan | 'free'

      // Validate email
      if (!email || !emailRegex.test(email)) {
        results.push({ email: importUser.email || '(vazio)', success: false, error: 'Email inválido' })
        continue
      }

      // Validate plan
      if (!validPlans.includes(plan)) {
        results.push({ email, success: false, error: `Plano inválido: ${importUser.plan}` })
        continue
      }

      // Check if user already exists
      const { data: existingUser } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle()

      if (existingUser) {
        results.push({ email, success: false, error: 'Usuário já existe' })
        continue
      }

      try {
        // Create auth user
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email,
          email_confirm: true,
        })

        if (authError) {
          results.push({ email, success: false, error: authError.message })
          continue
        }

        // Wait for trigger
        await new Promise(resolve => setTimeout(resolve, 300))

        // Set granted plan if not 'free'
        if (plan !== 'free') {
          await supabaseAdmin
            .from('profiles')
            .update({ granted_plan: plan })
            .eq('id', authData.user.id)
        }

        // Generate magic link for first login
        await supabaseAdmin.auth.admin.generateLink({
          type: 'magiclink',
          email,
        })

        results.push({ email, success: true })
      } catch (err) {
        results.push({ email, success: false, error: 'Erro inesperado' })
      }
    }

    const successCount = results.filter(r => r.success).length
    const failedCount = results.filter(r => !r.success).length

    return NextResponse.json({
      success: true,
      summary: {
        total: users.length,
        success: successCount,
        failed: failedCount
      },
      results
    })
  } catch (error) {
    console.error('[Bulk Import] API error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
