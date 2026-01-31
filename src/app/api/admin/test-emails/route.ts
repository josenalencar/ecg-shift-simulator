import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  sendWelcomeEmail,
  sendSubscriptionActivatedEmail,
  sendSubscriptionCanceledEmail,
  sendPaymentFailedEmail,
  sendPasswordResetEmail,
  sendRenewalReminderEmail,
  sendXPEventAnnouncementEmail,
  sendFirstCaseCompletedEmail,
  sendDay2SecondTouchEmail,
  sendDay3ProgressCheckEmail,
  sendDay5FeatureDiscoveryEmail,
  sendDay7WeekSummaryEmail,
  sendStreakStarterEmail,
  sendStreakAtRiskEmail,
  sendStreakMilestoneEmail,
  sendLevelUpEmail,
  sendAchievementUnlockedEmail,
  sendWeeklyDigestEmail,
  sendMonthlyReportEmail,
} from '@/lib/email'
import type { WeeklyStats, MonthlyStats, MonthlyComparison } from '@/types/database'

async function checkMasterAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('is_master_admin')
    .eq('id', user.id)
    .single()

  return profile?.is_master_admin ? user.id : null
}

// Mock data for testing emails
const mockWeeklyStats: WeeklyStats = {
  ecgsCompleted: 35,
  perfectScores: 12,
  totalXpEarned: 2850,
  activeDays: 5,
  streakAtEnd: 7,
  levelAtEnd: 15,
  totalXpAtEnd: 12500,
  bestScore: 100,
  worstScore: 65,
  averageScore: 82.5,
  categoriesPracticed: {
    arrhythmia: 12,
    ischemia: 8,
    structural: 6,
    normal: 9,
  },
  difficultiesPracticed: {
    easy: 10,
    medium: 18,
    hard: 7,
  },
  achievementsEarned: ['streak_7', 'perfectionist_5'],
  ecgsDelta: 8,
  xpDelta: 650,
  averageScoreDelta: 3.5,
}

const mockMonthlyStats: MonthlyStats = {
  ...mockWeeklyStats,
  ecgsCompleted: 142,
  perfectScores: 45,
  totalXpEarned: 11200,
  activeDays: 22,
  levelStart: 12,
  levelEnd: 15,
  levelsGained: 3,
  xpStart: 8500,
  xpEnd: 19700,
  streakBest: 14,
  rankAtEnd: 127,
  rankPercentile: 8.5,
  totalAchievementsAtEnd: 23,
  perfectDelta: 12,
  activeDaysDelta: 4,
  rankDelta: 35,
}

const mockMonthlyComparison: MonthlyComparison = {
  ecgsDelta: 28,
  perfectScoresDelta: 8,
  xpDelta: 2100,
  levelDelta: 2,
  averageScoreDelta: 4.2,
  activeDaysDelta: 3,
}

// Email type definitions for the test endpoint
type TestEmailType =
  | 'all'
  // Account emails
  | 'welcome'
  | 'subscriptionActivated'
  | 'subscriptionCanceled'
  | 'paymentFailed'
  | 'passwordReset'
  | 'renewalReminder'
  | 'xpEventAnnouncement'
  // Onboarding emails
  | 'firstCase'
  | 'day2'
  | 'day3'
  | 'day5'
  | 'day7'
  // Engagement emails
  | 'streakStarter'
  | 'streakAtRisk'
  | 'streakMilestone'
  | 'levelUp'
  | 'achievement'
  | 'weeklyDigest'
  | 'monthlyReport'

interface EmailResult {
  type: string
  success: boolean
  error?: unknown
}

