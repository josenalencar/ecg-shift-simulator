import { Resend } from 'resend'
import { createServiceRoleClient } from '@/lib/supabase/server'

const resend = new Resend(process.env.RESEND_API_KEY)

// Audiences available on Resend free plan (max 3)
// To add more audiences, upgrade Resend plan
const AUDIENCES = {
  all: 'Plantão ECG - Todos',      // All users
  premium: 'Plantão ECG - Premium', // Premium & Premium+AI users
  cortesia: 'Cortesia'              // ECG com JA & other granted plans
} as const

type AudienceKey = keyof typeof AUDIENCES

// Cache for audience IDs
let audienceCache: Record<string, string> | null = null

/**
 * Helper to add delay for rate limiting (max 2 req/sec)
 */
async function rateLimitDelay(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 600)) // 600ms between calls
}

/**
 * Get or create all Resend audiences
 */
export async function getOrCreateAllAudiences(): Promise<Record<string, string> | null> {
  if (audienceCache) return audienceCache

  try {
    // Get existing audiences
    const { data: audiences, error: listError } = await resend.audiences.list()

    if (listError) {
      console.error('[Resend Sync] Error listing audiences:', listError)
      return null
    }

    const existingAudiences = audiences?.data || []
    const result: Record<string, string> = {}

    // Check each required audience
    for (const [key, name] of Object.entries(AUDIENCES)) {
      const existing = existingAudiences.find(a => a.name === name)

      if (existing) {
        result[key] = existing.id
        console.log(`[Resend Sync] Found audience ${name}: ${existing.id}`)
      } else {
        // Create missing audience
        await rateLimitDelay()
        const { data: newAudience, error: createError } = await resend.audiences.create({ name })

        if (createError) {
          console.error(`[Resend Sync] Error creating audience ${name}:`, createError)
          continue
        }

        if (newAudience?.id) {
          result[key] = newAudience.id
          console.log(`[Resend Sync] Created audience ${name}: ${newAudience.id}`)
        }
      }
    }

    audienceCache = result
    return result
  } catch (error) {
    console.error('[Resend Sync] Error in getOrCreateAllAudiences:', error)
    return null
  }
}

/**
 * Get or create the default Resend audience for all users
 */
export async function getOrCreateDefaultAudience(): Promise<string | null> {
  const audiences = await getOrCreateAllAudiences()
  return audiences?.all || null
}

/**
 * Determine which segment audience a user belongs to based on their plan
 * Returns null for free users (they only go to "all" audience)
 */
function getUserSegmentAudience(grantedPlan: string | null): AudienceKey | null {
  if (!grantedPlan) return null // Free users only in "all"
  if (grantedPlan === 'ai' || grantedPlan === 'premium') return 'premium'
  return 'cortesia' // aluno_ecg and other granted plans
}

/**
 * Sync a single user to Resend audiences (default + segment)
 */
export async function syncUserToResend(
  userId: string,
  email: string,
  fullName: string | null,
  grantedPlan?: string | null
): Promise<{ success: boolean; contactId?: string; error?: string }> {
  try {
    // Get or create all audiences
    const audiences = await getOrCreateAllAudiences()

    if (!audiences?.all) {
      return { success: false, error: 'Failed to get/create audiences' }
    }

    const supabase = createServiceRoleClient()
    const firstName = fullName?.split(' ')[0] || ''
    const lastName = fullName?.split(' ').slice(1).join(' ') || ''

    // Add to default "all" audience
    await rateLimitDelay()
    const { data, error } = await resend.contacts.create({
      audienceId: audiences.all,
      email,
      firstName,
      lastName,
    })

    if (error && !error.message?.includes('already exists')) {
      // Real error - track failure
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('resend_contact_sync').upsert({
        user_id: userId,
        sync_status: 'failed',
        error_message: error.message
      })
      console.error(`[Resend Sync] Error syncing user ${email}:`, error)
      return { success: false, error: error.message }
    }

    // Also add to segment-specific audience if user has a plan
    const segment = getUserSegmentAudience(grantedPlan ?? null)
    const segmentAudienceId = segment ? audiences[segment] : null

    if (segmentAudienceId) {
      await rateLimitDelay()
      await resend.contacts.create({
        audienceId: segmentAudienceId,
        email,
        firstName,
        lastName,
      }).catch(() => {}) // Ignore errors for segment audiences
    }

    // Success - update sync tracking
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('resend_contact_sync').upsert({
      user_id: userId,
      resend_contact_id: data?.id || null,
      default_audience_id: audiences.all,
      segment_audiences: segmentAudienceId ? [segmentAudienceId] : [],
      sync_status: 'synced',
      last_synced_at: new Date().toISOString()
    })

    console.log(`[Resend Sync] Synced user ${email} to ${segment}`)
    return { success: true, contactId: data?.id }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(`[Resend Sync] Error syncing user ${email}:`, error)
    return { success: false, error: errorMessage }
  }
}

