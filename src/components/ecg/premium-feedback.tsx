'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'
import { Crown, X, Check, FileDown, BookOpen, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import type { ScoringResult } from '@/lib/scoring'
import type { OfficialReport } from '@/types/database'
import {
  RHYTHM_EXPLANATIONS,
  FINDING_EXPLANATIONS,
  AXIS_EXPLANATIONS,
  INTERVAL_EXPLANATIONS,
  REGULARITY_EXPLANATIONS,
  ELECTRODE_SWAP_EXPLANATIONS
} from '@/lib/ecg-explanations'
import { formatCompoundFinding } from '@/lib/ecg-constants'
import { generateFeedbackPDF, downloadPDF } from '@/lib/pdf-generator'

interface PremiumFeedbackProps {
  result: ScoringResult
  officialReport: OfficialReport
  ecgImageUrl: string
  isPremium: boolean
}

const COURSE_URL = 'https://www.manole.com.br/curso-de-eletrocardiograma-com-jose-alencar-2-edicao/p'

export function PremiumFeedback({ result, officialReport, ecgImageUrl, isPremium }: PremiumFeedbackProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  if (!isPremium) return null

  const incorrectItems = result.comparisons.filter(c => !c.isCorrect)

  const toggleExpanded = (field: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(field)) {
        newSet.delete(field)
      } else {
        newSet.add(field)
      }
      return newSet
    })
  }

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true)
    try {
      const blob = await generateFeedbackPDF({
        ecgImageUrl,
        scoringResult: result,
        officialReport,
        date: new Date()
      })
      downloadPDF(blob, `feedback-ecg-${Date.now()}.pdf`)
    } catch (error) {
      console.error('Failed to generate PDF:', error)
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  // If all correct, show congratulations
  if (incorrectItems.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="py-6 text-center">
          <Check className="h-12 w-12 text-green-600 mx-auto mb-2" />
          <p className="text-green-700 font-medium text-lg">Excelente! Voce acertou tudo!</p>
          <p className="text-green-600 text-sm mt-1">Continue assim para dominar a interpretacao de ECG.</p>

          {/* Course promotion even on success */}
          <div className="mt-6 bg-white/50 border border-green-200 rounded-lg p-4 text-left">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800">Aprofunde seu conhecimento!</span>
            </div>
            <p className="text-sm text-green-700 mb-2">
              O melhor curso online de ECG do Brasil:
            </p>
            <a
              href={COURSE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-800 underline text-sm font-medium"
            >
              Curso de Eletrocardiograma com Jose Alencar - 2a Edicao
            </a>
          </div>

          {/* PDF Download */}
          <Button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            variant="outline"
            className="mt-4 border-green-300 text-green-700 hover:bg-green-100"
          >
            {isGeneratingPDF ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4 mr-2" />
            )}
            Baixar Relatorio PDF
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-purple-200 bg-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-800">
          <Crown className="h-5 w-5 text-purple-600" />
          Feedback Detalhado Premium
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Incorrect items with explanations */}
        {incorrectItems.map(item => (
          <FeedbackItem
            key={item.field}
            comparison={item}
            officialReport={officialReport}
            isExpanded={expandedItems.has(item.field)}
            onToggle={() => toggleExpanded(item.field)}
          />
        ))}

        {/* Course promotion */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-800">Aprenda mais!</span>
          </div>
          <p className="text-sm text-blue-700 mb-2">
            O melhor curso online de ECG do Brasil:
          </p>
          <a
            href={COURSE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline text-sm font-medium"
          >
            Curso de Eletrocardiograma com Jose Alencar - 2a Edicao
          </a>
        </div>

        {/* PDF Download */}
        <Button
          onClick={handleDownloadPDF}
          disabled={isGeneratingPDF}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {isGeneratingPDF ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <FileDown className="h-4 w-4 mr-2" />
          )}
          Baixar Relatorio PDF
        </Button>
      </CardContent>
    </Card>
  )
}

interface FeedbackItemProps {
  comparison: ScoringResult['comparisons'][0]
  officialReport: OfficialReport
  isExpanded: boolean
  onToggle: () => void
}

function FeedbackItem({ comparison, officialReport, isExpanded, onToggle }: FeedbackItemProps) {
  const explanation = getExplanationForComparison(comparison.field, officialReport)

  return (
    <div className="bg-white rounded-lg border border-purple-200 overflow-hidden">
      {/* Header - always visible */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-purple-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-1 bg-red-100 rounded-full">
            <X className="h-4 w-4 text-red-600" />
          </div>
          <div>
            <span className="font-semibold text-gray-900">{comparison.label}</span>
            <span className="ml-2 text-sm text-red-600">
              ({comparison.points}/{comparison.maxPoints} pts)
            </span>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-purple-100">
          {/* What user said vs correct */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <div className="bg-red-50 p-3 rounded-lg">
              <span className="text-xs font-medium text-red-700 uppercase tracking-wide">Sua resposta</span>
              <p className="mt-1 text-sm text-red-900 font-medium">{comparison.userValue}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <span className="text-xs font-medium text-green-700 uppercase tracking-wide">Resposta correta</span>
              <p className="mt-1 text-sm text-green-900 font-medium">{comparison.correctValue}</p>
            </div>
          </div>

          {/* Explanation */}
          {explanation && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <span className="text-xs font-medium text-blue-700 uppercase tracking-wide">Por que?</span>
              <p className="mt-1 text-sm text-blue-900">{explanation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Get explanation for a specific comparison field
 */
function getExplanationForComparison(field: string, officialReport: OfficialReport): string | null {
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
          .slice(0, 3) // Limit to first 3 to avoid too long text
          .map(f => {
            // Try to get base finding explanation for compound findings
            const baseKey = f.includes('_') && !FINDING_EXPLANATIONS[f]
              ? f.split('_').slice(0, -1).join('_')
              : f
            const explanation = FINDING_EXPLANATIONS[f] || FINDING_EXPLANATIONS[baseKey]
            if (explanation) {
              return `${formatCompoundFinding(f)}: ${explanation.description}`
            }
            return null
          })
          .filter(Boolean)
          .join(' ')
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
          .join(' ')
        return explanations || null
      }
      return null

    default:
      return null
  }
}
