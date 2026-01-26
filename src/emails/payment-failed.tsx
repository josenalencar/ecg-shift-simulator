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

interface PaymentFailedEmailProps {
  name: string
}

export default function PaymentFailedEmail({ name }: PaymentFailedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Acao necessaria: Seu pagamento falhou</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Pagamento Falhou</Heading>

          <Text style={text}>Ola {name || 'colega'},</Text>

          <Text style={text}>
            Nao conseguimos processar seu ultimo pagamento do Plantao ECG. Isso
            pode ter ocorrido devido a um cartao expirado, saldo insuficiente ou
            um problema temporario com sua forma de pagamento.
          </Text>

          <Section style={alertBox}>
            <Text style={alertText}>
              Por favor, atualize sua forma de pagamento para evitar interrupcao
              do seu acesso premium.
            </Text>
          </Section>

          <Section style={buttonContainer}>
            <Link style={button} href={`${process.env.NEXT_PUBLIC_SITE_URL}/settings/billing`}>
              Atualizar Pagamento
            </Link>
          </Section>

          <Text style={text}>Motivos comuns para falha no pagamento:</Text>

          <ul style={list}>
            <li style={listItem}>Cartao de credito ou debito expirado</li>
            <li style={listItem}>Saldo insuficiente na conta</li>
            <li style={listItem}>Transacao recusada pelo emissor do cartao</li>
            <li style={listItem}>Informacoes de cobranca desatualizadas</li>
          </ul>

          <Text style={text}>
            Se voce ja atualizou sua forma de pagamento, por favor ignore este
            email. Tentaremos processar o pagamento automaticamente.
          </Text>

          <Text style={text}>
            Precisa de ajuda? Responda este email ou entre em contato com nosso{' '}
            <Link href={`mailto:suporte@plantaoecg.com.br`} style={link}>
              suporte
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
  color: '#dc2626',
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

const alertBox = {
  backgroundColor: '#fef2f2',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
  border: '1px solid #fecaca',
}

const alertText = {
  color: '#991b1b',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
  textAlign: 'center' as const,
  fontWeight: '500',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#dc2626',
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
