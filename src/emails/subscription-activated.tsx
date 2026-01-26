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

interface SubscriptionActivatedEmailProps {
  name: string
  plan: string
}

export default function SubscriptionActivatedEmail({
  name,
  plan,
}: SubscriptionActivatedEmailProps) {
  const planDisplay = plan === 'ai' ? 'Premium + IA' : 'Premium'

  return (
    <Html>
      <Head />
      <Preview>Sua assinatura {planDisplay} esta ativa!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Assinatura Ativada!</Heading>

          <Text style={text}>Ola {name || 'colega'},</Text>

          <Text style={text}>
            Otimas noticias! Sua assinatura <strong>{planDisplay}</strong> do
            Plantao ECG esta ativa.
          </Text>

          <Section style={highlightBox}>
            <Text style={highlightText}>
              Plano: <strong>{planDisplay}</strong>
            </Text>
            <Text style={highlightText}>Status: Ativo</Text>
          </Section>

          <Text style={text}>Agora voce tem acesso a:</Text>

          <ul style={list}>
            <li style={listItem}>Casos ilimitados de ECG para pratica</li>
            <li style={listItem}>Niveis avancados de dificuldade</li>
            <li style={listItem}>Analise detalhada de desempenho</li>
            {plan === 'ai' && (
              <>
                <li style={listItem}>Analise de ECG com Inteligencia Artificial</li>
                <li style={listItem}>Recomendacoes personalizadas de aprendizado</li>
              </>
            )}
          </ul>

          <Section style={buttonContainer}>
            <Link style={button} href={`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`}>
              Comecar a Praticar
            </Link>
          </Section>

          <Text style={text}>
            Precisa de ajuda? Responda este email ou visite nossa{' '}
            <Link href={`${process.env.NEXT_PUBLIC_SITE_URL}/help`} style={link}>
              central de ajuda
            </Link>
            .
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
  color: '#16a34a',
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
  backgroundColor: '#f0fdf4',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
  border: '1px solid #bbf7d0',
}

const highlightText = {
  color: '#166534',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '4px 0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#16a34a',
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
