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
              {isPassings ? 'Good job!' : 'Keep practicing!'}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {result.totalPoints} / {result.maxPoints} points
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Field-by-field comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Comparison</CardTitle>
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
                        <span className="text-gray-500 w-20">Your answer:</span>
                        <span className={comparison.isCorrect ? 'text-green-700' : 'text-gray-900'}>
                          {comparison.userValue}
                        </span>
                      </div>
                      {!comparison.isCorrect && (
                        <div className="flex gap-2 text-sm">
                          <span className="text-gray-500 w-20">Correct:</span>
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
                        Partial credit
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
            <CardTitle>Official Report Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Scoring Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Scoring Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Rhythm</span>
              <span className="font-medium ml-2">25 pts</span>
            </div>
            <div>
              <span className="text-gray-500">Findings</span>
              <span className="font-medium ml-2">35 pts</span>
            </div>
            <div>
              <span className="text-gray-500">Heart Rate</span>
              <span className="font-medium ml-2">10 pts</span>
            </div>
            <div>
              <span className="text-gray-500">Axis</span>
              <span className="font-medium ml-2">10 pts</span>
            </div>
            <div>
              <span className="text-gray-500">Intervals</span>
              <span className="font-medium ml-2">15 pts</span>
            </div>
            <div>
              <span className="text-gray-500">Regularity</span>
              <span className="font-medium ml-2">5 pts</span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-500">Passing Score</span>
              <span className="font-medium ml-2">80%+</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
