-- Check profiles (this will show in the migration output if there's an issue)
-- First, let's see all profiles
DO $$
DECLARE
    profile_count INTEGER;
    admin_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO profile_count FROM profiles;
    SELECT COUNT(*) INTO admin_count FROM profiles WHERE role = 'admin';
    RAISE NOTICE 'Total profiles: %, Admin profiles: %', profile_count, admin_count;
END $$;

-- Force update the admin role (in case email had whitespace or case issues)
UPDATE profiles
SET role = 'admin'
WHERE LOWER(TRIM(email)) = 'josenunesalencar@gmail.com';
