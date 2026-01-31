// Professional HTML email templates for all email types
// These templates use variables like {{userName}}, {{streak}}, etc.

const baseStyles = `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5; }
  .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
  .header { padding: 24px; text-align: center; }
  .content { padding: 40px; }
  .footer { background: #fafafa; padding: 32px; text-align: center; font-size: 12px; color: #71717a; }
  h1 { color: #18181b; margin: 0 0 16px; font-size: 28px; }
  h2 { color: #18181b; margin: 0 0 12px; font-size: 22px; }
  p { color: #52525b; line-height: 1.6; margin: 0 0 16px; }
  .button { display: inline-block; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; }
  .stat-box { background: #f4f4f5; border-radius: 12px; padding: 20px; text-align: center; }
  .stat-value { font-size: 36px; font-weight: 800; margin: 0; }
  .stat-label { font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 1px; margin: 4px 0 0; }
  .badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; letter-spacing: 1px; }
`

const logoUrl = 'https://plantaoecg.com.br/logo-email.png'

// ============================================
// ACCOUNT EMAILS
// ============================================

export const welcomeTemplate = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header" style="background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%);">
      <img src="${logoUrl}" alt="Plantao ECG" width="160" />
    </div>
    <div class="content">
      <div style="text-align: center; margin-bottom: 32px;">
        <span class="badge" style="background: #dbeafe; color: #1e40af;">BEM-VINDO(A)</span>
      </div>
      <h1 style="text-align: center;">Ola, {{userName}}!</h1>
      <p style="text-align: center; font-size: 18px;">
        Seja bem-vindo(a) ao <strong>Plantao ECG</strong>, a plataforma de treinamento em interpretacao de ECG mais completa do Brasil.
      </p>
      <div style="background: #eff6ff; border-radius: 12px; padding: 24px; margin: 32px 0;">
        <h2 style="color: #1e40af; margin-bottom: 16px;">O que voce pode fazer:</h2>
        <ul style="color: #52525b; line-height: 2;">
          <li>Praticar com casos reais de ECG</li>
          <li>Acompanhar seu progresso e nivel</li>
          <li>Competir no ranking com outros usuarios</li>
          <li>Desbloquear conquistas e marcos</li>
          <li>Manter um streak diario de estudos</li>
        </ul>
      </div>
      <p style="text-align: center; margin-top: 32px;">
        <a href="{{siteUrl}}/practice" class="button" style="background: #2563eb;">Comecar a Praticar</a>
      </p>
    </div>
    <div class="footer">
      <p>Plantao ECG - Treinamento em interpretacao de ECG</p>
      <p><a href="{{unsubscribeUrl}}" style="color: #a1a1aa;">Cancelar inscricao</a></p>
    </div>
  </div>
</body>
</html>`

export const subscriptionActivatedTemplate = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header" style="background: linear-gradient(135deg, #059669 0%, #10b981 100%);">
      <img src="${logoUrl}" alt="Plantao ECG" width="160" />
    </div>
    <div class="content">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 48px;">🎉</span>
      </div>
      <h1 style="text-align: center;">Assinatura Ativada!</h1>
      <p style="text-align: center; font-size: 18px;">
        Parabens, {{userName}}! Sua assinatura <strong>{{planDisplay}}</strong> esta ativa.
      </p>
      <div style="background: #ecfdf5; border: 2px solid #10b981; border-radius: 12px; padding: 24px; margin: 32px 0; text-align: center;">
        <p style="color: #059669; font-size: 16px; font-weight: 600; margin: 0;">
          Agora voce tem acesso completo a todos os recursos premium!
        </p>
      </div>
      <p style="text-align: center; margin-top: 32px;">
        <a href="{{siteUrl}}/practice" class="button" style="background: #059669;">Comecar a Usar</a>
      </p>
    </div>
    <div class="footer">
      <p>Plantao ECG - Treinamento em interpretacao de ECG</p>
    </div>
  </div>
</body>
</html>`

export const subscriptionCanceledTemplate = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header" style="background: #52525b;">
      <img src="${logoUrl}" alt="Plantao ECG" width="160" />
    </div>
    <div class="content">
      <h1>Assinatura Cancelada</h1>
      <p>Ola, {{userName}}.</p>
      <p>Confirmamos o cancelamento da sua assinatura premium.</p>
      <div style="background: #fef3c7; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <p style="color: #92400e; margin: 0;">
          <strong>Seu acesso premium continua ate:</strong><br>
          <span style="font-size: 20px;">{{endDate}}</span>
        </p>
      </div>
      <p>Apos essa data, voce ainda podera usar o plano gratuito com acesso limitado.</p>
      <p>Se mudar de ideia, pode reativar sua assinatura a qualquer momento.</p>
      <p style="text-align: center; margin-top: 32px;">
        <a href="{{siteUrl}}/plano" class="button" style="background: #2563eb;">Reativar Assinatura</a>
      </p>
    </div>
    <div class="footer">
      <p>Plantao ECG - Treinamento em interpretacao de ECG</p>
    </div>
  </div>
