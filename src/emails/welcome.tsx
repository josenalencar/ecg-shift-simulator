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

interface WelcomeEmailProps {
  name: string
}

export default function WelcomeEmail({ name }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Bem-vindo ao Plantao ECG - Comece a praticar hoje!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Bem-vindo ao Plantao ECG!</Heading>

          <Text style={text}>Ola {name || 'colega'},</Text>

          <Text style={text}>
            Obrigado por se cadastrar no Plantao ECG! Estamos muito felizes em
            ter voce conosco.
          </Text>

          <Text style={text}>
            Nossa plataforma ajuda voce a praticar interpretacao de ECG em
            cenarios clinicos realistas, melhorando suas habilidades
            diagnosticas atraves de aprendizado interativo.
          </Text>

          <Section style={buttonContainer}>
            <Link style={button} href={`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`}>
              Comecar a Praticar
            </Link>
          </Section>

          <Text style={text}>
            Veja o que voce pode fazer com sua conta gratuita:
          </Text>

          <ul style={list}>
            <li style={listItem}>Acesso a casos basicos de ECG para pratica</li>
            <li style={listItem}>Acompanhe seu progresso e precisao</li>
            <li style={listItem}>Aprenda com explicacoes detalhadas</li>
          </ul>

          <Text style={text}>
            Quer acesso ilimitado a todos os casos e analise com IA?{' '}
            <Link href={`${process.env.NEXT_PUBLIC_SITE_URL}/pricing`} style={link}>
              Assine o Premium
            </Link>
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
