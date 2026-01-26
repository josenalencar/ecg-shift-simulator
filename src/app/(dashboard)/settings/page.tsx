'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '@/components/ui'
import { User, Lock, Save, Loader2, Building2, Crown } from 'lucide-react'
import { HOSPITAL_TYPES } from '@/lib/ecg-constants'
import type { HospitalType } from '@/types/database'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingHospital, setSavingHospital] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [hospitalType, setHospitalType] = useState<HospitalType | null>(null)
  const [isProUser, setIsProUser] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [hospitalMessage, setHospitalMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, bio, hospital_type')
        .eq('id', user.id)
        .single()

      const profile = profileData as { full_name: string | null; bio: string | null; hospital_type: HospitalType | null } | null

      if (profile) {
        setFullName(profile.full_name || '')
        setBio(profile.bio || '')
        setHospitalType(profile.hospital_type)
      }

      // Check subscription status
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: subData } = await (supabase as any)
        .from('subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .maybeSingle()

      const subscription = subData as { status?: string } | null
      setIsProUser(subscription?.status === 'active')

      setLoading(false)
    }

    loadProfile()
  }, [supabase, router])

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setMessage({ type: 'error', text: 'Sessão expirada. Faça login novamente.' })
      setSaving(false)
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('profiles') as any)
      .update({ full_name: fullName, bio })
      .eq('id', user.id)

    if (error) {
      setMessage({ type: 'error', text: 'Erro ao salvar perfil: ' + error.message })
    } else {
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' })
      router.refresh()
    }

    setSaving(false)
  }

  async function handleSaveHospitalType(selectedType: HospitalType) {
    setSavingHospital(true)
    setHospitalMessage(null)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setHospitalMessage({ type: 'error', text: 'Sessão expirada. Faça login novamente.' })
      setSavingHospital(false)
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('profiles') as any)
      .update({ hospital_type: selectedType })
      .eq('id', user.id)

    if (error) {
      setHospitalMessage({ type: 'error', text: 'Erro ao salvar preferencia: ' + error.message })
    } else {
      setHospitalType(selectedType)
      setHospitalMessage({ type: 'success', text: 'Preferencia salva! Os ECGs serao priorizados de acordo.' })
    }

    setSavingHospital(false)
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setChangingPassword(true)
    setPasswordMessage(null)

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'As senhas não coincidem.' })
      setChangingPassword(false)
      return
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'A senha deve ter pelo menos 6 caracteres.' })
      setChangingPassword(false)
      return
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      setPasswordMessage({ type: 'error', text: 'Erro ao alterar senha: ' + error.message })
    } else {
      setPasswordMessage({ type: 'success', text: 'Senha alterada com sucesso!' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }

    setChangingPassword(false)
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Configurações do Perfil</h1>

      {/* Profile Info */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <Input
              id="fullName"
              label="Nome Completo"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Seu nome completo"
            />

            <div className="w-full">
              <label
                htmlFor="bio"
                className="block text-sm font-medium text-gray-900 mb-1"
              >
                Mini Currículo
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Conte um pouco sobre você, sua formação, especialidade..."
                rows={4}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Opcional. Máximo de 500 caracteres.
              </p>
            </div>

            {message && (
              <div className={`p-3 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {message.text}
              </div>
            )}

            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Hospital Type Selection - Pro Users Only */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Tipo de Hospital
            {isProUser && (
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 flex items-center gap-1">
                <Crown className="h-3 w-3" />
                Premium
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isProUser ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Selecione o tipo de hospital onde você trabalha. O sistema irá priorizar os ECGs mais relevantes para sua prática.
              </p>

              <div className="grid gap-3">
                {HOSPITAL_TYPES.map((hospital) => (
                  <button
                    key={hospital.value}
                    type="button"
                    onClick={() => handleSaveHospitalType(hospital.value)}
                    disabled={savingHospital}
                    className={`
                      w-full p-4 rounded-lg border-2 text-left transition-all
                      ${hospitalType === hospital.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{hospital.label}</div>
                        <div className="text-sm text-gray-500">{hospital.description}</div>
                      </div>
                      {hospitalType === hospital.value && (
                        <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
                          <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {hospitalMessage && (
                <div className={`p-3 rounded-lg ${
                  hospitalMessage.type === 'success'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {hospitalMessage.text}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <Crown className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 mb-2">Recurso exclusivo para assinantes Premium</p>
              <p className="text-sm text-gray-500 mb-4">
                Com o Premium, você pode personalizar os ECGs que aparecem de acordo com seu local de trabalho.
              </p>
              <Button variant="secondary" onClick={() => router.push('/pricing')}>
                <Crown className="h-4 w-4 mr-2" />
                Ver Planos
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Alterar Senha
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-6">
            <Input
              id="newPassword"
              type="password"
              label="Nova Senha"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Digite a nova senha"
            />

            <Input
              id="confirmPassword"
              type="password"
              label="Confirmar Nova Senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirme a nova senha"
            />

            {passwordMessage && (
              <div className={`p-3 rounded-lg ${
                passwordMessage.type === 'success'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {passwordMessage.text}
              </div>
            )}

            <Button type="submit" variant="secondary" disabled={changingPassword}>
              {changingPassword ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Alterando...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Alterar Senha
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
