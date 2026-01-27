-- Fix duplicate subscriptions for users
-- Keep only the most recent active subscription per user

-- First, delete duplicates keeping only the one with the latest updated_at
-- that has status = 'active' (or the latest one if none are active)
WITH ranked_subs AS (
  SELECT
    id,
    user_id,
    status,
    ROW_NUMBER() OVER (
      PARTITION BY user_id
      ORDER BY
        CASE WHEN status = 'active' THEN 0 ELSE 1 END,
        updated_at DESC NULLS LAST,
        created_at DESC NULLS LAST
    ) as rn
  FROM subscriptions
)
DELETE FROM subscriptions
WHERE id IN (
  SELECT id FROM ranked_subs WHERE rn > 1
);

-- Add unique constraint on user_id to prevent future duplicates
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_user_id_key;
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_user_id_key UNIQUE (user_id);

-- Update the status to active for any subscriptions that should be active
-- (based on having a valid stripe_subscription_id and current_period_end in the future)
UPDATE subscriptions
SET status = 'active'
WHERE stripe_subscription_id IS NOT NULL
  AND current_period_end > NOW()
  AND status != 'active';
