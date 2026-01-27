-- ============================================
-- SEED 100 ACHIEVEMENTS
-- ECG Shift Simulator - Gamification System
-- ============================================

-- Clear existing achievements (in case of re-run)
DELETE FROM achievements;

-- ============================================
-- ECG COUNT ACHIEVEMENTS (1-10)
-- ============================================

INSERT INTO achievements (slug, name_pt, description_pt, icon, rarity, category, unlock_type, unlock_conditions, xp_reward, display_order) VALUES
('primeiro_ecg', 'Primeiro Plantao', 'Interprete seu primeiro ECG', 'heart-pulse', 'common', 'ecg_count', 'counter', '{"type": "total_ecgs", "threshold": 1}', 10, 1),
('ecg_10', 'Plantonista Iniciante', 'Interprete 10 ECGs', 'activity', 'common', 'ecg_count', 'counter', '{"type": "total_ecgs", "threshold": 10}', 25, 2),
('ecg_25', 'Ritmo de Trabalho', 'Interprete 25 ECGs', 'trending-up', 'common', 'ecg_count', 'counter', '{"type": "total_ecgs", "threshold": 25}', 50, 3),
('ecg_50', 'Meio Caminho', 'Interprete 50 ECGs', 'target', 'uncommon', 'ecg_count', 'counter', '{"type": "total_ecgs", "threshold": 50}', 75, 4),
('ecg_100', 'Centuriao', 'Interprete 100 ECGs', 'award', 'uncommon', 'ecg_count', 'counter', '{"type": "total_ecgs", "threshold": 100}', 100, 5),
('ecg_250', 'Veterano', 'Interprete 250 ECGs', 'medal', 'rare', 'ecg_count', 'counter', '{"type": "total_ecgs", "threshold": 250}', 200, 6),
('ecg_500', 'Especialista', 'Interprete 500 ECGs', 'star', 'rare', 'ecg_count', 'counter', '{"type": "total_ecgs", "threshold": 500}', 350, 7),
('ecg_1000', 'Mestre do ECG', 'Interprete 1000 ECGs', 'crown', 'epic', 'ecg_count', 'counter', '{"type": "total_ecgs", "threshold": 1000}', 500, 8),
('ecg_2500', 'Lenda do Plantao', 'Interprete 2500 ECGs', 'flame', 'epic', 'ecg_count', 'counter', '{"type": "total_ecgs", "threshold": 2500}', 750, 9),
('ecg_5000', 'Mitologico', 'Interprete 5000 ECGs', 'gem', 'legendary', 'ecg_count', 'counter', '{"type": "total_ecgs", "threshold": 5000}', 1500, 10);

-- ============================================
-- DIAGNOSIS MASTERY - INFARTO (11-15)
-- ============================================

INSERT INTO achievements (slug, name_pt, description_pt, icon, rarity, category, unlock_type, unlock_conditions, xp_reward, display_order) VALUES
('infarto_10', 'Detector de Infarto', 'Identifique corretamente 10 infartos', 'heart', 'common', 'diagnosis', 'category', '{"type": "finding_correct", "finding": "ischemia", "threshold": 10}', 30, 11),
('infarto_50', 'Salvando Vidas', 'Identifique corretamente 50 infartos', 'heart-handshake', 'uncommon', 'diagnosis', 'category', '{"type": "finding_correct", "finding": "ischemia", "threshold": 50}', 100, 12),
('infarto_100', 'Mestre do Infarto', 'Identifique corretamente 100 infartos', 'heart-pulse', 'rare', 'diagnosis', 'category', '{"type": "finding_correct", "finding": "ischemia", "threshold": 100}', 250, 13),
('infarto_250', 'Olho Clinico', 'Identifique corretamente 250 infartos', 'eye', 'epic', 'diagnosis', 'category', '{"type": "finding_correct", "finding": "ischemia", "threshold": 250}', 500, 14),
('infarto_500', 'Olho de Steve', 'Identifique corretamente 500 infartos', 'scan-eye', 'legendary', 'diagnosis', 'category', '{"type": "finding_correct", "finding": "ischemia", "threshold": 500}', 1000, 15);

