import Link from 'next/link'
import { Activity, ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Termos de Uso | Plantão de ECG',
  description: 'Termos de uso e condições do Plantão de ECG',
}

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Activity className="h-8 w-8 text-blue-600" />
              <span className="font-bold text-xl text-gray-900">Plantão de ECG</span>
            </Link>
            <Link href="/" className="text-gray-600 hover:text-gray-900 flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Termos de Uso</h1>

        <div className="prose prose-gray max-w-none">
          <p className="text-sm text-gray-500 mb-8">
            Última atualização: {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Aceitação dos Termos</h2>
            <p className="text-gray-700 mb-4">
              Ao acessar ou utilizar o Plantão de ECG (&quot;Plataforma&quot;), você concorda em cumprir e estar vinculado
              a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não poderá acessar
              ou utilizar a Plataforma.
            </p>
            <p className="text-gray-700">
              A Plataforma é de propriedade e operada por Dr. José Alencar (&quot;nós&quot;, &quot;nosso&quot; ou &quot;Plantão de ECG&quot;),
              médico cardiologista registrado no Conselho Regional de Medicina.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Descrição do Serviço</h2>
            <p className="text-gray-700 mb-4">
              O Plantão de ECG é uma plataforma educacional destinada a profissionais de saúde e estudantes de
              medicina para prática e aprimoramento na interpretação de eletrocardiogramas (ECGs).
            </p>
            <p className="text-gray-700 mb-4">
              <strong>A Plataforma NÃO é um serviço de diagnóstico médico.</strong> Os ECGs apresentados são
              exclusivamente para fins educacionais e não devem ser utilizados para diagnóstico ou tratamento
              de pacientes reais.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Registro e Conta</h2>
            <p className="text-gray-700 mb-4">
              Para utilizar a Plataforma, você deve:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Ter pelo menos 18 anos de idade</li>
              <li>Fornecer informações verdadeiras, precisas e completas durante o registro</li>
              <li>Manter a confidencialidade de sua senha e conta</li>
              <li>Ser responsável por todas as atividades realizadas em sua conta</li>
              <li>Notificar-nos imediatamente sobre qualquer uso não autorizado de sua conta</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Planos e Pagamentos</h2>
            <p className="text-gray-700 mb-4">
              A Plataforma oferece:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li><strong>Plano Gratuito:</strong> 5 casos de ECG por mês</li>
              <li><strong>Plano Premium:</strong> Acesso ilimitado aos casos de ECG</li>
              <li><strong>Plano Premium +AI:</strong> Acesso ilimitado + feedback por inteligência artificial</li>
            </ul>
            <p className="text-gray-700 mb-4">
              Os pagamentos são processados de forma segura através do Stripe. Ao assinar um plano pago, você
              autoriza a cobrança recorrente no cartão de crédito informado.
            </p>
            <p className="text-gray-700">
              Você pode cancelar sua assinatura a qualquer momento através da Plataforma. O acesso ao plano
              contratado permanecerá ativo até o final do período pago.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Propriedade Intelectual</h2>
            <p className="text-gray-700 mb-4">
              Todo o conteúdo da Plataforma, incluindo mas não limitado a:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Imagens de ECG</li>
              <li>Laudos e interpretações</li>
              <li>Textos, gráficos e design</li>
              <li>Código-fonte e software</li>
              <li>Logos e marcas</li>
              <li>Material didático e educacional</li>
            </ul>
            <p className="text-gray-700 mb-4">
              São de propriedade exclusiva do Plantão de ECG ou de seus licenciadores e estão protegidos
              por leis de direitos autorais, marcas registradas e outras leis de propriedade intelectual.
            </p>
            <p className="text-gray-700 font-semibold">
              É expressamente proibido:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Copiar, reproduzir ou distribuir qualquer conteúdo da Plataforma</li>
              <li>Fazer download em massa de imagens de ECG</li>
              <li>Utilizar web scraping, bots ou técnicas automatizadas para extrair dados</li>
              <li>Modificar, adaptar ou criar trabalhos derivados do conteúdo</li>
              <li>Remover avisos de direitos autorais ou propriedade</li>
              <li>Utilizar o conteúdo para fins comerciais sem autorização prévia por escrito</li>
              <li>Engenharia reversa do software ou código-fonte</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Uso Aceitável</h2>
            <p className="text-gray-700 mb-4">
              Ao utilizar a Plataforma, você concorda em NÃO:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Violar qualquer lei ou regulamento aplicável</li>
              <li>Compartilhar sua conta ou credenciais de acesso com terceiros</li>
              <li>Tentar acessar áreas restritas da Plataforma sem autorização</li>
              <li>Interferir no funcionamento adequado da Plataforma</li>
              <li>Transmitir vírus, malware ou código malicioso</li>
              <li>Coletar informações de outros usuários</li>
              <li>Utilizar a Plataforma para spam ou publicidade não autorizada</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Isenção de Responsabilidade Médica</h2>
            <p className="text-gray-700 mb-4 font-semibold">
              AVISO IMPORTANTE:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>A Plataforma é exclusivamente para fins educacionais</li>
              <li>Não substitui avaliação médica profissional</li>
              <li>Não deve ser utilizada para diagnóstico de pacientes reais</li>
              <li>Os ECGs apresentados podem ser modificados para fins didáticos</li>
              <li>Sempre consulte um médico qualificado para questões clínicas</li>
            </ul>
            <p className="text-gray-700">
              O Plantão de ECG não se responsabiliza por decisões clínicas tomadas com base no
              conteúdo educacional da Plataforma.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Limitação de Responsabilidade</h2>
            <p className="text-gray-700 mb-4">
              Na máxima extensão permitida por lei, o Plantão de ECG não será responsável por:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Danos indiretos, incidentais, especiais ou consequenciais</li>
              <li>Perda de dados, lucros ou oportunidades de negócio</li>
              <li>Interrupções no serviço ou falhas técnicas</li>
              <li>Conteúdo de terceiros ou links externos</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Modificações</h2>
            <p className="text-gray-700 mb-4">
              Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento. Alterações
              significativas serão comunicadas por e-mail ou através da Plataforma.
            </p>
            <p className="text-gray-700">
              O uso continuado da Plataforma após as modificações constitui aceitação dos novos termos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Rescisão</h2>
            <p className="text-gray-700 mb-4">
              Podemos suspender ou encerrar seu acesso à Plataforma imediatamente, sem aviso prévio, por:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Violação destes Termos de Uso</li>
              <li>Conduta fraudulenta ou ilegal</li>
              <li>Não pagamento de assinatura</li>
              <li>Qualquer motivo a nosso exclusivo critério</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Lei Aplicável e Foro</h2>
            <p className="text-gray-700 mb-4">
              Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil.
            </p>
            <p className="text-gray-700">
              Fica eleito o foro da Comarca de São Paulo, Estado de São Paulo, para dirimir quaisquer
              controvérsias decorrentes destes Termos, com renúncia expressa a qualquer outro, por mais
              privilegiado que seja.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Contato</h2>
            <p className="text-gray-700 mb-4">
              Para questões sobre estes Termos de Uso, entre em contato:
            </p>
            <ul className="list-none text-gray-700 space-y-1">
              <li><strong>E-mail:</strong> contato@plantaoecg.com.br</li>
              <li><strong>Site:</strong> plantaoecg.com.br</li>
            </ul>
          </section>

          <div className="border-t border-gray-200 pt-8 mt-8">
            <p className="text-sm text-gray-500">
              Ao utilizar o Plantão de ECG, você declara ter lido, compreendido e concordado com
              estes Termos de Uso.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center gap-8 text-sm text-gray-600">
            <Link href="/termos" className="hover:text-gray-900">Termos de Uso</Link>
            <Link href="/privacidade" className="hover:text-gray-900">Política de Privacidade</Link>
            <Link href="/" className="hover:text-gray-900">Página Inicial</Link>
          </div>
          <p className="text-center text-sm text-gray-500 mt-4">
            © {new Date().getFullYear()} Plantão de ECG. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
