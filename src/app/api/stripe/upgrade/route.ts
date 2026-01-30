import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { createClient } from '@/lib/supabase/server'

const AI_MONTHLY_PRICE_ID = process.env.STRIPE_PRICE_ID_AI || 'price_1Stx5TKbLDQdn5laEcLFG0ac'
const AI_YEARLY_PRICE_ID = process.env.STRIPE_PRICE_ID_AI_YEARLY || 'price_1Stx5XKbLDQdn5layyrDmqTr'

/**
 * POST /api/stripe/upgrade
 *
 * Upgrades an existing Premium subscription to Premium+AI
 * Uses Stripe's subscription update with proration for fair billing
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { billingCycle = 'monthly' } = body

    // Get user's current subscription
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: subscription, error: subError } = await (supabase as any)
      .from('subscriptions')
      .select('stripe_subscription_id, stripe_customer_id, plan, status')
      .eq('user_id', user.id)
      .single()

    if (subError || !subscription) {
      return NextResponse.json(
        { error: 'Assinatura nao encontrada. Assine um plano primeiro.' },
        { status: 404 }
      )
    }

    if (subscription.status !== 'active') {
      return NextResponse.json(
        { error: 'Sua assinatura nao esta ativa. Reative primeiro.' },
        { status: 400 }
      )
    }

    if (subscription.plan === 'ai') {
      return NextResponse.json(
        { error: 'Voce ja possui o plano Premium +AI' },
        { status: 400 }
      )
    }

    if (!subscription.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'ID de assinatura Stripe nao encontrado' },
        { status: 400 }
      )
    }

    // Retrieve the current Stripe subscription
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripe_subscription_id
    )

    if (!stripeSubscription || stripeSubscription.status !== 'active') {
      return NextResponse.json(
        { error: 'Assinatura Stripe nao esta ativa' },
        { status: 400 }
      )
    }

    // Determine the new price based on billing cycle
    // Keep the same billing cycle (monthly → monthly AI, yearly → yearly AI)
    const currentPriceId = stripeSubscription.items.data[0]?.price?.id
    const isYearly = currentPriceId?.includes('yearly') ||
                     currentPriceId === process.env.STRIPE_PRICE_ID_PREMIUM_YEARLY
    const newPriceId = billingCycle === 'yearly' || isYearly
      ? AI_YEARLY_PRICE_ID
      : AI_MONTHLY_PRICE_ID

    // Update the subscription with proration
    // Stripe will automatically calculate the prorated amount
    const updatedSubscription = await stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      {
        items: [
          {
            id: stripeSubscription.items.data[0].id,
            price: newPriceId,
          },
        ],
        // Proration: charge the difference immediately
        proration_behavior: 'always_invoice',
        // Update metadata with new plan
        metadata: {
          ...stripeSubscription.metadata,
          plan: 'ai',
          upgraded_at: new Date().toISOString(),
        },
      }
    )

    // The webhook will handle updating the database when Stripe fires the event
    // But let's also update immediately for better UX
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('subscriptions')
      .update({
        plan: 'ai',
        price_id: newPriceId,
      })
      .eq('user_id', user.id)

    console.log('[Upgrade] Subscription upgraded:', {
      userId: user.id,
      oldPriceId: currentPriceId,
      newPriceId,
      subscriptionId: updatedSubscription.id,
    })

    return NextResponse.json({
      success: true,
      message: 'Upgrade realizado com sucesso! Voce agora tem Premium +AI.',
      subscription: {
        id: updatedSubscription.id,
        status: updatedSubscription.status,
        plan: 'ai',
      },
    })
  } catch (error) {
    console.error('[Upgrade] Error:', error)

    // Handle Stripe-specific errors
    if (error instanceof Error) {
      if (error.message.includes('No such subscription')) {
        return NextResponse.json(
          { error: 'Assinatura nao encontrada no Stripe' },
          { status: 404 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Erro ao processar upgrade. Tente novamente.' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/stripe/upgrade
 *
 * Preview the upgrade cost (prorated amount)
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    // Get user's current subscription
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: subscription } = await (supabase as any)
      .from('subscriptions')
      .select('stripe_subscription_id, plan, status')
      .eq('user_id', user.id)
      .single()

    if (!subscription?.stripe_subscription_id || subscription.status !== 'active') {
      return NextResponse.json({
        canUpgrade: false,
        reason: 'no_active_subscription',
      })
    }

    if (subscription.plan === 'ai') {
      return NextResponse.json({
        canUpgrade: false,
        reason: 'already_ai',
      })
    }

    // Get preview of upgrade cost from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripe_subscription_id
    )

    const currentPriceId = stripeSubscription.items.data[0]?.price?.id
    const isYearly = currentPriceId?.includes('yearly') ||
                     currentPriceId === process.env.STRIPE_PRICE_ID_PREMIUM_YEARLY
    const newPriceId = isYearly ? AI_YEARLY_PRICE_ID : AI_MONTHLY_PRICE_ID

    // Calculate prorated amount manually
    // Premium: R$ 39.90/month, AI: R$ 69.90/month, Difference: R$ 30.00/month
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sub = stripeSubscription as any
    const currentPeriodEnd = sub.current_period_end as number
    const currentPeriodStart = sub.current_period_start as number
    const now = Math.floor(Date.now() / 1000)

    // Calculate remaining days in the billing period
    const totalDays = (currentPeriodEnd - currentPeriodStart) / (60 * 60 * 24)
    const remainingDays = Math.max(0, (currentPeriodEnd - now) / (60 * 60 * 24))
    const remainingRatio = remainingDays / totalDays

    // Monthly price difference: R$ 30.00 (6990 - 3990 cents)
    const monthlyDifference = isYearly ? 360 : 30 // R$ 30/month or R$ 360/year
    const proratedAmount = Math.round(monthlyDifference * remainingRatio * 100) / 100

    return NextResponse.json({
      canUpgrade: true,
      currentPlan: subscription.plan,
      targetPlan: 'ai',
      billingCycle: isYearly ? 'yearly' : 'monthly',
      proratedAmount,
      currency: 'BRL',
      message: `Valor proporcional para upgrade: R$ ${proratedAmount.toFixed(2)}`,
    })
  } catch (error) {
    console.error('[Upgrade Preview] Error:', error)
    return NextResponse.json(
      { error: 'Erro ao calcular upgrade' },
      { status: 500 }
    )
  }
}
