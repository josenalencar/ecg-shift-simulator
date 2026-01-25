import { createClient } from '@/lib/supabase/server'

export type SubscriptionStatus = 'active' | 'inactive' | 'canceled' | 'past_due'

export interface SubscriptionInfo {
  status: SubscriptionStatus
  isActive: boolean
  currentPeriodEnd: Date | null
  cancelAtPeriodEnd: boolean
}

export async function getSubscriptionInfo(userId: string): Promise<SubscriptionInfo> {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: subscriptionData } = await (supabase as any)
    .from('subscriptions')
    .select('status, current_period_end, cancel_at_period_end')
    .eq('user_id', userId)
    .single()

  const subscription = subscriptionData as {
    status?: string
    current_period_end?: string
    cancel_at_period_end?: boolean
  } | null

  if (!subscription) {
    return {
      status: 'inactive',
      isActive: false,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    }
  }

  return {
    status: (subscription.status || 'inactive') as SubscriptionStatus,
    isActive: subscription.status === 'active',
    currentPeriodEnd: subscription.current_period_end
      ? new Date(subscription.current_period_end)
      : null,
    cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
  }
}

export async function getMonthlyAttemptCount(userId: string): Promise<number> {
  const supabase = await createClient()

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count } = await supabase
    .from('attempts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startOfMonth.toISOString())

  return count || 0
}

export const FREE_MONTHLY_LIMIT = 5
