import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { TrendingUp, Target, Clock, Award, BarChart3, PieChart } from 'lucide-react'
import { DIFFICULTIES, CATEGORIES, FINDINGS } from '@/lib/ecg-constants'

export const dynamic = 'force-dynamic'

export default async function AdminAnalyticsPage() {
  const supabase = await createClient()

  // Get all attempts with related data
  const { data: attemptsData } = await supabase
    .from('attempts')
    .select('*, ecgs(difficulty, category)')
    .order('created_at', { ascending: false })

  type AttemptWithECG = {
    id: string
    score: number
    findings: string[]
    created_at: string
    ecgs: { difficulty: string; category: string } | null
  }

  const attempts = attemptsData as AttemptWithECG[] | null

  // Calculate overall stats
  const totalAttempts = attempts?.length || 0
  const avgScore = totalAttempts > 0
    ? Math.round(attempts!.reduce((sum, a) => sum + Number(a.score), 0) / totalAttempts)
    : 0
  const passRate = totalAttempts > 0
    ? Math.round((attempts!.filter(a => Number(a.score) >= 80).length / totalAttempts) * 100)
    : 0

  // Calculate stats by difficulty
  const statsByDifficulty = DIFFICULTIES.map(diff => {
    const diffAttempts = attempts?.filter(a => a.ecgs?.difficulty === diff.value) || []
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
    const catAttempts = attempts?.filter(a => a.ecgs?.category === cat.value) || []
    const count = catAttempts.length
    const avg = count > 0
      ? Math.round(catAttempts.reduce((sum, a) => sum + Number(a.score), 0) / count)
      : 0
    return { ...cat, count, avg }
  })

  // Calculate most missed findings
  const findingMisses = new Map<string, number>()
  attempts?.forEach(attempt => {
    // Count findings that weren't selected (simplified - would need official report comparison for accurate data)
  })

  // Get attempts over time (last 7 days)
  const now = new Date()
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now)
    date.setDate(date.getDate() - (6 - i))
    return date.toISOString().split('T')[0]
  })

  const attemptsByDay = last7Days.map(day => {
    const count = attempts?.filter(a => a.created_at.startsWith(day)).length || 0
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
    const count = attempts?.filter(a => {
      const score = Number(a.score)
      return score >= range.min && score <= range.max
    }).length || 0
    const percentage = totalAttempts > 0 ? Math.round((count / totalAttempts) * 100) : 0
    return { ...range, count, percentage }
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Analytics</h1>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total de Tentativas</p>
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
                <p className="text-sm text-gray-600">Média Geral</p>
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
                <p className="text-sm text-gray-600">Taxa de Aprovação</p>
                <p className="text-2xl font-bold text-gray-900">{passRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Award className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Nota para Aprovação</p>
                <p className="text-2xl font-bold text-gray-900">80%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Distribuição de Notas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scoreDistribution.map((range) => (
                <div key={range.label} className="flex items-center gap-3">
                  <span className="w-20 text-sm text-gray-600">{range.label}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className={`h-full ${range.color} transition-all duration-500`}
                      style={{ width: `${range.percentage}%` }}
                    />
                  </div>
                  <span className="w-16 text-sm text-gray-600 text-right">
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
              Atividade (Últimos 7 dias)
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
                    <span className="text-xs text-gray-500">{day.day}</span>
                    <span className="text-xs font-medium">{day.count}</span>
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
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Dificuldade</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Tentativas</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Média</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Aprovação</th>
                  </tr>
                </thead>
                <tbody>
                  {statsByDifficulty.map((stat) => (
                    <tr key={stat.value} className="border-b">
                      <td className="py-3 px-4 font-medium text-gray-900">{stat.label}</td>
                      <td className="py-3 px-4 text-gray-600">{stat.count}</td>
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
                      <td className="py-3 px-4 text-gray-600">{stat.pass}%</td>
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
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Categoria</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Tentativas</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Média</th>
                  </tr>
                </thead>
                <tbody>
                  {statsByCategory.map((stat) => (
                    <tr key={stat.value} className="border-b">
                      <td className="py-3 px-4 font-medium text-gray-900">{stat.label}</td>
                      <td className="py-3 px-4 text-gray-600">{stat.count}</td>
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
                          <span className="text-gray-400">-</span>
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
