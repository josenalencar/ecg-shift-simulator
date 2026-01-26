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
} from '@react-email/components'

interface SubscriptionCanceledEmailProps {
  name: string
  endDate: string
}

export default function SubscriptionCanceledEmail({
  name,
  endDate,
}: SubscriptionCanceledEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Sua assinatura do Plantao ECG foi cancelada</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Assinatura Cancelada</Heading>

          <Text style={text}>Ola {name || 'colega'},</Text>

          <Text style={text}>
            Lamentamos ver voce partir. Sua assinatura do Plantao ECG foi
            cancelada.
          </Text>

          {endDate && (
            <Section style={highlightBox}>
              <Text style={highlightText}>
                Seu acesso premium continuara ativo ate{' '}
                <strong>{endDate}</strong>.
              </Text>
            </Section>
          )}

          <Text style={text}>
            Apos o termino da assinatura, voce ainda tera acesso a:
          </Text>

          <ul style={list}>
            <li style={listItem}>Casos basicos de ECG para pratica</li>
            <li style={listItem}>Seu historico de progresso</li>
            <li style={listItem}>Seus casos salvos</li>
          </ul>

          <Text style={text}>
            Mudou de ideia? Voce pode assinar novamente a qualquer momento para
            recuperar o acesso a todos os recursos premium.
          </Text>

          <Section style={buttonContainer}>
            <Link style={button} href={`${process.env.NEXT_PUBLIC_SITE_URL}/pricing`}>
              Assinar Novamente
            </Link>
          </Section>

          <Text style={text}>
            Gostaríamos de ouvir sua opiniao. Se tiver um momento, por favor{' '}
            <Link href={`mailto:suporte@plantaoecg.com.br`} style={link}>
              nos conte
            </Link>{' '}
            por que decidiu cancelar.
          </Text>

          <Text style={footer}>
            Atenciosamente,
            <br />
            Equipe Plantao ECG
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  marginBottom: '64px',
  borderRadius: '8px',
  maxWidth: '600px',
}

const heading = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: '600',
  textAlign: 'center' as const,
  margin: '0 0 30px',
}

const text = {
  color: '#484848',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
}

const highlightBox = {
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
  border: '1px solid #fde68a',
}

const highlightText = {
  color: '#92400e',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
  textAlign: 'center' as const,
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
}

const list = {
  color: '#484848',
  fontSize: '16px',
  lineHeight: '26px',
  paddingLeft: '20px',
}

const listItem = {
  marginBottom: '8px',
}

const link = {
  color: '#2563eb',
  textDecoration: 'underline',
}

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '22px',
  marginTop: '32px',
}