const DELAY_BETWEEN_EMAILS_MS = 500

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check if user is master admin
    const adminId = await checkMasterAdmin(supabase)
    if (!adminId) {
      return NextResponse.json({ error: 'Forbidden - Master admin only' }, { status: 403 })
    }

    const body = await request.json()
    const { targetEmail, emailType = 'all' } = body as { targetEmail: string; emailType: TestEmailType }

    if (!targetEmail || !targetEmail.includes('@')) {
      return NextResponse.json({ error: 'Valid targetEmail is required' }, { status: 400 })
    }

    const testName = 'Dr. Teste'
    const results: EmailResult[] = []

    // Helper to send and record result
    async function sendAndRecord(type: string, sendFn: () => Promise<{ success: boolean; error?: unknown }>) {
      try {
        const result = await sendFn()
        results.push({ type, success: result.success, error: result.error })
        console.log(`[Test Emails] ${type}: ${result.success ? 'SUCCESS' : 'FAILED'}`)
      } catch (error) {
        results.push({ type, success: false, error })
        console.error(`[Test Emails] ${type}: EXCEPTION`, error)
      }
      await delay(DELAY_BETWEEN_EMAILS_MS)
    }

    console.log(`[Test Emails] Starting test email send to: ${targetEmail}, type: ${emailType}`)

    // Account Emails
    if (emailType === 'all' || emailType === 'welcome') {
      await sendAndRecord('welcome', () =>
        sendWelcomeEmail(targetEmail, testName)
      )
    }

    if (emailType === 'all' || emailType === 'subscriptionActivated') {
      await sendAndRecord('subscriptionActivated', () =>
        sendSubscriptionActivatedEmail(targetEmail, testName, 'Premium + IA')
      )
    }

    if (emailType === 'all' || emailType === 'subscriptionCanceled') {
      await sendAndRecord('subscriptionCanceled', () =>
        sendSubscriptionCanceledEmail(targetEmail, testName, '28/02/2026')
      )
    }

    if (emailType === 'all' || emailType === 'paymentFailed') {
      await sendAndRecord('paymentFailed', () =>
        sendPaymentFailedEmail(targetEmail, testName)
      )
    }

    if (emailType === 'all' || emailType === 'passwordReset') {
      await sendAndRecord('passwordReset', () =>
        sendPasswordResetEmail(targetEmail, testName, 'https://plantaoecg.com.br/reset-password?token=test-token-123')
      )
    }

    if (emailType === 'all' || emailType === 'renewalReminder') {
      await sendAndRecord('renewalReminder', () =>
        sendRenewalReminderEmail(targetEmail, testName, 'premium', 'R$ 49,90', '15/02/2026')
      )
    }

    if (emailType === 'all' || emailType === 'xpEventAnnouncement') {
      await sendAndRecord('xpEventAnnouncement', () =>
        sendXPEventAnnouncementEmail(targetEmail, testName, 'Fim de Semana Turbinado', '2x', '02/02/2026 23:59')
      )
    }

    // Phase 1 - Onboarding Emails
    if (emailType === 'all' || emailType === 'firstCase') {
      await sendAndRecord('firstCase', () =>
        sendFirstCaseCompletedEmail(targetEmail, testName, 85, 'medium', 127)
      )
    }

    if (emailType === 'all' || emailType === 'day2') {
      await sendAndRecord('day2', () =>
        sendDay2SecondTouchEmail(targetEmail, testName)
      )
    }

    if (emailType === 'all' || emailType === 'day3') {
      await sendAndRecord('day3', () =>
        sendDay3ProgressCheckEmail(targetEmail, testName, 8, 650, 3)
      )
    }

    if (emailType === 'all' || emailType === 'day5') {
      await sendAndRecord('day5', () =>
        sendDay5FeatureDiscoveryEmail(
          targetEmail,
          testName,
          'Ranking de Usuarios',
          'Veja como voce se compara com outros medicos. Acompanhe sua posicao e dispute o topo do ranking!'
        )
      )
    }

    if (emailType === 'all' || emailType === 'day7') {
      await sendAndRecord('day7', () =>
        sendDay7WeekSummaryEmail(targetEmail, testName, mockWeeklyStats)
      )
    }

    // Phase 2 - Engagement Emails
    if (emailType === 'all' || emailType === 'streakStarter') {
      await sendAndRecord('streakStarter', () =>
        sendStreakStarterEmail(targetEmail, testName, 14)
      )
    }

    if (emailType === 'all' || emailType === 'streakAtRisk') {
      await sendAndRecord('streakAtRisk', () =>
        sendStreakAtRiskEmail(targetEmail, testName, 12, 4)
      )
    }

    if (emailType === 'all' || emailType === 'streakMilestone') {
      await sendAndRecord('streakMilestone', () =>
        sendStreakMilestoneEmail(targetEmail, testName, 14, 30, 500)
      )
    }

    if (emailType === 'all' || emailType === 'levelUp') {
      await sendAndRecord('levelUp', () =>
        sendLevelUpEmail(targetEmail, testName, 15, 14, 12500)
      )
    }

    if (emailType === 'all' || emailType === 'achievement') {
      await sendAndRecord('achievement', () =>
        sendAchievementUnlockedEmail(
          targetEmail,
          testName,
          'Mestre da Arritmia',
          'Diagnostique corretamente 50 casos de arritmia',
          'heart-pulse',
          250,
          'epic'
        )
      )
    }

    if (emailType === 'all' || emailType === 'weeklyDigest') {
      await sendAndRecord('weeklyDigest', () =>
        sendWeeklyDigestEmail(
          targetEmail,
          testName,
          mockWeeklyStats,
          { name: 'Streak Semanal', icon: 'flame' },
          127
        )
      )
    }

    if (emailType === 'all' || emailType === 'monthlyReport') {
      await sendAndRecord('monthlyReport', () =>
        sendMonthlyReportEmail(targetEmail, testName, mockMonthlyStats, mockMonthlyComparison)
      )
    }

    const successCount = results.filter(r => r.success).length
    const failCount = results.filter(r => !r.success).length

    console.log(`[Test Emails] Complete. Success: ${successCount}, Failed: ${failCount}`)

    return NextResponse.json({
      message: `Sent ${successCount} emails successfully, ${failCount} failed`,
      targetEmail,
      results,
      summary: {
        total: results.length,
        success: successCount,
        failed: failCount,
      },
    })
  } catch (error) {
    console.error('[Test Emails] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET endpoint to check available email types
export async function GET() {
  try {
    const supabase = await createClient()

    // Check if user is master admin
    const adminId = await checkMasterAdmin(supabase)
    if (!adminId) {
      return NextResponse.json({ error: 'Forbidden - Master admin only' }, { status: 403 })
    }

    return NextResponse.json({
      availableTypes: [
        { type: 'all', description: 'Send all 19 email types' },
        // Account emails
        { type: 'welcome', description: 'Welcome email - new user registration' },
        { type: 'subscriptionActivated', description: 'Subscription activated - payment confirmed' },
        { type: 'subscriptionCanceled', description: 'Subscription canceled - goodbye email' },
        { type: 'paymentFailed', description: 'Payment failed - action required' },
        { type: 'passwordReset', description: 'Password reset link' },
        { type: 'renewalReminder', description: 'Renewal reminder - 3 days before' },
        { type: 'xpEventAnnouncement', description: 'XP Event announcement (2x/3x)' },
        // Phase 1 - Onboarding
        { type: 'firstCase', description: 'First ECG completed (Phase 1)' },
        { type: 'day2', description: 'Day 2 - Second touch (Phase 1)' },
        { type: 'day3', description: 'Day 3 - Progress check (Phase 1)' },
        { type: 'day5', description: 'Day 5 - Feature discovery (Phase 1)' },
        { type: 'day7', description: 'Day 7 - Week summary (Phase 1)' },
        // Phase 2 - Engagement
        { type: 'streakStarter', description: 'Streak starter - re-engagement (Phase 2)' },
        { type: 'streakAtRisk', description: 'Streak at risk - urgent alert (Phase 2)' },
        { type: 'streakMilestone', description: 'Streak milestone celebration (Phase 2)' },
        { type: 'levelUp', description: 'Level up notification (Phase 2)' },
        { type: 'achievement', description: 'Achievement unlocked (Phase 2)' },
        { type: 'weeklyDigest', description: 'Weekly digest - Sunday summary (Phase 2)' },
        { type: 'monthlyReport', description: 'Monthly report - 1st of month (Phase 2)' },
      ],
      usage: {
        method: 'POST',
        body: {
          targetEmail: 'email@example.com',
          emailType: 'all | welcome | subscriptionActivated | subscriptionCanceled | paymentFailed | passwordReset | renewalReminder | xpEventAnnouncement | firstCase | day2 | day3 | day5 | day7 | streakStarter | streakAtRisk | streakMilestone | levelUp | achievement | weeklyDigest | monthlyReport',
        },
      },
    })
  } catch (error) {
    console.error('[Test Emails] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
