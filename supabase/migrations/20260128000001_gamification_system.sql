-- ============================================
-- GAMIFICATION SYSTEM MIGRATION
-- ECG Shift Simulator - Gamification Tables
-- ============================================

-- 1. Gamification Config (Singleton - ALL rules editable by master admin)
CREATE TABLE IF NOT EXISTS gamification_config (
  id TEXT PRIMARY KEY DEFAULT 'default',

  -- XP Settings
  xp_per_ecg_base INTEGER DEFAULT 10,
  xp_per_score_point DECIMAL DEFAULT 0.5,
  xp_difficulty_multipliers JSONB DEFAULT '{"easy": 0.8, "medium": 1.0, "hard": 1.3}',
  xp_streak_bonus_per_day DECIMAL DEFAULT 0.5,
  xp_streak_bonus_max INTEGER DEFAULT 15,
  xp_perfect_bonus INTEGER DEFAULT 25,

  -- Level Settings
  level_multiplier_per_level DECIMAL DEFAULT 0.002525,
  max_level INTEGER DEFAULT 100,
  xp_per_level_base INTEGER DEFAULT 100,
  xp_per_level_growth DECIMAL DEFAULT 1.15,

  -- Event Multipliers (additive, not multiplicative)
  event_2x_bonus DECIMAL DEFAULT 0.125,
  event_3x_bonus DECIMAL DEFAULT 0.25,

  -- Streak Settings
  streak_grace_period_hours INTEGER DEFAULT 36,

  -- Email Settings
  inactivity_email_days JSONB DEFAULT '[7, 30, 60]',
  inactivity_event_duration_hours INTEGER DEFAULT 24,

  -- Ranking Settings
  ranking_top_n_visible INTEGER DEFAULT 10,

  -- Timestamps
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Insert default config
INSERT INTO gamification_config (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;

-- 2. User Gamification Stats
CREATE TABLE IF NOT EXISTS user_gamification_stats (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  total_xp BIGINT DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  total_ecgs_completed INTEGER DEFAULT 0,
  total_perfect_scores INTEGER DEFAULT 0,
  ecgs_by_difficulty JSONB DEFAULT '{"easy": 0, "medium": 0, "hard": 0}',
  correct_by_category JSONB DEFAULT '{}',
  correct_by_finding JSONB DEFAULT '{}',
  perfect_streak INTEGER DEFAULT 0,
  events_participated INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Achievements (100 achievements)
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name_pt TEXT NOT NULL,
  description_pt TEXT NOT NULL,
  icon TEXT NOT NULL,
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  category TEXT NOT NULL CHECK (category IN ('ecg_count', 'diagnosis', 'streak', 'perfect', 'level', 'special', 'hospital', 'pediatric')),
  unlock_type TEXT NOT NULL CHECK (unlock_type IN ('counter', 'streak', 'category', 'special')),
  unlock_conditions JSONB NOT NULL,
  xp_reward INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. User Achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  notified BOOLEAN DEFAULT false,
  UNIQUE(user_id, achievement_id)
);

-- 5. XP Events (Admin-managed events)
CREATE TABLE IF NOT EXISTS xp_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  multiplier_type TEXT NOT NULL CHECK (multiplier_type IN ('2x', '3x')),
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  target_type TEXT NOT NULL DEFAULT 'all' CHECK (target_type IN ('all', 'inactive_7d', 'inactive_30d', 'inactive_60d', 'user_specific')),
  target_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. User XP Events (Track which users see which events)
CREATE TABLE IF NOT EXISTS user_xp_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES xp_events(id) ON DELETE CASCADE,
  email_sent_at TIMESTAMPTZ,
  participated BOOLEAN DEFAULT false,
  UNIQUE(user_id, event_id)
);

-- 7. Inactivity Emails (Track sent emails)
CREATE TABLE IF NOT EXISTS inactivity_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  days_inactive INTEGER NOT NULL,
  event_id UUID REFERENCES xp_events(id) ON DELETE SET NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_gamification_stats_total_xp ON user_gamification_stats(total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_user_gamification_stats_level ON user_gamification_stats(current_level DESC);
CREATE INDEX IF NOT EXISTS idx_user_gamification_stats_streak ON user_gamification_stats(current_streak DESC);
CREATE INDEX IF NOT EXISTS idx_user_gamification_stats_last_activity ON user_gamification_stats(last_activity_date DESC);

CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);
CREATE INDEX IF NOT EXISTS idx_achievements_rarity ON achievements(rarity);
CREATE INDEX IF NOT EXISTS idx_achievements_display_order ON achievements(display_order);
CREATE INDEX IF NOT EXISTS idx_achievements_active ON achievements(is_active);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_earned ON user_achievements(earned_at DESC);

CREATE INDEX IF NOT EXISTS idx_xp_events_active ON xp_events(is_active, start_at, end_at);
CREATE INDEX IF NOT EXISTS idx_xp_events_target ON xp_events(target_type);

CREATE INDEX IF NOT EXISTS idx_inactivity_emails_user ON inactivity_emails(user_id, sent_at DESC);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE gamification_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_gamification_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_xp_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE inactivity_emails ENABLE ROW LEVEL SECURITY;

-- Gamification Config: Read by all, update by master admin only
CREATE POLICY "gamification_config_read" ON gamification_config
  FOR SELECT USING (true);

CREATE POLICY "gamification_config_update" ON gamification_config
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_master_admin = true
    )
  );

