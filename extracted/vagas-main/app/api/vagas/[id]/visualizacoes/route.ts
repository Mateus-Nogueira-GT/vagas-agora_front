import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { visualizadorHash } = await request.json()

    if (!visualizadorHash) {
      return NextResponse.json(
        { error: 'Hash do visualizador é obrigatório' },
        { status: 400 }
      )
    }

    // Tentar inserir a visualização
    // Se já existir (constraint unique), será ignorado pelo banco
    const { error } = await supabase
      .from('vaga_visualizacoes')
      .insert({
        vaga_id: id,
        visualizador_hash: visualizadorHash
      })

    // Ignorar erro de duplicação (já visualizou antes)
    if (error && !error.message.includes('duplicate')) {
      console.error('Erro ao registrar visualização:', error)
      return NextResponse.json(
        { error: 'Erro ao registrar visualização' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao registrar visualização:', error)
    return NextResponse.json(
      { error: 'Erro interno ao registrar visualização' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Buscar contador otimizado direto da tabela vagas (muito mais rápido!)
    const { data, error } = await supabase
      .from('vagas')
      .select('visualizacoes_count')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Erro ao obter visualizações:', error)
      return NextResponse.json({ total: 0 })
    }

    return NextResponse.json({ total: data?.visualizacoes_count || 0 })
  } catch (error) {
    console.error('Erro ao obter visualizações:', error)
    return NextResponse.json({ total: 0 })
  }
}
