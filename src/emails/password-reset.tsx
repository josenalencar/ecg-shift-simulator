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

interface PasswordResetEmailProps {
  name: string | null
  resetLink: string
}

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://plantaoecg.com.br'
const logoUrl = 'https://plantaoecg.com.br/logo-email.png'

export default function PasswordResetEmail({ name, resetLink }: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Redefinir sua senha - Plantão de ECG</Preview>
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
            <Text style={iconBadge}>🔐</Text>
            <Heading style={heading}>
              Redefinir sua senha
            </Heading>
            <Text style={heroText}>
              Olá{name ? `, ${name}` : ''}!
            </Text>
            <Text style={heroText}>
              Recebemos uma solicitação para redefinir a senha da sua conta no Plantão de ECG.
              Clique no botão abaixo para criar uma nova senha.
            </Text>
          </Section>

          {/* CTA Button */}
          <Section style={buttonContainer}>
            <Link style={button} href={resetLink}>
              Redefinir Minha Senha
            </Link>
          </Section>

          {/* Warning Box */}
          <Section style={warningSection}>
            <Text style={warningIcon}>⏰</Text>
            <Text style={warningText}>
              Este link expira em <strong>1 hora</strong>.
            </Text>
            <Text style={warningText}>
              Após esse período, você precisará solicitar um novo link.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Security Notice */}
          <Section style={securitySection}>
            <Text style={securityTitle}>🛡️ Aviso de segurança</Text>
            <Text style={securityText}>
              Se você não solicitou a redefinição de senha, ignore este email.
              Sua senha permanecerá a mesma e nenhuma alteração será feita na sua conta.
            </Text>
            <Text style={securityText}>
              Se você suspeita que alguém está tentando acessar sua conta indevidamente,
              entre em contato conosco imediatamente.
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

const iconBadge = {
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
  margin: '0 0 12px',
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

const warningSection = {
  backgroundColor: '#fef3c7',
  padding: '20px 40px',
  textAlign: 'center' as const,
}

const warningIcon = {
  fontSize: '24px',
  margin: '0 0 8px',
}

const warningText = {
  color: '#92400e',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 4px',
}

const divider = {
  borderColor: '#e4e4e7',
  margin: '0 40px',
}

const securitySection = {
  padding: '32px 40px',
}

const securityTitle = {
  color: '#18181b',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 12px',
}

const securityText = {
  color: '#71717a',
  fontSize: '14px',
  lineHeight: '22px',
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

const copyright = {
  color: '#a1a1aa',
  fontSize: '12px',
  margin: '0',
}
