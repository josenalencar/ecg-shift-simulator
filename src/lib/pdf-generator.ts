/**
 * PDF Generator for Premium Feedback Reports
 * Generates a downloadable PDF with ECG comparison and explanations
 * Design: Professional medical report with modern styling
 */

import jsPDF from 'jspdf'
import type { ScoringResult } from './scoring'
import type { OfficialReport } from '@/types/database'
import {
  RHYTHM_EXPLANATIONS,
  FINDING_EXPLANATIONS,
  AXIS_EXPLANATIONS,
  INTERVAL_EXPLANATIONS,
  ELECTRODE_SWAP_EXPLANATIONS
} from './ecg-explanations'
import { formatCompoundFinding } from './ecg-constants'

export interface PDFReportData {
  ecgImageUrl: string
  scoringResult: ScoringResult
  officialReport: OfficialReport
  date: Date
  userName?: string
}

// Course promotion URL
const COURSE_URL = 'https://www.manole.com.br/curso-de-eletrocardiograma-com-jose-alencar-2-edicao/p'

// Color palette
const colors = {
  primary: [37, 99, 235] as [number, number, number],      // Blue-600
  secondary: [30, 64, 175] as [number, number, number],    // Blue-800
  success: [22, 163, 74] as [number, number, number],      // Green-600
  error: [220, 38, 38] as [number, number, number],        // Red-600
  bg: {
    lighter: [248, 250, 252] as [number, number, number],  // Slate-50
    light: [241, 245, 249] as [number, number, number],    // Slate-100
  },
  accent: {
    success: [220, 252, 231] as [number, number, number],  // Green-100
    error: [254, 226, 226] as [number, number, number],    // Red-100
  },
  text: {
    primary: [15, 23, 42] as [number, number, number],     // Slate-900
    secondary: [71, 85, 105] as [number, number, number],  // Slate-500
    light: [148, 163, 184] as [number, number, number],    // Slate-400
  }
}

/**
 * Load image from URL as base64
 */
async function loadImageAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, { mode: 'cors' })
    if (!response.ok) throw new Error('Failed to load image')
    const blob = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.warn('Failed to load image:', url, error)
    return null
  }
}

/**
 * Format date for display (Brazil timezone)
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Truncate text with ellipsis
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 1) + '…'
}

/**
 * Generate a feedback PDF report
 */