-- ============================================
-- DIAGNOSIS MASTERY - ARRITMIA (16-19)
-- ============================================

INSERT INTO achievements (slug, name_pt, description_pt, icon, rarity, category, unlock_type, unlock_conditions, xp_reward, display_order) VALUES
('arritmia_10', 'Cacador de Ritmos', 'Identifique corretamente 10 arritmias', 'activity', 'common', 'diagnosis', 'category', '{"type": "category_correct", "category": "arrhythmia", "threshold": 10}', 30, 16),
('arritmia_50', 'Especialista em Ritmo', 'Identifique corretamente 50 arritmias', 'waves', 'uncommon', 'diagnosis', 'category', '{"type": "category_correct", "category": "arrhythmia", "threshold": 50}', 100, 17),
('arritmia_100', 'Mestre das Arritmias', 'Identifique corretamente 100 arritmias', 'zap', 'rare', 'diagnosis', 'category', '{"type": "category_correct", "category": "arrhythmia", "threshold": 100}', 250, 18),
('arritmia_250', 'Eletrofisiologista', 'Identifique corretamente 250 arritmias', 'radio-tower', 'epic', 'diagnosis', 'category', '{"type": "category_correct", "category": "arrhythmia", "threshold": 250}', 500, 19);

-- ============================================
-- DIAGNOSIS MASTERY - BLOQUEIOS (20-23)
-- ============================================

INSERT INTO achievements (slug, name_pt, description_pt, icon, rarity, category, unlock_type, unlock_conditions, xp_reward, display_order) VALUES
('bloqueio_10', 'Desbloqueando', 'Identifique corretamente 10 bloqueios', 'lock', 'common', 'diagnosis', 'category', '{"type": "finding_group", "group": "blocks", "threshold": 10}', 30, 20),
('bloqueio_50', 'Especialista em Conducao', 'Identifique corretamente 50 bloqueios', 'lock-keyhole', 'uncommon', 'diagnosis', 'category', '{"type": "finding_group", "group": "blocks", "threshold": 50}', 100, 21),
('bloqueio_100', 'Mestre dos Bloqueios', 'Identifique corretamente 100 bloqueios', 'unlock', 'rare', 'diagnosis', 'category', '{"type": "finding_group", "group": "blocks", "threshold": 100}', 250, 22),
('bloqueio_250', 'Desbloqueador Supremo', 'Identifique corretamente 250 bloqueios', 'key', 'epic', 'diagnosis', 'category', '{"type": "finding_group", "group": "blocks", "threshold": 250}', 500, 23);

-- ============================================
-- DIAGNOSIS MASTERY - ESTRUTURAL (24-27)
-- ============================================

INSERT INTO achievements (slug, name_pt, description_pt, icon, rarity, category, unlock_type, unlock_conditions, xp_reward, display_order) VALUES
('estrutural_10', 'Arquiteto Cardiaco', 'Identifique corretamente 10 alteracoes estruturais', 'building', 'common', 'diagnosis', 'category', '{"type": "category_correct", "category": "structural", "threshold": 10}', 30, 24),
('estrutural_50', 'Construtor de Diagnosticos', 'Identifique corretamente 50 alteracoes estruturais', 'home', 'uncommon', 'diagnosis', 'category', '{"type": "category_correct", "category": "structural", "threshold": 50}', 100, 25),
('estrutural_100', 'Mestre Estrutural', 'Identifique corretamente 100 alteracoes estruturais', 'castle', 'rare', 'diagnosis', 'category', '{"type": "category_correct", "category": "structural", "threshold": 100}', 250, 26),
('estrutural_250', 'Engenheiro do Coracao', 'Identifique corretamente 250 alteracoes estruturais', 'landmark', 'epic', 'diagnosis', 'category', '{"type": "category_correct", "category": "structural", "threshold": 250}', 500, 27);