</body>
</html>`

export const paymentFailedTemplate = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header" style="background: #dc2626;">
      <img src="${logoUrl}" alt="Plantao ECG" width="160" />
    </div>
    <div class="content">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 48px;">⚠️</span>
      </div>
      <h1 style="text-align: center;">Problema com Pagamento</h1>
      <p style="text-align: center;">
        Ola, {{userName}}. Nao conseguimos processar seu ultimo pagamento.
      </p>
      <div style="background: #fef2f2; border: 2px solid #fecaca; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <p style="color: #dc2626; margin: 0; text-align: center;">
          Por favor, atualize suas informacoes de pagamento para manter seu acesso premium.
        </p>
      </div>
      <p style="text-align: center; margin-top: 32px;">
        <a href="{{siteUrl}}/plano" class="button" style="background: #dc2626;">Atualizar Pagamento</a>
      </p>
    </div>
    <div class="footer">
      <p>Plantao ECG - Treinamento em interpretacao de ECG</p>
    </div>
  </div>
</body>
</html>`

export const passwordResetTemplate = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header" style="background: #1e40af;">
      <img src="${logoUrl}" alt="Plantao ECG" width="160" />
    </div>
    <div class="content">
      <h1>Redefinir Senha</h1>
      <p>Ola, {{userName}}.</p>
      <p>Recebemos uma solicitacao para redefinir sua senha. Clique no botao abaixo para criar uma nova senha:</p>
      <p style="text-align: center; margin: 32px 0;">
        <a href="{{resetLink}}" class="button" style="background: #2563eb;">Redefinir Minha Senha</a>
      </p>
      <p style="font-size: 14px; color: #71717a;">
        Se voce nao solicitou esta redefinicao, ignore este email. O link expira em 1 hora.
      </p>
    </div>
    <div class="footer">
      <p>Plantao ECG - Treinamento em interpretacao de ECG</p>
    </div>
  </div>
</body>
</html>`

export const renewalReminderTemplate = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header" style="background: #1e40af;">
      <img src="${logoUrl}" alt="Plantao ECG" width="160" />
    </div>
    <div class="content">
      <h1>Lembrete de Renovacao</h1>
      <p>Ola, {{userName}}.</p>
      <p>Sua assinatura <strong>{{planDisplay}}</strong> sera renovada automaticamente em breve.</p>
      <div style="background: #eff6ff; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <table style="width: 100%;">
          <tr>
            <td style="color: #71717a;">Plano:</td>
            <td style="text-align: right; font-weight: 600;">{{planDisplay}}</td>
          </tr>
          <tr>
            <td style="color: #71717a;">Valor:</td>
            <td style="text-align: right; font-weight: 600;">{{amount}}</td>
          </tr>
          <tr>
            <td style="color: #71717a;">Data:</td>
            <td style="text-align: right; font-weight: 600;">{{renewalDate}}</td>
          </tr>
        </table>
      </div>
      <p style="font-size: 14px; color: #71717a;">
        Nenhuma acao e necessaria. Se desejar cancelar, acesse sua conta antes da data de renovacao.
      </p>
    </div>
    <div class="footer">
      <p>Plantao ECG - Treinamento em interpretacao de ECG</p>
    </div>
  </div>
</body>
</html>`

// ============================================
// ONBOARDING EMAILS
// ============================================

