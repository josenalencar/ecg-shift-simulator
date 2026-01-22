import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { FileImage, Users, Activity, TrendingUp } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminOverviewPage() {
  const supabase = await createClient()

  // Get counts
  const [
    { count: ecgCount },
    { count: userCount },
    { count: attemptCount },
  ] = await Promise.all([
    supabase.from('ecgs').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'user'),
    supabase.from('attempts').select('*', { count: 'exact', head: true }),
  ])

  // Get recent attempts
  const { data: recentAttemptsData } = await supabase
    .from('attempts')
    .select('*, profiles(full_name, email), ecgs(title)')
    .order('created_at', { ascending: false })
    .limit(5)

  type AttemptWithRelations = {
    id: string
    score: number
    created_at: string
    profiles: { full_name: string | null; email: string } | null
    ecgs: { title: string } | null
  }
  const recentAttempts = recentAttemptsData as AttemptWithRelations[] | null

  // Calculate average score
  const { data: scoreDataRaw } = await supabase
    .from('attempts')
    .select('score')

  const scoreData = scoreDataRaw as { score: number }[] | null
  const averageScore = scoreData && scoreData.length > 0
    ? Math.round(scoreData.reduce((sum, a) => sum + Number(a.score), 0) / scoreData.length)
    : 0

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Admin Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileImage className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total ECGs</p>
                <p className="text-2xl font-bold text-gray-900">{ecgCount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{userCount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Attempts</p>
                <p className="text-2xl font-bold text-gray-900">{attemptCount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg. Score</p>
                <p className="text-2xl font-bold text-gray-900">{averageScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recentAttempts && recentAttempts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">User</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">ECG</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Score</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAttempts.map((attempt) => (
                    <tr key={attempt.id} className="border-b">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {attempt.profiles?.full_name || 'Unknown'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {attempt.profiles?.email}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-900">
                        {attempt.ecgs?.title}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`
                          px-2 py-1 rounded-full text-sm font-medium
                          ${Number(attempt.score) >= 80
                            ? 'bg-green-100 text-green-700'
                            : Number(attempt.score) >= 60
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }
                        `}>
                          {Math.round(Number(attempt.score))}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(attempt.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent activity</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
