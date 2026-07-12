import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { 
  getTriagemById,
  getTriagemResultados
} from '@/lib/api/triagem-api'

// Helper para criar cliente Supabase server-side
async function getSupabaseUser() {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  return user
}

/**
 * GET /api/triagem/status/[id]
 * Retorna o status de uma triagem específica
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Verificar autenticação
    const user = await getSupabaseUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // 2. Pegar ID da triagem
    const { id: triagemId } = await params

    if (!triagemId) {
      return NextResponse.json(
        { success: false, error: 'ID da triagem é obrigatório' },
        { status: 400 }
      )
    }

    // 3. Buscar triagem
    const triagem = await getTriagemById(triagemId)

    if (!triagem) {
      return NextResponse.json(
        { success: false, error: 'Triagem não encontrada' },
        { status: 404 }
      )
    }

    // 4. Verificar se pertence ao usuário
    if (triagem.empregador_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // 5. Se concluída, buscar resultados
    let resultados = null
    if (triagem.status === 'concluida') {
      resultados = await getTriagemResultados(triagemId)
    }

    // 6. Retornar dados
    return NextResponse.json({
      success: true,
      data: {
        triagem: {
          id: triagem.id,
          vaga_id: triagem.vaga_id,
          status: triagem.status,
          total_candidatos: triagem.total_candidatos,
          candidatos_processados: triagem.candidatos_processados,
          candidatos_aprovados: triagem.candidatos_aprovados,
          candidatos_rejeitados: triagem.candidatos_rejeitados,
          modelo_usado: triagem.modelo_usado,
          iniciada_em: triagem.iniciada_em,
          concluida_em: triagem.concluida_em,
          erro_mensagem: triagem.erro_mensagem
        },
        resultados: resultados?.map(r => ({
          candidatura_id: r.candidatura_id,
          candidato_id: r.candidato_id,
          nota: r.nota,
          classificacao: r.classificacao,
          resumo: r.resumo,
          pontos_fortes: r.pontos_fortes,
          pontos_fracos: r.pontos_fracos,
          recomendacao: r.recomendacao
        }))
      }
    })

  } catch (error) {
    console.error('Erro ao buscar status da triagem:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}