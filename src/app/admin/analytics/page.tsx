'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { TrendingUp, Target, Clock, Award, BarChart3, PieChart, Users, FileText, Filter } from 'lucide-react'
import { DIFFICULTIES, CATEGORIES } from '@/lib/ecg-constants'

type AttemptWithECG = {
  id: string
  score: number
  findings: string[]
  created_at: string
  ecg_id: string
  ecgs: { difficulty: string; category: string; created_by: string | null } | null
}

type ECGWithCreator = {
  id: string
  created_by: string | null
  official_reports: { id: string } | null
  profiles: { id: string; full_name: string | null; email: string } | null
}

type AdminStat = {
  adminId: string
  name: string
  ecgCount: number
  withReport: number
  avgScore: number
  totalAttempts: number
}

export default function AdminAnalyticsPage() {
  const [attempts, setAttempts] = useState<AttemptWithECG[]>([])
  const [ecgsWithCreators, setEcgsWithCreators] = useState<ECGWithCreator[]>([])
  const [adminStats, setAdminStats] = useState<AdminStat[]>([])
  const [selectedAdmin, setSelectedAdmin] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      // Get all attempts with related data
      const { data: attemptsData } = await supabase
        .from('attempts')
        .select('*, ecgs(difficulty, category, created_by)')
        .order('created_at', { ascending: false })

      const loadedAttempts = (attemptsData || []) as AttemptWithECG[]
      setAttempts(loadedAttempts)

      // Get ECGs with creator info for admin contributions
      const { data: ecgsData } = await supabase
        .from('ecgs')
        .select('id, created_by, official_reports(id), profiles!ecgs_created_by_fkey(id, full_name, email)')

      const loadedEcgs = (ecgsData || []) as ECGWithCreator[]
      setEcgsWithCreators(loadedEcgs)

      // Calculate admin stats with average scores
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

      // Calculate average scores per admin based on attempts on their ECGs
      loadedAttempts.forEach(attempt => {
        const ecgCreator = attempt.ecgs?.created_by
        if (ecgCreator && adminContributions.has(ecgCreator)) {
          const adminStat = adminContributions.get(ecgCreator)!
          adminStat.totalAttempts++
          adminStat.avgScore = (adminStat.avgScore * (adminStat.totalAttempts - 1) + Number(attempt.score)) / adminStat.totalAttempts
        }
      })

      const stats = Array.from(adminContributions.values())
        .sort((a, b) => b.ecgCount - a.ecgCount)
      setAdminStats(stats)

      setLoading(false)
    }

    loadData()
  }, [supabase])

  // Filter attempts based on selected admin
  const filteredAttempts = selectedAdmin === 'all'
    ? attempts
    : attempts.filter(a => a.ecgs?.created_by === selectedAdmin)

  // Calculate overall stats
  const totalAttempts = filteredAttempts.length
  const avgScore = totalAttempts > 0
    ? Math.round(filteredAttempts.reduce((sum, a) => sum + Number(a.score), 0) / totalAttempts)
    : 0
  const passRate = totalAttempts > 0
    ? Math.round((filteredAttempts.filter(a => Number(a.score) >= 80).length / totalAttempts) * 100)
    : 0

  // Filter ECGs based on selected admin
  const filteredEcgs = selectedAdmin === 'all'
    ? ecgsWithCreators
    : ecgsWithCreators.filter(e => e.created_by === selectedAdmin)

  const totalECGs = filteredEcgs.length
  const ecgsWithReports = filteredEcgs.filter(e => e.official_reports).length

  // Calculate stats by difficulty
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

  // Calculate stats by category
  const statsByCategory = CATEGORIES.map(cat => {
    const catAttempts = filteredAttempts.filter(a => a.ecgs?.category === cat.value)
    const count = catAttempts.length
    const avg = count > 0
      ? Math.round(catAttempts.reduce((sum, a) => sum + Number(a.score), 0) / count)
      : 0
    return { ...cat, count, avg }
  })

  // Get attempts over time (last 7 days)
  const now = new Date()
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now)
    date.setDate(date.getDate() - (6 - i))
    return date.toISOString().split('T')[0]
  })

  const attemptsByDay = last7Days.map(day => {
    const count = filteredAttempts.filter(a => a.created_at.startsWith(day)).length
    return { day: new Date(day).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' }), count }
  })

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>

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

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-700">Total de Tentativas</p>
                <p className="text-2xl font-bold text-gray-900">{totalAttempts}</p>
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
                <p className="text-sm text-gray-700">Taxa de Aprovacao</p>
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

      {/* Admin Contributions with Average Scores */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Contribuicoes e Desempenho por Admin
          </CardTitle>
        </CardHeader>
        <CardContent>
          {adminStats.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Admin</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">ECGs Enviados</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Com Laudo</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Tentativas</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Media de Acerto</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">% do Total</th>
                  </tr>
                </thead>
                <tbody>
                  {adminStats.map((admin) => (
                    <tr
                      key={admin.adminId}
                      className={`border-b hover:bg-gray-50 cursor-pointer ${selectedAdmin === admin.adminId ? 'bg-blue-50' : ''}`}
                      onClick={() => setSelectedAdmin(selectedAdmin === admin.adminId ? 'all' : admin.adminId)}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-sm">
                              {admin.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">{admin.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-2xl font-bold text-gray-900">{admin.ecgCount}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                          admin.withReport === admin.ecgCount
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {admin.withReport} / {admin.ecgCount}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-900 font-medium">{admin.totalAttempts}</span>
                      </td>
                      <td className="py-3 px-4">
                        {admin.totalAttempts > 0 ? (
                          <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                            admin.avgScore >= 80
                              ? 'bg-green-100 text-green-700'
                              : admin.avgScore >= 60
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                          }`}>
                            {Math.round(admin.avgScore)}%
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 w-24">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${ecgsWithCreators.length > 0 ? (admin.ecgCount / ecgsWithCreators.length) * 100 : 0}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-700">
                            {ecgsWithCreators.length > 0 ? Math.round((admin.ecgCount / ecgsWithCreators.length) * 100) : 0}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">Nenhum ECG cadastrado ainda</p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Distribuicao de Notas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scoreDistribution.map((range) => (
                <div key={range.label} className="flex items-center gap-3">
                  <span className="w-20 text-sm text-gray-700">{range.label}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className={`h-full ${range.color} transition-all duration-500`}
                      style={{ width: `${range.percentage}%` }}
                    />
                  </div>
                  <span className="w-16 text-sm text-gray-700 text-right">
                    {range.count} ({range.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Atividade (Ultimos 7 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between h-40 gap-2">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stats by Difficulty */}
        <Card>
          <CardHeader>
            <CardTitle>Desempenho por Dificuldade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Dificuldade</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Tentativas</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Media</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Aprovacao</th>
                  </tr>
                </thead>
                <tbody>
                  {statsByDifficulty.map((stat) => (
                    <tr key={stat.value} className="border-b">
                      <td className="py-3 px-4 font-medium text-gray-900">{stat.label}</td>
                      <td className="py-3 px-4 text-gray-700">{stat.count}</td>
                      <td className="py-3 px-4">
                        <span className={`
                          px-2 py-1 rounded-full text-sm font-medium
                          ${stat.avg >= 80
                            ? 'bg-green-100 text-green-700'
                            : stat.avg >= 60
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }
                        `}>
                          {stat.avg}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{stat.pass}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Stats by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Desempenho por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Categoria</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Tentativas</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Media</th>
                  </tr>
                </thead>
                <tbody>
                  {statsByCategory.map((stat) => (
                    <tr key={stat.value} className="border-b">
                      <td className="py-3 px-4 font-medium text-gray-900">{stat.label}</td>
                      <td className="py-3 px-4 text-gray-700">{stat.count}</td>
                      <td className="py-3 px-4">
                        {stat.count > 0 ? (
                          <span className={`
                            px-2 py-1 rounded-full text-sm font-medium
                            ${stat.avg >= 80
                              ? 'bg-green-100 text-green-700'
                              : stat.avg >= 60
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }
                          `}>
                            {stat.avg}%
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
