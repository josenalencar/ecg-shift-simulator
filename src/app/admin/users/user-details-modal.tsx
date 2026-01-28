'use client'

import { useState, useEffect } from 'react'
import { X, User, Trophy, Target, Calendar, Crown, Sparkles, GraduationCap, Flame, Zap, Award, Loader2 } from 'lucide-react'

interface UserDetailsModalProps {
  userId: string | null
  onClose: () => void
}

interface UserDetails {
  profile: {
    id: string
    email: string
    full_name: string | null
    role: string
    hospital_type: string | null
    granted_plan: string | null
    subscription_status: string | null
    created_at: string
  }
  subscription: {
    status: string
    plan: string
    current_period_end: string
  } | null
  gamification: {
    total_xp: number
    current_level: number
    current_streak: number
    longest_streak: number
    total_ecgs_completed: number
    perfect_scores: number
  }
  achievements: Array<{
    id: string
    earned_at: string
    achievements: {
      name: string
      description: string
      icon: string
    }
  }>
  stats: {
    totalAttempts: number
    avgScore: number
    passCount: number
    passRate: number
  }
  recentAttempts: Array<{
    id: string
    score: number
    created_at: string
    ecg_id: string
  }>
}

export function UserDetailsModal({ userId, onClose }: UserDetailsModalProps) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<UserDetails | null>(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'info' | 'stats' | 'history' | 'gamification'>('info')

  useEffect(() => {
    if (!userId) return

    async function fetchDetails() {
      setLoading(true)
      setError('')

      try {
        const res = await fetch(`/api/admin/users/${userId}`)
        const json = await res.json()

        if (!res.ok) {
          throw new Error(json.error || 'Failed to fetch user details')
        }

        setData(json)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar detalhes')
      } finally {
        setLoading(false)
      }
    }

    fetchDetails()
  }, [userId])

  if (!userId) return null

  const getPlanBadge = () => {
    if (!data) return null
    const plan = data.profile.granted_plan || (data.subscription?.status === 'active' ? data.subscription.plan : null)

    if (plan === 'ai') return (
      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium inline-flex items-center gap-1">
        <Sparkles className="h-3 w-3" /> Premium +IA
      </span>
    )
    if (plan === 'premium') return (
      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium inline-flex items-center gap-1">
        <Crown className="h-3 w-3" /> Premium
      </span>
    )
    if (plan === 'aluno_ecg') return (
      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium inline-flex items-center gap-1">
        <GraduationCap className="h-3 w-3" /> Aluno ECG
      </span>
    )
    return (
      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
        Gratuito
      </span>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <User className="h-5 w-5" />
            Detalhes do Usuário
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-600">{error}</div>
        ) : data ? (
          <>
            {/* User header */}
            <div className="p-4 bg-gray-50 border-b">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {data.profile.full_name || 'Sem nome'}
                  </h3>
                  <p className="text-gray-600">{data.profile.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getPlanBadge()}
                    {data.profile.role === 'admin' && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                        Admin
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b">
              {[
                { key: 'info', label: 'Informações' },
                { key: 'stats', label: 'Estatísticas' },
                { key: 'history', label: 'Histórico' },
                { key: 'gamification', label: 'Gamificação' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="p-4 overflow-y-auto flex-1">
              {activeTab === 'info' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Email</p>
                      <p className="text-gray-900">{data.profile.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Nome</p>
                      <p className="text-gray-900">{data.profile.full_name || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Hospital</p>
                      <p className="text-gray-900">{data.profile.hospital_type || 'Não configurado'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Cadastro</p>
                      <p className="text-gray-900">
                        {new Date(data.profile.created_at).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
                      </p>
                    </div>
                  </div>

                  {data.subscription && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Assinatura</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-blue-600">Status</p>
                          <p className="text-blue-900 font-medium">{data.subscription.status}</p>
                        </div>
                        <div>
                          <p className="text-blue-600">Plano</p>
                          <p className="text-blue-900 font-medium">{data.subscription.plan}</p>
                        </div>
                        <div>
                          <p className="text-blue-600">Válido até</p>
                          <p className="text-blue-900 font-medium">
                            {new Date(data.subscription.current_period_end).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'stats' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg text-center">
                    <Target className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-900">{data.stats.totalAttempts}</p>
                    <p className="text-xs text-blue-600">ECGs realizados</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg text-center">
                    <Trophy className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-900">{data.stats.avgScore}%</p>
                    <p className="text-xs text-green-600">Média de acertos</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg text-center">
                    <Award className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-900">{data.stats.passCount}</p>
                    <p className="text-xs text-purple-600">Aprovações (80%+)</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg text-center">
                    <Flame className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-orange-900">{data.stats.passRate}%</p>
                    <p className="text-xs text-orange-600">Taxa de aprovação</p>
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div>
                  {data.recentAttempts.length > 0 ? (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 text-gray-600">Data</th>
                          <th className="text-left py-2 text-gray-600">Pontuação</th>
                          <th className="text-left py-2 text-gray-600">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.recentAttempts.map((attempt) => (
                          <tr key={attempt.id} className="border-b">
                            <td className="py-2 text-gray-900">
                              {new Date(attempt.created_at).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="py-2">
                              <span className={`font-medium ${
                                attempt.score >= 80 ? 'text-green-600' :
                                attempt.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {attempt.score}%
                              </span>
                            </td>
                            <td className="py-2">
                              {attempt.score >= 80 ? (
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">Aprovado</span>
                              ) : (
                                <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs">Reprovado</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-center text-gray-500 py-8">Nenhuma tentativa registrada</p>
                  )}
                </div>
              )}

              {activeTab === 'gamification' && (
                <div className="space-y-6">
                  {/* XP and Level */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-purple-50 rounded-lg text-center">
                      <Zap className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-purple-900">{data.gamification.total_xp}</p>
                      <p className="text-xs text-purple-600">XP Total</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg text-center">
                      <Award className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-blue-900">{data.gamification.current_level}</p>
                      <p className="text-xs text-blue-600">Nível</p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg text-center">
                      <Flame className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-orange-900">{data.gamification.current_streak}</p>
                      <p className="text-xs text-orange-600">Streak Atual</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg text-center">
                      <Trophy className="h-6 w-6 text-green-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-green-900">{data.gamification.perfect_scores}</p>
                      <p className="text-xs text-green-600">Scores Perfeitos</p>
                    </div>
                  </div>

                  {/* Achievements */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Conquistas ({data.achievements.length})</h4>
                    {data.achievements.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {data.achievements.map((a) => (
                          <div key={a.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
                            <span className="text-2xl">{a.achievements.icon}</span>
                            <div>
                              <p className="font-medium text-yellow-900 text-sm">{a.achievements.name}</p>
                              <p className="text-xs text-yellow-700">{a.achievements.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-4">Nenhuma conquista ainda</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
