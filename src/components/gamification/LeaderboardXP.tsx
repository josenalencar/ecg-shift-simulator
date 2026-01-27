'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { getXPLeaderboard } from '@/lib/gamification'
import type { UserGamificationStats, GamificationConfig } from '@/types/database'
import { Medal, Crown, TrendingUp } from 'lucide-react'

interface LeaderboardXPProps {
  userId: string
  limit?: number
  showUserPosition?: boolean
}

interface LeaderboardEntry extends UserGamificationStats {
  rank: number
  profiles: {
    full_name: string | null
    email: string
  }
}

const RANK_STYLES = [
  { icon: Crown, iconColor: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  { icon: Medal, iconColor: 'text-gray-400', bg: 'bg-gray-50', border: 'border-gray-200' },
  { icon: Medal, iconColor: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
]

export function LeaderboardXP({ userId, limit = 10, showUserPosition = true }: LeaderboardXPProps) {
  const [topUsers, setTopUsers] = useState<LeaderboardEntry[]>([])
  const [userRank, setUserRank] = useState<number | null>(null)
  const [userTotalXP, setUserTotalXP] = useState<number>(0)
  const [userPercentile, setUserPercentile] = useState<number>(0)
  const [isInTopN, setIsInTopN] = useState(false)
  const [totalUsers, setTotalUsers] = useState<number>(0)
  const [config, setConfig] = useState<GamificationConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadLeaderboard() {
      const supabase = createClient()
      const result = await getXPLeaderboard(userId, supabase, limit)

      setTopUsers(result.topUsers)
      setUserRank(result.userRank)
      setUserTotalXP(result.userTotalXP)
      setUserPercentile(result.userPercentile)
      setIsInTopN(result.isInTopN)
      setTotalUsers(result.totalUsers)
      setConfig(result.config)
      setLoading(false)
    }

    loadLeaderboard()
  }, [userId, limit])

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4 ml-auto"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Ranking por XP
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topUsers.map((user, index) => {
            const isCurrentUser = user.user_id === userId
            const rankStyle = RANK_STYLES[index] || null
            const RankIcon = rankStyle?.icon || null

            return (
              <div
                key={user.user_id}
                className={`
                  flex items-center gap-4 p-3 rounded-lg transition-colors
                  ${isCurrentUser ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'}
                  ${rankStyle?.bg || ''}
                  ${rankStyle?.border ? `border ${rankStyle.border}` : ''}
                `}
              >
                {/* Rank */}
                <div className="flex items-center justify-center w-8">
                  {RankIcon ? (
                    <RankIcon className={`h-6 w-6 ${rankStyle.iconColor}`} />
                  ) : (
                    <span className="text-lg font-bold text-gray-500">#{user.rank}</span>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${isCurrentUser ? 'text-blue-700' : 'text-gray-900'}`}>
                    {user.profiles?.full_name || user.profiles?.email?.split('@')[0] || 'Usuario'}
                    {isCurrentUser && <span className="ml-2 text-xs text-blue-600">(voce)</span>}
                  </p>
                  <p className="text-sm text-gray-500">
                    Nivel {user.current_level}
                  </p>
                </div>

                {/* XP */}
                <div className="text-right">
                  <p className={`font-bold ${isCurrentUser ? 'text-blue-700' : 'text-gray-900'}`}>
                    {user.total_xp.toLocaleString()} XP
                  </p>
                  <p className="text-xs text-gray-500">
                    {user.total_ecgs_completed} ECGs
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* User Position (if not in top N) */}
        {showUserPosition && !isInTopN && userRank && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
              <div className="flex items-center justify-center w-8">
                <span className="text-lg font-bold text-blue-600">#{userRank}</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-blue-700">Sua Posicao</p>
                <p className="text-sm text-blue-600">
                  Top {userPercentile}% de {totalUsers} usuarios
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-blue-700">{userTotalXP.toLocaleString()} XP</p>
                <p className="text-xs text-gray-500">Continue praticando!</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default LeaderboardXP
