import type { Rhythm, Finding, Axis, Interval, Regularity, Difficulty, Category, MedicalHistory, FamilyHistory, Medication, HospitalType, ElectrodeSwap, AgePattern } from '@/types/database'

export const RHYTHMS: { value: Rhythm; label: string }[] = [
  { value: 'sinus', label: 'Ritmo Sinusal' },
  { value: 'sinus_arrhythmia', label: 'Arritmia Sinusal' },
  { value: 'sinus_bradycardia', label: 'Bradicardia Sinusal' },
  { value: 'sinus_tachycardia', label: 'Taquicardia Sinusal' },
  { value: 'sinus_pause', label: 'Pausa Sinusal' },
  { value: 'ectopic_atrial', label: 'Ritmo Atrial Ectopico' },
  { value: 'afib', label: 'Fibrilação Atrial' },
  { value: 'aflutter', label: 'Flutter Atrial' },
  { value: 'svt', label: 'Taquicardia Supraventricular' },
  { value: 'mat', label: 'Taquicardia Atrial Multifocal' },
  { value: 'vtach', label: 'Taquicardia de QRS Largo' },
  { value: 'polymorphic_vtach', label: 'Taquicardia Ventricular Polimórfica' },
  { value: 'torsades', label: 'Torsades de Pointes' },
  { value: 'vfib', label: 'Fibrilação Ventricular' },
  { value: 'junctional', label: 'Ritmo Juncional' },
  { value: 'ventricular_escape', label: 'Ritmo Ventricular de Escape' },
  { value: 'riva', label: 'RIVA (Ritmo Idioventricular Acelerado)' },
  { value: 'paced', label: 'Ritmo de Marcapasso' },
  { value: 'asystole', label: 'Assistolia' },
  { value: 'isorhythmic_dissociation', label: 'Dissociação Isorrítmica' },
  { value: 'other', label: 'Outro' },
]

export const REGULARITIES: { value: Regularity; label: string }[] = [
  { value: 'regular', label: 'Regular' },
  { value: 'irregular', label: 'Irregular' },
]

export const AXES: { value: Axis; label: string }[] = [
  { value: 'normal', label: 'Eixo Normal' },
  { value: 'left', label: 'Desvio do Eixo para Esquerda' },
  { value: 'right', label: 'Desvio do Eixo para Direita' },
  { value: 'extreme', label: 'Eixo Indeterminado' },
]

// DEPRECATED: Interval fields removed from UI - kept for backward compatibility with historical data
// export const PR_INTERVALS: { value: Interval; label: string }[] = [
//   { value: 'normal', label: 'Normal' },
//   { value: 'prolonged', label: 'Prolongado (BAV 1º grau)' },
//   { value: 'short', label: 'Curto (Pré-excitação)' },
//   { value: 'na', label: 'Não se aplica' },
// ]

// export const QRS_DURATIONS: { value: Interval; label: string }[] = [
//   { value: 'normal', label: 'Normal' },
//   { value: 'wide', label: 'Alargado' },
// ]

// export const QT_INTERVALS: { value: Interval; label: string }[] = [
//   { value: 'normal', label: 'Normal' },
//   { value: 'short', label: 'Curto' },
//   { value: 'prolonged', label: 'Prolongado' },
// ]

