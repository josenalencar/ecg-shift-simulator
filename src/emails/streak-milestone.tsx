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

interface StreakMilestoneEmailProps {
  name: string | null
  streakDays: number
  nextMilestone: number | null
  xpBonus: number
  unsubscribeToken?: string
}

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://plantaoecg.com.br'
const logoUrl = 'https://hwgsjpjbyydpittefnjd.supabase.co/storage/v1/object/public/assets/PlantaoECGsemBG-HR.png'

export default function StreakMilestoneEmail({
  name,
  streakDays,
  nextMilestone,
  xpBonus,
  unsubscribeToken,
}: StreakMilestoneEmailProps) {
  const getMilestoneMessage = (days: number) => {
    if (days >= 100) return 'Você é uma lenda!'
    if (days >= 60) return 'Incrível dedicação!'
    if (days >= 30) return 'Um mês inteiro!'
    if (days >= 14) return 'Duas semanas de foco!'
    return 'Primeira semana concluída!'
  }

  return (
    <Html>
      <Head />
      <Preview>{`${streakDays} DIAS! Você está entre os mais dedicados - Plantão ECG`}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={headerCelebration}>
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
            <Text style={fireEmoji}>🔥</Text>
            <Text style={streakNumber}>{streakDays}</Text>
            <Text style={streakLabel}>DIAS DE STREAK</Text>
            <Heading style={heading}>
              {getMilestoneMessage(streakDays)}
            </Heading>
            <Text style={heroText}>
              Parabéns, {name || 'Doutor(a)'}! Você está entre os usuários mais
              dedicados do Plantão ECG. Sua consistência é inspiradora!
            </Text>
          </Section>

          {/* XP Bonus */}
          <Section style={xpSection}>
            <Text style={xpLabel}>Bônus de XP desbloqueado:</Text>
            <Text style={xpValue}>+{xpBonus} XP</Text>
          </Section>

          {/* CTA Button */}
          <Section style={buttonContainer}>
            <Link style={button} href={`${baseUrl}/progress`}>
              Ver Conquistas
            </Link>
          </Section>

          <Hr style={divider} />

          {/* Next Milestone */}
          {nextMilestone && (
            <Section style={nextSection}>
              <Text style={sectionTitle}>Próximo marco: {nextMilestone} dias</Text>
              <Text style={nextText}>
                Continue praticando diariamente e você chegará lá!
                Faltam apenas {nextMilestone - streakDays} dias.
              </Text>
            </Section>
          )}

          {/* Motivation */}
          <Section style={motivationSection}>
            <Text style={motivationText}>
              &ldquo;A excelência não é um ato, mas um hábito.&rdquo; - Aristóteles
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

const headerCelebration = {
  backgroundColor: '#ea580c',
  padding: '24px',
  textAlign: 'center' as const,
}

const logo = {
  margin: '0 auto',
}

const heroSection = {
  padding: '40px 40px 20px',
  textAlign: 'center' as const,
  background: 'linear-gradient(180deg, #fff7ed 0%, #ffffff 100%)',
}

const fireEmoji = {
  fontSize: '48px',
  margin: '0 0 8px',
}

const streakNumber = {
  color: '#ea580c',
  fontSize: '72px',
  fontWeight: '800',
  margin: '0',
  lineHeight: '1',
}

const streakLabel = {
  color: '#fb923c',
  fontSize: '14px',
  fontWeight: '700',
  letterSpacing: '2px',
  margin: '4px 0 24px',
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

const xpSection = {
  backgroundColor: '#fef3c7',
  padding: '20px',
  margin: '20px 40px',
  borderRadius: '12px',
  textAlign: 'center' as const,
  border: '2px solid #fcd34d',
}

const xpLabel = {
  color: '#92400e',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0 0 4px',
}

const xpValue = {
  color: '#b45309',
  fontSize: '28px',
  fontWeight: '800',
  margin: '0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  padding: '20px 40px 40px',
}

const button = {
  backgroundColor: '#ea580c',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
  boxShadow: '0 2px 4px rgba(234, 88, 12, 0.3)',
}

const divider = {
  borderColor: '#e4e4e7',
  margin: '0 40px',
}

const nextSection = {
  padding: '32px 40px 16px',
}

const sectionTitle = {
  color: '#18181b',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 8px',
}

const nextText = {
  color: '#71717a',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0',
}

const motivationSection = {
  padding: '16px 40px 32px',
  textAlign: 'center' as const,
}

const motivationText = {
  color: '#9ca3af',
  fontSize: '14px',
  fontStyle: 'italic',
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
