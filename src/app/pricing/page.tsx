'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Activity, Check, X, Loader2, Sparkles } from 'lucide-react'

function PricingContent() {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const canceled = searchParams.get('canceled')

  async function handleSubscribe(plan: 'premium' | 'ai') {
    setIsLoading(plan)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Erro ao criar sessao de pagamento')
        setIsLoading(null)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Erro ao processar pagamento')
      setIsLoading(null)
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
              <span className="font-bold text-xl text-gray-900">Plantao de ECG</span>
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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
            Comece gratis ou desbloqueie todo o potencial com Premium
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
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
                  <span>Casos avancados</span>
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <X className="h-5 w-5" />
                  <span>Feedback com ECG-IA</span>
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
                Popular
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
                  <span>Casos avancados e raros</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Suporte prioritario</span>
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <X className="h-5 w-5" />
                  <span>Feedback com ECG-IA</span>
                </li>
              </ul>
              <Button
                className="w-full"
                size="lg"
                onClick={() => handleSubscribe('premium')}
                disabled={isLoading !== null}
              >
                {isLoading === 'premium' ? (
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

          {/* Premium +AI Plan */}
          <Card className="border-2 border-purple-500 relative bg-gradient-to-b from-purple-50 to-white">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                +AI
              </span>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                Premium +AI
                <Sparkles className="h-5 w-5 text-purple-500" />
              </CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">R$49,90</span>
                <span className="text-gray-500">/mes</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Tudo do Premium</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-purple-600" />
                  <span className="font-medium text-purple-700">Feedback ilimitado da ECG-IA</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-purple-600" />
                  <span>IA especializada em ECG</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-purple-600" />
                  <span>Explicacoes detalhadas por IA</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-purple-600" />
                  <span>Analise comparativa avancada</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-purple-600" />
                  <span>Sugestoes de estudo personalizadas</span>
                </li>
              </ul>
              <Button
                className="w-full bg-purple-600 hover:bg-purple-700"
                size="lg"
                onClick={() => handleSubscribe('ai')}
                disabled={isLoading !== null}
              >
                {isLoading === 'ai' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Assinar Premium +AI
                  </>
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

        {/* AI Feature Highlight */}
        <div className="mt-16 p-8 bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-purple-200 rounded-full">
                <Sparkles className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Conheca a ECG-IA
            </h2>
            <p className="text-gray-700 mb-6">
              Nossa inteligencia artificial especializada em eletrocardiograma analisa suas respostas
              e fornece feedback personalizado, explicando cada detalhe do ECG e comparando sua
              interpretacao com o laudo oficial. Aprenda mais rapido com explicacoes adaptadas
              ao seu nivel de conhecimento.
            </p>
            <p className="text-sm text-purple-700 font-medium">
              Disponivel exclusivamente no plano Premium +AI
            </p>
          </div>
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
