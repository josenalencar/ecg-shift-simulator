import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'
import { Plus, Eye, EyeOff, User } from 'lucide-react'
import { ECGActions } from './ecg-actions'
import { DIFFICULTIES, CATEGORIES } from '@/lib/ecg-constants'
import type { ECG, OfficialReport, Profile } from '@/types/database'

export const dynamic = 'force-dynamic'

type ECGWithReportAndCreator = ECG & {
  official_reports: OfficialReport | null
  profiles: Pick<Profile, 'full_name' | 'email'> | null
}

export default async function AdminECGsPage() {
  const supabase = await createClient()

  const { data: ecgsData, error } = await supabase
    .from('ecgs')
    .select('*, official_reports(*), profiles!ecgs_created_by_fkey(full_name, email)')
    .order('created_at', { ascending: false })

  const ecgs = ecgsData as ECGWithReportAndCreator[] | null

  if (error) {
    console.error('Error fetching ECGs:', error)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Casos de ECG</h1>
        <Link href="/admin/ecgs/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Novo ECG
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todos os Casos ({ecgs?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {ecgs && ecgs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Título</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Dificuldade</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Categoria</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Enviado por</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Laudo</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {ecgs.map((ecg) => {
                    const diffLabel = DIFFICULTIES.find(d => d.value === ecg.difficulty)?.label || ecg.difficulty
                    const catLabel = CATEGORIES.find(c => c.value === ecg.category)?.label || ecg.category
                    const creatorName = ecg.profiles?.full_name || ecg.profiles?.email?.split('@')[0] || 'Desconhecido'

                    return (
                      <tr key={ecg.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {ecg.image_url && (
                              <img
                                src={ecg.image_url}
                                alt={ecg.title}
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <span className="font-medium text-gray-900">{ecg.title}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`
                            px-2 py-1 rounded-full text-xs font-medium
                            ${ecg.difficulty === 'easy'
                              ? 'bg-green-100 text-green-700'
                              : ecg.difficulty === 'medium'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }
                          `}>
                            {diffLabel}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {catLabel}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <User className="h-4 w-4" />
                            <span className="text-sm">{creatorName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {ecg.official_reports ? (
                            <span className="text-green-600 text-sm">Com laudo</span>
                          ) : (
                            <span className="text-red-600 text-sm">Sem laudo</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {ecg.is_active ? (
                            <span className="flex items-center gap-1 text-green-600 text-sm">
                              <Eye className="h-4 w-4" />
                              Ativo
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-gray-500 text-sm">
                              <EyeOff className="h-4 w-4" />
                              Inativo
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <ECGActions ecgId={ecg.id} isActive={ecg.is_active} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Nenhum caso de ECG ainda</p>
              <Link href="/admin/ecgs/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicione seu primeiro ECG
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