-- ============================================
-- DIAGNOSIS MASTERY - NORMAL (28-30)
-- ============================================

INSERT INTO achievements (slug, name_pt, description_pt, icon, rarity, category, unlock_type, unlock_conditions, xp_reward, display_order) VALUES
('normal_10', 'Identificador de Normalidade', 'Identifique corretamente 10 ECGs normais', 'check-circle', 'common', 'diagnosis', 'category', '{"type": "category_correct", "category": "normal", "threshold": 10}', 30, 28),
('normal_50', 'Guardiao da Normalidade', 'Identifique corretamente 50 ECGs normais', 'shield-check', 'uncommon', 'diagnosis', 'category', '{"type": "category_correct", "category": "normal", "threshold": 50}', 100, 29),
('normal_100', 'Mestre do Normal', 'Identifique corretamente 100 ECGs normais', 'badge-check', 'rare', 'diagnosis', 'category', '{"type": "category_correct", "category": "normal", "threshold": 100}', 250, 30);

-- ============================================
-- DIAGNOSIS MASTERY - EMERGENCIA (31-33)
-- ============================================

INSERT INTO achievements (slug, name_pt, description_pt, icon, rarity, category, unlock_type, unlock_conditions, xp_reward, display_order) VALUES
('emergencia_10', 'Resposta Rapida', 'Identifique corretamente 10 emergencias', 'siren', 'common', 'diagnosis', 'category', '{"type": "category_correct", "category": "emergency", "threshold": 10}', 30, 31),
('emergencia_50', 'Emergencista', 'Identifique corretamente 50 emergencias', 'ambulance', 'uncommon', 'diagnosis', 'category', '{"type": "category_correct", "category": "emergency", "threshold": 50}', 100, 32),
('emergencia_100', 'Heroi da Emergencia', 'Identifique corretamente 100 emergencias', 'flame', 'rare', 'diagnosis', 'category', '{"type": "category_correct", "category": "emergency", "threshold": 100}', 250, 33);

-- ============================================
-- DIAGNOSIS MASTERY - ROTINA (34-35)
-- ============================================

INSERT INTO achievements (slug, name_pt, description_pt, icon, rarity, category, unlock_type, unlock_conditions, xp_reward, display_order) VALUES
('rotina_25', 'Rotineiro', 'Interprete 25 ECGs de rotina', 'clipboard', 'common', 'diagnosis', 'category', '{"type": "category_correct", "category": "routine", "threshold": 25}', 50, 34),
('rotina_100', 'Mestre da Rotina', 'Interprete 100 ECGs de rotina', 'clipboard-check', 'uncommon', 'diagnosis', 'category', '{"type": "category_correct", "category": "routine", "threshold": 100}', 150, 35);

-- ============================================
-- STREAK ACHIEVEMENTS (36-43)
-- ============================================

INSERT INTO achievements (slug, name_pt, description_pt, icon, rarity, category, unlock_type, unlock_conditions, xp_reward, display_order) VALUES
('streak_3', 'Constancia', 'Mantenha uma sequencia de 3 dias', 'flame', 'common', 'streak', 'streak', '{"type": "streak", "threshold": 3}', 25, 36),
('streak_7', 'Semana Perfeita', 'Mantenha uma sequencia de 7 dias', 'calendar', 'common', 'streak', 'streak', '{"type": "streak", "threshold": 7}', 50, 37),
('streak_14', 'Quinzena', 'Mantenha uma sequencia de 14 dias', 'calendar-days', 'uncommon', 'streak', 'streak', '{"type": "streak", "threshold": 14}', 100, 38),
('streak_30', 'Mes de Ouro', 'Mantenha uma sequencia de 30 dias', 'calendar-check', 'rare', 'streak', 'streak', '{"type": "streak", "threshold": 30}', 200, 39),
('streak_60', 'Dedicacao Total', 'Mantenha uma sequencia de 60 dias', 'trophy', 'rare', 'streak', 'streak', '{"type": "streak", "threshold": 60}', 400, 40),
('streak_90', 'Trimestre', 'Mantenha uma sequencia de 90 dias', 'medal', 'epic', 'streak', 'streak', '{"type": "streak", "threshold": 90}', 600, 41),
('streak_180', 'Semestre', 'Mantenha uma sequencia de 180 dias', 'crown', 'epic', 'streak', 'streak', '{"type": "streak", "threshold": 180}', 1000, 42),
('streak_365', 'Ano Perfeito', 'Mantenha uma sequencia de 365 dias', 'gem', 'legendary', 'streak', 'streak', '{"type": "streak", "threshold": 365}', 2000, 43);

