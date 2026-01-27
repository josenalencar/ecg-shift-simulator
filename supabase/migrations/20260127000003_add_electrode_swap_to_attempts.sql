-- Add missing electrode_swap column to attempts table
-- This was missing, causing student attempts to fail silently

ALTER TABLE attempts ADD COLUMN IF NOT EXISTS electrode_swap TEXT[] DEFAULT '{}';

COMMENT ON COLUMN attempts.electrode_swap IS 'Array of electrode swap findings from user report';
