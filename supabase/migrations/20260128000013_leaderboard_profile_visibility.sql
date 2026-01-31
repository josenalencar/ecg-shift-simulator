-- Migration: Allow authenticated users to view profiles for leaderboard
-- Description: Enables leaderboard to show names for top ranked users
-- Previously, only users could see their own profile, causing "Usuário" to show for everyone

-- Allow authenticated users to view other users' profiles for leaderboard
-- This enables the leaderboard to show names for top ranked users
-- Write operations (UPDATE, DELETE, INSERT) remain restricted by other policies

CREATE POLICY "Authenticated users can view profiles for leaderboard"
  ON public.profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);
