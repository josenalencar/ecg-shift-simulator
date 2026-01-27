'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { getUserStats, getXPLeaderboard, xpProgressToNextLevel } from '@/lib/gamification'
import type { UserGamificationStats, GamificationConfig } from '@/types/database'
import { Flame, Star, Trophy, TrendingUp, ChevronRight, Medal } from 'lucide-react'

interface DashboardWidgetProps {
  userId: string
}

export function DashboardWidget({ userId }: DashboardWidgetProps) {
  const [stats, setStats] = useState<UserGamificationStats | null>(null)
  const [rank, setRank] = useState<number | null>(null)
  const [percentile, setPercentile] = useState<number>(0)
  const [isInTopN, setIsInTopN] = useState(false)
  const [config, setConfig] = useState<GamificationConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [achievementCount, setAchievementCount] = useState(0)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()

      // Load user stats
      const userStats = await getUserStats(userId, supabase)
      setStats(userStats)

      // Load leaderboard info
      const leaderboard = await getXPLeaderboard(userId, supabase)
      setRank(leaderboard.userRank)
      setPercentile(leaderboard.userPercentile)
      setIsInTopN(leaderboard.isInTopN)
      setConfig(leaderboard.config)

      // Load achievement count
      const { count } = await supabase
        .from('user_achievements')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      setAchievementCount(count || 0)

      setLoading(false)
    }

    loadData()
  }, [userId])

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats || !config) {
    return null
  }

  const xpProgress = xpProgressToNextLevel(stats.total_xp, config)

  return (
    <Card className="border-2 border-blue-100 hover:border-blue-200 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Seu Progresso
          </CardTitle>
          <Link
            href="/progress"
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Ver mais
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Level & XP */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-100 rounded-full">
                <Star className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Nivel</p>
                <p className="text-lg font-bold text-purple-700">{stats.current_level}</p>
              </div>
            </div>
            {/* XP Progress Bar */}
            <div className="space-y-1">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${xpProgress.percentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">
                {xpProgress.currentXP.toLocaleString()} / {xpProgress.requiredXP.toLocaleString()} XP
              </p>
            </div>
          </div>

          {/* Streak */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-orange-100 rounded-full">
              <Flame className="h-4 w-4 text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Streak</p>
              <p className="text-lg font-bold text-orange-600">
                {stats.current_streak} dia{stats.current_streak !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Ranking */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-yellow-100 rounded-full">
              <Medal className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Ranking</p>
              <p className="text-lg font-bold text-yellow-700">
                {isInTopN && rank ? (
                  <>#{rank}</>
                ) : (
                  <>Top {percentile}%</>
                )}
              </p>
            </div>
          </div>

          {/* Achievements */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-green-100 rounded-full">
              <Trophy className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Conquistas</p>
              <p className="text-lg font-bold text-green-700">
                {achievementCount}<span className="text-sm font-normal text-gray-500">/100</span>
              </p>
            </div>
          </div>
        </div>

        {/* Total XP */}
        <div className="mt-4 pt-3 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            XP Total: <span className="font-semibold text-gray-700">{stats.total_xp.toLocaleString()}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default DashboardWidget
