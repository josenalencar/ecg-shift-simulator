-- Migration: Email Automations System
-- Creates tables for:
-- 1. Resend contact sync tracking
-- 2. Email automation rules
-- 3. Automation execution tracking

-- =============================================
-- 1. Resend Contact Sync Tracking
-- =============================================

CREATE TABLE IF NOT EXISTS resend_contact_sync (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  resend_contact_id TEXT,
  default_audience_id TEXT,
  segment_audiences TEXT[] DEFAULT '{}',
  last_synced_at TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resend_sync_status ON resend_contact_sync(sync_status);
CREATE INDEX IF NOT EXISTS idx_resend_sync_audience ON resend_contact_sync(default_audience_id);

-- =============================================
-- 2. Email Automation Rules
-- =============================================

CREATE TABLE IF NOT EXISTS email_automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Info
  name TEXT NOT NULL,
  description TEXT,

  -- Email Selection (references email_config)
  email_type TEXT NOT NULL REFERENCES email_config(email_type) ON DELETE CASCADE,

  -- Targeting
  segment_type TEXT NOT NULL DEFAULT 'all_users',
  resend_audience_id TEXT,

  -- Trigger Configuration
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('event', 'scheduled', 'one_time')),

  -- Event-based trigger config
  trigger_event TEXT CHECK (trigger_event IN (
    'user_signup',
    'first_ecg_completed',
    'subscription_activated',
    'subscription_canceled',
    'streak_lost',
    'level_up',
    'achievement_unlocked'
  )),
  trigger_delay_hours INTEGER DEFAULT 0,

  -- Schedule-based trigger config
  schedule_type TEXT CHECK (schedule_type IN ('daily', 'weekly', 'monthly')),
  schedule_day INTEGER CHECK (schedule_day >= 0 AND schedule_day <= 31),
  schedule_hour INTEGER DEFAULT 10 CHECK (schedule_hour >= 0 AND schedule_hour <= 23),
  schedule_timezone TEXT DEFAULT 'America/Sao_Paulo',

  -- One-time trigger config
  one_time_datetime TIMESTAMPTZ,

  -- Recurrence limits
  max_sends_per_user INTEGER,
  min_days_between_sends INTEGER DEFAULT 1,

  -- Status
  is_enabled BOOLEAN DEFAULT false,
  is_paused BOOLEAN DEFAULT false,

  -- Execution tracking
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  total_sent INTEGER DEFAULT 0,

  -- Metadata
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_automations_enabled ON email_automations(is_enabled, is_paused);
CREATE INDEX IF NOT EXISTS idx_automations_next_run ON email_automations(next_run_at) WHERE is_enabled = true AND is_paused = false;
CREATE INDEX IF NOT EXISTS idx_automations_email_type ON email_automations(email_type);
CREATE INDEX IF NOT EXISTS idx_automations_trigger_event ON email_automations(trigger_event) WHERE trigger_type = 'event';

-- =============================================
-- 3. Automation Execution Tracking
-- =============================================

CREATE TABLE IF NOT EXISTS email_automation_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id UUID NOT NULL REFERENCES email_automations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  resend_email_id TEXT,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed')),
  error_message TEXT,
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_automation_sends_automation ON email_automation_sends(automation_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_automation_sends_user ON email_automation_sends(user_id, automation_id);
CREATE INDEX IF NOT EXISTS idx_automation_sends_status ON email_automation_sends(status);

-- =============================================
-- 4. Update Triggers
-- =============================================

-- Auto-update updated_at for resend_contact_sync
CREATE OR REPLACE FUNCTION update_resend_sync_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_resend_sync_updated_at
  BEFORE UPDATE ON resend_contact_sync
  FOR EACH ROW
  EXECUTE FUNCTION update_resend_sync_updated_at();

-- Auto-update updated_at for email_automations
CREATE OR REPLACE FUNCTION update_automation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_automation_updated_at
  BEFORE UPDATE ON email_automations
  FOR EACH ROW
  EXECUTE FUNCTION update_automation_updated_at();

-- =============================================
-- 5. RLS Policies
-- =============================================

-- Enable RLS
ALTER TABLE resend_contact_sync ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_automation_sends ENABLE ROW LEVEL SECURITY;

-- Service role has full access (for API routes)
CREATE POLICY "Service role full access on resend_contact_sync"
  ON resend_contact_sync
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access on email_automations"
  ON email_automations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access on email_automation_sends"
  ON email_automation_sends
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================
-- 6. Comments
-- =============================================

COMMENT ON TABLE resend_contact_sync IS 'Tracks sync status of users to Resend audiences';
COMMENT ON TABLE email_automations IS 'Stores email automation rules with targeting and scheduling';
COMMENT ON TABLE email_automation_sends IS 'Tracks individual email sends per automation per user';

COMMENT ON COLUMN email_automations.trigger_type IS 'event=triggered by app events, scheduled=cron-like, one_time=single execution';
COMMENT ON COLUMN email_automations.segment_type IS 'Target audience: all_users, free, premium, premium_ai, ecg_com_ja, cortesia, active_7d, inactive_30d';
COMMENT ON COLUMN email_automations.schedule_day IS 'For weekly: 0-6 (Sun-Sat). For monthly: 1-31';
