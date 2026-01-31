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

interface XPEventAnnouncementEmailProps {
  name: string | null
  eventName: string
  eventType: '2x' | '3x'
  endDate: string
  unsubscribeToken?: string
}

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://plantaoecg.com.br'
const logoUrl = 'https://plantaoecg.com.br/logo-email.png'

export default function XPEventAnnouncementEmail({
  name,
  eventName,
  eventType,
  endDate,
  unsubscribeToken,
}: XPEventAnnouncementEmailProps) {
  const multiplierColor = eventType === '3x' ? '#dc2626' : '#f59e0b'
  const multiplierBgColor = eventType === '3x' ? '#fef2f2' : '#fffbeb'
  const multiplierText = eventType === '3x' ? 'XP TRIPLICADO!' : 'XP DOBRADO!'

  return (
    <Html>
      <Head />
      <Preview>{multiplierText} Evento especial de XP no Plantão ECG!</Preview>
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

          {/* Hero Section with Event Banner */}
          <Section style={{ ...heroSection, backgroundColor: multiplierBgColor }}>
            <Text style={{ ...eventBadge, backgroundColor: multiplierColor }}>
              EVENTO ESPECIAL
            </Text>
            <Heading style={{ ...heading, color: multiplierColor }}>
              {multiplierText}
            </Heading>
            <Text style={heroText}>
              Olá, {name || 'Doutor(a)'}!
            </Text>
            <Text style={heroText}>
              Um evento especial de XP está acontecendo agora! Todos os ECGs que você
              interpretar durante o evento valem <strong style={{ color: multiplierColor }}>{eventType}</strong> o XP normal.
            </Text>
          </Section>

          {/* Event Details */}
          <Section style={eventDetailsSection}>
            <Text style={eventNameStyle}>{eventName}</Text>
            <Text style={eventDate}>
              Válido até: <strong>{endDate}</strong>
            </Text>
          </Section>

          {/* CTA Button */}
          <Section style={buttonContainer}>
            <Link style={{ ...button, backgroundColor: multiplierColor }} href={`${baseUrl}/practice`}>
              Começar a Praticar Agora
            </Link>
          </Section>

          <Hr style={divider} />

          {/* Tips Section */}
          <Section style={tipsSection}>
            <Text style={sectionTitle}>Aproveite ao máximo:</Text>
            <Text style={tipText}>
              • Cada ECG interpretado rende {eventType} o XP normal
            </Text>
            <Text style={tipText}>
              • Acertos perfeitos (100%) ganham bônus adicional
            </Text>
            <Text style={tipText}>
              • Mantenha seu streak para multiplicar ainda mais
            </Text>
            <Text style={tipText}>
              • Suba de nível mais rápido e desbloqueie conquistas
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

const eventBadge = {
  color: '#ffffff',
  fontSize: '12px',
  fontWeight: '700',
  letterSpacing: '1px',
  padding: '6px 16px',
  borderRadius: '20px',
  display: 'inline-block',
  margin: '0 0 16px',
}

const heading = {
  fontSize: '32px',
  fontWeight: '800',
  lineHeight: '40px',
  margin: '0 0 16px',
}

const heroText = {
  color: '#52525b',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 12px',
}

const eventDetailsSection = {
  padding: '20px 40px',
  textAlign: 'center' as const,
  backgroundColor: '#fafafa',
}

const eventNameStyle = {
  color: '#18181b',
  fontSize: '20px',
  fontWeight: '600',
  margin: '0 0 8px',
}

const eventDate = {
  color: '#71717a',
  fontSize: '14px',
  margin: '0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  padding: '30px 40px',
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
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
}

const divider = {
  borderColor: '#e4e4e7',
  margin: '0 40px',
}

const tipsSection = {
  padding: '32px 40px',
}

const sectionTitle = {
  color: '#18181b',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 16px',
}

const tipText = {
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
