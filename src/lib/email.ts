import { Resend } from 'resend'
import WelcomeEmail from '@/emails/welcome'
import SubscriptionActivatedEmail from '@/emails/subscription-activated'
import SubscriptionCanceledEmail from '@/emails/subscription-canceled'
import PaymentFailedEmail from '@/emails/payment-failed'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.EMAIL_FROM || 'onboarding@resend.dev'
const FROM_NAME = 'Plantao ECG'

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: 'Bem-vindo ao Plantao ECG!',
      react: WelcomeEmail({ name }),
    })

    if (error) {
      console.error('Failed to send welcome email:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Failed to send welcome email:', error)
    return { success: false, error }
  }
}

export async function sendSubscriptionActivatedEmail(
  email: string,
  name: string,
  plan: string
) {
  try {
    const planDisplay = plan === 'ai' ? 'Premium + IA' : 'Premium'
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: `Sua assinatura ${planDisplay} esta ativa!`,
      react: SubscriptionActivatedEmail({ name, plan }),
    })

    if (error) {
      console.error('Failed to send subscription activated email:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Failed to send subscription activated email:', error)
    return { success: false, error }
  }
}

export async function sendSubscriptionCanceledEmail(
  email: string,
  name: string,
  endDate: string
) {
  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: 'Sua assinatura do Plantao ECG foi cancelada',
      react: SubscriptionCanceledEmail({ name, endDate }),
    })

    if (error) {
      console.error('Failed to send subscription canceled email:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Failed to send subscription canceled email:', error)
    return { success: false, error }
  }
}

export async function sendPaymentFailedEmail(email: string, name: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: 'Acao necessaria: Seu pagamento falhou',
      react: PaymentFailedEmail({ name }),
    })

    if (error) {
      console.error('Failed to send payment failed email:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Failed to send payment failed email:', error)
    return { success: false, error }
  }
}
