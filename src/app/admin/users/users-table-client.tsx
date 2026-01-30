'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Crown, Sparkles, GraduationCap, Trash2, Loader2, XCircle } from 'lucide-react'
import { UserActions } from './user-actions'
import { UserDetailsModal } from './user-details-modal'
import { GrantedPlan } from '@/types/database'
import { Button } from '@/components/ui'

interface UserData {
  id: string
  email: string
  full_name: string | null
  role: string
  created_at: string
  created_at_formatted: string
  granted_plan: GrantedPlan | null
  planType: 'free' | 'premium' | 'ai' | 'aluno_ecg'
  isGranted: boolean
  ecgCount: number
  avgScore: number
}

interface UsersTableClientProps {
  users: UserData[]
}

export function UsersTableClient({ users }: UsersTableClientProps) {
  const router = useRouter()
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [detailsUserId, setDetailsUserId] = useState<string | null>(null)
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [bulkGranting, setBulkGranting] = useState<string | null>(null) // stores plan being granted or 'remove'

  const toggleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set())
    } else {
      setSelectedUsers(new Set(users.map(u => u.id)))
    }
  }

  const toggleSelect = (userId: string) => {
    const newSet = new Set(selectedUsers)
    if (newSet.has(userId)) {
      newSet.delete(userId)
    } else {
      newSet.add(userId)
    }
    setSelectedUsers(newSet)
  }

  const handleBulkDelete = async () => {
    if (selectedUsers.size === 0) return
    if (!confirm(`Tem certeza que deseja excluir ${selectedUsers.size} usuário(s)?`)) return

    setBulkDeleting(true)
    let successCount = 0
    let failCount = 0

    for (const userId of selectedUsers) {
      try {
        const res = await fetch('/api/admin/users/delete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, cancelStripe: true }),
        })

        const data = await res.json()

        // If it returns a warning, try again with confirmation
        if (data.warning) {
          await fetch('/api/admin/users/delete', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, cancelStripe: true }),
          })
        }

        if (res.ok) successCount++
        else failCount++
      } catch {
        failCount++
      }
    }

    setBulkDeleting(false)
    setSelectedUsers(new Set())
    alert(`${successCount} usuário(s) excluído(s). ${failCount} falha(s).`)
    router.refresh()
  }

  const handleBulkGrantPlan = async (plan: GrantedPlan | null) => {
    if (selectedUsers.size === 0) return

    const action = plan === null ? 'remover cortesia de' : `conceder ${plan === 'premium' ? 'Premium' : plan === 'ai' ? 'Premium +AI' : 'Aluno ECG'} para`
    if (!confirm(`Tem certeza que deseja ${action} ${selectedUsers.size} usuário(s)?`)) return

    setBulkGranting(plan || 'remove')
    let successCount = 0
    let failCount = 0

    for (const userId of selectedUsers) {
      try {
        const res = await fetch('/api/admin/users/grant-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, grantedPlan: plan }),
        })

        if (res.ok) successCount++
        else failCount++
      } catch {
        failCount++
      }
    }

    setBulkGranting(null)
    setSelectedUsers(new Set())
    const actionDone = plan === null ? 'Cortesia removida' : 'Plano concedido'
    alert(`${actionDone} para ${successCount} usuário(s). ${failCount} falha(s).`)
    router.refresh()
  }

  return (
    <>
      {/* Bulk action bar */}
      {selectedUsers.size > 0 && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-blue-800 font-medium">
              {selectedUsers.size} usuário(s) selecionado(s)
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedUsers(new Set())}
            >
              Limpar seleção
            </Button>
          </div>

          {/* Bulk plan actions */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600 mr-2">Cortesia:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkGrantPlan('premium')}
              disabled={bulkGranting !== null || bulkDeleting}
              className="text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              {bulkGranting === 'premium' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Crown className="h-4 w-4 mr-1" />
              )}
              Premium
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkGrantPlan('ai')}
              disabled={bulkGranting !== null || bulkDeleting}
              className="text-purple-600 border-purple-300 hover:bg-purple-50"
            >
              {bulkGranting === 'ai' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Sparkles className="h-4 w-4 mr-1" />
              )}
              Premium +AI
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkGrantPlan('aluno_ecg')}
              disabled={bulkGranting !== null || bulkDeleting}
              className="text-green-600 border-green-300 hover:bg-green-50"
            >
              {bulkGranting === 'aluno_ecg' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <GraduationCap className="h-4 w-4 mr-1" />
              )}
              Aluno ECG
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkGrantPlan(null)}
              disabled={bulkGranting !== null || bulkDeleting}
              className="text-orange-600 border-orange-300 hover:bg-orange-50"
            >
              {bulkGranting === 'remove' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <XCircle className="h-4 w-4 mr-1" />
              )}
              Remover
            </Button>
          </div>

          {/* Delete action */}
          <div className="flex items-center gap-2 pt-2 border-t border-blue-200">
            <Button
              variant="danger"
              size="sm"
              onClick={handleBulkDelete}
              disabled={bulkDeleting || bulkGranting !== null}
            >
              {bulkDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Excluir selecionados
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">
                <input
                  type="checkbox"
                  checked={selectedUsers.size === users.length && users.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Usuário</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Plano</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Função</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">ECGs</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Média</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Cadastro</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className={`border-b hover:bg-gray-50 ${selectedUsers.has(user.id) ? 'bg-blue-50' : ''}`}>
                <td className="py-3 px-4">
                  <input
                    type="checkbox"
                    checked={selectedUsers.has(user.id)}
                    onChange={() => toggleSelect(user.id)}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="py-3 px-4">
                  <div>
                    <p className="font-medium text-gray-900">
                      {user.full_name || 'Sem nome'}
                    </p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`
                    px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1
                    ${user.planType === 'ai'
                      ? 'bg-purple-100 text-purple-700'
                      : user.planType === 'premium'
                        ? 'bg-blue-100 text-blue-700'
                        : user.planType === 'aluno_ecg'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                    }
                  `}>
                    {user.planType === 'ai' && <Sparkles className="h-3 w-3" />}
                    {user.planType === 'premium' && <Crown className="h-3 w-3" />}
                    {user.planType === 'aluno_ecg' && <GraduationCap className="h-3 w-3" />}
                    {user.planType === 'ai' ? 'Premium +AI' : user.planType === 'premium' ? 'Premium' : user.planType === 'aluno_ecg' ? 'Aluno ECG' : 'Gratuito'}
                    {user.isGranted && <span className="ml-1 opacity-70">(cortesia)</span>}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${user.role === 'admin'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-700'
                    }
                  `}>
                    {user.role === 'admin' ? 'Admin' : 'Usuário'}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-900 font-medium">
                  {user.ecgCount}
                </td>
                <td className="py-3 px-4">
                  {user.ecgCount > 0 ? (
                    <span className={`
                      px-2 py-1 rounded-full text-sm font-medium
                      ${user.avgScore >= 80
                        ? 'bg-green-100 text-green-700'
                        : user.avgScore >= 60
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }
                    `}>
                      {Math.round(user.avgScore)}%
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="py-3 px-4 text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {user.created_at_formatted}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <UserActions
                    userId={user.id}
                    userEmail={user.email}
                    currentRole={user.role}
                    currentGrantedPlan={user.granted_plan}
                    onViewDetails={(id) => setDetailsUserId(id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User details modal */}
      <UserDetailsModal
        userId={detailsUserId}
        onClose={() => setDetailsUserId(null)}
      />
    </>
  )
}
