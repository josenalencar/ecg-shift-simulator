'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '@/components/ui'
import { Lock, Loader2 } from 'lucide-react'

export function PasswordForm() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const supabase = createClient()

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setChangingPassword(true)
    setMessage(null)

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem.' })
      setChangingPassword(false)
      return
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'A senha deve ter pelo menos 6 caracteres.' })
      setChangingPassword(false)
      return
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      setMessage({ type: 'error', text: 'Erro ao alterar senha: ' + error.message })
    } else {
      setMessage({ type: 'success', text: 'Senha alterada com sucesso!' })
      setNewPassword('')
      setConfirmPassword('')
    }

    setChangingPassword(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Segurança
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

          {message && (
            <div className={`p-3 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {message.text}
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
  )
}
