'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Activity, Check, X, Loader2 } from 'lucide-react'

function PricingContent() {
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  const canceled = searchParams.get('canceled')

  async function handleSubscribe() {
    setIsLoading(true)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
      })
      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Erro ao criar sessao de pagamento')
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Erro ao processar pagamento')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Activity className="h-8 w-8 text-blue-600" />
              <span className="font-bold text-xl text-gray-900">ECG Shift</span>
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium">
                Entrar
              </Link>
              <Link href="/register">
                <Button variant="outline">Criar Conta</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {canceled && (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
            <p className="text-yellow-800">Pagamento cancelado. Voce pode tentar novamente quando quiser.</p>
          </div>
        )}

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Escolha seu Plano
          </h1>
          <p className="text-xl text-gray-600">
            Comece gratis ou desbloqueie todo o potencial com o Premium
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <Card className="border-2 border-gray-200">
            <CardHeader>
              <CardTitle className="text-2xl">Gratuito</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">R$0</span>
                <span className="text-gray-500">/mes</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>5 casos de ECG por mes</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Feedback basico</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Acompanhamento de progresso</span>
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <X className="h-5 w-5" />
                  <span>Casos ilimitados</span>
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <X className="h-5 w-5" />
                  <span>Explicacoes detalhadas</span>
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <X className="h-5 w-5" />
                  <span>Casos avancados</span>
                </li>
              </ul>
              <Link href="/register">
                <Button variant="outline" className="w-full" size="lg">
                  Comecar Gratis
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="border-2 border-blue-500 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                Recomendado
              </span>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">Premium</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">R$29,90</span>
                <span className="text-gray-500">/mes</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Casos ilimitados</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Feedback completo e detalhado</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Acompanhamento de progresso</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Explicacoes detalhadas</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Casos avancados e raros</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Suporte prioritario</span>
                </li>
              </ul>
              <Button
                className="w-full"
                size="lg"
                onClick={handleSubscribe}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  'Assinar Premium'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            Cancele a qualquer momento. Sem compromisso.
          </p>
        </div>
      </main>
    </div>
  )
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
      <PricingContent />
    </Suspense>
  )
}
