import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { sendPasswordResetEmail } from '@/lib/email'

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

    // Get user email and name
    const { data: targetUser, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .single()

    if (userError || !targetUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Build the redirect URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://plantaoecg.com.br'
    const redirectUrl = `${baseUrl}/auth/callback?next=/reset-password`

    console.log('[Reset Password] Using redirect URL:', redirectUrl)
    console.log('[Reset Password] NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL)
    console.log('[Reset Password] NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL)

    // Generate password recovery link (does NOT send email)
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: targetUser.email,
      options: {
        redirectTo: redirectUrl,
      }
    })

    if (linkError || !linkData) {
      console.error('[Reset Password] Error generating link:', linkError)
      return NextResponse.json({ error: 'Erro ao gerar link de recuperação' }, { status: 500 })
    }

    console.log('[Reset Password] Generated link:', linkData.properties.action_link)

    // Send email via Resend with custom template
    const emailResult = await sendPasswordResetEmail(
      targetUser.email,
      targetUser.full_name,
      linkData.properties.action_link
    )

    if (!emailResult.success) {
      console.error('[Reset Password] Error sending email:', emailResult.error)
      return NextResponse.json({ error: 'Erro ao enviar email' }, { status: 500 })
    }

    console.log('[Reset Password] Custom email sent to:', targetUser.email)

    return NextResponse.json({
      success: true,
      message: 'Email de recuperação enviado para ' + targetUser.email
    })
  } catch (error) {
    console.error('[Reset Password] API error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
