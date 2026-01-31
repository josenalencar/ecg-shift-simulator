import { Resend } from 'resend'
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

  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: `Seu streak de ${currentStreak} dias termina em ${hoursRemaining} horas!`,
      react: StreakAtRiskEmail({ name, currentStreak, hoursRemaining, unsubscribeToken }),
    })

    if (error) {
      console.error('[Email] Failed to send streak at risk email:', error)
      return { success: false, error }
    }

    console.log('[Email] Streak at risk email sent successfully:', data)
    return { success: true, data }
  } catch (error) {
    console.error('[Email] Exception sending streak at risk email:', error)
    return { success: false, error }
  }
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

  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: `${streakDays} DIAS! Voce esta entre os mais dedicados`,
      react: StreakMilestoneEmail({ name, streakDays, nextMilestone, xpBonus, unsubscribeToken }),
    })

    if (error) {
      console.error('[Email] Failed to send streak milestone email:', error)
      return { success: false, error }
    }

    console.log('[Email] Streak milestone email sent successfully:', data)
    return { success: true, data }
  } catch (error) {
    console.error('[Email] Exception sending streak milestone email:', error)
    return { success: false, error }
  }
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

  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: `Level ${newLevel} desbloqueado!`,
      react: LevelUpEmail({ name, newLevel, previousLevel, totalXp, unsubscribeToken }),
    })

    if (error) {
      console.error('[Email] Failed to send level up email:', error)
      return { success: false, error }
    }

    console.log('[Email] Level up email sent successfully:', data)
    return { success: true, data }
  } catch (error) {
    console.error('[Email] Exception sending level up email:', error)
    return { success: false, error }
  }
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

  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: `Sua semana em numeros: ${weekStats.ecgsCompleted} ECGs, +${weekStats.totalXpEarned} XP`,
      react: WeeklyDigestEmail({ name, weekStats, topAchievement, leaderboardPosition, unsubscribeToken }),
    })

    if (error) {
      console.error('[Email] Failed to send weekly digest email:', error)
      return { success: false, error }
    }

    console.log('[Email] Weekly digest email sent successfully:', data)
    return { success: true, data }
  } catch (error) {
    console.error('[Email] Exception sending weekly digest email:', error)
    return { success: false, error }
  }
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
