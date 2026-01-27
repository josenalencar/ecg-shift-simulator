import { createClient } from '@/lib/supabase/server'
import { GrantedPlan } from '@/types/database'

export type SubscriptionStatus = 'active' | 'inactive' | 'canceled' | 'past_due'
export type PlanType = 'free' | 'premium' | 'ai' | 'aluno_ecg'
export type PlanSource = 'none' | 'granted' | 'paid'

export interface SubscriptionInfo {
  status: SubscriptionStatus
  isActive: boolean
  currentPeriodEnd: Date | null
  cancelAtPeriodEnd: boolean
}

export interface UserPlanInfo {
  planType: PlanType
  source: PlanSource
  isActive: boolean
  isPremium: boolean      // Any premium tier (premium, ai, aluno_ecg)
  hasAI: boolean          // Has AI features (ai or aluno_ecg)
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
    .maybeSingle()

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

export async function getUserPlanInfo(userId: string): Promise<UserPlanInfo> {
  const supabase = await createClient()

  // First check for granted plan (takes priority)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('granted_plan')
    .eq('id', userId)
    .single()

  if (profile?.granted_plan) {
    const grantedPlan = profile.granted_plan as GrantedPlan
    return {
      planType: grantedPlan,
      source: 'granted',
      isActive: true,
      isPremium: true,  // All granted plans are premium tier
      hasAI: grantedPlan === 'ai' || grantedPlan === 'aluno_ecg',
      currentPeriodEnd: null,  // No expiry for granted plans
      cancelAtPeriodEnd: false,
    }
  }

  // Then check paid subscription
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: subscriptionData } = await (supabase as any)
    .from('subscriptions')
    .select('status, plan, current_period_end, cancel_at_period_end')
    .eq('user_id', userId)
    .maybeSingle()

  const subscription = subscriptionData as {
    status?: string
    plan?: string
    current_period_end?: string
    cancel_at_period_end?: boolean
  } | null

  if (!subscription || subscription.status !== 'active') {
    return {
      planType: 'free',
      source: 'none',
      isActive: false,
      isPremium: false,
      hasAI: false,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    }
  }

  const planType = subscription.plan === 'ai' ? 'ai' : 'premium'
  return {
    planType: planType as PlanType,
    source: 'paid',
    isActive: true,
    isPremium: true,
    hasAI: subscription.plan === 'ai',
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
