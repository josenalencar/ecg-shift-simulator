'use client'

import { useState } from 'react'
import type { AchievementWithProgress, AchievementCategory, AchievementRarity } from '@/types/database'
import { AchievementCard } from './AchievementCard'
import { Button } from '@/components/ui'

interface AchievementGridProps {
  achievements: AchievementWithProgress[]
}

const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  ecg_count: 'Quantidade de ECGs',
  diagnosis: 'Diagnosticos',
  streak: 'Sequencia',
  perfect: 'Pontuacao Perfeita',
  level: 'Nivel',
  special: 'Especiais',
  hospital: 'Hospital',
  pediatric: 'Pediatria',
}

const RARITY_ORDER: AchievementRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary']

type FilterOption = 'all' | 'earned' | 'locked'
type SortOption = 'order' | 'rarity' | 'earned_date'

export function AchievementGrid({ achievements }: AchievementGridProps) {
  const [filter, setFilter] = useState<FilterOption>('all')
  const [categoryFilter, setCategoryFilter] = useState<AchievementCategory | 'all'>('all')
  const [sort, setSort] = useState<SortOption>('order')

  // Filter achievements
  let filtered = achievements.filter((a) => {
    if (filter === 'earned' && !a.earned) return false
    if (filter === 'locked' && a.earned) return false
    if (categoryFilter !== 'all' && a.category !== categoryFilter) return false
    return true
  })

  // Sort achievements
  filtered = [...filtered].sort((a, b) => {
    switch (sort) {
      case 'rarity':
        return RARITY_ORDER.indexOf(b.rarity) - RARITY_ORDER.indexOf(a.rarity)
      case 'earned_date':
        if (!a.earned_at && !b.earned_at) return a.display_order - b.display_order
        if (!a.earned_at) return 1
        if (!b.earned_at) return -1
        return new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime()
      default:
        return a.display_order - b.display_order
    }
  })

  // Group by category
  const categories = [...new Set(filtered.map((a) => a.category))] as AchievementCategory[]

  // Stats
  const earnedCount = achievements.filter((a) => a.earned).length
  const totalCount = achievements.length

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-2xl font-bold text-gray-900">{earnedCount}</span>
          <span className="text-gray-500"> / {totalCount} conquistas</span>
        </div>
        <div className="text-sm text-gray-500">
          {Math.round((earnedCount / totalCount) * 100)}% completado
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-3 rounded-full transition-all duration-500"
          style={{ width: `${(earnedCount / totalCount) * 100}%` }}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={filter === 'all' ? 'primary' : 'outline'}
            onClick={() => setFilter('all')}
          >
            Todas
          </Button>
          <Button
            size="sm"
            variant={filter === 'earned' ? 'primary' : 'outline'}
            onClick={() => setFilter('earned')}
          >
            Conquistadas ({earnedCount})
          </Button>
          <Button
            size="sm"
            variant={filter === 'locked' ? 'primary' : 'outline'}
            onClick={() => setFilter('locked')}
          >
            Bloqueadas ({totalCount - earnedCount})
          </Button>
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as AchievementCategory | 'all')}
          className="px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todas as categorias</option>
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="order">Ordem padrao</option>
          <option value="rarity">Por raridade</option>
          <option value="earned_date">Por data de conquista</option>
        </select>
      </div>

      {/* Achievement List by Category */}
      {categories.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Nenhuma conquista encontrada com os filtros selecionados.
        </div>
      ) : (
        categories.map((category) => {
          const categoryAchievements = filtered.filter((a) => a.category === category)
          if (categoryAchievements.length === 0) return null

          return (
            <div key={category} className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                {CATEGORY_LABELS[category]}
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({categoryAchievements.filter((a) => a.earned).length}/{categoryAchievements.length})
                </span>
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categoryAchievements.map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    showDescription={true}
                  />
                ))}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

export default AchievementGrid
