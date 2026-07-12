import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { 
  getTriagensByVaga,
  getTriagemResultados,
  getEstatisticasTriagem
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
 * GET /api/triagem/vagas/[vagaId]
 * Retorna histórico de triagens e estatísticas de uma vaga
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ vagaId: string }> }
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

    // 2. Pegar ID da vaga
    const { vagaId } = await params

    if (!vagaId) {
      return NextResponse.json(
        { success: false, error: 'ID da vaga é obrigatório' },
        { status: 400 }
      )
    }

    // 3. Buscar triagens da vaga
    const triagens = await getTriagensByVaga(vagaId)

    // 4. Verificar se o usuário é dono (pela primeira triagem ou consulta separada)
    // Nota: Em produção, verificar diretamente na tabela vagas
    if (triagens.length > 0 && triagens[0].empregador_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // 5. Buscar estatísticas
    const estatisticas = await getEstatisticasTriagem(vagaId)

    // 6. Buscar resultados da última triagem concluída
    let ultimosResultados = null
    const ultimaTriagemConcluida = triagens.find(t => t.status === 'concluida')
    
    if (ultimaTriagemConcluida) {
      ultimosResultados = await getTriagemResultados(ultimaTriagemConcluida.id)
    }

    // 7. Retornar dados
    return NextResponse.json({
      success: true,
      data: {
        triagens: triagens.map(t => ({
          id: t.id,
          status: t.status,
          total_candidatos: t.total_candidatos,
          candidatos_aprovados: t.candidatos_aprovados,
          candidatos_rejeitados: t.candidatos_rejeitados,
          modelo_usado: t.modelo_usado,
          iniciada_em: t.iniciada_em,
          concluida_em: t.concluida_em,
          erro_mensagem: t.erro_mensagem
        })),
        estatisticas,
        ultima_triagem: ultimaTriagemConcluida ? {
          id: ultimaTriagemConcluida.id,
          concluida_em: ultimaTriagemConcluida.concluida_em,
          resultados: ultimosResultados?.map(r => ({
            candidatura_id: r.candidatura_id,
            nota: r.nota,
            classificacao: r.classificacao,
            recomendacao: r.recomendacao
          }))
        } : null
      }
    })

  } catch (error) {
    console.error('Erro ao buscar triagens da vaga:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}