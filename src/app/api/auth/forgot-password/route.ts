import { NextRequest, NextResponse } from 'next/server'
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
    const body = await request.json()
    const { email } = body as { email: string }

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Build the redirect URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://plantaoecg.com.br'
    const redirectUrl = `${baseUrl}/auth/callback?next=/reset-password`

    console.log('[Forgot Password] Using redirect URL:', redirectUrl)

    // Generate password recovery link (does NOT send email)
    // Note: If email doesn't exist, Supabase will return an error
    // For security, we don't reveal if the email exists or not
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: redirectUrl,
      }
    })

    if (linkError) {
      // Don't reveal if email exists or not - always return success for security
      console.log('[Forgot Password] Error generating link (email may not exist):', linkError.message)
      return NextResponse.json({ success: true })
    }

    // Get user name from profile (optional, for personalization)
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('email', email)
      .single()

    // Send email via Resend with custom template
    const emailResult = await sendPasswordResetEmail(
      email,
      profile?.full_name || null,
      linkData.properties.action_link
    )

    if (!emailResult.success) {
      console.error('[Forgot Password] Error sending email:', emailResult.error)
      // Still return success to not reveal email existence
    } else {
      console.log('[Forgot Password] Custom email sent to:', email)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Forgot Password] API error:', error)
    // Return success even on error to not reveal information
    return NextResponse.json({ success: true })
  }
}
