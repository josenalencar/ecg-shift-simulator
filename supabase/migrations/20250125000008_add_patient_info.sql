-- Add patient information columns to ECGs table
ALTER TABLE ecgs ADD COLUMN IF NOT EXISTS patient_age INTEGER;
ALTER TABLE ecgs ADD COLUMN IF NOT EXISTS patient_sex TEXT CHECK (patient_sex IN ('masculino', 'feminino'));
ALTER TABLE ecgs ADD COLUMN IF NOT EXISTS clinical_presentation TEXT[];

-- Add comments for documentation
COMMENT ON COLUMN ecgs.patient_age IS 'Patient age in years';
COMMENT ON COLUMN ecgs.patient_sex IS 'Patient sex: masculino or feminino';
COMMENT ON COLUMN ecgs.clinical_presentation IS 'Array of clinical presentations: dor_toracica, dispneia, palpitacoes, sincope, etc.';
