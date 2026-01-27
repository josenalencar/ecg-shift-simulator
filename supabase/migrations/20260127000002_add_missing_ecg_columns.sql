-- Add missing columns to ECGs table
-- These columns are expected by the admin edit form but were never created

-- Categories array (allows multiple categories per ECG)
ALTER TABLE ecgs ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT '{}';

-- Medical history options
ALTER TABLE ecgs ADD COLUMN IF NOT EXISTS medical_history TEXT[] DEFAULT '{}';

-- Family history options
ALTER TABLE ecgs ADD COLUMN IF NOT EXISTS family_history TEXT[] DEFAULT '{}';

-- Medications options
ALTER TABLE ecgs ADD COLUMN IF NOT EXISTS medications TEXT[] DEFAULT '{}';

-- Also add electrode_swap to official_reports if missing
ALTER TABLE official_reports ADD COLUMN IF NOT EXISTS electrode_swap TEXT[] DEFAULT '{}';

-- Add comments for documentation
COMMENT ON COLUMN ecgs.categories IS 'Array of categories: arrhythmia, ischemia, conduction, normal, other';
COMMENT ON COLUMN ecgs.medical_history IS 'Array of medical history: diabetes, hypertension, cad, smoking, dyslipidemia';
COMMENT ON COLUMN ecgs.family_history IS 'Array of family history: sudden_death, cardiomyopathy';
COMMENT ON COLUMN ecgs.medications IS 'Array of medications: betablocker, asa, antiarrhythmic, digitalis, etc.';
COMMENT ON COLUMN official_reports.electrode_swap IS 'Array of electrode swap findings';