export const firstCaseTemplate = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header" style="background: linear-gradient(135deg, #059669 0%, #10b981 100%);">
      <img src="${logoUrl}" alt="Plantao ECG" width="160" />
    </div>
    <div class="content">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 48px;">🎉</span>
      </div>
      <h1 style="text-align: center;">Primeiro ECG Concluido!</h1>
      <p style="text-align: center; font-size: 18px;">
        Parabens, {{userName}}! Voce completou seu primeiro caso.
      </p>
      <div style="display: flex; gap: 16px; margin: 32px 0;">
        <div class="stat-box" style="flex: 1;">
          <p class="stat-value" style="color: #059669;">{{score}}%</p>
          <p class="stat-label">Pontuacao</p>
        </div>
        <div class="stat-box" style="flex: 1;">
          <p class="stat-value" style="color: #2563eb;">+{{xpEarned}}</p>
          <p class="stat-label">XP Ganhos</p>
        </div>
      </div>
      <p style="text-align: center;">
        Continue praticando para melhorar suas habilidades e subir no ranking!
      </p>
      <p style="text-align: center; margin-top: 32px;">
        <a href="{{siteUrl}}/practice" class="button" style="background: #059669;">Praticar Mais</a>
      </p>
    </div>
    <div class="footer">
      <p>Plantao ECG - Treinamento em interpretacao de ECG</p>
      <p><a href="{{unsubscribeUrl}}" style="color: #a1a1aa;">Cancelar inscricao</a></p>
    </div>
  </div>
</body>
</html>`

export const day2Template = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header" style="background: #1e40af;">
      <img src="${logoUrl}" alt="Plantao ECG" width="160" />
    </div>
    <div class="content">
      <h1>Seu proximo plantao esta esperando</h1>
      <p>Ola, {{userName}}!</p>
      <p>Ontem voce deu o primeiro passo na sua jornada de treinamento em ECG. Que tal continuar hoje?</p>
      <div style="background: #eff6ff; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <p style="color: #1e40af; font-weight: 600; margin: 0 0 8px;">Dica do dia:</p>
        <p style="margin: 0;">Praticar diariamente, mesmo que por poucos minutos, e mais efetivo do que longas sessoes esporadicas.</p>
      </div>
      <p style="text-align: center; margin-top: 32px;">
        <a href="{{siteUrl}}/practice" class="button" style="background: #2563eb;">Continuar Praticando</a>
      </p>
    </div>
    <div class="footer">
      <p>Plantao ECG - Treinamento em interpretacao de ECG</p>
      <p><a href="{{unsubscribeUrl}}" style="color: #a1a1aa;">Cancelar inscricao</a></p>
    </div>
  </div>
</body>
</html>`

export const day3Template = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header" style="background: #1e40af;">
      <img src="${logoUrl}" alt="Plantao ECG" width="160" />
    </div>
    <div class="content">
      <div style="text-align: center; margin-bottom: 24px;">
        <span class="badge" style="background: #dbeafe; color: #1e40af;">48 HORAS</span>
      </div>
      <h1 style="text-align: center;">Seu Progresso ate Agora</h1>
      <p style="text-align: center;">Ola, {{userName}}! Veja como voce esta indo:</p>
      <div style="display: flex; gap: 12px; margin: 32px 0;">
        <div class="stat-box" style="flex: 1;">
          <p class="stat-value" style="color: #1e40af;">{{ecgsCompleted}}</p>
          <p class="stat-label">ECGs</p>
        </div>
        <div class="stat-box" style="flex: 1;">
          <p class="stat-value" style="color: #7c3aed;">{{totalXp}}</p>
          <p class="stat-label">XP Total</p>
        </div>
        <div class="stat-box" style="flex: 1;">
          <p class="stat-value" style="color: #059669;">{{currentLevel}}</p>
          <p class="stat-label">Nivel</p>
        </div>
      </div>
      <p style="text-align: center;">
        Continue assim! Cada ECG praticado te deixa mais preparado.
      </p>
      <p style="text-align: center; margin-top: 32px;">
        <a href="{{siteUrl}}/practice" class="button" style="background: #2563eb;">Continuar Praticando</a>
      </p>
    </div>
    <div class="footer">
      <p>Plantao ECG - Treinamento em interpretacao de ECG</p>
      <p><a href="{{unsubscribeUrl}}" style="color: #a1a1aa;">Cancelar inscricao</a></p>
    </div>
  </div>
</body>
</html>`

export const day5Template = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header" style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);">
      <img src="${logoUrl}" alt="Plantao ECG" width="160" />
    </div>
    <div class="content">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 48px;">💡</span>
      </div>
      <h1 style="text-align: center;">Recurso Nao Descoberto</h1>
      <p style="text-align: center;">Ola, {{userName}}! Voce sabia que existe:</p>
      <div style="background: #faf5ff; border: 2px solid #c084fc; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
        <h2 style="color: #7c3aed; margin: 0 0 8px;">{{featureName}}</h2>
        <p style="color: #6b21a8; margin: 0;">{{featureDescription}}</p>
      </div>
      <p style="text-align: center; margin-top: 32px;">
        <a href="{{siteUrl}}/practice" class="button" style="background: #7c3aed;">Experimentar Agora</a>
      </p>
    </div>
    <div class="footer">
      <p>Plantao ECG - Treinamento em interpretacao de ECG</p>
      <p><a href="{{unsubscribeUrl}}" style="color: #a1a1aa;">Cancelar inscricao</a></p>
    </div>
  </div>
</body>
</html>`

export const day7Template = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header" style="background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%);">
      <img src="${logoUrl}" alt="Plantao ECG" width="160" />
    </div>
    <div class="content">
      <div style="text-align: center; margin-bottom: 24px;">
        <span class="badge" style="background: #dbeafe; color: #1e40af;">PRIMEIRA SEMANA</span>
      </div>
      <h1 style="text-align: center;">Sua Primeira Semana!</h1>
      <p style="text-align: center;">Parabens, {{userName}}! Voce completou sua primeira semana no Plantao ECG.</p>
      <div style="display: flex; flex-wrap: wrap; gap: 12px; margin: 32px 0;">
        <div class="stat-box" style="flex: 1; min-width: 120px;">
          <p class="stat-value" style="color: #1e40af;">{{ecgsCompleted}}</p>
          <p class="stat-label">ECGs</p>
        </div>
        <div class="stat-box" style="flex: 1; min-width: 120px;">
          <p class="stat-value" style="color: #7c3aed;">{{xpEarned}}</p>
          <p class="stat-label">XP Ganhos</p>
        </div>
        <div class="stat-box" style="flex: 1; min-width: 120px;">
          <p class="stat-value" style="color: #059669;">{{perfectScores}}</p>
          <p class="stat-label">Perfeitos</p>
        </div>
        <div class="stat-box" style="flex: 1; min-width: 120px;">
          <p class="stat-value" style="color: #ea580c;">{{streak}}</p>
          <p class="stat-label">Streak</p>
        </div>
      </div>
      <p style="text-align: center; margin-top: 32px;">
        <a href="{{siteUrl}}/progress" class="button" style="background: #2563eb;">Ver Progresso Completo</a>
      </p>
    </div>
    <div class="footer">
      <p>Plantao ECG - Treinamento em interpretacao de ECG</p>
      <p><a href="{{unsubscribeUrl}}" style="color: #a1a1aa;">Cancelar inscricao</a></p>
    </div>
  </div>
