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

interface AchievementUnlockedEmailProps {
  name: string | null
  achievementName: string
  achievementDescription: string
  achievementIcon: string
  xpReward: number
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  unsubscribeToken?: string
}

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://plantaoecg.com.br'
const logoUrl = 'https://plantaoecg.com.br/logo-email.png'

const rarityConfig = {
  common: { color: '#6b7280', bg: '#f3f4f6', label: 'Comum' },
  uncommon: { color: '#059669', bg: '#d1fae5', label: 'Incomum' },
  rare: { color: '#2563eb', bg: '#dbeafe', label: 'Raro' },
  epic: { color: '#7c3aed', bg: '#ede9fe', label: 'Épico' },
  legendary: { color: '#d97706', bg: '#fef3c7', label: 'Lendário' },
}

export default function AchievementUnlockedEmail({
  name,
  achievementName,
  achievementDescription,
  achievementIcon,
  xpReward,
  rarity,
  unsubscribeToken,
}: AchievementUnlockedEmailProps) {
  const config = rarityConfig[rarity]

  return (
    <Html>
      <Head />
      <Preview>Nova conquista: {achievementName} - Plantão ECG</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={{ ...header, backgroundColor: config.color }}>
            <Img
              src={logoUrl}
              alt="Plantão ECG"
              width={160}
              height={40}
              style={logo}
            />
          </Section>

          {/* Achievement Banner */}
          <Section style={{ ...achievementBanner, backgroundColor: config.bg }}>
            <Text style={{ ...rarityBadge, color: config.color, borderColor: config.color }}>
              {config.label.toUpperCase()}
            </Text>
          </Section>

          {/* Hero Section */}
          <Section style={heroSection}>
            <Text style={achievementEmoji}>🏆</Text>
            <Heading style={{ ...achievementTitle, color: config.color }}>
              {achievementName}
            </Heading>
            <Text style={achievementDesc}>
              {achievementDescription}
            </Text>
            <Text style={heroText}>
              Parabéns, {name || 'Doutor(a)'}! Você desbloqueou uma nova conquista!
            </Text>
          </Section>

          {/* XP Reward */}
          <Section style={{ ...xpSection, backgroundColor: config.bg }}>
            <Text style={xpLabel}>Recompensa:</Text>
            <Text style={{ ...xpValue, color: config.color }}>+{xpReward} XP</Text>
          </Section>

          {/* CTA Button */}
          <Section style={buttonContainer}>
            <Link style={{ ...button, backgroundColor: config.color }} href={`${baseUrl}/progress`}>
              Ver Todas as Conquistas
            </Link>
          </Section>

          <Hr style={divider} />

          {/* Progress Section */}
          <Section style={progressSection}>
            <Text style={sectionTitle}>Continue evoluindo!</Text>
            <Text style={progressText}>
              Cada conquista desbloqueada te aproxima do título de Mestre em ECG.
              Continue praticando para descobrir todas as conquistas ocultas!
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
  padding: '24px',
  textAlign: 'center' as const,
}

const logo = {
  margin: '0 auto',
}

const achievementBanner = {
  padding: '16px',
  textAlign: 'center' as const,
}

const rarityBadge = {
  fontSize: '12px',
  fontWeight: '700',
  letterSpacing: '2px',
  padding: '6px 16px',
  borderRadius: '20px',
  border: '2px solid',
  display: 'inline-block',
  margin: '0',
}

const heroSection = {
  padding: '40px 40px 20px',
  textAlign: 'center' as const,
}

const achievementEmoji = {
  fontSize: '48px',
  margin: '0 0 16px',
}

const achievementTitle = {
  fontSize: '24px',
  fontWeight: '700',
  margin: '0 0 8px',
}

const achievementDesc = {
  color: '#6b7280',
  fontSize: '15px',
  fontStyle: 'italic',
  margin: '0 0 24px',
}

const heroText = {
  color: '#52525b',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0',
}

const xpSection = {
  padding: '20px 40px',
  textAlign: 'center' as const,
}

const xpLabel = {
  color: '#6b7280',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0 0 4px',
}

const xpValue = {
  fontSize: '28px',
  fontWeight: '800',
  margin: '0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  padding: '24px 40px 40px',
}

const button = {
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
}

const divider = {
  borderColor: '#e4e4e7',
  margin: '0 40px',
}

const progressSection = {
  padding: '32px 40px',
}

const sectionTitle = {
  color: '#18181b',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 8px',
}

const progressText = {
  color: '#71717a',
  fontSize: '15px',
  lineHeight: '24px',
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