-- ============================================
-- PERFECT SCORE ACHIEVEMENTS (44-51)
-- ============================================

INSERT INTO achievements (slug, name_pt, description_pt, icon, rarity, category, unlock_type, unlock_conditions, xp_reward, display_order) VALUES
('perfect_1', 'Primeiro 100%', 'Obtenha sua primeira pontuacao perfeita', 'check', 'common', 'perfect', 'counter', '{"type": "perfect_scores", "threshold": 1}', 20, 44),
('perfect_5', 'Acertador', 'Obtenha 5 pontuacoes perfeitas', 'check-check', 'common', 'perfect', 'counter', '{"type": "perfect_scores", "threshold": 5}', 50, 45),
('perfect_10', 'Precisao', 'Obtenha 10 pontuacoes perfeitas', 'target', 'uncommon', 'perfect', 'counter', '{"type": "perfect_scores", "threshold": 10}', 100, 46),
('perfect_25', 'Excelencia', 'Obtenha 25 pontuacoes perfeitas', 'sparkles', 'uncommon', 'perfect', 'counter', '{"type": "perfect_scores", "threshold": 25}', 200, 47),
('perfect_50', 'Perfeicao', 'Obtenha 50 pontuacoes perfeitas', 'star', 'rare', 'perfect', 'counter', '{"type": "perfect_scores", "threshold": 50}', 350, 48),
('perfect_100', 'Impecavel', 'Obtenha 100 pontuacoes perfeitas', 'award', 'rare', 'perfect', 'counter', '{"type": "perfect_scores", "threshold": 100}', 500, 49),
('perfect_250', 'Infalivel', 'Obtenha 250 pontuacoes perfeitas', 'medal', 'epic', 'perfect', 'counter', '{"type": "perfect_scores", "threshold": 250}', 800, 50),
('perfect_500', 'Lenda da Precisao', 'Obtenha 500 pontuacoes perfeitas', 'crown', 'epic', 'perfect', 'counter', '{"type": "perfect_scores", "threshold": 500}', 1200, 51);

-- ============================================
-- LEVEL MILESTONES (52-61)
-- ============================================

INSERT INTO achievements (slug, name_pt, description_pt, icon, rarity, category, unlock_type, unlock_conditions, xp_reward, display_order) VALUES
('level_5', 'Residente', 'Alcance o nivel 5', 'graduation-cap', 'common', 'level', 'counter', '{"type": "level", "threshold": 5}', 0, 52),
('level_10', 'R2', 'Alcance o nivel 10', 'book-open', 'common', 'level', 'counter', '{"type": "level", "threshold": 10}', 0, 53),
('level_20', 'R3', 'Alcance o nivel 20', 'book-marked', 'uncommon', 'level', 'counter', '{"type": "level", "threshold": 20}', 0, 54),
('level_30', 'Especialista Jr', 'Alcance o nivel 30', 'briefcase', 'uncommon', 'level', 'counter', '{"type": "level", "threshold": 30}', 0, 55),
('level_40', 'Especialista', 'Alcance o nivel 40', 'briefcase-medical', 'rare', 'level', 'counter', '{"type": "level", "threshold": 40}', 0, 56),
('level_50', 'Staff', 'Alcance o nivel 50', 'user-check', 'rare', 'level', 'counter', '{"type": "level", "threshold": 50}', 0, 57),
('level_60', 'Preceptor', 'Alcance o nivel 60', 'users', 'rare', 'level', 'counter', '{"type": "level", "threshold": 60}', 0, 58),
('level_70', 'Coordenador', 'Alcance o nivel 70', 'user-cog', 'epic', 'level', 'counter', '{"type": "level", "threshold": 70}', 0, 59),
('level_80', 'Chefe de Setor', 'Alcance o nivel 80', 'building-2', 'epic', 'level', 'counter', '{"type": "level", "threshold": 80}', 0, 60),
('level_100', 'Diretor Clinico', 'Alcance o nivel 100', 'crown', 'legendary', 'level', 'counter', '{"type": "level", "threshold": 100}', 0, 61);

