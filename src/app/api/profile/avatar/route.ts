import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isValidAvatarId } from '@/lib/avatars'

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { avatar } = body

    // Validate avatar ID
    if (!avatar || typeof avatar !== 'string') {
      return NextResponse.json(
        { error: 'Avatar inválido' },
        { status: 400 }
      )
    }

    if (!isValidAvatarId(avatar)) {
      return NextResponse.json(
        { error: 'Avatar não encontrado' },
        { status: 400 }
      )
    }

    // Update profile with new avatar
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase.from('profiles') as any)
      .update({ avatar, updated_at: new Date().toISOString() })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating avatar:', updateError)
      return NextResponse.json(
        { error: 'Falha ao salvar avatar' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, avatar })
  } catch (error) {
    console.error('Avatar API error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
