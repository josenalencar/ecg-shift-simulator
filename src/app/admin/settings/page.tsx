'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '@/components/ui'
import { Settings, Database, Image, Bell, Shield, Save, RefreshCw, Lock, Crown, UserPlus, UserMinus, Loader2, Trophy, Building2, Zap, Target, Flame, Calendar, Award, ChevronDown, ChevronUp, RotateCcw, Plus, Trash2 } from 'lucide-react'
import { CATEGORIES, DIFFICULTIES } from '@/lib/ecg-constants'

type AdminProfile = {
  id: string
  email: string
  full_name: string | null
  role: string
  is_master_admin: boolean
}

type HospitalWeights = {
  pronto_socorro: {
    categories: Record<string, number>
    difficulties: Record<string, number>
  }
  hospital_geral: {
    categories: Record<string, number>
    difficulties: Record<string, number>
  }
  hospital_cardiologico: {
    categories: Record<string, number>
    difficulties: Record<string, number>
  }
}

type GamificationConfig = {
  xp_per_ecg_base: number
  xp_per_score_point: number
  xp_difficulty_multipliers: { easy: number; medium: number; hard: number }
  xp_streak_bonus_per_day: number
  xp_streak_bonus_max: number
  xp_perfect_bonus: number
  level_multiplier_per_level: number
  max_level: number
  xp_per_level_base: number
  xp_per_level_growth: number
  event_2x_bonus: number
  event_3x_bonus: number
  streak_grace_period_hours: number
  inactivity_email_days: number[]
  inactivity_event_duration_hours: number
  ranking_top_n_visible: number
}

type XPEvent = {
  id: string
  name: string
  description: string | null
  multiplier_type: '2x' | '3x'
  start_at: string
  end_at: string
  target_type: string
  is_active: boolean
  created_at: string
}

type Achievement = {
  id: string
  slug: string
  name_pt: string
  description_pt: string
  icon: string
  rarity: string
  category: string
  is_active: boolean
  is_hidden: boolean
  xp_reward: number
  unlocks: number
  unlock_percentage: number
}

const defaultGamificationConfig: GamificationConfig = {
  xp_per_ecg_base: 10,
  xp_per_score_point: 0.5,
  xp_difficulty_multipliers: { easy: 0.8, medium: 1.0, hard: 1.3 },
  xp_streak_bonus_per_day: 0.5,
  xp_streak_bonus_max: 15,
  xp_perfect_bonus: 25,
  level_multiplier_per_level: 0.002525,
  max_level: 100,
  xp_per_level_base: 100,
  xp_per_level_growth: 1.15,
  event_2x_bonus: 0.125,
  event_3x_bonus: 0.25,
  streak_grace_period_hours: 36,
  inactivity_email_days: [7, 30, 60],
  inactivity_event_duration_hours: 24,
  ranking_top_n_visible: 10,
}

