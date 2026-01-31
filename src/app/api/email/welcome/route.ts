import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendWelcomeEmail } from '@/lib/email'
import { syncUserToResend } from '@/lib/resend-sync'

export async function POST(_request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const email = user.email
    const fullName = user.user_metadata?.full_name ||
                    user.user_metadata?.name ||
                    email?.split('@')[0] || ''

    if (!email) {
      return NextResponse.json({ error: 'No email found' }, { status: 400 })
    }

    // Send welcome email
    const result = await sendWelcomeEmail(email, fullName)

    // Sync user to Resend audience (non-blocking)
    syncUserToResend(user.id, email, fullName).catch((err) => {
      console.error('Failed to sync user to Resend:', err)
    })

    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      console.error('Failed to send welcome email:', result.error)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }
  } catch (error) {
    console.error('Welcome email API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
