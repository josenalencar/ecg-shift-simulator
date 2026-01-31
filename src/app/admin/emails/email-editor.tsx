'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Save, RotateCcw, Eye, EyeOff, Info, Loader2 } from 'lucide-react'

// Dynamically import Monaco to avoid SSR issues
const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

interface EmailEditorProps {
  emailType: string
  currentHtml: string | null
  currentSubject: string | null
  isUsingCustom: boolean
  defaultSubject: string
  onSave: (html: string, subject: string, useCustom: boolean) => Promise<boolean>
  onReset: () => Promise<boolean>
}

// Available template variables for each email type
const templateVariables: Record<string, Array<{ variable: string; description: string }>> = {
  // ============================================
  // ACCOUNT EMAILS
  // ============================================
  welcome: [
    { variable: '{{userName}}', description: 'Nome do usuario' },
    { variable: '{{siteUrl}}', description: 'URL do site' },
  ],
  subscription_activated: [
    { variable: '{{userName}}', description: 'Nome do usuario' },
    { variable: '{{plan}}', description: 'Plano (premium/ai)' },
    { variable: '{{planDisplay}}', description: 'Nome do plano (Premium/Premium + IA)' },
    { variable: '{{siteUrl}}', description: 'URL do site' },
  ],
  subscription_canceled: [
    { variable: '{{userName}}', description: 'Nome do usuario' },
    { variable: '{{endDate}}', description: 'Data final do acesso' },
    { variable: '{{siteUrl}}', description: 'URL do site' },
  ],
  payment_failed: [
    { variable: '{{userName}}', description: 'Nome do usuario' },
    { variable: '{{siteUrl}}', description: 'URL do site' },
  ],
  password_reset: [
    { variable: '{{userName}}', description: 'Nome do usuario' },
    { variable: '{{resetLink}}', description: 'Link para redefinir senha' },
    { variable: '{{siteUrl}}', description: 'URL do site' },
  ],
  renewal_reminder: [
    { variable: '{{userName}}', description: 'Nome do usuario' },
    { variable: '{{plan}}', description: 'Plano atual' },
    { variable: '{{planDisplay}}', description: 'Nome do plano' },
    { variable: '{{amount}}', description: 'Valor da renovacao' },
    { variable: '{{renewalDate}}', description: 'Data da renovacao' },
    { variable: '{{siteUrl}}', description: 'URL do site' },
  ],

  // ============================================
  // ONBOARDING EMAILS
  // ============================================
  first_case: [
    { variable: '{{userName}}', description: 'Nome do usuario' },
    { variable: '{{score}}', description: 'Pontuacao obtida (0-100)' },
    { variable: '{{difficulty}}', description: 'Dificuldade (easy/medium/hard)' },
    { variable: '{{difficultyLabel}}', description: 'Dificuldade (Facil/Medio/Dificil)' },
    { variable: '{{xpEarned}}', description: 'XP ganhos' },
    { variable: '{{siteUrl}}', description: 'URL do site' },
  ],
  day2: [
    { variable: '{{userName}}', description: 'Nome do usuario' },
    { variable: '{{siteUrl}}', description: 'URL do site' },
  ],
  day3: [
    { variable: '{{userName}}', description: 'Nome do usuario' },
    { variable: '{{ecgsCompleted}}', description: 'ECGs completados' },
    { variable: '{{totalXp}}', description: 'XP total' },
    { variable: '{{currentLevel}}', description: 'Nivel atual' },
    { variable: '{{siteUrl}}', description: 'URL do site' },
  ],
  day5: [
    { variable: '{{userName}}', description: 'Nome do usuario' },
    { variable: '{{featureName}}', description: 'Nome do recurso' },
    { variable: '{{featureDescription}}', description: 'Descricao do recurso' },
    { variable: '{{siteUrl}}', description: 'URL do site' },
  ],
  day7: [
    { variable: '{{userName}}', description: 'Nome do usuario' },
    { variable: '{{ecgsCompleted}}', description: 'ECGs da semana' },
    { variable: '{{perfectScores}}', description: 'Pontuacoes perfeitas' },
    { variable: '{{xpEarned}}', description: 'XP ganhos' },
    { variable: '{{activeDays}}', description: 'Dias ativos' },
    { variable: '{{streak}}', description: 'Streak atual' },
    { variable: '{{siteUrl}}', description: 'URL do site' },
  ],

  // ============================================
  // ENGAGEMENT EMAILS
  // ============================================
  streak_starter: [
    { variable: '{{userName}}', description: 'Nome do usuario' },
    { variable: '{{previousStreak}}', description: 'Streak perdido' },
    { variable: '{{longestStreak}}', description: 'Maior streak ja alcancado' },
    { variable: '{{daysSinceLastActivity}}', description: 'Dias desde ultima atividade' },
    { variable: '{{currentLevel}}', description: 'Nivel atual' },
    { variable: '{{totalXp}}', description: 'XP total' },
    { variable: '{{siteUrl}}', description: 'URL do site' },
  ],
  streak_at_risk: [
    { variable: '{{userName}}', description: 'Nome do usuario' },
    { variable: '{{streak}}', description: 'Streak atual em risco' },
    { variable: '{{hoursRemaining}}', description: 'Horas restantes para salvar' },
    { variable: '{{streakXpBonus}}', description: 'Bonus de XP diario que perdera' },
    { variable: '{{longestStreak}}', description: 'Maior streak ja alcancado' },
    { variable: '{{siteUrl}}', description: 'URL do site' },
  ],
  streak_milestone: [
    { variable: '{{userName}}', description: 'Nome do usuario' },
    { variable: '{{streak}}', description: 'Streak alcancado (7, 14, 30, 60, 100)' },
    { variable: '{{xpBonus}}', description: 'Bonus de XP pelo marco' },
    { variable: '{{nextMilestone}}', description: 'Proximo marco a alcancar' },
    { variable: '{{daysToNextMilestone}}', description: 'Dias ate o proximo marco' },
    { variable: '{{totalXp}}', description: 'XP total' },
    { variable: '{{siteUrl}}', description: 'URL do site' },
  ],
  level_up: [
    { variable: '{{userName}}', description: 'Nome do usuario' },
    { variable: '{{level}}', description: 'Novo nivel alcancado' },
    { variable: '{{previousLevel}}', description: 'Nivel anterior' },
    { variable: '{{totalXp}}', description: 'XP total' },
    { variable: '{{xpToNextLevel}}', description: 'XP necessario para proximo nivel' },
    { variable: '{{percentToNextLevel}}', description: 'Progresso % para proximo nivel' },
    { variable: '{{totalEcgs}}', description: 'Total de ECGs completados' },
    { variable: '{{rank}}', description: 'Posicao no ranking' },
    { variable: '{{siteUrl}}', description: 'URL do site' },
  ],
  achievement: [
    { variable: '{{userName}}', description: 'Nome do usuario' },
    { variable: '{{achievementName}}', description: 'Nome da conquista' },
    { variable: '{{achievementDescription}}', description: 'Descricao da conquista' },
    { variable: '{{achievementIcon}}', description: 'Icone da conquista' },
    { variable: '{{xpReward}}', description: 'XP ganhos pela conquista' },
    { variable: '{{rarity}}', description: 'Raridade (common/uncommon/rare/epic/legendary)' },
    { variable: '{{rarityLabel}}', description: 'Raridade (Comum/Incomum/Rara/Epica/Lendaria)' },
    { variable: '{{totalAchievements}}', description: 'Total de conquistas do usuario' },
    { variable: '{{achievementsCount}}', description: 'Conquistas totais disponiveis (100)' },
    { variable: '{{siteUrl}}', description: 'URL do site' },
  ],
  weekly_digest: [
    { variable: '{{userName}}', description: 'Nome do usuario' },
    { variable: '{{ecgsCompleted}}', description: 'ECGs completados na semana' },
    { variable: '{{ecgsDelta}}', description: 'Diferenca vs semana anterior (+/-)' },
    { variable: '{{perfectScores}}', description: 'Pontuacoes perfeitas' },
    { variable: '{{xpEarned}}', description: 'XP ganhos na semana' },
    { variable: '{{xpDelta}}', description: 'Diferenca XP vs semana anterior' },
    { variable: '{{activeDays}}', description: 'Dias ativos (de 7)' },
    { variable: '{{streak}}', description: 'Streak atual' },
    { variable: '{{level}}', description: 'Nivel atual' },
    { variable: '{{averageScore}}', description: 'Pontuacao media (%)' },
    { variable: '{{rank}}', description: 'Posicao no ranking' },
    { variable: '{{percentile}}', description: 'Top X% dos usuarios' },
    { variable: '{{topAchievement}}', description: 'Melhor conquista da semana' },
    { variable: '{{easyCount}}', description: 'ECGs faceis' },
    { variable: '{{mediumCount}}', description: 'ECGs medios' },
    { variable: '{{hardCount}}', description: 'ECGs dificeis' },
    { variable: '{{siteUrl}}', description: 'URL do site' },
  ],
  monthly_report: [
    { variable: '{{userName}}', description: 'Nome do usuario' },
    { variable: '{{monthName}}', description: 'Nome do mes (Janeiro, Fevereiro...)' },
    { variable: '{{ecgsCompleted}}', description: 'ECGs completados no mes' },
    { variable: '{{ecgsDelta}}', description: 'Diferenca vs mes anterior' },
    { variable: '{{perfectScores}}', description: 'Pontuacoes perfeitas' },
    { variable: '{{perfectDelta}}', description: 'Diferenca perfeitos vs mes anterior' },
    { variable: '{{xpEarned}}', description: 'XP ganhos no mes' },
    { variable: '{{xpDelta}}', description: 'Diferenca XP vs mes anterior' },
    { variable: '{{activeDays}}', description: 'Dias ativos no mes' },
    { variable: '{{activeDaysDelta}}', description: 'Diferenca dias vs mes anterior' },
    { variable: '{{levelStart}}', description: 'Nivel no inicio do mes' },
    { variable: '{{levelEnd}}', description: 'Nivel no fim do mes' },
    { variable: '{{levelsGained}}', description: 'Niveis ganhos no mes' },
    { variable: '{{averageScore}}', description: 'Pontuacao media (%)' },
    { variable: '{{averageScoreDelta}}', description: 'Diferenca score vs mes anterior' },
    { variable: '{{bestStreak}}', description: 'Melhor streak do mes' },
    { variable: '{{rank}}', description: 'Posicao no ranking' },
    { variable: '{{rankDelta}}', description: 'Mudanca no ranking (+/- posicoes)' },
    { variable: '{{percentile}}', description: 'Top X% dos usuarios' },
    { variable: '{{achievementsEarned}}', description: 'Conquistas ganhas no mes' },
    { variable: '{{totalAchievements}}', description: 'Total de conquistas' },
    { variable: '{{siteUrl}}', description: 'URL do site' },
  ],
  xp_event_announcement: [
    { variable: '{{userName}}', description: 'Nome do usuario' },
    { variable: '{{eventName}}', description: 'Nome do evento' },
    { variable: '{{eventType}}', description: 'Tipo (2x ou 3x)' },
    { variable: '{{eventTypeLabel}}', description: 'Label (XP DOBRADO ou XP TRIPLICADO)' },
    { variable: '{{eventEndDate}}', description: 'Data de termino do evento' },
    { variable: '{{hoursRemaining}}', description: 'Horas restantes no evento' },
    { variable: '{{currentLevel}}', description: 'Nivel atual do usuario' },
    { variable: '{{totalXp}}', description: 'XP total do usuario' },
    { variable: '{{xpToNextLevel}}', description: 'XP para proximo nivel' },
    { variable: '{{siteUrl}}', description: 'URL do site' },
  ],
}

