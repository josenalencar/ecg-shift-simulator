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

interface PaymentFailedEmailProps {
  name: string
}

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://plantaoecg.com.br'
const logoUrl = 'https://plantaoecg.com.br/logo-email.png'

export default function PaymentFailedEmail({ name }: PaymentFailedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Ação necessária: Seu pagamento falhou - Atualize seu método de pagamento</Preview>
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

          {/* Alert Banner */}
          <Section style={alertBanner}>
            <Text style={alertTitle}>Ação Necessária</Text>
          </Section>

          {/* Main Content */}
          <Section style={mainSection}>
            <Heading style={heading}>
              Pagamento Não Processado
            </Heading>
            <Text style={heroText}>
              Olá, {name || 'Doutor(a)'}. Não conseguimos processar seu último
              pagamento da assinatura Premium do Plantão ECG.
            </Text>
          </Section>

          {/* CTA Button */}
          <Section style={buttonContainer}>
            <Link style={button} href={`${baseUrl}/plano`}>
              Atualizar Forma de Pagamento
            </Link>
          </Section>

          {/* Warning Box */}
          <Section style={warningBox}>
            <Text style={warningText}>
              <strong>Importante:</strong> Seu acesso Premium será suspenso se o
              pagamento não for regularizado em breve.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Reasons Section */}
          <Section style={reasonsSection}>
            <Text style={sectionTitle}>Possíveis motivos da falha:</Text>

            <Row style={reasonRow}>
              <Column style={reasonTextCol}>
                <Text style={reasonText}>- Cartão de crédito expirado</Text>
              </Column>
            </Row>

            <Row style={reasonRow}>
              <Column style={reasonTextCol}>
                <Text style={reasonText}>- Saldo ou limite insuficiente</Text>
              </Column>
            </Row>

            <Row style={reasonRow}>
              <Column style={reasonTextCol}>
                <Text style={reasonText}>- Transação bloqueada pelo banco</Text>
              </Column>
            </Row>

            <Row style={reasonRow}>
              <Column style={reasonTextCol}>
                <Text style={reasonText}>- Dados de cobrança desatualizados</Text>
              </Column>
            </Row>
          </Section>

          <Hr style={divider} />

          {/* Help Section */}
          <Section style={helpSection}>
            <Text style={helpTitle}>Precisa de ajuda?</Text>
            <Text style={helpText}>
              Se você já atualizou sua forma de pagamento, por favor ignore este
              email. Tentaremos processar o pagamento automaticamente.
            </Text>
            <Text style={helpText}>
              Se o problema persistir, entre em contato com nosso suporte
              respondendo este email ou escrevendo para{' '}
              <Link href="mailto:suporte@plantaoecg.com.br" style={helpLink}>
                suporte@plantaoecg.com.br
              </Link>
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

const alertBanner = {
  backgroundColor: '#fef2f2',
  padding: '16px',
  textAlign: 'center' as const,
  borderBottom: '2px solid #fecaca',
}

const alertIcon = {
  fontSize: '32px',
  margin: '0 0 8px',
}

const alertTitle = {
  color: '#dc2626',
  fontSize: '14px',
  fontWeight: '700',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  margin: '0',
}

const mainSection = {
  padding: '40px 40px 20px',
  textAlign: 'center' as const,
}

const heading = {
  color: '#18181b',
  fontSize: '26px',
  fontWeight: '700',
  lineHeight: '34px',
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
  padding: '12px 40px 32px',
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

const warningBox = {
  backgroundColor: '#fef3c7',
  margin: '0 40px 32px',
  padding: '16px 20px',
  borderRadius: '8px',
  border: '1px solid #fcd34d',
}

const warningText = {
  color: '#92400e',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
  textAlign: 'center' as const,
}

const divider = {
  borderColor: '#e4e4e7',
  margin: '0 40px',
}

const reasonsSection = {
  padding: '32px 40px',
}

const sectionTitle = {
  color: '#18181b',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 20px',
}

const reasonRow = {
  marginBottom: '14px',
}

const reasonIconCol = {
  width: '32px',
  verticalAlign: 'middle' as const,
}

const reasonTextCol = {
  verticalAlign: 'middle' as const,
}

const reasonIcon = {
  fontSize: '18px',
  margin: '0',
}

const reasonText = {
  color: '#52525b',
  fontSize: '15px',
  margin: '0',
}

const helpSection = {
  backgroundColor: '#f9fafb',
  padding: '32px 40px',
}

const helpTitle = {
  color: '#18181b',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 12px',
}

const helpText = {
  color: '#71717a',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 12px',
}

const helpLink = {
  color: '#2563eb',
  textDecoration: 'underline',
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
