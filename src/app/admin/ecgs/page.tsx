import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'
import { Plus, Eye, EyeOff } from 'lucide-react'
import { ECGActions } from './ecg-actions'
import type { ECG, OfficialReport } from '@/types/database'

export const dynamic = 'force-dynamic'

type ECGWithReport = ECG & { official_reports: OfficialReport | null }

export default async function AdminECGsPage() {
  const supabase = await createClient()

  const { data: ecgsData, error } = await supabase
    .from('ecgs')
    .select('*, official_reports(*)')
    .order('created_at', { ascending: false })

  const ecgs = ecgsData as ECGWithReport[] | null

  if (error) {
    console.error('Error fetching ECGs:', error)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">ECG Cases</h1>
        <Link href="/admin/ecgs/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add New ECG
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All ECG Cases ({ecgs?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {ecgs && ecgs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Title</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Difficulty</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Category</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Report</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ecgs.map((ecg) => (
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
                          {ecg.difficulty}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 capitalize">
                        {ecg.category}
                      </td>
                      <td className="py-3 px-4">
                        {ecg.official_reports ? (
                          <span className="text-green-600 text-sm">Has report</span>
                        ) : (
                          <span className="text-red-600 text-sm">No report</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {ecg.is_active ? (
                          <span className="flex items-center gap-1 text-green-600 text-sm">
                            <Eye className="h-4 w-4" />
                            Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-gray-500 text-sm">
                            <EyeOff className="h-4 w-4" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <ECGActions ecgId={ecg.id} isActive={ecg.is_active} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No ECG cases yet</p>
              <Link href="/admin/ecgs/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add your first ECG
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
