import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui'
import { Activity, Target, BarChart3, Zap, CheckCircle2, ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Activity className="h-8 w-8 text-blue-600" />
              <span className="font-bold text-xl text-gray-900">ECG Shift</span>
            </div>
            <nav className="flex items-center gap-4">
              <Link
                href="/pricing"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Precos
              </Link>
              {user ? (
                <Link href="/dashboard">
                  <Button>Ir para Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Entrar
                  </Link>
                  <Link href="/register">
                    <Button>Comece Agora</Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Pratique Interpretacao de ECG
            <br />
            <span className="text-blue-600">Como em um Plantao Real de Tele-ECG</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Aprimore suas habilidades de leitura de ECG com casos reais. Receba feedback
            imediato, acompanhe seu progresso e ganhe confianca nas suas interpretacoes.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button size="lg">
                Comece a Praticar Gratis
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">
                Entrar
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Tudo que Voce Precisa para Dominar a Leitura de ECG
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Activity className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Casos Reais de ECG
              </h3>
              <p className="text-gray-600">
                Pratique com imagens reais de ECG cobrindo todas as principais patologias e achados.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Target className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Feedback Instantaneo
              </h3>
              <p className="text-gray-600">
                Compare sua interpretacao com laudos oficiais e veja exatamente onde errou.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-7 w-7 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Acompanhe seu Progresso
              </h3>
              <p className="text-gray-600">
                Monitore sua precisao ao longo do tempo e identifique areas que precisam de mais pratica.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="h-7 w-7 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Zoom e Navegacao
              </h3>
              <p className="text-gray-600">
                Visualizador de ECG em alta resolucao com zoom e navegacao para analise detalhada.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Como Funciona
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Visualize o ECG
              </h3>
              <p className="text-gray-600">
                Cada sessao apresenta uma imagem de ECG em alta qualidade. Use zoom e navegacao para examinar cada detalhe.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Envie seu Laudo
              </h3>
              <p className="text-gray-600">
                Preencha sua interpretacao: ritmo, frequencia, eixo, intervalos e achados. Igual a um laudo real.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aprenda com o Feedback
              </h3>
              <p className="text-gray-600">
                Receba sua nota instantaneamente com comparacao detalhada mostrando exatamente o que acertou e o que revisar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Learn */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            O que Voce Vai Praticar
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              'Ritmos Sinusais e Arritmias',
              'Fibrilacao e Flutter Atrial',
              'Bloqueios AV (1o, 2o, 3o grau)',
              'Bloqueios de Ramo',
              'Reconhecimento de IAMCSST',
              'Desvio de Eixo',
              'Sobrecarga de Camaras',
              'Disturbios Eletroliticos',
              'Efeitos de Medicamentos',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Pronto para Melhorar suas Habilidades em ECG?
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Junte-se a profissionais de saude praticando interpretacao de ECG.
            Comece sua primeira sessao em minutos.
          </p>
          <Link href="/register">
            <Button size="lg" variant="outline" className="bg-white text-blue-600 hover:bg-blue-50 border-white">
              Comece Gratis
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-gray-900">ECG Shift Simulator</span>
            </div>
            <p className="text-gray-500 text-sm">
              Pratique interpretacao de ECG como em um plantao real de tele-ECG.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
