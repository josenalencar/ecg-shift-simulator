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

interface Day7WeekSummaryEmailProps {
  name: string | null
  weekStats: WeeklyStats
  unsubscribeToken?: string
}

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://plantaoecg.com.br'
const logoUrl = 'https://hwgsjpjbyydpittefnjd.supabase.co/storage/v1/object/public/assets/PlantaoECGsemBG-HR.png'

export default function Day7WeekSummaryEmail({
  name,
  weekStats,
  unsubscribeToken,
}: Day7WeekSummaryEmailProps) {
  const perfectRate = weekStats.ecgsCompleted > 0
    ? Math.round((weekStats.perfectScores / weekStats.ecgsCompleted) * 100)
    : 0

  return (
    <Html>
      <Head />
      <Preview>Sua primeira semana no Plantão ECG - Resumo completo!</Preview>
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
            <Text style={weekBadge}>PRIMEIRA SEMANA</Text>
            <Heading style={heading}>
              Parabéns pela primeira semana!
            </Heading>
            <Text style={heroText}>
              Olá, {name || 'Doutor(a)'}! Confira seu resumo da primeira semana
              no Plantão ECG.
            </Text>
          </Section>

          {/* Main Stats */}
          <Section style={statsSection}>
            <Row>
              <Column style={statCol}>
                <Text style={statValue}>{weekStats.ecgsCompleted}</Text>
                <Text style={statLabel}>ECGs</Text>
              </Column>
              <Column style={statCol}>
                <Text style={statValue}>{weekStats.totalXpEarned}</Text>
                <Text style={statLabel}>XP Ganhos</Text>
              </Column>
              <Column style={statCol}>
                <Text style={statValue}>{weekStats.levelAtEnd}</Text>
                <Text style={statLabel}>Nível</Text>
              </Column>
            </Row>
          </Section>

          {/* Secondary Stats */}
          <Section style={secondaryStats}>
            <Row>
              <Column style={secondaryCol}>
                <Text style={secondaryValue}>{weekStats.perfectScores}</Text>
                <Text style={secondaryLabel}>Perfeitos</Text>
              </Column>
              <Column style={secondaryCol}>
                <Text style={secondaryValue}>{perfectRate}%</Text>
                <Text style={secondaryLabel}>Taxa Perfeita</Text>
              </Column>
              <Column style={secondaryCol}>
                <Text style={secondaryValue}>{weekStats.activeDays}</Text>
                <Text style={secondaryLabel}>Dias Ativos</Text>
              </Column>
              <Column style={secondaryCol}>
                <Text style={secondaryValue}>{weekStats.streakAtEnd}</Text>
                <Text style={secondaryLabel}>Streak</Text>
              </Column>
            </Row>
          </Section>

          {/* Achievements */}
          {weekStats.achievementsEarned.length > 0 && (
            <Section style={achievementsSection}>
              <Text style={achievementsTitle}>
                Conquistas desbloqueadas: {weekStats.achievementsEarned.length}
              </Text>
            </Section>
          )}

          {/* CTA Button */}
          <Section style={buttonContainer}>
            <Link style={button} href={`${baseUrl}/progress`}>
              Ver Estatísticas Completas
            </Link>
          </Section>

          <Hr style={divider} />

          {/* Next Week Goals */}
          <Section style={goalsSection}>
            <Text style={sectionTitle}>Metas para a próxima semana:</Text>
            <Text style={goalText}>
              - Mantenha o streak por 7 dias consecutivos
            </Text>
            <Text style={goalText}>
              - Tente 5 ECGs de dificuldade média ou alta
            </Text>
            <Text style={goalText}>
              - Desbloqueie sua primeira conquista de categoria
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

const weekBadge = {
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

const statsSection = {
  backgroundColor: '#eff6ff',
  padding: '24px 40px',
  margin: '20px 0 0',
}

const statCol = {
  textAlign: 'center' as const,
  width: '33.33%',
}

const statValue = {
  color: '#1e40af',
  fontSize: '36px',
  fontWeight: '800',
  margin: '0 0 4px',
}

const statLabel = {
  color: '#3b82f6',
  fontSize: '13px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0',
}

const secondaryStats = {
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

const achievementsSection = {
  padding: '16px 40px',
  textAlign: 'center' as const,
}

const achievementsTitle = {
  color: '#059669',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  padding: '24px 40px 40px',
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

const goalsSection = {
  padding: '32px 40px',
}

const sectionTitle = {
  color: '#18181b',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 16px',
}

const goalText = {
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
