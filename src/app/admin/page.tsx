import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import {
  FileImage,
  Users,
  Activity,
  TrendingUp,
  Shield,
  GraduationCap,
  Cloud,
  Database,
  ExternalLink,
  HardDrive
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminOverviewPage() {
  const supabase = await createClient()

  // Get counts
  const [
    { count: ecgCount },
    { count: adminCount },
    { count: studentCount },
    { count: attemptCount },
  ] = await Promise.all([
    supabase.from('ecgs').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'admin'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'user'),
    supabase.from('attempts').select('*', { count: 'exact', head: true }),
  ])

  const totalUsers = (adminCount || 0) + (studentCount || 0)

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

  // Get active ECGs count
  const { count: activeEcgCount } = await supabase
    .from('ecgs')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  // Get ECGs with reports
  const { count: ecgsWithReportCount } = await supabase
    .from('ecgs')
    .select('*, official_reports!inner(*)', { count: 'exact', head: true })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Visao Geral</h1>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileImage className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total de ECGs</p>
                <p className="text-2xl font-bold text-gray-900">{ecgCount || 0}</p>
                <p className="text-xs text-gray-500">{activeEcgCount || 0} ativos</p>
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
                <p className="text-sm text-gray-600">Total de Usuarios</p>
                <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
                <div className="flex gap-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Shield className="h-3 w-3" /> {adminCount || 0} admins
                  </span>
                  <span className="flex items-center gap-1">
                    <GraduationCap className="h-3 w-3" /> {studentCount || 0} estudantes
                  </span>
                </div>
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
                <p className="text-sm text-gray-600">Total de Tentativas</p>
                <p className="text-2xl font-bold text-gray-900">{attemptCount || 0}</p>
                <p className="text-xs text-gray-500">
                  {totalUsers > 0 ? Math.round((attemptCount || 0) / totalUsers) : 0} por usuario
                </p>
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
                <p className="text-sm text-gray-600">Media Geral</p>
                <p className="text-2xl font-bold text-gray-900">{averageScore}%</p>
                <p className="text-xs text-gray-500">
                  {ecgsWithReportCount || 0} ECGs com laudo
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Infrastructure Cards */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Infraestrutura</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Cloudinary Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Cloud className="h-5 w-5 text-blue-500" />
                Cloudinary (Imagens)
              </CardTitle>
              <Link
                href="https://console.cloudinary.com/console"
                target="_blank"
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
              >
                Abrir Console <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Cloud Name</span>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">dtmqhakgu</code>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Upload Preset</span>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">ecg_uploads</code>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">ECGs armazenados</span>
                <span className="text-sm font-medium">{ecgCount || 0} imagens</span>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-gray-500">
                  Plano gratuito: 25 creditos/mes (~25GB de banda ou ~2.5GB de armazenamento)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Supabase Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="h-5 w-5 text-green-500" />
                Supabase (Banco de Dados)
              </CardTitle>
              <Link
                href="https://supabase.com/dashboard/project/hwgsjpjbyydpittefnjd"
                target="_blank"
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
              >
                Abrir Dashboard <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Projeto</span>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">hwgsjpjbyydpittefnjd</code>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Regiao</span>
                <span className="text-sm font-medium">South America (Sao Paulo)</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <p className="text-lg font-bold text-gray-900">{ecgCount || 0}</p>
                  <p className="text-xs text-gray-500">ECGs</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <p className="text-lg font-bold text-gray-900">{totalUsers}</p>
                  <p className="text-xs text-gray-500">Profiles</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <p className="text-lg font-bold text-gray-900">{attemptCount || 0}</p>
                  <p className="text-xs text-gray-500">Attempts</p>
                </div>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-gray-500">
                  Plano gratuito: 500MB banco de dados, 1GB storage, 2GB banda/mes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Storage Estimate */}
      <Card className="mb-8">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-purple-500" />
            Estimativa de Uso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Banco de Dados (Supabase)</span>
                <span className="text-sm font-medium">&lt;1MB / 500MB</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '0.5%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Imagens (Cloudinary)</span>
                <span className="text-sm font-medium">~{((ecgCount || 0) * 0.5).toFixed(1)}MB / 2500MB</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${Math.min(((ecgCount || 0) * 0.5 / 2500) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Usuarios Autenticados</span>
                <span className="text-sm font-medium">{totalUsers} / 50.000</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ width: `${Math.min((totalUsers / 50000) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            * Estimativas baseadas nos limites do plano gratuito. Para uso real, consulte os dashboards de cada servico.
          </p>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          {recentAttempts && recentAttempts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Usuario</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">ECG</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Nota</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAttempts.map((attempt) => (
                    <tr key={attempt.id} className="border-b">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {attempt.profiles?.full_name || 'Desconhecido'}
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
                        {new Date(attempt.created_at).toLocaleDateString('pt-BR', {
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
            <p className="text-gray-500 text-center py-8">Nenhuma atividade recente</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
