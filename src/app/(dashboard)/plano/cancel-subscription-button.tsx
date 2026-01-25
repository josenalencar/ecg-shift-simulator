'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui'
import { Loader2, XCircle } from 'lucide-react'

export function CancelSubscriptionButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()

  async function handleCancel() {
    setIsLoading(true)
    try {
      const response = await fetch('/api/stripe/cancel', {
        method: 'POST',
      })
      const data = await response.json()

      if (data.success) {
        router.refresh()
      } else {
        alert(data.error || 'Erro ao cancelar assinatura')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Erro ao processar solicitacao')
    } finally {
      setIsLoading(false)
      setShowConfirm(false)
    }
  }

  if (showConfirm) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800 font-medium mb-2">Confirmar cancelamento?</p>
        <p className="text-sm text-red-600 mb-4">
          Voce mantera acesso ate o fim do periodo atual. Esta acao pode ser revertida antes do fim do periodo.
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowConfirm(false)}
            disabled={isLoading}
          >
            Voltar
          </Button>
          <Button
            onClick={handleCancel}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Cancelando...
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                Confirmar Cancelamento
              </>
            )}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Button
      variant="outline"
      onClick={() => setShowConfirm(true)}
      className="text-red-600 border-red-200 hover:bg-red-50"
    >
      <XCircle className="h-4 w-4 mr-2" />
      Cancelar Assinatura
    </Button>
  )
}
