'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui'
import { Sparkles, Loader2 } from 'lucide-react'

interface UpgradePreview {
  canUpgrade: boolean
  reason?: string
  proratedAmount?: number
  message?: string
}

export function UpgradeButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [preview, setPreview] = useState<UpgradePreview | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch upgrade preview on mount
  useEffect(() => {
    async function fetchPreview() {
      try {
        const response = await fetch('/api/stripe/upgrade')
        const data = await response.json()
        setPreview(data)
      } catch {
        // Silently fail - preview is optional
      }
    }
    fetchPreview()
  }, [])

  const handleUpgrade = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/stripe/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Erro ao processar upgrade')
        return
      }

      // Success - reload the page to show updated plan
      window.location.reload()
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <Button
        onClick={handleUpgrade}
        disabled={isLoading}
        className="bg-purple-600 hover:bg-purple-700"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4 mr-2" />
        )}
        {isLoading ? 'Processando...' : 'Fazer Upgrade'}
      </Button>

      {preview?.proratedAmount !== undefined && (
        <p className="mt-2 text-xs text-purple-600">
          Valor proporcional: R$ {preview.proratedAmount.toFixed(2)}
        </p>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
