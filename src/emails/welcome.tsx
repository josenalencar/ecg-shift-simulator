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

interface WelcomeEmailProps {
  name: string
}

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://plantaoecg.com.br'

export default function WelcomeEmail({ name }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Bem-vindo ao Plantao ECG - Sua jornada de aprendizado comeca agora!</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src={`${baseUrl}/logo.png`}
              alt="Plantão ECG"
              width={160}
              height={40}
              style={logo}
            />
          </Section>

          {/* Hero Section */}
          <Section style={heroSection}>
            <Text style={welcomeBadge}>BEM-VINDO!</Text>
            <Heading style={heading}>
              Ola, {name || 'Doutor(a)'}!
            </Heading>
            <Text style={heroText}>
              Sua conta foi criada com sucesso. Estamos muito felizes em ter voce
              na nossa comunidade de profissionais dedicados a excelencia em
              interpretacao de ECG.
            </Text>
          </Section>

          {/* CTA Button */}
          <Section style={buttonContainer}>
            <Link style={button} href={`${baseUrl}/dashboard`}>
              Comecar a Praticar Agora
            </Link>
          </Section>

          <Hr style={divider} />

          {/* Features Section */}
          <Section style={featuresSection}>
            <Text style={sectionTitle}>O que voce pode fazer:</Text>

            <Row style={featureRow}>
              <Column style={featureIconCol}>
                <Text style={featureIcon}>&#128200;</Text>
              </Column>
              <Column style={featureTextCol}>
                <Text style={featureTitle}>Pratique com Casos Reais</Text>
                <Text style={featureDesc}>
                  Acesse casos de ECG baseados em cenarios clinicos reais de plantao
                </Text>
              </Column>
            </Row>

            <Row style={featureRow}>
              <Column style={featureIconCol}>
                <Text style={featureIcon}>&#127942;</Text>
              </Column>
              <Column style={featureTextCol}>
                <Text style={featureTitle}>Acompanhe seu Progresso</Text>
                <Text style={featureDesc}>
                  Veja suas estatisticas, pontuacao e evolucao ao longo do tempo
                </Text>
              </Column>
            </Row>

            <Row style={featureRow}>
              <Column style={featureIconCol}>
                <Text style={featureIcon}>&#128218;</Text>
              </Column>
              <Column style={featureTextCol}>
                <Text style={featureTitle}>Aprenda com Feedback</Text>
                <Text style={featureDesc}>
                  Receba explicacoes detalhadas sobre cada diagnostico
                </Text>
              </Column>
            </Row>
          </Section>

          <Hr style={divider} />

          {/* Upgrade CTA */}
          <Section style={upgradeSection}>
            <Text style={upgradeTitle}>Quer ir alem?</Text>
            <Text style={upgradeText}>
              Com o plano <strong>Premium</strong>, voce tem acesso ilimitado a todos os
              casos, niveis avancados de dificuldade e analise com Inteligencia Artificial.
            </Text>
            <Link style={upgradeLink} href={`${baseUrl}/pricing`}>
              Conhecer planos Premium →
            </Link>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Plantao ECG - Treinamento em interpretacao de ECG
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

const welcomeBadge = {
  backgroundColor: '#dbeafe',
  color: '#1e40af',
  fontSize: '12px',
  fontWeight: '700',
  letterSpacing: '1px',
  padding: '6px 16px',
  borderRadius: '20px',
  display: 'inline-block',
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

const featuresSection = {
  padding: '32px 40px',
}

const sectionTitle = {
  color: '#18181b',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 24px',
}

const featureRow = {
  marginBottom: '20px',
}

const featureIconCol = {
  width: '48px',
  verticalAlign: 'top' as const,
}

const featureTextCol = {
  verticalAlign: 'top' as const,
  paddingLeft: '12px',
}

const featureIcon = {
  fontSize: '24px',
  margin: '0',
}

const featureTitle = {
  color: '#18181b',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 4px',
}

const featureDesc = {
  color: '#71717a',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
}

const upgradeSection = {
  backgroundColor: '#faf5ff',
  padding: '32px 40px',
  textAlign: 'center' as const,
}

const upgradeTitle = {
  color: '#7c3aed',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 12px',
}

const upgradeText = {
  color: '#52525b',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 16px',
}

const upgradeLink = {
  color: '#7c3aed',
  fontSize: '15px',
  fontWeight: '600',
  textDecoration: 'none',
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
