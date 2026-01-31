import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/email'
import { syncUserToResend } from '@/lib/resend-sync'

// Admin client to bypass RLS
function getSupabaseAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const user = data.user

      // Check if this is a new user (OAuth signup) - check if profile exists
      const supabaseAdmin = getSupabaseAdmin()
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('id, created_at')
        .eq('id', user.id)
        .single()

      // If profile doesn't exist OR was just created (within last 30 seconds), send welcome email
      const isNewUser = !existingProfile ||
        (existingProfile.created_at &&
         new Date().getTime() - new Date(existingProfile.created_at).getTime() < 30000)

      if (isNewUser) {
        // For OAuth users, the profile is created by the database trigger
        // But we still need to update the full_name from OAuth metadata if available
        const fullName = user.user_metadata?.full_name ||
                        user.user_metadata?.name ||
                        user.email?.split('@')[0] || ''

        // Update profile with OAuth name if not set
        if (fullName && existingProfile) {
          await supabaseAdmin
            .from('profiles')
            .update({ full_name: fullName })
            .eq('id', user.id)
            .is('full_name', null)
        }

        // Send welcome email for new users
        const email = user.email
        if (email) {
          sendWelcomeEmail(email, fullName).catch((err) => {
            console.error('Failed to send welcome email for OAuth user:', err)
          })

          // Sync new user to Resend audience
          syncUserToResend(user.id, email, fullName).catch((err) => {
            console.error('Failed to sync user to Resend:', err)
          })
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate`)
}
