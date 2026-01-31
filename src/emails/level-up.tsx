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

interface LevelUpEmailProps {
  name: string | null
  newLevel: number
  previousLevel: number
  totalXp: number
  unsubscribeToken?: string
}

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://plantaoecg.com.br'
const logoUrl = 'https://hwgsjpjbyydpittefnjd.supabase.co/storage/v1/object/public/assets/PlantaoECGsemBG-HR.png'

export default function LevelUpEmail({
  name,
  newLevel,
  previousLevel,
  totalXp,
  unsubscribeToken,
}: LevelUpEmailProps) {
  const getLevelTitle = (level: number) => {
    if (level >= 90) return 'Mestre Supremo'
    if (level >= 80) return 'Grande Mestre'
    if (level >= 70) return 'Mestre'
    if (level >= 60) return 'Expert'
    if (level >= 50) return 'Especialista'
    if (level >= 40) return 'Avançado'
    if (level >= 30) return 'Competente'
    if (level >= 20) return 'Intermediário'
    if (level >= 10) return 'Aprendiz'
    return 'Iniciante'
  }

  return (
    <Html>
      <Head />
      <Preview>{`Level ${newLevel} desbloqueado! Parabéns - Plantão ECG`}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={headerLevel}>
            <Img
              src={logoUrl}
              alt="Plantão ECG"
              width={160}
              height={40}
              style={logo}
            />
          </Section>

          {/* Level Up Banner */}
          <Section style={levelUpBanner}>
            <Text style={levelUpText}>LEVEL UP!</Text>
          </Section>

          {/* Hero Section */}
          <Section style={heroSection}>
            <Text style={levelTransition}>
              {previousLevel} → {newLevel}
            </Text>
            <Text style={levelNumber}>{newLevel}</Text>
            <Text style={levelTitle}>{getLevelTitle(newLevel)}</Text>
            <Heading style={heading}>
              Parabéns, {name || 'Doutor(a)'}!
            </Heading>
            <Text style={heroText}>
              Você subiu para o nível {newLevel}! Sua dedicação está dando
              resultados. Continue praticando para desbloquear ainda mais
              conquistas.
            </Text>
          </Section>

          {/* XP Counter */}
          <Section style={xpSection}>
            <Text style={xpLabel}>XP Total</Text>
            <Text style={xpValue}>{totalXp.toLocaleString()}</Text>
          </Section>

          {/* CTA Button */}
          <Section style={buttonContainer}>
            <Link style={button} href={`${baseUrl}/progress`}>
              Ver Meu Progresso
            </Link>
          </Section>

          <Hr style={divider} />

          {/* Benefits Section */}
          <Section style={benefitsSection}>
            <Text style={sectionTitle}>Benefícios do seu novo nível:</Text>
            <Text style={benefitText}>
              - Multiplicador de XP aumentado
            </Text>
            <Text style={benefitText}>
              - Mais próximo de conquistas de nível
            </Text>
            <Text style={benefitText}>
              - Posição melhor no ranking
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

const headerLevel = {
  backgroundColor: '#059669',
  padding: '24px',
  textAlign: 'center' as const,
}

const logo = {
  margin: '0 auto',
}

const levelUpBanner = {
  backgroundColor: '#dcfce7',
  padding: '12px',
  textAlign: 'center' as const,
  borderBottom: '2px solid #86efac',
}

const levelUpText = {
  color: '#059669',
  fontSize: '16px',
  fontWeight: '800',
  letterSpacing: '3px',
  margin: '0',
}

const heroSection = {
  padding: '40px 40px 20px',
  textAlign: 'center' as const,
  background: 'linear-gradient(180deg, #ecfdf5 0%, #ffffff 100%)',
}

const levelTransition = {
  color: '#9ca3af',
  fontSize: '16px',
  fontWeight: '500',
  margin: '0 0 8px',
}

const levelNumber = {
  color: '#059669',
  fontSize: '80px',
  fontWeight: '800',
  margin: '0',
  lineHeight: '1',
}

const levelTitle = {
  color: '#10b981',
  fontSize: '18px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '2px',
  margin: '8px 0 24px',
}

const heading = {
  color: '#18181b',
  fontSize: '24px',
  fontWeight: '700',
  lineHeight: '32px',
  margin: '0 0 16px',
}

const heroText = {
  color: '#52525b',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0',
}

const xpSection = {
  backgroundColor: '#f0fdf4',
  padding: '16px 40px',
  textAlign: 'center' as const,
}

const xpLabel = {
  color: '#6b7280',
  fontSize: '12px',
  fontWeight: '500',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  margin: '0 0 4px',
}

const xpValue = {
  color: '#059669',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  padding: '24px 40px 40px',
}

const button = {
  backgroundColor: '#059669',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
  boxShadow: '0 2px 4px rgba(5, 150, 105, 0.3)',
}

const divider = {
  borderColor: '#e4e4e7',
  margin: '0 40px',
}

const benefitsSection = {
  padding: '32px 40px',
}

const sectionTitle = {
  color: '#18181b',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 16px',
}

const benefitText = {
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
