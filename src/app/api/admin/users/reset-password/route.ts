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
    const { userId } = body as { userId: string }

    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário é obrigatório' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Get user email
    const { data: targetUser, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single()

    if (userError || !targetUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Generate password recovery link
    const { error: resetError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: targetUser.email,
    })

    if (resetError) {
      console.error('[Reset Password] Error:', resetError)
      return NextResponse.json({ error: 'Erro ao gerar link de recuperação' }, { status: 500 })
    }

    console.log('[Reset Password] Recovery email sent to:', targetUser.email)

    return NextResponse.json({
      success: true,
      message: 'Email de recuperação enviado para ' + targetUser.email
    })
  } catch (error) {
    console.error('[Reset Password] API error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
