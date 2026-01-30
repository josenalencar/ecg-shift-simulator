'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'
import { ECGViewer, ReportForm, ResultComparison, PremiumFeedback, type ReportFormData } from '@/components/ecg'
import { calculateScore, type ScoringResult } from '@/lib/scoring'
import { DIFFICULTIES, CATEGORIES, MEDICAL_HISTORY_OPTIONS, FAMILY_HISTORY_OPTIONS, MEDICATIONS_OPTIONS, HOSPITAL_TYPES } from '@/lib/ecg-constants'
import { onAttemptComplete, type GamificationResult } from '@/lib/gamification'
import { Loader2, ArrowRight, RotateCcw, Home, Lock, Crown, Info, X, Flame, Star, Trophy, TrendingUp } from 'lucide-react'
import type { ECG, OfficialReport, MedicalHistory, FamilyHistory, Medication, HospitalType, Category } from '@/types/database'

type ECGWithPatientInfo = ECG & {
  patient_age?: number | null
  patient_sex?: string | null
  clinical_presentation?: string[] | null
  medical_history?: MedicalHistory[] | null
  family_history?: FamilyHistory[] | null
  medications?: Medication[] | null
  is_pediatric?: boolean | null
}

const CLINICAL_PRESENTATIONS = [
  { value: 'dor_toracica', label: 'Dor Torácica' },
  { value: 'dispneia', label: 'Dispneia' },
  { value: 'palpitacoes', label: 'Palpitações' },
  { value: 'sincope', label: 'Síncope' },
  { value: 'pre_sincope', label: 'Pré-síncope' },
  { value: 'tontura', label: 'Tontura' },
  { value: 'fadiga', label: 'Fadiga' },
  { value: 'edema', label: 'Edema de MMII' },
  { value: 'nega_sintomas', label: 'Nega Sintomas' },
  { value: 'checkup', label: 'Check-up / Rotina' },
  { value: 'pre_operatorio', label: 'Pré-operatório' },
  { value: 'dor_epigastrica', label: 'Dor Epigástrica' },
  { value: 'mal_estar', label: 'Mal-estar' },
  { value: 'sudorese', label: 'Sudorese' },
  { value: 'nausea_vomito', label: 'Náusea / Vômito' },
]

const FREE_MONTHLY_LIMIT = 5

type PracticeState = 'loading' | 'practicing' | 'submitted' | 'no-ecgs' | 'limit-reached'

type SubscriptionInfo = {
  status: string
  isActive: boolean
  hasAI: boolean
  isGranted: boolean
}