/**
 * Get all audience info from Resend
 */
export async function getAllAudiencesInfo(): Promise<{
  audiences: Array<{ id: string; name: string; contactCount?: number }>
  error?: string
}> {
  try {
    const { data: audiences, error: listError } = await resend.audiences.list()

    if (listError) {
      return { audiences: [], error: listError.message }
    }

    return {
      audiences: (audiences?.data || []).map(a => ({
        id: a.id,
        name: a.name
      }))
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { audiences: [], error: message }
  }
}

/**
 * Get sync status summary
 */
export async function getSyncStatus(): Promise<{
  total: number
  synced: number
  pending: number
  failed: number
  defaultAudienceId: string | null
  audiences: Array<{ id: string; name: string }>
}> {
  try {
    const supabase = createServiceRoleClient()

    // Get total users count
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    // Get sync status counts
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: syncData } = await (supabase as any)
      .from('resend_contact_sync')
      .select('sync_status, default_audience_id')

    type SyncRecord = { sync_status: string; default_audience_id: string | null }
    const syncRecords = syncData as SyncRecord[] | null
    const synced = syncRecords?.filter(s => s.sync_status === 'synced').length || 0
    const pending = (totalUsers || 0) - (syncRecords?.length || 0)
    const failed = syncRecords?.filter(s => s.sync_status === 'failed').length || 0
    const defaultAudienceId = syncRecords?.[0]?.default_audience_id || null

    // Get audiences info
    const { audiences } = await getAllAudiencesInfo()

    return {
      total: totalUsers || 0,
      synced,
      pending,
      failed,
      defaultAudienceId,
      audiences
    }
  } catch (error) {
    console.error('[Resend Sync] Error getting sync status:', error)
    return { total: 0, synced: 0, pending: 0, failed: 0, defaultAudienceId: null, audiences: [] }
  }
}

/**
 * Bulk sync all pending users to Resend
 * Returns progress updates via callback
 */
export async function bulkSyncUsersToResend(
  onProgress?: (synced: number, failed: number, total: number) => void
): Promise<{
  success: boolean
  synced: number
  failed: number
  total: number
  audienceId: string | null
  errors: string[]
}> {
  const errors: string[] = []
  let synced = 0
  let failed = 0

  try {
    // Get or create all audiences first
    const audiences = await getOrCreateAllAudiences()

    if (!audiences?.all) {
      return {
        success: false,
        synced: 0,
        failed: 0,
        total: 0,
        audienceId: null,
        errors: ['Failed to get/create audiences']
      }
    }

    const supabase = createServiceRoleClient()

    // Get all users that haven't been synced or failed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: users, error: usersError } = await (supabase as any)
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        granted_plan,
        resend_contact_sync (
          sync_status
        )
      `)
      .order('created_at', { ascending: true })

    if (usersError) {
      return {
        success: false,
        synced: 0,
        failed: 0,
        total: 0,
        audienceId: audiences.all,
        errors: [`Failed to fetch users: ${usersError.message}`]
      }
    }

    type UserWithSync = {
      id: string
      email: string | null
      full_name: string | null
      granted_plan: string | null
      resend_contact_sync: { sync_status: string }[] | null
    }

    // Filter to users that need syncing
    const usersToSync = ((users || []) as UserWithSync[]).filter((user: UserWithSync) => {
      const syncRecord = user.resend_contact_sync
      const status = syncRecord?.[0]?.sync_status
      return !status || status === 'pending' || status === 'failed'
    })

    const total = usersToSync.length

    if (total === 0) {
      return {
        success: true,
        synced: 0,
        failed: 0,
        total: 0,
        audienceId: audiences.all,
        errors: []
      }
    }

    console.log(`[Resend Sync] Starting bulk sync of ${total} users`)

    // Process users SEQUENTIALLY to respect rate limits (2 req/sec)
    for (let i = 0; i < usersToSync.length; i++) {
      const user = usersToSync[i]

      if (!user.email) {
        failed++
        continue
      }

      const result = await syncUserToResend(user.id, user.email, user.full_name, user.granted_plan)

      if (result.success) {
        synced++
      } else {
        failed++
        if (result.error) {
          errors.push(`${user.email}: ${result.error}`)
        }
      }

      // Report progress every 10 users
      if ((i + 1) % 10 === 0) {
        onProgress?.(synced, failed, total)
        console.log(`[Resend Sync] Progress: ${synced + failed}/${total}`)
      }
    }

    console.log(`[Resend Sync] Bulk sync complete: ${synced} synced, ${failed} failed`)

    return {
      success: true,
      synced,
      failed,
      total,
      audienceId: audiences.all,
      errors: errors.slice(0, 10) // Limit errors to first 10
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Resend Sync] Bulk sync error:', error)
    return {
      success: false,
      synced,
      failed,
      total: 0,
      audienceId: null,
      errors: [errorMessage]
    }
  }
}
