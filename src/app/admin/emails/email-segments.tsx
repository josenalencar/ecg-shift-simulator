'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  Plus,
  Trash2,
  RefreshCw,
  Loader2,
  UserPlus,
  CheckCircle,
  AlertCircle,
  Crown,
  Sparkles,
  Heart,
  Gift,
  UserCheck,
  UserX
} from 'lucide-react'

interface Audience {
  id: string
  name: string
  createdAt: string
  contactCount?: number
}

interface SegmentDefinition {
  id: string
  name: string
  description: string
}

interface SyncResult {
  success: boolean
  added: number
  skipped: number
  total: number
  errors?: string[]
}

const segmentIcons: Record<string, React.ReactNode> = {
  free: <Users className="h-5 w-5 text-gray-500" />,
  premium: <Crown className="h-5 w-5 text-blue-500" />,
  premium_ai: <Sparkles className="h-5 w-5 text-purple-500" />,
  ecg_com_ja: <Heart className="h-5 w-5 text-red-500" />,
  cortesia: <Gift className="h-5 w-5 text-green-500" />,
  all_users: <Users className="h-5 w-5 text-indigo-500" />,
  active_7d: <UserCheck className="h-5 w-5 text-emerald-500" />,
  inactive_30d: <UserX className="h-5 w-5 text-amber-500" />,
}

