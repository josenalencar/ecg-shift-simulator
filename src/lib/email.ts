import { Resend } from 'resend'
import { createServiceRoleClient } from '@/lib/supabase/server'
import WelcomeEmail from '@/emails/welcome'
import SubscriptionActivatedEmail from '@/emails/subscription-activated'
import SubscriptionCanceledEmail from '@/emails/subscription-canceled'
import PaymentFailedEmail from '@/emails/payment-failed'
import PasswordResetEmail from '@/emails/password-reset'
import RenewalReminderEmail from '@/emails/renewal-reminder'
import XPEventAnnouncementEmail from '@/emails/xp-event-announcement'
// Phase 1 - Onboarding emails
import FirstCaseCompletedEmail from '@/emails/first-case-completed'
import Day2SecondTouchEmail from '@/emails/day2-second-touch'
import Day3ProgressCheckEmail from '@/emails/day3-progress-check'
import Day5FeatureDiscoveryEmail from '@/emails/day5-feature-discovery'
import Day7WeekSummaryEmail from '@/emails/day7-week-summary'
// Phase 2 - Engagement emails
import StreakStarterEmail from '@/emails/streak-starter'
import StreakAtRiskEmail from '@/emails/streak-at-risk'
import StreakMilestoneEmail from '@/emails/streak-milestone'
import LevelUpEmail from '@/emails/level-up'
import AchievementUnlockedEmail from '@/emails/achievement-unlocked'
import WeeklyDigestEmail from '@/emails/weekly-digest'
import MonthlyReportEmail from '@/emails/monthly-report'
import type { WeeklyStats, MonthlyStats, MonthlyComparison, Difficulty } from '@/types/database'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.EMAIL_FROM || 'onboarding@resend.dev'
const FROM_NAME = 'Plantao ECG'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://plantaoecg.com.br'

// ============================================
// Custom Template Utilities
// ============================================

interface EmailConfig {
  email_type: string
  is_enabled: boolean
  custom_html: string | null
  custom_subject: string | null
  use_custom_template: boolean
}

async function getEmailConfig(emailType: string): Promise<EmailConfig | null> {
  try {
    const supabase = createServiceRoleClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('email_config')
      .select('email_type, is_enabled, custom_html, custom_subject, use_custom_template')
      .eq('email_type', emailType)
      .single()

    if (error || !data) return null
    return data as EmailConfig
  } catch {
    return null
  }
}

function replaceTemplateVariables(
  template: string,
  variables: Record<string, string | number | null | undefined>
): string {
  let result = template
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
    result = result.replace(regex, String(value ?? ''))
  }
  return result
}

interface SendEmailOptions<T> {
  emailType: string
  to: string
  defaultSubject: string
  reactComponent: React.ReactElement
  templateVariables: Record<string, string | number | null | undefined>
}

async function sendEmailWithCustomTemplate<T>({
  emailType,
  to,
  defaultSubject,
  reactComponent,
  templateVariables,
}: SendEmailOptions<T>): Promise<{ success: boolean; data?: unknown; error?: unknown }> {
  try {
    const config = await getEmailConfig(emailType)

    // Use custom template if enabled
    if (config?.use_custom_template && config?.custom_html) {
      const html = replaceTemplateVariables(config.custom_html, {
        ...templateVariables,
        siteUrl: SITE_URL,
        unsubscribeUrl: templateVariables.unsubscribeToken
          ? `${SITE_URL}/api/email/unsubscribe?token=${templateVariables.unsubscribeToken}`
          : '#',
      })
      const subject = config.custom_subject
        ? replaceTemplateVariables(config.custom_subject, templateVariables)
        : defaultSubject

      const { data, error } = await resend.emails.send({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to,
        subject,
        html,
      })

      if (error) {
        console.error(`[Email] Failed to send ${emailType} email (custom template):`, error)
        return { success: false, error }
      }

      console.log(`[Email] ${emailType} email sent with custom template:`, data)
      return { success: true, data }
    }

    // Fall back to React template
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject: defaultSubject,
      react: reactComponent,
    })

    if (error) {
      console.error(`[Email] Failed to send ${emailType} email:`, error)
      return { success: false, error }
    }

    console.log(`[Email] ${emailType} email sent successfully:`, data)
    return { success: true, data }
  } catch (error) {
    console.error(`[Email] Exception sending ${emailType} email:`, error)
    return { success: false, error }
  }
}

