/**
 * PDF Generator for Premium Feedback Reports
 * Generates a downloadable PDF with ECG image, comparison, and explanations
 */

import jsPDF from 'jspdf'
import type { ScoringResult } from './scoring'
import type { OfficialReport } from '@/types/database'
import {
  RHYTHM_EXPLANATIONS,
  FINDING_EXPLANATIONS,
  AXIS_EXPLANATIONS,
  INTERVAL_EXPLANATIONS,
  REGULARITY_EXPLANATIONS,
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

/**
 * Load logo image as base64 data URL
 */
async function loadLogoAsBase64(): Promise<string | null> {
  try {
    const response = await fetch('/plantaoecg.png')
    const blob = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('Failed to load logo:', error)
    return null
  }
}

/**
 * Load course image as base64 data URL
 */
async function loadCourseImageAsBase64(): Promise<string | null> {
  try {
    const response = await fetch('https://manole.vtexassets.com/arquivos/ids/266919-1200-auto?v=638775683835930000&width=1200&height=auto&aspect=true')
    const blob = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('Failed to load course image:', error)
    return null
  }
}

/**
 * Generate a feedback PDF report
 */
export async function generateFeedbackPDF(data: PDFReportData): Promise<Blob> {
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 15
  const contentWidth = pageWidth - 2 * margin
  let yPosition = margin

  // Colors
  const primaryColor: [number, number, number] = [124, 58, 237] // Purple-600
  const textColor: [number, number, number] = [23, 23, 23] // Near black
  const grayColor: [number, number, number] = [107, 114, 128] // Gray-500
  const greenColor: [number, number, number] = [16, 185, 129] // Green-500
  const redColor: [number, number, number] = [239, 68, 68] // Red-500

  // Helper to reset text styles after page break
  const resetTextStyles = () => {
    pdf.setTextColor(...textColor)
    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'normal')
  }

  // === HEADER ===
  pdf.setFillColor(...primaryColor)
  pdf.rect(0, 0, pageWidth, 25, 'F')

  // Try to add logo
  const logoBase64 = await loadLogoAsBase64()
  if (logoBase64) {
    // Add logo image (positioned on left side of header)
    pdf.addImage(logoBase64, 'PNG', margin, 4, 40, 17)
  } else {
    // Fallback to text if logo fails to load
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(20)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Plantao ECG', margin, 16)
  }

  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  pdf.text('Relatorio de Feedback Premium', pageWidth - margin, 12, { align: 'right' })
  pdf.text(formatDate(data.date), pageWidth - margin, 18, { align: 'right' })

  yPosition = 35

  // === USER NAME (if available) ===
  if (data.userName) {
    pdf.setTextColor(...textColor)
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Usuario: `, margin, yPosition)
    pdf.setFont('helvetica', 'bold')
    pdf.text(data.userName, margin + 25, yPosition)
    yPosition += 10
  }

  // === SCORE SUMMARY ===
  const isPassings = data.scoringResult.isPassings
  const summaryBgColor: [number, number, number] = isPassings ? [220, 252, 231] : [254, 226, 226]
  pdf.setFillColor(...summaryBgColor)
  pdf.roundedRect(margin, yPosition, contentWidth, 25, 3, 3, 'F')

  const summaryTextColor = isPassings ? greenColor : redColor
  pdf.setTextColor(...summaryTextColor)
  pdf.setFontSize(24)
  pdf.setFont('helvetica', 'bold')
  pdf.text(`${data.scoringResult.score}%`, margin + 10, yPosition + 16)

  pdf.setFontSize(12)
  pdf.text(
    isPassings ? 'Aprovado!' : 'Continue praticando!',
    margin + 45,
    yPosition + 14
  )

  pdf.setTextColor(...grayColor)
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  pdf.text(
    `${data.scoringResult.totalPoints} / ${data.scoringResult.maxPoints} pontos`,
    margin + 45,
    yPosition + 21
  )

  yPosition += 35

  // === COMPARISON TABLE ===
  pdf.setTextColor(...textColor)
  pdf.setFontSize(14)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Comparacao Detalhada', margin, yPosition)
  yPosition += 8

  // Table header
  pdf.setFillColor(243, 244, 246) // Gray-100
  pdf.rect(margin, yPosition, contentWidth, 8, 'F')

  pdf.setFontSize(9)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(...grayColor)
  pdf.text('Campo', margin + 2, yPosition + 5.5)
  pdf.text('Sua Resposta', margin + 45, yPosition + 5.5)
  pdf.text('Correto', margin + 105, yPosition + 5.5)
  pdf.text('Pts', margin + 165, yPosition + 5.5)
  yPosition += 10

  // Table rows
  pdf.setFont('helvetica', 'normal')
  for (const comparison of data.scoringResult.comparisons) {
    // Check if we need a new page
    if (yPosition > pageHeight - 40) {
      pdf.addPage()
      yPosition = margin
      addWatermark(pdf, pageWidth, pageHeight)
      resetTextStyles()
    }

    const rowHeight = 8

    // Alternating row background
    if (data.scoringResult.comparisons.indexOf(comparison) % 2 === 0) {
      pdf.setFillColor(249, 250, 251) // Gray-50
      pdf.rect(margin, yPosition - 1, contentWidth, rowHeight, 'F')
    }

    // Status indicator
    const statusColor = comparison.isCorrect ? greenColor : redColor
    pdf.setFillColor(...statusColor)
    pdf.circle(margin + 3, yPosition + 3, 1.5, 'F')

    pdf.setTextColor(...textColor)
    pdf.setFontSize(8)

    // Field name
    pdf.text(truncateText(comparison.label, 20), margin + 7, yPosition + 4.5)

    // User value
    const userValueColor = comparison.isCorrect ? greenColor : redColor
    pdf.setTextColor(...userValueColor)
    pdf.text(truncateText(comparison.userValue, 30), margin + 45, yPosition + 4.5)

    // Correct value
    pdf.setTextColor(...textColor)
    pdf.text(truncateText(comparison.correctValue, 30), margin + 105, yPosition + 4.5)

    // Points
    const pointsColor = comparison.isCorrect ? greenColor : redColor
    pdf.setTextColor(...pointsColor)
    pdf.text(`${comparison.points}/${comparison.maxPoints}`, margin + 165, yPosition + 4.5)

    yPosition += rowHeight
  }

  yPosition += 10

  // === EXPLICAÇÕES SECTION ===
  // Collect all incorrect items with their explanations
  const incorrectItems = data.scoringResult.comparisons.filter(item => !item.isCorrect)

  if (incorrectItems.length > 0) {
    // Check if we need a new page
    if (yPosition > pageHeight - 60) {
      pdf.addPage()
      yPosition = margin
      addWatermark(pdf, pageWidth, pageHeight)
      resetTextStyles()
    }

    pdf.setTextColor(...textColor)
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Explicacoes', margin, yPosition)
    yPosition += 10

    for (const item of incorrectItems) {
      // Check if we need a new page
      if (yPosition > pageHeight - 40) {
        pdf.addPage()
        yPosition = margin
        addWatermark(pdf, pageWidth, pageHeight)
        resetTextStyles()
      }

      // Field name header with background
      pdf.setFillColor(243, 232, 255) // Purple-100
      pdf.roundedRect(margin, yPosition - 1, contentWidth, 8, 2, 2, 'F')
      pdf.setTextColor(...primaryColor)
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'bold')
      pdf.text(item.label, margin + 3, yPosition + 5)
      yPosition += 10

      // Your answer
      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(...redColor)
      pdf.text(`Sua resposta: ${item.userValue}`, margin + 5, yPosition)
      yPosition += 5

      // Correct answer
      pdf.setTextColor(...greenColor)
      pdf.text(`Correto: ${item.correctValue}`, margin + 5, yPosition)
      yPosition += 7

      // Get individual explanations for this field
      const explanations = getExplanationsForField(item.field, data.officialReport)

      if (explanations.length > 0) {
        pdf.setTextColor(...textColor)
        pdf.setFontSize(8)
        pdf.setFont('helvetica', 'bold')
        pdf.text('Por que:', margin + 5, yPosition)
        yPosition += 5

        // Render each explanation as a separate bullet point
        for (const exp of explanations) {
          // Check if we need a new page
          if (yPosition > pageHeight - 25) {
            pdf.addPage()
            yPosition = margin
            addWatermark(pdf, pageWidth, pageHeight)
            resetTextStyles()
          }

          // Bullet with finding/item name in bold - wrapped if needed
          pdf.setTextColor(...textColor)
          pdf.setFontSize(8)
          pdf.setFont('helvetica', 'bold')
          const bulletText = `• ${exp.name}:`
          const bulletLines = pdf.splitTextToSize(bulletText, contentWidth - 15)
          for (let i = 0; i < bulletLines.length; i++) {
            if (yPosition > pageHeight - 20) {
              pdf.addPage()
              yPosition = margin
              addWatermark(pdf, pageWidth, pageHeight)
              resetTextStyles()
              pdf.setTextColor(...textColor)
              pdf.setFontSize(8)
              pdf.setFont('helvetica', 'bold')
            }
            pdf.text(i === 0 ? `  ${bulletLines[i]}` : `    ${bulletLines[i]}`, margin + 5, yPosition)
            yPosition += 4
          }

          // Description in normal font, wrapped
          pdf.setTextColor(...grayColor)
          pdf.setFontSize(8)
          pdf.setFont('helvetica', 'normal')
          const descLines = pdf.splitTextToSize(exp.description, contentWidth - 20)
          for (const line of descLines) {
            if (yPosition > pageHeight - 20) {
              pdf.addPage()
              yPosition = margin
              addWatermark(pdf, pageWidth, pageHeight)
              resetTextStyles()
              pdf.setTextColor(...grayColor)
              pdf.setFontSize(8)
              pdf.setFont('helvetica', 'normal')
            }
            pdf.text(`    ${line}`, margin + 8, yPosition)
            yPosition += 4
          }
          yPosition += 3
        }
      }

      yPosition += 6
    }
  }

  // === COURSE PROMOTION ===
  // Check if we need a new page (need more space for image)
  if (yPosition > pageHeight - 70) {
    pdf.addPage()
    yPosition = margin
    addWatermark(pdf, pageWidth, pageHeight)
    resetTextStyles()
  }

  yPosition += 5

  // Try to load course image
  const courseImageBase64 = await loadCourseImageAsBase64()
  const promoHeight = courseImageBase64 ? 50 : 25

  pdf.setFillColor(239, 246, 255) // Blue-50
  pdf.roundedRect(margin, yPosition, contentWidth, promoHeight, 3, 3, 'F')

  if (courseImageBase64) {
    // Layout with image on left, text on right
    const imageWidth = 35
    const imageHeight = 45
    pdf.addImage(courseImageBase64, 'JPEG', margin + 3, yPosition + 2.5, imageWidth, imageHeight)

    const textStartX = margin + imageWidth + 8

    pdf.setTextColor(30, 64, 175) // Blue-800
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Aprenda mais!', textStartX, yPosition + 10)

    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'normal')
    pdf.text('O melhor curso online de ECG do Brasil:', textStartX, yPosition + 18)

    pdf.setTextColor(37, 99, 235) // Blue-600
    pdf.setFont('helvetica', 'bold')
    pdf.text('Curso de Eletrocardiograma', textStartX, yPosition + 28)
    pdf.text('com Jose Alencar - 2a Edicao', textStartX, yPosition + 34)

    pdf.setFontSize(8)
    pdf.setTextColor(30, 64, 175)
    pdf.text('Clique para saber mais', textStartX, yPosition + 44)
  } else {
    // Fallback: text only
    pdf.setTextColor(30, 64, 175) // Blue-800
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Aprenda mais!', margin + 5, yPosition + 8)

    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'normal')
    pdf.text('O melhor curso online de ECG do Brasil:', margin + 5, yPosition + 14)

    pdf.setTextColor(37, 99, 235) // Blue-600
    pdf.setFont('helvetica', 'bold')
    pdf.text('Curso de Eletrocardiograma com Jose Alencar - 2a Edicao', margin + 5, yPosition + 20)
  }

  // Add link
  pdf.link(margin, yPosition, contentWidth, promoHeight, { url: COURSE_URL })

  // === WATERMARK ===
  addWatermark(pdf, pageWidth, pageHeight)

  // === FOOTER ===
  const totalPages = pdf.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i)
    pdf.setTextColor(...grayColor)
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'normal')
    pdf.text(
      `Plantao ECG - Simulador de Plantao de Tele-ECG | Pagina ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    )
  }

  return pdf.output('blob')
}