-- ============================================
-- HOSPITAL TYPE - PRONTO SOCORRO (62-64)
-- ============================================

INSERT INTO achievements (slug, name_pt, description_pt, icon, rarity, category, unlock_type, unlock_conditions, xp_reward, display_order) VALUES
('ps_50', 'Plantonista do PS I', 'Interprete 50 ECGs no Pronto Socorro', 'siren', 'uncommon', 'hospital', 'counter', '{"type": "hospital_type", "hospital": "pronto_socorro", "threshold": 50}', 75, 62),
('ps_200', 'Plantonista do PS II', 'Interprete 200 ECGs no Pronto Socorro', 'ambulance', 'rare', 'hospital', 'counter', '{"type": "hospital_type", "hospital": "pronto_socorro", "threshold": 200}', 200, 63),
('ps_500', 'Plantonista do PS III', 'Interprete 500 ECGs no Pronto Socorro', 'hospital', 'epic', 'hospital', 'counter', '{"type": "hospital_type", "hospital": "pronto_socorro", "threshold": 500}', 400, 64);

-- ============================================
-- HOSPITAL TYPE - HOSPITAL GERAL (65-67)
-- ============================================

INSERT INTO achievements (slug, name_pt, description_pt, icon, rarity, category, unlock_type, unlock_conditions, xp_reward, display_order) VALUES
('hg_50', 'Generalista I', 'Interprete 50 ECGs no Hospital Geral', 'stethoscope', 'uncommon', 'hospital', 'counter', '{"type": "hospital_type", "hospital": "hospital_geral", "threshold": 50}', 75, 65),
('hg_200', 'Generalista II', 'Interprete 200 ECGs no Hospital Geral', 'clipboard-list', 'rare', 'hospital', 'counter', '{"type": "hospital_type", "hospital": "hospital_geral", "threshold": 200}', 200, 66),
('hg_500', 'Generalista III', 'Interprete 500 ECGs no Hospital Geral', 'building', 'epic', 'hospital', 'counter', '{"type": "hospital_type", "hospital": "hospital_geral", "threshold": 500}', 400, 67);

-- ============================================
-- HOSPITAL TYPE - HOSPITAL CARDIOLOGICO (68-70)
-- ============================================

INSERT INTO achievements (slug, name_pt, description_pt, icon, rarity, category, unlock_type, unlock_conditions, xp_reward, display_order) VALUES
('hc_50', 'Cardiologista I', 'Interprete 50 ECGs no Hospital Cardiologico', 'heart', 'uncommon', 'hospital', 'counter', '{"type": "hospital_type", "hospital": "hospital_cardiologico", "threshold": 50}', 75, 68),
('hc_200', 'Cardiologista II', 'Interprete 200 ECGs no Hospital Cardiologico', 'heart-pulse', 'rare', 'hospital', 'counter', '{"type": "hospital_type", "hospital": "hospital_cardiologico", "threshold": 200}', 200, 69),
('hc_500', 'Cardiologista III', 'Interprete 500 ECGs no Hospital Cardiologico', 'heart-handshake', 'epic', 'hospital', 'counter', '{"type": "hospital_type", "hospital": "hospital_cardiologico", "threshold": 500}', 400, 70);

-- ============================================
-- PEDIATRIC - FUTURE READY (71-76)
-- ============================================

