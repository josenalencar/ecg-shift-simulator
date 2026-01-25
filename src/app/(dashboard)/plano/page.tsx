import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'
import { Crown, Check, Calendar, CreditCard, AlertTriangle } from 'lucide-react'
import { CancelSubscriptionButton } from './cancel-subscription-button'
import { ManageSubscriptionButton } from './manage-subscription-button'

export const dynamic = 'force-dynamic'

const FREE_MONTHLY_LIMIT = 5

export default async function PlanoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get subscription info
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: subscriptionData } = await (supabase as any)
    .from('subscriptions')
    .select('status, current_period_end, current_period_start, cancel_at_period_end, stripe_subscription_id')
    .eq('user_id', user.id)
    .single()

  const subscription = subscriptionData as {
    status?: string
    current_period_end?: string
    current_period_start?: string
    cancel_at_period_end?: boolean
    stripe_subscription_id?: string
  } | null

  const isSubscribed = subscription?.status === 'active'
  const isCanceling = subscription?.cancel_at_period_end

  // Get monthly attempt count
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count: monthlyCount } = await supabase
    .from('attempts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', startOfMonth.toISOString())

  const monthlyAttempts = monthlyCount || 0

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Meu Plano</h1>
        <p className="text-gray-600 mt-1">
          Gerencie sua assinatura e informacoes de pagamento
        </p>
      </div>

      {/* Current Plan Card */}
      <Card className={`mb-6 ${isSubscribed ? 'border-purple-200 bg-purple-50' : 'border-gray-200'}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {isSubscribed ? (
                <>
                  <Crown className="h-5 w-5 text-purple-600" />
                  Plano Premium
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5 text-gray-600" />
                  Plano Gratuito
                </>
              )}
            </CardTitle>
            {isSubscribed && !isCanceling && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                Ativo
              </span>
            )}
            {isCanceling && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-700">
                Cancelamento Agendado
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isSubscribed ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-gray-600">Valor</span>
                <span className="font-medium">R$ 29,90/mes</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-gray-600">Casos de ECG</span>
                <span className="font-medium">Ilimitados</span>
              </div>
              {subscription?.current_period_start && (
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-600">Inicio do periodo</span>
                  <span className="font-medium">
                    {new Date(subscription.current_period_start).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
              {subscription?.current_period_end && (
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-600 flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {isCanceling ? 'Acesso ate' : 'Proxima cobranca'}
                  </span>
                  <span className="font-medium">
                    {new Date(subscription.current_period_end).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}

              {isCanceling && (
                <div className="mt-4 p-4 bg-orange-100 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-orange-800">Cancelamento agendado</p>
                      <p className="text-sm text-orange-700">
                        Sua assinatura sera cancelada em {new Date(subscription.current_period_end!).toLocaleDateString('pt-BR')}.
                        Voce ainda tem acesso a todos os recursos ate essa data.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-gray-600">Valor</span>
                <span className="font-medium">Gratis</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-gray-600">Casos de ECG</span>
                <span className="font-medium">{FREE_MONTHLY_LIMIT} por mes</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-gray-600">Usados este mes</span>
                <span className="font-medium">{monthlyAttempts} de {FREE_MONTHLY_LIMIT}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      {isSubscribed ? (
        <div className="space-y-4">
          {/* Manage Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Atualize seu cartao de credito ou veja seu historico de faturas.
              </p>
              <ManageSubscriptionButton />
            </CardContent>
          </Card>

          {/* Cancel Subscription */}
          {!isCanceling && (
            <Card className="border-red-100">
              <CardHeader>
                <CardTitle className="text-lg text-red-700">Cancelar Assinatura</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Ao cancelar, voce mantera acesso ao Premium ate o fim do periodo atual.
                  Nao havera cobrancas adicionais.
                </p>
                <CancelSubscriptionButton />
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        /* Upgrade Section */
        <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-purple-600" />
              Atualize para Premium
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6">
              Desbloqueie todo o potencial do ECG Shift com acesso ilimitado.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Casos ilimitados por mes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Feedback completo e detalhado</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Casos avancados e raros</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Explicacoes detalhadas</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Suporte prioritario</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Cancele quando quiser</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white rounded-lg mb-6">
              <div>
                <p className="text-2xl font-bold text-gray-900">R$ 29,90</p>
                <p className="text-sm text-gray-500">por mes</p>
              </div>
              <Link href="/pricing">
                <Button size="lg">
                  <Crown className="h-4 w-4 mr-2" />
                  Assinar Agora
                </Button>
              </Link>
            </div>

            <p className="text-xs text-gray-500 text-center">
              Pagamento seguro via Stripe. Cancele a qualquer momento sem burocracia.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
