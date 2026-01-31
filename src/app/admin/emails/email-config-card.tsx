'use client'

import { useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  Send,
  Eye,
  Save,
  Loader2
} from 'lucide-react'

interface EmailConfig {
  email_type: string
  category: string
  name_pt: string
  description_pt: string | null
  is_enabled: boolean
  trigger_config: Record<string, unknown>
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

export function EmailConfigCard({
  config,
  stats,
  categoryColor,
  onToggleEnabled,
  onUpdateConfig,
  onTest,
  onPreview
}: EmailConfigCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isToggling, setIsToggling] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [localConfig, setLocalConfig] = useState<Record<string, unknown>>(config.trigger_config)
  const [hasChanges, setHasChanges] = useState(false)

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
        </div>
      )}
    </div>
  )
}
