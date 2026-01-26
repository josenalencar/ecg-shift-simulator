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
              A Plataforma é de propriedade e operada por <strong>Dr. José de Alencar Neto</strong> (&quot;nós&quot;, &quot;nosso&quot; ou &quot;Plantão de ECG&quot;),
              médico cardiologista devidamente inscrito no <strong>Conselho Regional de Medicina do Estado de São Paulo
              (CREMESP) sob o número 166889</strong>.
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
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Política de Cancelamento e Reembolso</h2>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 text-sm">
                <strong>Base Legal:</strong> Esta política está em conformidade com o Código de Defesa do Consumidor
                (Lei nº 8.078/1990), especialmente os artigos 49 e 51, e com o Marco Civil da Internet (Lei nº 12.965/2014).
              </p>
            </div>

            <h3 className="text-lg font-medium text-gray-900 mb-3">5.1. Direito de Arrependimento (Art. 49, CDC)</h3>
            <p className="text-gray-700 mb-4">
              Em conformidade com o <strong>artigo 49 do Código de Defesa do Consumidor</strong>, o usuário que contratar
              qualquer plano pago da Plataforma tem o direito de desistir da contratação no prazo de <strong>7 (sete) dias
              corridos</strong> a contar da data da assinatura, sem necessidade de justificativa e sem qualquer ônus.
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>O prazo de 7 dias inicia-se na data da confirmação do pagamento</li>
              <li>A solicitação deve ser feita por e-mail para <strong>contato@plantaoecg.com.br</strong> ou através da própria Plataforma</li>
              <li>O reembolso será <strong>integral</strong>, incluindo o valor total pago</li>
              <li>O valor será estornado no mesmo meio de pagamento utilizado na compra</li>
              <li>O prazo para efetivação do estorno é de até <strong>10 (dez) dias úteis</strong> após a confirmação do cancelamento</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-900 mb-3">5.2. Cancelamento Após o Período de Arrependimento</h3>
            <p className="text-gray-700 mb-4">
              Após o período de 7 dias previsto no Art. 49 do CDC, o usuário ainda poderá cancelar sua assinatura
              a qualquer momento, observadas as seguintes condições:
            </p>

            <h4 className="font-medium text-gray-900 mb-2">5.2.1. Assinaturas Mensais</h4>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>O cancelamento pode ser solicitado a qualquer momento</li>
              <li><strong>Não há reembolso proporcional</strong> do período não utilizado no mês corrente</li>
              <li>O acesso aos recursos premium permanece ativo até o final do período já pago</li>
              <li>Não haverá cobranças adicionais após o cancelamento</li>
              <li>O usuário retorna automaticamente ao plano gratuito ao término do período</li>
            </ul>

            <h4 className="font-medium text-gray-900 mb-2">5.2.2. Assinaturas Anuais</h4>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>O cancelamento pode ser solicitado a qualquer momento</li>
              <li>Se solicitado dentro dos primeiros <strong>30 (trinta) dias</strong>: reembolso de <strong>80% do valor total</strong></li>
              <li>Se solicitado após 30 dias: <strong>não há reembolso</strong>, mas o acesso permanece até o final do período contratado</li>
              <li>O desconto concedido na assinatura anual considera o compromisso de permanência pelo período integral</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-900 mb-3">5.3. Procedimento para Solicitação de Cancelamento ou Reembolso</h3>
            <p className="text-gray-700 mb-4">
              Para exercer seu direito de cancelamento ou solicitar reembolso, o usuário deve:
            </p>
            <ol className="list-decimal list-inside text-gray-700 mb-4 space-y-2">
              <li>Acessar a Plataforma e ir em <strong>&quot;Meu Plano&quot;</strong> → <strong>&quot;Cancelar Assinatura&quot;</strong>; ou</li>
              <li>Enviar e-mail para <strong>contato@plantaoecg.com.br</strong> com o assunto &quot;Solicitação de Cancelamento&quot;</li>
              <li>Informar: nome completo, e-mail cadastrado, data da assinatura e motivo do cancelamento (opcional)</li>
              <li>Aguardar confirmação por e-mail em até <strong>48 horas úteis</strong></li>
            </ol>

            <h3 className="text-lg font-medium text-gray-900 mb-3">5.4. Prazos para Processamento do Reembolso</h3>
            <table className="w-full border-collapse border border-gray-300 mb-4 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Situação</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Prazo</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Confirmação do cancelamento</td>
                  <td className="border border-gray-300 px-4 py-2">Até 48 horas úteis</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Processamento do reembolso (cartão de crédito)</td>
                  <td className="border border-gray-300 px-4 py-2">Até 10 dias úteis</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Visualização do estorno na fatura</td>
                  <td className="border border-gray-300 px-4 py-2">1 a 2 faturas subsequentes*</td>
                </tr>
              </tbody>
            </table>
            <p className="text-gray-600 text-sm mb-4">
              * O prazo para visualização do estorno na fatura depende da administradora do cartão de crédito
              e está fora do controle do Plantão de ECG.
            </p>

            <h3 className="text-lg font-medium text-gray-900 mb-3">5.5. Situações que NÃO Ensejam Reembolso</h3>
            <p className="text-gray-700 mb-4">
              Em conformidade com o Art. 51 do CDC e jurisprudência aplicável, <strong>não será concedido reembolso</strong> nas seguintes situações:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Solicitação após o prazo de 7 dias para assinaturas mensais (exceto vícios do serviço)</li>
              <li>Solicitação após 30 dias para assinaturas anuais</li>
              <li>Uso comprovado dos serviços premium além do período de teste (mais de 10 casos interpretados)</li>
              <li>Suspensão ou banimento por violação dos Termos de Uso</li>
              <li>Impossibilidade de uso por fatores externos (falta de internet, dispositivo incompatível, etc.)</li>
              <li>Desconhecimento das funcionalidades da plataforma (disponíveis para consulta antes da assinatura)</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-900 mb-3">5.6. Vícios e Defeitos do Serviço (Art. 20, CDC)</h3>
            <p className="text-gray-700 mb-4">
              Em caso de <strong>vício de qualidade</strong> que torne o serviço impróprio ao consumo ou diminua seu valor,
              conforme Art. 20 do CDC, o consumidor tem direito a:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Reexecução dos serviços, sem custo adicional</li>
              <li>Restituição imediata da quantia paga, monetariamente atualizada</li>
              <li>Abatimento proporcional do preço</li>
            </ul>
            <p className="text-gray-700 mb-4">
              Considera-se vício de qualidade: indisponibilidade prolongada da plataforma (superior a 72 horas consecutivas),
              erros sistemáticos nos laudos oficiais, ou falhas graves de segurança que comprometam dados do usuário.
            </p>

            <h3 className="text-lg font-medium text-gray-900 mb-3">5.7. Cobranças Indevidas</h3>
            <p className="text-gray-700 mb-4">
              Em caso de cobrança indevida, o consumidor tem direito à restituição em dobro do valor pago em excesso,
              acrescido de correção monetária e juros legais, conforme <strong>Art. 42, parágrafo único, do CDC</strong>,
              salvo hipótese de engano justificável.
            </p>
            <p className="text-gray-700 mb-4">
              Para reportar cobranças indevidas, entre em contato imediatamente pelo e-mail <strong>contato@plantaoecg.com.br</strong>
              anexando comprovante da cobrança.
            </p>

            <h3 className="text-lg font-medium text-gray-900 mb-3">5.8. Disposições Gerais sobre Reembolso</h3>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Todos os reembolsos serão processados através do <strong>Stripe</strong>, nossa plataforma de pagamentos</li>
              <li>O reembolso será feito exclusivamente para o mesmo cartão/conta utilizado na compra</li>
              <li>Não realizamos reembolsos em dinheiro, transferência bancária ou outras formas de pagamento</li>
              <li>O usuário receberá comprovante do cancelamento e do reembolso por e-mail</li>
              <li>Dúvidas sobre o status do reembolso podem ser verificadas no portal do Stripe ou junto à administradora do cartão</li>
            </ul>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
              <p className="text-yellow-800 text-sm">
                <strong>Importante:</strong> Estas condições de cancelamento e reembolso estão em conformidade com a
                legislação brasileira vigente, incluindo o Código de Defesa do Consumidor (Lei 8.078/90), o Marco Civil
                da Internet (Lei 12.965/14) e a Lei Geral de Proteção de Dados (Lei 13.709/18). Qualquer cláusula que
                contrarie direitos básicos do consumidor será considerada nula de pleno direito.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Propriedade Intelectual</h2>
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
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Uso Aceitável</h2>
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
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Isenção de Responsabilidade Médica</h2>
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
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Limitação de Responsabilidade</h2>
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
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Modificações dos Termos</h2>
            <p className="text-gray-700 mb-4">
              Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento. Alterações
              significativas serão comunicadas por e-mail ou através da Plataforma.
            </p>
            <p className="text-gray-700">
              O uso continuado da Plataforma após as modificações constitui aceitação dos novos termos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Rescisão</h2>
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
            <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Lei Aplicável e Foro</h2>
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
            <h2 className="text-xl font-semibold text-gray-900 mb-4">13. Contato</h2>
            <p className="text-gray-700 mb-4">
              Para questões sobre estes Termos de Uso, cancelamentos, reembolsos ou qualquer outra dúvida, entre em contato:
            </p>
            <ul className="list-none text-gray-700 space-y-2">
              <li><strong>Responsável:</strong> Dr. José de Alencar Neto</li>
              <li><strong>CREMESP:</strong> 166889</li>
              <li><strong>E-mail:</strong> contato@plantaoecg.com.br</li>
              <li><strong>Site:</strong> plantaoecg.com.br</li>
            </ul>
            <p className="text-gray-700 mt-4">
              Horário de atendimento: segunda a sexta-feira, das 9h às 18h (horário de Brasília).
              Solicitações enviadas fora deste horário serão respondidas no próximo dia útil.
            </p>
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
