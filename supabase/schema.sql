-- ECG Shift Simulator Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension (usually already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ECG Cases table
CREATE TABLE ecgs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  category TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('arrhythmia', 'ischemia', 'conduction', 'normal', 'other')),
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Official Reports table (the correct answers)
CREATE TABLE official_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ecg_id UUID REFERENCES ecgs(id) ON DELETE CASCADE UNIQUE,
  rhythm TEXT[] NOT NULL DEFAULT '{}',
  regularity TEXT NOT NULL DEFAULT 'regular' CHECK (regularity IN ('regular', 'irregular')),
  heart_rate INTEGER NOT NULL,
  axis TEXT NOT NULL DEFAULT 'normal' CHECK (axis IN ('normal', 'left', 'right', 'extreme')),
  pr_interval TEXT NOT NULL DEFAULT 'normal' CHECK (pr_interval IN ('normal', 'prolonged', 'short')),
  qrs_duration TEXT NOT NULL DEFAULT 'normal' CHECK (qrs_duration IN ('normal', 'wide')),
  qt_interval TEXT NOT NULL DEFAULT 'normal' CHECK (qt_interval IN ('normal', 'prolonged')),
  findings TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Attempts table
CREATE TABLE attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  ecg_id UUID REFERENCES ecgs(id) ON DELETE CASCADE NOT NULL,
  rhythm TEXT[] NOT NULL DEFAULT '{}',
  regularity TEXT NOT NULL DEFAULT 'regular',
  heart_rate INTEGER NOT NULL,
  axis TEXT NOT NULL DEFAULT 'normal',
  pr_interval TEXT NOT NULL DEFAULT 'normal',
  qrs_duration TEXT NOT NULL DEFAULT 'normal',
  qt_interval TEXT NOT NULL DEFAULT 'normal',
  findings TEXT[] NOT NULL DEFAULT '{}',
  score DECIMAL NOT NULL DEFAULT 0,
  feedback JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX idx_ecgs_active ON ecgs(is_active);
CREATE INDEX idx_ecgs_difficulty ON ecgs(difficulty);
CREATE INDEX idx_ecgs_category ON ecgs(category);
CREATE INDEX idx_attempts_user_id ON attempts(user_id);
CREATE INDEX idx_attempts_ecg_id ON attempts(ecg_id);
CREATE INDEX idx_attempts_created_at ON attempts(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ecgs_updated_at
  BEFORE UPDATE ON ecgs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_official_reports_updated_at
  BEFORE UPDATE ON official_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger to create profile on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE official_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ECGs policies
CREATE POLICY "Anyone authenticated can view active ECGs"
  ON ecgs FOR SELECT
  USING (auth.role() = 'authenticated' AND is_active = true);

CREATE POLICY "Admins can view all ECGs"
  ON ecgs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert ECGs"
  ON ecgs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update ECGs"
  ON ecgs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete ECGs"
  ON ecgs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Official Reports policies
CREATE POLICY "Authenticated users can view reports for active ECGs"
  ON official_reports FOR SELECT
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM ecgs
      WHERE ecgs.id = official_reports.ecg_id AND ecgs.is_active = true
    )
  );

CREATE POLICY "Admins can manage all reports"
  ON official_reports FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Attempts policies
CREATE POLICY "Users can view their own attempts"
  ON attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own attempts"
  ON attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all attempts"
  ON attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- View for user statistics
CREATE OR REPLACE VIEW user_stats AS
SELECT
  user_id,
  COUNT(*) as total_attempts,
  AVG(score) as average_score,
  COUNT(CASE WHEN score >= 80 THEN 1 END) as correct_count,
  MAX(created_at) as last_attempt_at
FROM attempts
GROUP BY user_id;

-- Grant access to the view
GRANT SELECT ON user_stats TO authenticated;
