import { createClient } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { User, Shield, Crown, Sparkles } from 'lucide-react'
import { UserFilters } from './user-filters'
import { UserToolbar } from './user-toolbar'
import { UsersTableClient } from './users-table-client'
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
  searchParams: Promise<{ filter?: string; sort?: string; order?: string; search?: string; dateFrom?: string; dateTo?: string }>
}) {
  const params = await searchParams
  const filter = params.filter || 'all'
  const sort = params.sort || 'created_at'
  const order = params.order || 'desc'
  const search = params.search || ''
  const dateFrom = params.dateFrom || ''
  const dateTo = params.dateTo || ''

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

  // Date range filter
  if (dateFrom) {
    const fromDate = new Date(dateFrom)
    fromDate.setHours(0, 0, 0, 0)
    filteredProfiles = filteredProfiles.filter(profile =>
      new Date(profile.created_at) >= fromDate
    )
  }
  if (dateTo) {
    const toDate = new Date(dateTo)
    toDate.setHours(23, 59, 59, 999)
    filteredProfiles = filteredProfiles.filter(profile =>
      new Date(profile.created_at) <= toDate
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

  // Prepare data for components
  const usersForTable = filteredProfiles.map(profile => {
    const planInfo = getUserPlanInfo(profile)
    const stats = userStats.get(profile.id)
    return {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      role: profile.role,
      created_at: profile.created_at,
      granted_plan: profile.granted_plan,
      planType: planInfo.plan,
      isGranted: planInfo.isGranted,
      ecgCount: stats?.count || 0,
      avgScore: stats?.avgScore || 0
    }
  })

  const usersForExport = usersForTable.map(u => ({
    name: u.full_name || 'Sem nome',
    email: u.email,
    plan: u.planType === 'ai' ? 'Premium +IA' : u.planType === 'premium' ? 'Premium' : u.planType === 'aluno_ecg' ? 'Aluno ECG' : 'Gratuito',
    role: u.role === 'admin' ? 'Admin' : 'Usuário',
    ecgs: u.ecgCount,
    avgScore: Math.round(u.avgScore),
    createdAt: new Date(u.created_at).toLocaleDateString('pt-BR')
  }))

  const adminCount = profiles?.filter(p => p.role === 'admin').length || 0
  const premiumCount = profiles?.filter(p => {
    const info = getUserPlanInfo(p)
    return info.plan === 'premium'
  }).length || 0
  const aiCount = profiles?.filter(p => {
    const info = getUserPlanInfo(p)
    return info.plan === 'ai'
  }).length || 0
  const freeCount = profiles?.filter(p => getUserPlanInfo(p).plan === 'free' && p.role !== 'admin').length || 0

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Gerenciar Usuários</h1>

      {/* Toolbar */}
      <UserToolbar usersForExport={usersForExport} />

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
      <UserFilters
        currentFilter={filter}
        currentSort={sort}
        currentOrder={order}
        currentSearch={search}
        currentDateFrom={dateFrom}
        currentDateTo={dateTo}
      />

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Lista de Usuários
            {(filter !== 'all' || search || dateFrom || dateTo) && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({filteredProfiles.length} de {profiles?.length})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {usersForTable.length > 0 ? (
            <UsersTableClient users={usersForTable} />
          ) : (
            <p className="text-gray-500 text-center py-8">Nenhum usuário encontrado</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