</body>
</html>`

// ============================================
// ENGAGEMENT EMAILS
// ============================================

export const streakStarterTemplate = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header" style="background: linear-gradient(135deg, #ea580c 0%, #f97316 100%);">
      <img src="${logoUrl}" alt="Plantao ECG" width="160" />
    </div>
    <div class="content">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 48px;">🔥</span>
      </div>
      <h1 style="text-align: center;">Hora de Recomecar!</h1>
      <p style="text-align: center;">Ola, {{userName}}! Sentimos sua falta.</p>
      <div style="background: #fff7ed; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
        <p style="color: #ea580c; margin: 0 0 8px;">Seu recorde de streak foi:</p>
        <p style="font-size: 48px; font-weight: 800; color: #c2410c; margin: 0;">{{longestStreak}} dias</p>
      </div>
      <p style="text-align: center;">
        Voce consegue superar esse recorde! Comece um novo streak hoje.
      </p>
      <p style="text-align: center; margin-top: 32px;">
        <a href="{{siteUrl}}/practice" class="button" style="background: #ea580c;">Comecar Novo Streak</a>
      </p>
    </div>
    <div class="footer">
      <p>Plantao ECG - Treinamento em interpretacao de ECG</p>
      <p><a href="{{unsubscribeUrl}}" style="color: #a1a1aa;">Cancelar inscricao</a></p>
    </div>
  </div>
</body>
</html>`

export const streakAtRiskTemplate = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header" style="background: #dc2626;">
      <img src="${logoUrl}" alt="Plantao ECG" width="160" />
    </div>
    <div style="background: #fef2f2; padding: 12px; text-align: center; border-bottom: 2px solid #fecaca;">
      <span style="color: #dc2626; font-size: 14px; font-weight: 700; letter-spacing: 2px;">⚠️ STREAK EM RISCO ⚠️</span>
    </div>
    <div class="content">
      <div style="text-align: center;">
        <p style="font-size: 72px; font-weight: 800; color: #dc2626; margin: 0; line-height: 1;">{{streak}}</p>
        <p style="color: #f87171; font-size: 16px; font-weight: 600; margin: 4px 0 24px;">dias de streak</p>
      </div>
      <h1 style="text-align: center;">Nao Deixe Acabar!</h1>
      <p style="text-align: center;">
        {{userName}}, seu streak de <strong>{{streak}} dias</strong> termina em aproximadamente <strong>{{hoursRemaining}} horas</strong>.
      </p>
      <div style="background: #fef2f2; border-radius: 12px; padding: 20px; margin: 24px 0;">
        <p style="color: #dc2626; font-weight: 600; margin: 0 0 8px;">Se o streak zerar, voce perde:</p>
        <ul style="color: #991b1b; margin: 0; padding-left: 20px;">
          <li>Bonus de XP por {{streak}} dias consecutivos</li>
          <li>Progresso para conquistas de streak</li>
          <li>Todo o momentum que voce construiu</li>
        </ul>
      </div>
      <div style="background: #fef3c7; border-radius: 8px; padding: 16px; margin: 24px 0;">
        <p style="color: #92400e; font-weight: 600; margin: 0 0 4px;">💡 Dica rapida:</p>
        <p style="color: #a16207; margin: 0;">Basta completar 1 ECG para manter o streak. Leva menos de 5 minutos!</p>
      </div>
      <p style="text-align: center; margin-top: 32px;">
        <a href="{{siteUrl}}/practice" class="button" style="background: #dc2626;">Praticar Agora e Manter Streak</a>
      </p>
    </div>
    <div class="footer">
      <p>Plantao ECG - Treinamento em interpretacao de ECG</p>
      <p><a href="{{unsubscribeUrl}}" style="color: #a1a1aa;">Cancelar inscricao</a></p>
    </div>
  </div>
