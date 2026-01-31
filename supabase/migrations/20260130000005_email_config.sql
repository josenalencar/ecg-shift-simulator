-- Migration: Email Configuration Table
-- Stores global settings for each email type

-- ============================================
-- TABLE: email_config
-- ============================================
CREATE TABLE IF NOT EXISTS email_config (
  email_type TEXT PRIMARY KEY,
  category TEXT NOT NULL,            -- 'account', 'onboarding', 'engagement'
  name_pt TEXT NOT NULL,             -- Portuguese display name
  description_pt TEXT,               -- Portuguese description
  is_enabled BOOLEAN DEFAULT true,   -- Global on/off switch
  trigger_config JSONB DEFAULT '{}', -- Configurable parameters
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SEED DATA: 19 email types
-- ============================================

-- Account emails (6)
INSERT INTO email_config (email_type, category, name_pt, description_pt, trigger_config) VALUES
('welcome', 'account', 'Boas-vindas', 'Enviado automaticamente quando um novo usuario se cadastra na plataforma.', '{}'),
('subscription_activated', 'account', 'Assinatura Ativada', 'Enviado quando o usuario ativa uma assinatura Premium ou Premium + IA.', '{}'),
('subscription_canceled', 'account', 'Assinatura Cancelada', 'Enviado quando o usuario cancela sua assinatura premium.', '{}'),
('payment_failed', 'account', 'Pagamento Falhou', 'Enviado quando uma tentativa de cobranca falha no cartao do usuario.', '{}'),
('password_reset', 'account', 'Redefinir Senha', 'Enviado quando o usuario solicita redefinicao de senha.', '{}'),
('renewal_reminder', 'account', 'Lembrete de Renovacao', 'Enviado alguns dias antes da renovacao automatica da assinatura.', '{"days_before": 3}');

-- Onboarding emails (5)
INSERT INTO email_config (email_type, category, name_pt, description_pt, trigger_config) VALUES
('first_case', 'onboarding', 'Primeiro ECG Concluido', 'Enviado imediatamente apos o usuario completar seu primeiro ECG.', '{}'),
('day2', 'onboarding', 'Dia 2 - Segundo Contato', 'Enviado 24h apos cadastro para usuarios que ainda nao praticaram.', '{"trigger_day": 1, "require_no_activity": true}'),
('day3', 'onboarding', 'Dia 3 - Check de Progresso', 'Enviado 48h apos cadastro mostrando o progresso do usuario.', '{"trigger_day": 2}'),
('day5', 'onboarding', 'Dia 5 - Descoberta de Recursos', 'Enviado no 5o dia destacando recursos que o usuario ainda nao usou.', '{"trigger_day": 4}'),
('day7', 'onboarding', 'Dia 7 - Resumo da Semana', 'Enviado no 7o dia com estatisticas completas da primeira semana.', '{"trigger_day": 6}');

-- Engagement emails (8)
INSERT INTO email_config (email_type, category, name_pt, description_pt, trigger_config) VALUES
('streak_starter', 'engagement', 'Recomecar Streak', 'Enviado para usuarios que perderam seu streak e podem recomecar.', '{"min_previous_streak": 3, "days_inactive_range": [2, 7]}'),
('streak_at_risk', 'engagement', 'Streak em Risco', 'Enviado quando o streak do usuario esta prestes a ser perdido.', '{"min_streak": 5, "hours_before_expire": 16}'),
('streak_milestone', 'engagement', 'Marco de Streak', 'Enviado quando o usuario atinge marcos importantes de streak.', '{"milestones": [7, 14, 30, 60, 100]}'),
('level_up', 'engagement', 'Subiu de Nivel', 'Enviado imediatamente quando o usuario sobe de nivel.', '{}'),
('achievement', 'engagement', 'Conquista Desbloqueada', 'Enviado quando o usuario desbloqueia uma nova conquista.', '{}'),
('weekly_digest', 'engagement', 'Resumo Semanal', 'Enviado aos domingos com estatisticas da semana.', '{"send_day": 0, "send_hour": 18}'),
('monthly_report', 'engagement', 'Relatorio Mensal', 'Enviado no primeiro dia de cada mes com relatorio detalhado.', '{"send_day": 1, "send_hour": 10}'),
('xp_event_announcement', 'engagement', 'Anuncio de Evento XP', 'Enviado quando um evento de XP dobrado ou triplicado e criado.', '{}');

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE email_config ENABLE ROW LEVEL SECURITY;

-- Admins can read all email configs
CREATE POLICY "Admins can read email_config" ON email_config
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Service role has full access (for API routes)
CREATE POLICY "Service role full access email_config" ON email_config
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- FUNCTION: Update timestamp on modification
-- ============================================
CREATE OR REPLACE FUNCTION update_email_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER email_config_updated_at
  BEFORE UPDATE ON email_config
  FOR EACH ROW
  EXECUTE FUNCTION update_email_config_updated_at();
