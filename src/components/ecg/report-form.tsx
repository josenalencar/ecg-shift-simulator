'use client'

import { useState } from 'react'
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import {
  RHYTHMS,
  REGULARITIES,
  AXES,
  PR_INTERVALS,
  QRS_DURATIONS,
  QT_INTERVALS,
  FINDINGS_BY_CATEGORY,
} from '@/lib/ecg-constants'
import type { Rhythm, Finding, Axis, Interval, Regularity } from '@/types/database'

export interface ReportFormData {
  rhythm: Rhythm[]
  regularity: Regularity
  heart_rate: number
  axis: Axis
  pr_interval: Interval
  qrs_duration: Interval
  qt_interval: Interval
  findings: Finding[]
  notes: string
}

interface ReportFormProps {
  initialData?: Partial<ReportFormData>
  onSubmit: (data: ReportFormData) => void
  isSubmitting?: boolean
  submitLabel?: string
}

const defaultData: ReportFormData = {
  rhythm: ['sinus'],
  regularity: 'regular',
  heart_rate: 75,
  axis: 'normal',
  pr_interval: 'normal',
  qrs_duration: 'normal',
  qt_interval: 'normal',
  findings: [],
  notes: '',
}

export function ReportForm({
  initialData,
  onSubmit,
  isSubmitting,
  submitLabel = 'Submit Report',
}: ReportFormProps) {
  const [formData, setFormData] = useState<ReportFormData>({
    ...defaultData,
    ...initialData,
  })

  function handleRhythmChange(rhythm: Rhythm) {
    setFormData((prev) => {
      const newRhythms = prev.rhythm.includes(rhythm)
        ? prev.rhythm.filter((r) => r !== rhythm)
        : [...prev.rhythm, rhythm]
      return { ...prev, rhythm: newRhythms.length > 0 ? newRhythms : ['sinus'] }
    })
  }

  function handleFindingChange(finding: Finding) {
    setFormData((prev) => {
      const newFindings = prev.findings.includes(finding)
        ? prev.findings.filter((f) => f !== finding)
        : [...prev.findings, finding]
      return { ...prev, findings: newFindings }
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Rhythm Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Rhythm</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Rhythm (select all that apply)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {RHYTHMS.map((rhythm) => (
                <label
                  key={rhythm.value}
                  className={`
                    flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors
                    ${formData.rhythm.includes(rhythm.value)
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    checked={formData.rhythm.includes(rhythm.value)}
                    onChange={() => handleRhythmChange(rhythm.value)}
                    className="sr-only"
                  />
                  <span className="text-sm">{rhythm.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Regularity
            </label>
            <div className="flex gap-4">
              {REGULARITIES.map((reg) => (
                <label
                  key={reg.value}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors
                    ${formData.regularity === reg.value
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="regularity"
                    value={reg.value}
                    checked={formData.regularity === reg.value}
                    onChange={(e) => setFormData((prev) => ({ ...prev, regularity: e.target.value as Regularity }))}
                    className="sr-only"
                  />
                  <span className="text-sm">{reg.label}</span>
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rate and Measurements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Rate & Measurements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Heart Rate (bpm)
              </label>
              <Input
                type="number"
                min="0"
                max="300"
                value={formData.heart_rate}
                onChange={(e) => setFormData((prev) => ({ ...prev, heart_rate: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Axis
              </label>
              <div className="flex flex-wrap gap-2">
                {AXES.map((axis) => (
                  <label
                    key={axis.value}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-sm
                      ${formData.axis === axis.value
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="axis"
                      value={axis.value}
                      checked={formData.axis === axis.value}
                      onChange={(e) => setFormData((prev) => ({ ...prev, axis: e.target.value as Axis }))}
                      className="sr-only"
                    />
                    {axis.label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PR Interval
              </label>
              <div className="flex flex-col gap-2">
                {PR_INTERVALS.map((interval) => (
                  <label
                    key={interval.value}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-sm
                      ${formData.pr_interval === interval.value
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="pr_interval"
                      value={interval.value}
                      checked={formData.pr_interval === interval.value}
                      onChange={(e) => setFormData((prev) => ({ ...prev, pr_interval: e.target.value as Interval }))}
                      className="sr-only"
                    />
                    {interval.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                QRS Duration
              </label>
              <div className="flex flex-col gap-2">
                {QRS_DURATIONS.map((duration) => (
                  <label
                    key={duration.value}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-sm
                      ${formData.qrs_duration === duration.value
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="qrs_duration"
                      value={duration.value}
                      checked={formData.qrs_duration === duration.value}
                      onChange={(e) => setFormData((prev) => ({ ...prev, qrs_duration: e.target.value as Interval }))}
                      className="sr-only"
                    />
                    {duration.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                QT Interval
              </label>
              <div className="flex flex-col gap-2">
                {QT_INTERVALS.map((interval) => (
                  <label
                    key={interval.value}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-sm
                      ${formData.qt_interval === interval.value
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="qt_interval"
                      value={interval.value}
                      checked={formData.qt_interval === interval.value}
                      onChange={(e) => setFormData((prev) => ({ ...prev, qt_interval: e.target.value as Interval }))}
                      className="sr-only"
                    />
                    {interval.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Findings Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Findings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(FINDINGS_BY_CATEGORY).map(([category, findings]) => (
            <div key={category}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {category}
              </label>
              <div className="flex flex-wrap gap-2">
                {findings.map((finding) => (
                  <label
                    key={finding.value}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-sm
                      ${formData.findings.includes(finding.value)
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={formData.findings.includes(finding.value)}
                      onChange={() => handleFindingChange(finding.value)}
                      className="sr-only"
                    />
                    {finding.label}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Notes Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notes (Optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
            placeholder="Additional notes or explanation..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
          />
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end">
        <Button type="submit" size="lg" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
