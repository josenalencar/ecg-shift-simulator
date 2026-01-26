-- Fix interval CHECK constraints to include new values

-- Drop existing constraints on official_reports
ALTER TABLE official_reports
  DROP CONSTRAINT IF EXISTS official_reports_pr_interval_check;
ALTER TABLE official_reports
  DROP CONSTRAINT IF EXISTS official_reports_qt_interval_check;

-- Add updated constraints on official_reports
ALTER TABLE official_reports
  ADD CONSTRAINT official_reports_pr_interval_check
  CHECK (pr_interval IN ('normal', 'prolonged', 'short', 'na'));

ALTER TABLE official_reports
  ADD CONSTRAINT official_reports_qt_interval_check
  CHECK (qt_interval IN ('normal', 'prolonged', 'short'));

-- Drop existing constraints on attempts (if any)
ALTER TABLE attempts
  DROP CONSTRAINT IF EXISTS attempts_pr_interval_check;
ALTER TABLE attempts
  DROP CONSTRAINT IF EXISTS attempts_qt_interval_check;

-- Add updated constraints on attempts
ALTER TABLE attempts
  ADD CONSTRAINT attempts_pr_interval_check
  CHECK (pr_interval IN ('normal', 'prolonged', 'short', 'na'));

ALTER TABLE attempts
  ADD CONSTRAINT attempts_qt_interval_check
  CHECK (qt_interval IN ('normal', 'prolonged', 'short'));
