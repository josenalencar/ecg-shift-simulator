'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, Button, Select, Input } from '@/components/ui'
import { ImageUpload, ReportForm, ECGViewer, type ReportFormData } from '@/components/ecg'
import { DIFFICULTIES, CATEGORIES, MEDICAL_HISTORY_OPTIONS, FAMILY_HISTORY_OPTIONS, MEDICATIONS_OPTIONS } from '@/lib/ecg-constants'
import { ArrowLeft, Check, Baby } from 'lucide-react'
import type { Difficulty, Category, MedicalHistory, FamilyHistory, Medication } from '@/types/database'

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

export default function NewECGPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ECG metadata
  const [title, setTitle] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [categories, setCategories] = useState<Category[]>(['other'])
  const [isPediatric, setIsPediatric] = useState(false)

  // Patient info
  const [patientAge, setPatientAge] = useState<string>('')
  const [patientSex, setPatientSex] = useState<'masculino' | 'feminino' | ''>('')
  const [clinicalPresentation, setClinicalPresentation] = useState<string[]>([])

  // Medical history
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory[]>([])
  const [familyHistory, setFamilyHistory] = useState<FamilyHistory[]>([])
  const [medications, setMedications] = useState<Medication[]>([])

  // Auto-generate title on load
  useEffect(() => {
    async function generateTitle() {
      const { count, error } = await supabase
        .from('ecgs')
        .select('*', { count: 'exact', head: true })

      if (!error && count !== null) {
        const nextNumber = count + 1
        setTitle(String(nextNumber).padStart(5, '0'))
      }
    }
    generateTitle()
  }, [supabase])

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

  async function handleReportSubmit(reportData: ReportFormData) {
    if (!title.trim()) {
      setError('Título é obrigatório')
      setStep(1)
      return
    }

    if (!imageUrl) {
      setError('Por favor, faça upload de uma imagem de ECG')
      setStep(1)
      return
    }

    if (!patientAge || !patientSex) {
      setError('Por favor, preencha idade e sexo do paciente')
      setStep(1)
      return
    }

    if (clinicalPresentation.length === 0) {
      setError('Por favor, selecione pelo menos um quadro clínico')
      setStep(1)
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Você precisa estar logado')
        return
      }

      // Create ECG record
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: ecgData, error: ecgError } = await (supabase.from('ecgs') as any)
        .insert({
          title,
          image_url: imageUrl,
          difficulty,
          category: categories[0], // Keep first category for backward compatibility
          categories, // New: array of categories
          is_pediatric: isPediatric,
          patient_age: parseInt(patientAge),
          patient_sex: patientSex,
          clinical_presentation: clinicalPresentation,
          medical_history: medicalHistory.length > 0 ? medicalHistory : null,
          family_history: familyHistory.length > 0 ? familyHistory : null,
          medications: medications.length > 0 ? medications : null,
          is_active: true,
          created_by: user.id,
        })
        .select()
        .single()

      const ecg = ecgData as { id: string } | null

      if (ecgError || !ecg) {
        throw ecgError || new Error('Falha ao criar ECG')
      }

      // Create official report
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: reportError } = await (supabase.from('official_reports') as any)
        .insert({
          ecg_id: ecg.id,
          rhythm: reportData.rhythm,
          regularity: reportData.regularity,
          heart_rate: reportData.heart_rate,
          axis: reportData.axis,
          pr_interval: reportData.pr_interval,
          qrs_duration: reportData.qrs_duration,
          qt_interval: reportData.qt_interval,
          findings: reportData.findings,
          electrode_swap: reportData.electrode_swap.length > 0 ? reportData.electrode_swap : null,
          notes: reportData.notes || null,
        })

      if (reportError) {
        // Rollback ECG creation
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('ecgs') as any).delete().eq('id', ecg.id)
        throw reportError
      }

      router.push('/admin/ecgs')
      router.refresh()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error
        ? err.message
        : (err as { message?: string })?.message || JSON.stringify(err)
      console.error('Erro ao criar ECG:', errorMessage, err)
      setError(`Falha ao criar ECG: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
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
        <h1 className="text-2xl font-bold text-gray-900">Adicionar Novo ECG</h1>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-4 mb-8">
        <div
          className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
            1
          </div>
          <span className="font-medium">Detalhes do ECG</span>
        </div>
        <div className="flex-1 h-px bg-gray-200" />
        <div
          className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
            2
          </div>
          <span className="font-medium">Laudo Oficial</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Imagem do ECG</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload value={imageUrl} onChange={setImageUrl} />
            </CardContent>
          </Card>

          {/* ECG Viewer with Caliper - show after image upload */}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título (gerado automaticamente)
                  </label>
                  <div className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 font-mono h-10 flex items-center">
                    {title || 'Carregando...'}
                  </div>
                </div>
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

          <div className="flex justify-end">
            <Button
              onClick={() => {
                if (!imageUrl) {
                  setError('Por favor, faça upload de uma imagem de ECG')
                  return
                }
                if (!patientAge || !patientSex) {
                  setError('Por favor, preencha idade e sexo do paciente')
                  return
                }
                if (clinicalPresentation.length === 0) {
                  setError('Por favor, selecione pelo menos um quadro clínico')
                  return
                }
                setError(null)
                setStep(2)
              }}
              size="lg"
            >
              Continuar para Laudo Oficial
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          {/* Large ECG Preview with Caliper */}
          <Card>
            <CardHeader>
              <CardTitle>ECG #{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ECGViewer imageUrl={imageUrl} title={title} />
              <div className="mt-4 space-y-2 text-sm">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="text-gray-500">Paciente:</span>
                    <span className="ml-2 font-medium">{patientSex === 'masculino' ? 'Masculino' : 'Feminino'}, {patientAge} anos</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Quadro:</span>
                    <span className="ml-2 font-medium">
                      {clinicalPresentation.map(p =>
                        CLINICAL_PRESENTATIONS.find(cp => cp.value === p)?.label
                      ).join(', ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Dificuldade:</span>
                    <span className="ml-2 font-medium capitalize">{DIFFICULTIES.find(d => d.value === difficulty)?.label}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Categorias:</span>
                    <span className="ml-2 font-medium">
                      {categories.map(c => CATEGORIES.find(cat => cat.value === c)?.label).join(', ')}
                    </span>
                  </div>
                </div>
                {(medicalHistory.length > 0 || familyHistory.length > 0 || medications.length > 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-gray-200">
                    {medicalHistory.length > 0 && (
                      <div>
                        <span className="text-gray-500">Hist. Pessoal:</span>
                        <span className="ml-2 font-medium">
                          {medicalHistory.map(h =>
                            MEDICAL_HISTORY_OPTIONS.find(mh => mh.value === h)?.label
                          ).join(', ')}
                        </span>
                      </div>
                    )}
                    {familyHistory.length > 0 && (
                      <div>
                        <span className="text-gray-500">Hist. Familiar:</span>
                        <span className="ml-2 font-medium">
                          {familyHistory.map(h =>
                            FAMILY_HISTORY_OPTIONS.find(fh => fh.value === h)?.label
                          ).join(', ')}
                        </span>
                      </div>
                    )}
                    {medications.length > 0 && (
                      <div>
                        <span className="text-gray-500">Medicações:</span>
                        <span className="ml-2 font-medium">
                          {medications.map(m =>
                            MEDICATIONS_OPTIONS.find(med => med.value === m)?.label
                          ).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep(1)}
                >
                  Editar Detalhes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Official Report Form */}
          <ReportForm
            onSubmit={handleReportSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Criar Caso de ECG"
          />
        </div>
      )}
    </div>
  )
}