const defaultHospitalWeights: HospitalWeights = {
  pronto_socorro: {
    categories: { arrhythmia: 3, ischemia: 3, conduction: 2, normal: 1, other: 1 },
    difficulties: { easy: 1, medium: 2, hard: 2 }
  },
  hospital_geral: {
    categories: { arrhythmia: 1, ischemia: 1, conduction: 1, normal: 3, other: 2 },
    difficulties: { easy: 2, medium: 2, hard: 1 }
  },
  hospital_cardiologico: {
    categories: { arrhythmia: 2, ischemia: 2, conduction: 2, normal: 1, other: 1 },
    difficulties: { easy: 1, medium: 2, hard: 3 }
  }
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [isMasterAdmin, setIsMasterAdmin] = useState(false)
  const [currentUserEmail, setCurrentUserEmail] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [admins, setAdmins] = useState<AdminProfile[]>([])
  const [hospitalWeights, setHospitalWeights] = useState<HospitalWeights>(defaultHospitalWeights)
  const [gamificationConfig, setGamificationConfig] = useState<GamificationConfig>(defaultGamificationConfig)
  const [xpEvents, setXpEvents] = useState<XPEvent[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [achievementFilter, setAchievementFilter] = useState<string>('all')
  const [isSavingGamification, setIsSavingGamification] = useState(false)
  const [newEvent, setNewEvent] = useState({
    name: '',
    description: '',
    multiplier_type: '2x' as '2x' | '3x',
    start_at: '',
    end_at: '',
    target_type: 'all',
  })
  const [settings, setSettings] = useState({
    passScore: 80,
    heartRateTolerance: 10,
    allowRetakes: true,
    showCorrectAnswers: true,
    emailNotifications: true,
    // Ranking settings
    rankingGradeWeight: 70,
    rankingActivityWeight: 30,
    rankingTopCount: 10,
    rankingShowNames: true,
    rankingMinAttempts: 3,
    // Difficulty weights for scoring
    difficultyWeightEasy: 1.0,
    difficultyWeightMedium: 1.25,
    difficultyWeightHard: 1.5,
  })

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function checkMasterAdmin() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setCurrentUserEmail(user.email || '')

      // Check if user is master admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_master_admin')
        .eq('id', user.id)
        .single()

      const profileData = profile as { is_master_admin: boolean } | null
      setIsMasterAdmin(profileData?.is_master_admin || false)

      // Load all admins if master admin
      if (profileData?.is_master_admin) {
        const { data: adminsData } = await supabase
          .from('profiles')
          .select('id, email, full_name, role, is_master_admin')
          .eq('role', 'admin')
          .order('email')

        setAdmins((adminsData as AdminProfile[]) || [])

        // Load hospital weights
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: settingsData } = await (supabase as any)
          .from('admin_settings')
          .select('hospital_weights')
          .eq('id', 'default')
          .single()

        if (settingsData?.hospital_weights) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const weights = settingsData.hospital_weights as any
          // Handle migration from old keys to new keys
          const normalizedWeights: HospitalWeights = {
            pronto_socorro: weights.pronto_socorro || weights.emergency || defaultHospitalWeights.pronto_socorro,
            hospital_geral: weights.hospital_geral || weights.general || defaultHospitalWeights.hospital_geral,
            hospital_cardiologico: weights.hospital_cardiologico || weights.cardiology || defaultHospitalWeights.hospital_cardiologico,
          }
          setHospitalWeights(normalizedWeights)
        }

        // Load gamification config
        try {
          const configRes = await fetch('/api/admin/gamification/config')
          if (configRes.ok) {
            const configData = await configRes.json()
            setGamificationConfig(configData)
          }
        } catch (err) {
          console.error('Failed to load gamification config:', err)
        }

        // Load XP events
        try {
          const eventsRes = await fetch('/api/admin/gamification/events')
          if (eventsRes.ok) {
            const eventsData = await eventsRes.json()
            setXpEvents(eventsData.events || [])
          }
        } catch (err) {
          console.error('Failed to load XP events:', err)
        }

        // Load achievements
        try {
          const achievementsRes = await fetch('/api/admin/gamification/achievements')
          if (achievementsRes.ok) {
            const achievementsData = await achievementsRes.json()
            setAchievements(achievementsData.achievements || [])
          }
        } catch (err) {
          console.error('Failed to load achievements:', err)
        }
      }

      setLoading(false)
    }

    checkMasterAdmin()
  }, [supabase, router])

  async function handleSave() {
    if (!isMasterAdmin) return
    setIsSaving(true)

    try {
      // Save hospital weights to database
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('admin_settings')
        .update({ hospital_weights: hospitalWeights })
        .eq('id', 'default')

      if (error) {
        alert('Erro ao salvar: ' + error.message)
      } else {
        alert('Configuracoes salvas com sucesso!')
      }
    } catch (err) {
      alert('Erro ao salvar configuracoes')
    }

    setIsSaving(false)
  }

  function updateHospitalWeight(
    hospitalType: 'pronto_socorro' | 'hospital_geral' | 'hospital_cardiologico',
    weightType: 'categories' | 'difficulties',
    key: string,
    value: number
  ) {
    setHospitalWeights(prev => ({
      ...prev,
      [hospitalType]: {
        ...prev[hospitalType],
        [weightType]: {
          ...prev[hospitalType][weightType],
          [key]: value
        }
      }
    }))
  }

  async function handleSaveGamification() {
    if (!isMasterAdmin) return
    setIsSavingGamification(true)

    try {
      const res = await fetch('/api/admin/gamification/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gamificationConfig),
      })

      if (!res.ok) {
        const data = await res.json()
        alert('Erro ao salvar: ' + data.error)
      } else {
        alert('Configuracoes de gamificacao salvas com sucesso!')
      }
    } catch (err) {
      alert('Erro ao salvar configuracoes de gamificacao')
    }

    setIsSavingGamification(false)
  }

  async function handleCreateEvent() {
    if (!newEvent.name || !newEvent.start_at || !newEvent.end_at) {
      alert('Preencha todos os campos obrigatorios')
      return
    }

    try {
      const res = await fetch('/api/admin/gamification/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent),
      })

      if (!res.ok) {
        const data = await res.json()
        alert('Erro ao criar evento: ' + data.error)
        return
      }

      // Refresh events
      const eventsRes = await fetch('/api/admin/gamification/events')
      if (eventsRes.ok) {
        const eventsData = await eventsRes.json()
        setXpEvents(eventsData.events || [])
      }

      // Reset form
      setNewEvent({
        name: '',
        description: '',
        multiplier_type: '2x',
        start_at: '',
        end_at: '',
        target_type: 'all',
      })

      alert('Evento criado com sucesso!')
    } catch (err) {
      alert('Erro ao criar evento')
    }
  }

  async function handleDeleteEvent(eventId: string) {
    if (!confirm('Tem certeza que deseja desativar este evento?')) return

    try {
      const res = await fetch(`/api/admin/gamification/events?id=${eventId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        alert('Erro ao desativar evento: ' + data.error)
        return
      }

      // Refresh events
      const eventsRes = await fetch('/api/admin/gamification/events')
      if (eventsRes.ok) {
        const eventsData = await eventsRes.json()
        setXpEvents(eventsData.events || [])
      }
    } catch (err) {
      alert('Erro ao desativar evento')
    }
  }

  async function handleToggleAchievement(achievementId: string, field: 'is_active' | 'is_hidden', value: boolean) {
    try {
      const res = await fetch('/api/admin/gamification/achievements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: achievementId, [field]: value }),
      })

      if (res.ok) {
        setAchievements(prev => prev.map(a =>
          a.id === achievementId ? { ...a, [field]: value } : a
        ))
      }
    } catch (err) {
      console.error('Failed to update achievement:', err)
    }
  }

  function toggleSection(section: string) {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  function resetToDefaults() {
    if (confirm('Tem certeza que deseja restaurar as configuracoes padrao de gamificacao?')) {
      setGamificationConfig(defaultGamificationConfig)
    }
  }

  // Calculate example XP for preview
  function calculateExampleXP(score: number, difficulty: 'easy' | 'medium' | 'hard', level: number, event: '2x' | '3x' | null) {
    const diffMult = gamificationConfig.xp_difficulty_multipliers[difficulty]
    const baseXP = gamificationConfig.xp_per_ecg_base + (score * gamificationConfig.xp_per_score_point)
    const rawXP = baseXP * diffMult
    const levelMult = 1 + (level - 1) * gamificationConfig.level_multiplier_per_level
    const eventBonus = event === '2x' ? gamificationConfig.event_2x_bonus : event === '3x' ? gamificationConfig.event_3x_bonus : 0
    return Math.round(rawXP * (levelMult + eventBonus))
  }

  async function toggleMasterAdmin(adminId: string, adminEmail: string, currentStatus: boolean) {
    if (!isMasterAdmin) return

    // Cannot remove master admin status from yourself
    if (adminEmail === currentUserEmail && currentStatus) {
      alert('Voce nao pode remover seu proprio status de Master Admin')
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('profiles') as any)
      .update({ is_master_admin: !currentStatus })
      .eq('id', adminId)

    if (error) {
      alert('Erro ao atualizar: ' + error.message)
      return
    }

    // Refresh admins list
    const { data: adminsData } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, is_master_admin')
      .eq('role', 'admin')
      .order('email')

    setAdmins((adminsData as AdminProfile[]) || [])
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  // Not a master admin - show locked screen
  if (!isMasterAdmin) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Configuracoes</h1>

        <Card className="max-w-lg mx-auto">
          <CardContent className="py-12">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Lock className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Acesso Restrito</h2>
              <p className="text-gray-700">
                Esta pagina e acessivel apenas para Master Admins.
              </p>
              <p className="text-gray-600 text-sm mt-4">
                Entre em contato com um Master Admin se precisar de acesso.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Master admin view
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Configuracoes</h1>
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 flex items-center gap-1">
          <Crown className="h-4 w-4" />
          Master Admin
        </span>
      </div>

      <div className="space-y-6">
        {/* Master Admins Management */}
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <Crown className="h-5 w-5" />
              Gerenciar Master Admins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-700 mb-4">
              Master Admins tem acesso total as configuracoes do sistema. Apenas Master Admins podem adicionar ou remover outros Master Admins.
            </p>
            <div className="bg-white rounded-lg border border-yellow-200 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-yellow-200 bg-yellow-100/50">
                    <th className="text-left py-3 px-4 text-sm font-medium text-yellow-800">Admin</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-yellow-800">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-yellow-800">Acao</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin) => (
                    <tr key={admin.id} className="border-b border-yellow-100 last:border-0">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {admin.full_name || admin.email.split('@')[0]}
                          </p>
                          <p className="text-sm text-gray-600">{admin.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {admin.is_master_admin ? (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-200 text-yellow-800 flex items-center gap-1 w-fit">
                            <Crown className="h-3 w-3" />
                            Master Admin
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                            Admin
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {admin.is_master_admin ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleMasterAdmin(admin.id, admin.email, true)}
                            disabled={admin.email === currentUserEmail}
                            title={admin.email === currentUserEmail ? 'Voce nao pode se remover' : 'Remover Master Admin'}
                          >
                            <UserMinus className="h-4 w-4 text-red-600" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleMasterAdmin(admin.id, admin.email, false)}
                            title="Tornar Master Admin"
                          >
                            <UserPlus className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Scoring Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuracoes de Pontuacao
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Nota Minima para Aprovacao (%)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.passScore}
                  onChange={(e) => setSettings({ ...settings, passScore: parseInt(e.target.value) || 0 })}
                />
                <p className="text-sm text-gray-700 mt-1">
                  Nota minima para considerar o ECG como aprovado
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Tolerancia de Frequencia Cardiaca (bpm)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="50"
                  value={settings.heartRateTolerance}
                  onChange={(e) => setSettings({ ...settings, heartRateTolerance: parseInt(e.target.value) || 0 })}
                />
                <p className="text-sm text-gray-700 mt-1">
                  Margem de erro aceita para a frequencia cardiaca
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allowRetakes}
                  onChange={(e) => setSettings({ ...settings, allowRetakes: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <div>
                  <span className="font-medium text-gray-900">Permitir refazer ECGs</span>
                  <p className="text-sm text-gray-700">Usuarios podem tentar o mesmo ECG novamente</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showCorrectAnswers}
                  onChange={(e) => setSettings({ ...settings, showCorrectAnswers: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <div>
                  <span className="font-medium text-gray-900">Mostrar respostas corretas</span>
                  <p className="text-sm text-gray-700">Exibir o laudo oficial apos a tentativa</p>
                </div>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Ranking Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Configuracoes do Ranking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Configure como o ranking e calculado e exibido para os usuarios.
              O score ponderado e calculado como: (Media de Notas × Peso da Nota) + (Atividade Normalizada × Peso da Atividade)
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Peso da Nota (%)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.rankingGradeWeight}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0
                    setSettings({
                      ...settings,
                      rankingGradeWeight: value,
                      rankingActivityWeight: 100 - value
                    })
                  }}
                />
                <p className="text-sm text-gray-700 mt-1">
                  Importancia da media de notas no ranking
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Peso da Atividade (%)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.rankingActivityWeight}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0
                    setSettings({
                      ...settings,
                      rankingActivityWeight: value,
                      rankingGradeWeight: 100 - value
                    })
                  }}
                />
                <p className="text-sm text-gray-700 mt-1">
                  Importancia da quantidade de ECGs no ranking
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Usuarios no Top Ranking
                </label>
                <Input
                  type="number"
                  min="3"
                  max="50"
                  value={settings.rankingTopCount}
                  onChange={(e) => setSettings({ ...settings, rankingTopCount: parseInt(e.target.value) || 10 })}
                />
                <p className="text-sm text-gray-700 mt-1">
                  Quantos usuarios aparecem no ranking principal
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Minimo de Tentativas
                </label>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={settings.rankingMinAttempts}
                  onChange={(e) => setSettings({ ...settings, rankingMinAttempts: parseInt(e.target.value) || 3 })}
                />
                <p className="text-sm text-gray-700 mt-1">
                  Minimo de ECGs para aparecer no ranking
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.rankingShowNames}
                  onChange={(e) => setSettings({ ...settings, rankingShowNames: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <div>
                  <span className="font-medium text-gray-900">Mostrar nomes no ranking</span>
                  <p className="text-sm text-gray-700">Se desativado, apenas os top 3 terao nomes visiveis</p>
                </div>
              </label>
            </div>

            {/* Difficulty Weights */}
            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium text-gray-900 mb-3">Peso por Dificuldade do ECG</h4>
              <p className="text-sm text-gray-600 mb-4">
                ECGs mais difíceis valem mais pontos no ranking. Configure os multiplicadores abaixo.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Fácil (×)
                  </label>
                  <Input
                    type="number"
                    min="0.5"
                    max="3"
                    step="0.05"
                    value={settings.difficultyWeightEasy}
                    onChange={(e) => setSettings({ ...settings, difficultyWeightEasy: parseFloat(e.target.value) || 1.0 })}
                  />
                  <p className="text-xs text-gray-500 mt-1">Base: 1.0</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Médio (×)
                  </label>
                  <Input
                    type="number"
                    min="0.5"
                    max="3"
                    step="0.05"
                    value={settings.difficultyWeightMedium}
                    onChange={(e) => setSettings({ ...settings, difficultyWeightMedium: parseFloat(e.target.value) || 1.25 })}
                  />
                  <p className="text-xs text-gray-500 mt-1">Recomendado: 1.25</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Difícil (×)
                  </label>
                  <Input
                    type="number"
                    min="0.5"
                    max="3"
                    step="0.05"
                    value={settings.difficultyWeightHard}
                    onChange={(e) => setSettings({ ...settings, difficultyWeightHard: parseFloat(e.target.value) || 1.5 })}
                  />
                  <p className="text-xs text-gray-500 mt-1">Recomendado: 1.5</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mt-4">
              <h4 className="font-medium text-blue-800 mb-2">Fórmula do Score Ponderado</h4>
              <code className="text-sm text-blue-700 bg-blue-100 px-2 py-1 rounded block mb-2">
                Score = (Média Ponderada × {settings.rankingGradeWeight}%) + (Atividade × {settings.rankingActivityWeight}%)
              </code>
              <p className="text-xs text-blue-600 mt-2">
                <strong>Média Ponderada</strong> = Σ(nota × peso_dificuldade) / Σ(peso_dificuldade)
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Exemplo: ECG difícil com 80% = 80 × {settings.difficultyWeightHard} = {Math.round(80 * settings.difficultyWeightHard)} pontos ponderados
              </p>
              <p className="text-xs text-blue-600 mt-1">
                A atividade é normalizada em relação ao usuário mais ativo do sistema.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Hospital Randomization Settings */}
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Randomizacao por Tipo de Hospital
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-gray-600">
              Configure os pesos de probabilidade para cada tipo de hospital. Valores maiores = maior probabilidade de aparecer.
              O sistema nao exclui outras categorias, apenas prioriza as configuradas.
            </p>

            {/* Emergency Hospital */}
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                Pronto Socorro
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-red-700 mb-2">Categorias</p>
                  <div className="space-y-2">
                    {CATEGORIES.map(cat => (
                      <div key={cat.value} className="flex items-center justify-between">
                        <label className="text-sm text-gray-700">{cat.label}</label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={hospitalWeights.pronto_socorro.categories[cat.value] || 1}
                          onChange={(e) => updateHospitalWeight('pronto_socorro', 'categories', cat.value, parseInt(e.target.value) || 1)}
                          className="w-16 px-2 py-1 border rounded text-center text-sm text-gray-900 font-medium"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-red-700 mb-2">Dificuldades</p>
                  <div className="space-y-2">
                    {DIFFICULTIES.map(diff => (
                      <div key={diff.value} className="flex items-center justify-between">
                        <label className="text-sm text-gray-700">{diff.label}</label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={hospitalWeights.pronto_socorro.difficulties[diff.value] || 1}
                          onChange={(e) => updateHospitalWeight('pronto_socorro', 'difficulties', diff.value, parseInt(e.target.value) || 1)}
                          className="w-16 px-2 py-1 border rounded text-center text-sm text-gray-900 font-medium"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* General Hospital */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                Hospital Geral
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-blue-700 mb-2">Categorias</p>
                  <div className="space-y-2">
                    {CATEGORIES.map(cat => (
                      <div key={cat.value} className="flex items-center justify-between">
                        <label className="text-sm text-gray-700">{cat.label}</label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={hospitalWeights.hospital_geral.categories[cat.value] || 1}
                          onChange={(e) => updateHospitalWeight('hospital_geral', 'categories', cat.value, parseInt(e.target.value) || 1)}
                          className="w-16 px-2 py-1 border rounded text-center text-sm text-gray-900 font-medium"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-700 mb-2">Dificuldades</p>
                  <div className="space-y-2">
                    {DIFFICULTIES.map(diff => (
                      <div key={diff.value} className="flex items-center justify-between">
                        <label className="text-sm text-gray-700">{diff.label}</label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={hospitalWeights.hospital_geral.difficulties[diff.value] || 1}
                          onChange={(e) => updateHospitalWeight('hospital_geral', 'difficulties', diff.value, parseInt(e.target.value) || 1)}
                          className="w-16 px-2 py-1 border rounded text-center text-sm text-gray-900 font-medium"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Cardiology Hospital */}
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                Hospital Cardiologico
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-purple-700 mb-2">Categorias</p>
                  <div className="space-y-2">
                    {CATEGORIES.map(cat => (
                      <div key={cat.value} className="flex items-center justify-between">
                        <label className="text-sm text-gray-700">{cat.label}</label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={hospitalWeights.hospital_cardiologico.categories[cat.value] || 1}
                          onChange={(e) => updateHospitalWeight('hospital_cardiologico', 'categories', cat.value, parseInt(e.target.value) || 1)}
                          className="w-16 px-2 py-1 border rounded text-center text-sm text-gray-900 font-medium"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-700 mb-2">Dificuldades</p>
                  <div className="space-y-2">
                    {DIFFICULTIES.map(diff => (
                      <div key={diff.value} className="flex items-center justify-between">
                        <label className="text-sm text-gray-700">{diff.label}</label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={hospitalWeights.hospital_cardiologico.difficulties[diff.value] || 1}
                          onChange={(e) => updateHospitalWeight('hospital_cardiologico', 'difficulties', diff.value, parseInt(e.target.value) || 1)}
                          className="w-16 px-2 py-1 border rounded text-center text-sm text-gray-900 font-medium"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border">
              <h4 className="font-medium text-gray-800 mb-2">Como funciona</h4>
              <p className="text-sm text-gray-600">
                Quando um usuario Premium seleciona um tipo de hospital, o sistema usa esses pesos para
                calcular a probabilidade de cada ECG aparecer. Por exemplo, se &quot;Arritmia&quot; tem peso 3 e &quot;Normal&quot; tem peso 1,
                ECGs de arritmia terao 3x mais chance de aparecer.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Gamification Settings */}
        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Zap className="h-5 w-5" />
              Configuracoes de Gamificacao
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-gray-600">
              Configure todos os parametros do sistema de gamificacao. Todas as regras sao transparentes e editaveis.
            </p>

            {/* XP System */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <button
                onClick={() => toggleSection('xp')}
                className="w-full flex items-center justify-between text-left"
              >
                <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Sistema de XP
                </h4>
                {expandedSections['xp'] ? <ChevronUp className="h-4 w-4 text-blue-600" /> : <ChevronDown className="h-4 w-4 text-blue-600" />}
              </button>

              {expandedSections['xp'] && (
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">XP Base por ECG</label>
                      <Input
                        type="number"
                        min="1"
                        value={gamificationConfig.xp_per_ecg_base}
                        onChange={(e) => setGamificationConfig(prev => ({ ...prev, xp_per_ecg_base: parseInt(e.target.value) || 10 }))}
                      />
                      <p className="text-xs text-gray-500 mt-1">XP base ganho por cada tentativa</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">XP por Ponto de Score</label>
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        value={gamificationConfig.xp_per_score_point}
                        onChange={(e) => setGamificationConfig(prev => ({ ...prev, xp_per_score_point: parseFloat(e.target.value) || 0.5 }))}
                      />
                      <p className="text-xs text-gray-500 mt-1">XP adicional × score (0-100)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Bonus Score Perfeito</label>
                      <Input
                        type="number"
                        min="0"
                        value={gamificationConfig.xp_perfect_bonus}
                        onChange={(e) => setGamificationConfig(prev => ({ ...prev, xp_perfect_bonus: parseInt(e.target.value) || 25 }))}
                      />
                      <p className="text-xs text-gray-500 mt-1">XP extra para score 100%</p>
                    </div>
                  </div>

                  <div className="border-t border-blue-200 pt-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-3">Multiplicadores por Dificuldade</h5>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Facil (×)</label>
                        <Input
                          type="number"
                          min="0.1"
                          step="0.1"
                          value={gamificationConfig.xp_difficulty_multipliers.easy}
                          onChange={(e) => setGamificationConfig(prev => ({
                            ...prev,
                            xp_difficulty_multipliers: { ...prev.xp_difficulty_multipliers, easy: parseFloat(e.target.value) || 0.8 }
                          }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Medio (×)</label>
                        <Input
                          type="number"
                          min="0.1"
                          step="0.1"
                          value={gamificationConfig.xp_difficulty_multipliers.medium}
                          onChange={(e) => setGamificationConfig(prev => ({
                            ...prev,
                            xp_difficulty_multipliers: { ...prev.xp_difficulty_multipliers, medium: parseFloat(e.target.value) || 1.0 }
                          }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Dificil (×)</label>
                        <Input
                          type="number"
                          min="0.1"
                          step="0.1"
                          value={gamificationConfig.xp_difficulty_multipliers.hard}
                          onChange={(e) => setGamificationConfig(prev => ({
                            ...prev,
                            xp_difficulty_multipliers: { ...prev.xp_difficulty_multipliers, hard: parseFloat(e.target.value) || 1.3 }
                          }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Level System */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <button
                onClick={() => toggleSection('level')}
                className="w-full flex items-center justify-between text-left"
              >
                <h4 className="font-semibold text-green-800 flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Sistema de Niveis
                </h4>
                {expandedSections['level'] ? <ChevronUp className="h-4 w-4 text-green-600" /> : <ChevronDown className="h-4 w-4 text-green-600" />}
              </button>

              {expandedSections['level'] && (
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Multiplicador por Nivel</label>
                      <Input
                        type="number"
                        min="0"
                        step="0.0001"
                        value={gamificationConfig.level_multiplier_per_level}
                        onChange={(e) => setGamificationConfig(prev => ({ ...prev, level_multiplier_per_level: parseFloat(e.target.value) || 0.002525 }))}
                      />
                      <p className="text-xs text-gray-500 mt-1">Bonus de XP por nivel (0.002525 = +0.25% por nivel)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Nivel Maximo</label>
                      <Input
                        type="number"
                        min="10"
                        max="1000"
                        value={gamificationConfig.max_level}
                        onChange={(e) => setGamificationConfig(prev => ({ ...prev, max_level: parseInt(e.target.value) || 100 }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">XP Base para Nivel 2</label>
                      <Input
                        type="number"
                        min="10"
                        value={gamificationConfig.xp_per_level_base}
                        onChange={(e) => setGamificationConfig(prev => ({ ...prev, xp_per_level_base: parseInt(e.target.value) || 100 }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Crescimento por Nivel (×)</label>
                      <Input
                        type="number"
                        min="1"
                        step="0.01"
                        value={gamificationConfig.xp_per_level_growth}
                        onChange={(e) => setGamificationConfig(prev => ({ ...prev, xp_per_level_growth: parseFloat(e.target.value) || 1.15 }))}
                      />
                      <p className="text-xs text-gray-500 mt-1">Multiplicador de XP necessario por nivel</p>
                    </div>
                  </div>

                  <div className="p-3 bg-green-100 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Nivel 100:</strong> +{((gamificationConfig.max_level - 1) * gamificationConfig.level_multiplier_per_level * 100).toFixed(1)}% de XP comparado ao nivel 1
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Streak System */}
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <button
                onClick={() => toggleSection('streak')}
                className="w-full flex items-center justify-between text-left"
              >
                <h4 className="font-semibold text-orange-800 flex items-center gap-2">
                  <Flame className="h-4 w-4" />
                  Sistema de Streak
                </h4>
                {expandedSections['streak'] ? <ChevronUp className="h-4 w-4 text-orange-600" /> : <ChevronDown className="h-4 w-4 text-orange-600" />}
              </button>

              {expandedSections['streak'] && (
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Bonus XP por Dia</label>
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        value={gamificationConfig.xp_streak_bonus_per_day}
                        onChange={(e) => setGamificationConfig(prev => ({ ...prev, xp_streak_bonus_per_day: parseFloat(e.target.value) || 0.5 }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Bonus Maximo</label>
                      <Input
                        type="number"
                        min="0"
                        value={gamificationConfig.xp_streak_bonus_max}
                        onChange={(e) => setGamificationConfig(prev => ({ ...prev, xp_streak_bonus_max: parseInt(e.target.value) || 15 }))}
                      />
                      <p className="text-xs text-gray-500 mt-1">Cap de XP bonus por streak</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Periodo de Graca (horas)</label>
                      <Input
                        type="number"
                        min="24"
                        max="72"
                        value={gamificationConfig.streak_grace_period_hours}
                        onChange={(e) => setGamificationConfig(prev => ({ ...prev, streak_grace_period_hours: parseInt(e.target.value) || 36 }))}
                      />
                      <p className="text-xs text-gray-500 mt-1">Horas antes do streak resetar</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Event Multipliers */}
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <button
                onClick={() => toggleSection('events')}
                className="w-full flex items-center justify-between text-left"
              >
                <h4 className="font-semibold text-yellow-800 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Eventos de XP
                </h4>
                {expandedSections['events'] ? <ChevronUp className="h-4 w-4 text-yellow-600" /> : <ChevronDown className="h-4 w-4 text-yellow-600" />}
              </button>

              {expandedSections['events'] && (
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Bonus Evento 2× (aditivo)</label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={gamificationConfig.event_2x_bonus}
                        onChange={(e) => setGamificationConfig(prev => ({ ...prev, event_2x_bonus: parseFloat(e.target.value) || 0.125 }))}
                      />
                      <p className="text-xs text-gray-500 mt-1">+{(gamificationConfig.event_2x_bonus * 100).toFixed(1)}% de XP</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Bonus Evento 3× (aditivo)</label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={gamificationConfig.event_3x_bonus}
                        onChange={(e) => setGamificationConfig(prev => ({ ...prev, event_3x_bonus: parseFloat(e.target.value) || 0.25 }))}
                      />
                      <p className="text-xs text-gray-500 mt-1">+{(gamificationConfig.event_3x_bonus * 100).toFixed(1)}% de XP</p>
                    </div>
                  </div>

                  {/* Active Events */}
                  <div className="border-t border-yellow-200 pt-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-3">Eventos Ativos</h5>
                    {xpEvents.length === 0 ? (
                      <p className="text-sm text-gray-500">Nenhum evento cadastrado</p>
                    ) : (
                      <div className="space-y-2">
                        {xpEvents.map(event => (
                          <div key={event.id} className="flex items-center justify-between p-2 bg-white rounded border">
                            <div>
                              <span className="font-medium">{event.name}</span>
                              <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${event.multiplier_type === '3x' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                                {event.multiplier_type}
                              </span>
                              <span className={`ml-2 px-2 py-0.5 rounded text-xs ${event.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                {event.is_active ? 'Ativo' : 'Inativo'}
                              </span>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(event.start_at).toLocaleDateString('pt-BR')} - {new Date(event.end_at).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            {event.is_active && (
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteEvent(event.id)}>
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Create Event */}
                  <div className="border-t border-yellow-200 pt-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-3">Criar Novo Evento</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        placeholder="Nome do evento"
                        value={newEvent.name}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, name: e.target.value }))}
                      />
                      <select
                        className="px-3 py-2 border rounded-md text-sm"
                        value={newEvent.multiplier_type}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, multiplier_type: e.target.value as '2x' | '3x' }))}
                      >
                        <option value="2x">2× XP</option>
                        <option value="3x">3× XP</option>
                      </select>
                      <Input
                        type="datetime-local"
                        value={newEvent.start_at}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, start_at: e.target.value }))}
                      />
                      <Input
                        type="datetime-local"
                        value={newEvent.end_at}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, end_at: e.target.value }))}
                      />
                    </div>
                    <Button className="mt-3" onClick={handleCreateEvent}>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Evento
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Email Settings */}
            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <button
                onClick={() => toggleSection('email')}
                className="w-full flex items-center justify-between text-left"
              >
                <h4 className="font-semibold text-indigo-800 flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Emails de Inatividade
                </h4>
                {expandedSections['email'] ? <ChevronUp className="h-4 w-4 text-indigo-600" /> : <ChevronDown className="h-4 w-4 text-indigo-600" />}
              </button>

              {expandedSections['email'] && (
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Dias para Emails (separados por virgula)</label>
                      <Input
                        value={gamificationConfig.inactivity_email_days.join(', ')}
                        onChange={(e) => {
                          const days = e.target.value.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d))
                          setGamificationConfig(prev => ({ ...prev, inactivity_email_days: days }))
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-1">Dias de inatividade para enviar emails</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Duracao Evento Pessoal (horas)</label>
                      <Input
                        type="number"
                        min="1"
                        value={gamificationConfig.inactivity_event_duration_hours}
                        onChange={(e) => setGamificationConfig(prev => ({ ...prev, inactivity_event_duration_hours: parseInt(e.target.value) || 24 }))}
                      />
                      <p className="text-xs text-gray-500 mt-1">Duracao do evento 3× pessoal</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Ranking Settings */}
            <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
              <button
                onClick={() => toggleSection('ranking')}
                className="w-full flex items-center justify-between text-left"
              >
                <h4 className="font-semibold text-pink-800 flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Ranking
                </h4>
                {expandedSections['ranking'] ? <ChevronUp className="h-4 w-4 text-pink-600" /> : <ChevronDown className="h-4 w-4 text-pink-600" />}
              </button>

              {expandedSections['ranking'] && (
                <div className="mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Top N Visivel</label>
                    <Input
                      type="number"
                      min="3"
                      max="100"
                      value={gamificationConfig.ranking_top_n_visible}
                      onChange={(e) => setGamificationConfig(prev => ({ ...prev, ranking_top_n_visible: parseInt(e.target.value) || 10 }))}
                    />
                    <p className="text-xs text-gray-500 mt-1">Usuarios fora do top N verao apenas seu percentil</p>
                  </div>
                </div>
              )}
            </div>

            {/* XP Preview */}
            <div className="p-4 bg-gray-50 rounded-lg border">
              <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Preview de Calculo de XP
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="p-3 bg-white rounded border">
                  <p className="text-gray-600">Nivel 1, Medio, Score 80</p>
                  <p className="font-bold text-lg">{calculateExampleXP(80, 'medium', 1, null)} XP</p>
                </div>
                <div className="p-3 bg-white rounded border">
                  <p className="text-gray-600">Nivel 1, Dificil, Score 80</p>
                  <p className="font-bold text-lg">{calculateExampleXP(80, 'hard', 1, null)} XP</p>
                </div>
                <div className="p-3 bg-white rounded border">
                  <p className="text-gray-600">Nivel 100, Medio, Score 80</p>
                  <p className="font-bold text-lg">{calculateExampleXP(80, 'medium', 100, null)} XP</p>
                </div>
                <div className="p-3 bg-white rounded border">
                  <p className="text-gray-600">Nivel 1, Medio, 3× Event</p>
                  <p className="font-bold text-lg">{calculateExampleXP(80, 'medium', 1, '3x')} XP</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Formula: (base + score × {gamificationConfig.xp_per_score_point}) × dificuldade × (nivel_mult + evento_bonus)
              </p>
            </div>

            {/* Save/Reset Buttons */}
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={resetToDefaults}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Restaurar Padrao
              </Button>
              <Button onClick={handleSaveGamification} isLoading={isSavingGamification}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Gamificacao
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Achievement Management */}
        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <Award className="h-5 w-5" />
              Gerenciador de Conquistas ({achievements.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Filter */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setAchievementFilter('all')}
                  className={`px-3 py-1 rounded-full text-sm ${achievementFilter === 'all' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  Todos
                </button>
                {['ecg_count', 'diagnosis', 'streak', 'perfect', 'level', 'special', 'hospital', 'pediatric'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setAchievementFilter(cat)}
                    className={`px-3 py-1 rounded-full text-sm capitalize ${achievementFilter === cat ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                  >
                    {cat.replace('_', ' ')}
                  </button>
                ))}
              </div>

              {/* Achievement List */}
              <div className="max-h-96 overflow-y-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="text-left py-2 px-3 font-medium">Conquista</th>
                      <th className="text-left py-2 px-3 font-medium">Raridade</th>
                      <th className="text-center py-2 px-3 font-medium">XP</th>
                      <th className="text-center py-2 px-3 font-medium">Desbloqueios</th>
                      <th className="text-center py-2 px-3 font-medium">Ativo</th>
                      <th className="text-center py-2 px-3 font-medium">Oculto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {achievements
                      .filter(a => achievementFilter === 'all' || a.category === achievementFilter)
                      .map(achievement => (
                        <tr key={achievement.id} className="border-t hover:bg-gray-50">
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-2">
                              <span>{achievement.icon}</span>
                              <div>
                                <p className="font-medium">{achievement.name_pt}</p>
                                <p className="text-xs text-gray-500">{achievement.slug}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              achievement.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-800' :
                              achievement.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                              achievement.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                              achievement.rarity === 'uncommon' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {achievement.rarity}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center">{achievement.xp_reward}</td>
                          <td className="py-2 px-3 text-center">
                            {achievement.unlocks} ({achievement.unlock_percentage}%)
                          </td>
                          <td className="py-2 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={achievement.is_active}
                              onChange={(e) => handleToggleAchievement(achievement.id, 'is_active', e.target.checked)}
                              className="w-4 h-4 text-amber-600 rounded"
                            />
                          </td>
                          <td className="py-2 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={achievement.is_hidden}
                              onChange={(e) => handleToggleAchievement(achievement.id, 'is_hidden', e.target.checked)}
                              className="w-4 h-4 text-amber-600 rounded"
                            />
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <p className="text-xs text-gray-500">
                Conquistas ocultas nao aparecem ate serem desbloqueadas. Conquistas inativas nao podem ser ganhas.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Database Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Informacoes do Banco de Dados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700">Provedor</p>
                <p className="text-lg font-semibold text-gray-900">Supabase</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700">Regiao</p>
                <p className="text-lg font-semibold text-gray-900">South America</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700">Status</p>
                <p className="text-lg font-semibold text-green-600 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Conectado
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Storage Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Armazenamento de Imagens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700">Provedor</p>
                <p className="text-lg font-semibold text-gray-900">Cloudinary</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700">Preset de Upload</p>
                <p className="text-lg font-semibold text-gray-900">ecg_uploads</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700">Status</p>
                <p className="text-lg font-semibold text-green-600 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Configurado
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificacoes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <div>
                <span className="font-medium text-gray-900">Notificacoes por email</span>
                <p className="text-sm text-gray-700">Receber alertas sobre novos usuarios e atividade</p>
              </div>
            </label>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Seguranca
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 text-green-700">
                <Shield className="h-5 w-5" />
                <span className="font-medium">Row Level Security (RLS) Ativo</span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                Todos os dados estao protegidos por politicas de seguranca no banco de dados
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-blue-700">
                <RefreshCw className="h-5 w-5" />
                <span className="font-medium">Autenticacao via Supabase Auth</span>
              </div>
              <p className="text-sm text-blue-600 mt-1">
                Sistema de autenticacao seguro com JWT e gerenciamento de sessoes
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} isLoading={isSaving} size="lg">
            <Save className="h-4 w-4 mr-2" />
            Salvar Configuracoes
          </Button>
        </div>
      </div>
    </div>
  )
}
