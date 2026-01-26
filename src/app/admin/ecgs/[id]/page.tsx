'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Select } from '@/components/ui'
import { ImageUpload, ReportForm, ECGViewer, type ReportFormData } from '@/components/ecg'
import { DIFFICULTIES, CATEGORIES } from '@/lib/ecg-constants'
import { ArrowLeft, Loader2, Check } from 'lucide-react'
import type { Difficulty, Category, ECG, OfficialReport } from '@/types/database'

const CLINICAL_PRESENTATIONS = [
  { value: 'dor_toracica', label: 'Dor Toracica' },
  { value: 'dispneia', label: 'Dispneia' },
  { value: 'palpitacoes', label: 'Palpitacoes' },
  { value: 'sincope', label: 'Sincope' },
  { value: 'pre_sincope', label: 'Pre-sincope' },
  { value: 'tontura', label: 'Tontura' },
  { value: 'fadiga', label: 'Fadiga' },
  { value: 'edema', label: 'Edema de MMII' },
  { value: 'nega_sintomas', label: 'Nega Sintomas' },
  { value: 'checkup', label: 'Check-up / Rotina' },
  { value: 'pre_operatorio', label: 'Pre-operatorio' },
  { value: 'dor_epigastrica', label: 'Dor Epigastrica' },
  { value: 'mal_estar', label: 'Mal-estar' },
  { value: 'sudorese', label: 'Sudorese' },
  { value: 'nausea_vomito', label: 'Nausea / Vomito' },
]

type ECGWithPatientInfo = ECG & {
  patient_age?: number | null
  patient_sex?: string | null
  clinical_presentation?: string[] | null
}

export default function EditECGPage() {
  const router = useRouter()
  const params = useParams()
  const ecgId = params.id as string
  const supabase = createClient()

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ECG metadata
  const [title, setTitle] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [category, setCategory] = useState<Category>('other')
  const [existingReport, setExistingReport] = useState<OfficialReport | null>(null)

  // Patient info
  const [patientAge, setPatientAge] = useState<string>('')
  const [patientSex, setPatientSex] = useState<'masculino' | 'feminino' | ''>('')
  const [clinicalPresentation, setClinicalPresentation] = useState<string[]>([])

  useEffect(() => {
    async function loadECG() {
      const { data: ecgData, error } = await supabase
        .from('ecgs')
        .select('*, official_reports(*)')
        .eq('id', ecgId)
        .single()

      type ECGWithReport = ECGWithPatientInfo & { official_reports: OfficialReport | null }
      const ecg = ecgData as ECGWithReport | null

      if (error || !ecg) {
        setError('ECG not found')
        setIsLoading(false)
        return
      }

      setTitle(ecg.title)
      setImageUrl(ecg.image_url)
      setDifficulty(ecg.difficulty)
      setCategory(ecg.category)
      setExistingReport(ecg.official_reports)

      // Load patient info
      setPatientAge(ecg.patient_age?.toString() || '')
      setPatientSex((ecg.patient_sex as 'masculino' | 'feminino') || '')
      setClinicalPresentation(ecg.clinical_presentation || [])

      setIsLoading(false)
    }

    loadECG()
  }, [ecgId, supabase])

  function toggleClinicalPresentation(value: string) {
    setClinicalPresentation(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    )
  }

  async function handleSubmit(reportData: ReportFormData) {
    if (!title.trim()) {
      setError('Por favor, insira um titulo')
      return
    }

    if (!imageUrl) {
      setError('Por favor, faca upload de uma imagem de ECG')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Update ECG record
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: ecgError } = await (supabase.from('ecgs') as any)
        .update({
          title,
          image_url: imageUrl,
          difficulty,
          category,
          patient_age: patientAge ? parseInt(patientAge) : null,
          patient_sex: patientSex || null,
          clinical_presentation: clinicalPresentation.length > 0 ? clinicalPresentation : null,
        })
        .eq('id', ecgId)

      if (ecgError) {
        throw ecgError
      }

      // Update or create official report
      if (existingReport) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: reportError } = await (supabase.from('official_reports') as any)
          .update({
            rhythm: reportData.rhythm,
            regularity: reportData.regularity,
            heart_rate: reportData.heart_rate,
            axis: reportData.axis,
            pr_interval: reportData.pr_interval,
            qrs_duration: reportData.qrs_duration,
            qt_interval: reportData.qt_interval,
            findings: reportData.findings,
            notes: reportData.notes || null,
          })
          .eq('id', existingReport.id)

        if (reportError) {
          throw reportError
        }
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: reportError } = await (supabase.from('official_reports') as any)
          .insert({
            ecg_id: ecgId,
            rhythm: reportData.rhythm,
            regularity: reportData.regularity,
            heart_rate: reportData.heart_rate,
            axis: reportData.axis,
            pr_interval: reportData.pr_interval,
            qrs_duration: reportData.qrs_duration,
            qt_interval: reportData.qt_interval,
            findings: reportData.findings,
            notes: reportData.notes || null,
          })

        if (reportError) {
          throw reportError
        }
      }

      router.push('/admin/ecgs')
      router.refresh()
    } catch (err) {
      console.error('Error updating ECG:', err)
      setError('Falha ao atualizar ECG. Por favor, tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/ecgs">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Editar ECG</h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Imagem do ECG</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUpload value={imageUrl} onChange={setImageUrl} />
          </CardContent>
        </Card>

        {/* ECG Viewer with Caliper */}
        {imageUrl && (
          <Card>
            <CardHeader>
              <CardTitle>Visualizador com Compasso</CardTitle>
            </CardHeader>
            <CardContent>
              <ECGViewer imageUrl={imageUrl} title={title} />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Dados do Paciente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                id="patient-age"
                label="Idade (anos)"
                type="number"
                min="0"
                max="120"
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
                placeholder="Ex: 65"
              />

              <Select
                id="patient-sex"
                label="Sexo"
                value={patientSex}
                onChange={(e) => setPatientSex(e.target.value as 'masculino' | 'feminino' | '')}
                options={[
                  { value: '', label: 'Selecione...' },
                  { value: 'masculino', label: 'Masculino' },
                  { value: 'feminino', label: 'Feminino' },
                ]}
              />

              <Input
                id="title"
                label="Titulo"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="00001"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quadro Clinico (selecione um ou mais)
              </label>
              <div className="flex flex-wrap gap-2">
                {CLINICAL_PRESENTATIONS.map((presentation) => {
                  const isSelected = clinicalPresentation.includes(presentation.value)
                  return (
                    <button
                      key={presentation.value}
                      type="button"
                      onClick={() => toggleClinicalPresentation(presentation.value)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {isSelected && <Check className="h-4 w-4" />}
                      {presentation.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Classificacao do ECG</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                id="difficulty"
                label="Dificuldade"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                options={DIFFICULTIES}
              />

              <Select
                id="category"
                label="Categoria"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                options={CATEGORIES}
              />
            </div>
          </CardContent>
        </Card>

        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Laudo Oficial</h2>

        <ReportForm
          initialData={existingReport ? {
            rhythm: existingReport.rhythm,
            regularity: existingReport.regularity,
            heart_rate: existingReport.heart_rate,
            axis: existingReport.axis,
            pr_interval: existingReport.pr_interval,
            qrs_duration: existingReport.qrs_duration,
            qt_interval: existingReport.qt_interval,
            findings: existingReport.findings,
            notes: existingReport.notes || '',
          } : undefined}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Salvar Alteracoes"
        />
      </div>
    </div>
  )
}
