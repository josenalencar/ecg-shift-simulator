'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, Upload, Download, FileDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui'
import { AddUserModal } from './add-user-modal'
import { CSVImportModal } from './csv-import-modal'

interface UserData {
  name: string
  email: string
  plan: string
  role: string
  ecgs: number
  avgScore: number
  createdAt: string
}

interface UserToolbarProps {
  usersForExport?: UserData[]
}

export function UserToolbar({ usersForExport }: UserToolbarProps) {
  const router = useRouter()
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [exporting, setExporting] = useState(false)

  const handleSuccess = () => {
    router.refresh()
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

  const exportUsers = () => {
    if (!usersForExport || usersForExport.length === 0) {
      alert('Nenhum usuário para exportar')
      return
    }

    setExporting(true)

    const headers = ['Nome', 'Email', 'Plano', 'Função', 'ECGs', 'Média', 'Cadastro']
    const rows = usersForExport.map(u => [
      u.name,
      u.email,
      u.plan,
      u.role,
      u.ecgs.toString(),
      u.avgScore.toString() + '%',
      u.createdAt
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `usuarios_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)

    setExporting(false)
  }

  return (
    <>
      <div className="flex flex-wrap gap-3 mb-6">
        <Button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Adicionar Usuário
        </Button>

        <Button
          variant="outline"
          onClick={() => setImportModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Importar CSV
        </Button>

        <Button
          variant="outline"
          onClick={downloadTemplate}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Baixar Modelo
        </Button>

        {usersForExport && usersForExport.length > 0 && (
          <Button
            variant="outline"
            onClick={exportUsers}
            disabled={exporting}
            className="flex items-center gap-2"
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4" />
            )}
            Exportar Lista ({usersForExport.length})
          </Button>
        )}
      </div>

      <AddUserModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={handleSuccess}
      />

      <CSVImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  )
}
