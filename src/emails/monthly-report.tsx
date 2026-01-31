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
import type { MonthlyStats, MonthlyComparison } from '@/types/database'

interface MonthlyReportEmailProps {
  name: string | null
  monthStats: MonthlyStats
  previousMonthComparison: MonthlyComparison
  unsubscribeToken?: string
}

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://plantaoecg.com.br'
const logoUrl = 'https://plantaoecg.com.br/logo-email.png'

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

export default function MonthlyReportEmail({
  name,
  monthStats,
  previousMonthComparison,
  unsubscribeToken,
}: MonthlyReportEmailProps) {
  const currentMonth = monthNames[new Date().getMonth()]
  const perfectRate = monthStats.ecgsCompleted > 0
    ? Math.round((monthStats.perfectScores / monthStats.ecgsCompleted) * 100)
    : 0

  const getDeltaDisplay = (delta: number, suffix = '') => {
    if (delta > 0) return { text: `+${delta}${suffix}`, color: '#059669', arrow: '↑' }
    if (delta < 0) return { text: `${delta}${suffix}`, color: '#dc2626', arrow: '↓' }
    return { text: `0${suffix}`, color: '#6b7280', arrow: '→' }
  }

  return (
    <Html>
      <Head />
      <Preview>Relatório Mensal de {currentMonth} - Plantão ECG</Preview>
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
            <Text style={monthBadge}>RELATÓRIO MENSAL</Text>
            <Heading style={heading}>
              {currentMonth}
            </Heading>
            <Text style={heroText}>
              Olá, {name || 'Doutor(a)'}! Confira sua evolução completa este mês.
            </Text>
          </Section>

          {/* Level Progress */}
          <Section style={levelSection}>
            <Row>
              <Column style={levelCol}>
                <Text style={levelLabel}>Nível Inicial</Text>
                <Text style={levelValue}>{monthStats.levelStart}</Text>
              </Column>
              <Column style={levelArrowCol}>
                <Text style={levelArrow}>→</Text>
              </Column>
              <Column style={levelCol}>
                <Text style={levelLabel}>Nível Final</Text>
                <Text style={levelValueHighlight}>{monthStats.levelEnd}</Text>
              </Column>
            </Row>
            {monthStats.levelsGained > 0 && (
              <Text style={levelsGained}>+{monthStats.levelsGained} níveis!</Text>
            )}
          </Section>

          {/* Main Stats */}
          <Section style={statsSection}>
            <Row>
              <Column style={statCol}>
                <Text style={statValue}>{monthStats.ecgsCompleted}</Text>
                <Text style={statLabel}>ECGs</Text>
                <Text style={{ ...statDelta, color: getDeltaDisplay(previousMonthComparison.ecgsDelta).color }}>
                  {getDeltaDisplay(previousMonthComparison.ecgsDelta).arrow} {getDeltaDisplay(previousMonthComparison.ecgsDelta).text}
                </Text>
              </Column>
              <Column style={statCol}>
                <Text style={statValue}>{monthStats.totalXpEarned.toLocaleString()}</Text>
                <Text style={statLabel}>XP Ganhos</Text>
                <Text style={{ ...statDelta, color: getDeltaDisplay(previousMonthComparison.xpDelta).color }}>
                  {getDeltaDisplay(previousMonthComparison.xpDelta).arrow} {getDeltaDisplay(previousMonthComparison.xpDelta).text}
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Performance Metrics */}
          <Section style={metricsSection}>
            <Row>
              <Column style={metricCol}>
                <Text style={metricValue}>{monthStats.perfectScores}</Text>
                <Text style={metricLabel}>Perfeitos</Text>
              </Column>
              <Column style={metricCol}>
                <Text style={metricValue}>{perfectRate}%</Text>
                <Text style={metricLabel}>Taxa Perfeita</Text>
              </Column>
              <Column style={metricCol}>
                <Text style={metricValue}>{monthStats.activeDays}</Text>
                <Text style={metricLabel}>Dias Ativos</Text>
              </Column>
              <Column style={metricCol}>
                <Text style={metricValue}>{monthStats.streakBest}</Text>
                <Text style={metricLabel}>Melhor Streak</Text>
              </Column>
            </Row>
          </Section>

          {/* Ranking */}
          {monthStats.rankAtEnd && (
            <Section style={rankSection}>
              <Text style={rankLabel}>Posição no Ranking:</Text>
              <Text style={rankValue}>#{monthStats.rankAtEnd}</Text>
              {monthStats.rankPercentile && (
                <Text style={rankPercentile}>
                  Top {monthStats.rankPercentile.toFixed(1)}% dos usuários
                </Text>
              )}
            </Section>
          )}

          {/* Achievements */}
          {monthStats.achievementsEarned.length > 0 && (
            <Section style={achievementsSection}>
              <Text style={achievementsTitle}>
                Conquistas do mês: {monthStats.achievementsEarned.length}
              </Text>
            </Section>
          )}

          {/* CTA Button */}
          <Section style={buttonContainer}>
            <Link style={button} href={`${baseUrl}/progress`}>
              Ver Estatísticas Detalhadas
            </Link>
          </Section>

          <Hr style={divider} />

          {/* Comparison Summary */}
          <Section style={comparisonSection}>
            <Text style={sectionTitle}>Comparado ao mês anterior:</Text>
            <Row>
              <Column style={compCol}>
                <Text style={{ ...compValue, color: getDeltaDisplay(previousMonthComparison.averageScoreDelta).color }}>
                  {getDeltaDisplay(previousMonthComparison.averageScoreDelta, '%').text}
                </Text>
                <Text style={compLabel}>Média</Text>
              </Column>
              <Column style={compCol}>
                <Text style={{ ...compValue, color: getDeltaDisplay(previousMonthComparison.activeDaysDelta).color }}>
                  {getDeltaDisplay(previousMonthComparison.activeDaysDelta).text}
                </Text>
                <Text style={compLabel}>Dias Ativos</Text>
              </Column>
              <Column style={compCol}>
                <Text style={{ ...compValue, color: getDeltaDisplay(previousMonthComparison.perfectScoresDelta).color }}>
                  {getDeltaDisplay(previousMonthComparison.perfectScoresDelta).text}
                </Text>
                <Text style={compLabel}>Perfeitos</Text>
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

const monthBadge = {
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
  fontSize: '32px',
  fontWeight: '700',
  lineHeight: '40px',
  margin: '0 0 8px',
}

const heroText = {
  color: '#52525b',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0',
}

const levelSection = {
  backgroundColor: '#f0fdf4',
  padding: '24px 40px',
  textAlign: 'center' as const,
}

const levelCol = {
  textAlign: 'center' as const,
  width: '40%',
}

const levelArrowCol = {
  textAlign: 'center' as const,
  width: '20%',
}

const levelLabel = {
  color: '#6b7280',
  fontSize: '12px',
  fontWeight: '500',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 4px',
}

const levelValue = {
  color: '#374151',
  fontSize: '32px',
  fontWeight: '700',
  margin: '0',
}

const levelValueHighlight = {
  color: '#059669',
  fontSize: '32px',
  fontWeight: '700',
  margin: '0',
}

const levelArrow = {
  color: '#059669',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0',
  lineHeight: '40px',
}

const levelsGained = {
  color: '#059669',
  fontSize: '14px',
  fontWeight: '600',
  margin: '8px 0 0',
}

const statsSection = {
  backgroundColor: '#eff6ff',
  padding: '24px 40px',
}

const statCol = {
  textAlign: 'center' as const,
  width: '50%',
}

const statValue = {
  color: '#1e40af',
  fontSize: '36px',
  fontWeight: '800',
  margin: '0',
}

const statLabel = {
  color: '#3b82f6',
  fontSize: '14px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '4px 0',
}

const statDelta = {
  fontSize: '12px',
  fontWeight: '500',
  margin: '0',
}

const metricsSection = {
  backgroundColor: '#f9fafb',
  padding: '20px 40px',
}

const metricCol = {
  textAlign: 'center' as const,
  width: '25%',
}

const metricValue = {
  color: '#374151',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0 0 2px',
}

const metricLabel = {
  color: '#9ca3af',
  fontSize: '10px',
  fontWeight: '500',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0',
}

const rankSection = {
  backgroundColor: '#fef3c7',
  padding: '20px 40px',
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
  fontSize: '32px',
  fontWeight: '800',
  margin: '0',
}

const rankPercentile = {
  color: '#a16207',
  fontSize: '13px',
  fontWeight: '500',
  margin: '4px 0 0',
}

const achievementsSection = {
  backgroundColor: '#faf5ff',
  padding: '16px 40px',
  textAlign: 'center' as const,
}

const achievementsTitle = {
  color: '#7c3aed',
  fontSize: '16px',
  fontWeight: '600',
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

const comparisonSection = {
  padding: '24px 40px',
}

const sectionTitle = {
  color: '#18181b',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 16px',
  textAlign: 'center' as const,
}

const compCol = {
  textAlign: 'center' as const,
  width: '33.33%',
}

const compValue = {
  fontSize: '20px',
  fontWeight: '700',
  margin: '0 0 2px',
}

const compLabel = {
  color: '#9ca3af',
  fontSize: '11px',
  fontWeight: '500',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
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
