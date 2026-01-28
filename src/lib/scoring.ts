import type { OfficialReport, Rhythm, Finding, Axis, Interval, ElectrodeSwap, Category } from '@/types/database'
import type { ReportFormData } from '@/components/ecg'
import { RHYTHMS, ELECTRODE_SWAP_OPTIONS, AXES, formatCompoundFinding } from './ecg-constants'

interface FieldComparison {
  field: string
  label: string
  userValue: string
  correctValue: string
  isCorrect: boolean
  partialCredit?: number
  points: number
  maxPoints: number
}

export interface CategoryWeights {
  rhythm: number
  heart_rate: number
  axis: number
  pr_interval: number
  qrs_duration: number
  findings: number
  electrode_swap: number
}

export interface ScoringResult {
  score: number
  totalPoints: number
  maxPoints: number
  comparisons: FieldComparison[]
  isPassings: boolean
  categoryUsed: Category | 'mixed'
  categoryWeights: CategoryWeights
}

// ============ CATEGORY WEIGHTS ============
// Each category has different point distributions based on what matters most
// All totals sum to 100 points

const CATEGORY_WEIGHTS: Record<Category, CategoryWeights> = {
  arrhythmia: { rhythm: 35, heart_rate: 8, axis: 5, pr_interval: 5, qrs_duration: 5, findings: 38, electrode_swap: 4 },
  ischemia:   { rhythm: 12, heart_rate: 5, axis: 5, pr_interval: 3, qrs_duration: 3, findings: 68, electrode_swap: 4 },
  structural: { rhythm: 15, heart_rate: 5, axis: 15, pr_interval: 5, qrs_duration: 5, findings: 50, electrode_swap: 5 },
  emergency:  { rhythm: 25, heart_rate: 8, axis: 5, pr_interval: 3, qrs_duration: 3, findings: 52, electrode_swap: 4 },
  normal:     { rhythm: 20, heart_rate: 8, axis: 10, pr_interval: 4, qrs_duration: 4, findings: 50, electrode_swap: 4 },
  routine:    { rhythm: 20, heart_rate: 8, axis: 10, pr_interval: 4, qrs_duration: 4, findings: 50, electrode_swap: 4 },
  advanced:   { rhythm: 17, heart_rate: 7, axis: 7, pr_interval: 3, qrs_duration: 3, findings: 60, electrode_swap: 3 },
  rare:       { rhythm: 17, heart_rate: 7, axis: 7, pr_interval: 3, qrs_duration: 3, findings: 60, electrode_swap: 3 },
  other:      { rhythm: 17, heart_rate: 7, axis: 7, pr_interval: 3, qrs_duration: 3, findings: 60, electrode_swap: 3 },
}

// Default weights (fallback)
const DEFAULT_WEIGHTS: CategoryWeights = CATEGORY_WEIGHTS.other

// ============ CATEGORY-RELEVANT FINDINGS ============
// Findings that get 1.25x bonus when ECG category matches

const ISCHEMIA_FINDINGS = new Set([
  'ste', 'hyperacute_t', 'std_v1v4', 'aslanger', 'de_winter', 'subtle_ste',
  'terminal_qrs_distortion', 'sgarbossa_modified', 'wellens', 'avr_elevation_diffuse_std',
])

const ARRHYTHMIA_FINDINGS = new Set([
  'avb_1st', 'avb_2nd_type1', 'avb_2nd_type2', 'avb_2_1', 'avb_advanced', 'avb_3rd',
  'sab_2nd_type1', 'sab_2nd_type2', 'sab_3rd',
  'ventricular_extrasystole', 'supraventricular_extrasystole', 'preexcitation',
])

const STRUCTURAL_FINDINGS = new Set([
  'amplitude_criteria', 'tall_r_right_precordial', 'left_atrial_enlargement',
  'right_atrial_enlargement', 'low_voltage', 'rbbb', 'lbbb', 'lafb', 'lpfb',
  'interatrial_block', 'ivcd', 'incomplete_rbbb',
])

// ============ HELPER FUNCTIONS ============

/**
 * Get weights for an ECG based on its categories
 * If multiple categories, average the weights
 */
