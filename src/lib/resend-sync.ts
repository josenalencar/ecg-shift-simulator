import { Resend } from 'resend'
import { createServiceRoleClient } from '@/lib/supabase/server'

const resend = new Resend(process.env.RESEND_API_KEY)
const DEFAULT_AUDIENCE_NAME = 'Plantão ECG - Todos'

/**
 * Get or create the default Resend audience for all users
 */
export async function getOrCreateDefaultAudience(): Promise<string | null> {
  try {
    // Check existing audiences
    const { data: audiences, error: listError } = await resend.audiences.list()

    if (listError) {
      console.error('[Resend Sync] Error listing audiences:', listError)
      return null
    }

    // Find existing default audience
    const existing = audiences?.data?.find(a => a.name === DEFAULT_AUDIENCE_NAME)
    if (existing) {
      console.log(`[Resend Sync] Found existing audience: ${existing.id}`)
      return existing.id
    }

    // Create new audience
    const { data: newAudience, error: createError } = await resend.audiences.create({
      name: DEFAULT_AUDIENCE_NAME
    })

    if (createError) {
      console.error('[Resend Sync] Error creating audience:', createError)
      return null
    }

    console.log(`[Resend Sync] Created new audience: ${newAudience?.id}`)
    return newAudience?.id || null
  } catch (error) {
    console.error('[Resend Sync] Error in getOrCreateDefaultAudience:', error)
    return null
  }
}

/**
 * Sync a single user to Resend default audience
 */
export async function syncUserToResend(
  userId: string,
  email: string,
  fullName: string | null
): Promise<{ success: boolean; contactId?: string; error?: string }> {
  try {
    // Get or create default audience
    const audienceId = await getOrCreateDefaultAudience()

    if (!audienceId) {
      return { success: false, error: 'Failed to get/create default audience' }
    }

    // Create contact in Resend
    const { data, error } = await resend.contacts.create({
      audienceId,
      email,
      firstName: fullName?.split(' ')[0] || '',
      lastName: fullName?.split(' ').slice(1).join(' ') || '',
    })

    const supabase = createServiceRoleClient()

    if (error) {
      // Check if contact already exists (not a real error)
      if (error.message?.includes('already exists')) {
        // Update sync tracking as synced
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from('resend_contact_sync').upsert({
          user_id: userId,
          default_audience_id: audienceId,
          sync_status: 'synced',
          last_synced_at: new Date().toISOString()
        })
        return { success: true }
      }

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

    // Success - update sync tracking
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('resend_contact_sync').upsert({
      user_id: userId,
      resend_contact_id: data?.id,
      default_audience_id: audienceId,
      sync_status: 'synced',
      last_synced_at: new Date().toISOString()
    })

    console.log(`[Resend Sync] Synced user ${email} (contact: ${data?.id})`)
    return { success: true, contactId: data?.id }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(`[Resend Sync] Error syncing user ${email}:`, error)
    return { success: false, error: errorMessage }
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

    return {
      total: totalUsers || 0,
      synced,
      pending,
      failed,
      defaultAudienceId
    }
  } catch (error) {
    console.error('[Resend Sync] Error getting sync status:', error)
    return { total: 0, synced: 0, pending: 0, failed: 0, defaultAudienceId: null }
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
    // Get or create default audience
    const audienceId = await getOrCreateDefaultAudience()

    if (!audienceId) {
      return {
        success: false,
        synced: 0,
        failed: 0,
        total: 0,
        audienceId: null,
        errors: ['Failed to get/create default audience']
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
        audienceId,
        errors: [`Failed to fetch users: ${usersError.message}`]
      }
    }

    type UserWithSync = {
      id: string
      email: string | null
      full_name: string | null
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
        audienceId,
        errors: []
      }
    }

    console.log(`[Resend Sync] Starting bulk sync of ${total} users`)

    // Process in batches of 50
    const BATCH_SIZE = 50
    for (let i = 0; i < usersToSync.length; i += BATCH_SIZE) {
      const batch = usersToSync.slice(i, i + BATCH_SIZE)

      await Promise.all(
        batch.map(async (user) => {
          if (!user.email) {
            failed++
            return
          }

          const result = await syncUserToResend(user.id, user.email, user.full_name)

          if (result.success) {
            synced++
          } else {
            failed++
            if (result.error) {
              errors.push(`${user.email}: ${result.error}`)
            }
          }
        })
      )

      // Report progress
      onProgress?.(synced, failed, total)

      // Small delay to avoid rate limiting
      if (i + BATCH_SIZE < usersToSync.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    console.log(`[Resend Sync] Bulk sync complete: ${synced} synced, ${failed} failed`)

    return {
      success: true,
      synced,
      failed,
      total,
      audienceId,
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
