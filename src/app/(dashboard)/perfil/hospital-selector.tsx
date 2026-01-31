'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'
import { Building2, Crown, Lock } from 'lucide-react'
import { HOSPITAL_TYPES } from '@/lib/ecg-constants'
import type { HospitalType } from '@/types/database'

interface HospitalSelectorProps {
  initialHospitalType: HospitalType | null
  isPremium: boolean
}

export function HospitalSelector({ initialHospitalType, isPremium }: HospitalSelectorProps) {
  const [hospitalType, setHospitalType] = useState<HospitalType | null>(initialHospitalType)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const router = useRouter()
  const supabase = createClient()

  async function handleSaveHospitalType(selectedType: HospitalType) {
    if (!isPremium) {
      router.push('/pricing')
      return
    }

    setSaving(true)
    setMessage(null)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setMessage({ type: 'error', text: 'Sessão expirada. Faça login novamente.' })
      setSaving(false)
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('profiles') as any)
      .update({ hospital_type: selectedType })
      .eq('id', user.id)

    if (error) {
      setMessage({ type: 'error', text: 'Erro ao salvar preferência: ' + error.message })
    } else {
      setHospitalType(selectedType)
      setMessage({ type: 'success', text: 'Preferência salva! Os ECGs serão priorizados de acordo.' })
    }

    setSaving(false)
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Preferências Clínicas
          {isPremium && (
            <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 flex items-center gap-1">
              <Crown className="h-3 w-3" />
              Premium
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            {isPremium
              ? 'Selecione o tipo de hospital onde você trabalha. O sistema irá priorizar os ECGs mais relevantes para sua prática.'
              : 'Com o Premium, você pode personalizar os ECGs de acordo com seu local de trabalho.'}
          </p>

          <div className="grid gap-3">
            {HOSPITAL_TYPES.map((hospital) => (
              <button
                key={hospital.value}
                type="button"
                onClick={() => handleSaveHospitalType(hospital.value)}
                disabled={saving || !isPremium}
                className={`
                  w-full p-4 rounded-lg border-2 text-left transition-all
                  ${hospitalType === hospital.value
                    ? 'border-blue-500 bg-blue-50'
                    : isPremium
                      ? 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      : 'border-gray-200 opacity-60 cursor-not-allowed'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{hospital.label}</div>
                    <div className="text-sm text-gray-500">{hospital.description}</div>
                  </div>
                  {hospitalType === hospital.value && (
                    <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
                      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  {!isPremium && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Lock className="h-3 w-3" />
                      Premium
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {message && (
            <div className={`p-3 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {message.text}
            </div>
          )}

          {!isPremium && (
            <div className="pt-2">
              <Link href="/pricing">
                <Button variant="secondary" size="sm">
                  <Crown className="h-4 w-4 mr-2" />
                  Desbloquear com Premium
                </Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
