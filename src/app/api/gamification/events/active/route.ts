import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getActiveEvent, getActiveGlobalEvents } from '@/lib/gamification'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get active event for user
    const activeEvent = await getActiveEvent(user.id, supabase)

    // Get all active global events
    const globalEvents = await getActiveGlobalEvents(supabase)

    return NextResponse.json({
      activeEvent,
      globalEvents,
    })
  } catch (error) {
    console.error('Error in active events:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
