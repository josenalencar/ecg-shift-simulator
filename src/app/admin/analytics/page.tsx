'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import {
  TrendingUp, Target, Clock, Award, BarChart3, PieChart, Users, FileText,
  Filter, Download, Zap, Flame, Trophy, AlertTriangle, TrendingDown, Calendar
} from 'lucide-react'
import { DIFFICULTIES, CATEGORIES, FINDINGS } from '@/lib/ecg-constants'
import { exportTableToCSV, exportChartToPNG, getDateRangePreset } from '@/lib/export-utils'
import type { Finding, GrantedPlan } from '@/types/database'

type AttemptWithECG = {
  id: string
  user_id: string
  score: number
  findings: Finding[]
  created_at: string
  ecg_id: string
  ecgs: {
    id: string
    title: string
    difficulty: string
    category: string
    created_by: string | null
  } | null
}

type ECGWithCreator = {
  id: string
  title: string
  difficulty: string
  created_by: string | null
  official_reports: { id: string; findings: Finding[] } | null
  profiles: { id: string; full_name: string | null; email: string } | null
}

type ProfileData = {
  id: string
  email: string
  full_name: string | null
  granted_plan: GrantedPlan | null
  hospital_type: string | null
  created_at: string
}

type SubscriptionData = {
  user_id: string
  status: string
  plan: string
}

type GamificationStats = {
  user_id: string
  total_xp: number
  current_level: number
  current_streak: number
  longest_streak: number
  total_ecgs_completed: number
  total_perfect_scores: number
  last_activity_date: string | null
}

type AchievementData = {
  id: string
  slug: string
  name_pt: string
}

type UserAchievementData = {
  user_id: string
  achievement_id: string
  earned_at: string
}

type AdminStat = {
  adminId: string
  name: string
  ecgCount: number
  withReport: number
  avgScore: number
  totalAttempts: number
}

type FindingPerformance = {
  finding: string
  label: string
  timesExpected: number
  timesMissed: number
  missRate: number
  falsePositives: number
  fpRate: number
}

type ECGCalibration = {
  id: string
  title: string
  difficulty: string
  expectedPassRate: number
  actualPassRate: number
  attempts: number
  delta: number // positive = easier than expected, negative = harder
}

