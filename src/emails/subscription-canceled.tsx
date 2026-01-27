import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Hr,
  Row,
  Column,
} from '@react-email/components'

interface SubscriptionCanceledEmailProps {
  name: string
  endDate: string
}

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://plantaoecg.com.br'

export default function SubscriptionCanceledEmail({
  name,
  endDate,
}: SubscriptionCanceledEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Sua assinatura foi cancelada - Voce ainda pode usar ate {endDate}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logoText}>
              <span style={logoIcon}>&#9829;</span> Plantao ECG
            </Text>
          </Section>

          {/* Main Content */}
          <Section style={mainSection}>
            <Text style={sadIcon}>&#128532;</Text>
            <Heading style={heading}>
              Assinatura Cancelada
            </Heading>
            <Text style={heroText}>
              Ola, {name || 'Doutor(a)'}. Recebemos seu pedido de cancelamento da
              assinatura Premium do Plantao ECG.
            </Text>
          </Section>

          {/* Info Box */}
          <Section style={infoBox}>
            <Row>
              <Column style={infoIconCol}>
                <Text style={infoIcon}>&#128197;</Text>
              </Column>
              <Column style={infoTextCol}>
                <Text style={infoTitle}>Acesso ate:</Text>
                <Text style={infoValue}>{endDate}</Text>
                <Text style={infoDesc}>
                  Voce ainda pode usar todos os recursos Premium ate esta data.
                </Text>
              </Column>
            </Row>
          </Section>

          <Hr style={divider} />

          {/* What you'll miss section */}
          <Section style={missSection}>
            <Text style={sectionTitle}>O que voce perdera apos {endDate}:</Text>

            <Row style={missRow}>
              <Column style={missIconCol}>
                <Text style={missIcon}>&#10060;</Text>
              </Column>
              <Column style={missTextCol}>
                <Text style={missText}>Acesso a casos ilimitados de ECG</Text>
              </Column>
            </Row>

            <Row style={missRow}>
              <Column style={missIconCol}>
                <Text style={missIcon}>&#10060;</Text>
              </Column>
              <Column style={missTextCol}>
                <Text style={missText}>Niveis avancados de dificuldade</Text>
              </Column>
            </Row>

            <Row style={missRow}>
              <Column style={missIconCol}>
                <Text style={missIcon}>&#10060;</Text>
              </Column>
              <Column style={missTextCol}>
                <Text style={missText}>Estatisticas detalhadas de desempenho</Text>
              </Column>
            </Row>

            <Row style={missRow}>
              <Column style={missIconCol}>
                <Text style={missIcon}>&#10060;</Text>
              </Column>
              <Column style={missTextCol}>
                <Text style={missText}>Analise com Inteligencia Artificial</Text>
              </Column>
            </Row>
          </Section>

          <Hr style={divider} />

          {/* Win-back section */}
          <Section style={winbackSection}>
            <Text style={winbackTitle}>&#128161; Mudou de ideia?</Text>
            <Text style={winbackText}>
              Voce pode reativar sua assinatura a qualquer momento e continuar
              de onde parou. Seu progresso e estatisticas serao mantidos.
            </Text>
            <Link style={button} href={`${baseUrl}/pricing`}>
              Reativar Assinatura
            </Link>
          </Section>

          {/* Feedback section */}
          <Section style={feedbackSection}>
            <Text style={feedbackTitle}>Nos ajude a melhorar</Text>
            <Text style={feedbackText}>
              Se tiver um momento, adorariamos saber o motivo do cancelamento
              para podermos melhorar nosso servico. Responda este email com
              seu feedback - lemos todas as mensagens!
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Obrigado por ter feito parte da nossa comunidade.
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
  backgroundColor: '#71717a',
  padding: '24px',
  textAlign: 'center' as const,
}

const logoText = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0',
}

const logoIcon = {
  color: '#fecaca',
  marginRight: '8px',
}

const mainSection = {
  padding: '40px 40px 20px',
  textAlign: 'center' as const,
}

const sadIcon = {
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

const infoBox = {
  backgroundColor: '#fef3c7',
  margin: '24px 40px',
  padding: '20px',
  borderRadius: '12px',
  border: '1px solid #fcd34d',
}

const infoIconCol = {
  width: '48px',
  verticalAlign: 'top' as const,
}

const infoTextCol = {
  verticalAlign: 'top' as const,
  paddingLeft: '12px',
}

const infoIcon = {
  fontSize: '32px',
  margin: '0',
}

const infoTitle = {
  color: '#92400e',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 4px',
}

const infoValue = {
  color: '#92400e',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0 0 8px',
}

const infoDesc = {
  color: '#a16207',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
}

const divider = {
  borderColor: '#e4e4e7',
  margin: '0 40px',
}

const missSection = {
  padding: '32px 40px',
}

const sectionTitle = {
  color: '#18181b',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 20px',
}

const missRow = {
  marginBottom: '12px',
}

const missIconCol = {
  width: '28px',
  verticalAlign: 'middle' as const,
}

const missTextCol = {
  verticalAlign: 'middle' as const,
}

const missIcon = {
  fontSize: '14px',
  margin: '0',
}

const missText = {
  color: '#71717a',
  fontSize: '15px',
  margin: '0',
}

const winbackSection = {
  backgroundColor: '#eff6ff',
  padding: '32px 40px',
  textAlign: 'center' as const,
}

const winbackTitle = {
  color: '#1e40af',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 12px',
}

const winbackText = {
  color: '#3b82f6',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 20px',
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
}

const feedbackSection = {
  padding: '32px 40px',
  textAlign: 'center' as const,
}

const feedbackTitle = {
  color: '#18181b',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 8px',
}

const feedbackText = {
  color: '#71717a',
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