// ============================================
// Email Functions
// ============================================

export async function sendWelcomeEmail(email: string, name: string) {
  console.log('[Email] Sending welcome email to:', email, 'name:', name)
  console.log('[Email] From:', `${FROM_NAME} <${FROM_EMAIL}>`)

  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: 'Bem-vindo ao Plantao ECG!',
      react: WelcomeEmail({ name }),
    })

    if (error) {
      console.error('[Email] Failed to send welcome email:', error)
      return { success: false, error }
    }

    console.log('[Email] Welcome email sent successfully:', data)
    return { success: true, data }
  } catch (error) {
    console.error('[Email] Exception sending welcome email:', error)
    return { success: false, error }
  }
}

export async function sendSubscriptionActivatedEmail(
  email: string,
  name: string,
  plan: string
) {
  try {
    const planDisplay = plan === 'ai' ? 'Premium + IA' : 'Premium'
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: `Sua assinatura ${planDisplay} esta ativa!`,
      react: SubscriptionActivatedEmail({ name, plan }),
    })

    if (error) {
      console.error('Failed to send subscription activated email:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Failed to send subscription activated email:', error)
    return { success: false, error }
  }
}

export async function sendSubscriptionCanceledEmail(
  email: string,
  name: string,
  endDate: string
) {
  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: 'Sua assinatura do Plantao ECG foi cancelada',
      react: SubscriptionCanceledEmail({ name, endDate }),
    })

    if (error) {
      console.error('Failed to send subscription canceled email:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Failed to send subscription canceled email:', error)
    return { success: false, error }
  }
}

export async function sendPaymentFailedEmail(email: string, name: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: 'Acao necessaria: Seu pagamento falhou',
      react: PaymentFailedEmail({ name }),
    })

    if (error) {
      console.error('Failed to send payment failed email:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Failed to send payment failed email:', error)
    return { success: false, error }
  }
}

export async function sendPasswordResetEmail(
  email: string,
  name: string | null,
  resetLink: string
) {
  console.log('[Email] Sending password reset email to:', email)

  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: 'Redefinir sua senha - Plantao de ECG',
      react: PasswordResetEmail({ name, resetLink }),
    })

    if (error) {
      console.error('[Email] Failed to send password reset email:', error)
      return { success: false, error }
    }

    console.log('[Email] Password reset email sent successfully:', data)
    return { success: true, data }
  } catch (error) {
    console.error('[Email] Exception sending password reset email:', error)
    return { success: false, error }
  }
}

export async function sendRenewalReminderEmail(
  email: string,
  name: string | null,
  plan: 'premium' | 'ai',
  amount: string,
  renewalDate: string
) {
  const planDisplay = plan === 'ai' ? 'Premium + IA' : 'Premium'
  console.log('[Email] Sending renewal reminder to:', email, 'plan:', planDisplay)

  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: `Lembrete: Sua assinatura ${planDisplay} sera renovada em ${renewalDate}`,
      react: RenewalReminderEmail({ name, plan, amount, renewalDate }),
    })

    if (error) {
      console.error('[Email] Failed to send renewal reminder email:', error)
      return { success: false, error }
    }

    console.log('[Email] Renewal reminder email sent successfully:', data)
    return { success: true, data }
  } catch (error) {
    console.error('[Email] Exception sending renewal reminder email:', error)
    return { success: false, error }
  }
}

