'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Select } from '@/components/ui'
import { ImageUpload, ReportForm, type ReportFormData } from '@/components/ecg'
import { DIFFICULTIES, CATEGORIES } from '@/lib/ecg-constants'
import { ArrowLeft, Loader2 } from 'lucide-react'
import type { Difficulty, Category, ECG, OfficialReport } from '@/types/database'

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

  useEffect(() => {
    async function loadECG() {
      const { data: ecgData, error } = await supabase
        .from('ecgs')
        .select('*, official_reports(*)')
        .eq('id', ecgId)
        .single()

      type ECGWithReport = ECG & { official_reports: OfficialReport | null }
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
      setIsLoading(false)
    }

    loadECG()
  }, [ecgId, supabase])

  async function handleSubmit(reportData: ReportFormData) {
    if (!title.trim()) {
      setError('Please enter a title')
      return
    }

    if (!imageUrl) {
      setError('Please upload an ECG image')
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
      setError('Failed to update ECG. Please try again.')
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
            Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit ECG</h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>ECG Image</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUpload value={imageUrl} onChange={setImageUrl} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ECG Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              id="title"
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Case #001 - Anterior STEMI"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                id="difficulty"
                label="Difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                options={DIFFICULTIES}
              />

              <Select
                id="category"
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                options={CATEGORIES}
              />
            </div>
          </CardContent>
        </Card>

        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Official Report</h2>

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
          submitLabel="Save Changes"
        />
      </div>
    </div>
  )
}
