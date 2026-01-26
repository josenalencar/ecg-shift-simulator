-- Drop ALL check constraints on interval columns by finding them dynamically
-- This handles unnamed constraints created by CHECK in CREATE TABLE

DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  -- Find and drop all CHECK constraints on official_reports pr_interval
  FOR constraint_name IN
    SELECT con.conname
    FROM pg_catalog.pg_constraint con
    JOIN pg_catalog.pg_class rel ON rel.oid = con.conrelid
    JOIN pg_catalog.pg_namespace nsp ON nsp.oid = rel.relnamespace
    WHERE rel.relname = 'official_reports'
      AND con.contype = 'c'
      AND pg_get_constraintdef(con.oid) LIKE '%pr_interval%'
  LOOP
    EXECUTE format('ALTER TABLE official_reports DROP CONSTRAINT IF EXISTS %I', constraint_name);
  END LOOP;

  -- Find and drop all CHECK constraints on official_reports qt_interval
  FOR constraint_name IN
    SELECT con.conname
    FROM pg_catalog.pg_constraint con
    JOIN pg_catalog.pg_class rel ON rel.oid = con.conrelid
    JOIN pg_catalog.pg_namespace nsp ON nsp.oid = rel.relnamespace
    WHERE rel.relname = 'official_reports'
      AND con.contype = 'c'
      AND pg_get_constraintdef(con.oid) LIKE '%qt_interval%'
  LOOP
    EXECUTE format('ALTER TABLE official_reports DROP CONSTRAINT IF EXISTS %I', constraint_name);
  END LOOP;

  -- Find and drop all CHECK constraints on attempts pr_interval
  FOR constraint_name IN
    SELECT con.conname
    FROM pg_catalog.pg_constraint con
    JOIN pg_catalog.pg_class rel ON rel.oid = con.conrelid
    JOIN pg_catalog.pg_namespace nsp ON nsp.oid = rel.relnamespace
    WHERE rel.relname = 'attempts'
      AND con.contype = 'c'
      AND pg_get_constraintdef(con.oid) LIKE '%pr_interval%'
  LOOP
    EXECUTE format('ALTER TABLE attempts DROP CONSTRAINT IF EXISTS %I', constraint_name);
  END LOOP;

  -- Find and drop all CHECK constraints on attempts qt_interval
  FOR constraint_name IN
    SELECT con.conname
    FROM pg_catalog.pg_constraint con
    JOIN pg_catalog.pg_class rel ON rel.oid = con.conrelid
    JOIN pg_catalog.pg_namespace nsp ON nsp.oid = rel.relnamespace
    WHERE rel.relname = 'attempts'
      AND con.contype = 'c'
      AND pg_get_constraintdef(con.oid) LIKE '%qt_interval%'
  LOOP
    EXECUTE format('ALTER TABLE attempts DROP CONSTRAINT IF EXISTS %I', constraint_name);
  END LOOP;
END $$;

-- Now add the updated constraints
ALTER TABLE official_reports
  ADD CONSTRAINT official_reports_pr_interval_check_v2
  CHECK (pr_interval IN ('normal', 'prolonged', 'short', 'na'));

ALTER TABLE official_reports
  ADD CONSTRAINT official_reports_qt_interval_check_v2
  CHECK (qt_interval IN ('normal', 'prolonged', 'short'));

ALTER TABLE attempts
  ADD CONSTRAINT attempts_pr_interval_check_v2
  CHECK (pr_interval IN ('normal', 'prolonged', 'short', 'na'));

ALTER TABLE attempts
  ADD CONSTRAINT attempts_qt_interval_check_v2
  CHECK (qt_interval IN ('normal', 'prolonged', 'short'));