</body>
</html>`

export const streakMilestoneTemplate = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header" style="background: linear-gradient(135deg, #ea580c 0%, #f97316 100%);">
      <img src="${logoUrl}" alt="Plantao ECG" width="160" />
    </div>
    <div class="content" style="background: linear-gradient(180deg, #fff7ed 0%, #ffffff 100%);">
      <div style="text-align: center;">
        <span style="font-size: 48px;">🔥</span>
        <p style="font-size: 72px; font-weight: 800; color: #ea580c; margin: 8px 0 0; line-height: 1;">{{streak}}</p>
        <p style="color: #fb923c; font-size: 14px; font-weight: 700; letter-spacing: 2px; margin: 4px 0 24px;">DIAS DE STREAK</p>
      </div>
      <h1 style="text-align: center;">Incrivel, {{userName}}!</h1>
      <p style="text-align: center;">
        Voce esta entre os usuarios mais dedicados do Plantao ECG. Sua consistencia e inspiradora!
      </p>
      <div style="background: #fef3c7; border: 2px solid #fcd34d; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
        <p style="color: #92400e; font-size: 14px; margin: 0 0 4px;">Bonus de XP desbloqueado:</p>
        <p style="color: #b45309; font-size: 28px; font-weight: 800; margin: 0;">+{{xpBonus}} XP</p>
      </div>
      <p style="text-align: center; color: #71717a;">
        Proximo marco: <strong>{{nextMilestone}} dias</strong> (faltam {{daysToNextMilestone}} dias)
      </p>
      <p style="text-align: center; margin-top: 32px;">
        <a href="{{siteUrl}}/progress" class="button" style="background: #ea580c;">Ver Conquistas</a>
      </p>
    </div>
    <div class="footer">
      <p style="font-style: italic; color: #9ca3af;">"A excelencia nao e um ato, mas um habito." - Aristoteles</p>
      <p>Plantao ECG - Treinamento em interpretacao de ECG</p>
      <p><a href="{{unsubscribeUrl}}" style="color: #a1a1aa;">Cancelar inscricao</a></p>
    </div>
  </div>
</body>
</html>`

export const levelUpTemplate = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header" style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);">
      <img src="${logoUrl}" alt="Plantao ECG" width="160" />
    </div>
    <div class="content">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 48px;">⭐</span>
      </div>
      <h1 style="text-align: center;">Level Up!</h1>
      <div style="text-align: center; margin: 24px 0;">
        <span style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; font-size: 64px; font-weight: 800; width: 120px; height: 120px; line-height: 120px; border-radius: 50%;">{{level}}</span>
      </div>
      <p style="text-align: center; font-size: 18px;">
        Parabens, {{userName}}! Voce subiu do nivel {{previousLevel}} para o nivel <strong>{{level}}</strong>!
      </p>
      <div style="display: flex; gap: 16px; margin: 32px 0;">
        <div class="stat-box" style="flex: 1;">
          <p class="stat-value" style="color: #7c3aed;">{{totalXp}}</p>
          <p class="stat-label">XP Total</p>
        </div>
        <div class="stat-box" style="flex: 1;">
          <p class="stat-value" style="color: #059669;">{{totalEcgs}}</p>
          <p class="stat-label">ECGs</p>
        </div>
      </div>
      <div style="background: #faf5ff; border-radius: 12px; padding: 16px; margin: 24px 0;">
        <p style="color: #7c3aed; margin: 0; text-align: center;">
          Proximo nivel: <strong>{{xpToNextLevel}} XP</strong> restantes
        </p>
        <div style="background: #e9d5ff; border-radius: 8px; height: 8px; margin-top: 12px; overflow: hidden;">
          <div style="background: #7c3aed; height: 100%; width: {{percentToNextLevel}}%;"></div>
        </div>
      </div>
      <p style="text-align: center; margin-top: 32px;">
        <a href="{{siteUrl}}/progress" class="button" style="background: #7c3aed;">Ver Meu Progresso</a>
      </p>
    </div>
    <div class="footer">
      <p>Plantao ECG - Treinamento em interpretacao de ECG</p>
      <p><a href="{{unsubscribeUrl}}" style="color: #a1a1aa;">Cancelar inscricao</a></p>
    </div>
  </div>
