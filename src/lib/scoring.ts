import type { OfficialReport, Rhythm, Finding, Axis, Interval, Regularity, ElectrodeSwap } from '@/types/database'
import type { ReportFormData } from '@/components/ecg'
import { RHYTHMS, FINDINGS, ELECTRODE_SWAP_OPTIONS, AXES, formatCompoundFinding } from './ecg-constants'

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

export interface ScoringResult {
  score: number
  totalPoints: number
  maxPoints: number
  comparisons: FieldComparison[]
  isPassings: boolean
}

// Point weights for different fields
const POINTS = {
  rhythm: 25,
  regularity: 5,
  heart_rate: 10,
  axis: 10,
  pr_interval: 5,
  qrs_duration: 5,
  qt_interval: 5,
  findings: 30,
  electrode_swap: 5,
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

export function calculateScore(
  userReport: ReportFormData,
  officialReport: OfficialReport
): ScoringResult {
  const comparisons: FieldComparison[] = []
  let totalPoints = 0

  // Rhythm comparison (25 points)
  const rhythmCorrect = arraysEqual(userReport.rhythm, officialReport.rhythm)
  const rhythmOverlap = arraysOverlap(userReport.rhythm, officialReport.rhythm)
  const rhythmPartial = rhythmCorrect ? 1 : (rhythmOverlap / Math.max(officialReport.rhythm.length, 1)) * 0.5
  const rhythmPoints = Math.round(POINTS.rhythm * rhythmPartial)
  totalPoints += rhythmPoints

  comparisons.push({
    field: 'rhythm',
    label: 'Ritmo',
    userValue: formatRhythm(userReport.rhythm),
    correctValue: formatRhythm(officialReport.rhythm),
    isCorrect: rhythmCorrect,
    partialCredit: rhythmCorrect ? undefined : rhythmPartial,
    points: rhythmPoints,
    maxPoints: POINTS.rhythm,
  })

  // Regularity comparison (5 points)
  const regularityCorrect = userReport.regularity === officialReport.regularity
  const regularityPoints = regularityCorrect ? POINTS.regularity : 0
  totalPoints += regularityPoints

  comparisons.push({
    field: 'regularity',
    label: 'Regularidade',
    userValue: userReport.regularity === 'regular' ? 'Regular' : 'Irregular',
    correctValue: officialReport.regularity === 'regular' ? 'Regular' : 'Irregular',
    isCorrect: regularityCorrect,
    points: regularityPoints,
    maxPoints: POINTS.regularity,
  })

  // Heart rate comparison (10 points) - ±10 bpm tolerance
  const hrDiff = Math.abs(userReport.heart_rate - officialReport.heart_rate)
  const hrCorrect = hrDiff <= 10
  const hrPartial = hrCorrect ? 1 : Math.max(0, 1 - (hrDiff - 10) / 20)
  const hrPoints = Math.round(POINTS.heart_rate * hrPartial)
  totalPoints += hrPoints

  comparisons.push({
    field: 'heart_rate',
    label: 'Frequência Cardíaca',
    userValue: `${userReport.heart_rate} bpm`,
    correctValue: `${officialReport.heart_rate} bpm`,
    isCorrect: hrCorrect,
    partialCredit: hrCorrect ? undefined : hrPartial,
    points: hrPoints,
    maxPoints: POINTS.heart_rate,
  })

  // Axis comparison (10 points)
  const axisCorrect = userReport.axis === officialReport.axis
  const axisPoints = axisCorrect ? POINTS.axis : 0
  totalPoints += axisPoints

  comparisons.push({
    field: 'axis',
    label: 'Eixo Elétrico',
    userValue: formatAxis(userReport.axis),
    correctValue: formatAxis(officialReport.axis),
    isCorrect: axisCorrect,
    points: axisPoints,
    maxPoints: POINTS.axis,
  })

  // PR Interval comparison (5 points)
  const prCorrect = userReport.pr_interval === officialReport.pr_interval
  const prPoints = prCorrect ? POINTS.pr_interval : 0
  totalPoints += prPoints

  comparisons.push({
    field: 'pr_interval',
    label: 'Intervalo PR',
    userValue: formatInterval(userReport.pr_interval, 'pr'),
    correctValue: formatInterval(officialReport.pr_interval, 'pr'),
    isCorrect: prCorrect,
    points: prPoints,
    maxPoints: POINTS.pr_interval,
  })

  // QRS Duration comparison (5 points)
  const qrsCorrect = userReport.qrs_duration === officialReport.qrs_duration
  const qrsPoints = qrsCorrect ? POINTS.qrs_duration : 0
  totalPoints += qrsPoints

  comparisons.push({
    field: 'qrs_duration',
    label: 'Duração do QRS',
    userValue: formatInterval(userReport.qrs_duration, 'qrs'),
    correctValue: formatInterval(officialReport.qrs_duration, 'qrs'),
    isCorrect: qrsCorrect,
    points: qrsPoints,
    maxPoints: POINTS.qrs_duration,
  })

  // QT Interval comparison (5 points)
  const qtCorrect = userReport.qt_interval === officialReport.qt_interval
  const qtPoints = qtCorrect ? POINTS.qt_interval : 0
  totalPoints += qtPoints

  comparisons.push({
    field: 'qt_interval',
    label: 'Intervalo QT',
    userValue: formatInterval(userReport.qt_interval, 'qt'),
    correctValue: formatInterval(officialReport.qt_interval, 'qt'),
    isCorrect: qtCorrect,
    points: qtPoints,
    maxPoints: POINTS.qt_interval,
  })

  // Findings comparison (35 points)
  const findingsCorrect = arraysEqual(userReport.findings, officialReport.findings)

  // Calculate partial credit for findings
  const correctFindings = arraysOverlap(userReport.findings, officialReport.findings)
  const missedFindings = officialReport.findings.filter(f => !userReport.findings.includes(f)).length
  const falsePositives = userReport.findings.filter(f => !officialReport.findings.includes(f)).length

  let findingsPartial: number
  if (findingsCorrect) {
    findingsPartial = 1
  } else {
    const totalExpected = officialReport.findings.length || 1
    const baseScore = correctFindings / totalExpected
    const penalty = (missedFindings + falsePositives) * 0.1
    findingsPartial = Math.max(0, baseScore - penalty)
  }

  const findingsPoints = Math.round(POINTS.findings * findingsPartial)
  totalPoints += findingsPoints

  comparisons.push({
    field: 'findings',
    label: 'Achados',
    userValue: formatFindings(userReport.findings),
    correctValue: formatFindings(officialReport.findings),
    isCorrect: findingsCorrect,
    partialCredit: findingsCorrect ? undefined : findingsPartial,
    points: findingsPoints,
    maxPoints: POINTS.findings,
  })

  // Electrode swap comparison (5 points)
  const officialSwap = officialReport.electrode_swap || []
  const userSwap = userReport.electrode_swap || []
  const swapCorrect = arraysEqual(userSwap, officialSwap)
  const swapOverlap = arraysOverlap(userSwap, officialSwap)

  let swapPartial: number
  if (swapCorrect) {
    swapPartial = 1
  } else if (officialSwap.length === 0 && userSwap.length === 0) {
    swapPartial = 1 // Both empty is correct
  } else {
    const totalExpected = officialSwap.length || 1
    const baseScore = swapOverlap / totalExpected
    const falsePositiveSwaps = userSwap.filter(s => !officialSwap.includes(s)).length
    const penalty = falsePositiveSwaps * 0.2
    swapPartial = Math.max(0, baseScore - penalty)
  }

  const swapPoints = Math.round(POINTS.electrode_swap * swapPartial)
  totalPoints += swapPoints

  comparisons.push({
    field: 'electrode_swap',
    label: 'Troca de Eletrodos',
    userValue: formatElectrodeSwap(userSwap),
    correctValue: formatElectrodeSwap(officialSwap),
    isCorrect: swapCorrect,
    partialCredit: swapCorrect ? undefined : swapPartial,
    points: swapPoints,
    maxPoints: POINTS.electrode_swap,
  })

  const maxPoints = Object.values(POINTS).reduce((a, b) => a + b, 0)
  const score = Math.round((totalPoints / maxPoints) * 100)

  return {
    score,
    totalPoints,
    maxPoints,
    comparisons,
    isPassings: score >= 80,
  }
}
