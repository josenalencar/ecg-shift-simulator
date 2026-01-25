import type { Rhythm, Finding, Axis, Interval, Regularity, Difficulty, Category } from '@/types/database'

export const RHYTHMS: { value: Rhythm; label: string }[] = [
  { value: 'sinus', label: 'Ritmo Sinusal' },
  { value: 'afib', label: 'Fibrilação Atrial' },
  { value: 'aflutter', label: 'Flutter Atrial' },
  { value: 'svt', label: 'Taquicardia Supraventricular' },
  { value: 'vtach', label: 'Taquicardia Ventricular' },
  { value: 'vfib', label: 'Fibrilação Ventricular' },
  { value: 'junctional', label: 'Ritmo Juncional' },
  { value: 'paced', label: 'Ritmo de Marcapasso' },
  { value: 'asystole', label: 'Assistolia' },
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
]

export const QRS_DURATIONS: { value: Interval; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'wide', label: 'Alargado' },
]

export const QT_INTERVALS: { value: Interval; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'prolonged', label: 'Prolongado' },
]

export const FINDINGS: { value: Finding; label: string; category: string }[] = [
  // Alterações de câmaras
  { value: 'lvh', label: 'Sobrecarga Ventricular Esquerda (SVE)', category: 'Câmaras' },
  { value: 'rvh', label: 'Sobrecarga Ventricular Direita (SVD)', category: 'Câmaras' },
  { value: 'lae', label: 'Sobrecarga Atrial Esquerda (SAE)', category: 'Câmaras' },
  { value: 'rae', label: 'Sobrecarga Atrial Direita (SAD)', category: 'Câmaras' },

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

  // Isquemia/Infarto
  { value: 'stemi_anterior', label: 'IAMCSST Anterior', category: 'Isquemia' },
  { value: 'stemi_inferior', label: 'IAMCSST Inferior', category: 'Isquemia' },
  { value: 'stemi_lateral', label: 'IAMCSST Lateral', category: 'Isquemia' },
  { value: 'stemi_posterior', label: 'IAMCSST Posterior', category: 'Isquemia' },
  { value: 'stemi_septal', label: 'IAMCSST Septal', category: 'Isquemia' },
  { value: 'oca_anterior', label: 'Infarto por OCA - Anterior', category: 'Isquemia' },
  { value: 'oca_inferior', label: 'Infarto por OCA - Inferior', category: 'Isquemia' },
  { value: 'oca_septal', label: 'Infarto por OCA - Septal', category: 'Isquemia' },
  { value: 'oca_lateral', label: 'Infarto por OCA - Lateral', category: 'Isquemia' },
  { value: 'nstemi', label: 'IAMSSST / Isquemia', category: 'Isquemia' },
  { value: 'old_mi', label: 'Área Inativa (Ondas Q)', category: 'Isquemia' },

  // Alterações de repolarização
  { value: 'secondary_t_wave', label: 'Alteração Secundária da Onda T', category: 'Repolarização' },
  { value: 'primary_t_wave', label: 'Alteração Primária da Onda T', category: 'Repolarização' },
  { value: 'early_repolarization', label: 'Repolarização Precoce', category: 'Repolarização' },

  // Outros
  { value: 'pericarditis', label: 'Pericardite', category: 'Outros' },
  { value: 'hyperkalemia', label: 'Hipercalemia', category: 'Eletrólitos' },
  { value: 'hypokalemia', label: 'Hipocalemia', category: 'Eletrólitos' },
  { value: 'digitalis', label: 'Efeito Digitálico', category: 'Medicamentos' },
  { value: 'pe_pattern', label: 'Padrão de TEP (S1Q3T3)', category: 'Outros' },
  { value: 'preexcitation', label: 'Pré-excitação Ventricular', category: 'Outros' },
  { value: 'long_qt', label: 'QT Longo', category: 'Outros' },
  { value: 'brugada', label: 'Padrão de Brugada', category: 'Outros' },

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
