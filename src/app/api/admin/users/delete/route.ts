import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Helper to create admin client (bypasses RLS)
function getSupabaseAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if current user is authenticated and is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if ((adminProfile as { role?: string } | null)?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const { userId, cancelStripe } = body as { userId: string; cancelStripe?: boolean }

    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário é obrigatório' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Check if user exists and get their info
    const { data: targetUser, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, is_master_admin')
      .eq('id', userId)
      .single()

    if (userError || !targetUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Block deletion of master admin
    if (targetUser.is_master_admin) {
      return NextResponse.json({ error: 'Não é possível excluir o administrador principal' }, { status: 403 })
    }

    // Check for active Stripe subscription
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_subscription_id, status')
      .eq('user_id', userId)
      .maybeSingle()

    if (subscription?.status === 'active' && subscription?.stripe_subscription_id) {
      if (!cancelStripe) {
        // Return warning that user has active subscription
        return NextResponse.json({
          warning: true,
          message: 'Este usuário tem uma assinatura ativa no Stripe. Deseja cancelar a assinatura e excluir?',
          hasActiveSubscription: true
        }, { status: 200 })
      }

      // Cancel Stripe subscription
      try {
        await stripe.subscriptions.cancel(subscription.stripe_subscription_id)
        console.log('[Delete User] Cancelled Stripe subscription:', subscription.stripe_subscription_id)
      } catch (stripeError) {
        console.error('[Delete User] Failed to cancel Stripe subscription:', stripeError)
        // Continue with deletion anyway - subscription might already be cancelled
      }
    }

    // Delete user from auth (CASCADE will clean up everything)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (deleteError) {
      console.error('[Delete User] Error:', deleteError)
      return NextResponse.json({ error: 'Erro ao excluir usuário: ' + deleteError.message }, { status: 500 })
    }

    console.log('[Delete User] Successfully deleted user:', targetUser.email)

    return NextResponse.json({
      success: true,
      message: 'Usuário excluído com sucesso'
    })
  } catch (error) {
    console.error('[Delete User] API error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
