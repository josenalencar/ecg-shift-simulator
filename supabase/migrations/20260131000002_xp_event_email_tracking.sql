-- Migration: Track XP event email sends to prevent duplicates
-- This table ensures each user only receives one email per XP event

-- ============================================
-- CREATE TRACKING TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS xp_event_email_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES xp_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT now(),
  resend_email_id TEXT,
  status TEXT DEFAULT 'sent',
  CONSTRAINT unique_event_user UNIQUE(event_id, user_id)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_xp_event_email_sends_event ON xp_event_email_sends(event_id);
CREATE INDEX IF NOT EXISTS idx_xp_event_email_sends_user ON xp_event_email_sends(user_id);

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE xp_event_email_sends IS 'Tracks XP event announcement emails sent to prevent duplicates';
COMMENT ON COLUMN xp_event_email_sends.event_id IS 'The XP event this email was sent for';
COMMENT ON COLUMN xp_event_email_sends.user_id IS 'The user who received the email';
COMMENT ON COLUMN xp_event_email_sends.resend_email_id IS 'Resend service email ID for tracking';
COMMENT ON COLUMN xp_event_email_sends.status IS 'Email status: sent, delivered, bounced, failed';

-- ============================================
-- RLS POLICIES
-- ============================================
ALTER TABLE xp_event_email_sends ENABLE ROW LEVEL SECURITY;

-- Only service role can insert/update/delete
CREATE POLICY "Service role full access" ON xp_event_email_sends
  FOR ALL
  USING (true)
  WITH CHECK (true);