</body>
</html>`

export const achievementTemplate = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header" style="background: linear-gradient(135deg, #eab308 0%, #f59e0b 100%);">
      <img src="${logoUrl}" alt="Plantao ECG" width="160" />
    </div>
    <div class="content">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 64px;">🏆</span>
      </div>
      <div style="text-align: center; margin-bottom: 16px;">
        <span class="badge" style="background: #fef3c7; color: #b45309;">CONQUISTA DESBLOQUEADA</span>
      </div>
      <h1 style="text-align: center;">{{achievementName}}</h1>
      <p style="text-align: center; color: #71717a;">{{achievementDescription}}</p>
      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #fcd34d; border-radius: 16px; padding: 24px; margin: 32px 0; text-align: center;">
        <p style="color: #92400e; margin: 0 0 8px;">Raridade: <strong>{{rarityLabel}}</strong></p>
        <p style="color: #b45309; font-size: 32px; font-weight: 800; margin: 0;">+{{xpReward}} XP</p>
      </div>
      <p style="text-align: center; color: #71717a;">
        Voce tem <strong>{{totalAchievements}}</strong> de <strong>{{achievementsCount}}</strong> conquistas
      </p>
      <p style="text-align: center; margin-top: 32px;">
        <a href="{{siteUrl}}/progress" class="button" style="background: #eab308;">Ver Todas as Conquistas</a>
      </p>
    </div>
    <div class="footer">
      <p>Plantao ECG - Treinamento em interpretacao de ECG</p>
      <p><a href="{{unsubscribeUrl}}" style="color: #a1a1aa;">Cancelar inscricao</a></p>
    </div>
  </div>
</body>
</html>`

export const weeklyDigestTemplate = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header" style="background: #1e40af;">
      <img src="${logoUrl}" alt="Plantao ECG" width="160" />
    </div>
    <div class="content">
      <div style="text-align: center; margin-bottom: 24px;">
        <span class="badge" style="background: #dbeafe; color: #1e40af;">RESUMO SEMANAL</span>
      </div>
      <h1 style="text-align: center;">Ola, {{userName}}!</h1>
      <p style="text-align: center;">Confira como foi sua semana no Plantao ECG.</p>

      <div style="background: #eff6ff; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <div style="display: flex; gap: 16px; text-align: center;">
          <div style="flex: 1;">
            <p style="font-size: 40px; font-weight: 800; color: #1e40af; margin: 0;">{{ecgsCompleted}}</p>
            <p style="color: #3b82f6; font-size: 14px; font-weight: 600; text-transform: uppercase; margin: 4px 0;">ECGs</p>
            <p style="font-size: 12px; color: #059669; margin: 0;">{{ecgsDelta}} vs semana anterior</p>
          </div>
          <div style="flex: 1;">
            <p style="font-size: 40px; font-weight: 800; color: #1e40af; margin: 0;">{{xpEarned}}</p>
            <p style="color: #3b82f6; font-size: 14px; font-weight: 600; text-transform: uppercase; margin: 4px 0;">XP Ganhos</p>
            <p style="font-size: 12px; color: #059669; margin: 0;">{{xpDelta}} vs semana anterior</p>
          </div>
        </div>
      </div>

      <div style="display: flex; gap: 12px; margin: 24px 0; text-align: center;">
        <div class="stat-box" style="flex: 1; padding: 16px;">
          <p style="font-size: 20px; font-weight: 700; color: #374151; margin: 0;">{{perfectScores}}</p>
          <p style="font-size: 11px; color: #9ca3af; text-transform: uppercase; margin: 2px 0 0;">Perfeitos</p>
        </div>
        <div class="stat-box" style="flex: 1; padding: 16px;">
          <p style="font-size: 20px; font-weight: 700; color: #374151; margin: 0;">{{averageScore}}%</p>
          <p style="font-size: 11px; color: #9ca3af; text-transform: uppercase; margin: 2px 0 0;">Media</p>
        </div>
        <div class="stat-box" style="flex: 1; padding: 16px;">
          <p style="font-size: 20px; font-weight: 700; color: #374151; margin: 0;">{{activeDays}}/7</p>
          <p style="font-size: 11px; color: #9ca3af; text-transform: uppercase; margin: 2px 0 0;">Dias Ativos</p>
        </div>
        <div class="stat-box" style="flex: 1; padding: 16px;">
          <p style="font-size: 20px; font-weight: 700; color: #374151; margin: 0;">{{streak}}</p>
          <p style="font-size: 11px; color: #9ca3af; text-transform: uppercase; margin: 2px 0 0;">Streak</p>
        </div>
      </div>

      <div style="background: #fef3c7; border-radius: 12px; padding: 16px; margin: 24px 0; text-align: center;">
        <p style="color: #92400e; font-size: 14px; margin: 0 0 4px;">Sua posicao no ranking:</p>
        <p style="color: #b45309; font-size: 24px; font-weight: 800; margin: 0;">#{{rank}}</p>
      </div>

      <div style="text-align: center; margin: 24px 0;">
        <p style="color: #71717a; margin: 0;">Por dificuldade:</p>
        <p style="margin: 8px 0 0;">
          <span style="color: #059669;">Facil: {{easyCount}}</span> •
          <span style="color: #eab308;">Medio: {{mediumCount}}</span> •
          <span style="color: #dc2626;">Dificil: {{hardCount}}</span>
        </p>
      </div>

      <p style="text-align: center; margin-top: 32px;">
        <a href="{{siteUrl}}/practice" class="button" style="background: #2563eb;">Continuar Praticando</a>
      </p>
    </div>
    <div class="footer">
      <p>Plantao ECG - Treinamento em interpretacao de ECG</p>
      <p><a href="{{unsubscribeUrl}}" style="color: #a1a1aa;">Cancelar inscricao</a></p>
    </div>
  </div>