function getWeightsForCategories(categories: Category[]): CategoryWeights {
  if (!categories || categories.length === 0) {
    return DEFAULT_WEIGHTS
  }

  if (categories.length === 1) {
    return CATEGORY_WEIGHTS[categories[0]] || DEFAULT_WEIGHTS
  }

  // Average all category weights
  const avgWeights: CategoryWeights = {
    rhythm: 0, heart_rate: 0, axis: 0, pr_interval: 0,
    qrs_duration: 0, findings: 0, electrode_swap: 0
  }

  for (const cat of categories) {
    const w = CATEGORY_WEIGHTS[cat] || DEFAULT_WEIGHTS
    avgWeights.rhythm += w.rhythm / categories.length
    avgWeights.heart_rate += w.heart_rate / categories.length
    avgWeights.axis += w.axis / categories.length
    avgWeights.pr_interval += w.pr_interval / categories.length
    avgWeights.qrs_duration += w.qrs_duration / categories.length
    avgWeights.findings += w.findings / categories.length
    avgWeights.electrode_swap += w.electrode_swap / categories.length
  }

  // Round to avoid floating point issues
  avgWeights.rhythm = Math.round(avgWeights.rhythm)
  avgWeights.heart_rate = Math.round(avgWeights.heart_rate)
  avgWeights.axis = Math.round(avgWeights.axis)
  avgWeights.pr_interval = Math.round(avgWeights.pr_interval)
  avgWeights.qrs_duration = Math.round(avgWeights.qrs_duration)
  avgWeights.findings = Math.round(avgWeights.findings)
  avgWeights.electrode_swap = Math.round(avgWeights.electrode_swap)

  return avgWeights
}

/**
 * Check if a finding is relevant to the ECG categories for bonus points
 */
function isFindingCategoryRelevant(finding: Finding, categories: Category[]): boolean {
  for (const cat of categories) {
    if (cat === 'ischemia') {
      // Check direct match or prefix match for oca_*, pathological_q_*, fragmented_qrs_*
      if (ISCHEMIA_FINDINGS.has(finding)) return true
      if (finding.startsWith('oca_')) return true
      if (finding.startsWith('pathological_q_')) return true
      if (finding.startsWith('fragmented_qrs_')) return true
      if (finding.startsWith('ste_')) return true
    }
    if (cat === 'arrhythmia') {
      if (ARRHYTHMIA_FINDINGS.has(finding)) return true
    }
    if (cat === 'structural') {
      if (STRUCTURAL_FINDINGS.has(finding)) return true
      // Pediatric chamber findings also count
      if (finding.startsWith('ped_')) return true
    }
  }
  return false
}

function arraysEqual<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false
  const sortedA = [...a].sort()
  const sortedB = [...b].sort()
  return sortedA.every((val, idx) => val === sortedB[idx])
}

function arraysOverlap<T>(a: T[], b: T[]): number {
  const setB = new Set(b)
  return a.filter(item => setB.has(item)).length
}

function formatRhythm(rhythms: Rhythm[]): string {
  return rhythms
    .map(r => RHYTHMS.find(rhythm => rhythm.value === r)?.label || r)
    .join(', ')
}

function formatFindings(findings: Finding[]): string {
  if (findings.length === 0) return 'Nenhum'
  return findings.map(f => formatCompoundFinding(f)).join(', ')
}

function formatElectrodeSwap(swaps: ElectrodeSwap[]): string {
  if (swaps.length === 0) return 'Nenhuma'
  return swaps
    .map(s => ELECTRODE_SWAP_OPTIONS.find(swap => swap.value === s)?.label || s)
    .join(', ')
}

function formatAxis(axis: Axis): string {
  return AXES.find(a => a.value === axis)?.label || axis
}

function formatInterval(interval: Interval, type: 'pr' | 'qrs' | 'qt'): string {
  if (type === 'pr') {
    const labels: Record<Interval, string> = {
      normal: 'Normal',
      prolonged: 'Prolongado (BAV 1º grau)',
      short: 'Curto (Pré-excitação)',
      wide: 'Alargado',
      na: 'Não se aplica',
    }
    return labels[interval]
  }
  if (type === 'qrs') {
    const labels: Record<Interval, string> = {
      normal: 'Normal',
      wide: 'Alargado',
      prolonged: 'Alargado',
      short: 'Normal',
      na: 'Não se aplica',
    }
    return labels[interval]
  }
  // QT interval
  const labels: Record<Interval, string> = {
    normal: 'Normal',
    short: 'Curto',
    prolonged: 'Prolongado',
    wide: 'Prolongado',
    na: 'Não se aplica',
  }
  return labels[interval]
}

// ============ MAIN SCORING FUNCTION ============

/**
 * Calculate score with category-weighted proportional system
 * @param userReport - The user's submitted report
 * @param officialReport - The official correct report
 * @param ecgCategories - Categories of the ECG (e.g., ['ischemia', 'emergency'])
 */
