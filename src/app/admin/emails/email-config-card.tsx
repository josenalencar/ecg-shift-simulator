'use client'

import { useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  Send,
  Eye,
  Save,
  Loader2,
  Code,
  Trash2,
  Copy,
  MoreVertical,
  Download,
  Clock
} from 'lucide-react'
import { EmailEditor } from './email-editor'

interface EmailConfig {
  email_type: string
  category: string
  name_pt: string
  description_pt: string | null
  is_enabled: boolean
  trigger_config: Record<string, unknown>
  custom_html: string | null
  custom_subject: string | null
  use_custom_template: boolean
  created_at: string
  updated_at: string
}

interface EmailStats {
  email_type: string
  count: number
  last_7_days: number
  last_30_days: number
  last_sent: string | null
}

interface EmailConfigCardProps {
  config: EmailConfig
  stats?: EmailStats
  categoryColor: string
  onToggleEnabled: (enabled: boolean) => Promise<void>
  onUpdateConfig: (triggerConfig: Record<string, unknown>) => Promise<boolean>
  onUpdateCustomTemplate: (html: string, subject: string, useCustom: boolean) => Promise<boolean>
  onResetTemplate: () => Promise<boolean>
  onDelete?: () => void
  onDuplicate?: () => void
  onTest: () => void
  onPreview: () => void
}

// Define which fields are editable for each email type
const editableFields: Record<string, Array<{ key: string; label: string; type: 'number' | 'array' }>> = {
  renewal_reminder: [
    { key: 'days_before', label: 'Dias antes da renovacao', type: 'number' }
  ],
  day2: [
    { key: 'trigger_day', label: 'Dia do trigger', type: 'number' }
  ],
  day3: [
    { key: 'trigger_day', label: 'Dia do trigger', type: 'number' }
  ],
  day5: [
    { key: 'trigger_day', label: 'Dia do trigger', type: 'number' }
  ],
  day7: [
    { key: 'trigger_day', label: 'Dia do trigger', type: 'number' }
  ],
  streak_starter: [
    { key: 'min_previous_streak', label: 'Streak minimo anterior', type: 'number' }
  ],
  streak_at_risk: [
    { key: 'min_streak', label: 'Streak minimo', type: 'number' },
    { key: 'hours_before_expire', label: 'Horas antes de expirar', type: 'number' }
  ],
  streak_milestone: [
    { key: 'milestones', label: 'Marcos (separados por virgula)', type: 'array' }
  ],
  weekly_digest: [
    { key: 'send_day', label: 'Dia da semana (0=Dom)', type: 'number' },
    { key: 'send_hour', label: 'Hora do envio', type: 'number' }
  ],
  monthly_report: [
    { key: 'send_day', label: 'Dia do mes', type: 'number' },
    { key: 'send_hour', label: 'Hora do envio', type: 'number' }
  ]
}

// Default email subjects for reference
const defaultSubjects: Record<string, string> = {
  welcome: 'Bem-vindo ao Plantao ECG!',
  subscription_activated: 'Sua assinatura foi ativada!',
  subscription_canceled: 'Assinatura cancelada',
  payment_failed: 'Problema com seu pagamento',
  password_reset: 'Redefinir sua senha',
  renewal_reminder: 'Lembrete: sua assinatura sera renovada',
  first_case: 'Primeiro ECG concluido!',
  day2: 'Dia 2 - Continue sua jornada',
  day3: 'Dia 3 - Seu progresso ate agora',
  day5: 'Dia 5 - Recursos para explorar',
  day7: 'Dia 7 - Resumo da sua primeira semana',
  streak_starter: 'Hora de recomecar seu streak!',
  streak_at_risk: 'Seu streak de {{streak}} dias esta em risco!',
  streak_milestone: '{{streak}} DIAS! Voce e incrivel!',
  level_up: 'Parabens! Voce subiu para o Level {{level}}!',
  achievement: 'Nova conquista desbloqueada!',
  weekly_digest: 'Sua semana em numeros',
  monthly_report: 'Seu relatorio mensal chegou',
  xp_event_announcement: 'Evento de XP em andamento!'
}