</body>
</html>`

export const monthlyReportTemplate = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header" style="background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%);">
      <img src="${logoUrl}" alt="Plantao ECG" width="160" />
    </div>
    <div class="content">
      <div style="text-align: center; margin-bottom: 24px;">
        <span class="badge" style="background: #dbeafe; color: #1e40af;">RELATORIO MENSAL</span>
      </div>
      <h1 style="text-align: center;">{{monthName}}</h1>
      <p style="text-align: center;">Ola, {{userName}}! Veja seu desempenho neste mes.</p>

      <div style="display: flex; gap: 16px; margin: 32px 0;">
        <div class="stat-box" style="flex: 1;">
          <p class="stat-value" style="color: #1e40af;">{{ecgsCompleted}}</p>
          <p class="stat-label">ECGs</p>
          <p style="font-size: 12px; color: #059669; margin: 4px 0 0;">{{ecgsDelta}} vs mes anterior</p>
        </div>
        <div class="stat-box" style="flex: 1;">
          <p class="stat-value" style="color: #7c3aed;">{{xpEarned}}</p>
          <p class="stat-label">XP Ganhos</p>
          <p style="font-size: 12px; color: #059669; margin: 4px 0 0;">{{xpDelta}} vs mes anterior</p>
        </div>
      </div>

      <div style="background: #faf5ff; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <h2 style="color: #7c3aed; margin: 0 0 16px; font-size: 18px;">Progressao de Nivel</h2>
        <p style="margin: 0; font-size: 24px;">
          <span style="color: #71717a;">Nivel {{levelStart}}</span>
          <span style="margin: 0 12px;">→</span>
          <span style="color: #7c3aed; font-weight: 700;">Nivel {{levelEnd}}</span>
        </p>
        <p style="color: #6b21a8; margin: 8px 0 0;">+{{levelsGained}} niveis ganhos!</p>
      </div>

      <div style="display: flex; gap: 12px; margin: 24px 0; text-align: center;">
        <div class="stat-box" style="flex: 1; padding: 16px;">
          <p style="font-size: 20px; font-weight: 700; color: #374151; margin: 0;">{{perfectScores}}</p>
          <p style="font-size: 11px; color: #9ca3af; text-transform: uppercase; margin: 2px 0 0;">Perfeitos</p>
        </div>
        <div class="stat-box" style="flex: 1; padding: 16px;">
          <p style="font-size: 20px; font-weight: 700; color: #374151; margin: 0;">{{averageScore}}%</p>
          <p style="font-size: 11px; color: #9ca3af; text-transform: uppercase; margin: 2px 0 0;">Media</p>
        </div>
        <div class="stat-box" style="flex: 1; padding: 16px;">
          <p style="font-size: 20px; font-weight: 700; color: #374151; margin: 0;">{{activeDays}}</p>
          <p style="font-size: 11px; color: #9ca3af; text-transform: uppercase; margin: 2px 0 0;">Dias Ativos</p>
        </div>
        <div class="stat-box" style="flex: 1; padding: 16px;">
          <p style="font-size: 20px; font-weight: 700; color: #374151; margin: 0;">{{bestStreak}}</p>
          <p style="font-size: 11px; color: #9ca3af; text-transform: uppercase; margin: 2px 0 0;">Melhor Streak</p>
        </div>
      </div>

      <div style="background: #fef3c7; border-radius: 12px; padding: 16px; margin: 24px 0; text-align: center;">
        <p style="color: #92400e; font-size: 14px; margin: 0 0 4px;">Ranking no fim do mes:</p>
        <p style="color: #b45309; font-size: 24px; font-weight: 800; margin: 0;">#{{rank}} <span style="font-size: 14px; font-weight: 400;">(Top {{percentile}}%)</span></p>
        <p style="font-size: 12px; color: #a16207; margin: 4px 0 0;">{{rankDelta}} posicoes vs mes anterior</p>
      </div>

      <div style="background: #ecfdf5; border-radius: 12px; padding: 16px; margin: 24px 0; text-align: center;">
        <p style="color: #059669; margin: 0;">
          Conquistas desbloqueadas: <strong>{{achievementsEarned}}</strong> (Total: {{totalAchievements}})
        </p>
      </div>

      <p style="text-align: center; margin-top: 32px;">
        <a href="{{siteUrl}}/progress" class="button" style="background: #2563eb;">Ver Progresso Completo</a>
      </p>
    </div>
    <div class="footer">
      <p>Plantao ECG - Treinamento em interpretacao de ECG</p>
      <p><a href="{{unsubscribeUrl}}" style="color: #a1a1aa;">Cancelar inscricao</a></p>
    </div>
  </div>
</body>
</html>`

