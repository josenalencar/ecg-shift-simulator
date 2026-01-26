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
  WALL_OPTIONS,
  OCA_SIGNS,
  PACEMAKER_OPTIONS,
  CHAMBER_OPTIONS,
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

// OCA wall findings (including new walls)
const OCA_WALL_FINDINGS: Finding[] = [
  'oca_wall_anterior', 'oca_wall_inferior', 'oca_wall_lateral', 'oca_wall_septal',
  'oca_wall_anteroapical', 'oca_wall_anteromedial', 'oca_wall_inferolateral', 'oca_wall_extensive_anterior'
]

// OCA ischemic signs
const OCA_SIGN_FINDINGS: Finding[] = ['ste', 'hyperacute_t', 'std_v1v4', 'aslanger', 'de_winter', 'subtle_ste', 'terminal_qrs_distortion', 'sgarbossa_modified']

// Pathological Q wall findings (including new walls)
const PATHOLOGICAL_Q_WALL_FINDINGS: Finding[] = [
  'pathological_q_anterior', 'pathological_q_inferior', 'pathological_q_lateral', 'pathological_q_septal',
  'pathological_q_anteroapical', 'pathological_q_anteromedial', 'pathological_q_inferolateral', 'pathological_q_extensive_anterior'
]

// Pacemaker related findings
const PACEMAKER_FINDINGS: Finding[] = ['pacemaker_normal', 'pacemaker_sense_failure', 'pacemaker_pace_failure']
const PACEMAKER_CHAMBER_FINDINGS: Finding[] = [
  'pacemaker_sense_failure_atrio', 'pacemaker_sense_failure_ventriculo',
  'pacemaker_pace_failure_atrio', 'pacemaker_pace_failure_ventriculo'
]

// Categories to exclude from regular display (handled specially)
const SPECIAL_CATEGORIES = ['Infarto Oclusivo', 'Sinais de Infarto Oclusivo', 'Sinais de Fibrose']

