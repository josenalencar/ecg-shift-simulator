'use client'

import type { UserGamificationStats, GamificationConfig } from '@/types/database'
import { xpProgressToNextLevel } from '@/lib/gamification'
import { Star, TrendingUp, Flame, Trophy } from 'lucide-react'

interface ProgressHeaderProps {
  stats: UserGamificationStats
  config: GamificationConfig
  rank: number | null
  percentile: number
  isInTopN: boolean
  achievementCount: number
}

export function ProgressHeader({
  stats,
  config,
  rank,
  percentile,
  isInTopN,
  achievementCount,
}: ProgressHeaderProps) {
  const xpProgress = xpProgressToNextLevel(stats.total_xp, config)

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Level & XP */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
              <Star className="h-10 w-10 text-yellow-400" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-gray-900 font-bold text-sm">
              {stats.current_level}
            </div>
          </div>
          <div>
            <p className="text-white/70 text-sm">Nivel</p>
            <p className="text-3xl font-bold">{stats.current_level}</p>
            <div className="mt-2 w-48">
              <div className="flex justify-between text-xs text-white/70 mb-1">
                <span>{xpProgress.currentXP.toLocaleString()} XP</span>
                <span>{xpProgress.requiredXP.toLocaleString()} XP</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${xpProgress.percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total XP */}
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <TrendingUp className="h-5 w-5 mx-auto mb-1 text-blue-300" />
            <p className="text-2xl font-bold">{stats.total_xp.toLocaleString()}</p>
            <p className="text-xs text-white/70">XP Total</p>
          </div>

          {/* Streak */}
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <Flame className="h-5 w-5 mx-auto mb-1 text-orange-400" />
            <p className="text-2xl font-bold">{stats.current_streak}</p>
            <p className="text-xs text-white/70">Dias de Streak</p>
          </div>

          {/* Ranking */}
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <Trophy className="h-5 w-5 mx-auto mb-1 text-yellow-400" />
            <p className="text-2xl font-bold">
              {isInTopN && rank ? `#${rank}` : `${percentile}%`}
            </p>
            <p className="text-xs text-white/70">
              {isInTopN ? 'Ranking' : 'Top Percentil'}
            </p>
          </div>

          {/* Achievements */}
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <Star className="h-5 w-5 mx-auto mb-1 text-purple-400" />
            <p className="text-2xl font-bold">{achievementCount}</p>
            <p className="text-xs text-white/70">de 100 Conquistas</p>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="mt-6 pt-4 border-t border-white/20 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold">{stats.total_ecgs_completed}</p>
          <p className="text-xs text-white/70">ECGs Interpretados</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{stats.total_perfect_scores}</p>
          <p className="text-xs text-white/70">Pontuacoes Perfeitas</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{stats.longest_streak}</p>
          <p className="text-xs text-white/70">Maior Streak</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{stats.events_participated}</p>
          <p className="text-xs text-white/70">Eventos Participados</p>
        </div>
      </div>
    </div>
  )
}

export default ProgressHeader
