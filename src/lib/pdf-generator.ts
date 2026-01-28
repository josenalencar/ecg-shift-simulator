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
 * Sanitize text for PDF rendering - replace special Unicode chars jsPDF can't handle
 */
function sanitizeForPDF(text: string): string {
  return text
    .replace(/≥/g, '>=')
    .replace(/≤/g, '<=')
    .replace(/"/g, '"')
    .replace(/"/g, '"')
    .replace(/'/g, "'")
    .replace(/'/g, "'")
    .replace(/—/g, '-')
    .replace(/–/g, '-')
    .replace(/…/g, '...')
    .replace(/•/g, '-')
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

  // ============ SCORE SECTION - CENTERED VERTICAL LAYOUT ============
  const score = data.scoringResult.score
  const isPassings = data.scoringResult.isPassings
  const scoreBgColor = isPassings ? colors.accent.success : colors.accent.error
  const scoreColor = isPassings ? colors.success : colors.error
  const scoreLabel = isPassings ? 'APROVADO' : 'CONTINUE PRATICANDO'

  // Performance phrases by tier
  const getPerformanceText = (s: number): string => {
    if (s === 100) return 'Interpretação impecável!'
    if (s >= 90) return 'Excelente! Quase perfeito.'
    if (s >= 80) return 'Muito bem! Você está afiado.'
    if (s >= 70) return 'Bom trabalho! Continue praticando.'
    if (s >= 60) return 'Progresso! Revise os pontos errados.'
    if (s >= 50) return 'Atenção! Foque nos fundamentos.'
    return 'Hora de estudar! Reveja os conceitos.'
  }

  pdf.setFillColor(...scoreBgColor)
  pdf.roundedRect(margin, yPosition, contentWidth, 55, 4, 4, 'F')

  const centerX = pageWidth / 2

  // Score percentage - CENTERED
  pdf.setTextColor(...scoreColor)
  pdf.setFontSize(48)
  pdf.setFont('helvetica', 'bold')
  pdf.text(`${score}%`, centerX, yPosition + 20, { align: 'center' })

  // Status label - CENTERED below percentage
  pdf.setFontSize(14)
  pdf.setFont('helvetica', 'bold')
  pdf.text(scoreLabel, centerX, yPosition + 30, { align: 'center' })

  // Points breakdown - CENTERED
  pdf.setFontSize(11)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(...colors.text.secondary)
  pdf.text(`${data.scoringResult.totalPoints} de ${data.scoringResult.maxPoints} pontos`, centerX, yPosition + 40, { align: 'center' })

  // Performance text - CENTERED
  pdf.setFontSize(10)
  pdf.setTextColor(...colors.text.light)
  pdf.text(getPerformanceText(score), centerX, yPosition + 48, { align: 'center' })

  yPosition += 62

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

  // Table rows with dynamic height for long content
  pdf.setFont('helvetica', 'normal')
  for (let idx = 0; idx < data.scoringResult.comparisons.length; idx++) {
    const comparison = data.scoringResult.comparisons[idx]

    // Calculate how many lines each column needs
    const colWidths = { user: 55, expected: 50 }

    pdf.setFontSize(9)
    const userLines = pdf.splitTextToSize(comparison.userValue, colWidths.user)
    const expectedLines = pdf.splitTextToSize(comparison.correctValue, colWidths.expected)
    const maxLines = Math.max(userLines.length, expectedLines.length, 1)

    const lineHeight = 4
    const rowPadding = 3
    const rowHeight = Math.max(10, maxLines * lineHeight + rowPadding * 2)

    // Check for page break (with dynamic row height)
    if (yPosition > pageHeight - 30 - rowHeight) {
      pdf.addPage()
      yPosition = margin
    }

    const isEven = idx % 2 === 0

    // Alternating background
    if (isEven) {
      pdf.setFillColor(...colors.bg.light)
      pdf.rect(margin, yPosition - 1, contentWidth, rowHeight, 'F')
    }

    // Status indicator
    const statusColor = comparison.isCorrect ? colors.success : colors.error
    pdf.setFillColor(...statusColor)
    pdf.circle(margin + 3, yPosition + rowHeight / 2, 2, 'F')

    // Label (single line, truncate is OK since labels are short)
    pdf.setTextColor(...colors.text.primary)
    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'normal')
    pdf.text(truncateText(comparison.label, 18), margin + 8, yPosition + rowHeight / 2 + 1)

    // User value - multi-line
    const userValueColor = comparison.isCorrect ? colors.success : colors.error
    pdf.setTextColor(...userValueColor)
    pdf.setFont('helvetica', 'bold')
    let userY = yPosition + rowPadding + 2
    for (const line of userLines) {
      pdf.text(line, margin + 52, userY)
      userY += lineHeight
    }

    // Expected value - multi-line
    pdf.setTextColor(...colors.text.primary)
    pdf.setFont('helvetica', 'normal')
    let expectedY = yPosition + rowPadding + 2
    for (const line of expectedLines) {
      pdf.text(line, margin + 115, expectedY)
      expectedY += lineHeight
    }

    // Points
    pdf.setTextColor(...statusColor)
    pdf.setFont('helvetica', 'bold')
    pdf.text(`${comparison.points}/${comparison.maxPoints}`, margin + 170, yPosition + rowHeight / 2 + 1)

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

      // Responses - with text wrapping for long content
      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'normal')

      // "Sua resposta:" with wrapping
      pdf.setTextColor(...colors.error)
      const userResponseText = `Sua resposta: ${item.userValue}`
      const userResponseLines = pdf.splitTextToSize(userResponseText, contentWidth - 10)
      for (const line of userResponseLines) {
        if (yPosition > pageHeight - 20) {
          pdf.addPage()
          yPosition = margin
        }
        pdf.text(line, margin + 5, yPosition)
        yPosition += 4
      }
      yPosition += 2

      // "Esperado:" with wrapping
      pdf.setTextColor(...colors.success)
      const expectedText = `Esperado: ${item.correctValue}`
      const expectedLines = pdf.splitTextToSize(expectedText, contentWidth - 10)
      for (const line of expectedLines) {
        if (yPosition > pageHeight - 20) {
          pdf.addPage()
          yPosition = margin
        }
        pdf.text(line, margin + 5, yPosition)
        yPosition += 4
      }
      yPosition += 5

      // For findings field, show explanations for BOTH user's false positives AND expected findings
      if (item.field === 'findings' && item.rawUserFindings && item.rawExpectedFindings) {
        const userFindings = item.rawUserFindings
        const expectedFindings = item.rawExpectedFindings
        const falsePositives = userFindings.filter(f => !expectedFindings.includes(f))

        // Section 1: Explain why false positives are WRONG
        if (falsePositives.length > 0) {
          if (yPosition > pageHeight - 40) {
            pdf.addPage()
            yPosition = margin
          }

          pdf.setTextColor(...colors.error)
          pdf.setFontSize(9)
          pdf.setFont('helvetica', 'bold')
          pdf.text('Por que estes achados estão errados:', margin + 5, yPosition)
          yPosition += 6

          for (const fp of falsePositives) {
            const fpExplanations = getExplanationsForFinding(fp)
            for (const exp of fpExplanations) {
              if (yPosition > pageHeight - 30) {
                pdf.addPage()
                yPosition = margin
              }

              pdf.setFillColor(...colors.accent.error)
              pdf.roundedRect(margin + 3, yPosition - 1.5, contentWidth - 8, 5, 1.5, 1.5, 'F')

              pdf.setTextColor(...colors.error)
              pdf.setFontSize(9)
              pdf.setFont('helvetica', 'bold')
              pdf.text(`• ${exp.name}`, margin + 6, yPosition + 1.5)
              yPosition += 6

              pdf.setTextColor(...colors.text.secondary)
              pdf.setFontSize(8)
              pdf.setFont('helvetica', 'normal')
              const sanitizedDesc = sanitizeForPDF(exp.description)
              const descLines = pdf.splitTextToSize(sanitizedDesc, contentWidth - 16)
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
          yPosition += 4
        }

        // Section 2: Explain expected findings (conceitos-chave)
        if (expectedFindings.length > 0) {
          if (yPosition > pageHeight - 40) {
            pdf.addPage()
            yPosition = margin
          }

          pdf.setTextColor(...colors.success)
          pdf.setFontSize(9)
          pdf.setFont('helvetica', 'bold')
          pdf.text('Achados corretos (conceitos-chave):', margin + 5, yPosition)
          yPosition += 6

          for (const ef of expectedFindings) {
            const efExplanations = getExplanationsForFinding(ef)
            for (const exp of efExplanations) {
              if (yPosition > pageHeight - 30) {
                pdf.addPage()
                yPosition = margin
              }

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
              const sanitizedDesc = sanitizeForPDF(exp.description)
              const descLines = pdf.splitTextToSize(sanitizedDesc, contentWidth - 16)
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
        }
      } else {
        // Non-findings fields: use existing logic
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
            const sanitizedDesc = sanitizeForPDF(exp.description)
            const descLines = pdf.splitTextToSize(sanitizedDesc, contentWidth - 16)
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
 * Get explanations for a single finding
 * Used for showing explanations for both user's false positives and expected findings
 */
function getExplanationsForFinding(finding: string): ExplanationItem[] {
  const explanations: ExplanationItem[] = []

  // Try to get base finding explanation
  const baseKey = finding.split('_')[0] === 'pathological' ? 'pathological_q' :
                 finding.split('_')[0] === 'oca' ? 'oca' :
                 finding.split('_')[0] === 'ste' ? 'ste' :
                 finding.split('_')[0] === 'fragmented' ? 'fragmented_qrs' : finding

  const explanation = FINDING_EXPLANATIONS[finding] || FINDING_EXPLANATIONS[baseKey]
  if (explanation) {
    explanations.push({
      name: formatCompoundFinding(finding),
      description: explanation.description
    })
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
