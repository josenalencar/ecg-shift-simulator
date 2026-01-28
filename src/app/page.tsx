'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Activity, ArrowRight, CheckCircle2, Play, X, Send, ChevronDown, ChevronUp, Heart, Users, Zap, Target, BarChart3, Mail, Instagram, Linkedin, Twitter, Building2, Briefcase, Hospital, FileDown, BookOpen, Baby, HeartPulse } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// Contact Modal Component
function ContactModal({ isOpen, onClose, type = 'contact' }: { isOpen: boolean; onClose: () => void; type?: 'contact' | 'parceria' | 'suporte' }) {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const modalConfig = {
    contact: {
      title: 'Fale Conosco',
      subtitle: 'Envie sua mensagem e responderemos em breve.',
      placeholder: 'Como podemos ajudar?'
    },
    parceria: {
      title: 'Parcerias',
      subtitle: 'Interessado em parceria? Conte-nos sobre sua proposta.',
      placeholder: 'Descreva sua proposta de parceria...'
    },
    suporte: {
      title: 'Suporte',
      subtitle: 'Precisa de ajuda? Descreva seu problema.',
      placeholder: 'Descreva o problema que está enfrentando...'
    }
  }

  const { title, subtitle, placeholder } = modalConfig[type]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setError('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, type }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar mensagem')
      }

      setSent(true)
      setTimeout(() => {
        onClose()
        setSent(false)
        setFormData({ name: '', email: '', message: '' })
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar mensagem')
    } finally {
      setSending(false)
    }
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
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 mb-6">{subtitle}</p>

          {sent ? (
            <div className="text-center py-8 animate-fadeIn">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-lg font-medium text-gray-900">Mensagem enviada!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder:text-gray-400"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder:text-gray-400"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-gray-900 placeholder:text-gray-400"
                  placeholder={placeholder}
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

export default function HomePage() {
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)
  const [contactType, setContactType] = useState<'contact' | 'parceria' | 'suporte'>('contact')
  const [videoPlaying, setVideoPlaying] = useState(false)

  // Handle auth redirects from Supabase (password recovery, magic links)
  useEffect(() => {
    const handleAuthRedirect = async () => {
      // Check if there's an auth hash in the URL (Supabase implicit flow)
      const hash = window.location.hash
      if (hash && hash.includes('type=recovery')) {
        // User clicked a password recovery link
        // Supabase will handle setting up the session from the hash
        const supabase = createClient()

        // Wait for Supabase to process the hash
        const { data: { session } } = await supabase.auth.getSession()

        if (session) {
          // Redirect to reset password page
          router.replace('/reset-password')
        }
      }
    }

    handleAuthRedirect()
  }, [router])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.6s ease-out; }
        .animate-slideInLeft { animation: slideInLeft 0.6s ease-out; }
        .animate-slideInRight { animation: slideInRight 0.6s ease-out; }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
        .animate-float { animation: float 3s ease-in-out infinite; }
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
                priority
              />
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <a href="#como-funciona" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Como funciona
              </a>
              <a href="#recursos" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Recursos
              </a>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Preços
              </Link>
              <button
                onClick={() => { setContactType('contact'); setContactOpen(true); }}
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
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow" />
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="animate-slideUp">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full text-sm font-medium text-blue-700 mb-6">
                  <Heart className="h-4 w-4" />
                  Simulador de Tele-ECG
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 animate-slideUp" style={{ animationDelay: '0.1s' }}>
                Domine ECG com{' '}
                <span className="gradient-text">feedback de especialistas</span>
              </h1>

              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0 animate-slideUp" style={{ animationDelay: '0.2s' }}>
                Pratique interpretação de eletrocardiogramas em um ambiente que simula um plantão real.
                Receba feedback imediato baseado em laudos de especialistas.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-slideUp" style={{ animationDelay: '0.3s' }}>
                <Link
                  href="/register"
                  className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                >
                  Começar Plantão Simulado
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button
                  onClick={() => setVideoPlaying(true)}
                  className="group px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                >
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <Play className="h-4 w-4 text-gray-600 group-hover:text-blue-600 ml-0.5" />
                  </div>
                  Ver Demo
                </button>
              </div>
            </div>

            {/* Right Content - Hero Image/Animation */}
            <div className="relative animate-slideInRight">
              <div className="relative bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-1 shadow-2xl shadow-blue-500/20">
                <div className="bg-white rounded-[22px] p-6 lg:p-8">
                  {/* Mock ECG Interface */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Activity className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Caso #127</p>
                          <p className="text-sm text-gray-500">M, 62 anos - Dor torácica</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full">
                        Em análise
                      </span>
                    </div>

                    {/* ECG Wave Animation */}
                    <div className="h-40 bg-gray-50 rounded-xl overflow-hidden relative">
                      <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                        <path
                          d="M0,50 L30,50 L35,50 L40,20 L45,80 L50,50 L80,50 L85,45 L90,55 L95,50 L130,50 L135,50 L140,15 L145,85 L150,50 L180,50 L185,45 L190,55 L195,50 L230,50 L235,50 L240,20 L245,80 L250,50 L280,50 L285,45 L290,55 L295,50 L330,50 L335,50 L340,15 L345,85 L350,50 L380,50 L385,45 L390,55 L395,50 L400,50"
                          fill="none"
                          stroke="#3B82F6"
                          strokeWidth="2"
                          className="animate-pulse-slow"
                        />
                      </svg>
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-50 via-transparent to-gray-50" />
                    </div>

                    {/* Diagnosis tags */}
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg">Ritmo sinusal</span>
                      <span className="px-3 py-1.5 bg-purple-50 text-purple-700 text-sm font-medium rounded-lg">BRD</span>
                      <span className="px-3 py-1.5 bg-green-50 text-green-700 text-sm font-medium rounded-lg">Eixo normal</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-lg p-4 animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Correto!</p>
                    <p className="text-xs text-gray-500">+10 pontos</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg p-4 animate-float" style={{ animationDelay: '1.5s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Taxa de acerto</p>
                    <p className="text-xs text-gray-500">Acompanhe sua evolução</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-6 w-6 text-gray-400" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl md:text-5xl font-bold gradient-text">Milhares</p>
              <p className="text-gray-600 mt-2">de ECGs para praticar</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold gradient-text">100%</p>
              <p className="text-gray-600 mt-2">Com feedback especializado</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold gradient-text">24/7</p>
              <p className="text-gray-600 mt-2">Disponível sempre</p>
            </div>
          </div>
        </div>
      </section>

      {/* Personalization Section - Hospital Type Feature */}
      <section className="py-24 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">
                <Building2 className="h-4 w-4" />
                Exclusivo Premium
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                ECGs personalizados para o seu dia a dia
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Selecione seu local de trabalho e o sistema prioriza automaticamente os ECGs mais relevantes para sua prática clínica.
              </p>
            </div>
          </ScrollReveal>

          {/* Adult Hospitals */}
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {[
              {
                icon: Hospital,
                title: 'Pronto Socorro',
                description: 'Prioriza casos de isquemia, arritmias e emergências cardiológicas que você encontra no PS.',
                tags: ['Infarto', 'Arritmias', 'Emergências'],
                color: 'red'
              },
              {
                icon: Building2,
                title: 'Hospital Geral',
                description: 'Foco em ECGs normais, distúrbios de condução e achados comuns em enfermarias.',
                tags: ['Normal', 'Condução', 'Rotina'],
                color: 'blue'
              },
              {
                icon: Briefcase,
                title: 'Hospital Cardiológico',
                description: 'Casos difíceis e raros para quem quer dominar a eletrocardiografia avançada.',
                tags: ['Difícil', 'Raro', 'Avançado'],
                color: 'purple'
              }
            ].map((item, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <div className="relative group h-full">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity" />
                  <div className="relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all border border-gray-100 h-full flex flex-col">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
                      item.color === 'red' ? 'bg-red-100' :
                      item.color === 'blue' ? 'bg-blue-100' : 'bg-purple-100'
                    }`}>
                      <item.icon className={`h-7 w-7 ${
                        item.color === 'red' ? 'text-red-600' :
                        item.color === 'blue' ? 'text-blue-600' : 'text-purple-600'
                      }`} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed mb-4 flex-grow">{item.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag, i) => (
                        <span key={i} className={`px-3 py-1 text-xs font-medium rounded-full ${
                          item.color === 'red' ? 'bg-red-50 text-red-700' :
                          item.color === 'blue' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                        }`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Pediatric ECG Highlight */}
          <ScrollReveal delay={350}>
            <div className="p-8 bg-gradient-to-r from-green-50 via-teal-50 to-cyan-50 rounded-3xl border-2 border-green-200 mb-8">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-green-100 rounded-2xl">
                    <Baby className="h-10 w-10 text-green-600" />
                  </div>
                  <div>
                    <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full uppercase tracking-wide">Novo</span>
                    <h3 className="text-2xl font-bold text-gray-900 mt-2">ECGs Pediátricos</h3>
                  </div>
                </div>
                <div className="flex-grow">
                  <p className="text-gray-600 text-lg">
                    Agora com casos exclusivos de pediatria! Aprenda a interpretar ECGs em crianças,
                    com suas particularidades de frequência, eixo e variantes normais da idade.
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Pediatric Hospitals */}
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Baby,
                title: 'Hospital Pediátrico Geral',
                description: 'ECGs pediátricos com frequências e eixos próprios da infância. Aprenda as particularidades do coração em desenvolvimento.',
                tags: ['Pediátrico', 'Normal', 'Rotina'],
                color: 'green'
              },
              {
                icon: HeartPulse,
                title: 'Hospital Pediátrico Cardiológico',
                description: 'Cardiopatias congênitas e arritmias pediátricas complexas. Para quem quer se especializar em cardiologia pediátrica.',
                tags: ['Cardiopatia', 'Congênito', 'Avançado'],
                color: 'pink'
              }
            ].map((item, index) => (
              <ScrollReveal key={index} delay={400 + index * 100}>
                <div className="relative group h-full">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-teal-500 rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity" />
                  <div className="relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all border border-gray-100 h-full flex flex-col">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
                      item.color === 'green' ? 'bg-green-100' : 'bg-pink-100'
                    }`}>
                      <item.icon className={`h-7 w-7 ${
                        item.color === 'green' ? 'text-green-600' : 'text-pink-600'
                      }`} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed mb-4 flex-grow">{item.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag, i) => (
                        <span key={i} className={`px-3 py-1 text-xs font-medium rounded-full ${
                          item.color === 'green' ? 'bg-green-50 text-green-700' : 'bg-pink-50 text-pink-700'
                        }`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={600}>
            <div className="mt-12 text-center">
              <p className="text-gray-600 mb-4">Mude seu perfil a qualquer momento nas configurações</p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all"
              >
                Começar com ECGs personalizados
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="como-funciona" className="py-24 bg-[#FAFBFC]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-medium mb-4">
                Como funciona
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                A experiência completa de um plantão
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Pratique interpretação de ECG em 3 etapas
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: Activity,
                title: 'Receba o caso',
                description: 'Como em um plantão real, você recebe o ECG com dados clínicos: idade, sexo, queixa principal e histórico.',
                color: 'blue'
              },
              {
                step: '02',
                icon: Target,
                title: 'Envie seu laudo',
                description: 'Preencha sua interpretação completa: ritmo, eixo, intervalos e todos os achados do traçado.',
                color: 'purple'
              },
              {
                step: '03',
                icon: CheckCircle2,
                title: 'Receba feedback',
                description: 'Compare seu laudo com o do especialista. Veja sua nota e entenda exatamente onde melhorar.',
                color: 'green'
              }
            ].map((item, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity" />
                  <div className="relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all border border-gray-100">
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-14 h-14 bg-${item.color}-100 rounded-2xl flex items-center justify-center`}>
                        <item.icon className={`h-7 w-7 text-${item.color}-600`} />
                      </div>
                      <span className="text-5xl font-bold text-gray-100">{item.step}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="recursos" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal>
              <div>
                <span className="inline-block px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-4">
                  Recursos
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Tudo que você precisa para dominar ECG
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Desenvolvido por cardiologistas para oferecer a melhor experiência de aprendizado em eletrocardiografia.
                </p>

                <div className="space-y-6">
                  {[
                    {
                      icon: Zap,
                      title: 'Feedback detalhado Premium',
                      description: 'Veja exatamente onde errou com explicações didáticas de cada achado. Baixe o relatório em PDF.'
                    },
                    {
                      icon: BarChart3,
                      title: 'Acompanhe seu progresso',
                      description: 'Monitore sua taxa de acerto e identifique áreas que precisam de mais prática.'
                    },
                    {
                      icon: Users,
                      title: 'Ranking competitivo',
                      description: 'Compare seu desempenho com outros usuários e suba no ranking.'
                    },
                    {
                      icon: Building2,
                      title: 'ECGs do seu dia a dia',
                      description: 'Selecione seu hospital e receba ECGs priorizados para sua realidade clínica.'
                    }
                  ].map((feature, index) => (
                    <div key={index} className="flex gap-4 group">
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                        <feature.icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                        <p className="text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-2xl opacity-20" />
                <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 lg:p-8 text-white">
                  {/* Window controls */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span className="ml-2 text-sm text-gray-400">Feedback Premium</span>
                  </div>

                  <div className="space-y-3">
                    {/* Score header */}
                    <div className="flex items-center justify-between bg-green-500/20 border border-green-500/30 rounded-xl p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-green-500/20 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="h-5 w-5 text-green-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">85% - Aprovado!</p>
                          <p className="text-xs text-gray-400">17/20 pontos</p>
                        </div>
                      </div>
                    </div>

                    {/* Expandable feedback card (expanded state) */}
                    <div className="bg-white/10 rounded-xl overflow-hidden">
                      <div className="p-3 flex items-center justify-between border-b border-white/10">
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-red-500/20 rounded-full">
                            <X className="h-3 w-3 text-red-400" />
                          </div>
                          <span className="font-medium text-sm">Eixo Elétrico</span>
                          <span className="text-xs text-red-400">(0/3 pts)</span>
                        </div>
                        <ChevronUp className="h-4 w-4 text-gray-400" />
                      </div>

                      {/* Expanded content */}
                      <div className="p-3 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-red-500/10 p-2 rounded-lg">
                            <p className="text-[10px] text-red-400 uppercase mb-0.5">Sua resposta</p>
                            <p className="text-xs">Desvio para esquerda</p>
                          </div>
                          <div className="bg-green-500/10 p-2 rounded-lg">
                            <p className="text-[10px] text-green-400 uppercase mb-0.5">Correto</p>
                            <p className="text-xs">Eixo normal</p>
                          </div>
                        </div>
                        <div className="bg-blue-500/10 p-2 rounded-lg">
                          <p className="text-[10px] text-blue-400 uppercase mb-0.5">Por que?</p>
                          <p className="text-xs text-gray-300">O eixo está entre -30° e +90°, dentro dos limites normais...</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <div className="flex-1 bg-purple-500/20 border border-purple-500/30 rounded-xl p-2.5 text-center flex items-center justify-center gap-2">
                        <FileDown className="h-4 w-4 text-purple-300" />
                        <p className="text-xs text-purple-300">Baixar PDF</p>
                      </div>
                      <div className="flex-1 bg-blue-500/20 border border-blue-500/30 rounded-xl p-2.5 text-center flex items-center justify-center gap-2">
                        <BookOpen className="h-4 w-4 text-blue-300" />
                        <p className="text-xs text-blue-300">Curso ECG</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Authority Section */}
      <section className="py-24 bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur rounded-full text-sm font-medium mb-4">
                Quem está por trás
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Feedback baseado em especialistas
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Os gabaritos são elaborados por cardiologistas com reconhecimento internacional.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur rounded-3xl p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-40 h-40 rounded-full overflow-hidden flex-shrink-0 ring-4 ring-blue-500/30">
                  <Image
                    src="/dr-alencar.jpg"
                    alt="Dr. José Alencar"
                    width={160}
                    height={160}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Dr. José Alencar</h3>
                  <p className="text-blue-400 font-medium mb-4">Cardiologista e Eletrofisiologista</p>
                  <div className="space-y-2 text-gray-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
                      <span>Fellow da Sociedade Europeia de Cardiologia (FESC)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
                      <span>Fellow da ISHNE (FISHNE)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
                      <span>Autor do Tratado de ECG</span>
                    </div>
                  </div>
                </div>
              </div>
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
                  Comece seu plantão simulado agora
                </h2>
                <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-8">
                  5 ECGs gratuitos por mês. Sem compromisso. Cancele quando quiser.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/register"
                    className="group px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    Começar Gratuitamente
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/pricing"
                    className="px-8 py-4 bg-white/10 backdrop-blur text-white font-semibold rounded-xl hover:bg-white/20 transition-all border border-white/20"
                  >
                    Ver Planos
                  </Link>
                </div>
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
                <li><a href="#como-funciona" className="hover:text-white transition-colors">Como funciona</a></li>
                <li><a href="#recursos" className="hover:text-white transition-colors">Recursos</a></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Preços</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
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
                  <button onClick={() => { setContactType('contact'); setContactOpen(true); }} className="hover:text-white transition-colors flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Fale conosco
                  </button>
                </li>
                <li>
                  <button onClick={() => { setContactType('suporte'); setContactOpen(true); }} className="hover:text-white transition-colors">
                    Suporte
                  </button>
                </li>
                <li>
                  <button onClick={() => { setContactType('parceria'); setContactOpen(true); }} className="hover:text-white transition-colors">
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
      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} type={contactType} />

      {/* Video Modal */}
      {videoPlaying && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 animate-fadeIn"
            onClick={() => setVideoPlaying(false)}
          />
          <div className="relative bg-black rounded-2xl overflow-hidden w-full max-w-4xl animate-scaleIn">
            <button
              onClick={() => setVideoPlaying(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="h-6 w-6 text-white" />
            </button>
            <div className="aspect-video bg-gray-900 flex items-center justify-center">
              <div className="text-center text-white">
                <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-gray-400">Vídeo demo em breve</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