export async function sendXPEventAnnouncementEmail(
  email: string,
  name: string | null,
  eventName: string,
  eventType: '2x' | '3x',
  endDate: string,
  unsubscribeToken?: string
) {
  const typeLabel = eventType === '3x' ? 'XP TRIPLICADO' : 'XP DOBRADO'
  console.log('[Email] Sending XP event announcement to:', email, 'event:', eventName)

  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: `${typeLabel}! Evento especial no Plantao ECG`,
      react: XPEventAnnouncementEmail({ name, eventName, eventType, endDate, unsubscribeToken }),
    })

    if (error) {
      console.error('[Email] Failed to send XP event announcement email:', error)
      return { success: false, error }
    }

    console.log('[Email] XP event announcement email sent successfully:', data)
    return { success: true, data }
  } catch (error) {
    console.error('[Email] Exception sending XP event announcement email:', error)
    return { success: false, error }
  }
}

// ============================================
// Phase 1 - Onboarding Emails
// ============================================

export async function sendFirstCaseCompletedEmail(
  email: string,
  name: string | null,
  score: number,
  difficulty: Difficulty,
  xpEarned: number,
  unsubscribeToken?: string
) {
  console.log('[Email] Sending first case completed email to:', email)

  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: 'Primeiro ECG concluido! Veja como voce se saiu',
      react: FirstCaseCompletedEmail({ name, score, difficulty, xpEarned, unsubscribeToken }),
    })

    if (error) {
      console.error('[Email] Failed to send first case completed email:', error)
      return { success: false, error }
    }

    console.log('[Email] First case completed email sent successfully:', data)
    return { success: true, data }
  } catch (error) {
    console.error('[Email] Exception sending first case completed email:', error)
    return { success: false, error }
  }
}

export async function sendDay2SecondTouchEmail(
  email: string,
  name: string | null,
  unsubscribeToken?: string
) {
  console.log('[Email] Sending day 2 second touch email to:', email)

  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: 'Seu proximo plantao esta esperando',
      react: Day2SecondTouchEmail({ name, unsubscribeToken }),
    })

    if (error) {
      console.error('[Email] Failed to send day 2 email:', error)
      return { success: false, error }
    }

    console.log('[Email] Day 2 email sent successfully:', data)
    return { success: true, data }
  } catch (error) {
    console.error('[Email] Exception sending day 2 email:', error)
    return { success: false, error }
  }
}

export async function sendDay3ProgressCheckEmail(
  email: string,
  name: string | null,
  ecgsCompleted: number,
  totalXp: number,
  currentLevel: number,
  unsubscribeToken?: string
) {
  console.log('[Email] Sending day 3 progress check email to:', email)

  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: 'Seu progresso em 48 horas',
      react: Day3ProgressCheckEmail({ name, ecgsCompleted, totalXp, currentLevel, unsubscribeToken }),
    })

    if (error) {
      console.error('[Email] Failed to send day 3 email:', error)
      return { success: false, error }
    }

    console.log('[Email] Day 3 email sent successfully:', data)
    return { success: true, data }
  } catch (error) {
    console.error('[Email] Exception sending day 3 email:', error)
    return { success: false, error }
  }
}

export async function sendDay5FeatureDiscoveryEmail(
  email: string,
  name: string | null,
  featureName: string,
  featureDescription: string,
  unsubscribeToken?: string
) {
  console.log('[Email] Sending day 5 feature discovery email to:', email)

  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: `Recurso nao descoberto: ${featureName}`,
      react: Day5FeatureDiscoveryEmail({ name, featureName, featureDescription, unsubscribeToken }),
    })

    if (error) {
      console.error('[Email] Failed to send day 5 email:', error)
      return { success: false, error }
    }

    console.log('[Email] Day 5 email sent successfully:', data)
    return { success: true, data }
  } catch (error) {
    console.error('[Email] Exception sending day 5 email:', error)
    return { success: false, error }
  }
}

