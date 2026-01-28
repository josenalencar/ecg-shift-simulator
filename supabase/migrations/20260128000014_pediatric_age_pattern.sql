-- Migration: Add age_pattern for pediatric ECGs
-- Description: Adds age_pattern column for pediatric ECG evaluation
-- Also keeps regularity column for backward compatibility (but app will ignore it)

-- Add age_pattern column to official_reports
ALTER TABLE official_reports
ADD COLUMN IF NOT EXISTS age_pattern TEXT;

-- Add age_pattern column to attempts
ALTER TABLE attempts
ADD COLUMN IF NOT EXISTS age_pattern TEXT;

-- Note: regularity column is kept for backward compatibility
-- but will be ignored in scoring going forward
