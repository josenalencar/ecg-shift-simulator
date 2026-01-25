'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '@/components/ui'
import { Settings, Database, Image, Bell, Shield, Save, RefreshCw } from 'lucide-react'

export default function AdminSettingsPage() {
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState({
    passScore: 80,
    heartRateTolerance: 10,
    allowRetakes: true,
    showCorrectAnswers: true,
    emailNotifications: true,
  })

  async function handleSave() {
    setIsSaving(true)
    // In a real app, this would save to the database
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    alert('Configurações salvas com sucesso!')
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Configurações</h1>

      <div className="space-y-6">
        {/* Scoring Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações de Pontuação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nota Mínima para Aprovação (%)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.passScore}
                  onChange={(e) => setSettings({ ...settings, passScore: parseInt(e.target.value) || 0 })}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Nota mínima para considerar o ECG como aprovado
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tolerância de Frequência Cardíaca (bpm)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="50"
                  value={settings.heartRateTolerance}
                  onChange={(e) => setSettings({ ...settings, heartRateTolerance: parseInt(e.target.value) || 0 })}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Margem de erro aceita para a frequência cardíaca
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allowRetakes}
                  onChange={(e) => setSettings({ ...settings, allowRetakes: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <div>
                  <span className="font-medium text-gray-900">Permitir refazer ECGs</span>
                  <p className="text-sm text-gray-500">Usuários podem tentar o mesmo ECG novamente</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showCorrectAnswers}
                  onChange={(e) => setSettings({ ...settings, showCorrectAnswers: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <div>
                  <span className="font-medium text-gray-900">Mostrar respostas corretas</span>
                  <p className="text-sm text-gray-500">Exibir o laudo oficial após a tentativa</p>
                </div>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Database Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Informações do Banco de Dados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Provedor</p>
                <p className="text-lg font-semibold text-gray-900">Supabase</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Região</p>
                <p className="text-lg font-semibold text-gray-900">South America</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Status</p>
                <p className="text-lg font-semibold text-green-600 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Conectado
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Storage Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Armazenamento de Imagens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Provedor</p>
                <p className="text-lg font-semibold text-gray-900">Cloudinary</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Preset de Upload</p>
                <p className="text-lg font-semibold text-gray-900">ecg_uploads</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Status</p>
                <p className="text-lg font-semibold text-green-600 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Configurado
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <div>
                <span className="font-medium text-gray-900">Notificações por email</span>
                <p className="text-sm text-gray-500">Receber alertas sobre novos usuários e atividade</p>
              </div>
            </label>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 text-green-700">
                <Shield className="h-5 w-5" />
                <span className="font-medium">Row Level Security (RLS) Ativo</span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                Todos os dados estão protegidos por políticas de segurança no banco de dados
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-blue-700">
                <RefreshCw className="h-5 w-5" />
                <span className="font-medium">Autenticação via Supabase Auth</span>
              </div>
              <p className="text-sm text-blue-600 mt-1">
                Sistema de autenticação seguro com JWT e gerenciamento de sessões
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} isLoading={isSaving} size="lg">
            <Save className="h-4 w-4 mr-2" />
            Salvar Configurações
          </Button>
        </div>
      </div>
    </div>
  )
}
