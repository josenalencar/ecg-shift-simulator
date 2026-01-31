'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Mail,
  Send,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Eye,
  Settings2,
  BarChart3,
  Users
} from 'lucide-react'
import { EmailConfigCard } from './email-config-card'
import { EmailTestModal } from './email-test-modal'
import { EmailPreviewModal } from './email-preview-modal'

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
  totals: {
    all_time: number
    last_7_days: number
    last_30_days: number
    enabled: number
    total: number
  }
  by_type: Array<{
    email_type: string
    count: number
    last_7_days: number
    last_30_days: number
    last_sent: string | null
  }>
  by_day: Array<{
    date: string
    count: number
  }>
}

interface UserPrefsStats {
  total_users: number
  users_with_preferences: number
  by_preference: Record<string, { enabled: number; disabled: number }>
}

type TabType = 'overview' | 'analytics' | 'preferences'

const categoryConfig = {
  account: {
    label: 'Conta',
    color: 'blue',
    bgClass: 'bg-blue-50',
    borderClass: 'border-blue-200',
    textClass: 'text-blue-700',
    iconBg: 'bg-blue-100'
  },
  onboarding: {
    label: 'Onboarding',
    color: 'green',
    bgClass: 'bg-green-50',
    borderClass: 'border-green-200',
    textClass: 'text-green-700',
    iconBg: 'bg-green-100'
  },
  engagement: {
    label: 'Engajamento',
    color: 'purple',
    bgClass: 'bg-purple-50',
    borderClass: 'border-purple-200',
    textClass: 'text-purple-700',
    iconBg: 'bg-purple-100'
  }
}

