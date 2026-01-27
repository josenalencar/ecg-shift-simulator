import Link from 'next/link'
import Image from 'next/image'
import { ChevronDown } from 'lucide-react'

export const metadata = {
  title: 'Perguntas Frequentes | Plantão ECG',
  description: 'Tire suas dúvidas sobre o Plantão ECG, nosso simulador de tele-ECG com feedback de especialistas.',
}

const faqs = [
  {
    category: 'Sobre a Plataforma',
    questions: [
      {
        question: 'O que é o Plantão ECG?',
        answer: 'O Plantão ECG é um simulador de plantão de tele-ECG que permite praticar a interpretação de eletrocardiogramas em um ambiente realista. Você recebe casos clínicos com ECGs reais, envia seu laudo e recebe feedback baseado em gabaritos elaborados por cardiologistas especialistas.'
      },
      {
        question: 'Como funciona o simulador?',
        answer: 'Você recebe um caso clínico com dados do paciente (idade, sexo, queixa principal) e o ECG. Analisa o traçado, preenche seu laudo com ritmo, eixo, intervalos e achados, e então recebe a correção detalhada comparando sua resposta com o gabarito do especialista.'
      },
      {
        question: 'Os ECGs são de pacientes reais?',
        answer: 'Sim, todos os ECGs são de casos reais, devidamente anonimizados para proteger a privacidade dos pacientes. Isso garante que você pratique com traçados autênticos, incluindo artefatos e variações que encontrará na prática clínica.'
      },
      {
        question: 'Quem elabora os gabaritos?',
        answer: 'Os gabaritos são elaborados pelo Dr. José Alencar, cardiologista e eletrofisiologista, Fellow da Sociedade Europeia de Cardiologia (FESC), Fellow da ISHNE (FISHNE) e autor do Tratado de ECG.'
      },
    ]
  },
  {
    category: 'Planos e Pagamento',
    questions: [
      {
        question: 'Posso usar gratuitamente?',
        answer: 'Sim! O plano gratuito permite realizar até 5 ECGs por mês, com feedback básico (nota e acertos/erros). É uma ótima forma de conhecer a plataforma antes de assinar um plano premium.'
      },
      {
        question: 'Qual a diferença entre os planos?',
        answer: 'O plano Gratuito oferece 5 ECGs/mês com feedback básico. O Premium oferece ECGs ilimitados, feedback detalhado com explicações, relatório em PDF e personalização por tipo de hospital. O Premium +IA adiciona análise por inteligência artificial e sugestões de estudo personalizadas.'
      },
      {
        question: 'Posso cancelar a qualquer momento?',
        answer: 'Sim, você pode cancelar sua assinatura a qualquer momento. O acesso premium continua até o final do período já pago, sem cobranças adicionais.'
      },
      {
        question: 'Quais formas de pagamento são aceitas?',
        answer: 'Aceitamos cartões de crédito (Visa, Mastercard, American Express) e Pix. O pagamento é processado de forma segura pelo Stripe.'
      },
      {
        question: 'Emitem nota fiscal?',
        answer: 'Sim, emitimos nota fiscal para todas as assinaturas. A nota é enviada automaticamente para o email cadastrado após a confirmação do pagamento.'
      },
    ]
  },
  {
    category: 'Recursos Premium',
    questions: [
      {
        question: 'O que é a personalização por tipo de hospital?',
        answer: 'Você pode selecionar seu local de trabalho (Pronto Socorro, Hospital Geral, Hospital Cardiológico, Hospital Pediátrico) e o sistema prioriza automaticamente os ECGs mais relevantes para sua prática. Por exemplo, no PS você verá mais casos de isquemia e arritmias de emergência.'
      },
      {
        question: 'Como funciona o relatório em PDF?',
        answer: 'Após cada caso, você pode baixar um PDF com o ECG, seu laudo, o gabarito do especialista, sua nota e explicações detalhadas de cada achado. Ideal para revisar depois ou arquivar seu progresso.'
      },
      {
        question: 'Vocês têm ECGs pediátricos?',
        answer: 'Sim! Temos uma coleção crescente de ECGs pediátricos, com as particularidades de frequência, eixo e variantes normais da idade. Disponível para assinantes Premium.'
      },
      {
        question: 'O que a IA faz no plano Premium +IA?',
        answer: 'A inteligência artificial analisa seu histórico de erros e acertos para identificar padrões. Ela sugere tópicos de estudo, recomenda casos específicos para praticar suas dificuldades e fornece explicações adicionais personalizadas.'
      },
    ]
  },
  {
    category: 'Conta e Acesso',
    questions: [
      {
        question: 'Esqueci minha senha. Como recupero?',
        answer: 'Na tela de login, clique em "Esqueci minha senha" e informe seu email. Você receberá um link para criar uma nova senha. O link expira em 1 hora por segurança.'
      },
      {
        question: 'Posso usar em celular e tablet?',
        answer: 'Sim, a plataforma é responsiva e funciona em qualquer dispositivo. Para melhor visualização dos ECGs, recomendamos usar em telas maiores (tablet ou computador) quando possível.'
      },
      {
        question: 'Meus dados estão seguros?',
        answer: 'Sim, levamos segurança a sério. Usamos criptografia em todas as comunicações, seus dados são armazenados em servidores seguros, e nunca compartilhamos informações pessoais com terceiros.'
      },
      {
        question: 'Como excluo minha conta?',
        answer: 'Entre em contato conosco através do formulário de suporte ou email. Processaremos a exclusão em até 48 horas, removendo todos os seus dados pessoais conforme a LGPD.'
      },
    ]
  },
  {
    category: 'Suporte',
    questions: [
      {
        question: 'Encontrei um erro em um gabarito. O que faço?',
        answer: 'Agradecemos o feedback! Use o botão de suporte para reportar. Nossa equipe revisará o caso e, se confirmado o erro, corrigiremos e notificaremos você.'
      },
      {
        question: 'Como entro em contato com o suporte?',
        answer: 'Você pode usar o formulário de contato no rodapé do site, enviar email diretamente, ou usar o botão de suporte dentro da plataforma. Respondemos em até 24 horas úteis.'
      },
      {
        question: 'Vocês oferecem treinamento para instituições?',
        answer: 'Sim! Temos planos especiais para residências médicas, hospitais e faculdades de medicina. Entre em contato através do formulário de parcerias para uma proposta personalizada.'
      },
    ]
  },
]

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
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
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="px-4 py-2 text-gray-700 font-medium hover:text-gray-900 transition-colors"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="px-5 py-2.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-all"
              >
                Começar Grátis
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Perguntas Frequentes
          </h1>
          <p className="text-xl text-gray-600">
            Tire suas dúvidas sobre o Plantão ECG
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
                {category.category}
              </h2>
              <div className="space-y-4">
                {category.questions.map((faq, faqIndex) => (
                  <details
                    key={faqIndex}
                    className="group bg-white rounded-xl border border-gray-200 overflow-hidden"
                  >
                    <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors">
                      <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                      <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="px-6 pb-6 pt-2 text-gray-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ainda tem dúvidas?
          </h2>
          <p className="text-gray-400 mb-8">
            Nossa equipe está pronta para ajudar
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="px-6 py-3 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-all"
            >
              Fale Conosco
            </Link>
            <Link
              href="/register"
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all"
            >
              Começar Gratuitamente
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
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
    </div>
  )
}
