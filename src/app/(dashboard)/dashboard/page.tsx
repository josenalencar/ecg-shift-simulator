import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'
import { Activity, Target, TrendingUp, Clock, Crown, CreditCard, Trophy, TrendingDown, Medal, Building2 } from 'lucide-react'
import { ManageSubscriptionButton } from './manage-subscription-button'
import { FINDINGS, RHYTHMS, HOSPITAL_TYPES } from '@/lib/ecg-constants'

export const dynamic = 'force-dynamic'

const FREE_MONTHLY_LIMIT = 5

// Difficulty weights for scoring (ECGs more difficult give more points)
const DIFFICULTY_WEIGHTS: Record<string, number> = {
  easy: 1.0,
  medium: 1.25,
  hard: 1.5,
}

// Weighted score formula: 70% grade weight + 30% activity weight (normalized)
// Grade is now weighted by ECG difficulty
function calculateWeightedScore(avgScore: number, attemptCount: number, maxAttempts: number): number {
  const normalizedActivity = maxAttempts > 0 ? Math.min(attemptCount / maxAttempts, 1) : 0
  return (avgScore * 0.7) + (normalizedActivity * 100 * 0.3)
}

// Calculate difficulty-weighted average score
function calculateDifficultyWeightedAvg(attempts: { score: number; difficulty: string | null }[]): number {
  if (attempts.length === 0) return 0

  let totalWeightedScore = 0
  let totalWeight = 0

  for (const attempt of attempts) {
    const weight = DIFFICULTY_WEIGHTS[attempt.difficulty || 'medium'] || 1.0
    totalWeightedScore += Number(attempt.score) * weight
    totalWeight += weight
  }

  return totalWeight > 0 ? totalWeightedScore / totalWeight : 0
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

  // Get all users for ranking
  const { data: allProfilesData } = await supabase
    .from('profiles')
    .select('id, full_name, email')

  type ProfileInfo = { id: string; full_name: string | null; email: string }
  const allProfiles = allProfilesData as ProfileInfo[] | null

  // Get all attempts for ranking calculation (including ECG difficulty)
  const { data: allAttemptsData } = await supabase
    .from('attempts')
    .select('user_id, score, ecg_id, ecgs(difficulty)')

  type AttemptData = { user_id: string; score: number; ecg_id: string; ecgs: { difficulty: string } | null }
  const allAttempts = allAttemptsData as AttemptData[] | null

  // Calculate user rankings with difficulty weighting
  const userAttemptsMap = new Map<string, { score: number; difficulty: string | null }[]>()
  allAttempts?.forEach(attempt => {
    if (!userAttemptsMap.has(attempt.user_id)) {
      userAttemptsMap.set(attempt.user_id, [])
    }
    userAttemptsMap.get(attempt.user_id)!.push({
      score: Number(attempt.score),
      difficulty: attempt.ecgs?.difficulty || null
    })
  })

  const maxAttempts = Math.max(...Array.from(userAttemptsMap.values()).map(a => a.length), 1)

  const rankings = Array.from(userAttemptsMap.entries())
    .map(([userId, userAttempts]) => {
      const profileInfo = allProfiles?.find(p => p.id === userId)
      // Calculate difficulty-weighted average
      const avgScore = calculateDifficultyWeightedAvg(userAttempts)
      const weightedScore = calculateWeightedScore(avgScore, userAttempts.length, maxAttempts)
      return {
        userId,
        name: profileInfo?.full_name || profileInfo?.email?.split('@')[0] || 'Anonimo',
        avgScore: Math.round(avgScore),
        attemptCount: userAttempts.length,
        weightedScore: Math.round(weightedScore * 100) / 100,
        isCurrentUser: userId === user.id
      }
    })
    .sort((a, b) => b.weightedScore - a.weightedScore)
    .map((entry, index) => ({ ...entry, rank: index + 1 }))

  const currentUserRank = rankings.find(r => r.isCurrentUser)?.rank || 0
  const totalUsers = rankings.length

  // Calculate percentile (better than X% of users)
  const percentile = totalUsers > 1 && currentUserRank > 0
    ? Math.round(((totalUsers - currentUserRank) / (totalUsers - 1)) * 100)
    : 0

  // Build display ranking: top 10, and if user not in top 10, show them separately
  const top10 = rankings.slice(0, 10)
  const currentUserInTop10 = top10.some(r => r.isCurrentUser)
  const currentUserEntry = rankings.find(r => r.isCurrentUser)

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

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-700">ECGs Disponíveis</p>
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
                <p className="text-sm text-gray-700">
                  {isSubscribed ? 'Restantes' : 'Este Mês'}
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

      {/* Rankings and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Ranking Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Ranking Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rankings.length > 0 ? (
              <div className="space-y-2">
                {/* Top 10 users */}
                {top10.map((r) => {
                  const isTop3 = r.rank <= 3

                  return (
                    <div
                      key={r.userId}
                      className={`flex items-center justify-between p-2 rounded-lg ${
                        r.isCurrentUser ? 'bg-blue-100 border border-blue-300' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                          r.rank === 1 ? 'bg-yellow-400 text-yellow-900' :
                          r.rank === 2 ? 'bg-gray-300 text-gray-700' :
                          r.rank === 3 ? 'bg-orange-400 text-orange-900' :
                          'bg-gray-200 text-gray-600'
                        }`}>
                          {r.rank <= 3 ? <Medal className="h-4 w-4" /> : r.rank}
                        </div>
                        <span className={`text-sm ${r.isCurrentUser ? 'font-bold text-blue-700' : isTop3 ? 'text-gray-900' : 'text-gray-700'}`}>
                          {isTop3 || r.isCurrentUser ? r.name : '••••••'}
                          {r.isCurrentUser && ' (Você)'}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{r.avgScore}%</p>
                        <p className="text-xs text-gray-600">{r.attemptCount} ECGs</p>
                      </div>
                    </div>
                  )
                })}

                {/* Show current user if not in top 10 */}
                {!currentUserInTop10 && currentUserEntry && (
                  <>
                    <div className="text-center text-gray-400 py-1">• • •</div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-blue-100 border border-blue-300">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold bg-blue-500 text-white">
                          {currentUserEntry.rank}
                        </div>
                        <span className="text-sm font-bold text-blue-700">
                          {currentUserEntry.name} (Você)
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{currentUserEntry.avgScore}%</p>
                        <p className="text-xs text-gray-600">{currentUserEntry.attemptCount} ECGs</p>
                      </div>
                    </div>
                  </>
                )}

                {/* Percentile display */}
                {currentUserRank > 0 && totalUsers > 1 && (
                  <div className="pt-3 mt-2 border-t border-gray-200">
                    {currentUserInTop10 ? (
                      <p className="text-xs text-center text-gray-600">
                        Sua posição: <span className="font-bold">#{currentUserRank}</span> de {totalUsers} usuários
                      </p>
                    ) : (
                      <div className="text-center">
                        <p className="text-sm font-semibold text-blue-600">
                          Você está melhor que {percentile}% dos usuários!
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Posição #{currentUserRank} de {totalUsers} usuários
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-4">Nenhum dado disponível</p>
            )}
          </CardContent>
        </Card>

        {/* Start Practice */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Iniciar Plantão</span>
              {profile?.hospital_type && (
                <span className="flex items-center gap-2 text-sm font-normal text-gray-600">
                  <Building2 className="h-4 w-4" />
                  {HOSPITAL_TYPES.find(h => h.value === profile.hospital_type)?.label}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              Entre em uma sessão de prática e interprete ECGs como em um plantão real de tele-ECG.
              Receba feedback imediato e aprenda com seus erros.
            </p>
            <Link href="/practice">
              <Button size="lg" disabled={!isSubscribed && remainingFree <= 0}>
                {!isSubscribed && remainingFree <= 0
                  ? 'Limite Atingido'
                  : 'Iniciar Plantão'
                }
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Diagnosis Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
                    <p className="text-sm text-gray-600">
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
              <p className="text-gray-600 mb-4">Nenhuma sessão de prática ainda</p>
              <Link href="/practice">
                <Button variant="outline">Comece sua primeira sessão</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
