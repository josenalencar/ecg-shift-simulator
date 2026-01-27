-- =============================================
-- Remove insecure user_achievements policies
-- Achievements should only be awarded server-side via service_role
-- =============================================

-- Drop the insecure policies if they exist
DROP POLICY IF EXISTS "user_achievements_insert_own" ON user_achievements;
DROP POLICY IF EXISTS "user_achievements_update_own" ON user_achievements;

-- Keep only:
-- 1. user_achievements_select_own - users can VIEW their achievements
-- 2. user_achievements_service - service_role can INSERT/UPDATE (server-side only)
