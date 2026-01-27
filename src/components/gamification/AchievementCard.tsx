'use client'

import type { AchievementWithProgress, AchievementRarity } from '@/types/database'
import { Lock, Check } from 'lucide-react'
import * as LucideIcons from 'lucide-react'

interface AchievementCardProps {
  achievement: AchievementWithProgress
  showDescription?: boolean
}

const RARITY_COLORS: Record<AchievementRarity, { bg: string; border: string; text: string; icon: string }> = {
  common: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600', icon: 'text-gray-400' },
  uncommon: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: 'text-green-500' },
  rare: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'text-blue-500' },
  epic: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: 'text-purple-500' },
  legendary: { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-700', icon: 'text-yellow-500' },
}

const RARITY_LABELS: Record<AchievementRarity, string> = {
  common: 'Comum',
  uncommon: 'Incomum',
  rare: 'Raro',
  epic: 'Epico',
  legendary: 'Lendario',
}

function getIconComponent(iconName: string): React.ComponentType<{ className?: string }> {
  const pascalName = iconName
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = (LucideIcons as any)[pascalName]
  return IconComponent || LucideIcons.Award
}

export function AchievementCard({ achievement, showDescription = true }: AchievementCardProps) {
  const colors = RARITY_COLORS[achievement.rarity]
  const Icon = getIconComponent(achievement.icon)
  const isEarned = achievement.earned

  return (
    <div
      className={`
        relative p-4 rounded-lg border-2 transition-all duration-200
        ${isEarned ? colors.bg : 'bg-gray-100'}
        ${isEarned ? colors.border : 'border-gray-200'}
        ${isEarned ? '' : 'opacity-60'}
      `}
    >
      {/* Earned Badge */}
      {isEarned && (
        <div className="absolute -top-2 -right-2 p-1 bg-green-500 rounded-full">
          <Check className="h-3 w-3 text-white" />
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`
            p-2 rounded-full
            ${isEarned ? colors.bg : 'bg-gray-200'}
          `}
        >
          {isEarned ? (
            <Icon className={`h-6 w-6 ${colors.icon}`} />
          ) : (
            <Lock className="h-6 w-6 text-gray-400" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3
              className={`font-semibold truncate ${isEarned ? colors.text : 'text-gray-500'}`}
            >
              {achievement.name_pt}
            </h3>
            <span
              className={`
                text-xs px-1.5 py-0.5 rounded-full
                ${isEarned ? colors.bg : 'bg-gray-200'}
                ${isEarned ? colors.text : 'text-gray-500'}
              `}
            >
              {RARITY_LABELS[achievement.rarity]}
            </span>
          </div>

          {showDescription && (
            <p className={`text-sm mt-1 ${isEarned ? 'text-gray-600' : 'text-gray-400'}`}>
              {achievement.description_pt}
            </p>
          )}

          {/* XP Reward */}
          {achievement.xp_reward > 0 && (
            <p className={`text-xs mt-1 ${isEarned ? 'text-blue-600' : 'text-gray-400'}`}>
              +{achievement.xp_reward} XP
            </p>
          )}

          {/* Earned Date */}
          {isEarned && achievement.earned_at && (
            <p className="text-xs text-gray-400 mt-1">
              Conquistado em {new Date(achievement.earned_at).toLocaleDateString('pt-BR')}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default AchievementCard
