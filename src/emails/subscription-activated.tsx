import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Hr,
  Row,
  Column,
} from '@react-email/components'

interface SubscriptionActivatedEmailProps {
  name: string
  plan: string
}

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://plantaoecg.com.br'

export default function SubscriptionActivatedEmail({
  name,
  plan,
}: SubscriptionActivatedEmailProps) {
  const isPremiumAI = plan === 'ai'
  const planDisplay = isPremiumAI ? 'Premium + IA' : 'Premium'
  const headerColor = isPremiumAI ? '#7c3aed' : '#059669'
  const badgeColor = isPremiumAI ? '#f3e8ff' : '#d1fae5'
  const badgeTextColor = isPremiumAI ? '#7c3aed' : '#059669'

  return (
    <Html>
      <Head />
      <Preview>Parabens! Sua assinatura {planDisplay} esta ativa - Aproveite todos os recursos!</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={{ ...header, backgroundColor: headerColor }}>
            <Img
              src={`${baseUrl}/logo.png`}
              alt="Plantão ECG"
              width={160}
              height={40}
              style={logo}
            />
            <Text style={headerBadge}>
              {isPremiumAI ? '&#10024; PREMIUM + IA' : '&#11088; PREMIUM'}
            </Text>
          </Section>

          {/* Success Icon */}
          <Section style={successSection}>
            <Text style={successIcon}>&#9989;</Text>
            <Heading style={heading}>
              Assinatura Ativada!
            </Heading>
            <Text style={heroText}>
              Ola, {name || 'Doutor(a)'}! Sua assinatura <strong>{planDisplay}</strong> esta
              ativa e voce ja pode aproveitar todos os recursos exclusivos.
            </Text>
          </Section>

          {/* Plan Details Box */}
          <Section style={{ ...planBox, borderColor: headerColor }}>
            <Row>
              <Column style={planDetailCol}>
                <Text style={planLabel}>Plano</Text>
                <Text style={{ ...planValue, color: headerColor }}>{planDisplay}</Text>
              </Column>
              <Column style={planDetailCol}>
                <Text style={planLabel}>Status</Text>
                <Text style={statusActive}>&#9679; Ativo</Text>
              </Column>
            </Row>
          </Section>

          {/* CTA Button */}
          <Section style={buttonContainer}>
            <Link style={{ ...button, backgroundColor: headerColor }} href={`${baseUrl}/practice`}>
              Comecar a Praticar
            </Link>
          </Section>

          <Hr style={divider} />

          {/* Features Section */}
          <Section style={featuresSection}>
            <Text style={sectionTitle}>
              {isPremiumAI ? 'Seus beneficios Premium + IA:' : 'Seus beneficios Premium:'}
            </Text>

            <Row style={featureRow}>
              <Column style={featureIconCol}>
                <Text style={featureIcon}>&#9989;</Text>
              </Column>
              <Column style={featureTextCol}>
                <Text style={featureTitle}>Casos Ilimitados</Text>
                <Text style={featureDesc}>
                  Acesso completo a todos os casos de ECG disponiveis na plataforma
                </Text>
              </Column>
            </Row>

            <Row style={featureRow}>
              <Column style={featureIconCol}>
                <Text style={featureIcon}>&#9989;</Text>
              </Column>
              <Column style={featureTextCol}>
                <Text style={featureTitle}>Niveis Avancados</Text>
                <Text style={featureDesc}>
                  Casos de dificuldade media e alta para aprimorar suas habilidades
                </Text>
              </Column>
            </Row>

            <Row style={featureRow}>
              <Column style={featureIconCol}>
                <Text style={featureIcon}>&#9989;</Text>
              </Column>
              <Column style={featureTextCol}>
                <Text style={featureTitle}>Estatisticas Detalhadas</Text>
                <Text style={featureDesc}>
                  Analise completa do seu desempenho e areas para melhoria
                </Text>
              </Column>
            </Row>

            {isPremiumAI && (
              <>
                <Row style={featureRow}>
                  <Column style={featureIconCol}>
                    <Text style={featureIcon}>&#129302;</Text>
                  </Column>
                  <Column style={featureTextCol}>
                    <Text style={{ ...featureTitle, color: '#7c3aed' }}>Analise com IA</Text>
                    <Text style={featureDesc}>
                      Inteligencia Artificial para auxiliar na interpretacao dos traçados
                    </Text>
                  </Column>
                </Row>

                <Row style={featureRow}>
                  <Column style={featureIconCol}>
                    <Text style={featureIcon}>&#128161;</Text>
                  </Column>
                  <Column style={featureTextCol}>
                    <Text style={{ ...featureTitle, color: '#7c3aed' }}>Dicas Personalizadas</Text>
                    <Text style={featureDesc}>
                      Recomendacoes de estudo baseadas no seu perfil de aprendizado
                    </Text>
                  </Column>
                </Row>
              </>
            )}
          </Section>

          <Hr style={divider} />

          {/* Tips Section */}
          <Section style={tipsSection}>
            <Text style={tipsTitle}>&#128073; Dica para comecar</Text>
            <Text style={tipsText}>
              Recomendamos comecar com casos de dificuldade media e ir aumentando
              gradualmente. Pratique pelo menos 3 casos por dia para manter o ritmo
              de aprendizado!
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Duvidas sobre sua assinatura?{' '}
              <Link href={`${baseUrl}/plano`} style={footerLink}>
                Gerenciar assinatura
              </Link>
            </Text>
            <Text style={footerLinks}>
              <Link href={baseUrl} style={footerLink}>Site</Link>
              {' • '}
              <Link href={`${baseUrl}/termos`} style={footerLink}>Termos</Link>
              {' • '}
              <Link href={`${baseUrl}/privacidade`} style={footerLink}>Privacidade</Link>
            </Text>
            <Text style={copyright}>
              © 2026 Plantao ECG. Todos os direitos reservados.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f4f4f5',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '40px auto',
  borderRadius: '12px',
  overflow: 'hidden' as const,
  maxWidth: '600px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
}

const header = {
  padding: '24px',
  textAlign: 'center' as const,
}

const logo = {
  margin: '0 auto 8px',
}

const headerBadge = {
  color: 'rgba(255, 255, 255, 0.9)',
  fontSize: '12px',
  fontWeight: '600',
  letterSpacing: '2px',
  margin: '0',
}

const successSection = {
  padding: '40px 40px 20px',
  textAlign: 'center' as const,
}

const successIcon = {
  fontSize: '48px',
  margin: '0 0 16px',
}

const heading = {
  color: '#18181b',
  fontSize: '28px',
  fontWeight: '700',
  lineHeight: '36px',
  margin: '0 0 16px',
}

const heroText = {
  color: '#52525b',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0',
}

const planBox = {
  margin: '24px 40px',
  padding: '20px',
  borderRadius: '12px',
  border: '2px solid',
  backgroundColor: '#fafafa',
}

const planDetailCol = {
  textAlign: 'center' as const,
  width: '50%',
}

const planLabel = {
  color: '#71717a',
  fontSize: '12px',
  fontWeight: '500',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 4px',
}

const planValue = {
  fontSize: '18px',
  fontWeight: '700',
  margin: '0',
}

const statusActive = {
  color: '#059669',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  padding: '8px 40px 40px',
}

const button = {
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
}

const divider = {
  borderColor: '#e4e4e7',
  margin: '0 40px',
}

const featuresSection = {
  padding: '32px 40px',
}

const sectionTitle = {
  color: '#18181b',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 24px',
}

const featureRow = {
  marginBottom: '16px',
}

const featureIconCol = {
  width: '32px',
  verticalAlign: 'top' as const,
}

const featureTextCol = {
  verticalAlign: 'top' as const,
  paddingLeft: '8px',
}

const featureIcon = {
  fontSize: '18px',
  margin: '0',
}

const featureTitle = {
  color: '#18181b',
  fontSize: '15px',
  fontWeight: '600',
  margin: '0 0 2px',
}

const featureDesc = {
  color: '#71717a',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
}

const tipsSection = {
  backgroundColor: '#fffbeb',
  padding: '24px 40px',
  margin: '0',
}

const tipsTitle = {
  color: '#b45309',
  fontSize: '15px',
  fontWeight: '600',
  margin: '0 0 8px',
}

const tipsText = {
  color: '#78716c',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
}

const footer = {
  backgroundColor: '#fafafa',
  padding: '32px 40px',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#71717a',
  fontSize: '14px',
  margin: '0 0 16px',
}

const footerLinks = {
  color: '#a1a1aa',
  fontSize: '13px',
  margin: '0 0 12px',
}

const footerLink = {
  color: '#71717a',
  textDecoration: 'none',
}

const copyright = {
  color: '#a1a1aa',
  fontSize: '12px',
  margin: '0',
}
