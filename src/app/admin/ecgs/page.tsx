'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, Button, Select } from '@/components/ui'
import { Plus, Eye, EyeOff, BarChart3, Filter, Loader2, ChevronLeft, ChevronRight, ThumbsDown, ArrowDownUp } from 'lucide-react'
import { ECGActions } from './ecg-actions'
import { DIFFICULTIES, CATEGORIES, RHYTHMS, formatCompoundFinding, ELECTRODE_SWAP_OPTIONS } from '@/lib/ecg-constants'
import type { ECG, OfficialReport, Profile } from '@/types/database'

type ECGWithReportAndCreator = ECG & {
  official_reports: OfficialReport | null
  profiles: Pick<Profile, 'id' | 'full_name' | 'email'> | null
  is_pediatric?: boolean
  ecg_dislikes: { count: number }[]
}

type AdminStats = {
  id: string
  name: string
  count: number
}

const ITEMS_PER_PAGE = 50

// Format date to Brazil timezone
function formatDateBR(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AdminECGsPage() {
  const supabase = createClient()

  const [ecgs, setEcgs] = useState<ECGWithReportAndCreator[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [filterAdmin, setFilterAdmin] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all')
  const [selectedReportTags, setSelectedReportTags] = useState<string[]>([])
  const [filterPediatric, setFilterPediatric] = useState<string>('all')
  const [filterDislike, setFilterDislike] = useState<string>('all')

  // Sorting
  const [sortByDislikes, setSortByDislikes] = useState(false)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)

  // Hover preview state
  const [hoveredEcg, setHoveredEcg] = useState<string | null>(null)

  useEffect(() => {
    async function loadECGs() {
      const { data: ecgsData, error } = await supabase
        .from('ecgs')
        .select('*, official_reports(*), profiles!ecgs_created_by_fkey(id, full_name, email), ecg_dislikes(count)')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching ECGs:', error)
        setError('Erro ao carregar ECGs')
      } else {
        setEcgs(ecgsData as ECGWithReportAndCreator[] || [])
      }
      setIsLoading(false)
    }

    loadECGs()
  }, [supabase])

  // Calculate admin stats for dashboard
  const adminStats = useMemo((): AdminStats[] => {
    const stats: Record<string, AdminStats> = {}

    ecgs.forEach(ecg => {
      const adminId = ecg.profiles?.id || 'unknown'
      const adminName = ecg.profiles?.full_name || ecg.profiles?.email?.split('@')[0] || 'Desconhecido'

      if (!stats[adminId]) {
        stats[adminId] = { id: adminId, name: adminName, count: 0 }
      }
      stats[adminId].count++
    })

    return Object.values(stats).sort((a, b) => b.count - a.count)
  }, [ecgs])

  // Get unique admins for filter dropdown
  const adminOptions = useMemo(() => {
    return [
      { value: 'all', label: 'Todos os admins' },
      ...adminStats.map(admin => ({
        value: admin.id,
        label: `${admin.name} (${admin.count})`
      }))
    ]
  }, [adminStats])

  // Collect all available report tags for multi-select filter
  const reportTagOptions = useMemo(() => {
    const tags: { value: string; label: string }[] = []
    const seen = new Set<string>()

    ecgs.forEach(ecg => {
      const report = ecg.official_reports
      if (report) {
        report.rhythm.forEach(r => {
          if (!seen.has(r)) {
            seen.add(r)
            tags.push({
              value: r,
              label: RHYTHMS.find(rhythm => rhythm.value === r)?.label || r
            })
          }
        })
        report.findings.forEach(f => {
          if (!seen.has(f)) {
            seen.add(f)
            tags.push({
              value: f,
              label: formatCompoundFinding(f)
            })
          }
        })
        report.electrode_swap?.forEach(s => {
          if (!seen.has(s)) {
            seen.add(s)
            tags.push({
              value: s,
              label: ELECTRODE_SWAP_OPTIONS.find(opt => opt.value === s)?.label || s
            })
          }
        })
      }
    })

    return tags.sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))
  }, [ecgs])

  // Helper to get dislike count
  const getDislikeCount = (ecg: ECGWithReportAndCreator) => ecg.ecg_dislikes?.[0]?.count || 0

  // Filter and sort ECGs
  const filteredAndSortedEcgs = useMemo(() => {
    let result = ecgs.filter(ecg => {
      if (filterAdmin !== 'all' && ecg.profiles?.id !== filterAdmin) return false
      if (filterCategory !== 'all' && ecg.category !== filterCategory) return false
      if (filterDifficulty !== 'all' && ecg.difficulty !== filterDifficulty) return false

      // Report tags filter (if any selected, ECG must have at least one)
      if (selectedReportTags.length > 0) {
        const report = ecg.official_reports
        if (!report) return false

        const ecgTags: string[] = [
          ...report.rhythm,
          ...report.findings,
          ...(report.electrode_swap || [])
        ]

        if (!selectedReportTags.some(tag => ecgTags.includes(tag))) return false
      }

      // Pediatric filter
      if (filterPediatric !== 'all') {
        if (filterPediatric === 'pediatric' && !ecg.is_pediatric) return false
        if (filterPediatric === 'adult' && ecg.is_pediatric) return false
      }

      // Dislike filter
      if (filterDislike === 'disliked') {
        if (getDislikeCount(ecg) === 0) return false
      }

      return true
    })

    // Sort by dislikes if enabled
    if (sortByDislikes) {
      result = [...result].sort((a, b) => getDislikeCount(b) - getDislikeCount(a))
    }

    return result
  }, [ecgs, filterAdmin, filterCategory, filterDifficulty, selectedReportTags, filterPediatric, filterDislike, sortByDislikes])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedEcgs.length / ITEMS_PER_PAGE)
  const paginatedEcgs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredAndSortedEcgs.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredAndSortedEcgs, currentPage])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filterAdmin, filterCategory, filterDifficulty, selectedReportTags, filterPediatric, filterDislike, sortByDislikes])

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Casos de ECG</h1>
        <Link href="/admin/ecgs/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Novo ECG
          </Button>
        </Link>
      </div>

      {/* Admin Dashboard */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Casos por Admin
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {adminStats.map(admin => (
              <div
                key={admin.id}
                className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center"
              >
                <div className="text-3xl font-bold text-blue-700">{admin.count}</div>
                <div className="text-sm text-blue-600 truncate" title={admin.name}>
                  {admin.name}
                </div>
              </div>
            ))}
            {adminStats.length === 0 && (
              <div className="col-span-full text-center text-gray-500 py-4">
                Nenhum caso cadastrado ainda
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Select
              id="filter-admin"
              label="Admin"
              value={filterAdmin}
              onChange={(e) => setFilterAdmin(e.target.value)}
              options={adminOptions}
            />
            <Select
              id="filter-category"
              label="Categoria"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              options={[
                { value: 'all', label: 'Todas as categorias' },
                ...CATEGORIES
              ]}
            />
            <Select
              id="filter-difficulty"
              label="Dificuldade"
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              options={[
                { value: 'all', label: 'Todas as dificuldades' },
                ...DIFFICULTIES
              ]}
            />
            <div>
              <label htmlFor="filter-laudo" className="block text-sm font-medium text-gray-700 mb-1">
                Laudo
              </label>
              <select
                id="filter-laudo"
                multiple
                value={selectedReportTags}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value)
                  setSelectedReportTags(selected)
                }}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm max-h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {reportTagOptions.map(tag => (
                  <option key={tag.value} value={tag.value}>
                    {tag.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Ctrl+click para múltiplos</p>
            </div>
            <Select
              id="filter-pediatric"
              label="Tipo"
              value={filterPediatric}
              onChange={(e) => setFilterPediatric(e.target.value)}
              options={[
                { value: 'all', label: 'Todos' },
                { value: 'adult', label: 'Adulto' },
                { value: 'pediatric', label: 'Pediátrico' }
              ]}
            />
            <Select
              id="filter-dislike"
              label="Dislike"
              value={filterDislike}
              onChange={(e) => setFilterDislike(e.target.value)}
              options={[
                { value: 'all', label: 'Todos' },
                { value: 'disliked', label: 'Apenas com dislikes' }
              ]}
            />
          </div>

          {/* Sort toggle */}
          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={() => setSortByDislikes(!sortByDislikes)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                sortByDislikes
                  ? 'bg-red-100 text-red-700 border border-red-300'
                  : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              <ArrowDownUp className="h-4 w-4" />
              Ordenar por dislikes
              {sortByDislikes && <ThumbsDown className="h-3 w-3" />}
            </button>
          </div>

          {(filterAdmin !== 'all' || filterCategory !== 'all' || filterDifficulty !== 'all' || selectedReportTags.length > 0 || filterPediatric !== 'all' || filterDislike !== 'all' || sortByDislikes) && (
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Mostrando {filteredAndSortedEcgs.length} de {ecgs.length} casos
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterAdmin('all')
                  setFilterCategory('all')
                  setFilterDifficulty('all')
                  setSelectedReportTags([])
                  setFilterPediatric('all')
                  setFilterDislike('all')
                  setSortByDislikes(false)
                }}
              >
                Limpar filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ECG Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Todos os Casos ({filteredAndSortedEcgs.length})</CardTitle>
            {totalPages > 1 && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                Página {currentPage} de {totalPages}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
              {error}
            </div>
          )}
          {paginatedEcgs.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Título</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Dificuldade</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Categoria</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Admin</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Criado em</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Laudo</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 text-center">Dislikes</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedEcgs.map((ecg) => {
                      const diffLabel = DIFFICULTIES.find(d => d.value === ecg.difficulty)?.label || ecg.difficulty
                      const catLabel = CATEGORIES.find(c => c.value === ecg.category)?.label || ecg.category
                      const creatorName = ecg.profiles?.full_name || ecg.profiles?.email?.split('@')[0] || 'Desconhecido'

                      return (
                        <tr key={ecg.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {ecg.image_url && (
                                <div
                                  className="relative"
                                  onMouseEnter={() => setHoveredEcg(ecg.id)}
                                  onMouseLeave={() => setHoveredEcg(null)}
                                >
                                  <img
                                    src={ecg.image_url}
                                    alt={ecg.title}
                                    className="w-12 h-12 object-cover rounded cursor-pointer border border-gray-200"
                                  />
                                  {hoveredEcg === ecg.id && (
                                    <div className="fixed z-[100] pointer-events-none" style={{
                                      left: '50%',
                                      top: '50%',
                                      transform: 'translate(-50%, -50%)'
                                    }}>
                                      <div className="bg-white p-2 rounded-xl shadow-2xl border-2 border-gray-300">
                                        <img
                                          src={ecg.image_url}
                                          alt={ecg.title}
                                          className="max-w-[80vw] max-h-[70vh] object-contain rounded-lg"
                                        />
                                        <div className="text-center mt-2 text-sm font-medium text-gray-700">
                                          {ecg.title}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                              <span className="font-medium text-gray-900">{ecg.title}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`
                              px-2 py-1 rounded-full text-xs font-medium
                              ${ecg.difficulty === 'easy'
                                ? 'bg-green-100 text-green-700'
                                : ecg.difficulty === 'medium'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                              }
                            `}>
                              {diffLabel}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {catLabel}
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-600">{creatorName}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-500">{formatDateBR(ecg.created_at)}</span>
                          </td>
                          <td className="py-3 px-4 max-w-md">
                            {ecg.official_reports ? (
                              <div className="flex flex-wrap gap-1">
                                {ecg.official_reports.rhythm.map(r => (
                                  <span key={r} className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                    {RHYTHMS.find(rhythm => rhythm.value === r)?.label || r}
                                  </span>
                                ))}
                                {ecg.official_reports.findings.map(f => (
                                  <span key={f} className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                    {formatCompoundFinding(f)}
                                  </span>
                                ))}
                                {ecg.official_reports.electrode_swap?.map(s => (
                                  <span key={s} className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                                    {ELECTRODE_SWAP_OPTIONS.find(opt => opt.value === s)?.label || s}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-red-600 text-sm">Sem laudo</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {(() => {
                              const dislikeCount = getDislikeCount(ecg)
                              return dislikeCount > 0 ? (
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                  {dislikeCount}
                                </span>
                              ) : (
                                <span className="text-gray-400 text-xs">-</span>
                              )
                            })()}
                          </td>
                          <td className="py-3 px-4">
                            {ecg.is_active ? (
                              <span className="flex items-center gap-1 text-green-600 text-sm">
                                <Eye className="h-4 w-4" />
                                Ativo
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-gray-500 text-sm">
                                <EyeOff className="h-4 w-4" />
                                Inativo
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <ECGActions ecgId={ecg.id} isActive={ecg.is_active} />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>

                  <div className="flex items-center gap-1">
                    {/* First page */}
                    {currentPage > 3 && (
                      <>
                        <button
                          onClick={() => goToPage(1)}
                          className="px-3 py-1 text-sm rounded hover:bg-gray-100"
                        >
                          1
                        </button>
                        {currentPage > 4 && <span className="px-2 text-gray-400">...</span>}
                      </>
                    )}

                    {/* Page numbers around current */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => page >= currentPage - 2 && page <= currentPage + 2)
                      .map(page => (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`px-3 py-1 text-sm rounded ${
                            page === currentPage
                              ? 'bg-blue-600 text-white'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      ))
                    }

                    {/* Last page */}
                    {currentPage < totalPages - 2 && (
                      <>
                        {currentPage < totalPages - 3 && <span className="px-2 text-gray-400">...</span>}
                        <button
                          onClick={() => goToPage(totalPages)}
                          className="px-3 py-1 text-sm rounded hover:bg-gray-100"
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Próxima
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                {ecgs.length === 0 ? 'Nenhum caso de ECG ainda' : 'Nenhum caso encontrado com os filtros selecionados'}
              </p>
              {ecgs.length === 0 && (
                <Link href="/admin/ecgs/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicione seu primeiro ECG
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Overlay backdrop for hover preview */}
      {hoveredEcg && (
        <div
          className="fixed inset-0 bg-black/30 z-[99] pointer-events-none"
          style={{ backdropFilter: 'blur(2px)' }}
        />
      )}
    </div>
  )
}
