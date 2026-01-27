import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'contato@plantaoecg.com.br'
const FROM_EMAIL = process.env.EMAIL_FROM || 'onboarding@resend.dev'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, message, type = 'contact' } = body

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Nome, email e mensagem são obrigatórios' },
        { status: 400 }
      )
    }

    const typeConfig: Record<string, { prefix: string; title: string; formName: string }> = {
      contact: { prefix: '[Contato]', title: 'Nova mensagem de contato', formName: 'contato' },
      parceria: { prefix: '[Parceria]', title: 'Nova proposta de parceria', formName: 'parcerias' },
      suporte: { prefix: '[Suporte]', title: 'Nova solicitação de suporte', formName: 'suporte' },
    }
    const config = typeConfig[type] || typeConfig.contact
    const { prefix: subjectPrefix, title: emailTitle, formName } = config

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    // Send email to admin
    const { error } = await resend.emails.send({
      from: `Plantão ECG <${FROM_EMAIL}>`,
      to: CONTACT_EMAIL,
      replyTo: email,
      subject: `${subjectPrefix} Mensagem de ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937;">${emailTitle}</h2>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Nome:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          </div>
          <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <p><strong>Mensagem:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
            Enviado através do formulário de ${formName} do Plantão ECG
          </p>
        </div>
      `,
    })

    if (error) {
      console.error('[Contact] Failed to send email:', error)
      return NextResponse.json(
        { error: 'Falha ao enviar mensagem. Tente novamente.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Contact] API error:', error)
    return NextResponse.json(
      { error: 'Erro interno. Tente novamente.' },
      { status: 500 }
    )
  }
}
