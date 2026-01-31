-- Fix leaderboard visibility for all users
-- The previous RLS policy only allowed users to see their own stats,
-- which broke the leaderboard functionality

-- Drop the restrictive policy
DROP POLICY IF EXISTS "user_gamification_stats_select_own" ON user_gamification_stats;

-- Create new policy that allows all authenticated users to read all gamification stats
-- This is necessary for the leaderboard to work properly
CREATE POLICY "user_gamification_stats_select_all" ON user_gamification_stats
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Note: INSERT and UPDATE policies remain unchanged - users can only modify their own stats
