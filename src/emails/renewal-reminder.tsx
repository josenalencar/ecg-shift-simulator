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

interface RenewalReminderEmailProps {
  name: string | null
  plan: 'premium' | 'ai'
  amount: string
  renewalDate: string
}

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://plantaoecg.com.br'
const logoUrl = 'https://plantaoecg.com.br/logo-email.png'

export default function RenewalReminderEmail({
  name,
  plan,
  amount,
  renewalDate,
}: RenewalReminderEmailProps) {
  const planName = plan === 'ai' ? 'Premium + IA' : 'Premium'
  const planColor = plan === 'ai' ? '#7c3aed' : '#2563eb'
  const planBgColor = plan === 'ai' ? '#f3e8ff' : '#dbeafe'

  return (
    <Html>
      <Head />
      <Preview>Sua assinatura {planName} será renovada em {renewalDate}</Preview>
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
            <Text style={iconBadge}>🔔</Text>
            <Heading style={heading}>
              Lembrete de Renovação
            </Heading>
            <Text style={heroText}>
              Olá{name ? `, ${name}` : ''}!
            </Text>
            <Text style={heroText}>
              Este é um lembrete de que sua assinatura do Plantão de ECG será renovada automaticamente.
            </Text>
          </Section>

          {/* Plan Details Box */}
          <Section style={detailsSection}>
            <div style={{
              ...detailsBox,
              borderColor: planColor,
            }}>
              <Text style={{
                ...planBadge,
                backgroundColor: planBgColor,
                color: planColor,
              }}>
                {planName}
              </Text>

              <div style={detailsGrid}>
                <div style={detailItem}>
                  <Text style={detailLabel}>Próxima cobrança</Text>
                  <Text style={detailValue}>{renewalDate}</Text>
                </div>
                <div style={detailItem}>
                  <Text style={detailLabel}>Valor</Text>
                  <Text style={detailValue}>{amount}</Text>
                </div>
              </div>
            </div>
          </Section>

          {/* Info Section */}
          <Section style={infoSection}>
            <Text style={infoIcon}>✅</Text>
            <Text style={infoTitle}>Sua experiência continuará sem interrupções</Text>
            <Text style={infoText}>
              Não é necessária nenhuma ação da sua parte. A cobrança será feita automaticamente
              no cartão cadastrado e você continuará tendo acesso a todos os recursos {planName}.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Manage Subscription */}
          <Section style={manageSection}>
            <Text style={manageTitle}>Precisa fazer alterações?</Text>
            <Text style={manageText}>
              Você pode gerenciar sua assinatura, atualizar o método de pagamento ou
              cancelar a qualquer momento antes da data de renovação.
            </Text>
            <Link style={manageButton} href={`${baseUrl}/settings`}>
              Gerenciar Assinatura
            </Link>
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

const detailsSection = {
  padding: '0 40px 32px',
}

const detailsBox = {
  border: '2px solid',
  borderRadius: '12px',
  padding: '24px',
  textAlign: 'center' as const,
}

const planBadge = {
  fontSize: '14px',
  fontWeight: '700',
  padding: '8px 20px',
  borderRadius: '20px',
  display: 'inline-block',
  margin: '0 0 20px',
}

const detailsGrid = {
  display: 'flex',
  justifyContent: 'center',
  gap: '40px',
}

const detailItem = {
  textAlign: 'center' as const,
}

const detailLabel = {
  color: '#71717a',
  fontSize: '13px',
  fontWeight: '500',
  margin: '0 0 4px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

const detailValue = {
  color: '#18181b',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0',
}

const infoSection = {
  backgroundColor: '#ecfdf5',
  padding: '24px 40px',
  textAlign: 'center' as const,
}

const infoIcon = {
  fontSize: '24px',
  margin: '0 0 8px',
}

const infoTitle = {
  color: '#065f46',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 8px',
}

const infoText = {
  color: '#047857',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
}

const divider = {
  borderColor: '#e4e4e7',
  margin: '0 40px',
}

const manageSection = {
  padding: '32px 40px',
  textAlign: 'center' as const,
}

const manageTitle = {
  color: '#18181b',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 12px',
}

const manageText = {
  color: '#71717a',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 20px',
}

const manageButton = {
  backgroundColor: '#ffffff',
  border: '2px solid #e4e4e7',
  borderRadius: '8px',
  color: '#18181b',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  display: 'inline-block',
  padding: '12px 24px',
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
