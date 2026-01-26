import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui'
import { Activity, Target, BarChart3, Zap, CheckCircle2, ArrowRight, Award, BookOpen, Users, Quote } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get ECG count for dynamic counter
  const { count: ecgCount } = await supabase
    .from('ecgs')
    .select('*', { count: 'exact', head: true })

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Activity className="h-8 w-8 text-blue-600" />
              <span className="font-bold text-xl text-gray-900">Plantao de ECG</span>
            </div>
            <nav className="flex items-center gap-4">
              <Link
                href="/pricing"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Preços
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
          <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
            Simulador de Plantao de Tele-ECG
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Pratique ECG com Feedback
            <br />
            <span className="text-blue-600">dos Maiores Especialistas do Mundo</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
            Simule um plantao real de tele-ECG e receba feedback imediato baseado em laudos
            de especialistas. A pratica que voce sempre quis, agora com o retorno que faltava.
          </p>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
            Porque pratica sem feedback nao leva a excelencia.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button size="lg">
                Comece seu Plantao Simulado
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">
                Entrar
              </Button>
            </Link>
          </div>

          {/* Stats Counter */}
          <div className="mt-12 flex flex-wrap justify-center gap-8 md:gap-16">
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-600">{ecgCount || 0}+</p>
              <p className="text-gray-600">ECGs para treinar</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-600">100%</p>
              <p className="text-gray-600">Com feedback especializado</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-600">24/7</p>
              <p className="text-gray-600">Disponivel sempre</p>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4 mb-6">
            <Quote className="h-12 w-12 text-blue-400 flex-shrink-0" />
            <blockquote className="text-xl md:text-2xl font-medium italic">
              &ldquo;A pratica de 10.000 horas so leva a excelencia quando acompanhada de feedback imediato e de qualidade.&rdquo;
            </blockquote>
          </div>
          <p className="text-gray-400 text-right">— Baseado em &ldquo;Outliers&rdquo; de Malcolm Gladwell</p>

          <div className="mt-12 p-6 bg-gray-800 rounded-xl">
            <h3 className="text-xl font-semibold mb-4 text-blue-400">O problema que resolvemos:</h3>
            <p className="text-gray-300 leading-relaxed">
              Estudantes e medicos que querem aprender ECG enfrentam um dilema: como praticar
              interpretacao sem ter acesso a casos reais com feedback de especialistas? Livros ensinam
              teoria, mas a pratica fica limitada. Ate agora. O <strong>Plantao de ECG</strong> simula
              um plantao real de tele-ECG onde voce interpreta, envia seu laudo e recebe feedback
              instantaneo baseado na avaliacao de especialistas.
            </p>
          </div>
        </div>
      </section>

      {/* Authority Section - Dr. José Alencar */}
      <section className="py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Feedback Baseado em Especialistas
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Quem garante que o feedback esta correto? Os gabaritos sao baseados em laudos de referencia.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center flex-shrink-0">
                <Award className="h-16 w-16 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Dr. Jose Alencar</h3>
                <p className="text-blue-600 font-medium mb-4">Cardiologista e Eletrofisiologista</p>
                <div className="space-y-2 text-gray-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>Pesquisador em Eletrocardiografia</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>Fellow da International Society for Holter and Noninvasive Electrocardiology (FISHNE)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>Fellow da Sociedade Europeia de Cardiologia (FESC)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>Autor do Tratado de ECG</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-100">
              <p className="text-gray-700 text-center italic">
                &ldquo;Cada ECG nesta plataforma foi cuidadosamente selecionado e laudado para
                garantir que voce receba feedback preciso e educativo.&rdquo;
              </p>
            </div>
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
                Plantao Simulado
              </h3>
              <p className="text-gray-600">
                Simule um plantao real de tele-ECG com casos variados e cronometro opcional.
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
                Compare sua interpretacao com o laudo de especialistas e veja exatamente onde errou.
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
            Como Funciona o Plantao Simulado
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Receba o ECG
              </h3>
              <p className="text-gray-600">
                Como em um plantao real, voce recebe um ECG com dados clinicos do paciente: idade, sexo e queixa principal.
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
                Receba o Feedback
              </h3>
              <p className="text-gray-600">
                Compare seu laudo com o do especialista. Veja sua nota e entenda exatamente o que acertou e o que revisar.
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
              'Reconhecimento avancado de infartos oclusivos',
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

      {/* Social Proof */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Para Estudantes</h3>
              <p className="text-gray-600">
                Pratique desde o inicio da faculdade com casos reais e feedback de especialistas.
              </p>
            </div>
            <div>
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Para Residentes</h3>
              <p className="text-gray-600">
                Aprimore suas habilidades para o plantao real com pratica intensiva e direcionada.
              </p>
            </div>
            <div>
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Para Medicos</h3>
              <p className="text-gray-600">
                Mantenha suas habilidades afiadas e revise casos desafiadores no seu ritmo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Comece seu Plantao Simulado Agora
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Pratique ECG com feedback de especialistas. A experiencia que faltava
            para voce ganhar confianca na interpretacao de eletrocardiogramas.
          </p>
          <Link href="/register">
            <Button size="lg" variant="outline" className="bg-white text-blue-600 hover:bg-blue-50 border-white">
              Comecar Gratuitamente
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
          <p className="text-blue-200 text-sm mt-4">
            5 ECGs gratuitos por mes. Sem compromisso.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-gray-900">Plantao de ECG</span>
            </div>
            <p className="text-gray-500 text-sm">
              Simulador de plantao de tele-ECG com feedback de especialistas.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