export const FINDINGS: { value: Finding; label: string; category: string }[] = [
  // Alterações de câmaras - renamed from SVE/SVD/SAE/SAD
  { value: 'amplitude_criteria', label: 'Critérios de amplitude', category: 'Câmaras' },
  { value: 'tall_r_right_precordial', label: 'Onda R alta em precordiais direitas', category: 'Câmaras' },
  { value: 'left_atrial_enlargement', label: 'Alargamento atrial esquerdo', category: 'Câmaras' },
  { value: 'right_atrial_enlargement', label: 'Alargamento atrial direito', category: 'Câmaras' },
  { value: 'low_voltage', label: 'Baixa voltagem', category: 'Câmaras' },

  // Bloqueios de condução
  { value: 'rbbb', label: 'Bloqueio de Ramo Direito (BRD)', category: 'Condução' },
  { value: 'incomplete_rbbb', label: 'BRD de 1º Grau (BRD Incompleto)', category: 'Condução' },
  { value: 'lbbb', label: 'Bloqueio de Ramo Esquerdo (BRE)', category: 'Condução' },
  { value: 'lafb', label: 'Bloqueio Divisional Anterossuperior (BDAS)', category: 'Condução' },
  { value: 'lpfb', label: 'Bloqueio Divisional Posteroinferior (BDPI)', category: 'Condução' },
  { value: 'interatrial_block', label: 'Bloqueio Interatrial', category: 'Condução' },
  { value: 'ivcd', label: 'Disturbio de Conducao Intraventricular', category: 'Condução' },

  // Bloqueios AV
  { value: 'avb_1st', label: 'BAV 1º Grau', category: 'Bloqueio AV' },
  { value: 'avb_2nd_type1', label: 'BAV 2º Grau Tipo I (Wenckebach)', category: 'Bloqueio AV' },
  { value: 'avb_2nd_type2', label: 'BAV 2º Grau Tipo II', category: 'Bloqueio AV' },
  { value: 'avb_2_1', label: 'BAV 2:1', category: 'Bloqueio AV' },
  { value: 'avb_advanced', label: 'BAV Avancado', category: 'Bloqueio AV' },
  { value: 'avb_3rd', label: 'BAV 3º Grau (BAVT)', category: 'Bloqueio AV' },

  // Bloqueios SA
  { value: 'sab_2nd_type1', label: 'BSA 2º Grau Tipo 1', category: 'Bloqueio SA' },
  { value: 'sab_2nd_type2', label: 'BSA 2º Grau Tipo 2', category: 'Bloqueio SA' },
  { value: 'sab_3rd', label: 'BSA 3º Grau', category: 'Bloqueio SA' },

  // Extrassístoles - new section
  { value: 'ventricular_extrasystole', label: 'Extrassístole ventricular', category: 'Extrassístoles' },
  { value: 'supraventricular_extrasystole', label: 'Extrassístole supraventricular', category: 'Extrassístoles' },

  // Sinais sugestivos de infarto oclusivo (single parent finding - walls selected separately)
  { value: 'oca', label: 'Sinais sugestivos de infarto oclusivo', category: 'Sinais sugestivos de infarto oclusivo' },

  // Sinais de Fibrose
  { value: 'pathological_q', label: 'Onda Q Patológica', category: 'Sinais de Fibrose' },
  { value: 'fragmented_qrs', label: 'QRS Fragmentado', category: 'Sinais de Fibrose' },

  // Sinais de Infarto Oclusivo
  { value: 'ste', label: 'Supradesnivelamento do ST', category: 'Sinais de Infarto Oclusivo' },
  { value: 'hyperacute_t', label: 'T hiperaguda', category: 'Sinais de Infarto Oclusivo' },
  { value: 'std_v1v4', label: 'Infradesnivelamento de V1-V4', category: 'Sinais de Infarto Oclusivo' },
  { value: 'aslanger', label: 'Padrão de Aslanger', category: 'Sinais de Infarto Oclusivo' },
  { value: 'de_winter', label: 'Padrão de de Winter', category: 'Sinais de Infarto Oclusivo' },
  { value: 'subtle_ste', label: 'Supra sutil', category: 'Sinais de Infarto Oclusivo' },
  { value: 'terminal_qrs_distortion', label: 'Distorção terminal do QRS', category: 'Sinais de Infarto Oclusivo' },
  { value: 'sgarbossa_modified', label: 'Sgarbossa modificado', category: 'Sinais de Infarto Oclusivo' },

  // Outros sinais possivelmente isquêmicos
  { value: 'wellens', label: 'OCA Reperfundida / Wellens', category: 'Outros sinais possivelmente isquêmicos' },
  { value: 'avr_elevation_diffuse_std', label: 'Supra de aVR com Infra Difuso', category: 'Outros sinais possivelmente isquêmicos' },

  // Alterações de repolarização
  { value: 'secondary_t_wave', label: 'Alteração Secundária da Onda T', category: 'Repolarização' },
  { value: 'primary_t_wave', label: 'Alteração Primária da Onda T', category: 'Repolarização' },
  { value: 'early_repolarization', label: 'Repolarização Precoce', category: 'Repolarização' },
  { value: 'giant_negative_t', label: 'Onda T Negativa Gigante', category: 'Repolarização' },
  { value: 'qt_short', label: 'Intervalo QT curto', category: 'Repolarização' },
  { value: 'qt_long', label: 'Intervalo QT longo', category: 'Repolarização' },

  // Outros
  { value: 'hyperkalemia', label: 'Hipercalemia', category: 'Eletrólitos' },
  { value: 'hypokalemia', label: 'Hipocalemia', category: 'Eletrólitos' },
  { value: 'digitalis', label: 'Efeito Digitálico', category: 'Medicamentos' },
  { value: 'preexcitation', label: 'Pré-excitação Ventricular', category: 'Outros' },
  { value: 'brugada', label: 'Padrão de Brugada', category: 'Outros' },
  { value: 'spodick_sign', label: 'Sinal de Spodick', category: 'Outros' },
  { value: 'pq_depression', label: 'Infradesnivelamento do PQ', category: 'Outros' },
  { value: 'spiked_helmet', label: 'Spiked Helmet Sign', category: 'Outros' },
  { value: 'dagger_q', label: 'Onda Q em Adaga', category: 'Outros' },
  { value: 'ashman_phenomenon', label: 'Fenômeno de Ashman', category: 'Outros' },

  // Pediatric chamber findings (shown instead of adult findings when is_pediatric)
  { value: 'ped_left_atrial_disease', label: 'Doença atrial esquerda', category: 'Câmaras Pediátrico' },
  { value: 'ped_left_ventricular_disease', label: 'Doença ventricular esquerda', category: 'Câmaras Pediátrico' },
  { value: 'ped_right_atrial_disease', label: 'Doença atrial direita', category: 'Câmaras Pediátrico' },
  { value: 'ped_right_ventricular_disease', label: 'Doença ventricular direita', category: 'Câmaras Pediátrico' },

  // Normal
  { value: 'normal', label: 'ECG Normal', category: 'Normal' },
]