export function ReportForm({
  initialData,
  onSubmit,
  isSubmitting,
  submitLabel = 'Enviar Laudo',
}: ReportFormProps) {
  const [formData, setFormData] = useState<ReportFormData>({
    ...defaultData,
    ...initialData,
  })

  // Check if pacemaker rhythm is selected
  const isPacemakerRhythm = formData.rhythm.includes('paced')

  // Check if OCA is selected
  const hasOcaSelected = formData.findings.includes('oca')

  // Check if Pathological Q is selected
  const hasPathologicalQSelected = formData.findings.includes('pathological_q')

  // Check if pacemaker failures are selected
  const hasSenseFailure = formData.findings.includes('pacemaker_sense_failure')
  const hasPaceFailure = formData.findings.includes('pacemaker_pace_failure')

  function handleRhythmChange(rhythm: Rhythm) {
    setFormData((prev) => {
      // Toggle rhythm selection (multi-select)
      const newRhythms = prev.rhythm.includes(rhythm)
        ? prev.rhythm.filter((r) => r !== rhythm)
        : [...prev.rhythm, rhythm]

      // Ensure at least one rhythm is selected
      if (newRhythms.length === 0) {
        return prev
      }

      const newData = { ...prev, rhythm: newRhythms }

      // If pacemaker is no longer selected, remove pacemaker findings
      if (!newRhythms.includes('paced')) {
        newData.findings = prev.findings.filter(f =>
          !PACEMAKER_FINDINGS.includes(f) && !PACEMAKER_CHAMBER_FINDINGS.includes(f)
        )
      }

      return newData
    })
  }

  function handleFindingChange(finding: Finding) {
    setFormData((prev) => {
      const newFindings = prev.findings.includes(finding)
        ? prev.findings.filter((f) => f !== finding)
        : [...prev.findings, finding]

      // If removing OCA, also remove all OCA-related findings
      if (finding === 'oca' && !newFindings.includes('oca')) {
        return {
          ...prev,
          findings: newFindings.filter(f =>
            !OCA_WALL_FINDINGS.includes(f) && !OCA_SIGN_FINDINGS.includes(f)
          )
        }
      }

      // If removing pathological_q, also remove all pathological_q wall findings
      if (finding === 'pathological_q' && !newFindings.includes('pathological_q')) {
        return {
          ...prev,
          findings: newFindings.filter(f => !PATHOLOGICAL_Q_WALL_FINDINGS.includes(f))
        }
      }

      // If removing pacemaker_sense_failure, remove its chamber findings
      if (finding === 'pacemaker_sense_failure' && !newFindings.includes('pacemaker_sense_failure')) {
        return {
          ...prev,
          findings: newFindings.filter(f =>
            f !== 'pacemaker_sense_failure_atrio' && f !== 'pacemaker_sense_failure_ventriculo'
          )
        }
      }

      // If removing pacemaker_pace_failure, remove its chamber findings
      if (finding === 'pacemaker_pace_failure' && !newFindings.includes('pacemaker_pace_failure')) {
        return {
          ...prev,
          findings: newFindings.filter(f =>
            f !== 'pacemaker_pace_failure_atrio' && f !== 'pacemaker_pace_failure_ventriculo'
          )
        }
      }

      // If selecting pacemaker_normal, deselect failures
      if (finding === 'pacemaker_normal' && newFindings.includes('pacemaker_normal')) {
        return {
          ...prev,
          findings: newFindings.filter(f =>
            !['pacemaker_sense_failure', 'pacemaker_pace_failure',
              'pacemaker_sense_failure_atrio', 'pacemaker_sense_failure_ventriculo',
              'pacemaker_pace_failure_atrio', 'pacemaker_pace_failure_ventriculo'].includes(f)
          )
        }
      }

      // If selecting a failure, deselect normal
      if ((finding === 'pacemaker_sense_failure' || finding === 'pacemaker_pace_failure') &&
          newFindings.includes(finding)) {
        return {
          ...prev,
          findings: newFindings.filter(f => f !== 'pacemaker_normal')
        }
      }

      return { ...prev, findings: newFindings }
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit(formData)
  }

  // Get regular categories (excluding special ones)
  const regularCategories = Object.entries(FINDINGS_BY_CATEGORY).filter(
    ([category]) => !SPECIAL_CATEGORIES.includes(category)
  )

  // Get Sinais de Fibrose category but filter out pathological_q (we handle it specially)
  const fibroseFindings = (FINDINGS_BY_CATEGORY['Sinais de Fibrose'] || []).filter(
    f => f.value !== 'pathological_q'
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Rhythm Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-gray-900">Ritmo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Ritmo Cardíaco (selecione um ou mais)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {RHYTHMS.map((rhythm) => (
                <label
                  key={rhythm.value}
                  className={`
                    flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors
                    ${formData.rhythm.includes(rhythm.value)
                      ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                      : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
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

          {/* Pacemaker Section - only show when pacemaker rhythm is selected */}
          {isPacemakerRhythm && (
            <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <label className="block text-sm font-medium text-purple-900 mb-3">
                Funcionamento do Marcapasso
              </label>
              <div className="flex flex-wrap gap-2">
                {PACEMAKER_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-sm
                      ${formData.findings.includes(option.value)
                        ? 'bg-purple-600 border-purple-600 text-white font-medium'
                        : 'bg-white border-purple-300 text-purple-900 hover:bg-purple-100'
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={formData.findings.includes(option.value)}
                      onChange={() => handleFindingChange(option.value)}
                      className="sr-only"
                    />
                    {option.label}
                  </label>
                ))}
              </div>

              {/* Sense Failure Chamber Selection */}
              {hasSenseFailure && (
                <div className="mt-3 ml-4 pl-4 border-l-2 border-purple-300">
                  <label className="block text-sm font-medium text-purple-800 mb-2">
                    Câmara - Falha de Sense
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CHAMBER_OPTIONS.map((chamber) => {
                      const chamberFinding = `pacemaker_sense_failure_${chamber.value}` as Finding
                      return (
                        <label
                          key={chamber.value}
                          className={`
                            flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-sm
                            ${formData.findings.includes(chamberFinding)
                              ? 'bg-purple-100 border-purple-500 text-purple-800 font-medium'
                              : 'bg-white border-purple-200 text-purple-900 hover:bg-purple-50'
                            }
                          `}
                        >
                          <input
                            type="checkbox"
                            checked={formData.findings.includes(chamberFinding)}
                            onChange={() => handleFindingChange(chamberFinding)}
                            className="sr-only"
                          />
                          {chamber.label}
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Pace Failure Chamber Selection */}
              {hasPaceFailure && (
                <div className="mt-3 ml-4 pl-4 border-l-2 border-purple-300">
                  <label className="block text-sm font-medium text-purple-800 mb-2">
                    Câmara - Falha de Pace
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CHAMBER_OPTIONS.map((chamber) => {
                      const chamberFinding = `pacemaker_pace_failure_${chamber.value}` as Finding
                      return (
                        <label
                          key={chamber.value}
                          className={`
                            flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-sm
                            ${formData.findings.includes(chamberFinding)
                              ? 'bg-purple-100 border-purple-500 text-purple-800 font-medium'
                              : 'bg-white border-purple-200 text-purple-900 hover:bg-purple-50'
                            }
                          `}
                        >
                          <input
                            type="checkbox"
                            checked={formData.findings.includes(chamberFinding)}
                            onChange={() => handleFindingChange(chamberFinding)}
                            className="sr-only"
                          />
                          {chamber.label}
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Regularidade
            </label>
            <div className="flex gap-4">
              {REGULARITIES.map((reg) => (
                <label
                  key={reg.value}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors
                    ${formData.regularity === reg.value
                      ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                      : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
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
          <CardTitle className="text-lg text-gray-900">Frequência e Medidas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Frequência Cardíaca (bpm)
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
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Eixo Elétrico
              </label>
              <div className="flex flex-wrap gap-2">
                {AXES.map((axis) => (
                  <label
                    key={axis.value}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-sm
                      ${formData.axis === axis.value
                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                        : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
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
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Intervalo PR
              </label>
              <div className="flex flex-col gap-2">
                {PR_INTERVALS.map((interval) => (
                  <label
                    key={interval.value}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-sm
                      ${formData.pr_interval === interval.value
                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                        : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
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
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Duração do QRS
              </label>
              <div className="flex flex-col gap-2">
                {QRS_DURATIONS.map((duration) => (
                  <label
                    key={duration.value}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-sm
                      ${formData.qrs_duration === duration.value
                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                        : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
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
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Intervalo QT
              </label>
              <div className="flex flex-col gap-2">
                {QT_INTERVALS.map((interval) => (
                  <label
                    key={interval.value}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-sm
                      ${formData.qt_interval === interval.value
                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                        : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
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
          <CardTitle className="text-lg text-gray-900">Achados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {regularCategories.map(([category, findings]) => (
            <div key={category}>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {category}
              </label>
              <div className="flex flex-wrap gap-2">
                {findings.map((finding) => (
                  <label
                    key={finding.value}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-sm
                      ${formData.findings.includes(finding.value)
                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                        : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
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

          {/* Infarto Oclusivo Section */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Infarto Oclusivo
            </label>
            <div className="flex flex-wrap gap-2">
              <label
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-sm
                  ${hasOcaSelected
                    ? 'bg-red-600 border-red-600 text-white font-medium'
                    : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                  }
                `}
              >
                <input
                  type="checkbox"
                  checked={hasOcaSelected}
                  onChange={() => handleFindingChange('oca')}
                  className="sr-only"
                />
                Infarto Oclusivo
              </label>
            </div>

            {/* OCA Dependent Sections - immediately below */}
            {hasOcaSelected && (
              <div className="mt-3 ml-4 pl-4 border-l-2 border-red-300 space-y-4">
                {/* Wall Selection */}
                <div>
                  <label className="block text-sm font-medium text-red-800 mb-2">
                    Parede Acometida
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {WALL_OPTIONS.map((wall) => {
                      const wallFinding = `oca_wall_${wall.value}` as Finding
                      return (
                        <label
                          key={wall.value}
                          className={`
                            flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-sm
                            ${formData.findings.includes(wallFinding)
                              ? 'bg-red-100 border-red-500 text-red-800 font-medium'
                              : 'bg-white border-red-300 text-red-900 hover:bg-red-50'
                            }
                          `}
                        >
                          <input
                            type="checkbox"
                            checked={formData.findings.includes(wallFinding)}
                            onChange={() => handleFindingChange(wallFinding)}
                            className="sr-only"
                          />
                          {wall.label}
                        </label>
                      )
                    })}
                  </div>
                </div>

                {/* Ischemic Signs */}
                <div>
                  <label className="block text-sm font-medium text-red-800 mb-2">
                    Sinais Isquêmicos
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {OCA_SIGNS.map((sign) => (
                      <label
                        key={sign.value}
                        className={`
                          flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-sm
                          ${formData.findings.includes(sign.value)
                            ? 'bg-red-100 border-red-500 text-red-800 font-medium'
                            : 'bg-white border-red-300 text-red-900 hover:bg-red-50'
                          }
                        `}
                      >
                        <input
                          type="checkbox"
                          checked={formData.findings.includes(sign.value)}
                          onChange={() => handleFindingChange(sign.value)}
                          className="sr-only"
                        />
                        {sign.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sinais de Fibrose Section */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Sinais de Fibrose
            </label>
            <div className="flex flex-wrap gap-2">
              {/* Onda Q Patológica */}
              <label
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-sm
                  ${hasPathologicalQSelected
                    ? 'bg-amber-600 border-amber-600 text-white font-medium'
                    : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                  }
                `}
              >
                <input
                  type="checkbox"
                  checked={hasPathologicalQSelected}
                  onChange={() => handleFindingChange('pathological_q')}
                  className="sr-only"
                />
                Onda Q Patológica
              </label>

              {/* Other Fibrose findings (QRS Fragmentado, etc.) */}
              {fibroseFindings.map((finding) => (
                <label
                  key={finding.value}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-sm
                    ${formData.findings.includes(finding.value)
                      ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                      : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
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

            {/* Pathological Q Dependent Section - immediately below */}
            {hasPathologicalQSelected && (
              <div className="mt-3 ml-4 pl-4 border-l-2 border-amber-300">
                <label className="block text-sm font-medium text-amber-800 mb-2">
                  Parede Acometida
                </label>
                <div className="flex flex-wrap gap-2">
                  {WALL_OPTIONS.map((wall) => {
                    const wallFinding = `pathological_q_${wall.value}` as Finding
                    return (
                      <label
                        key={wall.value}
                        className={`
                          flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-sm
                          ${formData.findings.includes(wallFinding)
                            ? 'bg-amber-100 border-amber-500 text-amber-800 font-medium'
                            : 'bg-white border-amber-300 text-amber-900 hover:bg-amber-50'
                          }
                        `}
                      >
                        <input
                          type="checkbox"
                          checked={formData.findings.includes(wallFinding)}
                          onChange={() => handleFindingChange(wallFinding)}
                          className="sr-only"
                        />
                        {wall.label}
                      </label>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notes Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-gray-900">Observações (Opcional)</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
            placeholder="Notas adicionais ou explicação..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] text-gray-900"
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
