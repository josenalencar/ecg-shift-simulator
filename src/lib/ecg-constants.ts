import type { Rhythm, Finding, Axis, Interval, Regularity, Difficulty, Category, MedicalHistory, FamilyHistory, Medication, HospitalType } from '@/types/database'

export const RHYTHMS: { value: Rhythm; label: string }[] = [
  { value: 'sinus', label: 'Ritmo Sinusal' },
  { value: 'sinus_arrhythmia', label: 'Arritmia Sinusal' },
  { value: 'sinus_bradycardia', label: 'Bradicardia Sinusal' },
  { value: 'afib', label: 'Fibrilação Atrial' },
  { value: 'aflutter', label: 'Flutter Atrial' },
  { value: 'svt', label: 'Taquicardia Supraventricular' },
  { value: 'mat', label: 'Taquicardia Atrial Multifocal' },
  { value: 'vtach', label: 'Taquicardia Ventricular' },
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

export const PR_INTERVALS: { value: Interval; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'prolonged', label: 'Prolongado (BAV 1º grau)' },
  { value: 'short', label: 'Curto (Pré-excitação)' },
  { value: 'na', label: 'Não se aplica' },
]

export const QRS_DURATIONS: { value: Interval; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'wide', label: 'Alargado' },
]

export const QT_INTERVALS: { value: Interval; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'short', label: 'Curto' },
  { value: 'prolonged', label: 'Prolongado' },
]

export const FINDINGS: { value: Finding; label: string; category: string }[] = [
  // Alterações de câmaras - renamed from SVE/SVD/SAE/SAD
  { value: 'amplitude_criteria', label: 'Critérios de amplitude', category: 'Câmaras' },
  { value: 'tall_r_right_precordial', label: 'Onda R alta em precordiais direitas', category: 'Câmaras' },
  { value: 'left_atrial_enlargement', label: 'Alargamento atrial esquerdo', category: 'Câmaras' },
  { value: 'right_atrial_enlargement', label: 'Alargamento atrial direito', category: 'Câmaras' },
  { value: 'low_voltage', label: 'Baixa voltagem', category: 'Câmaras' },

  // Bloqueios de condução
  { value: 'rbbb', label: 'Bloqueio de Ramo Direito (BRD)', category: 'Condução' },
  { value: 'lbbb', label: 'Bloqueio de Ramo Esquerdo (BRE)', category: 'Condução' },
  { value: 'lafb', label: 'Bloqueio Divisional Anterossuperior (BDAS)', category: 'Condução' },
  { value: 'lpfb', label: 'Bloqueio Divisional Posteroinferior (BDPI)', category: 'Condução' },
  { value: 'interatrial_block', label: 'Bloqueio Interatrial', category: 'Condução' },

  // Bloqueios AV
  { value: 'avb_1st', label: 'BAV 1º Grau', category: 'Bloqueio AV' },
  { value: 'avb_2nd_type1', label: 'BAV 2º Grau Tipo I (Wenckebach)', category: 'Bloqueio AV' },
  { value: 'avb_2nd_type2', label: 'BAV 2º Grau Tipo II', category: 'Bloqueio AV' },
  { value: 'avb_3rd', label: 'BAV 3º Grau (BAVT)', category: 'Bloqueio AV' },

  // Bloqueios SA
  { value: 'sab_2nd_type1', label: 'BSA 2º Grau Tipo 1', category: 'Bloqueio SA' },
  { value: 'sab_2nd_type2', label: 'BSA 2º Grau Tipo 2', category: 'Bloqueio SA' },
  { value: 'sab_3rd', label: 'BSA 3º Grau', category: 'Bloqueio SA' },

  // Extrassístoles - new section
  { value: 'ventricular_extrasystole', label: 'Extrassístole ventricular', category: 'Extrassístoles' },
  { value: 'supraventricular_extrasystole', label: 'Extrassístole supraventricular', category: 'Extrassístoles' },

  // Infarto Oclusivo (single parent finding - walls selected separately)
  { value: 'oca', label: 'Infarto Oclusivo', category: 'Infarto Oclusivo' },

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

  // Alterações de repolarização
  { value: 'secondary_t_wave', label: 'Alteração Secundária da Onda T', category: 'Repolarização' },
  { value: 'primary_t_wave', label: 'Alteração Primária da Onda T', category: 'Repolarização' },
  { value: 'early_repolarization', label: 'Repolarização Precoce', category: 'Repolarização' },
  { value: 'giant_negative_t', label: 'Onda T Negativa Gigante', category: 'Repolarização' },

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
  { value: 'conduction', label: 'Condução' },
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
    description: 'Prioriza casos de isquemia e arritmia',
    priorityCategories: ['ischemia', 'arrhythmia'],
    priorityDifficulties: ['medium', 'hard'],
  },
  {
    value: 'hospital_geral',
    label: 'Hospital Geral',
    description: 'Prioriza casos normais, condução e outros',
    priorityCategories: ['normal', 'other', 'conduction'],
    priorityDifficulties: ['easy', 'medium'],
  },
  {
    value: 'hospital_cardiologico',
    label: 'Hospital Cardiológico',
    description: 'Prioriza casos difíceis de todas as categorias',
    priorityCategories: ['ischemia', 'arrhythmia', 'conduction', 'other'],
    priorityDifficulties: ['hard'],
  },
]
