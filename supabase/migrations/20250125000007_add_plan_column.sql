-- Add plan column to subscriptions table
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'premium';

-- Add comment for documentation
COMMENT ON COLUMN subscriptions.plan IS 'Subscription plan: premium or ai';