export function EmailConfigCard({
  config,
  stats,
  categoryColor,
  onToggleEnabled,
  onUpdateConfig,
  onUpdateCustomTemplate,
  onResetTemplate,
  onDelete,
  onDuplicate,
  onTest,
  onPreview
}: EmailConfigCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isToggling, setIsToggling] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [localConfig, setLocalConfig] = useState<Record<string, unknown>>(config.trigger_config)
  const [hasChanges, setHasChanges] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const fields = editableFields[config.email_type] || []
  const hasEditableFields = fields.length > 0

  const handleToggle = async () => {
    setIsToggling(true)
    await onToggleEnabled(!config.is_enabled)
    setIsToggling(false)
  }

  const handleFieldChange = (key: string, value: string, type: 'number' | 'array') => {
    let parsedValue: unknown

    if (type === 'number') {
      parsedValue = parseInt(value, 10) || 0
    } else if (type === 'array') {
      parsedValue = value.split(',').map(v => parseInt(v.trim(), 10)).filter(n => !isNaN(n))
    }

    setLocalConfig(prev => ({ ...prev, [key]: parsedValue }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    const success = await onUpdateConfig(localConfig)
    if (success) {
      setHasChanges(false)
    }
    setIsSaving(false)
  }

  const getFieldValue = (key: string, type: 'number' | 'array'): string => {
    const value = localConfig[key]
    if (type === 'array' && Array.isArray(value)) {
      return value.join(', ')
    }
    return String(value ?? '')
  }

  const colorClasses: Record<string, { toggle: string; border: string }> = {
    blue: { toggle: 'bg-blue-500', border: 'border-blue-200' },
    green: { toggle: 'bg-green-500', border: 'border-green-200' },
    purple: { toggle: 'bg-purple-500', border: 'border-purple-200' }
  }

  const colors = colorClasses[categoryColor] || colorClasses.blue

  return (
    <div className={`bg-white rounded-lg border ${colors.border} overflow-hidden`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Toggle */}
          <button
            onClick={handleToggle}
            disabled={isToggling}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              config.is_enabled ? colors.toggle : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.is_enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
            {isToggling && (
              <Loader2 className="h-3 w-3 animate-spin absolute left-1/2 -translate-x-1/2" />
            )}
          </button>

          {/* Name & Description */}
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-gray-900 truncate">{config.name_pt}</h4>
            {config.description_pt && (
              <p className="text-sm text-gray-500 truncate">{config.description_pt}</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-500 mr-4">
          <div className="text-center">
            <p className="font-medium text-gray-900">{stats?.last_7_days || 0}</p>
            <p className="text-xs">7 dias</p>
          </div>
          <div className="text-center">
            <p className="font-medium text-gray-900">{stats?.last_30_days || 0}</p>
            <p className="text-xs">30 dias</p>
          </div>
        </div>

        {/* More Options Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreVertical className="h-4 w-4 text-gray-400" />
          </button>
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border z-20 py-1">
                <button
                  onClick={() => {
                    onTest()
                    setShowMenu(false)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Send className="h-4 w-4" />
                  Enviar Teste
                </button>
                <button
                  onClick={() => {
                    onPreview()
                    setShowMenu(false)
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Eye className="h-4 w-4" />
                  Ver Preview
                </button>
                {onDuplicate && (
                  <button
                    onClick={() => {
                      onDuplicate()
                      setShowMenu(false)
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Copy className="h-4 w-4" />
                    Duplicar
                  </button>
                )}
                <button
                  onClick={() => {
                    // Export template as HTML file
                    const html = config.custom_html || ''
                    const blob = new Blob([html], { type: 'text/html' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `${config.email_type}.html`
                    a.click()
                    URL.revokeObjectURL(url)
                    setShowMenu(false)
                  }}
                  disabled={!config.custom_html}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="h-4 w-4" />
                  Exportar HTML
                </button>
                {onDelete && (
                  <>
                    <div className="border-t my-1" />
                    <button
                      onClick={() => {
                        onDelete()
                        setShowMenu(false)
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Excluir Template
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Expand Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t px-4 py-4 space-y-4">
          {/* Description */}
          {config.description_pt && (
            <p className="text-sm text-gray-600">{config.description_pt}</p>
          )}

          {/* Editable Fields */}
          {hasEditableFields && (
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-gray-700">Configuracoes</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {fields.map(field => (
                  <div key={field.key}>
                    <label className="block text-xs text-gray-500 mb-1">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      value={getFieldValue(field.key, field.type)}
                      onChange={(e) => handleFieldChange(field.key, e.target.value, field.type)}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm">
            <div>
              <span className="text-gray-500">Total enviados:</span>{' '}
              <span className="font-medium">{stats?.count || 0}</span>
            </div>
            {stats?.last_sent && (
              <div>
                <span className="text-gray-500">Ultimo envio:</span>{' '}
                <span className="font-medium">
                  {new Date(stats.last_sent).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={onTest}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Send className="h-4 w-4" />
              Enviar Teste
            </button>
            <button
              onClick={onPreview}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Eye className="h-4 w-4" />
              Ver Preview
            </button>
            {hasChanges && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Salvar
              </button>
            )}
          </div>

          {/* HTML Editor Section */}
          <div className="border-t pt-4 mt-4">
            <div className="flex items-center gap-2 mb-2">
              <Code className="h-4 w-4 text-gray-500" />
              <h5 className="text-sm font-medium text-gray-700">Editor de Template</h5>
            </div>
            <EmailEditor
              emailType={config.email_type}
              currentHtml={config.custom_html}
              currentSubject={config.custom_subject}
              isUsingCustom={config.use_custom_template}
              defaultSubject={defaultSubjects[config.email_type] || 'Plantao ECG'}
              onSave={onUpdateCustomTemplate}
              onReset={onResetTemplate}
            />
          </div>
        </div>
      )}
    </div>
  )
}