export async function sendDay7WeekSummaryEmail(
  email: string,
  name: string | null,
  weekStats: WeeklyStats,
  unsubscribeToken?: string
) {
  console.log('[Email] Sending day 7 week summary email to:', email)

  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: 'Sua primeira semana no Plantao ECG',
      react: Day7WeekSummaryEmail({ name, weekStats, unsubscribeToken }),
    })

    if (error) {
      console.error('[Email] Failed to send day 7 email:', error)
      return { success: false, error }
    }

    console.log('[Email] Day 7 email sent successfully:', data)
    return { success: true, data }
  } catch (error) {
    console.error('[Email] Exception sending day 7 email:', error)
    return { success: false, error }
  }
}

// ============================================
// Phase 2 - Engagement Emails
// ============================================

export async function sendStreakStarterEmail(
  email: string,
  name: string | null,
  previousBestStreak: number,
  unsubscribeToken?: string
) {
  console.log('[Email] Sending streak starter email to:', email)

  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: 'Volte hoje e inicie um novo streak',
      react: StreakStarterEmail({ name, previousBestStreak, unsubscribeToken }),
    })

    if (error) {
      console.error('[Email] Failed to send streak starter email:', error)
      return { success: false, error }
    }

    console.log('[Email] Streak starter email sent successfully:', data)
    return { success: true, data }
  } catch (error) {
    console.error('[Email] Exception sending streak starter email:', error)
    return { success: false, error }
  }
}

export async function sendStreakAtRiskEmail(
  email: string,
  name: string | null,
  currentStreak: number,
  hoursRemaining: number,
  unsubscribeToken?: string
) {
  console.log('[Email] Sending streak at risk email to:', email, 'streak:', currentStreak)

  return sendEmailWithCustomTemplate({
    emailType: 'streak_at_risk',
    to: email,
    defaultSubject: `Seu streak de ${currentStreak} dias termina em ${hoursRemaining} horas!`,
    reactComponent: StreakAtRiskEmail({ name, currentStreak, hoursRemaining, unsubscribeToken }),
    templateVariables: {
      userName: name,
      userEmail: email,
      streak: currentStreak,
      hoursRemaining,
      unsubscribeToken,
    },
  })
}

export async function sendStreakMilestoneEmail(
  email: string,
  name: string | null,
  streakDays: number,
  nextMilestone: number | null,
  xpBonus: number,
  unsubscribeToken?: string
) {
  console.log('[Email] Sending streak milestone email to:', email, 'streak:', streakDays)

  return sendEmailWithCustomTemplate({
    emailType: 'streak_milestone',
    to: email,
    defaultSubject: `${streakDays} DIAS! Voce esta entre os mais dedicados`,
    reactComponent: StreakMilestoneEmail({ name, streakDays, nextMilestone, xpBonus, unsubscribeToken }),
    templateVariables: {
      userName: name,
      userEmail: email,
      streak: streakDays,
      xpBonus,
      nextMilestone,
      unsubscribeToken,
    },
  })
}

export async function sendLevelUpEmail(
  email: string,
  name: string | null,
  newLevel: number,
  previousLevel: number,
  totalXp: number,
  unsubscribeToken?: string
) {
  console.log('[Email] Sending level up email to:', email, 'level:', newLevel)

  return sendEmailWithCustomTemplate({
    emailType: 'level_up',
    to: email,
    defaultSubject: `Level ${newLevel} desbloqueado!`,
    reactComponent: LevelUpEmail({ name, newLevel, previousLevel, totalXp, unsubscribeToken }),
    templateVariables: {
      userName: name,
      userEmail: email,
      level: newLevel,
      previousLevel,
      totalXp: totalXp.toLocaleString(),
      unsubscribeToken,
    },
  })
}