export const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: 'easy', label: 'Fácil' },
  { value: 'medium', label: 'Médio' },
  { value: 'hard', label: 'Difícil' },
]

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'arrhythmia', label: 'Arritmia' },
  { value: 'ischemia', label: 'Isquemia' },
  { value: 'structural', label: 'Estrutural' },
  { value: 'emergency', label: 'Emergência' },
  { value: 'routine', label: 'Rotina' },
  { value: 'advanced', label: 'Avançado' },
  { value: 'rare', label: 'Raro' },
  { value: 'normal', label: 'Normal' },
  { value: 'other', label: 'Outro' },
]

// Group findings by category for display
export const FINDINGS_BY_CATEGORY = FINDINGS.reduce((acc, finding) => {
  if (!acc[finding.category]) {
    acc[finding.category] = []
  }
  acc[finding.category].push(finding)
  return acc
}, {} as Record<string, typeof FINDINGS>)

// Wall options for dependent sections (OCA, Pathological Q)
export const WALL_OPTIONS: { value: string; label: string }[] = [
  { value: 'anterior', label: 'Anterior' },
  { value: 'inferior', label: 'Inferior' },
  { value: 'lateral', label: 'Lateral' },
  { value: 'septal', label: 'Septal' },
  { value: 'anteroapical', label: 'Anteroapical' },
  { value: 'anteromedial', label: 'Anterior média / Anteromedial' },
  { value: 'inferolateral', label: 'Inferolateral' },
  { value: 'extensive_anterior', label: 'Anterior extensa' },
]

// Pacemaker options
export const PACEMAKER_OPTIONS: { value: Finding; label: string }[] = [
  { value: 'pacemaker_normal', label: 'Funcionamento Normal' },
  { value: 'pacemaker_sense_failure', label: 'Falha de Sense' },
  { value: 'pacemaker_pace_failure', label: 'Falha de Pace' },
]

// Chamber options for pacemaker failures
export const CHAMBER_OPTIONS: { value: string; label: string }[] = [
  { value: 'atrio', label: 'Átrio' },
  { value: 'ventriculo', label: 'Ventrículo' },
]