INSERT INTO achievements (slug, name_pt, description_pt, icon, rarity, category, unlock_type, unlock_conditions, xp_reward, display_order, is_active) VALUES
('ped_geral_25', 'Pediatra I', 'Interprete 25 ECGs pediatricos gerais', 'baby', 'uncommon', 'pediatric', 'counter', '{"type": "hospital_type", "hospital": "pediatria_geral", "threshold": 25}', 75, 71, false),
('ped_geral_100', 'Pediatra II', 'Interprete 100 ECGs pediatricos gerais', 'smile', 'rare', 'pediatric', 'counter', '{"type": "hospital_type", "hospital": "pediatria_geral", "threshold": 100}', 200, 72, false),
('ped_geral_250', 'Pediatra III', 'Interprete 250 ECGs pediatricos gerais', 'star', 'epic', 'pediatric', 'counter', '{"type": "hospital_type", "hospital": "pediatria_geral", "threshold": 250}', 400, 73, false),
('ped_cardio_25', 'Cardiopediatra I', 'Interprete 25 ECGs de cardiologia pediatrica', 'heart', 'uncommon', 'pediatric', 'counter', '{"type": "hospital_type", "hospital": "pediatria_cardiologica", "threshold": 25}', 75, 74, false),
('ped_cardio_100', 'Cardiopediatra II', 'Interprete 100 ECGs de cardiologia pediatrica', 'heart-pulse', 'rare', 'pediatric', 'counter', '{"type": "hospital_type", "hospital": "pediatria_cardiologica", "threshold": 100}', 200, 75, false),
('ped_cardio_250', 'Cardiopediatra III', 'Interprete 250 ECGs de cardiologia pediatrica', 'heart-handshake', 'epic', 'pediatric', 'counter', '{"type": "hospital_type", "hospital": "pediatria_cardiologica", "threshold": 250}', 400, 76, false);

-- ============================================
-- SPECIAL ACHIEVEMENTS (77-90)
-- ============================================

INSERT INTO achievements (slug, name_pt, description_pt, icon, rarity, category, unlock_type, unlock_conditions, xp_reward, display_order) VALUES
('hard_perfect', 'Desafio Aceito', 'Obtenha sua primeira pontuacao perfeita em um ECG dificil', 'trophy', 'uncommon', 'special', 'special', '{"type": "first_perfect_hard"}', 100, 77),
('perfect_streak_5', 'Sequencia Perfeita', 'Obtenha 5 pontuacoes perfeitas consecutivas', 'zap', 'rare', 'special', 'special', '{"type": "perfect_streak", "threshold": 5}', 200, 78),
('daily_10', 'Maratonista', 'Interprete 10 ECGs em um unico dia', 'timer', 'uncommon', 'special', 'special', '{"type": "daily_ecgs", "threshold": 10}', 75, 79),
('weekend_5', 'Fim de Semana Produtivo', 'Interprete 5 ECGs no fim de semana', 'calendar', 'uncommon', 'special', 'special', '{"type": "weekend_ecgs", "threshold": 5}', 50, 80),
('night_owl', 'Coruja', 'Interprete um ECG apos meia-noite', 'moon', 'uncommon', 'special', 'special', '{"type": "time_of_day", "after": "00:00", "before": "05:00"}', 25, 81),
('early_bird', 'Madrugador', 'Interprete um ECG antes das 6h da manha', 'sunrise', 'uncommon', 'special', 'special', '{"type": "time_of_day", "after": "04:00", "before": "06:00"}', 25, 82),
('speedrun', 'Velocista', 'Interprete 10 ECGs em 1 hora', 'rocket', 'rare', 'special', 'special', '{"type": "speedrun", "ecgs": 10, "minutes": 60}', 150, 83),
('diversified', 'Ecletico', 'Interprete pelo menos 1 ECG de cada categoria', 'layers', 'uncommon', 'special', 'special', '{"type": "all_categories"}', 100, 84),
('all_rhythms', 'Maestro do Ritmo', 'Identifique corretamente todos os tipos de ritmo', 'music', 'rare', 'special', 'special', '{"type": "all_rhythms"}', 300, 85),
('comeback', 'Retorno Triunfal', 'Volte apos 30+ dias de inatividade', 'refresh-cw', 'uncommon', 'special', 'special', '{"type": "comeback", "days": 30}', 50, 86),
('event_3x', 'Surfista de Eventos', 'Participe de um evento 3x XP', 'sparkles', 'uncommon', 'special', 'special', '{"type": "event_participation", "event_type": "3x"}', 50, 87),
('event_10', 'Cacador de Bonus', 'Participe de 10 eventos XP', 'gift', 'rare', 'special', 'special', '{"type": "events_participated", "threshold": 10}', 150, 88),
('all_difficulties', 'Versatil', 'Interprete 50+ ECGs de cada dificuldade', 'sliders', 'uncommon', 'special', 'special', '{"type": "all_difficulties", "threshold": 50}', 100, 89),
('first_week', 'Primeira Semana', 'Interprete 7 ECGs nos primeiros 7 dias', 'calendar-check', 'common', 'special', 'special', '{"type": "first_week", "ecgs": 7}', 50, 90);

