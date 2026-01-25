'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'
import { ECGViewer, ReportForm, ResultComparison, type ReportFormData } from '@/components/ecg'
import { calculateScore, type ScoringResult } from '@/lib/scoring'
import { DIFFICULTIES, CATEGORIES } from '@/lib/ecg-constants'
import { Loader2, ArrowRight, RotateCcw, Home, Lock, Crown } from 'lucide-react'
import type { ECG, OfficialReport } from '@/types/database'

const FREE_MONTHLY_LIMIT = 5

type PracticeState = 'loading' | 'practicing' | 'submitted' | 'no-ecgs' | 'limit-reached'

type SubscriptionInfo = {
  status: string
  isActive: boolean
}

export default function PracticePage() {
  const router = useRouter()
  const supabase = createClient()

  const [state, setState] = useState<PracticeState>('loading')
  const [currentECG, setCurrentECG] = useState<ECG | null>(null)
  const [officialReport, setOfficialReport] = useState<OfficialReport | null>(null)
  const [scoringResult, setScoringResult] = useState<ScoringResult | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [subscription, setSubscription] = useState<SubscriptionInfo>({ status: 'inactive', isActive: false })
  const [monthlyAttempts, setMonthlyAttempts] = useState(0)

  useEffect(() => {
    loadNextECG()
  }, [])

  async function loadNextECG() {
    setState('loading')
    setCurrentECG(null)
    setOfficialReport(null)
    setScoringResult(null)

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    setUserId(user.id)

    // Check subscription status
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: subData } = await (supabase as any)
      .from('subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .single()

    const subInfo = {
      status: (subData as { status?: string } | null)?.status || 'inactive',
      isActive: (subData as { status?: string } | null)?.status === 'active'
    }
    setSubscription(subInfo)

    // Get monthly attempt count for free users
    if (!subInfo.isActive) {
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { count } = await supabase
        .from('attempts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth.toISOString())

      const attempts = count || 0
      setMonthlyAttempts(attempts)

      if (attempts >= FREE_MONTHLY_LIMIT) {
        setState('limit-reached')
        return
      }
    }

    // Get ECGs the user hasn't attempted yet
    const { data: attemptedECGs } = await supabase
      .from('attempts')
      .select('ecg_id')
      .eq('user_id', user.id)

    const typedAttemptedECGs = attemptedECGs as { ecg_id: string }[] | null
    const attemptedIds = typedAttemptedECGs?.map(a => a.ecg_id) || []

    // Get a random active ECG that hasn't been attempted
    let query = supabase
      .from('ecgs')
      .select('*, official_reports(*)')
      .eq('is_active', true)
      .not('official_reports', 'is', null)

    if (attemptedIds.length > 0) {
      query = query.not('id', 'in', `(${attemptedIds.join(',')})`)
    }

    const { data: ecgs, error } = await query

    if (error) {
      console.error('Error loading ECGs:', error)
      setState('no-ecgs')
      return
    }

    type ECGWithReport = ECG & { official_reports: OfficialReport | null }
    const typedECGs = ecgs as ECGWithReport[] | null

    if (!typedECGs || typedECGs.length === 0) {
      setState('no-ecgs')
      return
    }

    // Pick a random ECG
    const randomIndex = Math.floor(Math.random() * typedECGs.length)
    const selectedECG = typedECGs[randomIndex]

    setCurrentECG(selectedECG)
    setOfficialReport(selectedECG.official_reports)
    setState('practicing')
  }

  async function handleSubmit(userReport: ReportFormData) {
    if (!currentECG || !officialReport || !userId) return

    setIsSubmitting(true)

    try {
      // Calculate score
      const result = calculateScore(userReport, officialReport)
      setScoringResult(result)

      // Save attempt to database
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('attempts') as any).insert({
        user_id: userId,
        ecg_id: currentECG.id,
        rhythm: userReport.rhythm,
        regularity: userReport.regularity,
        heart_rate: userReport.heart_rate,
        axis: userReport.axis,
        pr_interval: userReport.pr_interval,
        qrs_duration: userReport.qrs_duration,
        qt_interval: userReport.qt_interval,
        findings: userReport.findings,
        score: result.score,
        feedback: result.comparisons,
      })

      // Update monthly count
      setMonthlyAttempts(prev => prev + 1)

      setState('submitted')
    } catch (error) {
      console.error('Error submitting attempt:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const diffLabel = currentECG ? DIFFICULTIES.find(d => d.value === currentECG.difficulty)?.label : ''
  const catLabel = currentECG ? CATEGORIES.find(c => c.value === currentECG.category)?.label : ''
  const remainingFree = FREE_MONTHLY_LIMIT - monthlyAttempts

  if (state === 'loading') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Carregando ECG...</p>
          </div>
        </div>
      </div>
    )
  }

  if (state === 'limit-reached') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-2 border-orange-200 bg-orange-50">
          <CardContent className="py-12 text-center">
            <Lock className="h-16 w-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Limite Mensal Atingido
            </h2>
            <p className="text-gray-600 mb-2">
              Voce utilizou seus {FREE_MONTHLY_LIMIT} casos gratuitos deste mes.
            </p>
            <p className="text-gray-600 mb-6">
              Assine o Premium para acesso ilimitado a todos os casos de ECG!
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/dashboard">
                <Button variant="outline">
                  <Home className="h-4 w-4 mr-2" />
                  Ir para Dashboard
                </Button>
              </Link>
              <Link href="/pricing">
                <Button>
                  <Crown className="h-4 w-4 mr-2" />
                  Assinar Premium
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (state === 'no-ecgs') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Tudo em dia!
            </h2>
            <p className="text-gray-600 mb-6">
              Voce completou todos os casos de ECG disponiveis. Volte mais tarde para mais!
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/dashboard">
                <Button variant="outline">
                  <Home className="h-4 w-4 mr-2" />
                  Ir para Dashboard
                </Button>
              </Link>
              <Button onClick={loadNextECG}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (state === 'submitted' && scoringResult) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Resultado</h1>
          <p className="text-gray-600">ECG #{currentECG?.title}</p>
        </div>

        {/* ECG Image (smaller) */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <img
              src={currentECG?.image_url}
              alt={currentECG?.title}
              className="w-full max-h-[300px] object-contain"
            />
          </CardContent>
        </Card>

        {/* Results */}
        <ResultComparison result={scoringResult} notes={officialReport?.notes} />

        {/* Free user warning */}
        {!subscription.isActive && remainingFree <= 2 && remainingFree > 0 && (
          <Card className="mt-6 border-orange-200 bg-orange-50">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-orange-800">
                    Voce tem {remainingFree} caso{remainingFree !== 1 ? 's' : ''} gratuito{remainingFree !== 1 ? 's' : ''} restante{remainingFree !== 1 ? 's' : ''} este mes
                  </p>
                  <p className="text-sm text-orange-600">Assine o Premium para casos ilimitados</p>
                </div>
                <Link href="/pricing">
                  <Button size="sm">
                    <Crown className="h-4 w-4 mr-2" />
                    Assinar
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-4 justify-center mt-8">
          <Link href="/dashboard">
            <Button variant="outline">
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <Button onClick={loadNextECG}>
            Proximo ECG
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sessao de Pratica</h1>
          <p className="text-gray-600">ECG #{currentECG?.title}</p>
        </div>
        <div className="flex items-center gap-2">
          {!subscription.isActive && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
              {remainingFree} restante{remainingFree !== 1 ? 's' : ''}
            </span>
          )}
          {subscription.isActive && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 flex items-center gap-1">
              <Crown className="h-3 w-3" />
              Premium
            </span>
          )}
          <span className={`
            px-2 py-1 rounded-full text-xs font-medium
            ${currentECG?.difficulty === 'easy'
              ? 'bg-green-100 text-green-700'
              : currentECG?.difficulty === 'medium'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
            }
          `}>
            {diffLabel}
          </span>
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            {catLabel}
          </span>
        </div>
      </div>

      {/* ECG Viewer - Full Width */}
      <div className="mb-6">
        {currentECG && (
          <ECGViewer imageUrl={currentECG.image_url} title={currentECG.title} />
        )}
      </div>

      {/* Report Form - Below ECG */}
      <Card>
        <CardHeader>
          <CardTitle>Sua Interpretacao</CardTitle>
        </CardHeader>
        <CardContent>
          <ReportForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Enviar Interpretacao"
          />
        </CardContent>
      </Card>
    </div>
  )
}
