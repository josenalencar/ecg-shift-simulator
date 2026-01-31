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

interface StreakAtRiskEmailProps {
  name: string | null
  currentStreak: number
  hoursRemaining: number
  unsubscribeToken?: string
}

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://plantaoecg.com.br'
const logoUrl = 'https://hwgsjpjbyydpittefnjd.supabase.co/storage/v1/object/public/assets/PlantaoECGsemBG-HR.png'

export default function StreakAtRiskEmail({
  name,
  currentStreak,
  hoursRemaining,
  unsubscribeToken,
}: StreakAtRiskEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Seu streak de {currentStreak} dias está em risco! - Plantão ECG</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={headerAlert}>
            <Img
              src={logoUrl}
              alt="Plantão ECG"
              width={160}
              height={40}
              style={logo}
            />
          </Section>

          {/* Alert Banner */}
          <Section style={alertBanner}>
            <Text style={alertText}>STREAK EM RISCO</Text>
          </Section>

          {/* Hero Section */}
          <Section style={heroSection}>
            <Text style={streakNumber}>{currentStreak}</Text>
            <Text style={streakLabel}>dias de streak</Text>
            <Heading style={heading}>
              Não deixe acabar!
            </Heading>
            <Text style={heroText}>
              Olá, {name || 'Doutor(a)'}! Seu streak de {currentStreak} dias
              termina em aproximadamente <strong>{hoursRemaining} horas</strong>.
              Pratique agora para manter sua sequência!
            </Text>
          </Section>

          {/* CTA Button */}
          <Section style={buttonContainer}>
            <Link style={button} href={`${baseUrl}/practice`}>
              Praticar Agora e Manter Streak
            </Link>
          </Section>

          <Hr style={divider} />

          {/* What You'll Lose Section */}
          <Section style={loseSection}>
            <Text style={sectionTitle}>Se o streak zerar, você perde:</Text>
            <Text style={loseText}>
              - Bônus de XP por {currentStreak} dias consecutivos
            </Text>
            <Text style={loseText}>
              - Progresso para conquistas de streak
            </Text>
            <Text style={loseText}>
              - Todo o momentum que você construiu
            </Text>
          </Section>

          {/* Quick Tip */}
          <Section style={tipSection}>
            <Text style={tipTitle}>Dica rápida:</Text>
            <Text style={tipText}>
              Basta completar 1 ECG para manter o streak. Leva menos de 5 minutos!
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

const headerAlert = {
  backgroundColor: '#dc2626',
  padding: '24px',
  textAlign: 'center' as const,
}

const logo = {
  margin: '0 auto',
}

const alertBanner = {
  backgroundColor: '#fef2f2',
  padding: '12px',
  textAlign: 'center' as const,
  borderBottom: '2px solid #fecaca',
}

const alertText = {
  color: '#dc2626',
  fontSize: '14px',
  fontWeight: '700',
  letterSpacing: '2px',
  margin: '0',
}

const heroSection = {
  padding: '40px 40px 20px',
  textAlign: 'center' as const,
}

const streakNumber = {
  color: '#dc2626',
  fontSize: '64px',
  fontWeight: '800',
  margin: '0',
  lineHeight: '1',
}

const streakLabel = {
  color: '#f87171',
  fontSize: '16px',
  fontWeight: '600',
  margin: '4px 0 24px',
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

const buttonContainer = {
  textAlign: 'center' as const,
  padding: '24px 40px 40px',
}

const button = {
  backgroundColor: '#dc2626',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
  boxShadow: '0 2px 4px rgba(220, 38, 38, 0.3)',
}

const divider = {
  borderColor: '#e4e4e7',
  margin: '0 40px',
}

const loseSection = {
  padding: '32px 40px 16px',
}

const sectionTitle = {
  color: '#18181b',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 16px',
}

const loseText = {
  color: '#71717a',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 8px',
}

const tipSection = {
  backgroundColor: '#fef3c7',
  margin: '0 40px 32px',
  padding: '16px 20px',
  borderRadius: '8px',
}

const tipTitle = {
  color: '#92400e',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 4px',
}

const tipText = {
  color: '#a16207',
  fontSize: '14px',
  lineHeight: '20px',
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
