'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '@/components/ui'
import { AvatarDisplay } from '@/components/profile/avatar-display'
import { AvatarPicker } from '@/components/profile/avatar-picker'
import { User, Save, Loader2 } from 'lucide-react'

interface ProfileFormProps {
  initialFullName: string | null
  initialBio: string | null
  initialAvatar: string | null
}

export function ProfileForm({ initialFullName, initialBio, initialAvatar }: ProfileFormProps) {
  const [fullName, setFullName] = useState(initialFullName || '')
  const [bio, setBio] = useState(initialBio || '')
  const [avatar, setAvatar] = useState(initialAvatar || 'n1')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false)

  const router = useRouter()
  const supabase = createClient()

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

  async function handleAvatarSelect(avatarId: string) {
    const response = await fetch('/api/profile/avatar', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avatar: avatarId }),
    })

    if (response.ok) {
      setAvatar(avatarId)
      router.refresh()
    } else {
      throw new Error('Failed to save avatar')
    }
  }

  return (
    <>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Perfil do Usuário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center gap-2">
                <AvatarDisplay
                  avatarId={avatar}
                  size="xl"
                  onClick={() => setIsAvatarPickerOpen(true)}
                  showEditHint
                />
                <button
                  type="button"
                  onClick={() => setIsAvatarPickerOpen(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Alterar avatar
                </button>
              </div>

              <div className="flex-1 space-y-4">
                <Input
                  id="fullName"
                  label="Nome Completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Seu nome completo"
                />
              </div>
            </div>

            {/* Bio */}
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
                maxLength={500}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Opcional. Máximo de 500 caracteres. ({bio.length}/500)
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

      {/* Avatar Picker Modal */}
      <AvatarPicker
        currentAvatar={avatar}
        isOpen={isAvatarPickerOpen}
        onClose={() => setIsAvatarPickerOpen(false)}
        onSelect={handleAvatarSelect}
      />
    </>
  )
}