export default function AdminAnalyticsPage() {
  // Data states
  const [attempts, setAttempts] = useState<AttemptWithECG[]>([])
  const [ecgsWithCreators, setEcgsWithCreators] = useState<ECGWithCreator[]>([])
  const [profiles, setProfiles] = useState<ProfileData[]>([])
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([])
  const [gamificationStats, setGamificationStats] = useState<GamificationStats[]>([])
  const [achievements, setAchievements] = useState<AchievementData[]>([])
  const [userAchievements, setUserAchievements] = useState<UserAchievementData[]>([])
  const [adminStats, setAdminStats] = useState<AdminStat[]>([])
  const [loading, setLoading] = useState(true)

  // Filter states
  const [selectedAdmin, setSelectedAdmin] = useState<string>('all')
  const [dateRange, setDateRange] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')

  const supabase = createClient()

  // Load all data
  useEffect(() => {
    async function loadData() {
      setLoading(true)

      // Parallel data fetching
      const [
        attemptsRes,
        ecgsRes,
        profilesRes,
        subscriptionsRes,
        gamificationRes,
        achievementsRes,
        userAchievementsRes
      ] = await Promise.all([
        supabase
          .from('attempts')
          .select('id, user_id, score, findings, created_at, ecg_id, ecgs(id, title, difficulty, category, created_by)')
          .order('created_at', { ascending: false }),
        supabase
          .from('ecgs')
          .select('id, title, difficulty, created_by, official_reports(id, findings), profiles!ecgs_created_by_fkey(id, full_name, email)'),
        supabase
          .from('profiles')
          .select('id, email, full_name, granted_plan, hospital_type, created_at'),
        supabase
          .from('subscriptions')
          .select('user_id, status, plan'),
        supabase
          .from('user_gamification_stats')
          .select('user_id, total_xp, current_level, current_streak, longest_streak, total_ecgs_completed, total_perfect_scores, last_activity_date'),
        supabase
          .from('achievements')
          .select('id, slug, name_pt'),
        supabase
          .from('user_achievements')
          .select('user_id, achievement_id, earned_at')
      ])

      setAttempts((attemptsRes.data || []) as AttemptWithECG[])
      setEcgsWithCreators((ecgsRes.data || []) as ECGWithCreator[])
      setProfiles((profilesRes.data || []) as ProfileData[])
      setSubscriptions((subscriptionsRes.data || []) as SubscriptionData[])
      setGamificationStats((gamificationRes.data || []) as GamificationStats[])
      setAchievements((achievementsRes.data || []) as AchievementData[])
      setUserAchievements((userAchievementsRes.data || []) as UserAchievementData[])

      // Calculate admin stats
      const loadedEcgs = (ecgsRes.data || []) as ECGWithCreator[]
      const loadedAttempts = (attemptsRes.data || []) as AttemptWithECG[]
      const adminContributions = new Map<string, AdminStat>()

      loadedEcgs.forEach(ecg => {
        if (ecg.created_by && ecg.profiles) {
          const adminId = ecg.created_by
          const adminName = ecg.profiles.full_name || ecg.profiles.email?.split('@')[0] || 'Desconhecido'

          if (!adminContributions.has(adminId)) {
            adminContributions.set(adminId, {
              adminId,
              name: adminName,
              ecgCount: 0,
              withReport: 0,
              avgScore: 0,
              totalAttempts: 0
            })
          }

          const current = adminContributions.get(adminId)!
          current.ecgCount++
          if (ecg.official_reports) {
            current.withReport++
          }
        }
      })

      loadedAttempts.forEach(attempt => {
        const ecgCreator = attempt.ecgs?.created_by
        if (ecgCreator && adminContributions.has(ecgCreator)) {
          const adminStat = adminContributions.get(ecgCreator)!
          adminStat.totalAttempts++
          adminStat.avgScore = (adminStat.avgScore * (adminStat.totalAttempts - 1) + Number(attempt.score)) / adminStat.totalAttempts
        }
      })

      setAdminStats(Array.from(adminContributions.values()).sort((a, b) => b.ecgCount - a.ecgCount))
      setLoading(false)
    }

    loadData()
  }, [supabase])

  // Apply date filter
  const getFilteredAttempts = () => {
    let filtered = attempts

    // Date filter
    if (dateRange !== 'all' || (dateFrom && dateTo)) {
      let fromDate: Date, toDate: Date

      if (dateRange !== 'all' && dateRange !== 'custom') {
        const preset = getDateRangePreset(dateRange)
        fromDate = preset.from
        toDate = preset.to
      } else if (dateFrom && dateTo) {
        fromDate = new Date(dateFrom)
        fromDate.setHours(0, 0, 0, 0)
        toDate = new Date(dateTo)
        toDate.setHours(23, 59, 59, 999)
      } else {
        return filtered
      }

      filtered = filtered.filter(a => {
        const attemptDate = new Date(a.created_at)
        return attemptDate >= fromDate && attemptDate <= toDate
      })
    }

    // Admin filter
    if (selectedAdmin !== 'all') {
      filtered = filtered.filter(a => a.ecgs?.created_by === selectedAdmin)
    }

    return filtered
  }

  const filteredAttempts = getFilteredAttempts()

  // Overall stats
  const totalAttempts = filteredAttempts.length
  const avgScore = totalAttempts > 0
    ? Math.round(filteredAttempts.reduce((sum, a) => sum + Number(a.score), 0) / totalAttempts)
    : 0
  const passRate = totalAttempts > 0
    ? Math.round((filteredAttempts.filter(a => Number(a.score) >= 80).length / totalAttempts) * 100)
    : 0

  const filteredEcgs = selectedAdmin === 'all'
    ? ecgsWithCreators
    : ecgsWithCreators.filter(e => e.created_by === selectedAdmin)
  const totalECGs = filteredEcgs.length

  // User funnel
  const totalUsers = profiles.length
  const activatedUsers = new Set(attempts.map(a => a.user_id)).size
  const engagedUsers = (() => {
    const userCounts = new Map<string, number>()
    attempts.forEach(a => {
      userCounts.set(a.user_id, (userCounts.get(a.user_id) || 0) + 1)
    })
    return Array.from(userCounts.values()).filter(c => c >= 5).length
  })()
  const retainedUsers = (() => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentUsers = new Set(
      attempts
        .filter(a => new Date(a.created_at) >= thirtyDaysAgo)
        .map(a => a.user_id)
    )
    return recentUsers.size
  })()

  // Calculate finding performance
  const findingPerformance: FindingPerformance[] = (() => {
    const findingStats = new Map<string, { expected: number; missed: number; falsePositives: number }>()

    // Count expected findings from official reports
    ecgsWithCreators.forEach(ecg => {
      if (ecg.official_reports?.findings) {
        ecg.official_reports.findings.forEach(f => {
          if (!findingStats.has(f)) {
            findingStats.set(f, { expected: 0, missed: 0, falsePositives: 0 })
          }
          const stat = findingStats.get(f)!
          stat.expected++
        })
      }
    })

    // Count hits and misses from attempts
    filteredAttempts.forEach(attempt => {
      const ecg = ecgsWithCreators.find(e => e.id === attempt.ecg_id)
      if (!ecg?.official_reports?.findings) return

      const officialFindings = new Set(ecg.official_reports.findings)
      const userFindings = new Set(attempt.findings || [])

      // Check for misses (official not in user)
      officialFindings.forEach(f => {
        if (!userFindings.has(f)) {
          const stat = findingStats.get(f)
          if (stat) stat.missed++
        }
      })

      // Check for false positives (user not in official)
      userFindings.forEach(f => {
        if (!officialFindings.has(f) && f !== 'normal') {
          if (!findingStats.has(f)) {
            findingStats.set(f, { expected: 0, missed: 0, falsePositives: 0 })
          }
          findingStats.get(f)!.falsePositives++
        }
      })
    })

    return Array.from(findingStats.entries())
      .filter(([_, stats]) => stats.expected > 0 || stats.falsePositives > 5)
      .map(([finding, stats]) => {
        const findingInfo = FINDINGS.find(f => f.value === finding)
        return {
          finding,
          label: findingInfo?.label || finding,
          timesExpected: stats.expected,
          timesMissed: stats.missed,
          missRate: stats.expected > 0 ? Math.round((stats.missed / (stats.expected * Math.max(1, Math.floor(totalAttempts / ecgsWithCreators.length)))) * 100) : 0,
          falsePositives: stats.falsePositives,
          fpRate: totalAttempts > 0 ? Math.round((stats.falsePositives / totalAttempts) * 100) : 0
        }
      })
      .sort((a, b) => b.missRate - a.missRate)
  })()

  // ECG calibration (mislabeled detection)
  const ecgCalibration: ECGCalibration[] = (() => {
    const expectedPassRates: Record<string, number> = {
      'easy': 85,
      'medium': 65,
      'hard': 45
    }

    return ecgsWithCreators
      .map(ecg => {
        const ecgAttempts = filteredAttempts.filter(a => a.ecg_id === ecg.id)
        const attemptCount = ecgAttempts.length
        if (attemptCount < 3) return null // Need at least 3 attempts for meaningful data

        const passCount = ecgAttempts.filter(a => Number(a.score) >= 80).length
        const actualPassRate = Math.round((passCount / attemptCount) * 100)
        const expectedRate = expectedPassRates[ecg.difficulty] || 65

        return {
          id: ecg.id,
          title: ecg.title,
          difficulty: ecg.difficulty,
          expectedPassRate: expectedRate,
          actualPassRate,
          attempts: attemptCount,
          delta: actualPassRate - expectedRate
        }
      })
      .filter((e): e is ECGCalibration => e !== null)
  })()

  const easierThanExpected = ecgCalibration
    .filter(e => e.delta > 15)
    .sort((a, b) => b.delta - a.delta)
    .slice(0, 5)

  const harderThanExpected = ecgCalibration
    .filter(e => e.delta < -15)
    .sort((a, b) => a.delta - b.delta)
    .slice(0, 5)

  // User segmentation by plan
  const userSegmentation = (() => {
    const segments: Record<string, { users: number; attempts: number; avgScore: number; passRate: number; retention: number }> = {
      free: { users: 0, attempts: 0, avgScore: 0, passRate: 0, retention: 0 },
      premium: { users: 0, attempts: 0, avgScore: 0, passRate: 0, retention: 0 },
      ai: { users: 0, attempts: 0, avgScore: 0, passRate: 0, retention: 0 },
      aluno_ecg: { users: 0, attempts: 0, avgScore: 0, passRate: 0, retention: 0 }
    }

    const subMap = new Map(subscriptions.filter(s => s.status === 'active').map(s => [s.user_id, s.plan]))
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    profiles.forEach(profile => {
      let plan = 'free'
      if (profile.granted_plan) {
        plan = profile.granted_plan
      } else if (subMap.has(profile.id)) {
        plan = subMap.get(profile.id) || 'free'
      }

      if (!segments[plan]) plan = 'free'
      segments[plan].users++

      const userAttempts = filteredAttempts.filter(a => a.user_id === profile.id)
      segments[plan].attempts += userAttempts.length

      if (userAttempts.length > 0) {
        const userAvg = userAttempts.reduce((sum, a) => sum + Number(a.score), 0) / userAttempts.length
        segments[plan].avgScore = (segments[plan].avgScore * (segments[plan].users - 1) + userAvg) / segments[plan].users
        segments[plan].passRate += userAttempts.filter(a => Number(a.score) >= 80).length

        const recentActivity = userAttempts.some(a => new Date(a.created_at) >= thirtyDaysAgo)
        if (recentActivity) segments[plan].retention++
      }
    })

    // Finalize rates
    Object.keys(segments).forEach(plan => {
      if (segments[plan].attempts > 0) {
        segments[plan].passRate = Math.round((segments[plan].passRate / segments[plan].attempts) * 100)
      }
      if (segments[plan].users > 0) {
        segments[plan].retention = Math.round((segments[plan].retention / segments[plan].users) * 100)
        segments[plan].avgScore = Math.round(segments[plan].avgScore)
      }
    })

    return segments
  })()

  // Gamification totals
  const gamificationTotals = {
    totalXP: gamificationStats.reduce((sum, s) => sum + s.total_xp, 0),
    avgLevel: gamificationStats.length > 0
      ? Math.round(gamificationStats.reduce((sum, s) => sum + s.current_level, 0) / gamificationStats.length * 10) / 10
      : 0,
    avgStreak: gamificationStats.length > 0
      ? Math.round(gamificationStats.reduce((sum, s) => sum + s.current_streak, 0) / gamificationStats.length * 10) / 10
      : 0,
    longestStreak: Math.max(...gamificationStats.map(s => s.longest_streak), 0),
    totalPerfectScores: gamificationStats.reduce((sum, s) => sum + s.total_perfect_scores, 0),
  }

  // Achievement stats
  const achievementStats = achievements.map(a => {
    const earned = userAchievements.filter(ua => ua.achievement_id === a.id).length
    return {
      ...a,
      earned,
      percentage: activatedUsers > 0 ? Math.round((earned / activatedUsers) * 100) : 0
    }
  }).sort((a, b) => b.earned - a.earned)

  // Stats by difficulty
  const statsByDifficulty = DIFFICULTIES.map(diff => {
    const diffAttempts = filteredAttempts.filter(a => a.ecgs?.difficulty === diff.value)
    const count = diffAttempts.length
    const avg = count > 0
      ? Math.round(diffAttempts.reduce((sum, a) => sum + Number(a.score), 0) / count)
      : 0
    const pass = count > 0
      ? Math.round((diffAttempts.filter(a => Number(a.score) >= 80).length / count) * 100)
      : 0
    return { ...diff, count, avg, pass }
  })

  // Stats by category
  const statsByCategory = CATEGORIES.map(cat => {
    const catAttempts = filteredAttempts.filter(a => a.ecgs?.category === cat.value)
    const count = catAttempts.length
    const avg = count > 0
      ? Math.round(catAttempts.reduce((sum, a) => sum + Number(a.score), 0) / count)
      : 0
    return { ...cat, count, avg }
  })

  // Activity chart (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return date.toISOString().split('T')[0]
  })

  const attemptsByDay = last7Days.map(day => ({
    day: new Date(day).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' }),
    count: filteredAttempts.filter(a => a.created_at.startsWith(day)).length
  }))

  // Score distribution
  const scoreRanges = [
    { label: '90-100%', min: 90, max: 100, color: 'bg-green-500' },
    { label: '80-89%', min: 80, max: 89, color: 'bg-green-400' },
    { label: '70-79%', min: 70, max: 79, color: 'bg-yellow-400' },
    { label: '60-69%', min: 60, max: 69, color: 'bg-orange-400' },
    { label: '< 60%', min: 0, max: 59, color: 'bg-red-400' },
  ]

  const scoreDistribution = scoreRanges.map(range => {
    const count = filteredAttempts.filter(a => {
      const score = Number(a.score)
      return score >= range.min && score <= range.max
    }).length
    const percentage = totalAttempts > 0 ? Math.round((count / totalAttempts) * 100) : 0
    return { ...range, count, percentage }
  })

  // Export handlers
  const exportFindingsCSV = () => {
    exportTableToCSV(findingPerformance, [
      { key: 'label', label: 'Achado' },
      { key: 'timesExpected', label: 'Vezes Esperado' },
      { key: 'timesMissed', label: 'Vezes Perdido' },
      { key: 'missRate', label: 'Taxa de Erro (%)' },
      { key: 'falsePositives', label: 'Falsos Positivos' },
      { key: 'fpRate', label: 'Taxa FP (%)' }
    ], 'achados_performance')
  }

  const exportUsersCSV = () => {
    const data = Object.entries(userSegmentation).map(([plan, stats]) => ({
      plan: plan === 'ai' ? 'Premium +IA' : plan === 'aluno_ecg' ? 'Aluno ECG' : plan.charAt(0).toUpperCase() + plan.slice(1),
      users: stats.users,
      attempts: stats.attempts,
      avgScore: stats.avgScore,
      passRate: stats.passRate,
      retention: stats.retention
    }))
    exportTableToCSV(data, [
      { key: 'plan', label: 'Plano' },
      { key: 'users', label: 'Usuarios' },
      { key: 'attempts', label: 'Tentativas' },
      { key: 'avgScore', label: 'Media (%)' },
      { key: 'passRate', label: 'Aprovacao (%)' },
      { key: 'retention', label: 'Retencao 30d (%)' }
    ], 'segmentacao_usuarios')
  }

  const exportECGCalibrationCSV = () => {
    exportTableToCSV(ecgCalibration, [
      { key: 'title', label: 'ECG' },
      { key: 'difficulty', label: 'Dificuldade' },
      { key: 'attempts', label: 'Tentativas' },
      { key: 'expectedPassRate', label: 'Aprovacao Esperada (%)' },
      { key: 'actualPassRate', label: 'Aprovacao Real (%)' },
      { key: 'delta', label: 'Delta (%)' }
    ], 'calibracao_ecgs')
  }

  const exportDifficultyCSV = () => {
    exportTableToCSV(statsByDifficulty, [
      { key: 'label', label: 'Dificuldade' },
      { key: 'count', label: 'Tentativas' },
      { key: 'avg', label: 'Media (%)' },
      { key: 'pass', label: 'Aprovacao (%)' }
    ], 'desempenho_dificuldade')
  }

  const exportCategoryCSV = () => {
    exportTableToCSV(statsByCategory, [
      { key: 'label', label: 'Categoria' },
      { key: 'count', label: 'Tentativas' },
      { key: 'avg', label: 'Media (%)' }
    ], 'desempenho_categoria')
  }

  const exportGamificationCSV = () => {
    exportTableToCSV(gamificationStats, [
      { key: 'user_id', label: 'User ID' },
      { key: 'total_xp', label: 'XP Total' },
      { key: 'current_level', label: 'Nivel' },
      { key: 'current_streak', label: 'Streak Atual' },
      { key: 'longest_streak', label: 'Maior Streak' },
      { key: 'total_ecgs_completed', label: 'ECGs Completados' },
      { key: 'total_perfect_scores', label: 'Scores Perfeitos' }
    ], 'gamificacao_usuarios')
  }

  const exportAchievementsCSV = () => {
    exportTableToCSV(achievementStats, [
      { key: 'name_pt', label: 'Conquista' },
      { key: 'earned', label: 'Usuarios com Conquista' },
      { key: 'percentage', label: '% dos Usuarios Ativos' }
    ], 'conquistas_stats')
  }

  const exportAdminStatsCSV = () => {
    exportTableToCSV(adminStats, [
      { key: 'name', label: 'Admin' },
      { key: 'ecgCount', label: 'ECGs Enviados' },
      { key: 'withReport', label: 'Com Laudo' },
      { key: 'totalAttempts', label: 'Tentativas' },
      { key: 'avgScore', label: 'Media de Acerto (%)' }
    ], 'contribuicoes_admins')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header with filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Avancado</h1>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date Range Filter */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-600" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todo o periodo</option>
              <option value="7d">Ultimos 7 dias</option>
              <option value="30d">Ultimos 30 dias</option>
              <option value="90d">Ultimos 90 dias</option>
              <option value="year">Este ano</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>

          {dateRange === 'custom' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-500">ate</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Admin Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-600" />
            <select
              value={selectedAdmin}
              onChange={(e) => setSelectedAdmin(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os Admins</option>
              {adminStats.map(admin => (
                <option key={admin.adminId} value={admin.adminId}>
                  {admin.name} ({admin.ecgCount} ECGs)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-700">Total Tentativas</p>
                <p className="text-2xl font-bold text-gray-900">{totalAttempts.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-700">Media Geral</p>
                <p className="text-2xl font-bold text-gray-900">{avgScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-700">Taxa Aprovacao</p>
                <p className="text-2xl font-bold text-gray-900">{passRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-700">ECGs Cadastrados</p>
                <p className="text-2xl font-bold text-gray-900">{totalECGs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Engagement Funnel */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Funil de Engajamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { label: 'Usuarios Registrados', value: totalUsers, color: 'bg-blue-500' },
              { label: 'Usuarios Ativados (1+ ECG)', value: activatedUsers, color: 'bg-green-500' },
              { label: 'Usuarios Engajados (5+ ECGs)', value: engagedUsers, color: 'bg-purple-500' },
              { label: 'Retidos (ativos 30d)', value: retainedUsers, color: 'bg-orange-500' },
            ].map((step, i) => {
              const percentage = totalUsers > 0 ? Math.round((step.value / totalUsers) * 100) : 0
              return (
                <div key={step.label} className="flex items-center gap-4">
                  <span className="w-48 text-sm text-gray-700">{step.label}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                    <div
                      className={`h-full ${step.color} transition-all duration-500 flex items-center justify-end pr-2`}
                      style={{ width: `${percentage}%` }}
                    >
                      {percentage >= 10 && (
                        <span className="text-xs text-white font-medium">{percentage}%</span>
                      )}
                    </div>
                  </div>
                  <span className="w-20 text-sm text-gray-900 font-medium text-right">
                    {step.value.toLocaleString()}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* User Segmentation */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Segmentacao por Plano
          </CardTitle>
          <button
            onClick={exportUsersCSV}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Download className="h-4 w-4" />
            CSV
          </button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Plano</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Usuarios</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Tentativas</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Media</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Aprovacao</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Retencao 30d</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(userSegmentation).map(([plan, stats]) => (
                  <tr key={plan} className="border-b">
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {plan === 'ai' ? 'Premium +IA' : plan === 'aluno_ecg' ? 'Aluno ECG' : plan.charAt(0).toUpperCase() + plan.slice(1)}
                    </td>
                    <td className="py-3 px-4 text-gray-700">{stats.users.toLocaleString()}</td>
                    <td className="py-3 px-4 text-gray-700">{stats.attempts.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                        stats.avgScore >= 80 ? 'bg-green-100 text-green-700' :
                        stats.avgScore >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {stats.avgScore}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{stats.passRate}%</td>
                    <td className="py-3 px-4 text-gray-700">{stats.retention}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Finding Performance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Achados Mais Problematicos
          </CardTitle>
          <button
            onClick={exportFindingsCSV}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Download className="h-4 w-4" />
            CSV
          </button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Achado</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Vezes Esperado</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Vezes Perdido</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Taxa Erro</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Falsos Positivos</th>
                </tr>
              </thead>
              <tbody>
                {findingPerformance.slice(0, 15).map((fp) => (
                  <tr key={fp.finding} className="border-b">
                    <td className="py-3 px-4 font-medium text-gray-900">{fp.label}</td>
                    <td className="py-3 px-4 text-gray-700">{fp.timesExpected}</td>
                    <td className="py-3 px-4 text-gray-700">{fp.timesMissed}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                        fp.missRate >= 50 ? 'bg-red-100 text-red-700' :
                        fp.missRate >= 30 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {fp.missRate}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{fp.falsePositives}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ECG Mislabeled Detection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Easier than expected */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              ECGs Mais Faceis que o Esperado
            </CardTitle>
          </CardHeader>
          <CardContent>
            {easierThanExpected.length > 0 ? (
              <div className="space-y-3">
                {easierThanExpected.map((ecg) => (
                  <div key={ecg.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{ecg.title}</p>
                      <p className="text-sm text-gray-600">
                        Marcado: {ecg.difficulty} | {ecg.attempts} tentativas
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">+{ecg.delta}%</p>
                      <p className="text-xs text-gray-500">
                        {ecg.actualPassRate}% vs {ecg.expectedPassRate}% esperado
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Nenhum ECG com desvio significativo</p>
            )}
          </CardContent>
        </Card>

        {/* Harder than expected */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              ECGs Mais Dificeis que o Esperado
            </CardTitle>
          </CardHeader>
          <CardContent>
            {harderThanExpected.length > 0 ? (
              <div className="space-y-3">
                {harderThanExpected.map((ecg) => (
                  <div key={ecg.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{ecg.title}</p>
                      <p className="text-sm text-gray-600">
                        Marcado: {ecg.difficulty} | {ecg.attempts} tentativas
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-600">{ecg.delta}%</p>
                      <p className="text-xs text-gray-500">
                        {ecg.actualPassRate}% vs {ecg.expectedPassRate}% esperado
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Nenhum ECG com desvio significativo</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Full ECG Calibration Export */}
      <div className="flex justify-end">
        <button
          onClick={exportECGCalibrationCSV}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <Download className="h-4 w-4" />
          Exportar Calibracao Completa (CSV)
        </button>
      </div>

      {/* Gamification Stats */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Gamificacao
          </CardTitle>
          <button
            onClick={exportGamificationCSV}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Download className="h-4 w-4" />
            CSV
          </button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="p-4 bg-purple-50 rounded-lg text-center">
              <Zap className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-900">{gamificationTotals.totalXP.toLocaleString()}</p>
              <p className="text-xs text-purple-600">XP Total</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <Award className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-900">{gamificationTotals.avgLevel}</p>
              <p className="text-xs text-blue-600">Nivel Medio</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg text-center">
              <Flame className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-900">{gamificationTotals.avgStreak}</p>
              <p className="text-xs text-orange-600">Streak Medio</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg text-center">
              <Flame className="h-6 w-6 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-900">{gamificationTotals.longestStreak}</p>
              <p className="text-xs text-red-600">Maior Streak</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <Trophy className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-900">{gamificationTotals.totalPerfectScores}</p>
              <p className="text-xs text-green-600">Scores Perfeitos</p>
            </div>
          </div>

          {/* Achievement Stats */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Conquistas Mais Obtidas</h4>
              <button
                onClick={exportAchievementsCSV}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                <Download className="h-3 w-3" />
                CSV
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {achievementStats.slice(0, 8).map((a) => (
                <div key={a.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="font-medium text-yellow-900 text-sm">{a.name_pt}</p>
                  <p className="text-xs text-yellow-700">{a.earned} usuarios ({a.percentage}%)</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Contributions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Contribuicoes por Admin
          </CardTitle>
          <button
            onClick={exportAdminStatsCSV}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Download className="h-4 w-4" />
            CSV
          </button>
        </CardHeader>
        <CardContent>
          {adminStats.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Admin</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">ECGs</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Com Laudo</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Tentativas</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Media</th>
                  </tr>
                </thead>
                <tbody>
                  {adminStats.map((admin) => (
                    <tr
                      key={admin.adminId}
                      className={`border-b hover:bg-gray-50 cursor-pointer ${selectedAdmin === admin.adminId ? 'bg-blue-50' : ''}`}
                      onClick={() => setSelectedAdmin(selectedAdmin === admin.adminId ? 'all' : admin.adminId)}
                    >
                      <td className="py-3 px-4 font-medium text-gray-900">{admin.name}</td>
                      <td className="py-3 px-4 text-gray-700">{admin.ecgCount}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                          admin.withReport === admin.ecgCount ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {admin.withReport}/{admin.ecgCount}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{admin.totalAttempts}</td>
                      <td className="py-3 px-4">
                        {admin.totalAttempts > 0 ? (
                          <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                            admin.avgScore >= 80 ? 'bg-green-100 text-green-700' :
                            admin.avgScore >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {Math.round(admin.avgScore)}%
                          </span>
                        ) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Nenhum ECG cadastrado</p>
          )}
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Distribuicao de Notas
            </CardTitle>
            <button
              onClick={() => exportChartToPNG('score-distribution-chart', 'distribuicao_notas')}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              <Download className="h-3 w-3" />
              PNG
            </button>
          </CardHeader>
          <CardContent>
            <div id="score-distribution-chart" className="space-y-3 p-4 bg-white">
              {scoreDistribution.map((range) => (
                <div key={range.label} className="flex items-center gap-3">
                  <span className="w-20 text-sm text-gray-700">{range.label}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className={`h-full ${range.color} transition-all duration-500`}
                      style={{ width: `${range.percentage}%` }}
                    />
                  </div>
                  <span className="w-20 text-sm text-gray-700 text-right">
                    {range.count} ({range.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Atividade (7 dias)
            </CardTitle>
            <button
              onClick={() => exportChartToPNG('activity-chart', 'atividade_7dias')}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              <Download className="h-3 w-3" />
              PNG
            </button>
          </CardHeader>
          <CardContent>
            <div id="activity-chart" className="flex items-end justify-between h-40 gap-2 p-4 bg-white">
              {attemptsByDay.map((day, i) => {
                const maxCount = Math.max(...attemptsByDay.map(d => d.count), 1)
                const height = (day.count / maxCount) * 100
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col justify-end h-32">
                      <div
                        className="w-full bg-blue-500 rounded-t transition-all duration-500"
                        style={{ height: `${height}%`, minHeight: day.count > 0 ? '8px' : '0' }}
                      />
                    </div>
                    <span className="text-xs text-gray-600">{day.day}</span>
                    <span className="text-xs font-medium text-gray-900">{day.count}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Difficulty */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Por Dificuldade</CardTitle>
            <button
              onClick={exportDifficultyCSV}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              <Download className="h-3 w-3" />
              CSV
            </button>
          </CardHeader>
          <CardContent>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Dificuldade</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Tentativas</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Media</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Aprovacao</th>
                </tr>
              </thead>
              <tbody>
                {statsByDifficulty.map((stat) => (
                  <tr key={stat.value} className="border-b">
                    <td className="py-2 px-3 font-medium text-gray-900">{stat.label}</td>
                    <td className="py-2 px-3 text-gray-700">{stat.count}</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        stat.avg >= 80 ? 'bg-green-100 text-green-700' :
                        stat.avg >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {stat.avg}%
                      </span>
                    </td>
                    <td className="py-2 px-3 text-gray-700">{stat.pass}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* By Category */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Por Categoria</CardTitle>
            <button
              onClick={exportCategoryCSV}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              <Download className="h-3 w-3" />
              CSV
            </button>
          </CardHeader>
          <CardContent>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Categoria</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Tentativas</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Media</th>
                </tr>
              </thead>
              <tbody>
                {statsByCategory.map((stat) => (
                  <tr key={stat.value} className="border-b">
                    <td className="py-2 px-3 font-medium text-gray-900">{stat.label}</td>
                    <td className="py-2 px-3 text-gray-700">{stat.count}</td>
                    <td className="py-2 px-3">
                      {stat.count > 0 ? (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          stat.avg >= 80 ? 'bg-green-100 text-green-700' :
                          stat.avg >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {stat.avg}%
                        </span>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
