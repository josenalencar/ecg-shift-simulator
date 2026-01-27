-- Fix hospital weights keys to match HospitalType enum values
-- Changes: emergency -> pronto_socorro, general -> hospital_geral, cardiology -> hospital_cardiologico

UPDATE admin_settings
SET hospital_weights = jsonb_build_object(
  'pronto_socorro', hospital_weights->'emergency',
  'hospital_geral', hospital_weights->'general',
  'hospital_cardiologico', hospital_weights->'cardiology'
)
WHERE id = 'default'
  AND hospital_weights ? 'emergency';

-- Update default value for new installations
ALTER TABLE admin_settings
ALTER COLUMN hospital_weights SET DEFAULT '{
  "pronto_socorro": {
    "categories": {"arrhythmia": 3, "ischemia": 3, "conduction": 2, "normal": 1, "other": 1},
    "difficulties": {"easy": 1, "medium": 2, "hard": 2}
  },
  "hospital_geral": {
    "categories": {"arrhythmia": 1, "ischemia": 1, "conduction": 1, "normal": 3, "other": 2},
    "difficulties": {"easy": 2, "medium": 2, "hard": 1}
  },
  "hospital_cardiologico": {
    "categories": {"arrhythmia": 2, "ischemia": 2, "conduction": 2, "normal": 1, "other": 1},
    "difficulties": {"easy": 1, "medium": 2, "hard": 3}
  }
}';

COMMENT ON COLUMN profiles.hospital_type IS 'User preferred hospital type: pronto_socorro, hospital_geral, hospital_cardiologico';
