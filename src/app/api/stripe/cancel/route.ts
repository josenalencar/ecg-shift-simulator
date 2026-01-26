import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/server'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get subscription
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: subscriptionData } = await (supabase as any)
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', user.id)
      .maybeSingle()

    const subscription = subscriptionData as { stripe_subscription_id?: string } | null

    if (!subscription?.stripe_subscription_id) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 })
    }

    // Cancel at period end (user keeps access until the end of billing period)
    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: true,
    })

    // Update local database
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('subscriptions')
      .update({ cancel_at_period_end: true })
      .eq('user_id', user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cancel error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}
