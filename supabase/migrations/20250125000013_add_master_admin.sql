-- Add is_master_admin column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_master_admin BOOLEAN DEFAULT FALSE;

-- Set josenunesalencar@gmail.com as master admin
UPDATE profiles SET is_master_admin = TRUE WHERE email = 'josenunesalencar@gmail.com';
