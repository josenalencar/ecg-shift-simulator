'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Filter, ArrowUpDown, Search, Calendar } from 'lucide-react'

interface UserFiltersProps {
  currentFilter: string
  currentSort: string
  currentOrder: string
  currentSearch: string
  currentDateFrom: string
  currentDateTo: string
}

export function UserFilters({ currentFilter, currentSort, currentOrder, currentSearch, currentDateFrom, currentDateTo }: UserFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchValue, setSearchValue] = useState(currentSearch)
  const [dateFrom, setDateFrom] = useState(currentDateFrom)
  const [dateTo, setDateTo] = useState(currentDateTo)

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchValue !== currentSearch) {
        const params = new URLSearchParams(searchParams.toString())
        if (searchValue) {
          params.set('search', searchValue)
        } else {
          params.delete('search')
        }
        router.push(`/admin/users?${params.toString()}`)
      }
    }, 300)
    return () => clearTimeout(timeout)
  }, [searchValue, currentSearch, searchParams, router])

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(key, value)
    router.push(`/admin/users?${params.toString()}`)
  }

  const toggleOrder = () => {
    updateParams('order', currentOrder === 'asc' ? 'desc' : 'asc')
  }

  const handleDateChange = (type: 'from' | 'to', value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (type === 'from') {
      setDateFrom(value)
      if (value) {
        params.set('dateFrom', value)
      } else {
        params.delete('dateFrom')
      }
    } else {
      setDateTo(value)
      if (value) {
        params.set('dateTo', value)
      } else {
        params.delete('dateTo')
      }
    }
    router.push(`/admin/users?${params.toString()}`)
  }

  const hasFilters = currentFilter !== 'all' || currentSort !== 'created_at' || currentOrder !== 'desc' || currentSearch || currentDateFrom || currentDateTo

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      {/* Search */}
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-gray-500" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Buscar por nome ou email..."
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
        />
      </div>

      {/* Filter by plan */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-gray-500" />
        <select
          value={currentFilter}
          onChange={(e) => updateParams('filter', e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos os planos</option>
          <option value="free">Gratuitos</option>
          <option value="premium">Premium</option>
          <option value="ai">Premium +AI</option>
          <option value="aluno_ecg">Aluno ECG com JA</option>
          <option value="admin">Apenas admins</option>
        </select>
      </div>

      {/* Sort by */}
      <div className="flex items-center gap-2">
        <ArrowUpDown className="h-4 w-4 text-gray-500" />
        <select
          value={currentSort}
          onChange={(e) => updateParams('sort', e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="created_at">Data de cadastro</option>
          <option value="ecgs">ECGs realizados</option>
          <option value="score">Média de resultados</option>
          <option value="name">Nome</option>
        </select>

        <button
          onClick={toggleOrder}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 hover:bg-gray-50 transition-colors"
        >
          {currentOrder === 'asc' ? 'Crescente' : 'Decrescente'}
        </button>
      </div>

      {/* Date range filter */}
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-gray-500" />
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => handleDateChange('from', e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="De"
        />
        <span className="text-gray-400">até</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => handleDateChange('to', e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Até"
        />
      </div>

      {/* Clear filters */}
      {hasFilters && (
        <button
          onClick={() => {
            setSearchValue('')
            setDateFrom('')
            setDateTo('')
            router.push('/admin/users')
          }}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Limpar filtros
        </button>
      )}
    </div>
  )
}
