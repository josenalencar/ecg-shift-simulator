import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { User, Shield, Calendar, Activity } from 'lucide-react'
import { UserActions } from './user-actions'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const supabase = await createClient()

  // Get all users with their stats
  const { data: profilesData } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  type Profile = {
    id: string
    email: string
    full_name: string | null
    role: string
    created_at: string
  }

  const profiles = profilesData as Profile[] | null

  // Get attempt counts per user
  const { data: attemptStatsData } = await supabase
    .from('attempts')
    .select('user_id, score')

  type AttemptStat = {
    user_id: string
    score: number
  }

  const attemptStats = attemptStatsData as AttemptStat[] | null

  // Calculate stats per user
  const userStats = new Map<string, { count: number; avgScore: number }>()
  if (attemptStats) {
    attemptStats.forEach((attempt) => {
      const existing = userStats.get(attempt.user_id)
      if (existing) {
        existing.count++
        existing.avgScore = (existing.avgScore * (existing.count - 1) + Number(attempt.score)) / existing.count
      } else {
        userStats.set(attempt.user_id, { count: 1, avgScore: Number(attempt.score) })
      }
    })
  }

  const adminCount = profiles?.filter(p => p.role === 'admin').length || 0
  const userCount = profiles?.filter(p => p.role === 'user').length || 0

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Gerenciar Usuários</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total de Usuários</p>
                <p className="text-2xl font-bold text-gray-900">{profiles?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Administradores</p>
                <p className="text-2xl font-bold text-gray-900">{adminCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Usuários Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{userCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          {profiles && profiles.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Usuário</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Função</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">ECGs Realizados</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Média</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Cadastro</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map((profile) => {
                    const stats = userStats.get(profile.id)
                    return (
                      <tr key={profile.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {profile.full_name || 'Sem nome'}
                            </p>
                            <p className="text-sm text-gray-500">{profile.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`
                            px-2 py-1 rounded-full text-xs font-medium
                            ${profile.role === 'admin'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-gray-100 text-gray-700'
                            }
                          `}>
                            {profile.role === 'admin' ? 'Admin' : 'Usuário'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-900">
                          {stats?.count || 0}
                        </td>
                        <td className="py-3 px-4">
                          {stats ? (
                            <span className={`
                              px-2 py-1 rounded-full text-sm font-medium
                              ${stats.avgScore >= 80
                                ? 'bg-green-100 text-green-700'
                                : stats.avgScore >= 60
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                              }
                            `}>
                              {Math.round(stats.avgScore)}%
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(profile.created_at).toLocaleDateString('pt-BR')}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <UserActions userId={profile.id} userEmail={profile.email} currentRole={profile.role} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Nenhum usuário encontrado</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
