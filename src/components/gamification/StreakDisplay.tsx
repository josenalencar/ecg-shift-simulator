'use client'

import type { UserGamificationStats } from '@/types/database'
import { Flame, Calendar, Trophy } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'

interface StreakDisplayProps {
  stats: UserGamificationStats
  showCalendar?: boolean
}

const STREAK_MILESTONES = [
  { days: 3, label: 'Constancia', color: 'text-orange-400' },
  { days: 7, label: 'Semana Perfeita', color: 'text-orange-500' },
  { days: 14, label: 'Quinzena', color: 'text-orange-500' },
  { days: 30, label: 'Mes de Ouro', color: 'text-orange-600' },
  { days: 60, label: 'Dedicacao Total', color: 'text-orange-600' },
  { days: 90, label: 'Trimestre', color: 'text-red-500' },
  { days: 180, label: 'Semestre', color: 'text-red-600' },
  { days: 365, label: 'Ano Perfeito', color: 'text-red-700' },
]

function getNextMilestone(currentStreak: number) {
  return STREAK_MILESTONES.find((m) => m.days > currentStreak)
}

function getCurrentMilestone(currentStreak: number) {
  const passed = STREAK_MILESTONES.filter((m) => m.days <= currentStreak)
  return passed[passed.length - 1]
}

export function StreakDisplay({ stats, showCalendar = false }: StreakDisplayProps) {
  const currentMilestone = getCurrentMilestone(stats.current_streak)
  const nextMilestone = getNextMilestone(stats.current_streak)
  const progressToNext = nextMilestone
    ? (stats.current_streak / nextMilestone.days) * 100
    : 100

  // Generate last 7 days for mini calendar
  const last7Days = []
  const today = new Date()
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const isActive = stats.last_activity_date
      ? new Date(stats.last_activity_date) >= date
      : false
    last7Days.push({
      date,
      isActive: i < stats.current_streak || (i === 0 && stats.current_streak > 0),
      isToday: i === 0,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          Sua Sequencia
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Streak */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-orange-100 to-red-100 rounded-full">
            <Flame className={`h-12 w-12 ${currentMilestone?.color || 'text-orange-400'}`} />
          </div>
          <p className="mt-2 text-4xl font-bold text-gray-900">
            {stats.current_streak}
          </p>
          <p className="text-gray-500">
            dia{stats.current_streak !== 1 ? 's' : ''} seguido{stats.current_streak !== 1 ? 's' : ''}
          </p>
          {currentMilestone && (
            <p className={`mt-1 text-sm font-medium ${currentMilestone.color}`}>
              {currentMilestone.label}
            </p>
          )}
        </div>

        {/* Progress to next milestone */}
        {nextMilestone && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Proximo marco</span>
              <span className="font-medium text-gray-700">{nextMilestone.days} dias</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressToNext}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 text-center">
              Faltam {nextMilestone.days - stats.current_streak} dias para "{nextMilestone.label}"
            </p>
          </div>
        )}

        {/* Mini Calendar */}
        {showCalendar && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">Ultimos 7 dias</span>
            </div>
            <div className="flex justify-between">
              {last7Days.map((day, i) => (
                <div key={i} className="text-center">
                  <p className="text-xs text-gray-400 mb-1">
                    {day.date.toLocaleDateString('pt-BR', { weekday: 'narrow' })}
                  </p>
                  <div
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                      ${day.isActive ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}
                      ${day.isToday ? 'ring-2 ring-orange-300' : ''}
                    `}
                  >
                    {day.date.getDate()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Longest Streak */}
        <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span className="text-sm text-gray-500">Maior sequencia</span>
          </div>
          <span className="font-bold text-gray-700">{stats.longest_streak} dias</span>
        </div>
      </CardContent>
    </Card>
  )
}

export default StreakDisplay
