'use client'

import { useState, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import { Automation } from './email-automations'

interface EmailConfig {
  email_type: string
  name_pt: string
  category: string
}

interface AutomationFormModalProps {
  isOpen: boolean
  onClose: () => void
  automation: Automation | null
  onSave: (data: Partial<Automation>) => Promise<boolean>
}

const segmentOptions = [
  { value: 'all_users', label: 'Todos os usuarios' },
  { value: 'free', label: 'Plano Free' },
  { value: 'premium', label: 'Premium' },
  { value: 'premium_ai', label: 'Premium + IA' },
  { value: 'ecg_com_ja', label: 'ECG com JA' },
  { value: 'cortesia', label: 'Cortesia' },
  { value: 'active_7d', label: 'Ativos ultimos 7 dias' },
  { value: 'inactive_30d', label: 'Inativos ha 30+ dias' }
]

const eventOptions = [
  { value: 'user_signup', label: 'Cadastro de usuario' },
  { value: 'first_ecg_completed', label: 'Primeiro ECG completado' },
  { value: 'subscription_activated', label: 'Assinatura ativada' },
  { value: 'subscription_canceled', label: 'Assinatura cancelada' },
  { value: 'streak_lost', label: 'Streak perdido' },
  { value: 'streak_milestone', label: 'Marco de streak (7, 14, 30, 60, 100 dias)' },
  { value: 'level_up', label: 'Subiu de nivel' },
  { value: 'achievement_unlocked', label: 'Conquista desbloqueada' },
  { value: 'xp_event_created', label: 'Evento XP criado (2x/3x)' }
]

const scheduleOptions = [
  { value: 'daily', label: 'Diario' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensal' }
]

const dayOptions = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda' },
  { value: 2, label: 'Terca' },
  { value: 3, label: 'Quarta' },
  { value: 4, label: 'Quinta' },
  { value: 5, label: 'Sexta' },
  { value: 6, label: 'Sabado' }
]

export function AutomationFormModal({
  isOpen,
  onClose,
  automation,
  onSave
}: AutomationFormModalProps) {
  const [saving, setSaving] = useState(false)
  const [emailConfigs, setEmailConfigs] = useState<EmailConfig[]>([])

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [emailType, setEmailType] = useState('')
  const [segmentType, setSegmentType] = useState('all_users')
  const [triggerType, setTriggerType] = useState<'event' | 'scheduled' | 'one_time'>('scheduled')
  const [triggerEvent, setTriggerEvent] = useState('')
  const [triggerDelayHours, setTriggerDelayHours] = useState(0)
  const [scheduleType, setScheduleType] = useState('daily')
  const [scheduleDay, setScheduleDay] = useState<number | null>(null)
  const [scheduleHour, setScheduleHour] = useState(10)
  const [oneTimeDatetime, setOneTimeDatetime] = useState('')
  const [maxSendsPerUser, setMaxSendsPerUser] = useState<number | null>(null)
  const [minDaysBetweenSends, setMinDaysBetweenSends] = useState(1)
  const [isEnabled, setIsEnabled] = useState(false)

  // Fetch email configs
  useEffect(() => {
    async function fetchConfigs() {
      try {
        const res = await fetch('/api/admin/emails/config')
        if (res.ok) {
          const data = await res.json()
          setEmailConfigs(data.configs || [])
        }
      } catch (err) {
        console.error('Error fetching email configs:', err)
      }
    }
    if (isOpen) {
      fetchConfigs()
    }
  }, [isOpen])

  // Reset form when modal opens/automation changes
  useEffect(() => {
    if (isOpen) {
      if (automation) {
        setName(automation.name)
        setDescription(automation.description || '')
        setEmailType(automation.email_type)
        setSegmentType(automation.segment_type)
        setTriggerType(automation.trigger_type)
        setTriggerEvent(automation.trigger_event || '')
        setTriggerDelayHours(automation.trigger_delay_hours)
        setScheduleType(automation.schedule_type || 'daily')
        setScheduleDay(automation.schedule_day)
        setScheduleHour(automation.schedule_hour)
        setOneTimeDatetime(automation.one_time_datetime || '')
        setMaxSendsPerUser(automation.max_sends_per_user)
        setMinDaysBetweenSends(automation.min_days_between_sends)
        setIsEnabled(automation.is_enabled)
      } else {
        // Reset to defaults
        setName('')
        setDescription('')
        setEmailType('')
        setSegmentType('all_users')
        setTriggerType('scheduled')
        setTriggerEvent('')
        setTriggerDelayHours(0)
        setScheduleType('daily')
        setScheduleDay(null)
        setScheduleHour(10)
        setOneTimeDatetime('')
        setMaxSendsPerUser(null)
        setMinDaysBetweenSends(1)
        setIsEnabled(false)
      }
    }
  }, [isOpen, automation])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const success = await onSave({
        name,
        description: description || null,
        email_type: emailType,
        segment_type: segmentType,
        trigger_type: triggerType,
        trigger_event: triggerType === 'event' ? triggerEvent : null,
        trigger_delay_hours: triggerDelayHours,
        schedule_type: triggerType === 'scheduled' ? scheduleType : null,
        schedule_day: scheduleDay,
        schedule_hour: scheduleHour,
        one_time_datetime: triggerType === 'one_time' ? oneTimeDatetime : null,
        max_sends_per_user: maxSendsPerUser,
        min_days_between_sends: minDaysBetweenSends,
        is_enabled: isEnabled
      })

      if (success) {
        onClose()
      }
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  // Group email configs by category
  const groupedConfigs = emailConfigs.reduce((acc, config) => {
    if (!acc[config.category]) acc[config.category] = []
    acc[config.category].push(config)
    return acc
  }, {} as Record<string, EmailConfig[]>)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {automation ? 'Editar Automacao' : 'Nova Automacao'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-8rem)]">
          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">Informacoes Basicas</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: Boas-vindas para novos usuarios"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descricao
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Descricao opcional"
                />
              </div>
            </div>

            {/* Email & Segment */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-sm font-medium text-gray-700">E-mail e Segmento</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template de E-mail *
                </label>
                <select
                  value={emailType}
                  onChange={(e) => setEmailType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Selecione um template</option>
                  {Object.entries(groupedConfigs).map(([category, configs]) => (
                    <optgroup key={category} label={category.toUpperCase()}>
                      {configs.map(config => (
                        <option key={config.email_type} value={config.email_type}>
                          {config.name_pt}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Segmento de Usuarios *
                </label>
                <select
                  value={segmentType}
                  onChange={(e) => setSegmentType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {segmentOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Trigger */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-sm font-medium text-gray-700">Gatilho</h3>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="triggerType"
                    value="scheduled"
                    checked={triggerType === 'scheduled'}
                    onChange={(e) => setTriggerType(e.target.value as typeof triggerType)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm">Agendado</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="triggerType"
                    value="event"
                    checked={triggerType === 'event'}
                    onChange={(e) => setTriggerType(e.target.value as typeof triggerType)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm">Evento</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="triggerType"
                    value="one_time"
                    checked={triggerType === 'one_time'}
                    onChange={(e) => setTriggerType(e.target.value as typeof triggerType)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm">Unica vez</span>
                </label>
              </div>

              {/* Event config */}
              {triggerType === 'event' && (
                <div className="space-y-4 bg-purple-50 p-4 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Evento *
                    </label>
                    <select
                      value={triggerEvent}
                      onChange={(e) => setTriggerEvent(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required={triggerType === 'event'}
                    >
                      <option value="">Selecione um evento</option>
                      {eventOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Atraso apos evento (horas)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={triggerDelayHours}
                      onChange={(e) => setTriggerDelayHours(parseInt(e.target.value) || 0)}
                      className="w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      0 = enviar imediatamente
                    </p>
                  </div>
                </div>
              )}

              {/* Schedule config */}
              {triggerType === 'scheduled' && (
                <div className="space-y-4 bg-orange-50 p-4 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Frequencia *
                    </label>
                    <select
                      value={scheduleType}
                      onChange={(e) => {
                        setScheduleType(e.target.value)
                        setScheduleDay(null)
                      }}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {scheduleOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {scheduleType === 'weekly' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dia da semana *
                      </label>
                      <select
                        value={scheduleDay ?? ''}
                        onChange={(e) => setScheduleDay(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required={scheduleType === 'weekly'}
                      >
                        <option value="">Selecione</option>
                        {dayOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {scheduleType === 'monthly' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dia do mes *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={scheduleDay ?? ''}
                        onChange={(e) => setScheduleDay(parseInt(e.target.value) || null)}
                        className="w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required={scheduleType === 'monthly'}
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Horario *
                    </label>
                    <select
                      value={scheduleHour}
                      onChange={(e) => setScheduleHour(parseInt(e.target.value))}
                      className="w-32 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>
                          {String(i).padStart(2, '0')}:00
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      Horario de Brasilia
                    </p>
                  </div>
                </div>
              )}

              {/* One-time config */}
              {triggerType === 'one_time' && (
                <div className="space-y-4 bg-blue-50 p-4 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data e hora *
                    </label>
                    <input
                      type="datetime-local"
                      value={oneTimeDatetime ? oneTimeDatetime.slice(0, 16) : ''}
                      onChange={(e) => setOneTimeDatetime(e.target.value ? new Date(e.target.value).toISOString() : '')}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required={triggerType === 'one_time'}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Limits */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-sm font-medium text-gray-700">Limites</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max envios por usuario
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={maxSendsPerUser ?? ''}
                    onChange={(e) => setMaxSendsPerUser(e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ilimitado"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min dias entre envios
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={minDaysBetweenSends}
                    onChange={(e) => setMinDaysBetweenSends(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Enable */}
            <div className="pt-4 border-t">
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  className={`w-10 h-6 rounded-full transition-colors ${
                    isEnabled ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                  onClick={() => setIsEnabled(!isEnabled)}
                >
                  <div className={`w-5 h-5 mt-0.5 rounded-full bg-white shadow transition-transform ${
                    isEnabled ? 'translate-x-4.5' : 'translate-x-0.5'
                  }`} style={{ transform: isEnabled ? 'translateX(18px)' : 'translateX(2px)' }} />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {isEnabled ? 'Ativar automacao ao salvar' : 'Salvar desativada'}
                </span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {automation ? 'Salvar Alteracoes' : 'Criar Automacao'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
