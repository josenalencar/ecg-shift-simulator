'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Plus,
  Clock,
  Calendar,
  Zap,
  Play,
  Pause,
  Loader2,
  AlertCircle,
  CheckCircle,
  Mail,
  Users,
  RefreshCw
} from 'lucide-react'
import { AutomationCard } from './automation-card'
import { AutomationFormModal } from './automation-form-modal'

interface EmailConfig {
  name_pt: string
  category: string
}

interface Creator {
  full_name: string | null
  email: string
}

export interface Automation {
  id: string
  name: string
  description: string | null
  email_type: string
  segment_type: string
  trigger_type: 'event' | 'scheduled' | 'one_time'
  trigger_event: string | null
  trigger_delay_hours: number
  schedule_type: string | null
  schedule_day: number | null
  schedule_hour: number
  one_time_datetime: string | null
  max_sends_per_user: number | null
  min_days_between_sends: number
  is_enabled: boolean
  is_paused: boolean
  last_run_at: string | null
  next_run_at: string | null
  total_sent: number
  created_at: string
  updated_at: string
  email_config: EmailConfig | null
  creator: Creator | null
}

interface SyncStatus {
  total: number
  synced: number
  pending: number
  failed: number
  defaultAudienceId: string | null
}

export function EmailAutomations() {
  const [automations, setAutomations] = useState<Automation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null)
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null)
  const [syncing, setSyncing] = useState(false)

  const fetchAutomations = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/emails/automations')
      if (res.ok) {
        const data = await res.json()
        setAutomations(data.automations || [])
      } else {
        setError('Falha ao carregar automacoes')
      }
    } catch (err) {
      console.error('Error fetching automations:', err)
      setError('Erro ao carregar automacoes')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchSyncStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/emails/sync-contacts')
      if (res.ok) {
        const data = await res.json()
        setSyncStatus(data)
      }
    } catch (err) {
      console.error('Error fetching sync status:', err)
    }
  }, [])

  useEffect(() => {
    fetchAutomations()
    fetchSyncStatus()
  }, [fetchAutomations, fetchSyncStatus])

  const handleCreate = () => {
    setEditingAutomation(null)
    setModalOpen(true)
  }

  const handleEdit = (automation: Automation) => {
    setEditingAutomation(automation)
    setModalOpen(true)
  }

  const handleToggleEnabled = async (id: string, enabled: boolean) => {
    try {
      const res = await fetch(`/api/admin/emails/automations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_enabled: enabled })
      })

      if (res.ok) {
        setAutomations(prev =>
          prev.map(a => a.id === id ? { ...a, is_enabled: enabled } : a)
        )
      }
    } catch (err) {
      console.error('Error toggling automation:', err)
    }
  }

  const handleTogglePaused = async (id: string, paused: boolean) => {
    try {
      const res = await fetch(`/api/admin/emails/automations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_paused: paused })
      })

      if (res.ok) {
        setAutomations(prev =>
          prev.map(a => a.id === id ? { ...a, is_paused: paused } : a)
        )
      }
    } catch (err) {
      console.error('Error toggling pause:', err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta automacao?')) return

    try {
      const res = await fetch(`/api/admin/emails/automations/${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setAutomations(prev => prev.filter(a => a.id !== id))
      }
    } catch (err) {
      console.error('Error deleting automation:', err)
    }
  }

  const handleRun = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/emails/automations/${id}/run`, {
        method: 'POST'
      })

      if (res.ok) {
        const data = await res.json()
        alert(`Enviados: ${data.sent}, Falhas: ${data.failed}`)
        fetchAutomations()
      } else {
        const data = await res.json()
        alert(`Erro: ${data.error}`)
      }
    } catch (err) {
      console.error('Error running automation:', err)
      alert('Erro ao executar automacao')
    }
  }

  const handleSave = async (data: Partial<Automation>) => {
    try {
      const method = editingAutomation ? 'PUT' : 'POST'
      const url = editingAutomation
        ? `/api/admin/emails/automations/${editingAutomation.id}`
        : '/api/admin/emails/automations'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (res.ok) {
        setModalOpen(false)
        fetchAutomations()
        return true
      } else {
        const errorData = await res.json()
        alert(errorData.error || 'Erro ao salvar automacao')
        return false
      }
    } catch (err) {
      console.error('Error saving automation:', err)
      alert('Erro ao salvar automacao')
      return false
    }
  }

  const handleBulkSync = async () => {
    if (!confirm('Sincronizar todos os usuarios com o Resend? Isso pode levar alguns minutos.')) return

    setSyncing(true)
    try {
      const res = await fetch('/api/admin/emails/sync-contacts', {
        method: 'POST'
      })

      if (res.ok) {
        const data = await res.json()
        alert(`Sincronizacao concluida: ${data.synced} usuarios sincronizados, ${data.failed} falhas`)
        fetchSyncStatus()
      } else {
        const data = await res.json()
        alert(`Erro: ${data.error}`)
      }
    } catch (err) {
      console.error('Error syncing contacts:', err)
      alert('Erro ao sincronizar contatos')
    } finally {
      setSyncing(false)
    }
  }

  // Group automations by trigger type
  const eventAutomations = automations.filter(a => a.trigger_type === 'event')
  const scheduledAutomations = automations.filter(a => a.trigger_type === 'scheduled')
  const oneTimeAutomations = automations.filter(a => a.trigger_type === 'one_time')

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12 text-red-500">
        <AlertCircle className="h-5 w-5 mr-2" />
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Automacoes de E-mail</h2>
          <p className="text-sm text-gray-600">
            Configure envios automaticos baseados em eventos ou agendamentos
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nova Automacao
        </button>
      </div>

      {/* Sync Status Card */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Sincronizacao com Resend</h3>
              <p className="text-sm text-gray-600">
                {syncStatus ? (
                  <>
                    {syncStatus.synced} de {syncStatus.total} usuarios sincronizados
                    {syncStatus.failed > 0 && (
                      <span className="text-red-600 ml-2">({syncStatus.failed} falhas)</span>
                    )}
                  </>
                ) : (
                  'Carregando status...'
                )}
              </p>
            </div>
          </div>
          <button
            onClick={handleBulkSync}
            disabled={syncing}
            className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {syncing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Sincronizar Agora
          </button>
        </div>
        {syncStatus?.pending && syncStatus.pending > 0 && (
          <div className="mt-3 flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded">
            <AlertCircle className="h-4 w-4" />
            {syncStatus.pending} usuarios pendentes de sincronizacao
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{automations.length}</p>
              <p className="text-sm text-gray-500">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {automations.filter(a => a.is_enabled && !a.is_paused).length}
              </p>
              <p className="text-sm text-gray-500">Ativas</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Zap className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{eventAutomations.length}</p>
              <p className="text-sm text-gray-500">Eventos</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{scheduledAutomations.length}</p>
              <p className="text-sm text-gray-500">Agendadas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Automations by Type */}
      {automations.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Nenhuma automacao configurada</p>
          <p className="text-sm mt-1">Clique em "Nova Automacao" para comecar</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Event-based */}
          {eventAutomations.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-5 w-5 text-purple-600" />
                <h3 className="font-medium text-gray-900">Baseadas em Eventos</h3>
                <span className="text-sm text-gray-500">({eventAutomations.length})</span>
              </div>
              <div className="space-y-3">
                {eventAutomations.map(automation => (
                  <AutomationCard
                    key={automation.id}
                    automation={automation}
                    onEdit={() => handleEdit(automation)}
                    onToggleEnabled={(enabled) => handleToggleEnabled(automation.id, enabled)}
                    onTogglePaused={(paused) => handleTogglePaused(automation.id, paused)}
                    onDelete={() => handleDelete(automation.id)}
                    onRun={() => handleRun(automation.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Scheduled */}
          {scheduledAutomations.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-5 w-5 text-orange-600" />
                <h3 className="font-medium text-gray-900">Agendadas</h3>
                <span className="text-sm text-gray-500">({scheduledAutomations.length})</span>
              </div>
              <div className="space-y-3">
                {scheduledAutomations.map(automation => (
                  <AutomationCard
                    key={automation.id}
                    automation={automation}
                    onEdit={() => handleEdit(automation)}
                    onToggleEnabled={(enabled) => handleToggleEnabled(automation.id, enabled)}
                    onTogglePaused={(paused) => handleTogglePaused(automation.id, paused)}
                    onDelete={() => handleDelete(automation.id)}
                    onRun={() => handleRun(automation.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* One-time */}
          {oneTimeAutomations.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium text-gray-900">Unica Vez</h3>
                <span className="text-sm text-gray-500">({oneTimeAutomations.length})</span>
              </div>
              <div className="space-y-3">
                {oneTimeAutomations.map(automation => (
                  <AutomationCard
                    key={automation.id}
                    automation={automation}
                    onEdit={() => handleEdit(automation)}
                    onToggleEnabled={(enabled) => handleToggleEnabled(automation.id, enabled)}
                    onTogglePaused={(paused) => handleTogglePaused(automation.id, paused)}
                    onDelete={() => handleDelete(automation.id)}
                    onRun={() => handleRun(automation.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <AutomationFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        automation={editingAutomation}
        onSave={handleSave}
      />
    </div>
  )
}
