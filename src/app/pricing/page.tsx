'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { Check, X, Loader2, Sparkles, ArrowRight, Crown, Zap, Shield, ChevronDown, Mail, Instagram, Linkedin, Twitter, Send, CheckCircle2 } from 'lucide-react'

// Contact Modal Component
function ContactModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSending(false)
    setSent(true)
    setTimeout(() => {
      onClose()
      setSent(false)
      setFormData({ name: '', email: '', message: '' })
    }, 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scaleIn overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>

        <div className="p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Fale Conosco</h3>
          <p className="text-gray-600 mb-6">Envie sua mensagem e responderemos em breve.</p>

          {sent ? (
            <div className="text-center py-8 animate-fadeIn">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-lg font-medium text-gray-900">Mensagem enviada!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Seu nome"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="seu@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                  placeholder="Como podemos ajudar?"
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {sending ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Enviar Mensagem
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

// Scroll Reveal Component
function ScrollReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [delay])

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-8'
      }`}
    >
      {children}
    </div>
  )
}

function PricingContent() {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const searchParams = useSearchParams()
  const canceled = searchParams.get('canceled')

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  async function handleSubscribe(plan: 'premium' | 'ai') {
    setIsLoading(plan)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, billingCycle }),
      })
      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Erro ao criar sessão de pagamento')
        setIsLoading(null)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Erro ao processar pagamento')
      setIsLoading(null)
    }
  }

  const plans: {
    name: string
    description: string
    price: { monthly: number; yearly: number }
    icon: typeof Zap
    color: string
    popular: boolean
    features: { text: string; included: boolean; highlight?: boolean }[]
    cta: string
    ctaLink?: string
    onClick?: () => void
  }[] = [
    {
      name: 'Gratuito',
      description: 'Para quem está começando',
      price: { monthly: 0, yearly: 0 },
      icon: Zap,
      color: 'gray',
      popular: false,
      features: [
        { text: '5 casos de ECG por mês', included: true },
        { text: 'Feedback básico', included: true },
        { text: 'Acompanhamento de progresso', included: true },
        { text: 'Casos ilimitados', included: false },
        { text: 'Casos avançados e raros', included: false },
        { text: 'Feedback com ECG-IA', included: false },
      ],
      cta: 'Começar Grátis',
      ctaLink: '/register'
    },
    {
      name: 'Premium',
      description: 'Para quem quer evoluir rápido',
      price: { monthly: 39.90, yearly: 31.92 },
      icon: Crown,
      color: 'blue',
      popular: true,
      features: [
        { text: 'Casos ilimitados', included: true, highlight: true },
        { text: 'Feedback completo e detalhado', included: true },
        { text: 'Acompanhamento de progresso', included: true },
        { text: 'Casos avançados e raros', included: true },
        { text: 'Personalização por tipo de hospital', included: true },
        { text: 'Feedback com ECG-IA', included: false },
      ],
      cta: 'Assinar Premium',
      onClick: () => handleSubscribe('premium')
    },
    {
      name: 'Premium +AI',
      description: 'Experiência completa com IA',
      price: { monthly: 69.90, yearly: 55.92 },
      icon: Sparkles,
      color: 'purple',
      popular: false,
      features: [
        { text: 'Tudo do Premium', included: true, highlight: true },
        { text: 'Feedback ilimitado da ECG-IA', included: true, highlight: true },
        { text: 'IA especializada em ECG', included: true },
        { text: 'Explicações detalhadas por IA', included: true },
        { text: 'Análise comparativa avançada', included: true },
        { text: 'Sugestões de estudo personalizadas', included: true },
      ],
      cta: 'Assinar Premium +AI',
      onClick: () => handleSubscribe('ai')
    }
  ]

  const faqs = [
    {
      question: 'Como funciona o período gratuito?',
      answer: 'Você pode usar o plano gratuito por tempo indeterminado, com acesso a 5 casos de ECG por mês. Não precisa de cartão de crédito para começar.'
    },
    {
      question: 'Posso cancelar a qualquer momento?',
      answer: 'Sim! Você pode cancelar sua assinatura a qualquer momento. Você continuará tendo acesso até o fim do período pago.'
    },
    {
      question: 'O que é a ECG-IA?',
      answer: 'A ECG-IA é nossa inteligência artificial especializada em eletrocardiograma. Ela analisa suas respostas e fornece feedback personalizado, explicando cada detalhe do ECG.'
    },
    {
      question: 'Os ECGs são de pacientes reais?',
      answer: 'Sim, todos os ECGs são de casos reais, cuidadosamente selecionados e anonimizados. Os laudos são revisados por especialistas.'
    },
    {
      question: 'Tem desconto para estudantes?',
      answer: 'Entre em contato conosco informando sua situação acadêmica. Oferecemos condições especiais para estudantes de medicina.'
    }
  ]

  return (
    <div className="min-h-screen bg-[#FAFBFC] overflow-x-hidden">
      {/* Custom Styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.6s ease-out; }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 8s ease infinite;
        }
        .gradient-text {
          background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #EC4899 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* Header/Navigation */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/90 backdrop-blur-lg shadow-sm py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo-nobg.png"
                alt="Plantão ECG"
                width={160}
                height={40}
                className="h-10 w-auto"
              />
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link href="/#como-funciona" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Como funciona
              </Link>
              <Link href="/#recursos" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Recursos
              </Link>
              <Link href="/pricing" className="text-blue-600 font-medium">
                Preços
              </Link>
              <button
                onClick={() => setContactOpen(true)}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Contato
              </button>
            </nav>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden sm:block px-4 py-2 text-gray-700 font-medium hover:text-gray-900 transition-colors"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="px-5 py-2.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-all hover:shadow-lg"
              >
                Começar Grátis
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-24 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow" />
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center">
          {canceled && (
            <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 max-w-md mx-auto animate-slideUp">
              Pagamento cancelado. Você pode tentar novamente quando quiser.
            </div>
          )}

          <div className="animate-slideUp">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full text-sm font-medium text-blue-700 mb-6">
              <Shield className="h-4 w-4" />
              Garantia de 7 dias
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 animate-slideUp" style={{ animationDelay: '0.1s' }}>
            Escolha o plano ideal{' '}
            <span className="gradient-text">para você</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto animate-slideUp" style={{ animationDelay: '0.2s' }}>
            Comece grátis e evolua quando estiver pronto. Cancele a qualquer momento.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12 animate-slideUp" style={{ animationDelay: '0.3s' }}>
            <span className={`font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
              Mensal
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="relative w-14 h-8 bg-gray-200 rounded-full transition-colors hover:bg-gray-300"
            >
              <div
                className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                  billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`font-medium ${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
              Anual
            </span>
            {billingCycle === 'yearly' && (
              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                Economize 20%
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <ScrollReveal key={plan.name} delay={index * 100}>
                <div
                  className={`relative rounded-3xl p-1 h-full ${
                    plan.popular
                      ? 'bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500'
                      : plan.color === 'purple'
                      ? 'bg-gradient-to-b from-purple-400 to-purple-600'
                      : 'bg-gray-200'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                      <span className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-full shadow-lg">
                        Mais Popular
                      </span>
                    </div>
                  )}

                  <div className={`h-full bg-white rounded-[22px] p-8 flex flex-col ${plan.color === 'purple' ? 'bg-gradient-to-b from-purple-50 to-white' : ''}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        plan.color === 'blue' ? 'bg-blue-100' :
                        plan.color === 'purple' ? 'bg-purple-100' : 'bg-gray-100'
                      }`}>
                        <plan.icon className={`h-6 w-6 ${
                          plan.color === 'blue' ? 'text-blue-600' :
                          plan.color === 'purple' ? 'text-purple-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                        <p className="text-sm text-gray-500">{plan.description}</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-gray-900">
                          R${plan.price[billingCycle].toFixed(2).replace('.', ',')}
                        </span>
                        {plan.price[billingCycle] > 0 && (
                          <span className="text-gray-500">/mês</span>
                        )}
                      </div>
                      {billingCycle === 'yearly' && plan.price.yearly > 0 && (
                        <p className="text-sm text-gray-500 mt-1">
                          Cobrado R${(plan.price.yearly * 12).toFixed(2).replace('.', ',')} por ano
                        </p>
                      )}
                    </div>

                    <ul className="space-y-4 mb-8 flex-grow">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          {feature.included ? (
                            <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                              feature.highlight
                                ? plan.color === 'purple' ? 'bg-purple-100' : 'bg-blue-100'
                                : 'bg-green-100'
                            }`}>
                              <Check className={`h-3 w-3 ${
                                feature.highlight
                                  ? plan.color === 'purple' ? 'text-purple-600' : 'text-blue-600'
                                  : 'text-green-600'
                              }`} />
                            </div>
                          ) : (
                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                              <X className="h-3 w-3 text-gray-400" />
                            </div>
                          )}
                          <span className={`text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'} ${feature.highlight ? 'font-medium' : ''}`}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {plan.ctaLink ? (
                      <Link
                        href={plan.ctaLink}
                        className={`w-full py-3.5 px-6 rounded-xl font-semibold text-center transition-all flex items-center justify-center gap-2 ${
                          plan.popular
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/25'
                            : plan.color === 'purple'
                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {plan.cta}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    ) : (
                      <button
                        onClick={plan.onClick}
                        disabled={isLoading !== null}
                        className={`w-full py-3.5 px-6 rounded-xl font-semibold text-center transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                          plan.popular
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/25'
                            : plan.color === 'purple'
                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {isLoading === (plan.name === 'Premium' ? 'premium' : 'ai') ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <>
                            {plan.color === 'purple' && <Sparkles className="h-4 w-4" />}
                            {plan.cta}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* AI Feature Section */}
      <section className="py-24 bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <ScrollReveal>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-sm font-medium text-purple-300 mb-6">
                  <Sparkles className="h-4 w-4" />
                  Exclusivo Premium +AI
                </span>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Conheça a ECG-IA
                </h2>
                <p className="text-lg text-gray-300 mb-8">
                  Nossa inteligência artificial especializada em eletrocardiograma analisa suas
                  respostas e fornece feedback personalizado, explicando cada detalhe do ECG
                  e comparando sua interpretação com o laudo oficial.
                </p>
                <ul className="space-y-4">
                  {[
                    'Explicações adaptadas ao seu nível',
                    'Identifica padrões de erro',
                    'Sugere materiais de estudo',
                    'Disponível 24/7'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center">
                        <Check className="h-4 w-4 text-purple-400" />
                      </div>
                      <span className="text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-20" />
                <div className="relative bg-white/5 backdrop-blur rounded-3xl p-8 border border-white/10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="font-semibold">ECG-IA</p>
                      <p className="text-sm text-gray-400">Assistente inteligente</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-sm text-gray-400 mb-2">Sua resposta:</p>
                      <p className="text-sm">&quot;Ritmo sinusal com BAV 1º grau&quot;</p>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                      <p className="text-sm text-purple-300 mb-2">Feedback da ECG-IA:</p>
                      <p className="text-sm text-gray-300">
                        &quot;Excelente! Você identificou corretamente o BAV 1º grau. O intervalo PR
                        de 220ms confirma o diagnóstico. Note também a morfologia do QRS...&quot;
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium mb-4">
                FAQ
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Perguntas frequentes
              </h2>
              <p className="text-lg text-gray-600">
                Ainda tem dúvidas? Entre em contato conosco.
              </p>
            </div>
          </ScrollReveal>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <ScrollReveal key={index} delay={index * 50}>
                <details className="group bg-gray-50 rounded-2xl">
                  <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                    <span className="font-semibold text-gray-900">{faq.question}</span>
                    <ChevronDown className="h-5 w-5 text-gray-500 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="px-6 pb-6 text-gray-600">
                    {faq.answer}
                  </div>
                </details>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={300}>
            <div className="mt-12 text-center">
              <p className="text-gray-600 mb-4">Não encontrou sua resposta?</p>
              <button
                onClick={() => setContactOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-all"
              >
                <Mail className="h-5 w-5" />
                Fale Conosco
              </button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[#FAFBFC]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <ScrollReveal>
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 md:p-16 text-white text-center animate-gradient">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
              <div className="relative">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                  Pronto para começar?
                </h2>
                <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-8">
                  Comece gratuitamente hoje e dê o próximo passo na sua formação em ECG.
                </p>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl hover:shadow-xl transition-all"
                >
                  Começar Gratuitamente
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center mb-4">
                <Image
                  src="/logo-nobg.png"
                  alt="Plantão ECG"
                  width={140}
                  height={35}
                  className="h-8 w-auto brightness-0 invert"
                />
              </Link>
              <p className="text-gray-400 text-sm mb-4">
                Simulador de plantão de tele-ECG com feedback de especialistas.
              </p>
              <div className="flex gap-3">
                <a href="#" className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                  <Instagram className="h-5 w-5 text-gray-400" />
                </a>
                <a href="#" className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                  <Twitter className="h-5 w-5 text-gray-400" />
                </a>
                <a href="#" className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                  <Linkedin className="h-5 w-5 text-gray-400" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Plataforma</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/" className="hover:text-white transition-colors">Como funciona</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Recursos</a></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Preços</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Recursos</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="https://substack.com/@mbedescomplicada" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="https://www.manole.com.br/curso-de-eletrocardiograma-com-jose-alencar-2-edicao/p?utm_source=site_jose_alencar&utm_medium=referral&utm_campaign=curso_ecg&utm_content=banner_home" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Curso de ECG com José Alencar</a></li>
                <li><a href="https://concelhojedi.netlify.app/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Comunidade</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <button onClick={() => setContactOpen(true)} className="hover:text-white transition-colors flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Fale conosco
                  </button>
                </li>
                <li>
                  <button onClick={() => setContactOpen(true)} className="hover:text-white transition-colors">
                    Suporte
                  </button>
                </li>
                <li>
                  <button onClick={() => setContactOpen(true)} className="hover:text-white transition-colors">
                    Parcerias
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-500 text-center md:text-left">
              <p>© 2026 Plantão de ECG. Todos os direitos reservados.</p>
              <p className="text-xs mt-1">JOSÉ NUNES DE ALENCAR NETO SERVIÇOS MÉDICOS LTDA - CNPJ: 39.815.339/0001-81</p>
            </div>
            <div className="flex gap-6 text-sm text-gray-500">
              <Link href="/termos" className="hover:text-white transition-colors">Termos de uso</Link>
              <Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Contact Modal */}
      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
    </div>
  )
}

export default function PricingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#FAFBFC]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    }>
      <PricingContent />
    </Suspense>
  )
}
