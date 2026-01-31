-- Add avatar column to profiles table for user customization
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar TEXT DEFAULT 'n1';

-- Add comment for documentation
COMMENT ON COLUMN profiles.avatar IS 'Avatar identifier (e.g., m1-m8 for male, f1-f8 for female, n1-n4 for neutral)';
