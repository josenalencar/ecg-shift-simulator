'use client'

import { useState } from 'react'
import { X, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface EmailTestModalProps {
  isOpen: boolean
  onClose: () => void
  emailType: string | null
  emailName: string
}

export function EmailTestModal({ isOpen, onClose, emailType, emailName }: EmailTestModalProps) {
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  if (!isOpen || !emailType) return null

  // Map email_type to the test API format
  const mapEmailType = (type: string): string => {
    const mapping: Record<string, string> = {
      // Account emails
      'welcome': 'welcome',
      'subscription_activated': 'subscriptionActivated',
      'subscription_canceled': 'subscriptionCanceled',
      'payment_failed': 'paymentFailed',
      'password_reset': 'passwordReset',
      'renewal_reminder': 'renewalReminder',
      'xp_event_announcement': 'xpEventAnnouncement',
      // Onboarding emails
      'first_case': 'firstCase',
      'day2': 'day2',
      'day3': 'day3',
      'day5': 'day5',
      'day7': 'day7',
      // Engagement emails
      'streak_starter': 'streakStarter',
      'streak_at_risk': 'streakAtRisk',
      'streak_milestone': 'streakMilestone',
      'level_up': 'levelUp',
      'achievement': 'achievement',
      'weekly_digest': 'weeklyDigest',
      'monthly_report': 'monthlyReport',
    }
    return mapping[type] || type
  }

  const handleSend = async () => {
    if (!email) return

    setSending(true)
    setResult(null)

    try {
      const res = await fetch('/api/admin/test-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetEmail: email,
          emailType: emailType ? mapEmailType(emailType) : 'all'
        })
      })

      const data = await res.json()
      console.log('[Test Email] Response:', data) // Log for debugging

      if (res.ok) {
        // Check if the specific email was actually sent
        const emailResult = data.results?.find((r: { type: string }) =>
          r.type === mapEmailType(emailType || '')
        )

        if (data.summary?.success > 0 || emailResult?.success) {
          setResult({
            success: true,
            message: `E-mail "${emailName}" enviado para ${email}`
          })
          setEmail('')
        } else if (emailResult && !emailResult.success) {
          setResult({
            success: false,
            message: `Falha ao enviar "${emailName}": ${emailResult.error || 'Erro desconhecido'}`
          })
        } else if (data.summary?.total === 0) {
          setResult({
            success: false,
            message: `Tipo de e-mail "${emailName}" nao suportado para teste`
          })
        } else {
          setResult({
            success: true,
            message: `E-mail "${emailName}" enviado para ${email}`
          })
          setEmail('')
        }
      } else {
        setResult({ success: false, message: data.error || 'Erro ao enviar e-mail' })
      }
    } catch (error) {
      console.error('[Test Email] Error:', error)
      setResult({ success: false, message: 'Erro de conexao' })
    } finally {
      setSending(false)
    }
  }

  const handleClose = () => {
    setEmail('')
    setResult(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-gray-900">Enviar E-mail de Teste</h3>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Tipo de e-mail:</p>
            <p className="font-medium text-gray-900">{emailName}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-mail de destino
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {result && (
            <div
              className={`flex items-start gap-2 p-3 rounded-lg ${
                result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}
            >
              {result.success ? (
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
              )}
              <p className="text-sm">{result.message}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t bg-gray-50 rounded-b-xl">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSend}
            disabled={!email || sending}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Enviar
          </button>
        </div>
      </div>
    </div>
  )
}
