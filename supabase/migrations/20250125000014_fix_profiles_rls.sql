-- Fix profiles RLS policy for admins viewing all users
-- The issue is the self-referential subquery in the current policy

-- Create a security definer function to check if user is admin
-- This bypasses RLS when checking admin status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = auth.uid();

  RETURN user_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop the old policy that has issues
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Create new policy using the security definer function
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (public.is_admin());

-- Also allow admins to update any profile (for role changes)
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (public.is_admin());