/**
 * Add watermark to the current page
 */
function addWatermark(pdf: jsPDF, pageWidth: number, pageHeight: number): void {
  pdf.setTextColor(200, 200, 200)
  pdf.setFontSize(40)
  pdf.setFont('helvetica', 'bold')

  // Save current state
  const currentPage = pdf.getCurrentPageInfo().pageNumber

  // Add diagonal watermark
  pdf.text('Plantao ECG', pageWidth / 2, pageHeight / 2, {
    align: 'center',
    angle: 45,
  })
}

/**
 * Format date for display
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Truncate text to fit in table cells
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + '...'
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
    afib: 'Fibrilacao Atrial',
    aflutter: 'Flutter Atrial',
    svt: 'Taquicardia Supraventricular',
    mat: 'Taquicardia Atrial Multifocal',
    vtach: 'Taquicardia Ventricular',
    polymorphic_vtach: 'TV Polimorfica',
    torsades: 'Torsades de Pointes',
    vfib: 'Fibrilacao Ventricular',
    junctional: 'Ritmo Juncional',
    ventricular_escape: 'Escape Ventricular',
    riva: 'RIVA',
    paced: 'Ritmo de Marcapasso',
    asystole: 'Assistolia',
    isorhythmic_dissociation: 'Dissociacao Isorritmicia',
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
 * Format regularity key to readable name
 */
function formatRegularityName(key: string): string {
  const regularityNames: Record<string, string> = {
    regular: 'Regular',
    irregular: 'Irregular'
  }
  return regularityNames[key] || key
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
    swap_la_ra: 'Troca LA-RA',
    swap_la_ll: 'Troca LA-LL',
    swap_ra_ll: 'Troca RA-LL',
    swap_rl_involved: 'Envolvendo RL',
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

    case 'regularity':
      const regExp = REGULARITY_EXPLANATIONS[officialReport.regularity]
      if (regExp) {
        explanations.push({
          name: formatRegularityName(officialReport.regularity),
          description: regExp.description
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