// Default variables that apply to all emails
const defaultVariables = [
  { variable: '{{userName}}', description: 'Nome do usuario' },
  { variable: '{{userEmail}}', description: 'Email do usuario' },
  { variable: '{{siteUrl}}', description: 'URL do site' },
  { variable: '{{unsubscribeUrl}}', description: 'Link para descadastrar' },
]

export function EmailEditor({
  emailType,
  currentHtml,
  currentSubject,
  isUsingCustom,
  defaultSubject,
  onSave,
  onReset,
}: EmailEditorProps) {
  const [html, setHtml] = useState(currentHtml || getDefaultHtml(emailType))
  const [subject, setSubject] = useState(currentSubject || defaultSubject)
  const [useCustom, setUseCustom] = useState(isUsingCustom)
  const [showPreview, setShowPreview] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const variables = templateVariables[emailType] || defaultVariables

  const handleHtmlChange = useCallback((value: string | undefined) => {
    setHtml(value || '')
    setHasChanges(true)
  }, [])

  const handleSubjectChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSubject(e.target.value)
    setHasChanges(true)
  }, [])

  const handleToggleCustom = useCallback((enabled: boolean) => {
    setUseCustom(enabled)
    setHasChanges(true)
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    const success = await onSave(html, subject, useCustom)
    if (success) {
      setHasChanges(false)
    }
    setIsSaving(false)
  }

  const handleReset = async () => {
    setIsResetting(true)
    const success = await onReset()
    if (success) {
      setHtml(getDefaultHtml(emailType))
      setSubject(defaultSubject)
      setUseCustom(false)
      setHasChanges(false)
    }
    setIsResetting(false)
  }

  // Replace variables with sample values for preview
  const previewHtml = html
    // User data
    .replace(/\{\{userName\}\}/g, 'Dr. Jose')
    .replace(/\{\{userEmail\}\}/g, 'jose@exemplo.com')
    // Streak data
    .replace(/\{\{streak\}\}/g, '7')
    .replace(/\{\{hoursRemaining\}\}/g, '8')
    .replace(/\{\{streakXpBonus\}\}/g, '3.5')
    .replace(/\{\{longestStreak\}\}/g, '21')
    .replace(/\{\{previousStreak\}\}/g, '14')
    .replace(/\{\{daysSinceLastActivity\}\}/g, '3')
    .replace(/\{\{nextMilestone\}\}/g, '14')
    .replace(/\{\{daysToNextMilestone\}\}/g, '7')
    // Level data
    .replace(/\{\{level\}\}/g, '15')
    .replace(/\{\{previousLevel\}\}/g, '14')
    .replace(/\{\{currentLevel\}\}/g, '15')
    .replace(/\{\{xpToNextLevel\}\}/g, '1,250')
    .replace(/\{\{percentToNextLevel\}\}/g, '65')
    // XP data
    .replace(/\{\{totalXp\}\}/g, '4,406')
    .replace(/\{\{xpBonus\}\}/g, '100')
    .replace(/\{\{xpEarned\}\}/g, '500')
    .replace(/\{\{xpDelta\}\}/g, '+120')
    .replace(/\{\{xpReward\}\}/g, '250')
    // ECG data
    .replace(/\{\{ecgsCompleted\}\}/g, '25')
    .replace(/\{\{ecgsDelta\}\}/g, '+5')
    .replace(/\{\{totalEcgs\}\}/g, '156')
    .replace(/\{\{perfectScores\}\}/g, '10')
    .replace(/\{\{perfectDelta\}\}/g, '+3')
    .replace(/\{\{averageScore\}\}/g, '85')
    .replace(/\{\{averageScoreDelta\}\}/g, '+2.5')
    .replace(/\{\{score\}\}/g, '92')
    .replace(/\{\{easyCount\}\}/g, '8')
    .replace(/\{\{mediumCount\}\}/g, '12')
    .replace(/\{\{hardCount\}\}/g, '5')
    // Activity data
    .replace(/\{\{activeDays\}\}/g, '5')
    .replace(/\{\{activeDaysDelta\}\}/g, '+1')
    // Ranking data
    .replace(/\{\{rank\}\}/g, '42')
    .replace(/\{\{rankDelta\}\}/g, '+8')
    .replace(/\{\{percentile\}\}/g, '15.3')
    // Achievement data
    .replace(/\{\{achievementName\}\}/g, 'Mestre dos ECGs')
    .replace(/\{\{achievementDescription\}\}/g, 'Complete 100 ECGs com sucesso')
    .replace(/\{\{achievementIcon\}\}/g, 'trophy')
    .replace(/\{\{rarity\}\}/g, 'rare')
    .replace(/\{\{rarityLabel\}\}/g, 'Rara')
    .replace(/\{\{totalAchievements\}\}/g, '15')
    .replace(/\{\{achievementsCount\}\}/g, '100')
    .replace(/\{\{achievementsEarned\}\}/g, '3')
    .replace(/\{\{topAchievement\}\}/g, 'Streak de 7 dias')
    // Monthly data
    .replace(/\{\{monthName\}\}/g, 'Janeiro')
    .replace(/\{\{levelStart\}\}/g, '12')
    .replace(/\{\{levelEnd\}\}/g, '15')
    .replace(/\{\{levelsGained\}\}/g, '3')
    .replace(/\{\{bestStreak\}\}/g, '14')
    // Subscription data
    .replace(/\{\{plan\}\}/g, 'premium')
    .replace(/\{\{planDisplay\}\}/g, 'Premium')
    .replace(/\{\{amount\}\}/g, 'R$ 29,90')
    .replace(/\{\{renewalDate\}\}/g, '15/02/2026')
    .replace(/\{\{endDate\}\}/g, '28/02/2026')
    // Onboarding data
    .replace(/\{\{difficulty\}\}/g, 'medium')
    .replace(/\{\{difficultyLabel\}\}/g, 'Medio')
    .replace(/\{\{featureName\}\}/g, 'Modo Competitivo')
    .replace(/\{\{featureDescription\}\}/g, 'Compete com outros usuarios em tempo real')
    // Event data
    .replace(/\{\{eventName\}\}/g, 'Fim de Semana Especial')
    .replace(/\{\{eventType\}\}/g, '2x')
    .replace(/\{\{eventTypeLabel\}\}/g, 'XP DOBRADO')
    .replace(/\{\{eventEndDate\}\}/g, '02/02/2026 23:59')
    // Links
    .replace(/\{\{siteUrl\}\}/g, 'https://plantaoecg.com.br')
    .replace(/\{\{resetLink\}\}/g, 'https://plantaoecg.com.br/reset-password?token=xxx')
    .replace(/\{\{unsubscribeUrl\}\}/g, '#')

  return (
    <div className="space-y-4 mt-4 border-t pt-4">
      {/* Template Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={`template-${emailType}`}
              checked={!useCustom}
              onChange={() => handleToggleCustom(false)}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm font-medium text-gray-700">Template Padrao</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={`template-${emailType}`}
              checked={useCustom}
              onChange={() => handleToggleCustom(true)}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm font-medium text-gray-700">Template Personalizado</span>
          </label>
        </div>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showPreview ? 'Ocultar Preview' : 'Ver Preview'}
        </button>
      </div>

      {/* Only show editor if using custom template */}
      {useCustom && (
        <>
          {/* Variables Reference */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800">Variaveis disponiveis:</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {variables.map(v => (
                    <span
                      key={v.variable}
                      className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md font-mono"
                      title={v.description}
                    >
                      {v.variable}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Subject Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assunto do email
            </label>
            <input
              type="text"
              value={subject}
              onChange={handleSubjectChange}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Seu streak de {{streak}} dias esta em risco!"
            />
          </div>

          {/* HTML Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Conteudo HTML
            </label>
            <div className="border rounded-lg overflow-hidden">
              <Editor
                height="400px"
                defaultLanguage="html"
                value={html}
                onChange={handleHtmlChange}
                theme="vs-light"
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: 'on',
                  wordWrap: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </div>
          </div>
        </>
      )}

      {/* Preview - works for both Template Padrão and Template Personalizado */}
      {showPreview && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Preview {useCustom ? '(Personalizado)' : '(Padrão)'}
          </label>
          <div className="border rounded-lg p-4 bg-gray-50 max-h-[500px] overflow-auto">
            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="bg-gray-100 px-4 py-2 border-b">
                <p className="text-sm text-gray-600">
                  <strong>Assunto:</strong> {subject
                    .replace(/\{\{streak\}\}/g, '7')
                    .replace(/\{\{userName\}\}/g, 'Dr. Jose')
                    .replace(/\{\{level\}\}/g, '15')}
                </p>
              </div>
              <div
                className="p-0"
                dangerouslySetInnerHTML={{ __html: useCustom ? previewHtml : getDefaultHtml(emailType)
                  .replace(/\{\{userName\}\}/g, 'Dr. Jose')
                  .replace(/\{\{userEmail\}\}/g, 'jose@exemplo.com')
                  .replace(/\{\{streak\}\}/g, '7')
                  .replace(/\{\{hoursRemaining\}\}/g, '8')
                  .replace(/\{\{streakXpBonus\}\}/g, '3.5')
                  .replace(/\{\{longestStreak\}\}/g, '21')
                  .replace(/\{\{previousStreak\}\}/g, '14')
                  .replace(/\{\{daysSinceLastActivity\}\}/g, '3')
                  .replace(/\{\{nextMilestone\}\}/g, '14')
                  .replace(/\{\{daysToNextMilestone\}\}/g, '7')
                  .replace(/\{\{level\}\}/g, '15')
                  .replace(/\{\{previousLevel\}\}/g, '14')
                  .replace(/\{\{currentLevel\}\}/g, '15')
                  .replace(/\{\{xpToNextLevel\}\}/g, '1,250')
                  .replace(/\{\{percentToNextLevel\}\}/g, '65')
                  .replace(/\{\{totalXp\}\}/g, '4,406')
                  .replace(/\{\{xpBonus\}\}/g, '100')
                  .replace(/\{\{xpEarned\}\}/g, '500')
                  .replace(/\{\{xpDelta\}\}/g, '+120')
                  .replace(/\{\{xpReward\}\}/g, '250')
                  .replace(/\{\{ecgsCompleted\}\}/g, '25')
                  .replace(/\{\{ecgsDelta\}\}/g, '+5')
                  .replace(/\{\{totalEcgs\}\}/g, '156')
                  .replace(/\{\{perfectScores\}\}/g, '10')
                  .replace(/\{\{perfectDelta\}\}/g, '+3')
                  .replace(/\{\{averageScore\}\}/g, '85')
                  .replace(/\{\{averageScoreDelta\}\}/g, '+2.5')
                  .replace(/\{\{score\}\}/g, '92')
                  .replace(/\{\{easyCount\}\}/g, '8')
                  .replace(/\{\{mediumCount\}\}/g, '12')
                  .replace(/\{\{hardCount\}\}/g, '5')
                  .replace(/\{\{activeDays\}\}/g, '5')
                  .replace(/\{\{activeDaysDelta\}\}/g, '+1')
                  .replace(/\{\{rank\}\}/g, '42')
                  .replace(/\{\{rankDelta\}\}/g, '+8')
                  .replace(/\{\{percentile\}\}/g, '15.3')
                  .replace(/\{\{achievementName\}\}/g, 'Mestre dos ECGs')
                  .replace(/\{\{achievementDescription\}\}/g, 'Complete 100 ECGs com sucesso')
                  .replace(/\{\{achievementIcon\}\}/g, 'trophy')
                  .replace(/\{\{rarity\}\}/g, 'rare')
                  .replace(/\{\{rarityLabel\}\}/g, 'Rara')
                  .replace(/\{\{totalAchievements\}\}/g, '15')
                  .replace(/\{\{achievementsCount\}\}/g, '100')
                  .replace(/\{\{achievementsEarned\}\}/g, '3')
                  .replace(/\{\{topAchievement\}\}/g, 'Streak de 7 dias')
                  .replace(/\{\{monthName\}\}/g, 'Janeiro')
                  .replace(/\{\{levelStart\}\}/g, '12')
                  .replace(/\{\{levelEnd\}\}/g, '15')
                  .replace(/\{\{levelsGained\}\}/g, '3')
                  .replace(/\{\{bestStreak\}\}/g, '14')
                  .replace(/\{\{plan\}\}/g, 'premium')
                  .replace(/\{\{planDisplay\}\}/g, 'Premium')
                  .replace(/\{\{amount\}\}/g, 'R$ 29,90')
                  .replace(/\{\{renewalDate\}\}/g, '15/02/2026')
                  .replace(/\{\{endDate\}\}/g, '28/02/2026')
                  .replace(/\{\{difficulty\}\}/g, 'medium')
                  .replace(/\{\{difficultyLabel\}\}/g, 'Medio')
                  .replace(/\{\{featureName\}\}/g, 'Modo Competitivo')
                  .replace(/\{\{featureDescription\}\}/g, 'Compete com outros usuarios em tempo real')
                  .replace(/\{\{eventName\}\}/g, 'Fim de Semana Especial')
                  .replace(/\{\{eventType\}\}/g, '2x')
                  .replace(/\{\{eventTypeLabel\}\}/g, 'XP DOBRADO')
                  .replace(/\{\{eventEndDate\}\}/g, '02/02/2026 23:59')
                  .replace(/\{\{siteUrl\}\}/g, 'https://plantaoecg.com.br')
                  .replace(/\{\{resetLink\}\}/g, 'https://plantaoecg.com.br/reset-password?token=xxx')
                  .replace(/\{\{unsubscribeUrl\}\}/g, '#')
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      {useCustom && (
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Salvar Template
          </button>
          <button
            onClick={handleReset}
            disabled={isResetting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            {isResetting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4" />
            )}
            Resetar para Padrao
          </button>
        </div>
      )}
    </div>
  )
}

// Import professional templates
import { emailTemplates } from './email-templates'

// Default HTML template for emails - uses professional templates
function getDefaultHtml(emailType: string): string {
  return emailTemplates[emailType] || emailTemplates.welcome
}

export default EmailEditor
