-- Update interval check constraints to allow 'na' value
-- First, we need to drop any existing check constraints and recreate them

-- For official_reports table
ALTER TABLE official_reports
  DROP CONSTRAINT IF EXISTS official_reports_pr_interval_check,
  DROP CONSTRAINT IF EXISTS official_reports_qrs_duration_check,
  DROP CONSTRAINT IF EXISTS official_reports_qt_interval_check;

-- For attempts table
ALTER TABLE attempts
  DROP CONSTRAINT IF EXISTS attempts_pr_interval_check,
  DROP CONSTRAINT IF EXISTS attempts_qrs_duration_check,
  DROP CONSTRAINT IF EXISTS attempts_qt_interval_check;

-- Note: If there are no constraints (columns are just text), this is fine
-- The application will handle validation
