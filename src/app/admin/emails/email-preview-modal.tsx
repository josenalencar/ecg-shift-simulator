'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, AlertCircle } from 'lucide-react'

interface EmailPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  emailType: string | null
  emailName: string
}

export function EmailPreviewModal({ isOpen, onClose, emailType, emailName }: EmailPreviewModalProps) {
  const [html, setHtml] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && emailType) {
      setLoading(true)
      setError(null)
      setHtml(null)

      fetch(`/api/admin/emails/preview?type=${emailType}`)
        .then(res => res.json())
        .then(data => {
          if (data.html) {
            setHtml(data.html)
          } else {
            setError('Preview nao disponivel')
          }
        })
        .catch(() => {
          setError('Erro ao carregar preview')
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [isOpen, emailType])

  if (!isOpen || !emailType) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
          <div>
            <h3 className="font-semibold text-gray-900">Preview do E-mail</h3>
            <p className="text-sm text-gray-500">{emailName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-gray-100 p-4">
          {loading && (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">{error}</p>
              </div>
            </div>
          )}

          {html && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <iframe
                srcDoc={html}
                className="w-full h-[600px] border-0"
                title="Email Preview"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-4 border-t bg-gray-50 rounded-b-xl flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
