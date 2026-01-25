'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, Button, Select } from '@/components/ui'
import { ImageUpload, ReportForm, type ReportFormData } from '@/components/ecg'
import { DIFFICULTIES, CATEGORIES } from '@/lib/ecg-constants'
import { ArrowLeft } from 'lucide-react'
import type { Difficulty, Category } from '@/types/database'

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
  const [category, setCategory] = useState<Category>('other')

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
          category,
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
    } catch (err) {
      console.error('Erro ao criar ECG:', err)
      setError('Falha ao criar ECG. Por favor, tente novamente.')
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

          <Card>
            <CardHeader>
              <CardTitle>Detalhes do ECG</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título (gerado automaticamente)
                </label>
                <div className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 font-mono">
                  {title || 'Carregando...'}
                </div>
              </div>

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

          <div className="flex justify-end">
            <Button
              onClick={() => {
                if (!imageUrl) {
                  setError('Por favor, faça upload de uma imagem de ECG')
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
          {/* Large ECG Preview */}
          <Card>
            <CardHeader>
              <CardTitle>ECG #{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <img
                src={imageUrl}
                alt={`ECG ${title}`}
                className="w-full rounded-lg border"
              />
              <div className="mt-4 flex items-center justify-between">
                <p className="text-gray-600">
                  <span className="capitalize">{DIFFICULTIES.find(d => d.value === difficulty)?.label}</span> • <span className="capitalize">{CATEGORIES.find(c => c.value === category)?.label}</span>
                </p>
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
