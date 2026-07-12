import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth/api-auth'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// GET - Buscar configurações de suporte (público)
export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const { data, error } = await supabase
      .from('support_settings')
      .select('*')
      .limit(1)

    if (error) {
      console.error('Erro ao buscar configurações de suporte:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar configurações de suporte', details: error.message },
        { status: 500 }
      )
    }

    // Se não houver dados, retornar valores padrão
    if (!data || data.length === 0) {
      return NextResponse.json({
        email_suporte: 'suporte@vagas.com',
        whatsapp_suporte: '5500000000000'
      })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error('Erro inesperado:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar configurações de suporte (apenas admin)
export async function PUT(request: NextRequest) {
  try {
    // 1. Verificar autenticação
    const auth = await verifyAuth()

    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error },
        { status: 401 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // 2. Verificar se é admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', auth.user?.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem atualizar essas configurações.' },
        { status: 403 }
      )
    }

    // 3. Continuar com a lógica original
    const body = await request.json()
    const { email_suporte, whatsapp_suporte } = body

    if (!email_suporte || !whatsapp_suporte) {
      return NextResponse.json(
        { error: 'Email e WhatsApp são obrigatórios' },
        { status: 400 }
      )
    }

    // Sempre atualizar o registro fixo com ID conhecido
    const FIXED_ID = '00000000-0000-0000-0000-000000000001'

    const { data, error } = await supabase
      .from('support_settings')
      .update({
        email_suporte,
        whatsapp_suporte,
        updated_at: new Date().toISOString()
      })
      .eq('id', FIXED_ID)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar configurações:', error)
      return NextResponse.json(
        { error: 'Erro ao atualizar configurações de suporte', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro inesperado:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
