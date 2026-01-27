'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, CheckCircle, Crown } from 'lucide-react'

export function PaymentSuccessHandler() {
  const searchParams = useSearchParams()
  const success = searchParams.get('success')

  const [status, setStatus] = useState<'checking' | 'active' | 'waiting'>('checking')
  const [attemptCount, setAttemptCount] = useState(0)
  const maxAttempts = 15 // Max 15 attempts = ~30 seconds
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const hasFoundActiveRef = useRef(false)

  const checkSubscription = useCallback(async () => {
    if (hasFoundActiveRef.current) return

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    console.log('[PaymentSuccess] Checking subscription for user:', user.id)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('subscriptions')
      .select('status, plan')
      .eq('user_id', user.id)
      .maybeSingle()

    console.log('[PaymentSuccess] Subscription data:', data, 'error:', error)

    if (data?.status === 'active') {
      hasFoundActiveRef.current = true
      setStatus('active')
      // Clear interval immediately
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      // Wait a moment to show success message, then refresh
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 2000)
    } else {
      setStatus('waiting')
      setAttemptCount(prev => {
        const newCount = prev + 1
        if (newCount >= maxAttempts && intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        return newCount
      })
    }
  }, [])

  useEffect(() => {
    if (success !== 'true') return

    // Initial check
    checkSubscription()

    // Start polling
    intervalRef.current = setInterval(checkSubscription, 2000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [success, checkSubscription])

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
            {attemptCount > 5 && attemptCount < maxAttempts && (
              <p className="text-sm text-gray-500 mt-4">
                Ainda processando... Por favor, aguarde.
              </p>
            )}
            {attemptCount >= maxAttempts && (
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