-- User Gamification Stats: Users can read their own, admins can read all
CREATE POLICY "user_gamification_stats_select_own" ON user_gamification_stats
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "user_gamification_stats_insert_own" ON user_gamification_stats
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_gamification_stats_update_own" ON user_gamification_stats
  FOR UPDATE USING (user_id = auth.uid());

-- For service role (backend operations)
CREATE POLICY "user_gamification_stats_service" ON user_gamification_stats
  FOR ALL USING (auth.role() = 'service_role');

-- Achievements: Read by all authenticated users
CREATE POLICY "achievements_read" ON achievements
  FOR SELECT USING (auth.uid() IS NOT NULL AND is_active = true);

-- Admins can read all achievements (including inactive)
CREATE POLICY "achievements_admin_read" ON achievements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Master admin can modify achievements
CREATE POLICY "achievements_master_admin" ON achievements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_master_admin = true
    )
  );

-- User Achievements: Users can read their own
CREATE POLICY "user_achievements_select_own" ON user_achievements
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Service role can insert/update user achievements
CREATE POLICY "user_achievements_service" ON user_achievements
  FOR ALL USING (auth.role() = 'service_role');

-- XP Events: Read active events if user is target or event is for all
CREATE POLICY "xp_events_read" ON xp_events
  FOR SELECT USING (
    is_active = true
    AND NOW() BETWEEN start_at AND end_at
    AND (
      target_type = 'all'
      OR target_user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM user_xp_events
        WHERE user_xp_events.event_id = xp_events.id
        AND user_xp_events.user_id = auth.uid()
      )
    )
  );

-- Admins can read all events
CREATE POLICY "xp_events_admin_read" ON xp_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Master admin can manage events
CREATE POLICY "xp_events_master_admin" ON xp_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_master_admin = true
    )
  );

-- Admins can create events
CREATE POLICY "xp_events_admin_insert" ON xp_events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- User XP Events: Users can read their own
CREATE POLICY "user_xp_events_select_own" ON user_xp_events
  FOR SELECT USING (user_id = auth.uid());

-- Service role can manage user xp events
CREATE POLICY "user_xp_events_service" ON user_xp_events
  FOR ALL USING (auth.role() = 'service_role');

-- Inactivity Emails: Only service role can access
CREATE POLICY "inactivity_emails_service" ON inactivity_emails
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- TRIGGER FOR updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_gamification_config_updated_at ON gamification_config;
CREATE TRIGGER update_gamification_config_updated_at
  BEFORE UPDATE ON gamification_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_gamification_stats_updated_at ON user_gamification_stats;
CREATE TRIGGER update_user_gamification_stats_updated_at
  BEFORE UPDATE ON user_gamification_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
