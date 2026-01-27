'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Filter, ArrowUpDown } from 'lucide-react'

interface UserFiltersProps {
  currentFilter: string
  currentSort: string
  currentOrder: string
}

export function UserFilters({ currentFilter, currentSort, currentOrder }: UserFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(key, value)
    router.push(`/admin/users?${params.toString()}`)
  }

  const toggleOrder = () => {
    updateParams('order', currentOrder === 'asc' ? 'desc' : 'asc')
  }

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      {/* Filter by plan */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-gray-500" />
        <select
          value={currentFilter}
          onChange={(e) => updateParams('filter', e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos os planos</option>
          <option value="free">Gratuitos</option>
          <option value="premium">Premium</option>
          <option value="ai">Premium +AI</option>
          <option value="admin">Apenas admins</option>
        </select>
      </div>

      {/* Sort by */}
      <div className="flex items-center gap-2">
        <ArrowUpDown className="h-4 w-4 text-gray-500" />
        <select
          value={currentSort}
          onChange={(e) => updateParams('sort', e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="created_at">Data de cadastro</option>
          <option value="ecgs">ECGs realizados</option>
          <option value="score">Média de resultados</option>
          <option value="name">Nome</option>
        </select>

        <button
          onClick={toggleOrder}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
        >
          {currentOrder === 'asc' ? 'Crescente' : 'Decrescente'}
        </button>
      </div>

      {/* Clear filters */}
      {(currentFilter !== 'all' || currentSort !== 'created_at' || currentOrder !== 'desc') && (
        <button
          onClick={() => router.push('/admin/users')}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Limpar filtros
        </button>
      )}
    </div>
  )
}
