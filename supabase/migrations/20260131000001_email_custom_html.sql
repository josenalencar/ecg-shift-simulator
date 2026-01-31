-- Migration: Add custom HTML template columns to email_config
-- Allows admins to edit email templates via the admin panel

-- ============================================
-- ADD COLUMNS FOR CUSTOM HTML TEMPLATES
-- ============================================
ALTER TABLE email_config
ADD COLUMN IF NOT EXISTS custom_html TEXT,
ADD COLUMN IF NOT EXISTS custom_subject TEXT,
ADD COLUMN IF NOT EXISTS use_custom_template BOOLEAN DEFAULT false;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON COLUMN email_config.custom_html IS 'Custom HTML template with variable placeholders like {{userName}}, {{level}}, etc.';
COMMENT ON COLUMN email_config.custom_subject IS 'Custom email subject line with variable placeholders';
COMMENT ON COLUMN email_config.use_custom_template IS 'When true, uses custom_html instead of the React template';
