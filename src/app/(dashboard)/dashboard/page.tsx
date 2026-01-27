import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'
import { Activity, Target, TrendingUp, Clock, Crown, CreditCard, Trophy, TrendingDown, Building2, Stethoscope, Heart, AlertTriangle, Play, Baby, HeartPulse } from 'lucide-react'
import { ManageSubscriptionButton } from './manage-subscription-button'
import { PaymentSuccessHandler } from './payment-success-handler'
import { FINDINGS, RHYTHMS, HOSPITAL_TYPES } from '@/lib/ecg-constants'
import { DashboardWidget, LeaderboardXP } from '@/components/gamification'

export const dynamic = 'force-dynamic'

const FREE_MONTHLY_LIMIT = 5

// Hospital stories to engage users (environment-focused, not patient-specific)
const HOSPITAL_STORIES: Record<string, { icon: typeof Building2; title: string; story: string; color: string; bgColor: string }> = {
  pronto_socorro: {
    icon: AlertTriangle,
    title: 'Pronto Socorro',
    story: 'Luzes piscando, macas passando, monitores apitando. No pronto socorro, cada ECG pode ser a diferença entre a vida e a morte. Aqui você enfrenta os casos mais urgentes: infartos, arritmias instáveis, emergências que não podem esperar. Adrenalina pura.',
    color: 'text-red-600',
    bgColor: 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200',
  },
  hospital_geral: {
    icon: Building2,
    title: 'Hospital Geral',
    story: 'Enfermarias lotadas, pré-operatórios, check-ups de rotina. No hospital geral, a variedade é a regra. De ECGs normais a achados inesperados em pacientes assintomáticos. Cada caso exige atenção - nem sempre o simples é o que parece.',
    color: 'text-blue-600',
    bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200',
  },
  hospital_cardiologico: {
    icon: Heart,
    title: 'Hospital Cardiológico',
    story: 'Centro de referência. Aqui chegam os casos que ninguém mais conseguiu diagnosticar. Padrões raros, arritmias complexas, sutilezas que passam despercebidas. É o lugar para quem quer se tornar um verdadeiro especialista em ECG.',
    color: 'text-purple-600',
    bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200',
  },
  pediatria_geral: {
    icon: Baby,
    title: 'Hospital Pediátrico Geral',
    story: 'Corredores coloridos, mas a responsabilidade é a mesma. ECGs pediátricos têm suas próprias regras: frequências mais altas, eixos diferentes, variantes normais da idade. Aprenda a distinguir o fisiológico do patológico nos pequenos pacientes.',
    color: 'text-green-600',
    bgColor: 'bg-gradient-to-br from-green-50 to-teal-50 border-green-200',
  },
  pediatria_cardiologica: {
    icon: HeartPulse,
    title: 'Hospital Pediátrico Cardiológico',
    story: 'Cardiopatias congênitas, arritmias na infância, pós-operatórios de cirurgias complexas. A cardiologia pediátrica é um mundo à parte, com desafios únicos. Aqui você treina seu olhar para os casos mais raros e desafiadores da pediatria.',
    color: 'text-pink-600',
    bgColor: 'bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200',
  },
}

