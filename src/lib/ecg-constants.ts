import type { Rhythm, Finding, Axis, Interval, Regularity, Difficulty, Category } from '@/types/database'

export const RHYTHMS: { value: Rhythm; label: string }[] = [
  { value: 'sinus', label: 'Sinus Rhythm' },
  { value: 'afib', label: 'Atrial Fibrillation' },
  { value: 'aflutter', label: 'Atrial Flutter' },
  { value: 'svt', label: 'SVT' },
  { value: 'vtach', label: 'Ventricular Tachycardia' },
  { value: 'vfib', label: 'Ventricular Fibrillation' },
  { value: 'junctional', label: 'Junctional Rhythm' },
  { value: 'paced', label: 'Paced Rhythm' },
  { value: 'asystole', label: 'Asystole' },
  { value: 'other', label: 'Other' },
]

export const REGULARITIES: { value: Regularity; label: string }[] = [
  { value: 'regular', label: 'Regular' },
  { value: 'irregular', label: 'Irregular' },
]

export const AXES: { value: Axis; label: string }[] = [
  { value: 'normal', label: 'Normal Axis' },
  { value: 'left', label: 'Left Axis Deviation' },
  { value: 'right', label: 'Right Axis Deviation' },
  { value: 'extreme', label: 'Extreme Axis' },
]

export const PR_INTERVALS: { value: Interval; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'prolonged', label: 'Prolonged (1° AVB)' },
  { value: 'short', label: 'Short (WPW)' },
]

export const QRS_DURATIONS: { value: Interval; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'wide', label: 'Wide' },
]

export const QT_INTERVALS: { value: Interval; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'prolonged', label: 'Prolonged' },
]

export const FINDINGS: { value: Finding; label: string; category: string }[] = [
  // Chamber changes
  { value: 'lvh', label: 'LVH (Left Ventricular Hypertrophy)', category: 'Chamber' },
  { value: 'rvh', label: 'RVH (Right Ventricular Hypertrophy)', category: 'Chamber' },
  { value: 'lae', label: 'LAE (Left Atrial Enlargement)', category: 'Chamber' },
  { value: 'rae', label: 'RAE (Right Atrial Enlargement)', category: 'Chamber' },

  // Bundle branch blocks
  { value: 'rbbb', label: 'RBBB (Right Bundle Branch Block)', category: 'Conduction' },
  { value: 'lbbb', label: 'LBBB (Left Bundle Branch Block)', category: 'Conduction' },
  { value: 'lafb', label: 'LAFB (Left Anterior Fascicular Block)', category: 'Conduction' },
  { value: 'lpfb', label: 'LPFB (Left Posterior Fascicular Block)', category: 'Conduction' },

  // AV Blocks
  { value: 'avb_1st', label: '1° AV Block', category: 'AV Block' },
  { value: 'avb_2nd_type1', label: '2° AV Block Type I (Wenckebach)', category: 'AV Block' },
  { value: 'avb_2nd_type2', label: '2° AV Block Type II', category: 'AV Block' },
  { value: 'avb_3rd', label: '3° AV Block (Complete)', category: 'AV Block' },

  // Ischemia/Infarction
  { value: 'stemi_anterior', label: 'STEMI - Anterior', category: 'Ischemia' },
  { value: 'stemi_inferior', label: 'STEMI - Inferior', category: 'Ischemia' },
  { value: 'stemi_lateral', label: 'STEMI - Lateral', category: 'Ischemia' },
  { value: 'stemi_posterior', label: 'STEMI - Posterior', category: 'Ischemia' },
  { value: 'nstemi', label: 'NSTEMI / Ischemia', category: 'Ischemia' },
  { value: 'old_mi', label: 'Old MI (Q waves)', category: 'Ischemia' },

  // Other
  { value: 'pericarditis', label: 'Pericarditis', category: 'Other' },
  { value: 'early_repolarization', label: 'Early Repolarization', category: 'Other' },
  { value: 'hyperkalemia', label: 'Hyperkalemia', category: 'Electrolyte' },
  { value: 'hypokalemia', label: 'Hypokalemia', category: 'Electrolyte' },
  { value: 'digitalis', label: 'Digitalis Effect', category: 'Drug Effect' },
  { value: 'pe_pattern', label: 'PE Pattern (S1Q3T3)', category: 'Other' },
  { value: 'wpw', label: 'WPW (Delta Wave)', category: 'Other' },
  { value: 'long_qt', label: 'Long QT', category: 'Other' },
  { value: 'brugada', label: 'Brugada Pattern', category: 'Other' },

  // Normal
  { value: 'normal', label: 'Normal ECG', category: 'Normal' },
]

export const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
]

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'arrhythmia', label: 'Arrhythmia' },
  { value: 'ischemia', label: 'Ischemia' },
  { value: 'conduction', label: 'Conduction' },
  { value: 'normal', label: 'Normal' },
  { value: 'other', label: 'Other' },
]

// Group findings by category for display
export const FINDINGS_BY_CATEGORY = FINDINGS.reduce((acc, finding) => {
  if (!acc[finding.category]) {
    acc[finding.category] = []
  }
  acc[finding.category].push(finding)
  return acc
}, {} as Record<string, typeof FINDINGS>)
