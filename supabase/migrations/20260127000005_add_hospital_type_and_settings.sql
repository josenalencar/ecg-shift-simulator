-- Add hospital_type column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hospital_type TEXT DEFAULT NULL;

COMMENT ON COLUMN profiles.hospital_type IS 'User preferred hospital type: emergency, general, cardiology';

-- Create admin settings table for hospital randomization config
CREATE TABLE IF NOT EXISTS admin_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  hospital_weights JSONB NOT NULL DEFAULT '{
    "emergency": {
      "categories": {"arrhythmia": 3, "ischemia": 3, "conduction": 2, "normal": 1, "other": 1},
      "difficulties": {"easy": 1, "medium": 2, "hard": 2}
    },
    "general": {
      "categories": {"arrhythmia": 1, "ischemia": 1, "conduction": 1, "normal": 3, "other": 2},
      "difficulties": {"easy": 2, "medium": 2, "hard": 1}
    },
    "cardiology": {
      "categories": {"arrhythmia": 2, "ischemia": 2, "conduction": 2, "normal": 1, "other": 1},
      "difficulties": {"easy": 1, "medium": 2, "hard": 3}
    }
  }',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings if not exists
INSERT INTO admin_settings (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read settings
CREATE POLICY "Anyone can read admin settings"
  ON admin_settings FOR SELECT
  USING (true);

-- Only admins can update settings
CREATE POLICY "Admins can update settings"
  ON admin_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_admin_settings_updated_at
  BEFORE UPDATE ON admin_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
