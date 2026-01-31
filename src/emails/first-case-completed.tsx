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

interface FirstCaseCompletedEmailProps {
  name: string | null
  score: number
  difficulty: 'easy' | 'medium' | 'hard'
  xpEarned: number
  unsubscribeToken?: string
}

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://plantaoecg.com.br'
const logoUrl = 'https://hwgsjpjbyydpittefnjd.supabase.co/storage/v1/object/public/assets/PlantaoECGsemBG-HR.png'

const difficultyLabels = {
  easy: 'Fácil',
  medium: 'Médio',
  hard: 'Difícil',
}

export default function FirstCaseCompletedEmail({
  name,
  score,
  difficulty,
  xpEarned,
  unsubscribeToken,
}: FirstCaseCompletedEmailProps) {
  const isPerfect = score === 100
  const scoreColor = score >= 80 ? '#059669' : score >= 60 ? '#f59e0b' : '#dc2626'

  return (
    <Html>
      <Head />
      <Preview>Parabéns! Você completou seu primeiro ECG no Plantão ECG!</Preview>
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
            <Text style={celebrationBadge}>
              {isPerfect ? 'PERFEITO!' : 'PRIMEIRO ECG!'}
            </Text>
            <Heading style={heading}>
              Parabéns, {name || 'Doutor(a)'}!
            </Heading>
            <Text style={heroText}>
              Você acabou de completar seu primeiro ECG no Plantão ECG.
              Este é o primeiro passo na sua jornada para dominar a interpretação de eletrocardiogramas!
            </Text>
          </Section>

          {/* Score Card */}
          <Section style={scoreSection}>
            <Text style={scoreLabel}>Sua pontuação:</Text>
            <Text style={{ ...scoreValue, color: scoreColor }}>{score}%</Text>
            <Text style={difficultyText}>
              Dificuldade: {difficultyLabels[difficulty]}
            </Text>
            <Text style={xpText}>+{xpEarned} XP ganhos!</Text>
          </Section>

          {/* CTA Button */}
          <Section style={buttonContainer}>
            <Link style={button} href={`${baseUrl}/practice`}>
              Praticar Mais ECGs
            </Link>
          </Section>

          <Hr style={divider} />

          {/* Tips Section */}
          <Section style={tipsSection}>
            <Text style={sectionTitle}>Dicas para continuar evoluindo:</Text>
            <Text style={tipText}>
              - Pratique pelo menos 3 ECGs por dia para criar o hábito
            </Text>
            <Text style={tipText}>
              - Mantenha um streak diário para ganhar bônus de XP
            </Text>
            <Text style={tipText}>
              - Tente aumentar a dificuldade gradualmente
            </Text>
            <Text style={tipText}>
              - Revise seus erros para aprender com eles
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

const celebrationBadge = {
  backgroundColor: '#dcfce7',
  color: '#059669',
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

const scoreSection = {
  backgroundColor: '#f9fafb',
  padding: '24px 40px',
  textAlign: 'center' as const,
}

const scoreLabel = {
  color: '#71717a',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

const scoreValue = {
  fontSize: '48px',
  fontWeight: '800',
  margin: '0 0 8px',
}

const difficultyText = {
  color: '#71717a',
  fontSize: '14px',
  margin: '0 0 4px',
}

const xpText = {
  color: '#2563eb',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  padding: '30px 40px',
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

const tipsSection = {
  padding: '32px 40px',
}

const sectionTitle = {
  color: '#18181b',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 16px',
}

const tipText = {
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
