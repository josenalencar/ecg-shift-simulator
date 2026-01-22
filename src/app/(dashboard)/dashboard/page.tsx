import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'
import { Activity, Target, TrendingUp, Clock } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profileData } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', user.id)
    .single()

  const profile = profileData as { id: string; full_name: string | null; role: string } | null

  // Get user stats
  const { data: attempts } = await supabase
    .from('attempts')
    .select('id, score, created_at, ecgs(title)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const typedAttempts = attempts as { id: string; score: number; created_at: string; ecgs: { title: string } | null }[] | null
  const totalAttempts = typedAttempts?.length || 0
  const averageScore = totalAttempts > 0
    ? Math.round((typedAttempts?.reduce((sum, a) => sum + Number(a.score), 0) || 0) / totalAttempts)
    : 0

  // Get count of ECGs available
  const { count: ecgCount } = await supabase
    .from('ecgs')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {profile?.full_name || 'Doctor'}!
        </h1>
        <p className="text-gray-600 mt-1">
          Continue your ECG interpretation practice
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">ECGs Interpreted</p>
                <p className="text-2xl font-bold text-gray-900">{totalAttempts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{averageScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Available ECGs</p>
                <p className="text-2xl font-bold text-gray-900">{ecgCount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Remaining</p>
                <p className="text-2xl font-bold text-gray-900">{(ecgCount || 0) - totalAttempts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Start Practice</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Jump into a practice session and interpret ECGs just like a real tele-ECG shift.
              Get immediate feedback and learn from your mistakes.
            </p>
            <Link href="/practice">
              <Button size="lg">
                Start Practice Session
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Completion</span>
                <span className="font-medium">
                  {ecgCount ? Math.round((totalAttempts / ecgCount) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${ecgCount ? (totalAttempts / ecgCount) * 100 : 0}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">
                {totalAttempts} of {ecgCount || 0} ECGs completed
              </p>
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
          {typedAttempts && typedAttempts.length > 0 ? (
            <div className="divide-y">
              {typedAttempts.slice(0, 5).map((attempt) => (
                <div key={attempt.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {attempt.ecgs?.title || 'ECG Case'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(attempt.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className={`
                    px-3 py-1 rounded-full text-sm font-medium
                    ${Number(attempt.score) >= 80
                      ? 'bg-green-100 text-green-700'
                      : Number(attempt.score) >= 60
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }
                  `}>
                    {Math.round(Number(attempt.score))}%
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No practice sessions yet</p>
              <Link href="/practice">
                <Button variant="outline">Start your first session</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
