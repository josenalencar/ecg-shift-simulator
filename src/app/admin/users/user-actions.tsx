'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MoreVertical, Shield, ShieldOff, Crown, Sparkles, GraduationCap, XCircle, Trash2, KeyRound, Eye } from 'lucide-react'
import { GrantedPlan } from '@/types/database'

const MASTER_ADMIN_EMAIL = 'josenunesalencar@gmail.com'

interface UserActionsProps {
  userId: string
  userEmail: string
  currentRole: string
  currentGrantedPlan: GrantedPlan | null
  onViewDetails?: (userId: string) => void
}

export function UserActions({ userId, userEmail, currentRole, currentGrantedPlan, onViewDetails }: UserActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false)
  const [cancelStripe, setCancelStripe] = useState(true)
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

  async function handleGrantPlan(plan: GrantedPlan | null) {
    setIsLoading(true)

    try {
      const res = await fetch('/api/admin/users/grant-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, grantedPlan: plan }),
      })

      if (!res.ok) {
        throw new Error('Failed to update plan')
      }

      router.refresh()
    } catch (error) {
      console.error('Error granting plan:', error)
      alert('Erro ao atualizar plano do usuario')
    } finally {
      setIsLoading(false)
      setIsOpen(false)
    }
  }

  async function handleResetPassword() {
    setIsLoading(true)

    try {
      const res = await fetch('/api/admin/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send reset email')
      }

      alert('Email de recuperação enviado para ' + userEmail)
    } catch (error) {
      console.error('Error resetting password:', error)
      alert('Erro ao enviar email de recuperação')
    } finally {
      setIsLoading(false)
      setIsOpen(false)
    }
  }

  async function handleDelete(confirmCancelStripe?: boolean) {
    setIsLoading(true)

    try {
      const res = await fetch('/api/admin/users/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, cancelStripe: confirmCancelStripe }),
      })

      const data = await res.json()

      if (data.warning && data.hasActiveSubscription) {
        setHasActiveSubscription(true)
        setDeleteConfirm(true)
        setIsLoading(false)
        return
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete user')
      }

      router.refresh()
      setDeleteConfirm(false)
      setIsOpen(false)
    } catch (error) {
      console.error('Error deleting user:', error)
      alert(error instanceof Error ? error.message : 'Erro ao excluir usuário')
    } finally {
      setIsLoading(false)
    }
  }

  function handleViewDetails() {
    setIsOpen(false)
    if (onViewDetails) {
      onViewDetails(userId)
    }
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
        <div className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {/* Role actions */}
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

          {/* Divider */}
          <div className="border-t border-gray-200 my-1" />
          <div className="px-4 py-1 text-xs text-gray-500 font-medium">Plano Cortesia</div>

          {/* If user has a granted plan, show current plan and remove option */}
          {currentGrantedPlan ? (
            <>
              <div className="px-4 py-2 text-sm text-gray-600 flex items-center gap-2">
                {currentGrantedPlan === 'premium' && <Crown className="h-4 w-4 text-blue-500" />}
                {currentGrantedPlan === 'ai' && <Sparkles className="h-4 w-4 text-purple-500" />}
                {currentGrantedPlan === 'aluno_ecg' && <GraduationCap className="h-4 w-4 text-green-500" />}
                <span>
                  {currentGrantedPlan === 'premium' && 'Premium (cortesia)'}
                  {currentGrantedPlan === 'ai' && 'Premium +AI (cortesia)'}
                  {currentGrantedPlan === 'aluno_ecg' && 'Aluno ECG (cortesia)'}
                </span>
              </div>
              <button
                onClick={() => handleGrantPlan(null)}
                disabled={isLoading}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" />
                Remover Cortesia
              </button>
            </>
          ) : (
            <>
              {/* Grant Premium */}
              <button
                onClick={() => handleGrantPlan('premium')}
                disabled={isLoading}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-blue-600 hover:bg-gray-50 disabled:opacity-50"
              >
                <Crown className="h-4 w-4" />
                Conceder Premium
              </button>

              {/* Grant Premium +AI */}
              <button
                onClick={() => handleGrantPlan('ai')}
                disabled={isLoading}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-purple-600 hover:bg-gray-50 disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                Conceder Premium +AI
              </button>

              {/* Grant Aluno ECG */}
              <button
                onClick={() => handleGrantPlan('aluno_ecg')}
                disabled={isLoading}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-green-600 hover:bg-gray-50 disabled:opacity-50"
              >
                <GraduationCap className="h-4 w-4" />
                Conceder Aluno ECG com JA
              </button>
            </>
          )}

          {/* Divider */}
          <div className="border-t border-gray-200 my-1" />

          {/* View details */}
          {onViewDetails && (
            <button
              onClick={handleViewDetails}
              disabled={isLoading}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <Eye className="h-4 w-4" />
              Ver Detalhes
            </button>
          )}

          {/* Reset password */}
          <button
            onClick={handleResetPassword}
            disabled={isLoading}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <KeyRound className="h-4 w-4" />
            Enviar Reset de Senha
          </button>

          {/* Delete user */}
          {!isMasterAdmin && (
            <button
              onClick={() => setDeleteConfirm(true)}
              disabled={isLoading}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              Excluir Usuário
            </button>
          )}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteConfirm(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Excluir Usuário</h3>
            <p className="text-gray-600 mb-4">
              Tem certeza que deseja excluir <strong>{userEmail}</strong>?
            </p>
            <p className="text-sm text-red-600 mb-4">
              Esta ação é irreversível. Todos os dados do usuário serão permanentemente removidos.
            </p>

            {hasActiveSubscription && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 font-medium mb-2">
                  Este usuário tem uma assinatura ativa no Stripe.
                </p>
                <label className="flex items-center gap-2 text-sm text-yellow-700">
                  <input
                    type="checkbox"
                    checked={cancelStripe}
                    onChange={(e) => setCancelStripe(e.target.checked)}
                    className="rounded border-yellow-300"
                  />
                  Cancelar assinatura no Stripe também
                </label>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDeleteConfirm(false)
                  setHasActiveSubscription(false)
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(cancelStripe)}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isLoading ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
