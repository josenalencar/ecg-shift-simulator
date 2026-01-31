'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Loader2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  AlertTriangle,
  ExternalLink
} from 'lucide-react'

interface EmailHistoryItem {
  id: string
  to: string
  subject: string
  created_at: string
  last_event: string
}

const eventConfig: Record<string, { icon: typeof CheckCircle2; color: string; label: string }> = {
  delivered: { icon: CheckCircle2, color: 'text-green-500', label: 'Entregue' },
  sent: { icon: Send, color: 'text-blue-500', label: 'Enviado' },
  opened: { icon: CheckCircle2, color: 'text-green-600', label: 'Aberto' },
  clicked: { icon: ExternalLink, color: 'text-purple-500', label: 'Clicado' },
  bounced: { icon: XCircle, color: 'text-red-500', label: 'Bounce' },
  complained: { icon: AlertTriangle, color: 'text-orange-500', label: 'Reclamacao' },
  delivery_delayed: { icon: Clock, color: 'text-yellow-500', label: 'Atrasado' },
}

export function EmailHistory() {
  const [emails, setEmails] = useState<EmailHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/emails/history')
      if (res.ok) {
        const data = await res.json()
        setEmails(data.emails || [])
      }
    } catch (error) {
      console.error('Error fetching email history:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchHistory()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Historico de Envios</h3>
          <p className="text-sm text-gray-500">Ultimos e-mails enviados via Resend</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        {Object.entries(eventConfig).slice(0, 5).map(([key, config]) => {
          const Icon = config.icon
          return (
            <div key={key} className="flex items-center gap-1.5">
              <Icon className={`h-4 w-4 ${config.color}`} />
              <span className="text-gray-600">{config.label}</span>
            </div>
          )
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Destinatario</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Assunto</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Data/Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {emails.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    Nenhum e-mail encontrado no historico
                  </td>
                </tr>
              ) : (
                emails.map(email => {
                  const eventKey = email.last_event?.toLowerCase() || 'sent'
                  const config = eventConfig[eventKey] || { icon: Clock, color: 'text-gray-400', label: email.last_event || 'Pendente' }
                  const Icon = config.icon

                  return (
                    <tr key={email.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${config.color}`} />
                          <span className="text-sm">{config.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-900">{email.to}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-700 truncate max-w-xs block">
                          {email.subject}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-500">
                          {new Date(email.created_at).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Note */}
      <p className="text-xs text-gray-400 text-center">
        Mostrando os ultimos 100 e-mails enviados. Dados fornecidos pela API do Resend.
      </p>
    </div>
  )
}

export default EmailHistory
