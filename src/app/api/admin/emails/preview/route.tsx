import React from 'react'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { render } from '@react-email/render'

// Import all email templates with correct paths
import WelcomeEmail from '@/emails/welcome'
import FirstCaseCompletedEmail from '@/emails/first-case-completed'
import Day2SecondTouchEmail from '@/emails/day2-second-touch'
import Day3ProgressCheckEmail from '@/emails/day3-progress-check'
import Day5FeatureDiscoveryEmail from '@/emails/day5-feature-discovery'
import Day7WeekSummaryEmail from '@/emails/day7-week-summary'
import StreakStarterEmail from '@/emails/streak-starter'
import StreakAtRiskEmail from '@/emails/streak-at-risk'
import StreakMilestoneEmail from '@/emails/streak-milestone'
import LevelUpEmail from '@/emails/level-up'
import AchievementUnlockedEmail from '@/emails/achievement-unlocked'
import WeeklyDigestEmail from '@/emails/weekly-digest'
import MonthlyReportEmail from '@/emails/monthly-report'
import SubscriptionActivatedEmail from '@/emails/subscription-activated'
import SubscriptionCanceledEmail from '@/emails/subscription-canceled'
import PaymentFailedEmail from '@/emails/payment-failed'
import PasswordResetEmail from '@/emails/password-reset'
import RenewalReminderEmail from '@/emails/renewal-reminder'
import XPEventAnnouncementEmail from '@/emails/xp-event-announcement'

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

// Mock data for email previews
const mockData = {
  userName: 'Dr. João Silva',
  firstName: 'João',
  // First case
  caseName: 'IAM com Supra de ST',
  diagnosisAccuracy: 85,
  timeSpent: '3:45',
  xpEarned: 150,
  // Day emails
  totalUsers: 2500,
  // Streak
  previousStreak: 7,
  daysInactive: 3,
  currentStreak: 14,
  hoursRemaining: 8,
  milestone: 30,
  // Level
  newLevel: 12,
  totalXP: 4500,
  // Achievement
  achievementName: 'Mestre do Ritmo',
  achievementDescription: 'Acerte 50 arritmias consecutivas',
  achievementIcon: '🏆',
  // Weekly
  weeklyXP: 850,
  ecgsCompleted: 12,
  perfectScores: 4,
  longestStreak: 7,
  rankChange: 15,
  currentRank: 42,
  topDiagnoses: [
    { name: 'Fibrilação Atrial', count: 5, accuracy: 95 },
    { name: 'IAM com Supra', count: 4, accuracy: 88 },
    { name: 'Bloqueio AV', count: 3, accuracy: 92 }
  ],
  // Monthly
  monthName: 'Janeiro 2026',
  monthlyXP: 3200,
  monthlyEcgs: 48,
  monthlyPerfect: 15,
  monthlyStreak: 21,
  levelProgress: { start: 10, end: 12, xpGained: 2800 },
  monthlyAchievements: [
    { name: 'Velocista', icon: '⚡' },
    { name: 'Perfeccionista', icon: '✨' }
  ],
  monthlyTopDiagnoses: [
    { name: 'Fibrilação Atrial', count: 15, accuracy: 94 },
    { name: 'Flutter Atrial', count: 10, accuracy: 90 },
    { name: 'IAM', count: 8, accuracy: 88 }
  ],
  improvementAreas: ['Bloqueios de Ramo', 'Sobrecargas']
}

// Map email types to their components and props
// Note: Using type assertions for preview purposes - props may not match exact interface
// but will render with mock data for admin preview functionality
function getEmailComponent(emailType: string): React.ReactElement | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const components: Record<string, React.ComponentType<any>> = {
    welcome: WelcomeEmail,
    first_case: FirstCaseCompletedEmail,
    day2: Day2SecondTouchEmail,
    day3: Day3ProgressCheckEmail,
    day5: Day5FeatureDiscoveryEmail,
    day7: Day7WeekSummaryEmail,
    streak_starter: StreakStarterEmail,
    streak_at_risk: StreakAtRiskEmail,
    streak_milestone: StreakMilestoneEmail,
    level_up: LevelUpEmail,
    achievement: AchievementUnlockedEmail,
    weekly_digest: WeeklyDigestEmail,
    monthly_report: MonthlyReportEmail,
    subscription_activated: SubscriptionActivatedEmail,
    subscription_canceled: SubscriptionCanceledEmail,
    payment_failed: PaymentFailedEmail,
    password_reset: PasswordResetEmail,
    renewal_reminder: RenewalReminderEmail,
    xp_event_announcement: XPEventAnnouncementEmail
  }

  // Mock props for each email type
  const mockProps: Record<string, Record<string, unknown>> = {
    welcome: { name: mockData.userName },
    first_case: { name: mockData.userName, score: 85, difficulty: 'medium' },
    day2: { name: mockData.firstName },
    day3: { name: mockData.firstName, ecgsCompleted: 5, totalXp: 450 },
    day5: { name: mockData.firstName, featureName: 'IA Feedback', featureDescription: 'Receba feedback personalizado' },
    day7: { name: mockData.firstName, weekStats: { ecgsCompleted: 12, totalXp: 1200, avgScore: 85 } },
    streak_starter: { name: mockData.firstName, previousBestStreak: 7 },
    streak_at_risk: { name: mockData.firstName, currentStreak: 14, hoursRemaining: 8 },
    streak_milestone: { name: mockData.firstName, streakDays: 30, nextMilestone: 60 },
    level_up: { name: mockData.firstName, newLevel: 12, previousLevel: 11 },
    achievement: { name: mockData.firstName, achievementName: 'Mestre do Ritmo', achievementDescription: 'Acerte 50 arritmias', achievementIcon: '🏆' },
    weekly_digest: { name: mockData.firstName, weekStats: { ecgsCompleted: 12, totalXp: 850, avgScore: 88 }, topAchievement: null },
    monthly_report: { name: mockData.firstName, monthStats: { ecgsCompleted: 48, totalXp: 3200 }, previousMonthComparison: { xpChange: 500, ecgsChange: 10 } },
    subscription_activated: { name: mockData.firstName, plan: 'Premium + IA' },
    subscription_canceled: { name: mockData.firstName, endDate: '28/02/2026' },
    payment_failed: { name: mockData.firstName },
    password_reset: { name: mockData.firstName, resetLink: 'https://exemplo.com/reset' },
    renewal_reminder: { name: mockData.firstName, plan: 'premium', amount: 'R$ 49,90' },
    xp_event_announcement: { name: mockData.firstName, eventName: 'Fim de Semana Turbinado', eventType: '2x' }
  }

  const Component = components[emailType]
  const props = mockProps[emailType]

  if (!Component) return null

  return <Component {...props} />
}

// GET - Get email preview HTML
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is master admin
    const adminId = await checkMasterAdmin(supabase)
    if (!adminId) {
      return NextResponse.json({ error: 'Forbidden - Master admin only' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const emailType = searchParams.get('type')

    if (!emailType) {
      return NextResponse.json({ error: 'email type is required' }, { status: 400 })
    }

    const emailComponent = getEmailComponent(emailType)

    if (!emailComponent) {
      return NextResponse.json({
        html: `
          <div style="padding: 40px; text-align: center; font-family: sans-serif;">
            <h2 style="color: #6b7280;">Template não disponível</h2>
            <p style="color: #9ca3af;">
              O template para "${emailType}" ainda não foi implementado.
            </p>
          </div>
        `,
        available: false
      })
    }

    const html = await render(emailComponent)

    return NextResponse.json({ html, available: true })
  } catch (error) {
    console.error('[Email Preview] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
