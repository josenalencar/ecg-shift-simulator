-- =============================================
-- Fix remaining security and performance issues
-- Jan 26, 2026
-- =============================================

-- FIX 1: Fix update_subscription_updated_at function search_path
CREATE OR REPLACE FUNCTION update_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql'
SET search_path = public;

-- FIX 2: Drop the problematic user_stats view with SECURITY DEFINER
DROP VIEW IF EXISTS public.user_stats;

-- Recreate without SECURITY DEFINER (implicit SECURITY INVOKER)
CREATE VIEW public.user_stats AS
SELECT
  user_id,
  COUNT(*) as total_attempts,
  AVG(score) as average_score,
  COUNT(CASE WHEN score >= 80 THEN 1 END) as correct_count,
  MAX(created_at) as last_attempt_at
FROM public.attempts
GROUP BY user_id;

GRANT SELECT ON public.user_stats TO authenticated;

-- FIX 3: Remove the unrestricted subscriptions policy
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.subscriptions;

-- FIX 4: Drop and recreate profiles policies with optimized (select auth.uid())
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile creation on signup" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage profiles" ON public.profiles;

-- Recreate with optimized auth calls
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (id = (select auth.uid()));

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (id = (select auth.uid()));

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (id = (select auth.uid()));

CREATE POLICY "Admins can manage profiles"
  ON public.profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (select auth.uid()) AND p.role = 'admin'
    )
  );

-- FIX 5: Drop and recreate attempts policies
DROP POLICY IF EXISTS "Admins can view all attempts" ON public.attempts;
DROP POLICY IF EXISTS "Users can view their own attempts" ON public.attempts;
DROP POLICY IF EXISTS "Users can view own attempts" ON public.attempts;
DROP POLICY IF EXISTS "Users can insert their own attempts" ON public.attempts;
DROP POLICY IF EXISTS "Users can create attempts" ON public.attempts;

CREATE POLICY "Users can view their own attempts"
  ON public.attempts FOR SELECT
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert their own attempts"
  ON public.attempts FOR INSERT
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Admins can view all attempts"
  ON public.attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (select auth.uid()) AND p.role = 'admin'
    )
  );

-- FIX 6: Drop and recreate ecgs policies
DROP POLICY IF EXISTS "Admins can view all ECGs" ON public.ecgs;
DROP POLICY IF EXISTS "Anyone authenticated can view active ECGs" ON public.ecgs;
DROP POLICY IF EXISTS "Authenticated users can view active ECGs" ON public.ecgs;
DROP POLICY IF EXISTS "Admins can manage ECGs" ON public.ecgs;
DROP POLICY IF EXISTS "Admins can manage all ECGs" ON public.ecgs;
DROP POLICY IF EXISTS "Admins can insert ECGs" ON public.ecgs;
DROP POLICY IF EXISTS "Admins can update ECGs" ON public.ecgs;
DROP POLICY IF EXISTS "Admins can delete ECGs" ON public.ecgs;

CREATE POLICY "Authenticated users can view active ECGs"
  ON public.ecgs FOR SELECT
  USING (is_active = true AND (select auth.uid()) IS NOT NULL);

CREATE POLICY "Admins can manage ECGs"
  ON public.ecgs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (select auth.uid()) AND p.role = 'admin'
    )
  );

-- FIX 7: Drop and recreate official_reports policies
DROP POLICY IF EXISTS "Admins can manage all reports" ON public.official_reports;
DROP POLICY IF EXISTS "Authenticated users can view reports for active ECGs" ON public.official_reports;
DROP POLICY IF EXISTS "Users can view reports for active ECGs" ON public.official_reports;
DROP POLICY IF EXISTS "Admins can manage reports" ON public.official_reports;

CREATE POLICY "Users can view reports for active ECGs"
  ON public.official_reports FOR SELECT
  USING (
    (select auth.uid()) IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.ecgs e
      WHERE e.id = official_reports.ecg_id AND e.is_active = true
    )
  );

CREATE POLICY "Admins can manage reports"
  ON public.official_reports FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (select auth.uid()) AND p.role = 'admin'
    )
  );

-- FIX 8: Drop and recreate subscriptions policies
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscriptions;

CREATE POLICY "Users can view their own subscription"
  ON public.subscriptions FOR SELECT
  USING (user_id = (select auth.uid()));