// OCA Signs (ischemic signs for Infarto Oclusivo)
export const OCA_SIGNS: { value: Finding; label: string }[] = [
  { value: 'ste', label: 'Supradesnivelamento do ST' },
  { value: 'hyperacute_t', label: 'T hiperaguda' },
  { value: 'std_v1v4', label: 'Infradesnivelamento de V1-V4' },
  { value: 'aslanger', label: 'Padrão de Aslanger' },
  { value: 'de_winter', label: 'Padrão de de Winter' },
  { value: 'subtle_ste', label: 'Supra sutil' },
  { value: 'terminal_qrs_distortion', label: 'Distorção terminal do QRS' },
  { value: 'sgarbossa_modified', label: 'Sgarbossa modificado' },
]

// Medical History options
export const MEDICAL_HISTORY_OPTIONS: { value: MedicalHistory; label: string }[] = [
  { value: 'diabetes', label: 'Diabetes' },
  { value: 'hypertension', label: 'Hipertensão sistêmica' },
  { value: 'cad', label: 'Doença coronariana' },
  { value: 'smoking', label: 'Tabagismo' },
  { value: 'dyslipidemia', label: 'Dislipidemia' },
  { value: 'prior_mi', label: 'Infarto Previo' },
  { value: 'obesity', label: 'Obesidade' },
  { value: 'heart_failure', label: 'Historico de Insuficiencia Cardiaca' },
]

// Family History options
export const FAMILY_HISTORY_OPTIONS: { value: FamilyHistory; label: string }[] = [
  { value: 'sudden_death', label: 'Morte súbita familiar' },
  { value: 'cardiomyopathy', label: 'Cardiomiopatia familiar' },
]

// Medications options
export const MEDICATIONS_OPTIONS: { value: Medication; label: string }[] = [
  { value: 'betablocker', label: 'Betabloqueador' },
  { value: 'asa', label: 'AAS' },
  { value: 'antiarrhythmic', label: 'Antiarrítmico' },
  { value: 'digitalis', label: 'Digital' },
  { value: 'ace_inhibitor', label: 'IECA/BRA' },
  { value: 'calcium_blocker', label: 'Bloqueador de canal de cálcio' },
  { value: 'diuretic', label: 'Diurético' },
  { value: 'anticoagulant', label: 'Anticoagulante' },
  { value: 'statin', label: 'Estatina' },
  { value: 'antidepressant', label: 'Antidepressivo' },
]

// Hospital types for Pro users (affects ECG prioritization)
export const HOSPITAL_TYPES: { value: HospitalType; label: string; description: string; priorityCategories: Category[]; priorityDifficulties: Difficulty[] }[] = [
  {
    value: 'pronto_socorro',
    label: 'Pronto Socorro',
    description: 'Prioriza casos de emergência, isquemia e arritmia',
    priorityCategories: ['emergency', 'ischemia', 'arrhythmia'],
    priorityDifficulties: ['medium', 'hard'],
  },
  {
    value: 'hospital_geral',
    label: 'Hospital Geral',
    description: 'Prioriza casos de rotina, normais e estruturais',
    priorityCategories: ['routine', 'normal', 'structural', 'other'],
    priorityDifficulties: ['easy', 'medium'],
  },
  {
    value: 'hospital_cardiologico',
    label: 'Hospital Cardiológico',
    description: 'Prioriza casos avançados, raros e difíceis',
    priorityCategories: ['advanced', 'rare', 'ischemia', 'arrhythmia', 'structural'],
    priorityDifficulties: ['hard'],
  },
  {
    value: 'pediatria_geral',
    label: 'Hospital Pediátrico Geral',
    description: 'ECGs pediátricos de rotina e check-ups',
    priorityCategories: ['routine', 'normal', 'structural', 'other'],
    priorityDifficulties: ['easy', 'medium'],
  },
  {
    value: 'pediatria_cardiologica',
    label: 'Hospital Pediátrico Cardiológico',
    description: 'Cardiopatias congênitas e arritmias pediátricas',
    priorityCategories: ['advanced', 'rare', 'ischemia', 'arrhythmia', 'structural'],
    priorityDifficulties: ['medium', 'hard'],
  },
]

