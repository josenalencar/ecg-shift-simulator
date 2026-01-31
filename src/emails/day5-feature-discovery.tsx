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
} from '@react-email/components'

interface Day5FeatureDiscoveryEmailProps {
  name: string | null
  featureName: string
  featureDescription: string
  unsubscribeToken?: string
}

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://plantaoecg.com.br'
const logoUrl = 'https://plantaoecg.com.br/logo-email.png'

export default function Day5FeatureDiscoveryEmail({
  name,
  featureName,
  featureDescription,
  unsubscribeToken,
}: Day5FeatureDiscoveryEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Recurso não descoberto: {featureName} - Plantão ECG</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src={logoUrl}
              alt="Plantão ECG"
              width={160}
              height={40}
              style={logo}
            />
          </Section>

          {/* Hero Section */}
          <Section style={heroSection}>
            <Text style={discoveryBadge}>RECURSO ESPECIAL</Text>
            <Heading style={heading}>
              Você sabia?
            </Heading>
            <Text style={heroText}>
              Olá, {name || 'Doutor(a)'}! Notamos que você ainda não explorou
              um dos recursos mais poderosos do Plantão ECG.
            </Text>
          </Section>

          {/* Feature Box */}
          <Section style={featureBox}>
            <Text style={featureTitle}>{featureName}</Text>
            <Text style={featureDesc}>{featureDescription}</Text>
          </Section>

          {/* CTA Button */}
          <Section style={buttonContainer}>
            <Link style={button} href={`${baseUrl}/practice`}>
              Experimentar Agora
            </Link>
          </Section>

          <Hr style={divider} />

          {/* Other Features Section */}
          <Section style={otherSection}>
            <Text style={sectionTitle}>Outros recursos para explorar:</Text>
            <Text style={otherItem}>
              <strong>Ranking:</strong> Compare seu desempenho com outros médicos
            </Text>
            <Text style={otherItem}>
              <strong>Conquistas:</strong> Desbloqueie badges ao atingir marcos
            </Text>
            <Text style={otherItem}>
              <strong>Estatísticas:</strong> Acompanhe sua evolução por categoria
            </Text>
            <Text style={otherItem}>
              <strong>Modo Plantão:</strong> Simule casos de emergência
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Plantão ECG - Treinamento em interpretação de ECG
            </Text>
            <Text style={footerLinks}>
              <Link href={baseUrl} style={footerLink}>Site</Link>
              {' • '}
              <Link href={`${baseUrl}/termos`} style={footerLink}>Termos</Link>
              {' • '}
              <Link href={`${baseUrl}/privacidade`} style={footerLink}>Privacidade</Link>
            </Text>
            {unsubscribeToken && (
              <Text style={unsubscribeText}>
                <Link href={`${baseUrl}/api/email/unsubscribe?token=${unsubscribeToken}`} style={unsubscribeLink}>
                  Cancelar inscrição
                </Link>
              </Text>
            )}
            <Text style={copyright}>
              © 2026 Plantão ECG. Todos os direitos reservados.
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
  backgroundColor: '#1e40af',
  padding: '24px',
  textAlign: 'center' as const,
}

const logo = {
  margin: '0 auto',
}

const heroSection = {
  padding: '40px 40px 20px',
  textAlign: 'center' as const,
}

const discoveryBadge = {
  backgroundColor: '#faf5ff',
  color: '#7c3aed',
  fontSize: '12px',
  fontWeight: '700',
  letterSpacing: '1px',
  padding: '6px 16px',
  borderRadius: '20px',
  display: 'inline-block',
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

const featureBox = {
  backgroundColor: '#faf5ff',
  margin: '20px 40px',
  padding: '24px',
  borderRadius: '12px',
  border: '2px solid #e9d5ff',
}

const featureTitle = {
  color: '#7c3aed',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0 0 8px',
}

const featureDesc = {
  color: '#6b21a8',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  padding: '20px 40px 40px',
}

const button = {
  backgroundColor: '#7c3aed',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
  boxShadow: '0 2px 4px rgba(124, 58, 237, 0.3)',
}

const divider = {
  borderColor: '#e4e4e7',
  margin: '0 40px',
}

const otherSection = {
  padding: '32px 40px',
}

const sectionTitle = {
  color: '#18181b',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 16px',
}

const otherItem = {
  color: '#52525b',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 8px',
}

const footer = {
  backgroundColor: '#fafafa',
  padding: '32px 40px',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#71717a',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0 0 12px',
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

const unsubscribeText = {
  margin: '0 0 12px',
}

const unsubscribeLink = {
  color: '#a1a1aa',
  fontSize: '12px',
  textDecoration: 'underline',
}

const copyright = {
  color: '#a1a1aa',
  fontSize: '12px',
  margin: '0',
}
