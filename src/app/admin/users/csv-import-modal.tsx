'use client'

import { useState, useRef } from 'react'
import { X, Upload, FileSpreadsheet, Loader2, CheckCircle2, XCircle, Download } from 'lucide-react'
import { Button } from '@/components/ui'

interface CSVImportModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

type ParsedUser = {
  email: string
  plan: string
}

type ImportResult = {
  email: string
  success: boolean
  error?: string
}

export function CSVImportModal({ isOpen, onClose, onSuccess }: CSVImportModalProps) {
  const [parsedUsers, setParsedUsers] = useState<ParsedUser[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState<ImportResult[] | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')
    setResults(null)

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const lines = text.split('\n').filter(line => line.trim())

      // Skip header if present
      const startIndex = lines[0]?.toLowerCase().includes('email') ? 1 : 0

      const users: ParsedUser[] = []
      const validPlans = ['free', 'premium', 'ai', 'aluno_ecg']

      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue

        // Handle both comma and semicolon separators
        const parts = line.includes(';') ? line.split(';') : line.split(',')
        const email = parts[0]?.trim().toLowerCase()
        let plan = parts[1]?.trim().toLowerCase() || 'free'

        // Normalize plan names
        if (plan === 'gratuito') plan = 'free'
        if (plan === 'aluno_ecg_com_ja' || plan === 'aluno') plan = 'aluno_ecg'

        if (email && validPlans.includes(plan)) {
          users.push({ email, plan })
        } else if (email) {
          users.push({ email, plan: plan || 'free' })
        }
      }

      setParsedUsers(users)
    }
    reader.readAsText(file)
  }

  const handleImport = async () => {
    if (parsedUsers.length === 0) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/users/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          users: parsedUsers.map(u => ({ email: u.email, plan: u.plan }))
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao importar usuários')
      }

      setResults(data.results)

      if (data.summary.success > 0) {
        onSuccess()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao importar')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setParsedUsers([])
    setResults(null)
    setError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
    onClose()
  }

  const downloadTemplate = () => {
    const template = `email,plano
exemplo@email.com,premium
outro@email.com,ai
aluno@faculdade.com,aluno_ecg
gratuito@email.com,free`

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'modelo_importacao_usuarios.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const successCount = results?.filter(r => r.success).length || 0
  const failedCount = results?.filter(r => !r.success).length || 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Importar Usuários via CSV
          </h2>
          <button onClick={handleClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {!results ? (
            <>
              {/* File Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                  id="csv-upload"
                />
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Clique para selecionar ou arraste um arquivo CSV
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Formato: email,plano (uma linha por usuário)
                  </p>
                </label>
              </div>

              {/* Download Template */}
              <button
                onClick={downloadTemplate}
                className="w-full flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-800"
              >
                <Download className="h-4 w-4" />
                Baixar modelo CSV
              </button>

              {/* Preview */}
              {parsedUsers.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-3 py-2 border-b">
                    <p className="text-sm font-medium text-gray-700">
                      {parsedUsers.length} usuário(s) encontrado(s)
                    </p>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="text-left px-3 py-2 text-gray-600">Email</th>
                          <th className="text-left px-3 py-2 text-gray-600">Plano</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedUsers.slice(0, 10).map((user, i) => (
                          <tr key={i} className="border-t">
                            <td className="px-3 py-2 text-gray-900">{user.email}</td>
                            <td className="px-3 py-2">
                              <span className={`
                                px-2 py-0.5 rounded text-xs font-medium
                                ${user.plan === 'ai' ? 'bg-purple-100 text-purple-700' :
                                  user.plan === 'premium' ? 'bg-blue-100 text-blue-700' :
                                  user.plan === 'aluno_ecg' ? 'bg-green-100 text-green-700' :
                                  'bg-gray-100 text-gray-700'}
                              `}>
                                {user.plan === 'ai' ? 'Premium +IA' :
                                 user.plan === 'premium' ? 'Premium' :
                                 user.plan === 'aluno_ecg' ? 'Aluno ECG' : 'Gratuito'}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {parsedUsers.length > 10 && (
                          <tr className="border-t">
                            <td colSpan={2} className="px-3 py-2 text-gray-500 text-center">
                              ... e mais {parsedUsers.length - 10} usuário(s)
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Results */
            <div className="space-y-4">
              <div className="flex gap-4 justify-center">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="text-2xl font-bold">{successCount}</span>
                  </div>
                  <p className="text-xs text-gray-500">Sucesso</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-red-600">
                    <XCircle className="h-5 w-5" />
                    <span className="text-2xl font-bold">{failedCount}</span>
                  </div>
                  <p className="text-xs text-gray-500">Falha</p>
                </div>
              </div>

              {failedCount > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-red-50 px-3 py-2 border-b">
                    <p className="text-sm font-medium text-red-700">Erros encontrados:</p>
                  </div>
                  <div className="max-h-40 overflow-y-auto">
                    {results.filter(r => !r.success).map((r, i) => (
                      <div key={i} className="px-3 py-2 border-t text-sm">
                        <span className="text-gray-900">{r.email}</span>
                        <span className="text-red-600 ml-2">- {r.error}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t flex gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1"
          >
            {results ? 'Fechar' : 'Cancelar'}
          </Button>
          {!results && (
            <Button
              onClick={handleImport}
              disabled={loading || parsedUsers.length === 0}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Importando...
                </>
              ) : (
                `Importar ${parsedUsers.length} usuário(s)`
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
