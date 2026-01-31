'use client'

import { useState } from 'react'
import { X, Plus, Trash2, Loader2, AlertTriangle } from 'lucide-react'

interface EmailManagementModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'create' | 'delete'
  emailType?: string
  emailName?: string
  onConfirm: (data: { emailType?: string; category?: string; name?: string }) => Promise<boolean>
}

const categoryOptions = [
  { value: 'account', label: 'Conta', description: 'Emails relacionados a conta do usuario (assinatura, pagamento, senha)' },
  { value: 'onboarding', label: 'Onboarding', description: 'Emails de integracao para novos usuarios' },
  { value: 'engagement', label: 'Engajamento', description: 'Emails para manter usuarios ativos (streak, conquistas, relatorios)' },
]

export function EmailManagementModal({
  isOpen,
  onClose,
  mode,
  emailType,
  emailName,
  onConfirm,
}: EmailManagementModalProps) {
  const [category, setCategory] = useState('engagement')
  const [newEmailType, setNewEmailType] = useState('')
  const [newEmailName, setNewEmailName] = useState('')
  const [newEmailDescription, setNewEmailDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setError(null)
    setIsLoading(true)

    if (mode === 'create') {
      if (!newEmailType.trim() || !newEmailName.trim()) {
        setError('Preencha todos os campos obrigatorios')
        setIsLoading(false)
        return
      }
      // Validate email type format (lowercase, underscores)
      const typeRegex = /^[a-z][a-z0-9_]*$/
      if (!typeRegex.test(newEmailType)) {
        setError('Tipo deve ser lowercase com underscores (ex: meu_email)')
        setIsLoading(false)
        return
      }
    }

    const success = await onConfirm({
      emailType: mode === 'create' ? newEmailType : emailType,
      category: mode === 'create' ? category : undefined,
      name: mode === 'create' ? newEmailName : undefined,
    })

    setIsLoading(false)

    if (success) {
      // Reset form
      setNewEmailType('')
      setNewEmailName('')
      setNewEmailDescription('')
      setCategory('engagement')
      onClose()
    } else {
      setError('Ocorreu um erro. Tente novamente.')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {mode === 'create' ? 'Novo Template de Email' : 'Excluir Template'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {mode === 'create' ? (
            <>
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria *
                </label>
                <div className="space-y-2">
                  {categoryOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                        category === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="category"
                        value={option.value}
                        checked={category === option.value}
                        onChange={(e) => setCategory(e.target.value)}
                        className="mt-0.5 mr-3"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{option.label}</p>
                        <p className="text-sm text-gray-500">{option.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Email Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Identificador (email_type) *
                </label>
                <input
                  type="text"
                  value={newEmailType}
                  onChange={(e) => setNewEmailType(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
                  placeholder="ex: promocao_especial"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Usado internamente. Lowercase com underscores.</p>
              </div>

              {/* Email Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Email *
                </label>
                <input
                  type="text"
                  value={newEmailName}
                  onChange={(e) => setNewEmailName(e.target.value)}
                  placeholder="ex: Promocao Especial"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descricao
                </label>
                <textarea
                  value={newEmailDescription}
                  onChange={(e) => setNewEmailDescription(e.target.value)}
                  placeholder="Descreva quando este email sera enviado..."
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Excluir "{emailName}"?
              </h4>
              <p className="text-gray-600 text-sm">
                Esta acao nao pode ser desfeita. O template personalizado sera removido permanentemente.
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 p-4 border-t bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 ${
              mode === 'create'
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : mode === 'create' ? (
              <Plus className="h-4 w-4" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {mode === 'create' ? 'Criar Template' : 'Excluir'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EmailManagementModal