export async function generateFeedbackPDF(data: PDFReportData): Promise<Blob> {
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 16
  const contentWidth = pageWidth - 2 * margin
  let yPosition = margin

  // Load images
  const logoUrl = 'https://hwgsjpjbyydpittefnjd.supabase.co/storage/v1/object/public/assets/PlantaoECGLogo.png'
  const courseImageUrl = 'https://manole.vtexassets.com/arquivos/ids/266919-1200-auto?v=638775683835930000&width=1200&height=auto&aspect=true'

  const logoBase64 = await loadImageAsBase64(logoUrl)
  const courseImageBase64 = await loadImageAsBase64(courseImageUrl)

  // ============ HEADER ============
  // Background
  pdf.setFillColor(...colors.bg.lighter)
  pdf.rect(0, 0, pageWidth, 55, 'F')

  // Top accent line
  pdf.setFillColor(...colors.primary)
  pdf.rect(0, 0, pageWidth, 3, 'F')

  // Logo
  if (logoBase64) {
    try {
      pdf.addImage(logoBase64, 'PNG', margin, 5, 45, 20)
    } catch {
      pdf.setTextColor(...colors.primary)
      pdf.setFontSize(22)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Plantao ECG', margin, 18)
    }
  } else {
    pdf.setTextColor(...colors.primary)
    pdf.setFontSize(22)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Plantao ECG', margin, 18)
  }

  // Header text
  pdf.setTextColor(...colors.text.secondary)
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'bold')
  pdf.text('RELATÓRIO DE FEEDBACK PREMIUM', pageWidth - margin, 12, { align: 'right' })

  pdf.setFontSize(8)
  pdf.setTextColor(...colors.text.light)
  pdf.text(formatDate(data.date), pageWidth - margin, 18, { align: 'right' })

  // Divider
  pdf.setDrawColor(...colors.text.light)
  pdf.setLineWidth(0.5)
  pdf.line(margin, 28, pageWidth - margin, 28)

  yPosition = 38

  // ============ USER INFO CARD ============
  if (data.userName) {
    pdf.setFillColor(...colors.bg.light)
    pdf.roundedRect(margin, yPosition, contentWidth, 14, 2, 2, 'F')

    pdf.setTextColor(...colors.text.secondary)
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'normal')
    pdf.text('USUÁRIO', margin + 5, yPosition + 4)

    pdf.setTextColor(...colors.text.primary)
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.text(data.userName, margin + 5, yPosition + 10)

    yPosition += 18
  }

  // ============ SCORE SECTION - ENHANCED ============
  const score = data.scoringResult.score
  const isPassings = data.scoringResult.isPassings
  const scoreBgColor = isPassings ? colors.accent.success : colors.accent.error
  const scoreColor = isPassings ? colors.success : colors.error
  const scoreLabel = isPassings ? 'APROVADO' : 'CONTINUAR PRATICANDO'

  pdf.setFillColor(...scoreBgColor)
  pdf.roundedRect(margin, yPosition, contentWidth, 50, 4, 4, 'F')

  // Score percentage
  pdf.setTextColor(...scoreColor)
  pdf.setFontSize(56)
  pdf.setFont('helvetica', 'bold')
  pdf.text(`${score}%`, margin + 20, yPosition + 32)

  // Status label
  pdf.setFontSize(16)
  pdf.setFont('helvetica', 'bold')
  pdf.text(scoreLabel, margin + 65, yPosition + 26)

  // Points breakdown
  pdf.setFontSize(11)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(...colors.text.secondary)
  pdf.text(`${data.scoringResult.totalPoints} de ${data.scoringResult.maxPoints} pontos`, margin + 65, yPosition + 35)

  // Performance text
  const performanceText = score >= 80 ? 'Excelente desempenho!' :
    score >= 60 ? 'Bom trabalho, continue!' : 'Revise os conceitos-chave'
  pdf.setFontSize(10)
  pdf.setTextColor(...colors.text.light)
  pdf.text(performanceText, margin + 65, yPosition + 42)

  yPosition += 58

  // ============ ANALYSIS TABLE ============
  pdf.setTextColor(...colors.text.primary)
  pdf.setFontSize(14)
  pdf.setFont('helvetica', 'bold')
  pdf.text('ANÁLISE DETALHADA', margin, yPosition)

  pdf.setFontSize(9)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(...colors.text.light)
  pdf.text('Comparação entre suas respostas e o gabarito', margin, yPosition + 5)

  yPosition += 12

  // Table header
  pdf.setFillColor(...colors.primary)
  pdf.roundedRect(margin, yPosition, contentWidth, 10, 2, 2, 'F')

  pdf.setFontSize(9)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(255, 255, 255)
  pdf.text('CAMPO', margin + 5, yPosition + 6.5)
  pdf.text('SUA RESPOSTA', margin + 52, yPosition + 6.5)
  pdf.text('ESPERADO', margin + 115, yPosition + 6.5)
  pdf.text('PTS', margin + 170, yPosition + 6.5)

  yPosition += 12

  // Table rows
  pdf.setFont('helvetica', 'normal')
  for (let idx = 0; idx < data.scoringResult.comparisons.length; idx++) {
    const comparison = data.scoringResult.comparisons[idx]

    // Check for page break
    if (yPosition > pageHeight - 60) {
      pdf.addPage()
      yPosition = margin
    }

    const rowHeight = 10
    const isEven = idx % 2 === 0

    // Alternating background
    if (isEven) {
      pdf.setFillColor(...colors.bg.light)
      pdf.rect(margin, yPosition - 1, contentWidth, rowHeight, 'F')
    }

    // Status indicator
    const statusColor = comparison.isCorrect ? colors.success : colors.error
    pdf.setFillColor(...statusColor)
    pdf.circle(margin + 3, yPosition + 3.5, 2, 'F')

    pdf.setTextColor(...colors.text.primary)
    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'normal')
    pdf.text(truncateText(comparison.label, 18), margin + 8, yPosition + 4.5)

    const userValueColor = comparison.isCorrect ? colors.success : colors.error
    pdf.setTextColor(...userValueColor)
    pdf.setFont('helvetica', 'bold')
    pdf.text(truncateText(comparison.userValue, 28), margin + 52, yPosition + 4.5)

    pdf.setTextColor(...colors.text.primary)
    pdf.setFont('helvetica', 'normal')
    pdf.text(truncateText(comparison.correctValue, 28), margin + 115, yPosition + 4.5)

    pdf.setTextColor(...statusColor)
    pdf.setFont('helvetica', 'bold')
    pdf.text(`${comparison.points}/${comparison.maxPoints}`, margin + 170, yPosition + 4.5)

    yPosition += rowHeight
  }

  yPosition += 10

  // ============ EXPLANATIONS ============
  const incorrectItems = data.scoringResult.comparisons.filter(item => !item.isCorrect)

  if (incorrectItems.length > 0) {
    if (yPosition > pageHeight - 80) {
      pdf.addPage()
      yPosition = margin
    }

    pdf.setTextColor(...colors.text.primary)
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('EXPLICAÇÕES E FEEDBACK', margin, yPosition)

    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(...colors.text.light)
    pdf.text(`${incorrectItems.length} área(s) para revisar`, margin, yPosition + 5)

    yPosition += 12

    for (const item of incorrectItems) {
      if (yPosition > pageHeight - 60) {
        pdf.addPage()
        yPosition = margin
      }

      // Item header with accent line
      pdf.setDrawColor(...colors.error)
      pdf.setLineWidth(3)
      pdf.line(margin, yPosition - 0.5, margin, yPosition + 8.5)

      pdf.setTextColor(...colors.text.primary)
      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'bold')
      pdf.text(item.label, margin + 6, yPosition + 6)

      yPosition += 11

      // Responses
      pdf.setTextColor(...colors.error)
      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`Sua resposta: ${item.userValue}`, margin + 5, yPosition)
      yPosition += 6

      pdf.setTextColor(...colors.success)
      pdf.text(`Esperado: ${item.correctValue}`, margin + 5, yPosition)
      yPosition += 9

      // Get explanations for this field
      const explanations = getExplanationsForField(item.field, data.officialReport)

      if (explanations.length > 0) {
        pdf.setTextColor(...colors.text.secondary)
        pdf.setFontSize(9)
        pdf.setFont('helvetica', 'bold')
        pdf.text('Conceitos-chave:', margin + 5, yPosition)
        yPosition += 6

        for (const exp of explanations) {
          if (yPosition > pageHeight - 30) {
            pdf.addPage()
            yPosition = margin
          }

          // Bullet background
          pdf.setFillColor(...colors.bg.light)
          pdf.roundedRect(margin + 3, yPosition - 1.5, contentWidth - 8, 5, 1.5, 1.5, 'F')

          pdf.setTextColor(...colors.primary)
          pdf.setFontSize(9)
          pdf.setFont('helvetica', 'bold')
          pdf.text(`• ${exp.name}`, margin + 6, yPosition + 1.5)
          yPosition += 6

          pdf.setTextColor(...colors.text.secondary)
          pdf.setFontSize(8)
          pdf.setFont('helvetica', 'normal')
          const descLines = pdf.splitTextToSize(exp.description, contentWidth - 16)
          for (const line of descLines) {
            if (yPosition > pageHeight - 20) {
              pdf.addPage()
              yPosition = margin
            }
            pdf.text(line, margin + 8, yPosition)
            yPosition += 4
          }

          yPosition += 2
        }
      }

      yPosition += 6
    }
  }

  // ============ COURSE PROMOTION ============
  if (yPosition > pageHeight - 100) {
    pdf.addPage()
    yPosition = margin
  }

  yPosition += 5

  // Promotion box
  pdf.setFillColor(...colors.secondary)
  pdf.roundedRect(margin, yPosition, contentWidth, 65, 4, 4, 'F')

  // Try to add course image
  const promoImageHeight = courseImageBase64 ? 60 : 0
  const promoImageWidth = courseImageBase64 ? 40 : 0

  if (courseImageBase64) {
    try {
      pdf.addImage(courseImageBase64, 'JPEG', margin + 3, yPosition + 2, promoImageWidth, promoImageHeight)
    } catch {
      console.warn('Could not render course image')
    }
  }

  const textStartX = courseImageBase64 ? margin + promoImageWidth + 10 : margin + 8

  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(13)
  pdf.setFont('helvetica', 'bold')
  pdf.text('APRENDA MAIS', textStartX, yPosition + 10)

  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  pdf.text('Domine a Interpretação de ECG', textStartX, yPosition + 20)

  pdf.setFontSize(11)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Curso de Eletrocardiograma', textStartX, yPosition + 30)
  pdf.text('com José Alencar - 2ª Edição', textStartX, yPosition + 38)

  pdf.setFontSize(9)
  pdf.setTextColor(200, 220, 255)
  pdf.text('→ Clique para conhecer mais', textStartX, yPosition + 50)

  // Add link
  pdf.link(margin, yPosition, contentWidth, 65, { url: COURSE_URL })

  // ============ FOOTER ============
  const totalPages = pdf.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i)

    // Footer divider
    pdf.setDrawColor(...colors.text.light)
    pdf.setLineWidth(0.5)
    pdf.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12)

    // Footer text
    pdf.setTextColor(...colors.text.light)
    pdf.setFontSize(7)
    pdf.setFont('helvetica', 'normal')
    pdf.text(
      `Plantão ECG - Simulador de Plantão de Tele-ECG | Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 7,
      { align: 'center' }
    )
  }

  return pdf.output('blob')
}

/**
 * A single explanation item with name and description
 */
interface ExplanationItem {
  name: string
  description: string
}

/**
 * Format rhythm key to readable name
 */
function formatRhythmName(key: string): string {
  const rhythmNames: Record<string, string> = {
    sinus: 'Ritmo Sinusal',
    sinus_arrhythmia: 'Arritmia Sinusal',
    sinus_bradycardia: 'Bradicardia Sinusal',
    sinus_tachycardia: 'Taquicardia Sinusal',
    afib: 'Fibrilação Atrial',
    aflutter: 'Flutter Atrial',
    svt: 'Taquicardia Supraventricular',
    mat: 'Taquicardia Atrial Multifocal',
    vtach: 'Taquicardia Ventricular',
    polymorphic_vtach: 'TV Polimórfica',
    torsades: 'Torsades de Pointes',
    vfib: 'Fibrilação Ventricular',
    junctional: 'Ritmo Juncional',
    ventricular_escape: 'Escape Ventricular',
    riva: 'RIVA',
    paced: 'Ritmo de Marcapasso',
    asystole: 'Assistolia',
    isorhythmic_dissociation: 'Dissociação Isorrítmica',
    ectopic_atrial: 'Ritmo Atrial Ectópico',
    sinus_pause: 'Pausa Sinusal',
    other: 'Outro'
  }
  return rhythmNames[key] || key
}

/**
 * Format axis key to readable name
 */
function formatAxisName(key: string): string {
  const axisNames: Record<string, string> = {
    normal: 'Eixo Normal',
    left: 'Desvio para Esquerda',
    right: 'Desvio para Direita',
    extreme: 'Eixo Indeterminado'
  }
  return axisNames[key] || key
}

/**
 * Format interval names
 */
function formatIntervalName(type: string, key: string): string {
  const valueNames: Record<string, string> = {
    normal: 'Normal',
    prolonged: 'Prolongado',
    short: 'Curto',
    wide: 'Alargado',
    na: 'N/A'
  }
  return `${type} ${valueNames[key] || key}`
}

/**
 * Format electrode swap key to readable name
 */
function formatElectrodeSwapName(key: string): string {
  const swapNames: Record<string, string> = {
    swap_la_ra: 'Troca BE-BD',
    swap_la_ll: 'Troca BE-PE',
    swap_ra_ll: 'Troca BD-PE',
    swap_rl_involved: 'Envolvendo PD',
    swap_precordial: 'Troca Precordial'
  }
  return swapNames[key] || key
}

/**
 * Get explanations for a specific field based on the official report
 * Returns an array of individual explanations for better formatting
 */
function getExplanationsForField(field: string, officialReport: OfficialReport): ExplanationItem[] {
  const explanations: ExplanationItem[] = []

  switch (field) {
    case 'rhythm':
      for (const rhythmKey of officialReport.rhythm) {
        const explanation = RHYTHM_EXPLANATIONS[rhythmKey]
        if (explanation) {
          explanations.push({
            name: formatRhythmName(rhythmKey),
            description: explanation.description
          })
        }
      }
      break

    case 'findings':
      for (const f of officialReport.findings) {
        // Try to get base finding explanation
        const baseKey = f.split('_')[0] === 'pathological' ? 'pathological_q' :
                       f.split('_')[0] === 'oca' ? 'oca' :
                       f.split('_')[0] === 'ste' ? 'ste' :
                       f.split('_')[0] === 'fragmented' ? 'fragmented_qrs' : f
        const explanation = FINDING_EXPLANATIONS[f] || FINDING_EXPLANATIONS[baseKey]
        if (explanation) {
          explanations.push({
            name: formatCompoundFinding(f),
            description: explanation.description
          })
        }
      }
      break

    case 'axis':
      const axisExp = AXIS_EXPLANATIONS[officialReport.axis]
      if (axisExp) {
        explanations.push({
          name: formatAxisName(officialReport.axis),
          description: axisExp.description
        })
      }
      break

    case 'pr_interval':
      const prExp = INTERVAL_EXPLANATIONS.pr[officialReport.pr_interval]
      if (prExp) {
        explanations.push({
          name: formatIntervalName('PR', officialReport.pr_interval),
          description: prExp.description
        })
      }
      break

    case 'qrs_duration':
      const qrsExp = INTERVAL_EXPLANATIONS.qrs[officialReport.qrs_duration]
      if (qrsExp) {
        explanations.push({
          name: formatIntervalName('QRS', officialReport.qrs_duration),
          description: qrsExp.description
        })
      }
      break

    case 'qt_interval':
      const qtExp = INTERVAL_EXPLANATIONS.qt[officialReport.qt_interval]
      if (qtExp) {
        explanations.push({
          name: formatIntervalName('QT', officialReport.qt_interval),
          description: qtExp.description
        })
      }
      break

    case 'electrode_swap':
      if (officialReport.electrode_swap) {
        for (const s of officialReport.electrode_swap) {
          const explanation = ELECTRODE_SWAP_EXPLANATIONS[s]
          if (explanation) {
            explanations.push({
              name: formatElectrodeSwapName(s),
              description: explanation.description
            })
          }
        }
      }
      break
  }

  return explanations
}

/**
 * Download the PDF blob as a file
 */
export function downloadPDF(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