export const xpEventAnnouncementTemplate = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header" style="background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%);">
      <img src="${logoUrl}" alt="Plantao ECG" width="160" />
    </div>
    <div style="background: linear-gradient(135deg, #faf5ff 0%, #fdf2f8 100%); padding: 12px; text-align: center;">
      <span style="color: #7c3aed; font-size: 14px; font-weight: 700; letter-spacing: 2px;">🎉 EVENTO ESPECIAL 🎉</span>
    </div>
    <div class="content">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 64px;">{{eventType}}</span>
      </div>
      <h1 style="text-align: center; color: #7c3aed;">{{eventTypeLabel}}!</h1>
      <p style="text-align: center; font-size: 18px;">
        {{userName}}, um evento especial esta ativo agora!
      </p>

      <div style="background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%); border-radius: 16px; padding: 32px; margin: 32px 0; text-align: center; color: white;">
        <h2 style="color: white; margin: 0 0 8px;">{{eventName}}</h2>
        <p style="color: rgba(255,255,255,0.9); margin: 0 0 16px;">Todos os seus XP serao multiplicados!</p>
        <p style="font-size: 14px; margin: 0;">
          Termina em: <strong>{{eventEndDate}}</strong>
        </p>
      </div>

      <div style="background: #f4f4f5; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
        <p style="color: #71717a; margin: 0 0 8px;">Seu progresso atual:</p>
        <p style="margin: 0;">
          <strong>Nivel {{currentLevel}}</strong> • {{totalXp}} XP • {{xpToNextLevel}} XP para o proximo nivel
        </p>
      </div>

      <p style="text-align: center; font-weight: 600; color: #7c3aed;">
        Aproveite para acelerar sua evolucao!
      </p>

      <p style="text-align: center; margin-top: 32px;">
        <a href="{{siteUrl}}/practice" class="button" style="background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%);">Praticar Agora com {{eventType}}</a>
      </p>
    </div>
    <div class="footer">
      <p>Plantao ECG - Treinamento em interpretacao de ECG</p>
      <p><a href="{{unsubscribeUrl}}" style="color: #a1a1aa;">Cancelar inscricao</a></p>
    </div>
  </div>
</body>
</html>`

// Export all templates as a map
export const emailTemplates: Record<string, string> = {
  // Account
  welcome: welcomeTemplate,
  subscription_activated: subscriptionActivatedTemplate,
  subscription_canceled: subscriptionCanceledTemplate,
  payment_failed: paymentFailedTemplate,
  password_reset: passwordResetTemplate,
  renewal_reminder: renewalReminderTemplate,
  // Onboarding
  first_case: firstCaseTemplate,
  day2: day2Template,
  day3: day3Template,
  day5: day5Template,
  day7: day7Template,
  // Engagement
  streak_starter: streakStarterTemplate,
  streak_at_risk: streakAtRiskTemplate,
  streak_milestone: streakMilestoneTemplate,
  level_up: levelUpTemplate,
  achievement: achievementTemplate,
  weekly_digest: weeklyDigestTemplate,
  monthly_report: monthlyReportTemplate,
  xp_event_announcement: xpEventAnnouncementTemplate,
}

export default emailTemplates
