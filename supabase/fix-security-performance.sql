-- Fix Security and Performance Issues
-- Run this in Supabase SQL Editor after the initial schema

-- ============================================
-- FIX 1: Functions with mutable search_path
-- ============================================

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql'
SET search_path = public;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER
SET search_path = public;

-- ============================================
-- FIX 2: Recreate view without SECURITY DEFINER
-- ============================================

DROP VIEW IF EXISTS user_stats;

CREATE VIEW user_stats AS
SELECT
  user_id,
  COUNT(*) as total_attempts,
  AVG(score) as average_score,
  COUNT(CASE WHEN score >= 80 THEN 1 END) as correct_count,
  MAX(created_at) as last_attempt_at
FROM attempts
GROUP BY user_id;

GRANT SELECT ON user_stats TO authenticated;

-- ============================================
-- FIX 3: Optimize RLS policies with (select auth.uid())
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Anyone authenticated can view active ECGs" ON ecgs;
DROP POLICY IF EXISTS "Admins can view all ECGs" ON ecgs;
DROP POLICY IF EXISTS "Admins can insert ECGs" ON ecgs;
DROP POLICY IF EXISTS "Admins can update ECGs" ON ecgs;
DROP POLICY IF EXISTS "Admins can delete ECGs" ON ecgs;
DROP POLICY IF EXISTS "Authenticated users can view reports for active ECGs" ON official_reports;
DROP POLICY IF EXISTS "Admins can manage all reports" ON official_reports;
DROP POLICY IF EXISTS "Users can view their own attempts" ON attempts;
DROP POLICY IF EXISTS "Users can insert their own attempts" ON attempts;
DROP POLICY IF EXISTS "Admins can view all attempts" ON attempts;

-- Recreate profiles policies (optimized)
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING ((select auth.uid()) = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
    )
  );

-- Recreate ECGs policies (optimized)
CREATE POLICY "Anyone authenticated can view active ECGs"
  ON ecgs FOR SELECT
  USING ((select auth.role()) = 'authenticated' AND is_active = true);

CREATE POLICY "Admins can view all ECGs"
  ON ecgs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert ECGs"
  ON ecgs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update ECGs"
  ON ecgs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete ECGs"
  ON ecgs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
    )
  );

-- Recreate official_reports policies (optimized)
CREATE POLICY "Authenticated users can view reports for active ECGs"
  ON official_reports FOR SELECT
  USING (
    (select auth.role()) = 'authenticated' AND
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
      WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
    )
  );

-- Recreate attempts policies (optimized)
CREATE POLICY "Users can view their own attempts"
  ON attempts FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own attempts"
  ON attempts FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Admins can view all attempts"
  ON attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin'
    )
  );
