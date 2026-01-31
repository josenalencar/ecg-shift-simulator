-- Migration: Seed default email automations
-- This creates the default automation configurations for all email types

-- ============================================
-- UPDATE CHECK CONSTRAINT FOR NEW EVENT TYPES
-- ============================================
ALTER TABLE email_automations DROP CONSTRAINT IF EXISTS email_automations_trigger_event_check;
ALTER TABLE email_automations ADD CONSTRAINT email_automations_trigger_event_check
  CHECK (trigger_event IN (
    'user_signup',
    'first_ecg_completed',
    'subscription_activated',
    'subscription_canceled',
    'streak_lost',
    'streak_milestone',
    'level_up',
    'achievement_unlocked',
    'xp_event_created'
  ));

-- ============================================
-- SEED DEFAULT AUTOMATIONS
-- ============================================

-- Note: We use ON CONFLICT DO NOTHING to avoid duplicates if run multiple times

-- 1. XP EVENT ANNOUNCEMENT (Event-based: xp_event_created)
INSERT INTO email_automations (
  name, description, email_type, segment_type,
  trigger_type, trigger_event, trigger_delay_hours,
  max_sends_per_user, min_days_between_sends,
  is_enabled, is_paused
) VALUES (
  'Anuncio de Evento XP',
  'Envia email para todos os usuarios quando um evento de XP (2x ou 3x) e criado',
  'xp_event_announcement',
  'all_users',
  'event',
  'xp_event_created',
  0,
  NULL, -- No limit per user (one per event)
  0,    -- Can send multiple per day (for different events)
  true,
  false
) ON CONFLICT DO NOTHING;

-- 2. WELCOME EMAIL (Event-based: user_signup)
INSERT INTO email_automations (
  name, description, email_type, segment_type,
  trigger_type, trigger_event, trigger_delay_hours,
  max_sends_per_user, min_days_between_sends,
  is_enabled, is_paused
) VALUES (
  'Boas-vindas',
  'Email de boas-vindas enviado imediatamente apos o cadastro',
  'welcome',
  'all_users',
  'event',
  'user_signup',
  0,
  1, -- Only once per user
  0,
  true,
  false
) ON CONFLICT DO NOTHING;

-- 3. FIRST CASE COMPLETED (Event-based: first_ecg_completed)
INSERT INTO email_automations (
  name, description, email_type, segment_type,
  trigger_type, trigger_event, trigger_delay_hours,
  max_sends_per_user, min_days_between_sends,
  is_enabled, is_paused
) VALUES (
  'Primeiro ECG Completado',
  'Parabeniza o usuario ao completar seu primeiro ECG',
  'first_case',
  'all_users',
  'event',
  'first_ecg_completed',
  0,
  1,
  0,
  true,
  false
) ON CONFLICT DO NOTHING;

-- 4. DAY 2 - SECOND TOUCH (Event-based: user_signup with 24h delay)
INSERT INTO email_automations (
  name, description, email_type, segment_type,
  trigger_type, trigger_event, trigger_delay_hours,
  max_sends_per_user, min_days_between_sends,
  is_enabled, is_paused
) VALUES (
  'Dia 2 - Segundo Contato',
  'Email de engajamento enviado 24 horas apos o cadastro',
  'day2',
  'all_users',
  'event',
  'user_signup',
  24,
  1,
  0,
  true,
  false
) ON CONFLICT DO NOTHING;

-- 5. DAY 3 - PROGRESS CHECK (Event-based: user_signup with 48h delay)
INSERT INTO email_automations (
  name, description, email_type, segment_type,
  trigger_type, trigger_event, trigger_delay_hours,
  max_sends_per_user, min_days_between_sends,
  is_enabled, is_paused
) VALUES (
  'Dia 3 - Check de Progresso',
  'Email com resumo do progresso enviado 48 horas apos o cadastro',
  'day3',
  'all_users',
  'event',
  'user_signup',
  48,
  1,
  0,
  true,
  false
) ON CONFLICT DO NOTHING;

