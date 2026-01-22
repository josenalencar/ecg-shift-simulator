'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Select } from '@/components/ui'
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

  async function handleReportSubmit(reportData: ReportFormData) {
    if (!title.trim()) {
      setError('Please enter a title')
      setStep(1)
      return
    }

    if (!imageUrl) {
      setError('Please upload an ECG image')
      setStep(1)
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('You must be logged in')
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
        throw ecgError || new Error('Failed to create ECG')
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
      console.error('Error creating ECG:', err)
      setError('Failed to create ECG. Please try again.')
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
            Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add New ECG</h1>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-4 mb-8">
        <div
          className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
            1
          </div>
          <span className="font-medium">ECG Details</span>
        </div>
        <div className="flex-1 h-px bg-gray-200" />
        <div
          className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
            2
          </div>
          <span className="font-medium">Official Report</span>
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

          <div className="flex justify-end">
            <Button
              onClick={() => {
                if (!title.trim()) {
                  setError('Please enter a title')
                  return
                }
                if (!imageUrl) {
                  setError('Please upload an ECG image')
                  return
                }
                setError(null)
                setStep(2)
              }}
              size="lg"
            >
              Continue to Official Report
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          {/* Preview of ECG */}
          <Card>
            <CardHeader>
              <CardTitle>ECG Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 items-start">
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-48 rounded-lg border"
                />
                <div>
                  <h3 className="font-semibold text-lg">{title}</h3>
                  <p className="text-gray-600">
                    <span className="capitalize">{difficulty}</span> • <span className="capitalize">{category}</span>
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep(1)}
                    className="mt-2"
                  >
                    Edit Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Official Report Form */}
          <ReportForm
            onSubmit={handleReportSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Create ECG Case"
          />
        </div>
      )}
    </div>
  )
}
