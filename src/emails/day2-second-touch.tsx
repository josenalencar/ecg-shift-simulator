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

interface Day2SecondTouchEmailProps {
  name: string | null
  unsubscribeToken?: string
}

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://plantaoecg.com.br'
const logoUrl = 'https://plantaoecg.com.br/logo-email.png'

export default function Day2SecondTouchEmail({
  name,
  unsubscribeToken,
}: Day2SecondTouchEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Seu próximo plantão está esperando - 3 ECGs selecionados para você!</Preview>
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
            <Heading style={heading}>
              Olá, {name || 'Doutor(a)'}!
            </Heading>
            <Text style={heroText}>
              Notamos que você ainda não começou a praticar. Preparamos 3 ECGs
              especiais para você iniciar sua jornada de aprendizado.
            </Text>
          </Section>

          {/* Feature Box */}
          <Section style={featureBox}>
            <Text style={featureTitle}>O que preparamos para você:</Text>
            <Text style={featureItem}>- 3 ECGs de dificuldade fácil para começar</Text>
            <Text style={featureItem}>- Feedback detalhado em cada caso</Text>
            <Text style={featureItem}>- XP bônus para novos usuários</Text>
          </Section>

          {/* CTA Button */}
          <Section style={buttonContainer}>
            <Link style={button} href={`${baseUrl}/practice`}>
              Começar Agora
            </Link>
          </Section>

          <Hr style={divider} />

          {/* Why Practice Section */}
          <Section style={whySection}>
            <Text style={sectionTitle}>Por que praticar regularmente?</Text>
            <Text style={whyText}>
              Estudos mostram que a prática regular de interpretação de ECG
              aumenta significativamente a acurácia diagnóstica. Com apenas
              10-15 minutos por dia, você pode aprimorar suas habilidades
              e se sentir mais confiante no plantão.
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
  backgroundColor: '#eff6ff',
  margin: '20px 40px',
  padding: '24px',
  borderRadius: '12px',
}

const featureTitle = {
  color: '#1e40af',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 12px',
}

const featureItem = {
  color: '#3b82f6',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 6px',
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

const whySection = {
  padding: '32px 40px',
}

const sectionTitle = {
  color: '#18181b',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 12px',
}

const whyText = {
  color: '#71717a',
  fontSize: '15px',
  lineHeight: '24px',
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
