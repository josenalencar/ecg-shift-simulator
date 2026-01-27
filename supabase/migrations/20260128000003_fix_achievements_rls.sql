-- =============================================
-- Fix: Allow users to insert and update their own achievements
-- This was blocking achievement awards because only service_role was allowed
--
-- Root cause: checkAchievements() runs with client-side auth token,
-- but only service_role could insert into user_achievements
-- =============================================

-- Allow users to insert their own achievements (when they earn them)
CREATE POLICY "user_achievements_insert_own" ON user_achievements
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Allow users to update their own achievements (for notified flag)
CREATE POLICY "user_achievements_update_own" ON user_achievements
  FOR UPDATE USING (user_id = auth.uid());
