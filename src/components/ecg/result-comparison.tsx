'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Check, X, AlertCircle } from 'lucide-react'
import type { ScoringResult } from '@/lib/scoring'

interface ResultComparisonProps {
  result: ScoringResult
  notes?: string | null
}

export function ResultComparison({ result, notes }: ResultComparisonProps) {
  const { score, comparisons, isPassings } = result

  return (
    <div className="space-y-6">
      {/* Score Summary */}
      <Card className={isPassings ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
        <CardContent className="py-6">
          <div className="text-center">
            <div className={`text-5xl font-bold ${isPassings ? 'text-green-600' : 'text-red-600'}`}>
              {score}%
            </div>
            <p className={`text-lg mt-2 ${isPassings ? 'text-green-700' : 'text-red-700'}`}>
              {isPassings ? 'Muito bem!' : 'Continue praticando!'}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {result.totalPoints} / {result.maxPoints} pontos
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Field-by-field comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Comparação Detalhada</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {comparisons.map((comparison) => (
              <div key={comparison.field} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {comparison.isCorrect ? (
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                      ) : comparison.partialCredit && comparison.partialCredit > 0 ? (
                        <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                      ) : (
                        <X className="h-5 w-5 text-red-600 flex-shrink-0" />
                      )}
                      <span className="font-medium text-gray-900">{comparison.label}</span>
                    </div>

                    <div className="mt-2 ml-7 space-y-1">
                      <div className="flex gap-2 text-sm">
                        <span className="text-gray-500 w-24">Sua resposta:</span>
                        <span className={comparison.isCorrect ? 'text-green-700' : 'text-gray-900'}>
                          {comparison.userValue}
                        </span>
                      </div>
                      {!comparison.isCorrect && (
                        <div className="flex gap-2 text-sm">
                          <span className="text-gray-500 w-24">Correto:</span>
                          <span className="text-blue-700 font-medium">
                            {comparison.correctValue}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className={`
                      text-sm font-medium
                      ${comparison.isCorrect
                        ? 'text-green-600'
                        : comparison.partialCredit && comparison.partialCredit > 0
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }
                    `}>
                      {comparison.points} / {comparison.maxPoints}
                    </span>
                    {comparison.partialCredit !== undefined && !comparison.isCorrect && (
                      <p className="text-xs text-gray-500">
                        Crédito parcial
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Official Notes */}
      {notes && (
        <Card>
          <CardHeader>
            <CardTitle>Observações do Laudo Oficial</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Scoring Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Distribuição de Pontos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Ritmo</span>
              <span className="font-semibold text-gray-900 ml-2">12-35 pts</span>
            </div>
            <div>
              <span className="text-gray-600">Achados</span>
              <span className="font-semibold text-gray-900 ml-2">48-74 pts</span>
            </div>
            <div>
              <span className="text-gray-600">Frequência</span>
              <span className="font-semibold text-gray-900 ml-2">5-8 pts</span>
            </div>
            <div>
              <span className="text-gray-600">Eixo</span>
              <span className="font-semibold text-gray-900 ml-2">5 pts</span>
            </div>
            <div>
              <span className="text-gray-600">Troca de Eletrodos</span>
              <span className="font-semibold text-gray-900 ml-2">3-5 pts</span>
            </div>
            <div>
              <span className="text-gray-600">Aprovação</span>
              <span className="font-semibold text-gray-900 ml-2">80%+</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            * Pontuação varia conforme a categoria do ECG
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