-- ============================================
-- ULTRA RARE / LEGENDARY (91-100)
-- Note: Some are duplicates from above but these are the "last 10"
-- ============================================

INSERT INTO achievements (slug, name_pt, description_pt, icon, rarity, category, unlock_type, unlock_conditions, xp_reward, display_order, is_hidden) VALUES
('achievement_90', 'Colecionador', 'Desbloqueie 90 outras conquistas', 'package', 'legendary', 'special', 'special', '{"type": "achievements_unlocked", "threshold": 90}', 1000, 91, true),
('hard_1000', 'Mestre dos Dificeis', 'Interprete corretamente 1000 ECGs dificeis', 'mountain', 'legendary', 'special', 'counter', '{"type": "difficulty_correct", "difficulty": "hard", "threshold": 1000}', 1500, 92, true),
('daily_50', 'Plantao 24h', 'Interprete 50 ECGs em um unico dia', 'clock', 'legendary', 'special', 'special', '{"type": "daily_ecgs", "threshold": 50}', 1000, 93, true),
('perfect_hard_100', 'Perfeicao Extrema', 'Obtenha 100 pontuacoes perfeitas em ECGs dificeis', 'target', 'legendary', 'special', 'counter', '{"type": "perfect_hard", "threshold": 100}', 1500, 94, true),
('all_findings', 'Enciclopedia', 'Identifique corretamente todos os 92 tipos de achados', 'book-open', 'legendary', 'special', 'special', '{"type": "all_findings"}', 2000, 95, true),
('grand_master', 'Grande Mestre', 'Desbloqueie 99 outras conquistas', 'crown', 'legendary', 'special', 'special', '{"type": "achievements_unlocked", "threshold": 99}', 5000, 96, true),
('perfect_streak_10', 'Serie Impecavel', 'Obtenha 10 pontuacoes perfeitas consecutivas', 'flame', 'legendary', 'special', 'special', '{"type": "perfect_streak", "threshold": 10}', 1000, 97, true),
('speed_master', 'Mestre da Velocidade', 'Interprete 25 ECGs em 1 hora', 'zap', 'legendary', 'special', 'special', '{"type": "speedrun", "ecgs": 25, "minutes": 60}', 1000, 98, true),
('dedication', 'Dedicacao Absoluta', 'Alcance 500.000 XP total', 'gem', 'legendary', 'special', 'counter', '{"type": "total_xp", "threshold": 500000}', 2000, 99, true),
('ultimate', 'O Ultimo Desafio', 'Complete todas as outras 99 conquistas', 'trophy', 'legendary', 'special', 'special', '{"type": "achievements_unlocked", "threshold": 99}', 10000, 100, true);

-- Verify count
DO $$
DECLARE
  achievement_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO achievement_count FROM achievements;
  IF achievement_count != 100 THEN
    RAISE EXCEPTION 'Expected 100 achievements, got %', achievement_count;
  END IF;
END $$;
