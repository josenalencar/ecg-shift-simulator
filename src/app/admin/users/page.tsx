import { createClient } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { User, Shield, Calendar, Crown, Sparkles, GraduationCap } from 'lucide-react'
import { UserActions } from './user-actions'
import { UserFilters } from './user-filters'
import { GrantedPlan } from '@/types/database'

export const dynamic = 'force-dynamic'

// Helper to create admin client (lazy to avoid build-time issues)
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

type Profile = {
  id: string
  email: string
  full_name: string | null
  role: string
  created_at: string
  subscription_status: string | null
  granted_plan: GrantedPlan | null
}

type Subscription = {
  user_id: string
  status: string
  plan: string
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; sort?: string; order?: string; search?: string }>
}) {
  const params = await searchParams
  const filter = params.filter || 'all'
  const sort = params.sort || 'created_at'
  const order = params.order || 'desc'
  const search = params.search || ''

  const supabaseAdmin = getSupabaseAdmin()

  // Get all users with admin client (bypasses RLS)
  const { data: profilesData, error: profilesError } = await supabaseAdmin
    .from('profiles')
    .select('id, email, full_name, role, created_at, subscription_status, granted_plan')
    .order('created_at', { ascending: false })

  if (profilesError) {
    console.error('Failed to fetch profiles:', profilesError)
  }

  const profiles = profilesData as Profile[] | null

  // Get all subscriptions
  const { data: subscriptionsData } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id, status, plan')

  const subscriptions = subscriptionsData as Subscription[] | null
  const subscriptionMap = new Map<string, Subscription>()
  subscriptions?.forEach(sub => {
    subscriptionMap.set(sub.user_id, sub)
  })

  // Get ALL attempt counts with admin client (bypasses RLS)
  const { data: attemptStatsData, error: attemptsError } = await supabaseAdmin
    .from('attempts')
    .select('user_id, score')

  if (attemptsError) {
    console.error('Failed to fetch attempts:', attemptsError)
  }

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

  // Helper function to get user plan type
  const getUserPlanInfo = (profile: Profile): { plan: 'free' | 'premium' | 'ai' | 'aluno_ecg'; isGranted: boolean } => {
    // Granted plans take priority
    if (profile.granted_plan) {
      return { plan: profile.granted_plan, isGranted: true }
    }
    // Then check paid subscription
    const subscription = subscriptionMap.get(profile.id)
    if (!subscription || subscription.status !== 'active') {
      return { plan: 'free', isGranted: false }
    }
    return { plan: subscription.plan === 'ai' ? 'ai' : 'premium', isGranted: false }
  }

  // Filter users
  let filteredProfiles = profiles || []

  // Search filter
  if (search) {
    const searchLower = search.toLowerCase()
    filteredProfiles = filteredProfiles.filter(profile =>
      (profile.full_name?.toLowerCase().includes(searchLower)) ||
      (profile.email.toLowerCase().includes(searchLower))
    )
  }

  // Plan/role filter
  if (filter !== 'all') {
    filteredProfiles = filteredProfiles.filter(profile => {
      const planInfo = getUserPlanInfo(profile)
      switch (filter) {
        case 'free':
          return planInfo.plan === 'free'
        case 'premium':
          return planInfo.plan === 'premium'
        case 'ai':
          return planInfo.plan === 'ai'
        case 'aluno_ecg':
          return planInfo.plan === 'aluno_ecg'
        case 'admin':
          return profile.role === 'admin'
        default:
          return true
      }
    })
  }

  // Sort users
  filteredProfiles = [...filteredProfiles].sort((a, b) => {
    let comparison = 0

    switch (sort) {
      case 'ecgs':
        const aCount = userStats.get(a.id)?.count || 0
        const bCount = userStats.get(b.id)?.count || 0
        comparison = aCount - bCount
        break
      case 'score':
        const aScore = userStats.get(a.id)?.avgScore || 0
        const bScore = userStats.get(b.id)?.avgScore || 0
        comparison = aScore - bScore
        break
      case 'name':
        comparison = (a.full_name || '').localeCompare(b.full_name || '')
        break
      case 'created_at':
      default:
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        break
    }

    return order === 'asc' ? comparison : -comparison
  })

  const adminCount = profiles?.filter(p => p.role === 'admin').length || 0
  const userCount = profiles?.filter(p => p.role === 'user').length || 0
  const premiumCount = profiles?.filter(p => {
    const info = getUserPlanInfo(p)
    return info.plan === 'premium'
  }).length || 0
  const aiCount = profiles?.filter(p => {
    const info = getUserPlanInfo(p)
    return info.plan === 'ai'
  }).length || 0
  const alunoEcgCount = profiles?.filter(p => {
    const info = getUserPlanInfo(p)
    return info.plan === 'aluno_ecg'
  }).length || 0
  const freeCount = profiles?.filter(p => getUserPlanInfo(p).plan === 'free' && p.role !== 'admin').length || 0

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Gerenciar Usuários</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Total</p>
                <p className="text-xl font-bold text-gray-900">{profiles?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <User className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Gratuitos</p>
                <p className="text-xl font-bold text-gray-900">{freeCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Crown className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Premium</p>
                <p className="text-xl font-bold text-gray-900">{premiumCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Sparkles className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Premium +AI</p>
                <p className="text-xl font-bold text-gray-900">{aiCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Shield className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Admins</p>
                <p className="text-xl font-bold text-gray-900">{adminCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <UserFilters currentFilter={filter} currentSort={sort} currentOrder={order} currentSearch={search} />

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Lista de Usuários
            {filter !== 'all' && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({filteredProfiles.length} de {profiles?.length})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProfiles && filteredProfiles.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
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
                  {filteredProfiles.map((profile) => {
                    const stats = userStats.get(profile.id)
                    const planInfo = getUserPlanInfo(profile)
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
                            px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1
                            ${planInfo.plan === 'ai'
                              ? 'bg-purple-100 text-purple-700'
                              : planInfo.plan === 'premium'
                                ? 'bg-blue-100 text-blue-700'
                                : planInfo.plan === 'aluno_ecg'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-700'
                            }
                          `}>
                            {planInfo.plan === 'ai' && <Sparkles className="h-3 w-3" />}
                            {planInfo.plan === 'premium' && <Crown className="h-3 w-3" />}
                            {planInfo.plan === 'aluno_ecg' && <GraduationCap className="h-3 w-3" />}
                            {planInfo.plan === 'ai' ? 'Premium +AI' : planInfo.plan === 'premium' ? 'Premium' : planInfo.plan === 'aluno_ecg' ? 'Aluno ECG' : 'Gratuito'}
                            {planInfo.isGranted && <span className="ml-1 opacity-70">(cortesia)</span>}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`
                            px-2 py-1 rounded-full text-xs font-medium
                            ${profile.role === 'admin'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                            }
                          `}>
                            {profile.role === 'admin' ? 'Admin' : 'Usuário'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-900 font-medium">
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
                          <UserActions userId={profile.id} userEmail={profile.email} currentRole={profile.role} currentGrantedPlan={profile.granted_plan} />
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
