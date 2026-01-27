'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '@/components/ui'
import { Settings, Database, Image, Bell, Shield, Save, RefreshCw, Lock, Crown, UserPlus, UserMinus, Loader2, Trophy, Building2 } from 'lucide-react'
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
                          className="w-16 px-2 py-1 border rounded text-center text-sm"
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
                          className="w-16 px-2 py-1 border rounded text-center text-sm"
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
                          className="w-16 px-2 py-1 border rounded text-center text-sm"
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
                          className="w-16 px-2 py-1 border rounded text-center text-sm"
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
                          className="w-16 px-2 py-1 border rounded text-center text-sm"
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
                          className="w-16 px-2 py-1 border rounded text-center text-sm"
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
