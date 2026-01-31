import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'
import { Crown, Check, Calendar, CreditCard, AlertTriangle, Sparkles, GraduationCap, Gift } from 'lucide-react'
import { CancelSubscriptionButton } from '../plano/cancel-subscription-button'
import { ManageSubscriptionButton } from '../plano/manage-subscription-button'
import { UpgradeButton } from '../plano/upgrade-button'
import { ProfileForm } from './profile-form'
import { PasswordForm } from './password-form'
import { HospitalSelector } from './hospital-selector'
import type { GrantedPlan, HospitalType } from '@/types/database'

export const dynamic = 'force-dynamic'

const FREE_MONTHLY_LIMIT = 5

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Load profile data including avatar
  const { data: profileData } = await supabase
    .from('profiles')
    .select('full_name, bio, avatar, hospital_type, granted_plan')
    .eq('id', user.id)
    .single()

  const profile = profileData as {
    full_name: string | null
    bio: string | null
    avatar: string | null
    hospital_type: HospitalType | null
    granted_plan: GrantedPlan | null
  } | null

  const grantedPlan = profile?.granted_plan

  // Get subscription info
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: subscriptionData } = await (supabase as any)
    .from('subscriptions')
    .select('status, current_period_end, current_period_start, cancel_at_period_end, stripe_subscription_id, plan')
    .eq('user_id', user.id)
    .maybeSingle()

  const subscription = subscriptionData as {
    status?: string
    current_period_end?: string
    current_period_start?: string
    cancel_at_period_end?: boolean
    stripe_subscription_id?: string
    plan?: string
  } | null

  // Granted plan takes priority
  const isGranted = !!grantedPlan
  const isSubscribed = isGranted || subscription?.status === 'active'
  const isCanceling = !isGranted && subscription?.cancel_at_period_end
  const isAIPlan = grantedPlan === 'ai' || grantedPlan === 'aluno_ecg' || subscription?.plan === 'ai'
  const isAlunoEcg = grantedPlan === 'aluno_ecg'

  // Get monthly attempt count for free users
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
        <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
        <p className="text-gray-600 mt-1">
          Gerencie suas informações pessoais, assinatura e preferências
        </p>
      </div>

      {/* Section 1: Profile Form with Avatar */}
      <ProfileForm
        initialFullName={profile?.full_name || null}
        initialBio={profile?.bio || null}
        initialAvatar={profile?.avatar || null}
      />

      {/* Section 2: Subscription/Plan Info */}
      <Card className={`mb-8 ${isSubscribed ? (isAlunoEcg ? 'border-green-300 bg-gradient-to-r from-green-50 to-blue-50' : isAIPlan ? 'border-purple-300 bg-gradient-to-r from-purple-50 to-blue-50' : 'border-blue-200 bg-blue-50') : 'border-gray-200'}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {isSubscribed ? (
                isAlunoEcg ? (
                  <>
                    <GraduationCap className="h-5 w-5 text-green-600" />
                    Aluno ECG com José Alencar
                  </>
                ) : isAIPlan ? (
                  <>
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    Plano Premium +AI
                  </>
                ) : (
                  <>
                    <Crown className="h-5 w-5 text-blue-600" />
                    Plano Premium
                  </>
                )
              ) : (
                <>
                  <CreditCard className="h-5 w-5 text-gray-600" />
                  Plano Gratuito
                </>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              {isGranted && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700 flex items-center gap-1">
                  <Gift className="h-3 w-3" />
                  Cortesia
                </span>
              )}
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
          </div>
        </CardHeader>
        <CardContent>
          {isSubscribed ? (
            <div className="space-y-4">
              {isGranted ? (
                <>
                  <div className="flex items-center justify-between py-2 border-b border-gray-300">
                    <span className="text-gray-700 font-medium">Valor</span>
                    <span className="font-semibold text-green-700">Cortesia</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-300">
                    <span className="text-gray-700 font-medium">Casos de ECG</span>
                    <span className="font-semibold text-gray-900">Ilimitados</span>
                  </div>
                  {isAIPlan && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-300">
                      <span className="text-gray-700 font-medium">Feedback ECG-IA</span>
                      <span className="font-semibold text-purple-700">Ilimitado</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between py-2 border-b border-gray-300">
                    <span className="text-gray-700 font-medium">Validade</span>
                    <span className="font-semibold text-gray-900">Sem expiração</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between py-2 border-b border-gray-300">
                    <span className="text-gray-700 font-medium">Valor</span>
                    <span className="font-semibold text-gray-900">{isAIPlan ? 'R$ 69,90/mês' : 'R$ 39,90/mês'}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-300">
                    <span className="text-gray-700 font-medium">Casos de ECG</span>
                    <span className="font-semibold text-gray-900">Ilimitados</span>
                  </div>
                  {isAIPlan && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-300">
                      <span className="text-gray-700 font-medium">Feedback ECG-IA</span>
                      <span className="font-semibold text-purple-700">Ilimitado</span>
                    </div>
                  )}
                  {subscription?.current_period_start && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-300">
                      <span className="text-gray-700 font-medium">Início do período</span>
                      <span className="font-semibold text-gray-900">
                        {new Date(subscription.current_period_start).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}
                  {subscription?.current_period_end && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-300">
                      <span className="text-gray-700 font-medium flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {isCanceling ? 'Acesso até' : 'Próxima cobrança'}
                      </span>
                      <span className="font-semibold text-gray-900">
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
                            Sua assinatura será cancelada em {new Date(subscription.current_period_end!).toLocaleDateString('pt-BR')}.
                            Você ainda tem acesso a todos os recursos até essa data.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <span className="text-gray-700 font-medium">Valor</span>
                <span className="font-semibold text-gray-900">Grátis</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <span className="text-gray-700 font-medium">Casos de ECG</span>
                <span className="font-semibold text-gray-900">{FREE_MONTHLY_LIMIT} por mês</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <span className="text-gray-700 font-medium">Usados este mês</span>
                <span className="font-semibold text-gray-900">{monthlyAttempts} de {FREE_MONTHLY_LIMIT}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscription Actions */}
      {isSubscribed && !isGranted ? (
        <div className="space-y-4 mb-8">
          {/* Upgrade to AI for Premium users */}
          {!isAIPlan && !isCanceling && (
            <Card className="border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  Upgrade para Premium +AI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Desbloqueie o poder da ECG-IA, nossa inteligência artificial especializada em eletrocardiograma.
                </p>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-purple-600" />
                    <span className="text-purple-700">Feedback ilimitado da ECG-IA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-purple-600" />
                    <span className="text-purple-700">Explicações detalhadas por IA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-purple-600" />
                    <span className="text-purple-700">Análise comparativa avançada</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-white rounded-lg mb-4">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">+R$ 30,00</p>
                    <p className="text-sm text-gray-500">R$ 69,90/mês no total (proporcional)</p>
                  </div>
                  <UpgradeButton />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Manage Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Gerenciar Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Atualize seu cartão de crédito ou veja seu histórico de faturas.
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
                  Ao cancelar, você manterá acesso ao {isAIPlan ? 'Premium +AI' : 'Premium'} até o fim do período atual.
                  Não haverá cobranças adicionais.
                </p>
                <CancelSubscriptionButton />
              </CardContent>
            </Card>
          )}
        </div>
      ) : !isSubscribed ? (
        /* Upgrade Section for free users */
        <div className="space-y-4 mb-8">
          {/* Premium Plan */}
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-blue-600" />
                Plano Premium
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Casos ilimitados por mês</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Feedback completo e detalhado</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Casos avançados e raros</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                <div>
                  <p className="text-2xl font-bold text-gray-900">R$ 39,90</p>
                  <p className="text-sm text-gray-500">por mês</p>
                </div>
                <Link href="/pricing">
                  <Button size="lg">
                    <Crown className="h-4 w-4 mr-2" />
                    Assinar Premium
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Premium +AI Plan */}
          <Card className="border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Plano Premium +AI
                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                  Recomendado
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Tudo do Premium</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-purple-600" />
                  <span className="font-medium text-purple-700">Feedback ilimitado da ECG-IA</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-purple-600" />
                  <span className="text-purple-700">IA especializada em ECG</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                <div>
                  <p className="text-2xl font-bold text-gray-900">R$ 69,90</p>
                  <p className="text-sm text-gray-500">por mês</p>
                </div>
                <Link href="/pricing">
                  <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Assinar Premium +AI
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <p className="text-xs text-gray-500 text-center">
            Pagamento seguro via Stripe. Cancele a qualquer momento sem burocracia.
          </p>
        </div>
      ) : null}

      {/* Section 3: Hospital Preferences */}
      <HospitalSelector
        initialHospitalType={profile?.hospital_type || null}
        isPremium={isSubscribed}
      />

      {/* Section 4: Password */}
      <PasswordForm />
    </div>
  )
}
