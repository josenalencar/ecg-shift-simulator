'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, Upload, Download } from 'lucide-react'
import { Button } from '@/components/ui'
import { AddUserModal } from './add-user-modal'
import { CSVImportModal } from './csv-import-modal'

export function UserToolbar() {
  const router = useRouter()
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [importModalOpen, setImportModalOpen] = useState(false)

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
