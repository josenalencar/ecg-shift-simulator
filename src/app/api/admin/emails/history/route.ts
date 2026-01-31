import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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

// GET - Fetch email history from Resend
export async function GET() {
  try {
    const supabase = await createClient()

    // Check if user is master admin
    const adminId = await checkMasterAdmin(supabase)
    if (!adminId) {
      return NextResponse.json({ error: 'Forbidden - Master admin only' }, { status: 403 })
    }

    // Fetch recent emails from Resend API
    // Note: Resend's emails.list() returns the last 100 emails
    const { data: emails, error } = await resend.emails.list()

    if (error) {
      console.error('[Email History] Resend API error:', error)
      return NextResponse.json({ error: 'Failed to fetch email history' }, { status: 500 })
    }

    // Transform the data for the frontend
    const history = emails?.data?.map(email => ({
      id: email.id,
      to: Array.isArray(email.to) ? email.to.join(', ') : email.to,
      subject: email.subject,
      created_at: email.created_at,
      last_event: email.last_event,
    })) || []

    return NextResponse.json({ emails: history })
  } catch (error) {
    console.error('[Email History] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
