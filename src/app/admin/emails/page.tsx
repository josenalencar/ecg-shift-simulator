'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { EmailDashboard } from './email-dashboard'
import { Loader2, Lock } from 'lucide-react'

export default function AdminEmailsPage() {
  const [isMasterAdmin, setIsMasterAdmin] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function checkAccess() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_master_admin')
        .eq('id', user.id)
        .single() as { data: { is_master_admin: boolean | null } | null }

      setIsMasterAdmin(profile?.is_master_admin || false)
      setIsLoading(false)
    }

    checkAccess()
  }, [supabase, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!isMasterAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Lock className="h-8 w-8 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Acesso Restrito
        </h2>
        <p className="text-gray-600 max-w-md">
          Esta pagina e exclusiva para Master Admins. Entre em contato com o administrador
          do sistema se voce precisa de acesso.
        </p>
      </div>
    )
  }

  return <EmailDashboard />
}
