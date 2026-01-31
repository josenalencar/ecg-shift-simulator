-- Add email notification preferences to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS unsubscribe_token UUID DEFAULT gen_random_uuid();

-- Create unique index on unsubscribe_token for fast lookup
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_unsubscribe_token ON profiles(unsubscribe_token);

-- Add comments
COMMENT ON COLUMN profiles.email_notifications_enabled IS 'Whether user wants to receive email notifications';
COMMENT ON COLUMN profiles.unsubscribe_token IS 'Unique token for one-click email unsubscribe';