const DEFAULT_HOSPITAL_STORY = {
  icon: Stethoscope,
  title: 'Plantão de ECG',
  story: 'Os pacientes aguardam sua avaliação. Cada ECG traz uma história, um diagnóstico a ser descoberto. Treine seu olhar clínico e aprimore sua habilidade de interpretação. Seu plantão começa agora.',
  color: 'text-gray-600',
  bgColor: 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile including hospital type
  const { data: profileData } = await supabase
    .from('profiles')
    .select('id, full_name, role, subscription_status, hospital_type')
    .eq('id', user.id)
    .single()

  const profile = profileData as { id: string; full_name: string | null; role: string; subscription_status?: string; hospital_type?: string | null } | null

  // Get subscription info
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: subscriptionData } = await (supabase as any)
    .from('subscriptions')
    .select('status, current_period_end, cancel_at_period_end')
    .eq('user_id', user.id)
    .maybeSingle()

  const subscription = subscriptionData as {
    status?: string
    current_period_end?: string
    cancel_at_period_end?: boolean
  } | null

  const isSubscribed = subscription?.status === 'active'

  // Get user stats
  const { data: attempts } = await supabase
    .from('attempts')
    .select('id, score, created_at, findings, rhythm, ecgs(title)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  type UserAttempt = {
    id: string
    score: number
    created_at: string
    findings: string[]
    rhythm: string[]
    ecgs: { title: string } | null
  }
  const typedAttempts = attempts as UserAttempt[] | null
  const totalAttempts = typedAttempts?.length || 0
  const averageScore = totalAttempts > 0
    ? Math.round((typedAttempts?.reduce((sum, a) => sum + Number(a.score), 0) || 0) / totalAttempts)
    : 0

  // Calculate performance by diagnosis type
  const diagnosisPerformance = new Map<string, { correct: number; total: number; label: string }>()

  typedAttempts?.forEach(attempt => {
    // Track rhythm performance
    attempt.rhythm?.forEach(r => {
      const rhythmInfo = RHYTHMS.find(rhythm => rhythm.value === r)
      if (rhythmInfo) {
        const key = `rhythm_${r}`
        if (!diagnosisPerformance.has(key)) {
          diagnosisPerformance.set(key, { correct: 0, total: 0, label: rhythmInfo.label })
        }
        const stat = diagnosisPerformance.get(key)!
        stat.total++
        if (Number(attempt.score) >= 80) stat.correct++
      }
    })

    // Track findings performance
    attempt.findings?.forEach(f => {
      const findingInfo = FINDINGS.find(finding => finding.value === f)
      if (findingInfo) {
        const key = `finding_${f}`
        if (!diagnosisPerformance.has(key)) {
          diagnosisPerformance.set(key, { correct: 0, total: 0, label: findingInfo.label })
        }
        const stat = diagnosisPerformance.get(key)!
        stat.total++
        if (Number(attempt.score) >= 80) stat.correct++
      }
    })
  })

  // Convert to array and calculate percentages
  const diagnosisStats = Array.from(diagnosisPerformance.entries())
    .filter(([, stat]) => stat.total >= 2) // Only show if at least 2 attempts
    .map(([key, stat]) => ({
      key,
      label: stat.label,
      percentage: Math.round((stat.correct / stat.total) * 100),
      total: stat.total
    }))
    .sort((a, b) => b.percentage - a.percentage)

  const bestDiagnoses = diagnosisStats.slice(0, 10)
  const worstDiagnoses = [...diagnosisStats].sort((a, b) => a.percentage - b.percentage).slice(0, 10)

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Payment Success Handler - polls for subscription after Stripe redirect */}
      <PaymentSuccessHandler />

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bem-vindo(a), {profile?.full_name || 'Doutor(a)'}!
          </h1>
          <p className="text-gray-700 mt-1">
            Continue sua prática de interpretação de ECG
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
                  <p className="text-sm text-gray-700">
                    {remainingFree > 0
                      ? `Você tem ${remainingFree} caso${remainingFree !== 1 ? 's' : ''} gratuito${remainingFree !== 1 ? 's' : ''} restante${remainingFree !== 1 ? 's' : ''} este mês`
                      : 'Você atingiu o limite mensal de casos gratuitos'
                    }
                  </p>
                </div>
              </div>
              <Link href="/pricing">
                <Button>
                  Assinar por R$39,90/mês
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
                  <p className="text-sm text-gray-700">
                    {subscription.current_period_end && new Date(subscription.current_period_end).getFullYear() > 2000
                      ? subscription.cancel_at_period_end
                        ? `Cancela em ${new Date(subscription.current_period_end).toLocaleDateString('pt-BR')}`
                        : `Renova em ${new Date(subscription.current_period_end).toLocaleDateString('pt-BR')}`
                      : 'Assinatura ativa'
                    }
                  </p>
                </div>
              </div>
              <ManageSubscriptionButton />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gamification Widget */}
      <div className="mb-8">
        <DashboardWidget userId={user.id} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-700">ECGs Interpretados</p>
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
                <p className="text-sm text-gray-700">Média de Acertos</p>
                <p className="text-2xl font-bold text-gray-900">{averageScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {!isSubscribed && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-700">Este Mês</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {monthlyAttempts}/{FREE_MONTHLY_LIMIT}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isSubscribed && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Trophy className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-700">ECGs Este Mês</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {monthlyAttempts}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Start Practice - Full Width with Hospital Story */}
      {(() => {
        const hospitalType = profile?.hospital_type as string | undefined
        const hospitalStory = hospitalType && HOSPITAL_STORIES[hospitalType]
          ? HOSPITAL_STORIES[hospitalType]
          : DEFAULT_HOSPITAL_STORY
        const HospitalIcon = hospitalStory.icon

        return (
          <Card className={`mb-6 border-2 ${hospitalStory.bgColor}`}>
            <CardContent className="py-8">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                <div className="flex-shrink-0">
                  <div className={`p-4 rounded-2xl bg-white/80 shadow-sm`}>
                    <HospitalIcon className={`h-12 w-12 ${hospitalStory.color}`} />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className={`text-xl font-bold ${hospitalStory.color}`}>
                      Iniciar Plantão
                    </h3>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/80 text-gray-700">
                      {hospitalStory.title}
                    </span>
                  </div>
                  <p className="text-gray-700 leading-relaxed italic text-lg mb-4">
                    &ldquo;{hospitalStory.story}&rdquo;
                  </p>
                  {!profile?.hospital_type && (
                    <p className="text-sm text-gray-600 mb-4">
                      <Link href="/settings" className="text-blue-600 hover:underline">
                        Configure seu tipo de hospital
                      </Link> para receber ECGs personalizados para sua prática.
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <Link href="/practice">
                    <Button
                      size="lg"
                      disabled={!isSubscribed && remainingFree <= 0}
                      className="gap-2 px-8"
                    >
                      <Play className="h-5 w-5" />
                      {!isSubscribed && remainingFree <= 0
                        ? 'Limite Atingido'
                        : 'Começar'
                      }
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })()}

      {/* Ranking and Diagnosis Performance - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* XP Leaderboard - Left side */}
        <LeaderboardXP userId={user.id} limit={10} showUserPosition={true} />

        {/* Diagnosis Performance - Right side (stacked) */}
        <div className="space-y-6">
          {/* Best Diagnoses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Melhores Diagnósticos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bestDiagnoses.length > 0 ? (
                <div className="space-y-3">
                  {bestDiagnoses.map((diag, index) => (
                    <div key={diag.key} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-sm font-medium text-gray-600 w-5">{index + 1}.</span>
                        <span className="text-sm text-gray-900 truncate">{diag.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${diag.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-green-600 w-12 text-right">
                          {diag.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-4">
                  Complete mais ECGs para ver estatísticas
                </p>
              )}
            </CardContent>
          </Card>

          {/* Worst Diagnoses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-500" />
                Diagnósticos a Melhorar
              </CardTitle>
            </CardHeader>
            <CardContent>
              {worstDiagnoses.length > 0 ? (
                <div className="space-y-3">
                  {worstDiagnoses.map((diag, index) => (
                    <div key={diag.key} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-sm font-medium text-gray-600 w-5">{index + 1}.</span>
                        <span className="text-sm text-gray-900 truncate">{diag.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-red-500 h-2 rounded-full"
                            style={{ width: `${diag.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-red-600 w-12 text-right">
                          {diag.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-4">
                  Complete mais ECGs para ver estatísticas
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
