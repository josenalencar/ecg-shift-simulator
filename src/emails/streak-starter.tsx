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

interface StreakStarterEmailProps {
  name: string | null
  previousBestStreak: number
  unsubscribeToken?: string
}

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://plantaoecg.com.br'
const logoUrl = 'https://plantaoecg.com.br/logo-email.png'

export default function StreakStarterEmail({
  name,
  previousBestStreak,
  unsubscribeToken,
}: StreakStarterEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Volte hoje e inicie um novo streak no Plantão ECG!</Preview>
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
            <Text style={fireEmoji}>🔥</Text>
            <Heading style={heading}>
              Hora de um novo começo!
            </Heading>
            <Text style={heroText}>
              Olá, {name || 'Doutor(a)'}! Sentimos sua falta.
              Seu melhor streak foi de <strong>{previousBestStreak} dias</strong>.
              Que tal bater esse recorde?
            </Text>
          </Section>

          {/* Motivation Box */}
          <Section style={motivationBox}>
            <Text style={motivationTitle}>O streak voltou a zero...</Text>
            <Text style={motivationText}>
              Mas isso não é o fim! Cada novo streak é uma oportunidade de
              superar seus limites. Comece hoje e surpreenda-se com o quão
              longe você pode ir.
            </Text>
          </Section>

          {/* CTA Button */}
          <Section style={buttonContainer}>
            <Link style={button} href={`${baseUrl}/practice`}>
              Começar Novo Streak Agora
            </Link>
          </Section>

          <Hr style={divider} />

          {/* Benefits Section */}
          <Section style={benefitsSection}>
            <Text style={sectionTitle}>Por que manter o streak?</Text>
            <Text style={benefitText}>
              - Bônus de XP que aumenta a cada dia consecutivo
            </Text>
            <Text style={benefitText}>
              - Conquistas exclusivas para streaks longos
            </Text>
            <Text style={benefitText}>
              - Melhora comprovada na retenção do aprendizado
            </Text>
            <Text style={benefitText}>
              - Disciplina que se transfere para a vida profissional
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

const fireEmoji = {
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

const motivationBox = {
  backgroundColor: '#fff7ed',
  margin: '20px 40px',
  padding: '24px',
  borderRadius: '12px',
  border: '2px solid #fed7aa',
}

const motivationTitle = {
  color: '#c2410c',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 8px',
}

const motivationText = {
  color: '#ea580c',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  padding: '20px 40px 40px',
}

const button = {
  backgroundColor: '#ea580c',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
  boxShadow: '0 2px 4px rgba(234, 88, 12, 0.3)',
}

const divider = {
  borderColor: '#e4e4e7',
  margin: '0 40px',
}

const benefitsSection = {
  padding: '32px 40px',
}

const sectionTitle = {
  color: '#18181b',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 16px',
}

const benefitText = {
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
