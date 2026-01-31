-- Migration: Fix invalid streaks
-- Description: Reset streaks that exceed the number of days since user account creation
-- This fixes a bug where users could have impossible streak values

-- Reset streaks that exceed days since user creation
UPDATE user_gamification_stats ugs
SET
  current_streak = GREATEST(1, LEAST(
    current_streak,
    EXTRACT(DAY FROM NOW() - p.created_at)::int + 1
  )),
  longest_streak = GREATEST(1, LEAST(
    longest_streak,
    EXTRACT(DAY FROM NOW() - p.created_at)::int + 1
  ))
FROM profiles p
WHERE ugs.user_id = p.id
AND (
  ugs.current_streak > EXTRACT(DAY FROM NOW() - p.created_at)::int + 1
  OR ugs.longest_streak > EXTRACT(DAY FROM NOW() - p.created_at)::int + 1
);

-- Log the fix (for audit purposes)
DO $$
DECLARE
  affected_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO affected_count
  FROM user_gamification_stats ugs
  JOIN profiles p ON ugs.user_id = p.id
  WHERE ugs.current_streak > EXTRACT(DAY FROM NOW() - p.created_at)::int + 1;

  RAISE NOTICE 'Fixed % users with invalid streak values', affected_count;
END $$;
