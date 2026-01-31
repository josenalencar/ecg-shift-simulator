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

interface Day3ProgressCheckEmailProps {
  name: string | null
  ecgsCompleted: number
  totalXp: number
  currentLevel: number
  unsubscribeToken?: string
}

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://plantaoecg.com.br'
const logoUrl = 'https://plantaoecg.com.br/logo-email.png'

export default function Day3ProgressCheckEmail({
  name,
  ecgsCompleted,
  totalXp,
  currentLevel,
  unsubscribeToken,
}: Day3ProgressCheckEmailProps) {
  const hasProgress = ecgsCompleted > 0

  return (
    <Html>
      <Head />
      <Preview>Seu progresso em 48 horas no Plantão ECG</Preview>
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
            <Text style={progressBadge}>48 HORAS</Text>
            <Heading style={heading}>
              {hasProgress ? 'Você está indo muito bem!' : 'Vamos começar?'}
            </Heading>
            <Text style={heroText}>
              Olá, {name || 'Doutor(a)'}!{' '}
              {hasProgress
                ? 'Confira seu progresso nos primeiros dias:'
                : 'Ainda não é tarde para começar sua jornada de aprendizado.'}
            </Text>
          </Section>

          {/* Stats Section */}
          {hasProgress && (
            <Section style={statsSection}>
              <Row>
                <Column style={statCol}>
                  <Text style={statValue}>{ecgsCompleted}</Text>
                  <Text style={statLabel}>ECGs</Text>
                </Column>
                <Column style={statCol}>
                  <Text style={statValue}>{totalXp}</Text>
                  <Text style={statLabel}>XP</Text>
                </Column>
                <Column style={statCol}>
                  <Text style={statValue}>{currentLevel}</Text>
                  <Text style={statLabel}>Nível</Text>
                </Column>
              </Row>
            </Section>
          )}

          {/* CTA Button */}
          <Section style={buttonContainer}>
            <Link style={button} href={`${baseUrl}/practice`}>
              {hasProgress ? 'Continuar Praticando' : 'Começar Agora'}
            </Link>
          </Section>

          <Hr style={divider} />

          {/* Tips Section */}
          <Section style={tipsSection}>
            <Text style={sectionTitle}>
              {hasProgress ? 'Continue assim!' : 'Por que começar hoje?'}
            </Text>
            {hasProgress ? (
              <>
                <Text style={tipText}>
                  Você está no caminho certo! Estudos mostram que a consistência
                  é mais importante que a quantidade.
                </Text>
                <Text style={tipText}>
                  Mantenha o ritmo e logo você terá dominado os padrões mais comuns de ECG.
                </Text>
              </>
            ) : (
              <>
                <Text style={tipText}>
                  87% dos médicos que começam a praticar nos primeiros 3 dias
                  continuam usando a plataforma regularmente.
                </Text>
                <Text style={tipText}>
                  Não perca a oportunidade de fazer parte desse grupo!
                </Text>
              </>
            )}
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

const progressBadge = {
  backgroundColor: '#dbeafe',
  color: '#1e40af',
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

const statsSection = {
  backgroundColor: '#f9fafb',
  padding: '24px 40px',
  margin: '20px 0',
}

const statCol = {
  textAlign: 'center' as const,
  width: '33.33%',
}

const statValue = {
  color: '#2563eb',
  fontSize: '32px',
  fontWeight: '800',
  margin: '0 0 4px',
}

const statLabel = {
  color: '#71717a',
  fontSize: '13px',
  fontWeight: '500',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  padding: '20px 40px 40px',
}

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
  boxShadow: '0 2px 4px rgba(37, 99, 235, 0.3)',
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
  margin: '0 0 12px',
}

const tipText = {
  color: '#71717a',
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
