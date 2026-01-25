import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Use service role for webhook to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } }
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode === 'subscription' && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          )
          await handleSubscriptionChange(subscription)
        }
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionChange(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string | null }
        if (invoice.subscription) {
          await supabaseAdmin
            .from('subscriptions')
            .update({ status: 'past_due' })
            .eq('stripe_subscription_id', invoice.subscription)
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleSubscriptionChange(subscription: any) {
  const userId = subscription.metadata?.supabase_user_id
  const customerId = subscription.customer as string

  const subscriptionData = {
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    status: subscription.status === 'active' || subscription.status === 'trialing'
      ? 'active'
      : subscription.status,
    price_id: subscription.items?.data?.[0]?.price?.id,
    current_period_start: subscription.current_period_start
      ? new Date(subscription.current_period_start * 1000).toISOString()
      : null,
    current_period_end: subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : null,
    cancel_at_period_end: subscription.cancel_at_period_end || false,
  }

  if (userId) {
    // Update by user_id
    await supabaseAdmin
      .from('subscriptions')
      .upsert({
        user_id: userId,
        ...subscriptionData,
      })

    // Update profile subscription status
    await supabaseAdmin
      .from('profiles')
      .update({ subscription_status: subscriptionData.status })
      .eq('id', userId)
  } else {
    // Update by customer_id if no user_id in metadata
    await supabaseAdmin
      .from('subscriptions')
      .update(subscriptionData)
      .eq('stripe_customer_id', customerId)
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleSubscriptionDeleted(subscription: any) {
  const userId = subscription.metadata?.supabase_user_id
  const customerId = subscription.customer as string

  const updateData = {
    status: 'canceled',
    cancel_at_period_end: false,
  }

  if (userId) {
    await supabaseAdmin
      .from('subscriptions')
      .update(updateData)
      .eq('user_id', userId)

    await supabaseAdmin
      .from('profiles')
      .update({ subscription_status: 'canceled' })
      .eq('id', userId)
  } else {
    await supabaseAdmin
      .from('subscriptions')
      .update(updateData)
      .eq('stripe_customer_id', customerId)
  }
}
