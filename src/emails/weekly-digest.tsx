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
import type { WeeklyStats } from '@/types/database'

interface WeeklyDigestEmailProps {
  name: string | null
  weekStats: WeeklyStats
  topAchievement: { name: string; icon: string } | null
  leaderboardPosition: number | null
  unsubscribeToken?: string
}

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://plantaoecg.com.br'
const logoUrl = 'https://hwgsjpjbyydpittefnjd.supabase.co/storage/v1/object/public/assets/PlantaoECGsemBG-HR.png'

export default function WeeklyDigestEmail({
  name,
  weekStats,
  topAchievement,
  leaderboardPosition,
  unsubscribeToken,
}: WeeklyDigestEmailProps) {
  const perfectRate = weekStats.ecgsCompleted > 0
    ? Math.round((weekStats.perfectScores / weekStats.ecgsCompleted) * 100)
    : 0

  const getDeltaDisplay = (delta: number) => {
    if (delta > 0) return { text: `+${delta}`, color: '#059669' }
    if (delta < 0) return { text: `${delta}`, color: '#dc2626' }
    return { text: '0', color: '#6b7280' }
  }

  const ecgsDelta = getDeltaDisplay(weekStats.ecgsDelta)
  const xpDelta = getDeltaDisplay(weekStats.xpDelta)

  return (
    <Html>
      <Head />
      <Preview>Sua semana em números - {weekStats.ecgsCompleted} ECGs, +{weekStats.totalXpEarned} XP</Preview>
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
            <Text style={weekBadge}>RESUMO SEMANAL</Text>
            <Heading style={heading}>
              Olá, {name || 'Doutor(a)'}!
            </Heading>
            <Text style={heroText}>
              Confira como foi sua semana no Plantão ECG.
            </Text>
          </Section>

          {/* Main Stats */}
          <Section style={statsSection}>
            <Row>
              <Column style={statCol}>
                <Text style={statValue}>{weekStats.ecgsCompleted}</Text>
                <Text style={statLabel}>ECGs</Text>
                <Text style={{ ...statDelta, color: ecgsDelta.color }}>
                  {ecgsDelta.text} vs semana anterior
                </Text>
              </Column>
              <Column style={statCol}>
                <Text style={statValue}>{weekStats.totalXpEarned}</Text>
                <Text style={statLabel}>XP Ganhos</Text>
                <Text style={{ ...statDelta, color: xpDelta.color }}>
                  {xpDelta.text} vs semana anterior
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Secondary Stats */}
          <Section style={secondarySection}>
            <Row>
              <Column style={secondaryCol}>
                <Text style={secondaryValue}>{weekStats.perfectScores}</Text>
                <Text style={secondaryLabel}>Perfeitos</Text>
              </Column>
              <Column style={secondaryCol}>
                <Text style={secondaryValue}>{perfectRate}%</Text>
                <Text style={secondaryLabel}>Taxa</Text>
              </Column>
              <Column style={secondaryCol}>
                <Text style={secondaryValue}>{weekStats.activeDays}/7</Text>
                <Text style={secondaryLabel}>Dias Ativos</Text>
              </Column>
              <Column style={secondaryCol}>
                <Text style={secondaryValue}>{weekStats.streakAtEnd}</Text>
                <Text style={secondaryLabel}>Streak</Text>
              </Column>
            </Row>
          </Section>

          {/* Ranking */}
          {leaderboardPosition && (
            <Section style={rankSection}>
              <Text style={rankLabel}>Sua posição no ranking:</Text>
              <Text style={rankValue}>#{leaderboardPosition}</Text>
            </Section>
          )}

          {/* Top Achievement */}
          {topAchievement && (
            <Section style={achievementSection}>
              <Text style={achievementLabel}>Conquista da semana:</Text>
              <Text style={achievementName}>{topAchievement.name}</Text>
            </Section>
          )}

          {/* CTA Button */}
          <Section style={buttonContainer}>
            <Link style={button} href={`${baseUrl}/practice`}>
              Continuar Praticando
            </Link>
          </Section>

          <Hr style={divider} />

          {/* Difficulty Breakdown */}
          <Section style={breakdownSection}>
            <Text style={sectionTitle}>Por dificuldade:</Text>
            <Row>
              <Column style={diffCol}>
                <Text style={diffValue}>{weekStats.difficultiesPracticed.easy || 0}</Text>
                <Text style={diffLabel}>Fácil</Text>
              </Column>
              <Column style={diffCol}>
                <Text style={diffValue}>{weekStats.difficultiesPracticed.medium || 0}</Text>
                <Text style={diffLabel}>Médio</Text>
              </Column>
              <Column style={diffCol}>
                <Text style={diffValue}>{weekStats.difficultiesPracticed.hard || 0}</Text>
                <Text style={diffLabel}>Difícil</Text>
              </Column>
            </Row>
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

const weekBadge = {
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
  margin: '0 0 8px',
}

const heroText = {
  color: '#52525b',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0',
}

const statsSection = {
  backgroundColor: '#eff6ff',
  padding: '24px 40px',
  margin: '20px 0 0',
}

const statCol = {
  textAlign: 'center' as const,
  width: '50%',
}

const statValue = {
  color: '#1e40af',
  fontSize: '40px',
  fontWeight: '800',
  margin: '0',
}

const statLabel = {
  color: '#3b82f6',
  fontSize: '14px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '4px 0 4px',
}

const statDelta = {
  fontSize: '12px',
  fontWeight: '500',
  margin: '0',
}

const secondarySection = {
  backgroundColor: '#f9fafb',
  padding: '20px 40px',
}

const secondaryCol = {
  textAlign: 'center' as const,
  width: '25%',
}

const secondaryValue = {
  color: '#374151',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0 0 2px',
}

const secondaryLabel = {
  color: '#9ca3af',
  fontSize: '11px',
  fontWeight: '500',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0',
}

const rankSection = {
  backgroundColor: '#fef3c7',
  padding: '16px 40px',
  textAlign: 'center' as const,
}

const rankLabel = {
  color: '#92400e',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0 0 4px',
}

const rankValue = {
  color: '#b45309',
  fontSize: '24px',
  fontWeight: '800',
  margin: '0',
}

const achievementSection = {
  backgroundColor: '#faf5ff',
  padding: '16px 40px',
  textAlign: 'center' as const,
}

const achievementLabel = {
  color: '#7c3aed',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0 0 4px',
}

const achievementName = {
  color: '#6d28d9',
  fontSize: '18px',
  fontWeight: '700',
  margin: '0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  padding: '24px 40px 32px',
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

const breakdownSection = {
  padding: '24px 40px',
}

const sectionTitle = {
  color: '#18181b',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 16px',
  textAlign: 'center' as const,
}

const diffCol = {
  textAlign: 'center' as const,
  width: '33.33%',
}

const diffValue = {
  color: '#374151',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0 0 2px',
}

const diffLabel = {
  color: '#9ca3af',
  fontSize: '12px',
  fontWeight: '500',
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
