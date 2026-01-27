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
    const { email, fullName, grantedPlan } = body as {
      email: string
      fullName?: string
      grantedPlan?: GrantedPlan | 'free'
    }

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    if (existingUser) {
      return NextResponse.json({ error: 'Usuário já existe' }, { status: 400 })
    }

    // Create auth user (this triggers handle_new_user which creates profile)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase(),
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: fullName || null
      }
    })

    if (authError) {
      console.error('[Create User] Auth error:', authError)
      return NextResponse.json({ error: 'Erro ao criar usuário: ' + authError.message }, { status: 500 })
    }

    // Wait a moment for the trigger to create the profile
    await new Promise(resolve => setTimeout(resolve, 500))

    // Update profile with full_name if provided (trigger may not capture it properly)
    if (fullName) {
      await supabaseAdmin
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', authData.user.id)
    }

    // Set granted plan if not 'free'
    if (grantedPlan && grantedPlan !== 'free') {
      const { error: planError } = await supabaseAdmin
        .from('profiles')
        .update({ granted_plan: grantedPlan })
        .eq('id', authData.user.id)

      if (planError) {
        console.error('[Create User] Plan error:', planError)
      }
    }

    // Generate password reset link so user can set their password
    const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: email.toLowerCase(),
    })

    if (resetError) {
      console.error('[Create User] Reset link error:', resetError)
    }

    return NextResponse.json({
      success: true,
      userId: authData.user.id,
      message: 'Usuário criado. Um email foi enviado para definir a senha.'
    })
  } catch (error) {
    console.error('[Create User] API error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
