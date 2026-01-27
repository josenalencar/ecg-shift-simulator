'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, CheckCircle, Crown } from 'lucide-react'

export function PaymentSuccessHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const success = searchParams.get('success')

  const [status, setStatus] = useState<'checking' | 'active' | 'waiting'>('checking')
  const [attempts, setAttempts] = useState(0)
  const maxAttempts = 15 // Max 15 attempts = ~30 seconds

  useEffect(() => {
    if (success !== 'true') return

    const supabase = createClient()

    async function checkSubscription() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from('subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .maybeSingle()

      if (data?.status === 'active') {
        setStatus('active')
        // Wait a moment to show success message, then refresh
        setTimeout(() => {
          // Remove success param and refresh
          window.location.href = '/dashboard'
        }, 2000)
      } else {
        setStatus('waiting')
        setAttempts(prev => prev + 1)
      }
    }

    // Initial check
    checkSubscription()

    // Poll every 2 seconds
    const interval = setInterval(() => {
      if (attempts < maxAttempts) {
        checkSubscription()
      } else {
        // Stop polling after max attempts
        clearInterval(interval)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [success, attempts, router])

  if (success !== 'true') return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md mx-4 text-center">
        {status === 'active' ? (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Pagamento Confirmado!
            </h2>
            <p className="text-gray-600 mb-4">
              Sua assinatura Premium esta ativa. Aproveite todos os recursos!
            </p>
            <div className="flex items-center justify-center gap-2 text-purple-600 font-medium">
              <Crown className="h-5 w-5" />
              Premium Ativo
            </div>
          </>
        ) : (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Processando Pagamento...
            </h2>
            <p className="text-gray-600">
              Aguarde enquanto confirmamos seu pagamento. Isso pode levar alguns segundos.
            </p>
            {attempts > 5 && (
              <p className="text-sm text-gray-500 mt-4">
                Ainda processando... Por favor, aguarde.
              </p>
            )}
            {attempts >= maxAttempts && (
              <div className="mt-4">
                <p className="text-sm text-orange-600 mb-2">
                  O processamento esta demorando mais que o esperado.
                </p>
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="text-blue-600 underline text-sm"
                >
                  Atualizar pagina
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