-- 6. DAY 5 - FEATURE DISCOVERY (Event-based: user_signup with 96h delay)
INSERT INTO email_automations (
  name, description, email_type, segment_type,
  trigger_type, trigger_event, trigger_delay_hours,
  max_sends_per_user, min_days_between_sends,
  is_enabled, is_paused
) VALUES (
  'Dia 5 - Descoberta de Recursos',
  'Email apresentando recursos adicionais da plataforma',
  'day5',
  'all_users',
  'event',
  'user_signup',
  120, -- 5 days
  1,
  0,
  true,
  false
) ON CONFLICT DO NOTHING;

-- 7. DAY 7 - WEEK SUMMARY (Event-based: user_signup with 168h delay)
INSERT INTO email_automations (
  name, description, email_type, segment_type,
  trigger_type, trigger_event, trigger_delay_hours,
  max_sends_per_user, min_days_between_sends,
  is_enabled, is_paused
) VALUES (
  'Dia 7 - Resumo da Semana',
  'Email com resumo da primeira semana do usuario',
  'day7',
  'all_users',
  'event',
  'user_signup',
  168, -- 7 days
  1,
  0,
  true,
  false
) ON CONFLICT DO NOTHING;

-- 8. SUBSCRIPTION ACTIVATED (Event-based: subscription_activated)
INSERT INTO email_automations (
  name, description, email_type, segment_type,
  trigger_type, trigger_event, trigger_delay_hours,
  max_sends_per_user, min_days_between_sends,
  is_enabled, is_paused
) VALUES (
  'Assinatura Ativada',
  'Email de confirmacao quando usuario assina plano Premium',
  'subscription_activated',
  'all_users',
  'event',
  'subscription_activated',
  0,
  NULL, -- Can receive multiple (if re-subscribes)
  0,
  true,
  false
) ON CONFLICT DO NOTHING;

-- 9. SUBSCRIPTION CANCELED (Event-based: subscription_canceled)
INSERT INTO email_automations (
  name, description, email_type, segment_type,
  trigger_type, trigger_event, trigger_delay_hours,
  max_sends_per_user, min_days_between_sends,
  is_enabled, is_paused
) VALUES (
  'Assinatura Cancelada',
  'Email enviado quando usuario cancela assinatura',
  'subscription_canceled',
  'all_users',
  'event',
  'subscription_canceled',
  0,
  NULL,
  0,
  true,
  false
) ON CONFLICT DO NOTHING;

-- 10. LEVEL UP (Event-based: level_up)
INSERT INTO email_automations (
  name, description, email_type, segment_type,
  trigger_type, trigger_event, trigger_delay_hours,
  max_sends_per_user, min_days_between_sends,
  is_enabled, is_paused
) VALUES (
  'Subiu de Nivel',
  'Parabeniza o usuario quando sobe de nivel',
  'level_up',
  'all_users',
  'event',
  'level_up',
  0,
  NULL, -- No limit
  0,    -- Can level up multiple times per day
  true,
  false
) ON CONFLICT DO NOTHING;

-- 11. ACHIEVEMENT UNLOCKED (Event-based: achievement_unlocked)
INSERT INTO email_automations (
  name, description, email_type, segment_type,
  trigger_type, trigger_event, trigger_delay_hours,
  max_sends_per_user, min_days_between_sends,
  is_enabled, is_paused
) VALUES (
  'Conquista Desbloqueada',
  'Notifica usuario quando desbloqueia uma conquista',
  'achievement',
  'all_users',
  'event',
  'achievement_unlocked',
  0,
  NULL,
  0,
  true,
  false
) ON CONFLICT DO NOTHING;

-- 12. STREAK LOST (Event-based: streak_lost)
INSERT INTO email_automations (
  name, description, email_type, segment_type,
  trigger_type, trigger_event, trigger_delay_hours,
  max_sends_per_user, min_days_between_sends,
  is_enabled, is_paused
) VALUES (
  'Streak Perdido - Recomecar',
  'Incentiva usuario a recomecar apos perder o streak',
  'streak_starter',
  'all_users',
  'event',
  'streak_lost',
  0,
  NULL,
  7, -- Min 7 days between sends
  true,
  false
) ON CONFLICT DO NOTHING;

