-- Add is_pediatric column to ecgs table
ALTER TABLE ecgs ADD COLUMN IF NOT EXISTS is_pediatric BOOLEAN DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN ecgs.is_pediatric IS 'Marks if the ECG is from a pediatric patient';
