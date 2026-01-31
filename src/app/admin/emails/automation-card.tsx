'use client'

import {
  Zap,
  Calendar,
  Clock,
  Play,
  Pause,
  Pencil,
  Trash2,
  PlayCircle,
  Users,
  Mail,
  ChevronRight
} from 'lucide-react'
import { Automation } from './email-automations'

interface AutomationCardProps {
  automation: Automation
  onEdit: () => void
  onToggleEnabled: (enabled: boolean) => void
  onTogglePaused: (paused: boolean) => void
  onDelete: () => void
  onRun: () => void
}

const segmentLabels: Record<string, string> = {
  all_users: 'Todos os usuarios',
  free: 'Plano Free',
  premium: 'Premium',
  premium_ai: 'Premium + IA',
  ecg_com_ja: 'ECG com JA',
  cortesia: 'Cortesia',
  active_7d: 'Ativos (7 dias)',
  inactive_30d: 'Inativos (30 dias)'
}

const eventLabels: Record<string, string> = {
  user_signup: 'Cadastro de usuario',
  first_ecg_completed: 'Primeiro ECG completado',
  subscription_activated: 'Assinatura ativada',
  subscription_canceled: 'Assinatura cancelada',
  streak_lost: 'Streak perdido',
  level_up: 'Subiu de nivel',
  achievement_unlocked: 'Conquista desbloqueada'
}

const scheduleLabels: Record<string, string> = {
  daily: 'Diario',
  weekly: 'Semanal',
  monthly: 'Mensal'
}

const dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']

export function AutomationCard({
  automation,
  onEdit,
  onToggleEnabled,
  onTogglePaused,
  onDelete,
  onRun
}: AutomationCardProps) {
  const isActive = automation.is_enabled && !automation.is_paused

  const getTriggerDescription = () => {
    if (automation.trigger_type === 'event') {
      const eventLabel = automation.trigger_event ? eventLabels[automation.trigger_event] || automation.trigger_event : 'Evento'
      const delay = automation.trigger_delay_hours > 0 ? ` (${automation.trigger_delay_hours}h depois)` : ''
      return `${eventLabel}${delay}`
    }

    if (automation.trigger_type === 'scheduled') {
      const scheduleLabel = automation.schedule_type ? scheduleLabels[automation.schedule_type] : 'Agendado'
      const hour = `${String(automation.schedule_hour).padStart(2, '0')}:00`

      if (automation.schedule_type === 'weekly' && automation.schedule_day !== null) {
        return `${scheduleLabel} - ${dayLabels[automation.schedule_day]} as ${hour}`
      }

      if (automation.schedule_type === 'monthly' && automation.schedule_day !== null) {
        return `${scheduleLabel} - Dia ${automation.schedule_day} as ${hour}`
      }

      return `${scheduleLabel} as ${hour}`
    }

    if (automation.trigger_type === 'one_time' && automation.one_time_datetime) {
      const date = new Date(automation.one_time_datetime)
      return `Unica vez - ${date.toLocaleDateString('pt-BR')} ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    }

    return 'Configuracao pendente'
  }

  const getNextRunText = () => {
    if (!automation.next_run_at) return null
    const nextRun = new Date(automation.next_run_at)
    const now = new Date()

    if (nextRun < now) return 'Pendente execucao'

    const diff = nextRun.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0) return `Em ${days} dia${days > 1 ? 's' : ''}`
    if (hours > 0) return `Em ${hours} hora${hours > 1 ? 's' : ''}`
    return 'Em breve'
  }

  const TriggerIcon = automation.trigger_type === 'event' ? Zap :
                     automation.trigger_type === 'scheduled' ? Calendar : Clock

  const triggerColor = automation.trigger_type === 'event' ? 'text-purple-600 bg-purple-100' :
                       automation.trigger_type === 'scheduled' ? 'text-orange-600 bg-orange-100' :
                       'text-blue-600 bg-blue-100'

  return (
    <div className={`bg-white rounded-lg border p-4 transition-all ${
      isActive ? 'border-green-200 shadow-sm' : 'border-gray-200'
    }`}>
      <div className="flex items-start justify-between">
        {/* Left side - Info */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`p-2 rounded-lg shrink-0 ${triggerColor}`}>
            <TriggerIcon className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-gray-900 truncate">{automation.name}</h4>
              {isActive ? (
                <span className="px-2 py-0.5 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                  Ativa
                </span>
              ) : automation.is_enabled && automation.is_paused ? (
                <span className="px-2 py-0.5 text-xs font-medium text-amber-700 bg-amber-100 rounded-full">
                  Pausada
                </span>
              ) : (
                <span className="px-2 py-0.5 text-xs font-medium text-gray-500 bg-gray-100 rounded-full">
                  Inativa
                </span>
              )}
            </div>

            {automation.description && (
              <p className="text-sm text-gray-500 truncate mt-0.5">{automation.description}</p>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
              {/* Email Type */}
              <div className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5 text-gray-400" />
                <span>{automation.email_config?.name_pt || automation.email_type}</span>
              </div>

              {/* Segment */}
              <div className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-gray-400" />
                <span>{segmentLabels[automation.segment_type] || automation.segment_type}</span>
              </div>

              {/* Trigger */}
              <div className="flex items-center gap-1">
                <TriggerIcon className="h-3.5 w-3.5 text-gray-400" />
                <span>{getTriggerDescription()}</span>
              </div>
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span>{automation.total_sent} enviados</span>
              {automation.last_run_at && (
                <span>
                  Ultima execucao: {new Date(automation.last_run_at).toLocaleDateString('pt-BR')}
                </span>
              )}
              {getNextRunText() && automation.is_enabled && (
                <span className="text-blue-600 font-medium">
                  Proxima: {getNextRunText()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-1 ml-4">
          {/* Enable/Disable Toggle */}
          <button
            onClick={() => onToggleEnabled(!automation.is_enabled)}
            className={`p-2 rounded-lg transition-colors ${
              automation.is_enabled
                ? 'text-green-600 hover:bg-green-50'
                : 'text-gray-400 hover:bg-gray-100'
            }`}
            title={automation.is_enabled ? 'Desativar' : 'Ativar'}
          >
            <div className={`w-8 h-5 rounded-full transition-colors ${
              automation.is_enabled ? 'bg-green-500' : 'bg-gray-300'
            }`}>
              <div className={`w-4 h-4 mt-0.5 rounded-full bg-white shadow transition-transform ${
                automation.is_enabled ? 'translate-x-3.5' : 'translate-x-0.5'
              }`} />
            </div>
          </button>

          {/* Pause (only when enabled) */}
          {automation.is_enabled && (
            <button
              onClick={() => onTogglePaused(!automation.is_paused)}
              className={`p-2 rounded-lg transition-colors ${
                automation.is_paused
                  ? 'text-amber-600 hover:bg-amber-50'
                  : 'text-gray-400 hover:bg-gray-100'
              }`}
              title={automation.is_paused ? 'Retomar' : 'Pausar'}
            >
              {automation.is_paused ? (
                <Play className="h-4 w-4" />
              ) : (
                <Pause className="h-4 w-4" />
              )}
            </button>
          )}

          {/* Manual Run */}
          <button
            onClick={onRun}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Executar agora"
          >
            <PlayCircle className="h-4 w-4" />
          </button>

          {/* Edit */}
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-lg transition-colors"
            title="Editar"
          >
            <Pencil className="h-4 w-4" />
          </button>

          {/* Delete */}
          <button
            onClick={onDelete}
            className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
            title="Excluir"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
