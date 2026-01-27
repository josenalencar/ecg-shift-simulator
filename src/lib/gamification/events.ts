import { SupabaseClient } from '@supabase/supabase-js'
import type { XPEvent, XPEventType, XPEventTargetType } from '@/types/database'

/**
 * Get the currently active XP event for a user
 * Checks global events and user-specific events
 */
export async function getActiveEvent(
  userId: string,
  supabase: SupabaseClient
): Promise<XPEvent | null> {
  const now = new Date().toISOString()

  // First check for user-specific events
  const { data: userEvent, error: userError } = await supabase
    .from('xp_events')
    .select('*')
    .eq('is_active', true)
    .eq('target_user_id', userId)
    .lte('start_at', now)
    .gte('end_at', now)
    .order('multiplier_type', { ascending: false }) // Prefer 3x over 2x
    .limit(1)
    .maybeSingle()

  if (!userError && userEvent) {
    return userEvent as XPEvent
  }

  // Check for global events (target_type = 'all')
  const { data: globalEvent, error: globalError } = await supabase
    .from('xp_events')
    .select('*')
    .eq('is_active', true)
    .eq('target_type', 'all')
    .is('target_user_id', null)
    .lte('start_at', now)
    .gte('end_at', now)
    .order('multiplier_type', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!globalError && globalEvent) {
    return globalEvent as XPEvent
  }

  // Check user_xp_events for targeted events
  const { data: targetedEvent, error: targetedError } = await supabase
    .from('user_xp_events')
    .select(`
      event_id,
      xp_events (*)
    `)
    .eq('user_id', userId)
    .maybeSingle()

  if (!targetedError && targetedEvent?.xp_events) {
    const event = targetedEvent.xp_events as unknown as XPEvent
    const eventStart = new Date(event.start_at)
    const eventEnd = new Date(event.end_at)
    const currentTime = new Date()

    if (event.is_active && currentTime >= eventStart && currentTime <= eventEnd) {
      return event
    }
  }

  return null
}

/**
 * Get all active global events
 */
export async function getActiveGlobalEvents(
  supabase: SupabaseClient
): Promise<XPEvent[]> {
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('xp_events')
    .select('*')
    .eq('is_active', true)
    .eq('target_type', 'all')
    .is('target_user_id', null)
    .lte('start_at', now)
    .gte('end_at', now)
    .order('start_at', { ascending: false })

  if (error) {
    console.error('Failed to load global events:', error)
    return []
  }

  return (data || []) as XPEvent[]
}

/**
 * Record user participation in an event
 */
export async function recordEventParticipation(
  userId: string,
  eventId: string,
  supabase: SupabaseClient
): Promise<void> {
  // Check if already recorded
  const { data: existing } = await supabase
    .from('user_xp_events')
    .select('id')
    .eq('user_id', userId)
    .eq('event_id', eventId)
    .single()

  if (existing) {
    // Update participation flag
    await supabase
      .from('user_xp_events')
      .update({ participated: true })
      .eq('user_id', userId)
      .eq('event_id', eventId)
  } else {
    // Insert new record
    await supabase
      .from('user_xp_events')
      .insert({
        user_id: userId,
        event_id: eventId,
        participated: true,
      })
  }
}

/**
 * Create a personal XP event for a user (used for inactivity re-engagement)
 */
export async function createPersonalEvent(
  userId: string,
  eventName: string,
  eventType: XPEventType,
  durationHours: number,
  createdBy: string | null,
  supabase: SupabaseClient
): Promise<XPEvent | null> {
  const now = new Date()
  const endAt = new Date(now.getTime() + durationHours * 60 * 60 * 1000)

  const { data, error } = await supabase
    .from('xp_events')
    .insert({
      name: eventName,
      description: `Evento especial de ${eventType} XP`,
      multiplier_type: eventType,
      start_at: now.toISOString(),
      end_at: endAt.toISOString(),
      target_type: 'user_specific' as XPEventTargetType,
      target_user_id: userId,
      is_active: true,
      created_by: createdBy,
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to create personal event:', error)
    return null
  }

  return data as XPEvent
}

/**
 * Create a global XP event (admin only)
 */
export async function createGlobalEvent(
  name: string,
  description: string,
  eventType: XPEventType,
  startAt: Date,
  endAt: Date,
  createdBy: string,
  supabase: SupabaseClient
): Promise<XPEvent | null> {
  const { data, error } = await supabase
    .from('xp_events')
    .insert({
      name,
      description,
      multiplier_type: eventType,
      start_at: startAt.toISOString(),
      end_at: endAt.toISOString(),
      target_type: 'all' as XPEventTargetType,
      target_user_id: null,
      is_active: true,
      created_by: createdBy,
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to create global event:', error)
    return null
  }

  return data as XPEvent
}

/**
 * Deactivate an event
 */
export async function deactivateEvent(
  eventId: string,
  supabase: SupabaseClient
): Promise<boolean> {
  const { error } = await supabase
    .from('xp_events')
    .update({ is_active: false })
    .eq('id', eventId)

  if (error) {
    console.error('Failed to deactivate event:', error)
    return false
  }

  return true
}

/**
 * Get all events (for admin)
 */
export async function getAllEvents(
  supabase: SupabaseClient,
  options?: { includeInactive?: boolean; limit?: number }
): Promise<XPEvent[]> {
  let query = supabase
    .from('xp_events')
    .select('*')
    .order('created_at', { ascending: false })

  if (!options?.includeInactive) {
    query = query.eq('is_active', true)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    console.error('Failed to load events:', error)
    return []
  }

  return (data || []) as XPEvent[]
}
