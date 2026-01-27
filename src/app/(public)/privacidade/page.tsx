import Link from 'next/link'
import { Activity, ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Política de Privacidade | Plantão de ECG',
  description: 'Política de privacidade e proteção de dados do Plantão de ECG',
}

export default function PrivacidadePage() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Política de Privacidade</h1>

        <div className="prose prose-gray max-w-none">
          <p className="text-sm text-gray-500 mb-8">
            Última atualização: {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <p className="text-blue-800 text-sm">
              Esta Política de Privacidade está em conformidade com a Lei Geral de Proteção de Dados
              (LGPD - Lei nº 13.709/2018) e descreve como coletamos, usamos, armazenamos e protegemos
              seus dados pessoais.
            </p>
          </div>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Controlador dos Dados</h2>
            <p className="text-gray-700 mb-4">
              O Plantão de ECG, operado por Dr. José Alencar, é o controlador dos dados pessoais
              coletados através desta plataforma.
            </p>
            <ul className="list-none text-gray-700 space-y-1">
              <li><strong>Razão Social:</strong> José de Alencar Neto</li>
              <li><strong>E-mail para contato:</strong> privacidade@plantaoecg.com.br</li>
              <li><strong>Site:</strong> plantaoecg.com.br</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Dados Pessoais Coletados</h2>
            <p className="text-gray-700 mb-4">
              Coletamos os seguintes tipos de dados pessoais:
            </p>

            <h3 className="text-lg font-medium text-gray-900 mb-2">2.1. Dados de Cadastro</h3>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>Nome completo</li>
              <li>Endereço de e-mail</li>
              <li>Senha (armazenada de forma criptografada)</li>
              <li>Mini currículo (opcional)</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-900 mb-2">2.2. Dados de Uso</h3>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>Histórico de interpretações de ECG</li>
              <li>Pontuações e desempenho</li>
              <li>Preferências de configuração (tipo de hospital)</li>
              <li>Data e hora de acesso</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-900 mb-2">2.3. Dados de Pagamento</h3>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>Informações de assinatura</li>
              <li>Histórico de transações</li>
            </ul>
            <p className="text-gray-700 text-sm">
              <strong>Nota:</strong> Dados de cartão de crédito são processados diretamente pelo Stripe
              e NÃO são armazenados em nossos servidores.
            </p>

            <h3 className="text-lg font-medium text-gray-900 mb-2 mt-4">2.4. Dados Técnicos</h3>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>Endereço IP</li>
              <li>Tipo de navegador e dispositivo</li>
              <li>Sistema operacional</li>
              <li>Cookies e identificadores de sessão</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Finalidades do Tratamento</h2>
            <p className="text-gray-700 mb-4">
              Utilizamos seus dados pessoais para as seguintes finalidades:
            </p>
            <table className="w-full border-collapse border border-gray-300 mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left text-gray-900">Finalidade</th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-gray-900">Base Legal (LGPD)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-900">Criar e gerenciar sua conta</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-900">Execução de contrato (Art. 7º, V)</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-900">Fornecer o serviço educacional</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-900">Execução de contrato (Art. 7º, V)</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-900">Processar pagamentos</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-900">Execução de contrato (Art. 7º, V)</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-900">Enviar e-mails transacionais</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-900">Execução de contrato (Art. 7º, V)</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-900">Melhorar a plataforma</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-900">Legítimo interesse (Art. 7º, IX)</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-900">Prevenir fraudes</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-900">Legítimo interesse (Art. 7º, IX)</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-900">Cumprir obrigações legais</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-900">Obrigação legal (Art. 7º, II)</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Compartilhamento de Dados</h2>
            <p className="text-gray-700 mb-4">
              Seus dados podem ser compartilhados com:
            </p>
            <table className="w-full border-collapse border border-gray-300 mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left text-gray-900">Parceiro</th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-gray-900">Finalidade</th>
                  <th className="border border-gray-300 px-4 py-2 text-left text-gray-900">Localização</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-900">Supabase</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-900">Banco de dados e autenticação</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-900">São Paulo, Brasil</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-900">Stripe</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-900">Processamento de pagamentos</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-900">EUA (certificado Privacy Shield)</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-900">Resend</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-900">Envio de e-mails</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-900">EUA</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-900">Vercel</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-900">Hospedagem da aplicação</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-900">Global (CDN)</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-gray-900">Cloudinary</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-900">Armazenamento de imagens</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-900">Global (CDN)</td>
                </tr>
              </tbody>
            </table>
            <p className="text-gray-700 text-sm">
              Todos os parceiros estão obrigados contratualmente a proteger seus dados de acordo com
              padrões de segurança adequados.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Transferência Internacional de Dados</h2>
            <p className="text-gray-700 mb-4">
              Alguns de nossos parceiros estão localizados fora do Brasil. A transferência internacional
              de dados ocorre com base em:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>Cláusulas contratuais padrão aprovadas</li>
              <li>Certificações de privacidade reconhecidas</li>
              <li>Países com nível adequado de proteção de dados</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Retenção de Dados</h2>
            <p className="text-gray-700 mb-4">
              Seus dados pessoais são retidos pelo seguinte período:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li><strong>Dados de conta:</strong> Enquanto a conta estiver ativa + 5 anos após exclusão</li>
              <li><strong>Dados de uso (interpretações):</strong> Enquanto a conta estiver ativa</li>
              <li><strong>Dados de pagamento:</strong> 5 anos (obrigação fiscal)</li>
              <li><strong>Logs de acesso:</strong> 6 meses</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Seus Direitos (LGPD)</h2>
            <p className="text-gray-700 mb-4">
              De acordo com a LGPD, você tem os seguintes direitos:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li><strong>Confirmação e acesso:</strong> Saber se tratamos seus dados e acessá-los</li>
              <li><strong>Correção:</strong> Corrigir dados incompletos, inexatos ou desatualizados</li>
              <li><strong>Anonimização ou bloqueio:</strong> De dados desnecessários ou excessivos</li>
              <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
              <li><strong>Eliminação:</strong> Solicitar a exclusão de dados tratados com consentimento</li>
              <li><strong>Informação:</strong> Saber com quem compartilhamos seus dados</li>
              <li><strong>Revogação:</strong> Revogar consentimento a qualquer momento</li>
              <li><strong>Oposição:</strong> Opor-se ao tratamento em certas circunstâncias</li>
            </ul>
            <p className="text-gray-700">
              Para exercer qualquer desses direitos, entre em contato pelo e-mail:
              <strong> privacidade@plantaoecg.com.br</strong>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Segurança dos Dados</h2>
            <p className="text-gray-700 mb-4">
              Implementamos medidas técnicas e organizacionais para proteger seus dados:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li>Criptografia em trânsito (HTTPS/TLS)</li>
              <li>Criptografia em repouso para dados sensíveis</li>
              <li>Senhas armazenadas com hash bcrypt</li>
              <li>Autenticação segura com tokens JWT</li>
              <li>Monitoramento de acessos não autorizados</li>
              <li>Backups regulares</li>
              <li>Acesso restrito a dados (princípio do menor privilégio)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Cookies</h2>
            <p className="text-gray-700 mb-4">
              Utilizamos cookies para:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
              <li><strong>Cookies essenciais:</strong> Autenticação e segurança da sessão</li>
              <li><strong>Cookies de preferências:</strong> Lembrar suas configurações</li>
            </ul>
            <p className="text-gray-700">
              Não utilizamos cookies de rastreamento publicitário ou de terceiros para marketing.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Menores de Idade</h2>
            <p className="text-gray-700 mb-4">
              A Plataforma não é destinada a menores de 18 anos. Não coletamos intencionalmente
              dados de menores. Se você acredita que um menor nos forneceu dados pessoais,
              entre em contato para que possamos excluí-los.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Alterações nesta Política</h2>
            <p className="text-gray-700 mb-4">
              Podemos atualizar esta Política de Privacidade periodicamente. Alterações significativas
              serão comunicadas por e-mail ou através de aviso na Plataforma.
            </p>
            <p className="text-gray-700">
              Recomendamos revisar esta página regularmente para estar ciente de quaisquer alterações.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Contato e Encarregado de Dados</h2>
            <p className="text-gray-700 mb-4">
              Para questões relacionadas à privacidade e proteção de dados:
            </p>
            <ul className="list-none text-gray-700 space-y-1">
              <li><strong>E-mail:</strong> privacidade@plantaoecg.com.br</li>
              <li><strong>Site:</strong> plantaoecg.com.br</li>
            </ul>
            <p className="text-gray-700 mt-4">
              Você também pode apresentar reclamação à Autoridade Nacional de Proteção de Dados (ANPD)
              caso entenda que seus direitos não foram respeitados.
            </p>
          </section>

          <div className="border-t border-gray-200 pt-8 mt-8">
            <p className="text-sm text-gray-500">
              Ao utilizar o Plantão de ECG, você declara ter lido, compreendido e concordado com
              esta Política de Privacidade.
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