export async function sendAchievementUnlockedEmail(
  email: string,
  name: string | null,
  achievementName: string,
  achievementDescription: string,
  achievementIcon: string,
  xpReward: number,
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary',
  unsubscribeToken?: string
) {
  console.log('[Email] Sending achievement unlocked email to:', email, 'achievement:', achievementName)

  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: `Nova conquista: ${achievementName}`,
      react: AchievementUnlockedEmail({ name, achievementName, achievementDescription, achievementIcon, xpReward, rarity, unsubscribeToken }),
    })

    if (error) {
      console.error('[Email] Failed to send achievement unlocked email:', error)
      return { success: false, error }
    }

    console.log('[Email] Achievement unlocked email sent successfully:', data)
    return { success: true, data }
  } catch (error) {
    console.error('[Email] Exception sending achievement unlocked email:', error)
    return { success: false, error }
  }
}

export async function sendWeeklyDigestEmail(
  email: string,
  name: string | null,
  weekStats: WeeklyStats,
  topAchievement: { name: string; icon: string } | null,
  leaderboardPosition: number | null,
  unsubscribeToken?: string
) {
  console.log('[Email] Sending weekly digest email to:', email)

  return sendEmailWithCustomTemplate({
    emailType: 'weekly_digest',
    to: email,
    defaultSubject: `Sua semana em numeros: ${weekStats.ecgsCompleted} ECGs, +${weekStats.totalXpEarned} XP`,
    reactComponent: WeeklyDigestEmail({ name, weekStats, topAchievement, leaderboardPosition, unsubscribeToken }),
    templateVariables: {
      userName: name,
      userEmail: email,
      ecgsCompleted: weekStats.ecgsCompleted,
      xpEarned: weekStats.totalXpEarned,
      streak: weekStats.streakAtEnd,
      perfectScores: weekStats.perfectScores,
      unsubscribeToken,
    },
  })
}

export async function sendMonthlyReportEmail(
  email: string,
  name: string | null,
  monthStats: MonthlyStats,
  previousMonthComparison: MonthlyComparison,
  unsubscribeToken?: string
) {
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]
  const currentMonth = monthNames[new Date().getMonth()]
  console.log('[Email] Sending monthly report email to:', email, 'month:', currentMonth)

  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: `Relatorio Mensal: ${currentMonth}`,
      react: MonthlyReportEmail({ name, monthStats, previousMonthComparison, unsubscribeToken }),
    })

    if (error) {
      console.error('[Email] Failed to send monthly report email:', error)
      return { success: false, error }
    }

    console.log('[Email] Monthly report email sent successfully:', data)
    return { success: true, data }
  } catch (error) {
    console.error('[Email] Exception sending monthly report email:', error)
    return { success: false, error }
  }
}

// ============================================
// Automation Email Function
// ============================================

/**
 * Send an email based on email type configuration
 * Used by automation system to send any configured email type
 */
export async function sendAutomationEmail(
  to: string,
  emailType: string,
  variables: Record<string, string | number | null | undefined>
): Promise<{ success: boolean; emailId?: string; error?: string }> {
  try {
    const config = await getEmailConfig(emailType)

    if (!config) {
      return { success: false, error: `Email type ${emailType} not found` }
    }

    if (!config.is_enabled) {
      return { success: false, error: `Email type ${emailType} is disabled` }
    }

    // Use custom template if available
    if (config.use_custom_template && config.custom_html) {
      const html = replaceTemplateVariables(config.custom_html, {
        ...variables,
        siteUrl: SITE_URL,
      })
      const subject = config.custom_subject
        ? replaceTemplateVariables(config.custom_subject, variables)
        : `Mensagem do Plantao ECG`

      const { data, error } = await resend.emails.send({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to,
        subject,
        html,
      })

      if (error) {
        console.error(`[Email] Failed to send automation ${emailType}:`, error)
        return { success: false, error: error.message }
      }

      console.log(`[Email] Automation ${emailType} sent:`, data)
      return { success: true, emailId: data?.id }
    }

    // For emails without custom template, return an error
    // Automation should only use emails with custom templates configured
    return { success: false, error: `Email type ${emailType} has no custom template configured` }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error(`[Email] Exception sending automation ${emailType}:`, error)
    return { success: false, error: message }
  }
}