export function EmailDashboard() {
  const [configs, setConfigs] = useState<EmailConfig[]>([])
  const [stats, setStats] = useState<EmailStats | null>(null)
  const [userPrefs, setUserPrefs] = useState<UserPrefsStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['account', 'onboarding', 'engagement'])
  )
  const [testModalOpen, setTestModalOpen] = useState(false)
  const [testEmailType, setTestEmailType] = useState<string | null>(null)
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [previewEmailType, setPreviewEmailType] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const [configRes, statsRes] = await Promise.all([
        fetch('/api/admin/emails/config'),
        fetch('/api/admin/emails/stats')
      ])

      if (configRes.ok) {
        const configData = await configRes.json()
        setConfigs(configData.configs || [])
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }
    } catch (error) {
      console.error('Error fetching email data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchUserPrefs = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/emails/user-preferences')
      if (res.ok) {
        const data = await res.json()
        setUserPrefs(data)
      }
    } catch (error) {
      console.error('Error fetching user preferences:', error)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (activeTab === 'preferences' && !userPrefs) {
      fetchUserPrefs()
    }
  }, [activeTab, userPrefs, fetchUserPrefs])

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  const handleToggleEnabled = async (emailType: string, enabled: boolean) => {
    try {
      const res = await fetch('/api/admin/emails/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_type: emailType, is_enabled: enabled })
      })

      if (res.ok) {
        setConfigs(prev =>
          prev.map(c =>
            c.email_type === emailType ? { ...c, is_enabled: enabled } : c
          )
        )
      }
    } catch (error) {
      console.error('Error toggling email:', error)
    }
  }

  const handleUpdateConfig = async (emailType: string, triggerConfig: Record<string, unknown>) => {
    try {
      const res = await fetch('/api/admin/emails/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_type: emailType, trigger_config: triggerConfig })
      })

      if (res.ok) {
        setConfigs(prev =>
          prev.map(c =>
            c.email_type === emailType ? { ...c, trigger_config: triggerConfig } : c
          )
        )
        return true
      }
      return false
    } catch (error) {
      console.error('Error updating config:', error)
      return false
    }
  }

  const handleTest = (emailType: string) => {
    setTestEmailType(emailType)
    setTestModalOpen(true)
  }

  const handlePreview = (emailType: string) => {
    setPreviewEmailType(emailType)
    setPreviewModalOpen(true)
  }

  const getStatsForType = (emailType: string) => {
    return stats?.by_type.find(s => s.email_type === emailType)
  }

  // Group configs by category
  const groupedConfigs = configs.reduce((acc, config) => {
    if (!acc[config.category]) {
      acc[config.category] = []
    }
    acc[config.category].push(config)
    return acc
  }, {} as Record<string, EmailConfig[]>)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de E-mails</h1>
          <p className="text-gray-600 mt-1">
            Configure, teste e monitore todos os e-mails da plataforma
          </p>
        </div>
        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
          Master Admin
        </span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Send className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.totals.all_time.toLocaleString() || 0}
              </p>
              <p className="text-sm text-gray-500">Total Enviados</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Mail className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.totals.last_7_days || 0}
              </p>
              <p className="text-sm text-gray-500">Ultimos 7 dias</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.totals.last_30_days || 0}
              </p>
              <p className="text-sm text-gray-500">Ultimos 30 dias</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.totals.enabled}/{stats?.totals.total}
              </p>
              <p className="text-sm text-gray-500">Ativos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Settings2 className="h-4 w-4 inline-block mr-2" />
            Visao Geral
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'analytics'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <BarChart3 className="h-4 w-4 inline-block mr-2" />
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'preferences'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="h-4 w-4 inline-block mr-2" />
            Preferencias
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {(['account', 'onboarding', 'engagement'] as const).map(category => {
            const config = categoryConfig[category]
            const emails = groupedConfigs[category] || []
            const isExpanded = expandedCategories.has(category)
            const enabledCount = emails.filter(e => e.is_enabled).length

            return (
              <div
                key={category}
                className={`rounded-lg border ${config.borderClass} ${config.bgClass} overflow-hidden`}
              >
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 ${config.iconBg} rounded-lg`}>
                      <Mail className={`h-5 w-5 ${config.textClass}`} />
                    </div>
                    <div className="text-left">
                      <h3 className={`font-semibold ${config.textClass}`}>
                        {config.label.toUpperCase()}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {emails.length} e-mails • {enabledCount} ativos
                      </p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </button>

                {/* Email Cards */}
                {isExpanded && (
                  <div className="border-t border-white/50 bg-white/30 p-4 space-y-3">
                    {emails.map(email => (
                      <EmailConfigCard
                        key={email.email_type}
                        config={email}
                        stats={getStatsForType(email.email_type)}
                        categoryColor={config.color}
                        onToggleEnabled={(enabled) => handleToggleEnabled(email.email_type, enabled)}
                        onUpdateConfig={(triggerConfig) => handleUpdateConfig(email.email_type, triggerConfig)}
                        onTest={() => handleTest(email.email_type)}
                        onPreview={() => handlePreview(email.email_type)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Volume de E-mails (30 dias)</h3>

          {/* Simple bar chart */}
          <div className="h-48 flex items-end gap-1">
            {stats?.by_day.slice(-30).map((day, i) => {
              const maxCount = Math.max(...(stats?.by_day.map(d => d.count) || [1]))
              const height = (day.count / maxCount) * 100

              return (
                <div
                  key={day.date}
                  className="flex-1 bg-blue-500 rounded-t hover:bg-blue-600 transition-colors group relative"
                  style={{ height: `${Math.max(height, 2)}%` }}
                  title={`${day.date}: ${day.count} e-mails`}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {day.date}: {day.count}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Top emails table */}
          <div className="mt-8">
            <h4 className="font-medium text-gray-700 mb-3">Emails Mais Enviados</h4>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-sm font-medium text-gray-500">Tipo</th>
                    <th className="text-right py-2 text-sm font-medium text-gray-500">Total</th>
                    <th className="text-right py-2 text-sm font-medium text-gray-500">7 dias</th>
                    <th className="text-right py-2 text-sm font-medium text-gray-500">30 dias</th>
                    <th className="text-right py-2 text-sm font-medium text-gray-500">Ultimo envio</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.by_type
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 10)
                    .map(item => {
                      const config = configs.find(c => c.email_type === item.email_type)
                      return (
                        <tr key={item.email_type} className="border-b last:border-0">
                          <td className="py-2">
                            <div className="flex items-center gap-2">
                              {config?.is_enabled ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-gray-400" />
                              )}
                              <span className="text-sm">{config?.name_pt || item.email_type}</span>
                            </div>
                          </td>
                          <td className="text-right py-2 text-sm font-medium">{item.count}</td>
                          <td className="text-right py-2 text-sm text-gray-600">{item.last_7_days}</td>
                          <td className="text-right py-2 text-sm text-gray-600">{item.last_30_days}</td>
                          <td className="text-right py-2 text-sm text-gray-500">
                            {item.last_sent
                              ? new Date(item.last_sent).toLocaleDateString('pt-BR')
                              : '-'}
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'preferences' && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Preferencias dos Usuarios</h3>

          {userPrefs ? (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-3xl font-bold text-gray-900">{userPrefs.total_users}</p>
                  <p className="text-sm text-gray-500">Total de usuarios</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-3xl font-bold text-gray-900">{userPrefs.users_with_preferences}</p>
                  <p className="text-sm text-gray-500">Com preferencias configuradas</p>
                </div>
              </div>

              {/* Preference breakdown */}
              <div className="space-y-3">
                {Object.entries(userPrefs.by_preference).map(([key, value]) => {
                  const total = value.enabled + value.disabled
                  const enabledPct = total > 0 ? (value.enabled / total) * 100 : 100

                  const labels: Record<string, string> = {
                    emails_enabled: 'E-mails Habilitados (Master)',
                    marketing_emails: 'E-mails de Marketing',
                    onboarding_emails: 'E-mails de Onboarding',
                    streak_emails: 'E-mails de Streak',
                    achievement_emails: 'E-mails de Conquistas',
                    weekly_digest: 'Resumo Semanal',
                    monthly_report: 'Relatorio Mensal'
                  }

                  return (
                    <div key={key} className="flex items-center gap-4">
                      <div className="w-48 text-sm text-gray-700">{labels[key] || key}</div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full transition-all"
                            style={{ width: `${enabledPct}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-24 text-right text-sm">
                        <span className="text-green-600 font-medium">{value.enabled}</span>
                        <span className="text-gray-400"> / </span>
                        <span className="text-gray-600">{total}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <EmailTestModal
        isOpen={testModalOpen}
        onClose={() => setTestModalOpen(false)}
        emailType={testEmailType}
        emailName={configs.find(c => c.email_type === testEmailType)?.name_pt || ''}
      />

      <EmailPreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        emailType={previewEmailType}
        emailName={configs.find(c => c.email_type === previewEmailType)?.name_pt || ''}
      />
    </div>
  )
}
