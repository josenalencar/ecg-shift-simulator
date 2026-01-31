-- Create ecg_dislikes table for tracking user dislikes on ECG cases
CREATE TABLE ecg_dislikes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ecg_id UUID NOT NULL REFERENCES ecgs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ecg_id, user_id)
);

-- Enable RLS
ALTER TABLE ecg_dislikes ENABLE ROW LEVEL SECURITY;

-- Users can insert their own dislikes
CREATE POLICY "Users can dislike ECGs"
  ON ecg_dislikes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own dislikes
CREATE POLICY "Users can view own dislikes"
  ON ecg_dislikes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can delete their own dislikes
CREATE POLICY "Users can remove own dislikes"
  ON ecg_dislikes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can view all dislikes
CREATE POLICY "Admins can view all dislikes"
  ON ecg_dislikes
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'master_admin'))
  );

-- Add index for faster queries
CREATE INDEX idx_ecg_dislikes_ecg_id ON ecg_dislikes(ecg_id);
CREATE INDEX idx_ecg_dislikes_user_id ON ecg_dislikes(user_id);

-- Add comment
COMMENT ON TABLE ecg_dislikes IS 'Tracks user dislikes on ECG cases for quality feedback';
