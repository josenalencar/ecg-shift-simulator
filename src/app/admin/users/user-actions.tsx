'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui'
import { Shield, ShieldOff } from 'lucide-react'

interface UserActionsProps {
  userId: string
  currentRole: string
}

export function UserActions({ userId, currentRole }: UserActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function toggleRole() {
    setIsLoading(true)
    const newRole = currentRole === 'admin' ? 'user' : 'admin'

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('profiles') as any)
      .update({ role: newRole })
      .eq('id', userId)

    if (error) {
      console.error('Error updating role:', error)
      alert('Erro ao atualizar função do usuário')
    } else {
      router.refresh()
    }

    setIsLoading(false)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleRole}
      disabled={isLoading}
      title={currentRole === 'admin' ? 'Remover admin' : 'Tornar admin'}
    >
      {currentRole === 'admin' ? (
        <ShieldOff className="h-4 w-4 text-red-500" />
      ) : (
        <Shield className="h-4 w-4 text-purple-500" />
      )}
    </Button>
  )
}
