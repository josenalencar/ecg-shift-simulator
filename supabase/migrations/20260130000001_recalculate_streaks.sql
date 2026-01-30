-- Migration: Recalculate all user streaks from actual attempt history
-- This fixes a bug where streaks might have been set to ECG count instead of consecutive days

-- Create a function to calculate streak from attempts
CREATE OR REPLACE FUNCTION calculate_user_streak(p_user_id UUID)
RETURNS TABLE(current_streak INT, longest_streak INT, last_activity_date DATE) AS $$
DECLARE
  v_dates DATE[];
  v_current_streak INT := 0;
  v_longest_streak INT := 0;
  v_temp_streak INT := 0;
  v_prev_date DATE := NULL;
  v_date DATE;
  v_last_activity DATE := NULL;
  v_today DATE := CURRENT_DATE;
BEGIN
  -- Get all unique dates when user made attempts, ordered
  SELECT ARRAY_AGG(DISTINCT DATE(created_at) ORDER BY DATE(created_at))
  INTO v_dates
  FROM attempts
  WHERE user_id = p_user_id;

  -- If no attempts, return zeros
  IF v_dates IS NULL OR array_length(v_dates, 1) IS NULL THEN
    current_streak := 0;
    longest_streak := 0;
    last_activity_date := NULL;
    RETURN NEXT;
    RETURN;
  END IF;

  -- Set last activity date
  v_last_activity := v_dates[array_length(v_dates, 1)];

  -- Calculate streaks by iterating through dates
  FOREACH v_date IN ARRAY v_dates LOOP
    IF v_prev_date IS NULL THEN
      -- First date
      v_temp_streak := 1;
    ELSIF v_date = v_prev_date + INTERVAL '1 day' THEN
      -- Consecutive day
      v_temp_streak := v_temp_streak + 1;
    ELSE
      -- Gap in days, reset streak
      v_temp_streak := 1;
    END IF;

    -- Update longest streak
    IF v_temp_streak > v_longest_streak THEN
      v_longest_streak := v_temp_streak;
    END IF;

    v_prev_date := v_date;
  END LOOP;

  -- Calculate current streak (must include today or yesterday to be active)
  IF v_last_activity >= v_today - INTERVAL '1 day' THEN
    -- Check how many consecutive days leading up to last activity
    v_current_streak := 1;
    FOR i IN REVERSE array_length(v_dates, 1) - 1 .. 1 LOOP
      IF v_dates[i] = v_dates[i + 1] - INTERVAL '1 day' THEN
        v_current_streak := v_current_streak + 1;
      ELSE
        EXIT;
      END IF;
    END LOOP;
  ELSE
    -- Streak is broken (last activity was more than 1 day ago)
    v_current_streak := 0;
  END IF;

  current_streak := v_current_streak;
  longest_streak := v_longest_streak;
  last_activity_date := v_last_activity;
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Update all users' streaks
DO $$
DECLARE
  v_user RECORD;
  v_streak RECORD;
  v_updated INT := 0;
BEGIN
  FOR v_user IN SELECT DISTINCT user_id FROM user_gamification_stats LOOP
    SELECT * INTO v_streak FROM calculate_user_streak(v_user.user_id);

    UPDATE user_gamification_stats
    SET
      current_streak = v_streak.current_streak,
      longest_streak = v_streak.longest_streak,
      last_activity_date = v_streak.last_activity_date
    WHERE user_id = v_user.user_id
    AND (
      current_streak != v_streak.current_streak
      OR longest_streak != v_streak.longest_streak
    );

    IF FOUND THEN
      v_updated := v_updated + 1;
    END IF;
  END LOOP;

  RAISE NOTICE 'Updated streak values for % users', v_updated;
END $$;

-- Drop the function after use (it was just for this migration)
DROP FUNCTION IF EXISTS calculate_user_streak(UUID);