export function calculateScore(
  userReport: ReportFormData,
  officialReport: OfficialReport,
  ecgCategories?: Category[]
): ScoringResult {
  // Get category-specific weights
  const categories = ecgCategories || ['other' as Category]
  const weights = getWeightsForCategories(categories)

  const comparisons: FieldComparison[] = []
  let totalPoints = 0

  // ============ RHYTHM COMPARISON ============
  const rhythmCorrect = arraysEqual(userReport.rhythm, officialReport.rhythm)
  const rhythmOverlap = arraysOverlap(userReport.rhythm, officialReport.rhythm)

  let rhythmPartial: number
  if (rhythmCorrect) {
    rhythmPartial = 1
    // Bonus for exact rhythm match on arrhythmia ECGs: 1.15x (capped at 40 pts)
    if (categories.includes('arrhythmia')) {
      rhythmPartial = Math.min(1.15, 40 / weights.rhythm)
    }
  } else {
    rhythmPartial = (rhythmOverlap / Math.max(officialReport.rhythm.length, 1)) * 0.5
  }

  const rhythmMaxPoints = weights.rhythm
  const rhythmPoints = Math.round(rhythmMaxPoints * rhythmPartial)
  totalPoints += rhythmPoints

  comparisons.push({
    field: 'rhythm',
    label: 'Ritmo',
    userValue: formatRhythm(userReport.rhythm),
    correctValue: formatRhythm(officialReport.rhythm),
    isCorrect: rhythmCorrect,
    partialCredit: rhythmCorrect && rhythmPartial > 1 ? rhythmPartial : (rhythmCorrect ? undefined : rhythmPartial),
    points: rhythmPoints,
    maxPoints: rhythmMaxPoints,
  })

  // ============ HEART RATE COMPARISON ============
  const hrDiff = Math.abs(userReport.heart_rate - officialReport.heart_rate)
  const hrCorrect = hrDiff <= 10
  const hrPartial = hrCorrect ? 1 : Math.max(0, 1 - (hrDiff - 10) / 20)
  const hrMaxPoints = weights.heart_rate
  const hrPoints = Math.round(hrMaxPoints * hrPartial)
  totalPoints += hrPoints

  comparisons.push({
    field: 'heart_rate',
    label: 'Frequência Cardíaca',
    userValue: `${userReport.heart_rate} bpm`,
    correctValue: `${officialReport.heart_rate} bpm`,
    isCorrect: hrCorrect,
    partialCredit: hrCorrect ? undefined : hrPartial,
    points: hrPoints,
    maxPoints: hrMaxPoints,
  })

  // ============ AXIS COMPARISON ============
  const axisCorrect = userReport.axis === officialReport.axis
  const axisMaxPoints = weights.axis
  const axisPoints = axisCorrect ? axisMaxPoints : 0
  totalPoints += axisPoints

  comparisons.push({
    field: 'axis',
    label: 'Eixo Elétrico',
    userValue: formatAxis(userReport.axis),
    correctValue: formatAxis(officialReport.axis),
    isCorrect: axisCorrect,
    points: axisPoints,
    maxPoints: axisMaxPoints,
  })

  // ============ PR INTERVAL COMPARISON ============
  const prCorrect = userReport.pr_interval === officialReport.pr_interval
  const prMaxPoints = weights.pr_interval
  const prPoints = prCorrect ? prMaxPoints : 0
  totalPoints += prPoints

  comparisons.push({
    field: 'pr_interval',
    label: 'Intervalo PR',
    userValue: formatInterval(userReport.pr_interval, 'pr'),
    correctValue: formatInterval(officialReport.pr_interval, 'pr'),
    isCorrect: prCorrect,
    points: prPoints,
    maxPoints: prMaxPoints,
  })

  // ============ QRS DURATION COMPARISON ============
  const qrsCorrect = userReport.qrs_duration === officialReport.qrs_duration
  const qrsMaxPoints = weights.qrs_duration
  const qrsPoints = qrsCorrect ? qrsMaxPoints : 0
  totalPoints += qrsPoints

  comparisons.push({
    field: 'qrs_duration',
    label: 'Duração do QRS',
    userValue: formatInterval(userReport.qrs_duration, 'qrs'),
    correctValue: formatInterval(officialReport.qrs_duration, 'qrs'),
    isCorrect: qrsCorrect,
    points: qrsPoints,
    maxPoints: qrsMaxPoints,
  })

  // ============ QT INTERVAL - DISPLAY ONLY ============
  const qtCorrect = userReport.qt_interval === officialReport.qt_interval

  comparisons.push({
    field: 'qt_interval',
    label: 'Intervalo QT',
    userValue: formatInterval(userReport.qt_interval, 'qt'),
    correctValue: formatInterval(officialReport.qt_interval, 'qt'),
    isCorrect: qtCorrect,
    points: 0, // Not scored
    maxPoints: 0, // Not scored
  })

  // ============ FINDINGS COMPARISON (PROPORTIONAL) ============
  const findingsPool = weights.findings
  const officialFindings = officialReport.findings
  const userFindings = userReport.findings
  const findingsCorrect = arraysEqual(userFindings, officialFindings)

  // MIN_FINDINGS_DIVISOR = 3 caps max points per single finding
  const MIN_FINDINGS_DIVISOR = 3
  const basePointsPerFinding = findingsPool / Math.max(officialFindings.length, MIN_FINDINGS_DIVISOR)

  let earnedFindingsPoints = 0
  const correctFindingsCount = arraysOverlap(userFindings, officialFindings)

  if (findingsCorrect) {
    // Perfect match gets full pool
    earnedFindingsPoints = findingsPool
  } else if (correctFindingsCount === 0 && officialFindings.length > 0) {
    // No correct findings = 0 points
    earnedFindingsPoints = 0
  } else {
    // Calculate points for each correct finding with category bonus
    for (const finding of officialFindings) {
      if (userFindings.includes(finding)) {
        const categoryBonus = isFindingCategoryRelevant(finding, categories) ? 1.25 : 1.0
        earnedFindingsPoints += basePointsPerFinding * categoryBonus
      }
    }

    // Cap at pool max (bonus can't push total above pool)
    earnedFindingsPoints = Math.min(earnedFindingsPoints, findingsPool)

    // Penalty for false positives (3% of pool per false positive)
    const falsePositives = userFindings.filter(f => !officialFindings.includes(f)).length
    const penalty = falsePositives * (findingsPool * 0.03)

    // Guarantee minimum: 50% of earned points
    const minimumPoints = earnedFindingsPoints * 0.5
    earnedFindingsPoints = Math.max(minimumPoints, earnedFindingsPoints - penalty)
  }

  const findingsPoints = Math.round(earnedFindingsPoints)
  const findingsMaxPoints = findingsPool
  totalPoints += findingsPoints

  // Calculate effective max for display (based on number of findings)
  const effectiveFindingsMax = officialFindings.length > 0
    ? Math.round(basePointsPerFinding * officialFindings.length)
    : findingsPool

  comparisons.push({
    field: 'findings',
    label: 'Achados',
    userValue: formatFindings(userFindings),
    correctValue: formatFindings(officialFindings),
    isCorrect: findingsCorrect,
    partialCredit: findingsCorrect ? undefined : (earnedFindingsPoints / findingsPool),
    points: findingsPoints,
    maxPoints: Math.min(effectiveFindingsMax, findingsMaxPoints), // Show proportional max
  })

  // ============ ELECTRODE SWAP COMPARISON ============
  const officialSwap = officialReport.electrode_swap || []
  const userSwap = userReport.electrode_swap || []
  const swapCorrect = arraysEqual(userSwap, officialSwap)
  const swapOverlap = arraysOverlap(userSwap, officialSwap)
  const swapMaxPoints = weights.electrode_swap

  let swapPartial: number
  if (swapCorrect) {
    swapPartial = 1
  } else if (officialSwap.length === 0 && userSwap.length === 0) {
    swapPartial = 1 // Both empty is correct
  } else {
    const totalExpectedSwaps = officialSwap.length || 1
    const baseScore = swapOverlap / totalExpectedSwaps
    const falsePositiveSwaps = userSwap.filter(s => !officialSwap.includes(s)).length
    const penalty = falsePositiveSwaps * 0.2
    swapPartial = Math.max(0, baseScore - penalty)
  }

  const swapPoints = Math.round(swapMaxPoints * swapPartial)
  totalPoints += swapPoints

  comparisons.push({
    field: 'electrode_swap',
    label: 'Troca de Eletrodos',
    userValue: formatElectrodeSwap(userSwap),
    correctValue: formatElectrodeSwap(officialSwap),
    isCorrect: swapCorrect,
    partialCredit: swapCorrect ? undefined : swapPartial,
    points: swapPoints,
    maxPoints: swapMaxPoints,
  })

  // ============ CALCULATE FINAL SCORE ============
  const maxPoints = weights.rhythm + weights.heart_rate + weights.axis +
    weights.pr_interval + weights.qrs_duration + weights.findings + weights.electrode_swap

  const score = Math.round((totalPoints / maxPoints) * 100)

  // Determine primary category for display
  const categoryUsed: Category | 'mixed' = categories.length === 1
    ? categories[0]
    : 'mixed'

  return {
    score,
    totalPoints,
    maxPoints,
    comparisons,
    isPassings: score >= 80,
    categoryUsed,
    categoryWeights: weights,
  }
}