export function EmailSegments() {
  const [audiences, setAudiences] = useState<Audience[]>([])
  const [segmentDefinitions, setSegmentDefinitions] = useState<SegmentDefinition[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [syncing, setSyncing] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [newAudienceName, setNewAudienceName] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showSyncModal, setShowSyncModal] = useState(false)
  const [selectedAudience, setSelectedAudience] = useState<Audience | null>(null)
  const [selectedSegmentType, setSelectedSegmentType] = useState('')
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchAudiences = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/emails/segments')
      const data = await res.json()

      if (res.ok) {
        setAudiences(data.audiences || [])
        setSegmentDefinitions(data.segmentDefinitions || [])
      } else {
        setError(data.error || 'Erro ao carregar segmentos')
      }
    } catch {
      setError('Erro de conexao')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAudiences()
  }, [])

  const handleCreateAudience = async () => {
    if (!newAudienceName.trim()) return

    setCreating(true)
    try {
      const res = await fetch('/api/admin/emails/segments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newAudienceName }),
      })

      if (res.ok) {
        setNewAudienceName('')
        setShowCreateModal(false)
        await fetchAudiences()
      } else {
        const data = await res.json()
        setError(data.error || 'Erro ao criar segmento')
      }
    } catch {
      setError('Erro de conexao')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteAudience = async (audienceId: string) => {
    if (!confirm('Tem certeza que deseja excluir este segmento?')) return

    setDeleting(audienceId)
    try {
      const res = await fetch(`/api/admin/emails/segments?audienceId=${audienceId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        await fetchAudiences()
      } else {
        const data = await res.json()
        setError(data.error || 'Erro ao excluir segmento')
      }
    } catch {
      setError('Erro de conexao')
    } finally {
      setDeleting(null)
    }
  }

  const handleSyncContacts = async () => {
    if (!selectedAudience || !selectedSegmentType) return

    setSyncing(selectedAudience.id)
    setSyncResult(null)

    try {
      const res = await fetch('/api/admin/emails/segments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audienceId: selectedAudience.id,
          segmentType: selectedSegmentType,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setSyncResult(data)
        await fetchAudiences()
      } else {
        setError(data.error || 'Erro ao sincronizar contatos')
      }
    } catch {
      setError('Erro de conexao')
    } finally {
      setSyncing(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Segmentos de Usuarios</h3>
          <p className="text-sm text-gray-500">
            Gerencie audiences no Resend para enviar emails segmentados
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAudiences}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Atualizar"
          >
            <RefreshCw className="h-5 w-5 text-gray-500" />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Novo Segmento
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <div>
            <p className="text-red-800 font-medium">Erro</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
            &times;
          </button>
        </div>
      )}

      {/* Audiences Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {audiences.map((audience) => (
          <div
            key={audience.id}
            className="bg-white border rounded-xl p-4 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{audience.name}</h4>
                <p className="text-sm text-gray-500 mt-1">
                  {audience.contactCount || 0} contatos
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Criado em {new Date(audience.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setSelectedAudience(audience)
                    setShowSyncModal(true)
                    setSyncResult(null)
                    setSelectedSegmentType('')
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Sincronizar contatos"
                >
                  <UserPlus className="h-4 w-4 text-blue-500" />
                </button>
                <button
                  onClick={() => handleDeleteAudience(audience.id)}
                  disabled={deleting === audience.id}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  title="Excluir"
                >
                  {deleting === audience.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-red-500" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}

        {audiences.length === 0 && (
          <div className="col-span-full bg-gray-50 rounded-xl p-8 text-center">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhum segmento criado</p>
            <p className="text-sm text-gray-400 mt-1">
              Crie segmentos para enviar emails para grupos especificos de usuarios
            </p>
          </div>
        )}
      </div>

      {/* Segment Types Reference */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h4 className="font-medium text-gray-900 mb-4">Tipos de Segmento Disponiveis</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {segmentDefinitions.map((segment) => (
            <div key={segment.id} className="flex items-start gap-3">
              {segmentIcons[segment.id] || <Users className="h-5 w-5 text-gray-400" />}
              <div>
                <p className="font-medium text-gray-800 text-sm">{segment.name}</p>
                <p className="text-xs text-gray-500">{segment.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-xl">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Novo Segmento</h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Segmento
                </label>
                <input
                  type="text"
                  value={newAudienceName}
                  onChange={(e) => setNewAudienceName(e.target.value)}
                  placeholder="Ex: Usuarios Premium"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-sm text-gray-500">
                Apos criar o segmento, voce podera sincronizar contatos baseado em criterios especificos.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 p-4 border-t bg-gray-50 rounded-b-xl">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateAudience}
                disabled={creating || !newAudienceName.trim()}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {creating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Criar Segmento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sync Modal */}
      {showSyncModal && selectedAudience && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-xl">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Sincronizar Contatos
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Segmento: <strong>{selectedAudience.name}</strong>
              </p>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Usuario
                </label>
                <div className="space-y-2">
                  {segmentDefinitions.map((segment) => (
                    <label
                      key={segment.id}
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedSegmentType === segment.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="segmentType"
                        value={segment.id}
                        checked={selectedSegmentType === segment.id}
                        onChange={(e) => setSelectedSegmentType(e.target.value)}
                        className="sr-only"
                      />
                      {segmentIcons[segment.id]}
                      <div>
                        <p className="font-medium text-gray-900">{segment.name}</p>
                        <p className="text-sm text-gray-500">{segment.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sync Result */}
              {syncResult && (
                <div
                  className={`p-4 rounded-lg ${
                    syncResult.success ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {syncResult.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    )}
                    <div>
                      <p className={syncResult.success ? 'text-green-800' : 'text-red-800'}>
                        {syncResult.success
                          ? 'Sincronizacao concluida!'
                          : 'Erro na sincronizacao'}
                      </p>
                      {syncResult.success && (
                        <p className="text-sm text-green-600 mt-1">
                          {syncResult.added} contatos adicionados, {syncResult.skipped} ignorados
                          (de {syncResult.total} total)
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 p-4 border-t bg-gray-50 rounded-b-xl">
              <button
                onClick={() => {
                  setShowSyncModal(false)
                  setSelectedAudience(null)
                  setSyncResult(null)
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {syncResult ? 'Fechar' : 'Cancelar'}
              </button>
              {!syncResult && (
                <button
                  onClick={handleSyncContacts}
                  disabled={syncing !== null || !selectedSegmentType}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {syncing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Sincronizar Contatos
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmailSegments
