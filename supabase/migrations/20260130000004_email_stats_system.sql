-- Migration: Email tracking and stats snapshots for email system
-- Creates tables for tracking sent emails and storing user statistics snapshots

-- ============================================
-- TABLE 1: email_tracking
-- Tracks all emails sent to prevent duplicates
-- ============================================
CREATE TABLE IF NOT EXISTS email_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL,
  -- Types: 'first_case', 'day2', 'day3', 'day5', 'day7',
  --        'streak_starter', 'streak_at_risk', 'streak_milestone',
  --        'level_up', 'achievement', 'weekly_digest', 'monthly_report'
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  -- metadata examples:
  -- For streak_milestone: {"streak_days": 14}
  -- For level_up: {"new_level": 15, "old_level": 14}
  -- For achievement: {"achievement_id": "xyz", "achievement_name": "..."}
  -- For weekly_digest: {"week_start": "2026-01-20", "week_end": "2026-01-26"}
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for email_tracking
CREATE INDEX idx_email_tracking_user_type ON email_tracking(user_id, email_type);
CREATE INDEX idx_email_tracking_sent_at ON email_tracking(sent_at);
-- Note: Using sent_at directly instead of date cast for index (PostgreSQL limitation)

-- Prevent duplicate onboarding emails (one per user per type)
CREATE UNIQUE INDEX idx_email_tracking_onboarding_unique
  ON email_tracking(user_id, email_type)
  WHERE email_type IN ('first_case', 'day2', 'day3', 'day5', 'day7');

-- ============================================
-- TABLE 2: weekly_stats_snapshots
-- Pre-calculated weekly statistics for emails
-- ============================================
CREATE TABLE IF NOT EXISTS weekly_stats_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Week identification (ISO week: Monday to Sunday)
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  year INTEGER NOT NULL,
  week_number INTEGER NOT NULL, -- ISO week number (1-53)

  -- Activity metrics
  ecgs_completed INTEGER DEFAULT 0,
  perfect_scores INTEGER DEFAULT 0,
  total_xp_earned BIGINT DEFAULT 0,
  active_days INTEGER DEFAULT 0, -- Days with at least 1 ECG

  -- Snapshot of state at week end
  streak_at_end INTEGER DEFAULT 0,
  level_at_end INTEGER DEFAULT 1,
  total_xp_at_end BIGINT DEFAULT 0,

  -- Performance metrics
  best_score INTEGER DEFAULT 0,
  worst_score INTEGER DEFAULT 0,
  average_score NUMERIC(5,2) DEFAULT 0,

  -- Breakdown by category (correct diagnoses)
  categories_practiced JSONB DEFAULT '{}',
  -- Example: {"arrhythmia": 10, "ischemia": 8, "structural": 5, "normal": 12}

  -- Breakdown by difficulty
  difficulties_practiced JSONB DEFAULT '{}',
  -- Example: {"easy": 5, "medium": 15, "hard": 5}

  -- Achievements earned this week
  achievements_earned TEXT[] DEFAULT '{}',
  -- Array of achievement slugs: ['streak_7', 'first_perfect']

  -- Comparison with previous week
  ecgs_delta INTEGER DEFAULT 0,
  xp_delta BIGINT DEFAULT 0,
  average_score_delta NUMERIC(5,2) DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure one snapshot per user per week
  UNIQUE(user_id, week_start)
);

-- Indexes for weekly_stats_snapshots
CREATE INDEX idx_weekly_stats_user ON weekly_stats_snapshots(user_id);
CREATE INDEX idx_weekly_stats_week ON weekly_stats_snapshots(week_start);
CREATE INDEX idx_weekly_stats_user_year_week ON weekly_stats_snapshots(user_id, year, week_number);

-- ============================================
-- TABLE 3: monthly_stats_snapshots
-- Pre-calculated monthly statistics for emails
-- ============================================
CREATE TABLE IF NOT EXISTS monthly_stats_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Month identification
  year INTEGER NOT NULL,
  month INTEGER NOT NULL, -- 1-12
  month_start DATE NOT NULL,
  month_end DATE NOT NULL,

  -- Activity metrics
  ecgs_completed INTEGER DEFAULT 0,
  perfect_scores INTEGER DEFAULT 0,
  total_xp_earned BIGINT DEFAULT 0,
  active_days INTEGER DEFAULT 0,

  -- Level progression
  level_start INTEGER DEFAULT 1,
  level_end INTEGER DEFAULT 1,
  levels_gained INTEGER DEFAULT 0,

  -- XP tracking
  xp_start BIGINT DEFAULT 0,
  xp_end BIGINT DEFAULT 0,

  -- Streak tracking
  streak_best INTEGER DEFAULT 0, -- Best streak achieved during month
  streak_at_end INTEGER DEFAULT 0, -- Streak at month end

  -- Performance metrics
  best_score INTEGER DEFAULT 0,
  worst_score INTEGER DEFAULT 0,
  average_score NUMERIC(5,2) DEFAULT 0,

  -- Ranking
  rank_at_end INTEGER, -- Leaderboard position at month end
  rank_percentile NUMERIC(5,2), -- Top X%

  -- Breakdown by category
  categories_practiced JSONB DEFAULT '{}',

  -- Breakdown by difficulty
  difficulties_practiced JSONB DEFAULT '{}',

  -- Achievements earned this month
  achievements_earned TEXT[] DEFAULT '{}',
  total_achievements_at_end INTEGER DEFAULT 0,

  -- Comparison with previous month
  ecgs_delta INTEGER DEFAULT 0,
  xp_delta BIGINT DEFAULT 0,
  perfect_delta INTEGER DEFAULT 0,
  average_score_delta NUMERIC(5,2) DEFAULT 0,
  active_days_delta INTEGER DEFAULT 0,
  rank_delta INTEGER DEFAULT 0, -- Positive = improved rank

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure one snapshot per user per month
  UNIQUE(user_id, year, month)
);

-- Indexes for monthly_stats_snapshots
CREATE INDEX idx_monthly_stats_user ON monthly_stats_snapshots(user_id);
CREATE INDEX idx_monthly_stats_period ON monthly_stats_snapshots(year, month);
CREATE INDEX idx_monthly_stats_user_period ON monthly_stats_snapshots(user_id, year, month);

-- ============================================
-- TABLE 4: user_email_preferences
-- Extended email preferences per user
-- ============================================
CREATE TABLE IF NOT EXISTS user_email_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Granular email controls
  onboarding_emails BOOLEAN DEFAULT true,
  streak_emails BOOLEAN DEFAULT true,
  achievement_emails BOOLEAN DEFAULT true,
  level_up_emails BOOLEAN DEFAULT true,
  weekly_digest BOOLEAN DEFAULT true,
  monthly_report BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT true,

  -- Preferred send time (for digest/reports)
  preferred_hour INTEGER DEFAULT 18, -- 6 PM default
  timezone TEXT DEFAULT 'America/Sao_Paulo',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Enable RLS on all tables
-- ============================================
ALTER TABLE email_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_stats_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_stats_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_email_preferences ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies: Users can only see their own data
-- ============================================

-- email_tracking policies
CREATE POLICY "Users can view own email tracking"
  ON email_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access email_tracking"
  ON email_tracking FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- weekly_stats_snapshots policies
CREATE POLICY "Users can view own weekly stats"
  ON weekly_stats_snapshots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access weekly_stats"
  ON weekly_stats_snapshots FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- monthly_stats_snapshots policies
CREATE POLICY "Users can view own monthly stats"
  ON monthly_stats_snapshots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access monthly_stats"
  ON monthly_stats_snapshots FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- user_email_preferences policies
CREATE POLICY "Users can view own email preferences"
  ON user_email_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own email preferences"
  ON user_email_preferences FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own email preferences"
  ON user_email_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access email_preferences"
  ON user_email_preferences FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- FUNCTION: Get users needing onboarding emails
-- ============================================
CREATE OR REPLACE FUNCTION get_users_for_onboarding_emails()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  full_name TEXT,
  unsubscribe_token TEXT,
  signup_date DATE,
  days_since_signup INTEGER,
  total_ecgs INTEGER,
  email_type TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH user_activity AS (
    SELECT
      p.id AS user_id,
      p.email,
      p.full_name,
      p.unsubscribe_token,
      p.created_at::date AS signup_date,
      (CURRENT_DATE - p.created_at::date) AS days_since_signup,
      COALESCE(ugs.total_ecgs_completed, 0) AS total_ecgs
    FROM profiles p
    LEFT JOIN user_gamification_stats ugs ON ugs.user_id = p.id
    LEFT JOIN user_email_preferences uep ON uep.user_id = p.id
    WHERE p.email_notifications_enabled = true
      AND COALESCE(uep.onboarding_emails, true) = true
  )
  SELECT
    ua.user_id,
    ua.email,
    ua.full_name,
    ua.unsubscribe_token,
    ua.signup_date,
    ua.days_since_signup,
    ua.total_ecgs,
    CASE
      WHEN ua.days_since_signup = 1 AND ua.total_ecgs = 0 THEN 'day2'
      WHEN ua.days_since_signup = 2 THEN 'day3'
      WHEN ua.days_since_signup = 4 THEN 'day5'
      WHEN ua.days_since_signup = 6 THEN 'day7'
    END AS email_type
  FROM user_activity ua
  WHERE (
    -- Day 2: 24h after signup with no activity
    (ua.days_since_signup = 1 AND ua.total_ecgs = 0)
    -- Day 3: 48h after signup
    OR ua.days_since_signup = 2
    -- Day 5: Feature discovery
    OR ua.days_since_signup = 4
    -- Day 7: Week summary
    OR ua.days_since_signup = 6
  )
  AND NOT EXISTS (
    SELECT 1 FROM email_tracking et
    WHERE et.user_id = ua.user_id
      AND et.email_type = CASE
        WHEN ua.days_since_signup = 1 AND ua.total_ecgs = 0 THEN 'day2'
        WHEN ua.days_since_signup = 2 THEN 'day3'
        WHEN ua.days_since_signup = 4 THEN 'day5'
        WHEN ua.days_since_signup = 6 THEN 'day7'
      END
  );
END;
$$;

-- ============================================
-- FUNCTION: Get users with at-risk streaks
-- ============================================
CREATE OR REPLACE FUNCTION get_users_streak_at_risk()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  full_name TEXT,
  unsubscribe_token TEXT,
  current_streak INTEGER,
  hours_remaining INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.email,
    p.full_name,
    p.unsubscribe_token,
    ugs.current_streak,
    GREATEST(0, (36 - EXTRACT(EPOCH FROM (NOW() - (ugs.last_activity_date + INTERVAL '1 day'))) / 3600))::INTEGER
  FROM profiles p
  JOIN user_gamification_stats ugs ON ugs.user_id = p.id
  LEFT JOIN user_email_preferences uep ON uep.user_id = p.id
  WHERE p.email_notifications_enabled = true
    AND COALESCE(uep.streak_emails, true) = true
    AND ugs.current_streak >= 5
    -- Inactive for 20+ hours (within grace period)
    AND ugs.last_activity_date = CURRENT_DATE - 1
    AND EXTRACT(HOUR FROM NOW() AT TIME ZONE 'America/Sao_Paulo') >= 20
    -- Not already notified today
    AND NOT EXISTS (
      SELECT 1 FROM email_tracking et
      WHERE et.user_id = p.id
        AND et.email_type = 'streak_at_risk'
        AND et.sent_at::date = CURRENT_DATE
    );
END;
$$;

-- ============================================
-- FUNCTION: Get users who lost their streak (for streak_starter)
-- ============================================
CREATE OR REPLACE FUNCTION get_users_for_streak_starter()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  full_name TEXT,
  unsubscribe_token TEXT,
  longest_streak INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.email,
    p.full_name,
    p.unsubscribe_token,
    ugs.longest_streak
  FROM profiles p
  JOIN user_gamification_stats ugs ON ugs.user_id = p.id
  LEFT JOIN user_email_preferences uep ON uep.user_id = p.id
  WHERE p.email_notifications_enabled = true
    AND COALESCE(uep.streak_emails, true) = true
    AND ugs.current_streak = 0
    AND ugs.longest_streak >= 3 -- Had a meaningful streak before
    AND ugs.total_ecgs_completed >= 5 -- Active user
    -- Last activity was 2-7 days ago (not too recent, not too old)
    AND ugs.last_activity_date BETWEEN CURRENT_DATE - 7 AND CURRENT_DATE - 2
    -- Not sent this email in last 7 days
    AND NOT EXISTS (
      SELECT 1 FROM email_tracking et
      WHERE et.user_id = p.id
        AND et.email_type = 'streak_starter'
        AND et.sent_at > NOW() - INTERVAL '7 days'
    );
END;
$$;

-- ============================================
-- FUNCTION: Get users for weekly digest
-- ============================================
CREATE OR REPLACE FUNCTION get_users_for_weekly_digest()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  full_name TEXT,
  unsubscribe_token TEXT,
  total_ecgs INTEGER,
  current_level INTEGER,
  current_streak INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.email,
    p.full_name,
    p.unsubscribe_token,
    COALESCE(ugs.total_ecgs_completed, 0),
    COALESCE(ugs.current_level, 1),
    COALESCE(ugs.current_streak, 0)
  FROM profiles p
  LEFT JOIN user_gamification_stats ugs ON ugs.user_id = p.id
  LEFT JOIN user_email_preferences uep ON uep.user_id = p.id
  WHERE p.email_notifications_enabled = true
    AND COALESCE(uep.weekly_digest, true) = true
    -- Has some activity (at least 1 ECG ever)
    AND COALESCE(ugs.total_ecgs_completed, 0) > 0
    -- Not sent this week's digest yet
    AND NOT EXISTS (
      SELECT 1 FROM email_tracking et
      WHERE et.user_id = p.id
        AND et.email_type = 'weekly_digest'
        AND et.sent_at > (CURRENT_DATE - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER)::TIMESTAMPTZ
    );
END;
$$;

-- ============================================
-- FUNCTION: Get users for monthly report
-- ============================================
CREATE OR REPLACE FUNCTION get_users_for_monthly_report()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  full_name TEXT,
  unsubscribe_token TEXT,
  total_ecgs INTEGER,
  current_level INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.email,
    p.full_name,
    p.unsubscribe_token,
    COALESCE(ugs.total_ecgs_completed, 0),
    COALESCE(ugs.current_level, 1)
  FROM profiles p
  LEFT JOIN user_gamification_stats ugs ON ugs.user_id = p.id
  LEFT JOIN user_email_preferences uep ON uep.user_id = p.id
  WHERE p.email_notifications_enabled = true
    AND COALESCE(uep.monthly_report, true) = true
    -- Has some activity (at least 1 ECG ever)
    AND COALESCE(ugs.total_ecgs_completed, 0) > 0
    -- Not sent this month's report yet
    AND NOT EXISTS (
      SELECT 1 FROM email_tracking et
      WHERE et.user_id = p.id
        AND et.email_type = 'monthly_report'
        AND EXTRACT(YEAR FROM et.sent_at) = EXTRACT(YEAR FROM CURRENT_DATE)
        AND EXTRACT(MONTH FROM et.sent_at) = EXTRACT(MONTH FROM CURRENT_DATE)
    );
END;
$$;
