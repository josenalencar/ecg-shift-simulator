-- Fix ECG category check constraint to include all frontend categories
-- The frontend has 9 categories but the database constraint only allows 5

-- Remove old constraint
ALTER TABLE ecgs DROP CONSTRAINT IF EXISTS ecgs_category_check;

-- Add new constraint with all frontend categories
ALTER TABLE ecgs ADD CONSTRAINT ecgs_category_check
  CHECK (category IN ('arrhythmia', 'ischemia', 'conduction', 'normal', 'other', 'structural', 'emergency', 'routine', 'advanced', 'rare'));
