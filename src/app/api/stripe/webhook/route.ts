import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import {
  sendSubscriptionActivatedEmail,
  sendSubscriptionCanceledEmail,
  sendPaymentFailedEmail,
} from '@/lib/email'

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
          // Send activation email for new subscriptions via checkout
          await handleSubscriptionChange(subscription, true)
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

          // Send payment failed email
          const { data: subscriptionRecord } = await supabaseAdmin
            .from('subscriptions')
            .select('user_id')
            .eq('stripe_subscription_id', invoice.subscription)
            .single()

          if (subscriptionRecord?.user_id) {
            const { data: profile } = await supabaseAdmin
              .from('profiles')
              .select('email, full_name')
              .eq('id', subscriptionRecord.user_id)
              .single()

            if (profile?.email) {
              sendPaymentFailedEmail(
                profile.email,
                profile.full_name || ''
              ).catch((err) => console.error('Failed to send payment failed email:', err))
            }
          }
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
async function handleSubscriptionChange(subscription: any, sendEmail = false) {
  const userId = subscription.metadata?.supabase_user_id
  const plan = subscription.metadata?.plan || 'premium'
  const customerId = subscription.customer as string

  console.log('[Webhook] handleSubscriptionChange:', {
    userId,
    plan,
    customerId,
    subscriptionId: subscription.id,
    status: subscription.status,
    metadata: subscription.metadata,
  })

  const subscriptionData = {
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    status: subscription.status === 'active' || subscription.status === 'trialing'
      ? 'active'
      : subscription.status,
    price_id: subscription.items?.data?.[0]?.price?.id,
    plan: plan,
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
    const { error: subError } = await supabaseAdmin
      .from('subscriptions')
      .upsert({
        user_id: userId,
        ...subscriptionData,
      })

    if (subError) {
      console.error('[Webhook] Failed to upsert subscription:', subError)
      throw new Error(`Failed to upsert subscription: ${subError.message}`)
    }
    console.log('[Webhook] Subscription upserted successfully for user:', userId)

    // Update profile subscription status
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ subscription_status: subscriptionData.status })
      .eq('id', userId)

    if (profileError) {
      console.error('[Webhook] Failed to update profile:', profileError)
      // Don't throw here, subscription was created
    } else {
      console.log('[Webhook] Profile updated successfully for user:', userId)
    }

    // Send activation email if this is a new/activated subscription
    if (sendEmail && subscriptionData.status === 'active') {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('email, full_name')
        .eq('id', userId)
        .single()

      if (profile?.email) {
        sendSubscriptionActivatedEmail(
          profile.email,
          profile.full_name || '',
          plan
        ).catch((err) => console.error('Failed to send activation email:', err))
      }
    }
  } else {
    // Update by customer_id if no user_id in metadata
    console.log('[Webhook] No userId in metadata, trying customer_id lookup:', customerId)

    const { data: existingSub, error: lookupError } = await supabaseAdmin
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_customer_id', customerId)
      .maybeSingle()

    if (lookupError) {
      console.error('[Webhook] Failed to lookup subscription by customer_id:', lookupError)
    }

    if (existingSub?.user_id) {
      // Found existing subscription, update it
      const { error: updateError } = await supabaseAdmin
        .from('subscriptions')
        .update(subscriptionData)
        .eq('stripe_customer_id', customerId)

      if (updateError) {
        console.error('[Webhook] Failed to update subscription by customer_id:', updateError)
        throw new Error(`Failed to update subscription: ${updateError.message}`)
      }
      console.log('[Webhook] Subscription updated by customer_id for user:', existingSub.user_id)
    } else {
      console.error('[Webhook] No existing subscription found for customer_id:', customerId)
      // Cannot create subscription without user_id
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleSubscriptionDeleted(subscription: any) {
  const userId = subscription.metadata?.supabase_user_id
  const customerId = subscription.customer as string

  console.log('[Webhook] handleSubscriptionDeleted:', { userId, customerId, subscriptionId: subscription.id })

  const updateData = {
    status: 'canceled',
    cancel_at_period_end: false,
  }

  if (userId) {
    const { error: subError } = await supabaseAdmin
      .from('subscriptions')
      .update(updateData)
      .eq('user_id', userId)

    if (subError) {
      console.error('[Webhook] Failed to update subscription on delete:', subError)
    }

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ subscription_status: 'canceled' })
      .eq('id', userId)

    if (profileError) {
      console.error('[Webhook] Failed to update profile on delete:', profileError)
    }

    // Send cancellation email
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .single()

    if (profile?.email) {
      const endDate = subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : ''
      sendSubscriptionCanceledEmail(
        profile.email,
        profile.full_name || '',
        endDate
      ).catch((err) => console.error('Failed to send cancellation email:', err))
    }
  } else {
    const { error } = await supabaseAdmin
      .from('subscriptions')
      .update(updateData)
      .eq('stripe_customer_id', customerId)

    if (error) {
      console.error('[Webhook] Failed to update subscription by customer_id on delete:', error)
    }
  }
}
