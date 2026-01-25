'use client'

import { useState } from 'react'
import { Button } from '@/components/ui'
import { CreditCard, Loader2 } from 'lucide-react'

export function ManageSubscriptionButton() {
  const [isLoading, setIsLoading] = useState(false)

  async function handleManageSubscription() {
    setIsLoading(true)
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      })
      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Erro ao abrir portal de pagamento')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Erro ao processar solicitacao')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button variant="outline" onClick={handleManageSubscription} disabled={isLoading}>
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <CreditCard className="h-4 w-4 mr-2" />
      )}
      Gerenciar Pagamento
    </Button>
  )
}
