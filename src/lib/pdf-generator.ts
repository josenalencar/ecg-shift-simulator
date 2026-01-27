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
}

// Course promotion URL
const COURSE_URL = 'https://www.manole.com.br/curso-de-eletrocardiograma-com-jose-alencar-2-edicao/p'

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

  // === HEADER ===
  pdf.setFillColor(...primaryColor)
  pdf.rect(0, 0, pageWidth, 25, 'F')

  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(20)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Plantao ECG', margin, 16)

  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  pdf.text('Relatorio de Feedback Premium', pageWidth - margin, 12, { align: 'right' })
  pdf.text(formatDate(data.date), pageWidth - margin, 18, { align: 'right' })

  yPosition = 35

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

  // === EXPLANATIONS FOR WRONG ANSWERS ===
  const incorrectItems = data.scoringResult.comparisons.filter(c => !c.isCorrect)

  if (incorrectItems.length > 0) {
    // Check if we need a new page
    if (yPosition > pageHeight - 60) {
      pdf.addPage()
      yPosition = margin
      addWatermark(pdf, pageWidth, pageHeight)
    }

    pdf.setTextColor(...textColor)
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Explicacoes', margin, yPosition)
    yPosition += 10

    for (const item of incorrectItems) {
      // Check if we need a new page
      if (yPosition > pageHeight - 50) {
        pdf.addPage()
        yPosition = margin
        addWatermark(pdf, pageWidth, pageHeight)
      }

      // Field header
      pdf.setFillColor(...primaryColor)
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'bold')
      pdf.roundedRect(margin, yPosition, contentWidth, 7, 2, 2, 'F')
      pdf.text(item.label, margin + 3, yPosition + 5)
      yPosition += 10

      // What was wrong vs correct
      pdf.setTextColor(...redColor)
      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Sua resposta: ', margin, yPosition)
      pdf.setFont('helvetica', 'normal')
      pdf.text(item.userValue, margin + 25, yPosition)
      yPosition += 5

      pdf.setTextColor(...greenColor)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Correto: ', margin, yPosition)
      pdf.setFont('helvetica', 'normal')
      pdf.text(item.correctValue, margin + 25, yPosition)
      yPosition += 7

      // Get explanation for this field
      const explanation = getExplanationForField(item.field, data.officialReport)
      if (explanation) {
        pdf.setTextColor(...textColor)
        pdf.setFontSize(8)
        pdf.setFont('helvetica', 'italic')

        // Wrap text for explanation
        const lines = pdf.splitTextToSize(explanation, contentWidth - 5)
        for (const line of lines) {
          if (yPosition > pageHeight - 30) {
            pdf.addPage()
            yPosition = margin
            addWatermark(pdf, pageWidth, pageHeight)
          }
          pdf.text(line, margin + 2, yPosition)
          yPosition += 4
        }
      }

      yPosition += 5
    }
  }

  // === COURSE PROMOTION ===
  // Check if we need a new page
  if (yPosition > pageHeight - 45) {
    pdf.addPage()
    yPosition = margin
    addWatermark(pdf, pageWidth, pageHeight)
  }

  yPosition += 5
  pdf.setFillColor(239, 246, 255) // Blue-50
  pdf.roundedRect(margin, yPosition, contentWidth, 25, 3, 3, 'F')

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

  // Add link
  pdf.link(margin, yPosition, contentWidth, 25, { url: COURSE_URL })

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
 * Get explanation for a specific field based on the official report
 */
function getExplanationForField(field: string, officialReport: OfficialReport): string | null {
  switch (field) {
    case 'rhythm':
      if (officialReport.rhythm.length > 0) {
        const rhythmKey = officialReport.rhythm[0]
        return RHYTHM_EXPLANATIONS[rhythmKey]?.description || null
      }
      return null

    case 'findings':
      if (officialReport.findings.length > 0) {
        const explanations = officialReport.findings
          .map(f => {
            // Try to get base finding explanation
            const baseKey = f.split('_')[0] === 'pathological' ? 'pathological_q' :
                           f.split('_')[0] === 'oca' ? 'oca' :
                           f.split('_')[0] === 'ste' ? 'ste' :
                           f.split('_')[0] === 'fragmented' ? 'fragmented_qrs' : f
            const explanation = FINDING_EXPLANATIONS[f] || FINDING_EXPLANATIONS[baseKey]
            if (explanation) {
              return `${formatCompoundFinding(f)}: ${explanation.description}`
            }
            return null
          })
          .filter(Boolean)
          .join(' | ')
        return explanations || null
      }
      return null

    case 'axis':
      return AXIS_EXPLANATIONS[officialReport.axis]?.description || null

    case 'regularity':
      return REGULARITY_EXPLANATIONS[officialReport.regularity]?.description || null

    case 'pr_interval':
      return INTERVAL_EXPLANATIONS.pr[officialReport.pr_interval]?.description || null

    case 'qrs_duration':
      return INTERVAL_EXPLANATIONS.qrs[officialReport.qrs_duration]?.description || null

    case 'qt_interval':
      return INTERVAL_EXPLANATIONS.qt[officialReport.qt_interval]?.description || null

    case 'electrode_swap':
      if (officialReport.electrode_swap && officialReport.electrode_swap.length > 0) {
        const explanations = officialReport.electrode_swap
          .map(s => ELECTRODE_SWAP_EXPLANATIONS[s]?.description)
          .filter(Boolean)
          .join(' | ')
        return explanations || null
      }
      return null

    default:
      return null
  }
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
