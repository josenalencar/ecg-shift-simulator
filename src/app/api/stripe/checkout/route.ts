import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/server'

// Monthly prices
const PRICE_ID_PREMIUM_MONTHLY = process.env.STRIPE_PRICE_ID!
const PRICE_ID_AI_MONTHLY = process.env.STRIPE_PRICE_ID_AI!

// Yearly prices (20% discount)
const PRICE_ID_PREMIUM_YEARLY = process.env.STRIPE_PRICE_ID_PREMIUM_YEARLY!
const PRICE_ID_AI_YEARLY = process.env.STRIPE_PRICE_ID_AI_YEARLY!

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get plan and billing cycle from request body
    const body = await request.json().catch(() => ({}))
    const plan = body.plan || 'premium'
    const billingCycle = body.billingCycle || 'monthly'

    // Select the correct price ID based on plan and billing cycle
    let priceId: string
    if (plan === 'ai') {
      priceId = billingCycle === 'yearly' ? PRICE_ID_AI_YEARLY : PRICE_ID_AI_MONTHLY
    } else {
      priceId = billingCycle === 'yearly' ? PRICE_ID_PREMIUM_YEARLY : PRICE_ID_PREMIUM_MONTHLY
    }

    // Check if user already has a Stripe customer ID
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: subscription } = await (supabase as any)
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle()

    let customerId = (subscription as { stripe_customer_id?: string } | null)?.stripe_customer_id

    // Create customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      })
      customerId = customer.id

      // Save customer ID
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('subscriptions').upsert({
        user_id: user.id,
        stripe_customer_id: customerId,
        status: 'inactive',
      })
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/pricing?canceled=true`,
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          plan: plan,
          billing_cycle: billingCycle,
        },
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