export default function PracticePage() {
  const router = useRouter()
  const supabase = createClient()

  const [state, setState] = useState<PracticeState>('loading')
  const [currentECG, setCurrentECG] = useState<ECGWithPatientInfo | null>(null)
  const [officialReport, setOfficialReport] = useState<OfficialReport | null>(null)
  const [scoringResult, setScoringResult] = useState<ScoringResult | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [subscription, setSubscription] = useState<SubscriptionInfo>({ status: 'inactive', isActive: false, hasAI: false, isGranted: false })
  const [monthlyAttempts, setMonthlyAttempts] = useState(0)
  const [showTutorial, setShowTutorial] = useState(false)
  const [gamificationResult, setGamificationResult] = useState<GamificationResult | null>(null)

  useEffect(() => {
    loadNextECG()
  }, [])

  async function loadNextECG() {
    setState('loading')
    setCurrentECG(null)
    setOfficialReport(null)
    setScoringResult(null)
    setGamificationResult(null)

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    setUserId(user.id)

    // Check subscription status (including granted plans) and get user name
    // First check for granted plan and get profile info
    const { data: profileData } = await supabase
      .from('profiles')
      .select('granted_plan, full_name')
      .eq('id', user.id)
      .single()

    const profile = profileData as { granted_plan?: string | null; full_name?: string | null } | null
    const grantedPlan = profile?.granted_plan
    setUserName(profile?.full_name || null)

    let subInfo: SubscriptionInfo

    if (grantedPlan) {
      // User has a granted plan
      subInfo = {
        status: 'active',
        isActive: true,
        hasAI: grantedPlan === 'ai' || grantedPlan === 'aluno_ecg',
        isGranted: true
      }
    } else {
      // Check paid subscription
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: subData } = await (supabase as any)
        .from('subscriptions')
        .select('status, plan')
        .eq('user_id', user.id)
        .maybeSingle()

      const subscription = subData as { status?: string; plan?: string } | null
      subInfo = {
        status: subscription?.status || 'inactive',
        isActive: subscription?.status === 'active',
        hasAI: subscription?.plan === 'ai',
        isGranted: false
      }
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

    // Get ECGs the user hasn't attempted recently (30-day cooldown)
    // ECGs come back after 30 days, keeping content fresh and ensuring users never "run out"
    const ECG_COOLDOWN_DAYS = 30
    const cooldownDate = new Date()
    cooldownDate.setDate(cooldownDate.getDate() - ECG_COOLDOWN_DAYS)

    const { data: recentAttempts } = await supabase
      .from('attempts')
      .select('ecg_id')
      .eq('user_id', user.id)
      .gte('created_at', cooldownDate.toISOString())

    const typedRecentAttempts = recentAttempts as { ecg_id: string }[] | null
    const recentIds = typedRecentAttempts?.map(a => a.ecg_id) || []

    // Get a random active ECG that hasn't been attempted recently
    let query = supabase
      .from('ecgs')
      .select('*, official_reports(*)')
      .eq('is_active', true)
      .not('official_reports', 'is', null)

    if (recentIds.length > 0) {
      query = query.not('id', 'in', `(${recentIds.join(',')})`)
    }

    const { data: ecgs, error } = await query

    if (error) {
      console.error('Error loading ECGs:', error)
      setState('no-ecgs')
      return
    }

    type ECGWithReport = ECGWithPatientInfo & { official_reports: OfficialReport | null }
    const typedECGs = ecgs as ECGWithReport[] | null

    if (!typedECGs || typedECGs.length === 0) {
      setState('no-ecgs')
      return
    }

    // Get user's hospital type preference for Pro users
    let hospitalType: HospitalType | null = null
    if (subInfo.isActive) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('hospital_type')
        .eq('id', user.id)
        .single()

      const profile = profileData as { hospital_type: HospitalType | null } | null
      hospitalType = profile?.hospital_type || null
    }

    // Load hospital weights from admin settings
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: adminSettings } = await (supabase as any)
      .from('admin_settings')
      .select('hospital_weights')
      .eq('id', 'default')
      .single()

    type WeightConfig = {
      categories: Record<string, number>
      difficulties: Record<string, number>
    }

    // Filter ECGs based on hospital type (pediatric vs adult)
    let eligibleECGs = typedECGs

    if (hospitalType === 'pediatria_geral' || hospitalType === 'pediatria_cardiologica') {
      // Pediatric hospitals: only show pediatric ECGs
      eligibleECGs = typedECGs.filter(ecg => ecg.is_pediatric === true)
    } else if (hospitalType) {
      // Adult hospitals: only show adult (non-pediatric) ECGs
      eligibleECGs = typedECGs.filter(ecg => ecg.is_pediatric !== true)
    }
    // If no hospital type (free users), show all ECGs

    if (eligibleECGs.length === 0) {
      // No ECGs available for this hospital type
      setState('no-ecgs')
      return
    }

    // Prioritize ECGs based on hospital type using weighted random selection
    let selectedECG: typeof eligibleECGs[0]

    if (hospitalType && adminSettings?.hospital_weights) {
      // Handle both old keys (emergency, general, cardiology) and new keys
      const hospitalWeightsData = adminSettings.hospital_weights as Record<string, WeightConfig>
      const keyMapping: Record<string, string> = {
        'pronto_socorro': 'emergency',
        'hospital_geral': 'general',
        'hospital_cardiologico': 'cardiology'
      }
      const weights = hospitalWeightsData[hospitalType] || hospitalWeightsData[keyMapping[hospitalType]] as WeightConfig

      if (weights) {
        // Calculate weight for each ECG
        const ecgWeights = eligibleECGs.map(ecg => {
          const categoryWeight = weights.categories[ecg.category] || 1
          const difficultyWeight = weights.difficulties[ecg.difficulty] || 1
          return {
            ecg,
            weight: categoryWeight * difficultyWeight
          }
        })

        // Weighted random selection
        const totalWeight = ecgWeights.reduce((sum, ew) => sum + ew.weight, 0)
        let random = Math.random() * totalWeight

        selectedECG = ecgWeights[ecgWeights.length - 1].ecg // fallback
        for (const ew of ecgWeights) {
          random -= ew.weight
          if (random <= 0) {
            selectedECG = ew.ecg
            break
          }
        }
      } else {
        // No weights found, pick random
        const randomIndex = Math.floor(Math.random() * eligibleECGs.length)
        selectedECG = eligibleECGs[randomIndex]
      }
    } else {
      // No hospital type preference, pick random from eligible
      const randomIndex = Math.floor(Math.random() * eligibleECGs.length)
      selectedECG = eligibleECGs[randomIndex]
    }

    setCurrentECG(selectedECG)
    setOfficialReport(selectedECG.official_reports)
    setState('practicing')
  }

  async function handleSubmit(userReport: ReportFormData) {
    if (!currentECG || !officialReport || !userId) return

    setIsSubmitting(true)

    try {
      // Calculate score with category-weighted system
      const ecgCategories = (currentECG.categories || [currentECG.category]) as Category[]
      const result = calculateScore(userReport, officialReport, ecgCategories)
      setScoringResult(result)

      // Save attempt to database
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: insertError } = await (supabase.from('attempts') as any).insert({
        user_id: userId,
        ecg_id: currentECG.id,
        rhythm: userReport.rhythm,
        heart_rate: userReport.heart_rate,
        axis: userReport.axis,
        pr_interval: userReport.pr_interval,
        qrs_duration: userReport.qrs_duration,
        qt_interval: userReport.qt_interval,
        findings: userReport.findings,
        electrode_swap: userReport.electrode_swap.length > 0 ? userReport.electrode_swap : null,
        score: result.score,
        feedback: result.comparisons,
        age_pattern: currentECG.is_pediatric ? userReport.age_pattern : null,
      })

      if (insertError) {
        console.error('Failed to save attempt:', insertError)
        // Still show results even if save failed
      }

      // === GAMIFICATION HOOK ===
      try {
        const gamResult = await onAttemptComplete(userId, {
          ecgId: currentECG.id,
          score: result.score,
          difficulty: currentECG.difficulty,
          isPerfect: result.score === 100,
          categories: (currentECG.categories || [currentECG.category]) as Category[],
          findings: officialReport.findings || [],
          isFirstAttempt: true,
        }, supabase)

        // Check and award achievements via server API (uses service_role to bypass RLS)
        try {
          const achievementRes = await fetch('/api/gamification/check-achievements', { method: 'POST' })
          if (achievementRes.ok) {
            const achievementData = await achievementRes.json()
            // Merge newly awarded achievements into the result
            if (achievementData.achievementsUnlocked?.length > 0) {
              gamResult.achievementsUnlocked = achievementData.achievementsUnlocked.map((a: { id: string; name: string; xpReward: number }) => ({
                achievement: { id: a.id, name_pt: a.name } as never,
                xpReward: a.xpReward,
              }))
              gamResult.newTotalXP += achievementData.totalNewXp
            }
          }
        } catch (achievementError) {
          console.error('Achievement check error:', achievementError)
        }

        setGamificationResult(gamResult)
      } catch (gamError) {
        console.error('Gamification error:', gamError)
        // Don't fail the submission if gamification fails
      }

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
              Você utilizou seus {FREE_MONTHLY_LIMIT} casos gratuitos deste mês.
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
              Você completou todos os casos de ECG disponíveis. Volte mais tarde para mais!
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
        </div>

        {/* Gamification Results */}
        {gamificationResult && (
          <Card className="mb-6 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="py-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* XP Earned */}
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">XP Ganho</p>
                    <p className="text-xl font-bold text-blue-700">+{gamificationResult.xpEarned}</p>
                  </div>
                  {gamificationResult.activeEvent && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                      {gamificationResult.activeEvent.multiplier_type} Evento!
                    </span>
                  )}
                </div>

                {/* Level */}
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <Star className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Nivel</p>
                    <p className="text-xl font-bold text-purple-700">
                      {gamificationResult.newLevel}
                      {gamificationResult.levelUp && (
                        <span className="ml-2 text-sm text-green-600 font-normal">Level Up!</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Streak */}
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-full">
                    <Flame className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Streak</p>
                    <p className="text-xl font-bold text-orange-600">
                      {gamificationResult.newStreak} dia{gamificationResult.newStreak !== 1 ? 's' : ''}
                      {gamificationResult.streakMilestone && (
                        <span className="ml-2 text-sm text-green-600 font-normal">
                          {gamificationResult.streakMilestone} dias!
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Achievements */}
                {gamificationResult.achievementsUnlocked.length > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-full">
                      <Trophy className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Conquistas</p>
                      <div className="flex flex-wrap gap-1">
                        {gamificationResult.achievementsUnlocked.map((ua) => (
                          <span
                            key={ua.achievement.id}
                            className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full"
                          >
                            {ua.achievement.name_pt}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

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

        {/* Premium Feedback - detailed explanations for Premium users */}
        {officialReport && currentECG && (
          <div className="mt-6">
            <PremiumFeedback
              result={scoringResult}
              officialReport={officialReport}
              ecgImageUrl={currentECG.image_url}
              ecgId={currentECG.id}
              isPremium={subscription.isActive}
              hasAI={subscription.hasAI}
              userName={userName || undefined}
            />
          </div>
        )}

        {/* Free user warning */}
        {!subscription.isActive && remainingFree <= 2 && remainingFree > 0 && (
          <Card className="mt-6 border-orange-200 bg-orange-50">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-orange-800">
                    Você tem {remainingFree} caso{remainingFree !== 1 ? 's' : ''} gratuito{remainingFree !== 1 ? 's' : ''} restante{remainingFree !== 1 ? 's' : ''} este mês
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
            Próximo ECG
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Tutorial Modal */}
      {showTutorial && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Como usar o Plantão de ECG</h2>
              <button
                onClick={() => setShowTutorial(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">1. Analise o ECG</h3>
                <p className="text-gray-700">
                  Use o visualizador para examinar o ECG com calma. Você pode usar o scroll para dar zoom
                  e arrastar para navegar pela imagem.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">2. Use o Compasso (Caliper)</h3>
                <p className="text-gray-700 mb-2">
                  Clique no icone de regua para ativar o compasso. Para calibrar:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                  <li>Clique no inicio de um quadradao (5mm = 200ms)</li>
                  <li>Clique no fim do mesmo quadradao</li>
                  <li>Agora clique em dois pontos para medir o intervalo em ms</li>
                  <li>O sistema calcula automaticamente a FC correspondente</li>
                </ul>
                <p className="text-sm text-amber-700 mt-2">
                  Obs: Se você mudar o zoom, a calibração é perdida.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">3. Preencha o Laudo</h3>
                <p className="text-gray-700">
                  Selecione o ritmo, regularidade, eixo, intervalos e todos os achados que identificar.
                  Seções dependentes abrirão automaticamente quando necessário.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">4. Envie e Aprenda</h3>
                <p className="text-gray-700">
                  Após enviar, você verá uma comparação detalhada entre sua interpretação e o laudo oficial,
                  com feedback específico para cada item.
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Dica de Estudo</h3>
                <p className="text-blue-800 text-sm">
                  Practice makes perfect. Quanto mais casos você interpretar, mais rápido e preciso você se tornará.
                  Use o feedback para entender onde pode melhorar.
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200">
              <Button onClick={() => setShowTutorial(false)} className="w-full">
                Entendido, vamos começar!
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Plantão de ECG</h1>
          </div>
          <button
            onClick={() => setShowTutorial(true)}
            className="p-2 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors"
            title="Como usar"
          >
            <Info className="h-5 w-5 text-blue-600" />
          </button>
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
        </div>
      </div>

      {/* Patient Context */}
      {currentECG && (currentECG.patient_age || currentECG.clinical_presentation?.length || currentECG.medical_history?.length || currentECG.family_history?.length || currentECG.medications?.length) && (
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Contexto Clínico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              {/* Patient demographics and chief complaint */}
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {currentECG.patient_age && currentECG.patient_sex && (
                  <div>
                    <span className="text-gray-600 font-medium">Paciente:</span>
                    <span className="ml-2 font-semibold text-gray-900">
                      {currentECG.patient_sex === 'masculino' ? 'Masculino' : 'Feminino'}, {currentECG.patient_age} anos
                    </span>
                  </div>
                )}
                {currentECG.clinical_presentation && currentECG.clinical_presentation.length > 0 && (
                  <div>
                    <span className="text-gray-600 font-medium">Queixa:</span>
                    <span className="ml-2 font-semibold text-gray-900">
                      {currentECG.clinical_presentation.map(p =>
                        CLINICAL_PRESENTATIONS.find(cp => cp.value === p)?.label || p
                      ).join(', ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Medical history section */}
              {(currentECG.medical_history?.length || currentECG.family_history?.length || currentECG.medications?.length) && (
                <div className="pt-2 border-t border-gray-200 flex flex-wrap gap-x-6 gap-y-2">
                  {currentECG.medical_history && currentECG.medical_history.length > 0 && (
                    <div>
                      <span className="text-gray-600 font-medium">Histórico:</span>
                      <span className="ml-2 font-semibold text-gray-900">
                        {currentECG.medical_history.map(h =>
                          MEDICAL_HISTORY_OPTIONS.find(mh => mh.value === h)?.label || h
                        ).join(', ')}
                      </span>
                    </div>
                  )}
                  {currentECG.family_history && currentECG.family_history.length > 0 && (
                    <div>
                      <span className="text-gray-600 font-medium">Hist. Familiar:</span>
                      <span className="ml-2 font-semibold text-gray-900">
                        {currentECG.family_history.map(h =>
                          FAMILY_HISTORY_OPTIONS.find(fh => fh.value === h)?.label || h
                        ).join(', ')}
                      </span>
                    </div>
                  )}
                  {currentECG.medications && currentECG.medications.length > 0 && (
                    <div>
                      <span className="text-gray-600 font-medium">Medicações:</span>
                      <span className="ml-2 font-semibold text-gray-900">
                        {currentECG.medications.map(m =>
                          MEDICATIONS_OPTIONS.find(med => med.value === m)?.label || m
                        ).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ECG Viewer - Full Width */}
      <div className="mb-6">
        {currentECG && (
          <ECGViewer imageUrl={currentECG.image_url} />
        )}
      </div>

      {/* Report Form - Below ECG */}
      <Card>
        <CardHeader>
          <CardTitle>Sua Interpretação</CardTitle>
        </CardHeader>
        <CardContent>
          <ReportForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Enviar Interpretação"
            isPediatric={currentECG?.is_pediatric || false}
          />
        </CardContent>
      </Card>
    </div>
  )
}
