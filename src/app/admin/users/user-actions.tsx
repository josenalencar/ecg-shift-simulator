'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MoreVertical, Shield, ShieldOff } from 'lucide-react'

const MASTER_ADMIN_EMAIL = 'josenunesalencar@gmail.com'

interface UserActionsProps {
  userId: string
  userEmail: string
  currentRole: string
}

export function UserActions({ userId, userEmail, currentRole }: UserActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const isMasterAdmin = userEmail === MASTER_ADMIN_EMAIL

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function toggleRole() {
    if (isMasterAdmin) return

    setIsLoading(true)
    const newRole = currentRole === 'admin' ? 'user' : 'admin'

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('profiles') as any)
      .update({ role: newRole })
      .eq('id', userId)

    if (error) {
      console.error('Error updating role:', error)
      alert('Erro ao atualizar funcao do usuario')
    } else {
      router.refresh()
    }

    setIsLoading(false)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        disabled={isLoading}
        title="Acoes"
      >
        <MoreVertical className="h-4 w-4 text-gray-600" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {isMasterAdmin ? (
            <div className="px-4 py-2 text-sm text-gray-500 italic">
              Admin Master (protegido)
            </div>
          ) : currentRole === 'admin' ? (
            <button
              onClick={toggleRole}
              disabled={isLoading}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50 disabled:opacity-50"
            >
              <ShieldOff className="h-4 w-4" />
              Remover Admin
            </button>
          ) : (
            <button
              onClick={toggleRole}
              disabled={isLoading}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-purple-600 hover:bg-gray-50 disabled:opacity-50"
            >
              <Shield className="h-4 w-4" />
              Tornar Admin
            </button>
          )}
        </div>
      )}
    </div>
  )
}
