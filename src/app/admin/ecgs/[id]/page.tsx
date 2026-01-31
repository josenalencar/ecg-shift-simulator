'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Select } from '@/components/ui'
import { ImageUpload, ReportForm, ECGViewer, type ReportFormData } from '@/components/ecg'
import { DIFFICULTIES, CATEGORIES, MEDICAL_HISTORY_OPTIONS, FAMILY_HISTORY_OPTIONS, MEDICATIONS_OPTIONS } from '@/lib/ecg-constants'
import { ArrowLeft, Loader2, Check, Baby } from 'lucide-react'
import type { Difficulty, Category, ECG, OfficialReport, MedicalHistory, FamilyHistory, Medication } from '@/types/database'

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
  medical_history?: MedicalHistory[] | null
  family_history?: FamilyHistory[] | null
  medications?: Medication[] | null
  is_pediatric?: boolean | null
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
  const [categories, setCategories] = useState<Category[]>(['other'])
  const [isPediatric, setIsPediatric] = useState(false)
  const [existingReport, setExistingReport] = useState<OfficialReport | null>(null)

  // Patient info
  const [patientAge, setPatientAge] = useState<string>('')
  const [patientSex, setPatientSex] = useState<'masculino' | 'feminino' | ''>('')
  const [clinicalPresentation, setClinicalPresentation] = useState<string[]>([])

  // Medical history
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory[]>([])
  const [familyHistory, setFamilyHistory] = useState<FamilyHistory[]>([])
  const [medications, setMedications] = useState<Medication[]>([])

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
      // Load categories (new) or fallback to single category (backward compat)
      const ecgWithCategories = ecg as { categories?: Category[] }
      if (ecgWithCategories.categories && ecgWithCategories.categories.length > 0) {
        setCategories(ecgWithCategories.categories)
      } else {
        setCategories([ecg.category])
      }
      setIsPediatric(ecg.is_pediatric || false)
      setExistingReport(ecg.official_reports)

      // Load patient info
      setPatientAge(ecg.patient_age?.toString() || '')
      setPatientSex((ecg.patient_sex as 'masculino' | 'feminino') || '')
      setClinicalPresentation(ecg.clinical_presentation || [])

      // Load medical history
      setMedicalHistory(ecg.medical_history || [])
      setFamilyHistory(ecg.family_history || [])
      setMedications(ecg.medications || [])

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

  function toggleMedicalHistory(value: MedicalHistory) {
    setMedicalHistory(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    )
  }

  function toggleFamilyHistory(value: FamilyHistory) {
    setFamilyHistory(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    )
  }

  function toggleMedication(value: Medication) {
    setMedications(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    )
  }

  function toggleCategory(value: Category) {
    setCategories(prev => {
      const newCategories = prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
      // Ensure at least one category is selected
      return newCategories.length === 0 ? [value] : newCategories
    })
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
          category: categories[0], // Keep first category for backward compatibility
          categories, // New: array of categories
          is_pediatric: isPediatric,
          patient_age: patientAge ? parseInt(patientAge) : null,
          patient_sex: patientSex || null,
          clinical_presentation: clinicalPresentation.length > 0 ? clinicalPresentation : null,
          medical_history: medicalHistory.length > 0 ? medicalHistory : null,
          family_history: familyHistory.length > 0 ? familyHistory : null,
          medications: medications.length > 0 ? medications : null,
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
            heart_rate: reportData.heart_rate,
            axis: reportData.axis,
            // Deprecated fields - set defaults for DB compatibility
            pr_interval: 'normal',
            qrs_duration: 'normal',
            qt_interval: 'normal',
            findings: reportData.findings,
            electrode_swap: reportData.electrode_swap.length > 0 ? reportData.electrode_swap : null,
            notes: reportData.notes || null,
            age_pattern: isPediatric ? reportData.age_pattern : null,
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
            heart_rate: reportData.heart_rate,
            axis: reportData.axis,
            // Deprecated fields - set defaults for DB compatibility
            pr_interval: 'normal',
            qrs_duration: 'normal',
            qt_interval: 'normal',
            findings: reportData.findings,
            electrode_swap: reportData.electrode_swap.length > 0 ? reportData.electrode_swap : null,
            notes: reportData.notes || null,
            age_pattern: isPediatric ? reportData.age_pattern : null,
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
            <CardTitle>Histórico</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Histórico Pessoal
              </label>
              <div className="flex flex-wrap gap-2">
                {MEDICAL_HISTORY_OPTIONS.map((item) => {
                  const isSelected = medicalHistory.includes(item.value)
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => toggleMedicalHistory(item.value)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {isSelected && <Check className="h-4 w-4" />}
                      {item.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Histórico Familiar
              </label>
              <div className="flex flex-wrap gap-2">
                {FAMILY_HISTORY_OPTIONS.map((item) => {
                  const isSelected = familyHistory.includes(item.value)
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => toggleFamilyHistory(item.value)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                        isSelected
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {isSelected && <Check className="h-4 w-4" />}
                      {item.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medicações em Uso
              </label>
              <div className="flex flex-wrap gap-2">
                {MEDICATIONS_OPTIONS.map((item) => {
                  const isSelected = medications.includes(item.value)
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => toggleMedication(item.value)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                        isSelected
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {isSelected && <Check className="h-4 w-4" />}
                      {item.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Classificação do ECG</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              id="difficulty"
              label="Dificuldade"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              options={DIFFICULTIES}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categorias (selecione uma ou mais)
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => {
                  const isSelected = categories.includes(cat.value)
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => toggleCategory(cat.value)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {isSelected && <Check className="h-4 w-4" />}
                      {cat.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Pediatric ECG Toggle */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPediatric}
                  onChange={(e) => setIsPediatric(e.target.checked)}
                  className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500"
                />
                <div className="flex items-center gap-2">
                  <Baby className="h-5 w-5 text-green-600" />
                  <div>
                    <span className="font-medium text-gray-900">ECG Pediátrico</span>
                    <p className="text-sm text-gray-600">Marque se este é um ECG de paciente pediátrico</p>
                  </div>
                </div>
              </label>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Laudo Oficial</h2>

        <ReportForm
          initialData={existingReport ? {
            rhythm: existingReport.rhythm,
            heart_rate: existingReport.heart_rate,
            axis: existingReport.axis,
            findings: existingReport.findings,
            electrode_swap: existingReport.electrode_swap || [],
            notes: existingReport.notes || '',
            age_pattern: (existingReport as { age_pattern?: 'expected_for_age' | 'outside_age_pattern' }).age_pattern,
          } : undefined}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Salvar Alteracoes"
          isPediatric={isPediatric}
        />
      </div>
    </div>
  )
}