-- 13. WEEKLY DIGEST (Scheduled: weekly)
INSERT INTO email_automations (
  name, description, email_type, segment_type,
  trigger_type, schedule_type, schedule_day, schedule_hour,
  max_sends_per_user, min_days_between_sends,
  is_enabled, is_paused, next_run_at
) VALUES (
  'Resumo Semanal',
  'Email com estatisticas da semana enviado todo domingo',
  'weekly_digest',
  'active_7d', -- Only active users
  'scheduled',
  'weekly',
  0, -- Sunday
  18, -- 6 PM
  NULL,
  6, -- At least 6 days between
  true,
  false,
  (date_trunc('week', now() + interval '1 week') + interval '6 days 18 hours')::timestamptz
) ON CONFLICT DO NOTHING;

-- 14. MONTHLY REPORT (Scheduled: monthly)
INSERT INTO email_automations (
  name, description, email_type, segment_type,
  trigger_type, schedule_type, schedule_day, schedule_hour,
  max_sends_per_user, min_days_between_sends,
  is_enabled, is_paused, next_run_at
) VALUES (
  'Relatorio Mensal',
  'Relatorio com estatisticas do mes enviado no dia 1',
  'monthly_report',
  'all_users',
  'scheduled',
  'monthly',
  1, -- Day 1
  10, -- 10 AM
  NULL,
  28, -- At least 28 days between
  true,
  false,
  (date_trunc('month', now() + interval '1 month') + interval '10 hours')::timestamptz
) ON CONFLICT DO NOTHING;

-- 15. RENEWAL REMINDER (Scheduled: daily, targets premium users near renewal)
INSERT INTO email_automations (
  name, description, email_type, segment_type,
  trigger_type, schedule_type, schedule_hour,
  max_sends_per_user, min_days_between_sends,
  is_enabled, is_paused, next_run_at
) VALUES (
  'Lembrete de Renovacao',
  'Lembra usuarios 3 dias antes da renovacao da assinatura',
  'renewal_reminder',
  'premium',
  'scheduled',
  'daily',
  10,
  1, -- Once per renewal cycle
  25, -- At least 25 days between
  true,
  false,
  (date_trunc('day', now() + interval '1 day') + interval '10 hours')::timestamptz
) ON CONFLICT DO NOTHING;

-- 16. STREAK AT RISK (Scheduled: check twice daily)
INSERT INTO email_automations (
  name, description, email_type, segment_type,
  trigger_type, schedule_type, schedule_hour,
  max_sends_per_user, min_days_between_sends,
  is_enabled, is_paused, next_run_at
) VALUES (
  'Streak em Risco',
  'Alerta usuarios com streak ativo que nao praticaram hoje',
  'streak_at_risk',
  'all_users',
  'scheduled',
  'daily',
  20, -- 8 PM - evening reminder
  NULL,
  1, -- Once per day max
  true,
  false,
  (date_trunc('day', now()) + interval '20 hours')::timestamptz
) ON CONFLICT DO NOTHING;

-- 17. STREAK MILESTONE (Event-based: streak milestones)
INSERT INTO email_automations (
  name, description, email_type, segment_type,
  trigger_type, trigger_event, trigger_delay_hours,
  max_sends_per_user, min_days_between_sends,
  is_enabled, is_paused
) VALUES (
  'Marco de Streak',
  'Parabeniza usuario ao atingir marcos de streak (7, 14, 30, 60, 100 dias)',
  'streak_milestone',
  'all_users',
  'event',
  'streak_milestone',
  0,
  NULL, -- Multiple milestones possible
  0,
  true,
  false
) ON CONFLICT DO NOTHING;

-- ============================================
-- ADD COMMENTS
-- ============================================
COMMENT ON TABLE email_automations IS 'Email automation configurations - defines when and to whom automated emails are sent';
