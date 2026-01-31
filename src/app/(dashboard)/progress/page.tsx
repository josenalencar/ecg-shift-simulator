'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import {
  getUserStats,
  getXPLeaderboard,
  getAchievementsWithProgress,
} from '@/lib/gamification'
import {
  ProgressHeader,
  AchievementGrid,
  LeaderboardXP,
  StreakDisplay,
  XPEventBanner,
} from '@/components/gamification'
import type { UserGamificationStats, GamificationConfig, AchievementWithProgress } from '@/types/database'
import { Loader2, Trophy, Medal, Activity, Target, List, X } from 'lucide-react'
import { Button } from '@/components/ui'
import * as LucideIcons from 'lucide-react'

export default function ProgressPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>('')
  const [stats, setStats] = useState<UserGamificationStats | null>(null)
  const [config, setConfig] = useState<GamificationConfig | null>(null)
  const [achievements, setAchievements] = useState<AchievementWithProgress[]>([])
  const [rank, setRank] = useState<number | null>(null)
  const [percentile, setPercentile] = useState<number>(0)
  const [isInTopN, setIsInTopN] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'leaderboard'>('overview')
  const [showAchievementList, setShowAchievementList] = useState(false)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUserId(user.id)

      // Get user's name from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()
      if (profile?.full_name) {
        setUserName(profile.full_name)
      }

      // First, check and award any pending achievements (server-side)
      // This ensures users get achievements they've earned but weren't awarded due to previous bugs
      try {
        await fetch('/api/gamification/check-achievements', { method: 'POST' })
      } catch (error) {
        console.error('Failed to check achievements:', error)
        // Continue loading even if achievement check fails
      }

      // Load all data in parallel (achievements will now include any newly awarded ones)
      const [userStats, leaderboard, achievementsData] = await Promise.all([
        getUserStats(user.id, supabase),
        getXPLeaderboard(user.id, supabase),
        getAchievementsWithProgress(user.id, supabase),
      ])

      setStats(userStats)
      setConfig(leaderboard.config)
      setRank(leaderboard.userRank)
      setPercentile(leaderboard.userPercentile)
      setIsInTopN(leaderboard.isInTopN)
      setAchievements(achievementsData)
      setLoading(false)
    }

    loadData()
  }, [router])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Carregando seu progresso...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!stats || !config || !userId) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600">Erro ao carregar dados. Por favor, tente novamente.</p>
        </div>
      </div>
    )
  }

  const earnedCount = achievements.filter((a) => a.earned).length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* XP Event Banner */}
      <XPEventBanner userId={userId} />

      {/* Progress Header */}
      <ProgressHeader
        stats={stats}
        config={config}
        rank={rank}
        percentile={percentile}
        isInTopN={isInTopN}
        achievementCount={earnedCount}
        userName={userName}
      />

      {/* Tab Navigation */}
      <div className="mt-8 border-b border-gray-200">
        <nav className="-mb-px flex gap-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
              ${activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <Activity className="h-4 w-4" />
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
              ${activeTab === 'achievements'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <Trophy className="h-4 w-4" />
            Conquistas ({earnedCount}/100)
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
              ${activeTab === 'leaderboard'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <Medal className="h-4 w-4" />
            Ranking
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        {activeTab === 'overview' && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Streak */}
            <StreakDisplay stats={stats} showCalendar={true} />

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  Estatísticas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* ECGs by Difficulty */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">ECGs por Dificuldade</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Fácil</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{
                              width: `${Math.min(100, (stats.ecgs_by_difficulty.easy / Math.max(1, stats.total_ecgs_completed)) * 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700 w-8">
                          {stats.ecgs_by_difficulty.easy}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Médio</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-500 h-2 rounded-full"
                            style={{
                              width: `${Math.min(100, (stats.ecgs_by_difficulty.medium / Math.max(1, stats.total_ecgs_completed)) * 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700 w-8">
                          {stats.ecgs_by_difficulty.medium}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Difícil</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-red-500 h-2 rounded-full"
                            style={{
                              width: `${Math.min(100, (stats.ecgs_by_difficulty.hard / Math.max(1, stats.total_ecgs_completed)) * 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700 w-8">
                          {stats.ecgs_by_difficulty.hard}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Perfect Score Rate */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Taxa de Acerto Perfeito</span>
                    <span className="text-lg font-bold text-green-600">
                      {stats.total_ecgs_completed > 0
                        ? Math.round((stats.total_perfect_scores / stats.total_ecgs_completed) * 100)
                        : 0}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.total_perfect_scores} de {stats.total_ecgs_completed} ECGs
                  </p>
                </div>

                {/* Current Perfect Streak */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Sequência de Perfeitos</span>
                    <span className="text-lg font-bold text-purple-600">
                      {stats.perfect_streak}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Acertos perfeitos consecutivos
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Conquistas Recentes
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAchievementList(true)}
                  >
                    <List className="h-4 w-4 mr-2" />
                    Lista de Conquistas
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {achievements
                    .filter((a) => a.earned)
                    .sort((a, b) => {
                      if (!a.earned_at || !b.earned_at) return 0
                      return new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime()
                    })
                    .slice(0, 6)
                    .map((achievement) => (
                      <div key={achievement.id}>
                        {/* Inline achievement display */}
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="p-2 bg-yellow-100 rounded-full">
                            <Trophy className="h-4 w-4 text-yellow-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {achievement.name_pt}
                            </p>
                            <p className="text-xs text-gray-500">
                              {achievement.earned_at && new Date(achievement.earned_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
                {achievements.filter((a) => a.earned).length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    Nenhuma conquista ainda. Continue praticando!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'achievements' && (
          <AchievementGrid achievements={achievements} />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardXP userId={userId} limit={20} showUserPosition={true} />
        )}
      </div>

      {/* Achievement List Modal */}
      {showAchievementList && (
        <AchievementListModal
          achievements={achievements}
          onClose={() => setShowAchievementList(false)}
        />
      )}
    </div>
  )
}

// Category labels for grouping
const CATEGORY_LABELS: Record<string, string> = {
  ecg_count: 'Quantidade de ECGs',
  diagnosis: 'Diagnósticos',
  streak: 'Sequência',
  perfect: 'Pontuação Perfeita',
  level: 'Nível',
  special: 'Especiais',
  hospital: 'Hospital',
  pediatric: 'Pediatria',
}

// Helper to get icon component from name
function getIconComponent(iconName: string): React.ComponentType<{ className?: string }> {
  const pascalName = iconName
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = (LucideIcons as any)[pascalName]
  return IconComponent || LucideIcons.Award
}

// Achievement List Modal Component
function AchievementListModal({
  achievements,
  onClose,
}: {
  achievements: AchievementWithProgress[]
  onClose: () => void
}) {
  // Group achievements by category
  const categories = [...new Set(achievements.map((a) => a.category))]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Lista de Conquistas</h2>
            <p className="text-sm text-gray-500 mt-1">
              Todas as conquistas disponíveis e como obtê-las
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {categories.map((category) => {
            const categoryAchievements = achievements.filter((a) => a.category === category)
            if (categoryAchievements.length === 0) return null

            return (
              <div key={category}>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                  {CATEGORY_LABELS[category] || category}
                </h3>
                <div className="space-y-2">
                  {categoryAchievements.map((achievement) => {
                    const Icon = getIconComponent(achievement.icon)
                    return (
                      <div
                        key={achievement.id}
                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="p-2 bg-yellow-100 rounded-full flex-shrink-0">
                          <Icon className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">
                            {achievement.name_pt}
                          </p>
                          <p className="text-sm text-gray-600 mt-0.5">
                            {achievement.description_pt}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <Button
            variant="outline"
            className="w-full"
            onClick={onClose}
          >
            Fechar
          </Button>
        </div>
      </div>
    </div>
  )
}
