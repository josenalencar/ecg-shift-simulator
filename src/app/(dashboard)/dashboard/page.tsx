import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'
import { Activity, Target, TrendingUp, Clock, Crown, CreditCard } from 'lucide-react'
import { ManageSubscriptionButton } from './manage-subscription-button'

export const dynamic = 'force-dynamic'

const FREE_MONTHLY_LIMIT = 5

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profileData } = await supabase
    .from('profiles')
    .select('id, full_name, role, subscription_status')
    .eq('id', user.id)
    .single()

  const profile = profileData as { id: string; full_name: string | null; role: string; subscription_status?: string } | null

  // Get subscription info
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: subscriptionData } = await (supabase as any)
    .from('subscriptions')
    .select('status, current_period_end, cancel_at_period_end')
    .eq('user_id', user.id)
    .single()

  const subscription = subscriptionData as {
    status?: string
    current_period_end?: string
    cancel_at_period_end?: boolean
  } | null

  const isSubscribed = subscription?.status === 'active'

  // Get user stats
  const { data: attempts } = await supabase
    .from('attempts')
    .select('id, score, created_at, ecgs(title)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const typedAttempts = attempts as { id: string; score: number; created_at: string; ecgs: { title: string } | null }[] | null
  const totalAttempts = typedAttempts?.length || 0
  const averageScore = totalAttempts > 0
    ? Math.round((typedAttempts?.reduce((sum, a) => sum + Number(a.score), 0) || 0) / totalAttempts)
    : 0

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
  const remainingFree = FREE_MONTHLY_LIMIT - monthlyAttempts

  // Get count of ECGs available
  const { count: ecgCount } = await supabase
    .from('ecgs')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bem-vindo(a), {profile?.full_name || 'Doutor(a)'}!
          </h1>
          <p className="text-gray-600 mt-1">
            Continue sua pratica de interpretacao de ECG
          </p>
        </div>
        {isSubscribed && (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700 flex items-center gap-1">
            <Crown className="h-4 w-4" />
            Premium
          </span>
        )}
      </div>

      {/* Subscription Card for Free Users */}
      {!isSubscribed && (
        <Card className="mb-8 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Crown className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Atualize para Premium</h3>
                  <p className="text-sm text-gray-600">
                    {remainingFree > 0
                      ? `Voce tem ${remainingFree} caso${remainingFree !== 1 ? 's' : ''} gratuito${remainingFree !== 1 ? 's' : ''} restante${remainingFree !== 1 ? 's' : ''} este mes`
                      : 'Voce atingiu o limite mensal de casos gratuitos'
                    }
                  </p>
                </div>
              </div>
              <Link href="/pricing">
                <Button>
                  Assinar por R$29,90/mes
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription Management for Premium Users */}
      {isSubscribed && subscription && (
        <Card className="mb-8 border-purple-200 bg-purple-50">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <CreditCard className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Assinatura Premium</h3>
                  <p className="text-sm text-gray-600">
                    {subscription.cancel_at_period_end
                      ? `Cancela em ${new Date(subscription.current_period_end!).toLocaleDateString('pt-BR')}`
                      : `Renova em ${new Date(subscription.current_period_end!).toLocaleDateString('pt-BR')}`
                    }
                  </p>
                </div>
              </div>
              <ManageSubscriptionButton />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">ECGs Interpretados</p>
                <p className="text-2xl font-bold text-gray-900">{totalAttempts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Media de Acertos</p>
                <p className="text-2xl font-bold text-gray-900">{averageScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">ECGs Disponiveis</p>
                <p className="text-2xl font-bold text-gray-900">{ecgCount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  {isSubscribed ? 'Restantes' : 'Este Mes'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {isSubscribed
                    ? (ecgCount || 0) - totalAttempts
                    : `${monthlyAttempts}/${FREE_MONTHLY_LIMIT}`
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Iniciar Pratica</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Entre em uma sessao de pratica e interprete ECGs como em um plantao real de tele-ECG.
              Receba feedback imediato e aprenda com seus erros.
            </p>
            <Link href="/practice">
              <Button size="lg" disabled={!isSubscribed && remainingFree <= 0}>
                {!isSubscribed && remainingFree <= 0
                  ? 'Limite Atingido'
                  : 'Iniciar Sessao de Pratica'
                }
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Seu Progresso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Conclusao</span>
                <span className="font-medium">
                  {ecgCount ? Math.round((totalAttempts / ecgCount) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${ecgCount ? (totalAttempts / ecgCount) * 100 : 0}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">
                {totalAttempts} de {ecgCount || 0} ECGs completados
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          {typedAttempts && typedAttempts.length > 0 ? (
            <div className="divide-y">
              {typedAttempts.slice(0, 5).map((attempt) => (
                <div key={attempt.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      ECG #{attempt.ecgs?.title || 'Caso'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(attempt.created_at).toLocaleDateString('pt-BR', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className={`
                    px-3 py-1 rounded-full text-sm font-medium
                    ${Number(attempt.score) >= 80
                      ? 'bg-green-100 text-green-700'
                      : Number(attempt.score) >= 60
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }
                  `}>
                    {Math.round(Number(attempt.score))}%
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Nenhuma sessao de pratica ainda</p>
              <Link href="/practice">
                <Button variant="outline">Comece sua primeira sessao</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