// Electrode swap options for technical issues
export const ELECTRODE_SWAP_OPTIONS: { value: ElectrodeSwap; label: string; description: string }[] = [
  { value: 'swap_la_ra', label: 'BE-BD', description: 'Troca entre braço esquerdo e braço direito' },
  { value: 'swap_la_ll', label: 'BE-PE', description: 'Troca entre braço esquerdo e perna esquerda' },
  { value: 'swap_ra_ll', label: 'BD-PE', description: 'Troca entre braço direito e perna esquerda' },
  { value: 'swap_rl_involved', label: 'Perna direita', description: 'Troca envolvendo perna direita' },
  { value: 'swap_precordial', label: 'Precordiais', description: 'Troca de eletrodos precordiais' },
]

// Age pattern options for pediatric ECGs
export const AGE_PATTERN_OPTIONS: { value: AgePattern; label: string }[] = [
  { value: 'expected_for_age', label: 'Esperado para idade' },
  { value: 'outside_age_pattern', label: 'Fora do padrão de idade' },
]

// Adult chamber findings (to identify which to replace with pediatric ones)
export const ADULT_CHAMBER_FINDINGS: Finding[] = [
  'amplitude_criteria',
  'tall_r_right_precordial',
  'left_atrial_enlargement',
  'right_atrial_enlargement',
  'low_voltage',
]

// Pediatric chamber findings (shown instead of adult findings when is_pediatric)
export const PEDIATRIC_CHAMBER_FINDINGS: Finding[] = [
  'ped_left_atrial_disease',
  'ped_left_ventricular_disease',
  'ped_right_atrial_disease',
  'ped_right_ventricular_disease',
]

/**
 * Format compound findings (e.g., wall-specific findings) to user-friendly labels
 * Handles dynamic findings like pathological_q_anteroapical, oca_wall_inferior, etc.
 */
export function formatCompoundFinding(finding: string): string {
  // Handle OCA wall findings: oca_wall_anterior → "Sinais sugestivos de infarto oclusivo (Anterior)"
  if (finding.startsWith('oca_wall_')) {
    const wall = finding.replace('oca_wall_', '')
    const wallLabel = WALL_OPTIONS.find(w => w.value === wall)?.label || wall
    return `Sinais sugestivos de infarto oclusivo (${wallLabel})`
  }

  // Handle pathological Q wall findings: pathological_q_anteroapical → "Onda Q Patológica (Anteroapical)"
  if (finding.startsWith('pathological_q_') && finding !== 'pathological_q') {
    const wall = finding.replace('pathological_q_', '')
    const wallLabel = WALL_OPTIONS.find(w => w.value === wall)?.label || wall
    return `Onda Q Patológica (${wallLabel})`
  }

  // Handle STE wall findings: ste_anterior → "Supradesnivelamento do ST (Anterior)"
  if (finding.startsWith('ste_') && finding !== 'ste') {
    const wall = finding.replace('ste_', '')
    const wallLabel = WALL_OPTIONS.find(w => w.value === wall)?.label || wall
    return `Supradesnivelamento do ST (${wallLabel})`
  }

  // Handle fragmented QRS wall findings: fragmented_qrs_anterior → "QRS Fragmentado (Anterior)"
  if (finding.startsWith('fragmented_qrs_') && finding !== 'fragmented_qrs') {
    const wall = finding.replace('fragmented_qrs_', '')
    const wallLabel = WALL_OPTIONS.find(w => w.value === wall)?.label || wall
    return `QRS Fragmentado (${wallLabel})`
  }

  // Handle pacemaker sense failure: pacemaker_sense_failure_atrio → "Falha de Sense (Átrio)"
  if (finding.startsWith('pacemaker_sense_failure_')) {
    const chamber = finding.replace('pacemaker_sense_failure_', '')
    return `Falha de Sense (${chamber === 'atrio' ? 'Átrio' : 'Ventrículo'})`
  }

  // Handle pacemaker pace failure: pacemaker_pace_failure_ventriculo → "Falha de Pace (Ventrículo)"
  if (finding.startsWith('pacemaker_pace_failure_')) {
    const chamber = finding.replace('pacemaker_pace_failure_', '')
    return `Falha de Pace (${chamber === 'atrio' ? 'Átrio' : 'Ventrículo'})`
  }

  // Fall back to standard lookup in FINDINGS array
  const standardFinding = FINDINGS.find(f => f.value === finding)
  if (standardFinding) {
    return standardFinding.label
  }

  // If not found, return the raw value (should not happen in production)
  return finding
}
