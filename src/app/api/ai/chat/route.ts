import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { AIChatRequest, AIChatResponse } from '@/lib/ai/types'

export async function POST(request: Request) {
  try {
    // Validate user is authenticated and has premium access
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Nao autorizado' } as AIChatResponse,
        { status: 401 }
      )
    }

    // Check premium status
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('granted_plan')
      .eq('id', user.id)
      .single()

    const grantedPlan = profile?.granted_plan as string | null
    const hasPremium = grantedPlan === 'ai' ||
                       grantedPlan === 'aluno_ecg' ||
                       grantedPlan === 'premium'

    // Also check for paid subscription if no granted plan
    if (!hasPremium) {
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('status, plan')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      if (!subscription) {
        return NextResponse.json(
          { error: 'Acesso premium necessario' } as AIChatResponse,
          { status: 403 }
        )
      }
    }

    // Parse request body
    const body: AIChatRequest = await request.json()
    const { message, context, history } = body

    // Validate required fields
    if (!message || !context) {
      return NextResponse.json(
        { error: 'Dados incompletos' } as AIChatResponse,
        { status: 400 }
      )
    }

    // TODO: Implement actual AI integration when API key is available
    // For now, return 501 Not Implemented
    //
    // Future implementation will:
    // 1. Build system prompt with context (user report, official report, scoring)
    // 2. Restrict AI to only discuss this specific ECG report
    // 3. Recommend studying materials (Curso ECG, Tratado de ECG)
    // 4. Call OpenAI GPT-4o-mini API
    // 5. Return streamed or full response

    // Log for debugging (remove in production)
    console.log('AI Chat request:', {
      userId: user.id,
      ecgId: context.ecgId,
      messageLength: message.length,
      historyLength: history.length
    })

    return NextResponse.json(
      { error: 'A ECG-IA estara disponivel em breve' } as AIChatResponse,
      { status: 501 }
    )
  } catch (error) {
    console.error('AI Chat error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' } as AIChatResponse,
      { status: 500 }
    )
  }
}
