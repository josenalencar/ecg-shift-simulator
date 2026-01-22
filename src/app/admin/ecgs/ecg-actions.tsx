'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui'
import { Edit, Eye, EyeOff, Trash2 } from 'lucide-react'

interface ECGActionsProps {
  ecgId: string
  isActive: boolean
}

export function ECGActions({ ecgId, isActive }: ECGActionsProps) {
  const router = useRouter()
  const supabase = createClient()

  async function toggleActive() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('ecgs') as any)
      .update({ is_active: !isActive })
      .eq('id', ecgId)

    if (!error) {
      router.refresh()
    }
  }

  async function deleteECG() {
    if (!confirm('Are you sure you want to delete this ECG? This action cannot be undone.')) {
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('ecgs') as any)
      .delete()
      .eq('id', ecgId)

    if (!error) {
      router.refresh()
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Link href={`/admin/ecgs/${ecgId}`}>
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </Link>
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleActive}
        title={isActive ? 'Deactivate' : 'Activate'}
      >
        {isActive ? (
          <EyeOff className="h-4 w-4 text-gray-500" />
        ) : (
          <Eye className="h-4 w-4 text-green-500" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={deleteECG}
        title="Delete"
      >
        <Trash2 className="h-4 w-4 text-red-500" />
      </Button>
    </div>
  )
}
