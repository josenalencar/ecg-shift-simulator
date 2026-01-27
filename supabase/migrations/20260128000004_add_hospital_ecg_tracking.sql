-- Add ecgs_by_hospital field to track ECGs completed per hospital type
-- This is needed for hospital-type achievements (Cardiologista I/II/III, etc.)

ALTER TABLE user_gamification_stats
ADD COLUMN IF NOT EXISTS ecgs_by_hospital JSONB DEFAULT '{}';

-- Add comment explaining the field
COMMENT ON COLUMN user_gamification_stats.ecgs_by_hospital IS
'JSON object tracking ECGs completed per hospital type, e.g. {"hospital_cardiologico": 50, "pronto_socorro": 100}';
