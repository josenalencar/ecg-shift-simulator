import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return new NextResponse(generateHTML('Erro', 'Token invalido ou ausente.', false), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      status: 400,
    })
  }

  try {
    const supabase = createServiceRoleClient()

    // Find user by unsubscribe token
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profileData, error: findError } = await (supabase as any)
      .from('profiles')
      .select('id, email, email_notifications_enabled')
      .eq('unsubscribe_token', token)
      .single()

    const profile = profileData as { id: string; email: string; email_notifications_enabled?: boolean } | null

    if (findError || !profile) {
      return new NextResponse(
        generateHTML('Token Invalido', 'O link de cancelamento e invalido ou expirou.', false),
        {
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
          status: 400,
        }
      )
    }

    // Check if already unsubscribed
    if (profile.email_notifications_enabled === false) {
      return new NextResponse(
        generateHTML('Ja Cancelado', 'Voce ja cancelou a inscricao anteriormente.', true),
        {
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        }
      )
    }

    // Update user preferences
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
      .from('profiles')
      .update({ email_notifications_enabled: false })
      .eq('id', profile.id)

    if (updateError) {
      console.error('[Unsubscribe] Failed to update preferences:', updateError)
      return new NextResponse(
        generateHTML('Erro', 'Nao foi possivel processar sua solicitacao. Tente novamente.', false),
        {
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
          status: 500,
        }
      )
    }

    return new NextResponse(
      generateHTML(
        'Inscricao Cancelada',
        'Voce nao recebera mais emails de notificacao do Plantao ECG.',
        true
      ),
      {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }
    )
  } catch (error) {
    console.error('[Unsubscribe] Error:', error)
    return new NextResponse(
      generateHTML('Erro', 'Ocorreu um erro inesperado. Tente novamente.', false),
      {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
        status: 500,
      }
    )
  }
}

function generateHTML(title: string, message: string, success: boolean): string {
  const bgColor = success ? '#ecfdf5' : '#fef2f2'
  const textColor = success ? '#065f46' : '#991b1b'
  const iconColor = success ? '#10b981' : '#ef4444'
  const icon = success
    ? '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
    : '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>'

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Plantao ECG</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
      background-color: #f4f4f5;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 12px;
      padding: 48px;
      max-width: 480px;
      width: 100%;
      text-align: center;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }
    .icon-container {
      background-color: ${bgColor};
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      color: ${iconColor};
    }
    h1 {
      color: ${textColor};
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 16px;
    }
    p {
      color: #52525b;
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 32px;
    }
    .logo {
      color: #1e40af;
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .footer {
      color: #a1a1aa;
      font-size: 13px;
    }
    .footer a {
      color: #71717a;
      text-decoration: none;
    }
    .footer a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon-container">
      ${icon}
    </div>
    <h1>${title}</h1>
    <p>${message}</p>
    <div class="logo">Plantao ECG</div>
    <div class="footer">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://plantaoecg.com.br'}">Voltar ao site</a>
    </div>
  </div>
</body>
</html>
`
}
