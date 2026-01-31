-- Update subscription plan for josenunesalencar@gmail.com to 'ai'
UPDATE subscriptions
SET plan = 'ai'
WHERE user_id = (SELECT id FROM profiles WHERE email = 'josenunesalencar@gmail.com');
