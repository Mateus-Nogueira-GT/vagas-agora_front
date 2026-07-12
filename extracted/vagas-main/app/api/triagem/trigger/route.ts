import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { 
  getTriagemConfig,
  createTriagem,
  updateTriagemStatus,
  getCandidaturasParaTriagem,
  getVagaParaTriagem,
  existeTriagemEmAndamento
} from '@/lib/api/triagem-api'
import { decrypt, generateWebhookSecret } from '@/lib/triagem/crypto-utils'
import { N8NTriagemPayload } from '@/lib/triagem/triagem-types'

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
 * POST /api/triagem/trigger
 * Inicia uma nova triagem para uma vaga
 * Body: { vaga_id: string }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verificar autenticação
    const user = await getSupabaseUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // 2. Ler body
    const body = await request.json()
    const { vaga_id } = body

    if (!vaga_id) {
      return NextResponse.json(
        { success: false, error: 'vaga_id é obrigatório' },
        { status: 400 }
      )
    }

    // 3. Verificar se a feature está habilitada
    if (process.env.NEXT_PUBLIC_TRIAGEM_ENABLED !== 'true') {
      return NextResponse.json(
        { success: false, error: 'Triagem por IA não está habilitada' },
        { status: 403 }
      )
    }

    // 4. Buscar configuração do empregador
    const config = await getTriagemConfig(user.id)

    if (!config) {
      return NextResponse.json(
        { success: false, error: 'Configure a triagem IA nas configurações primeiro' },
        { status: 400 }
      )
    }

    if (!config.triagem_habilitada) {
      return NextResponse.json(
        { success: false, error: 'Triagem IA está desabilitada nas configurações' },
        { status: 400 }
      )
    }

    if (!config.openrouter_api_key_encrypted) {
      return NextResponse.json(
        { success: false, error: 'Chave OpenRouter não configurada' },
        { status: 400 }
      )
    }

    // 5. Verificar se já existe triagem em andamento
    const emAndamento = await existeTriagemEmAndamento(vaga_id)
    
    if (emAndamento) {
      return NextResponse.json(
        { success: false, error: 'Já existe uma triagem em andamento para esta vaga' },
        { status: 409 }
      )
    }

    // 6. Buscar dados da vaga
    const vaga = await getVagaParaTriagem(vaga_id)
    
    if (!vaga) {
      return NextResponse.json(
        { success: false, error: 'Vaga não encontrada' },
        { status: 404 }
      )
    }

    // 7. Buscar candidaturas para triagem
    const candidaturas = await getCandidaturasParaTriagem(vaga_id)

    if (!candidaturas || candidaturas.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Não há candidaturas pendentes para triagem' },
        { status: 400 }
      )
    }

    // 8. Limitar quantidade de candidatos
    const maxCandidatos = config.max_candidatos_por_triagem || 50
    const candidaturasParaProcessar = candidaturas.slice(0, maxCandidatos)

    // 9. Criar registro de triagem
    const webhookSecret = generateWebhookSecret()
    
    const triagem = await createTriagem({
      vaga_id,
      empregador_id: user.id,
      status: 'pendente',
      total_candidatos: candidaturasParaProcessar.length,
      candidatos_processados: 0,
      candidatos_aprovados: 0,
      candidatos_rejeitados: 0,
      modelo_usado: config.modelo_ia
    })

    // 10. Montar payload para N8N
    const openrouterKey = decrypt(config.openrouter_api_key_encrypted)
    
    const payload: N8NTriagemPayload = {
      triagem_id: triagem.id,
      vaga: {
        id: vaga.id,
        titulo: vaga.titulo,
        descricao: vaga.descricao || undefined,
        requisitos: vaga.requisitos || [],
        responsabilidades: vaga.responsabilidades || [],
        diferenciais: vaga.diferenciais || [],
        nivel: vaga.nivel || undefined,
        modelo_trabalho: vaga.modelo_trabalho || undefined,
        salario_de: vaga.salario_de || undefined,
        salario_ate: vaga.salario_ate || undefined
      },
      candidatos: candidaturasParaProcessar.map((c: any) => ({
        candidatura_id: c.id,
        candidato_id: c.candidato_id,
        nome_completo: c.candidatos?.nome_completo || 'Não informado',
        titulo_profissional: c.candidatos?.titulo_profissional,
        anos_experiencia: c.candidatos?.anos_experiencia,
        habilidades_tecnicas: c.candidatos?.habilidades_tecnicas || [],
        formacao: c.candidatos?.formacao_academica || [],
        experiencias: c.candidatos?.experiencia_profissional || [],
        carta_apresentacao: c.carta_apresentacao,
        cidade: c.candidatos?.cidade,
        estado: c.candidatos?.estado
      })),
      openrouter_api_key: openrouterKey,
      modelo_ia: config.modelo_ia,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://vagas-jet.vercel.app'}/api/webhooks/n8n`,
      webhook_secret: webhookSecret
    }

    // 11. Enviar para N8N
    const n8nUrl = process.env.N8N_TRIAGEM_WEBHOOK_URL

    if (!n8nUrl) {
      // Se N8N não configurado, marcar como erro
      await updateTriagemStatus(triagem.id, 'erro', {
        erro_mensagem: 'N8N_TRIAGEM_WEBHOOK_URL não configurado'
      })
      
      return NextResponse.json(
        { success: false, error: 'Serviço de triagem não configurado' },
        { status: 500 }
      )
    }

    try {
      const n8nResponse = await fetch(n8nUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!n8nResponse.ok) {
        throw new Error(`N8N retornou status ${n8nResponse.status}`)
      }

      // 12. Atualizar status para processando
      await updateTriagemStatus(triagem.id, 'processando', {
        iniciada_em: new Date().toISOString()
      })

      // 13. Salvar webhook_secret na config (para validar callback)
      // Nota: Em produção, salvar em tabela separada ou na própria triagem
      
      return NextResponse.json({
        success: true,
        data: {
          triagem_id: triagem.id,
          total_candidatos: candidaturasParaProcessar.length,
          status: 'processando',
          mensagem: `Triagem iniciada para ${candidaturasParaProcessar.length} candidato(s)`
        }
      })

    } catch (n8nError) {
      console.error('Erro ao chamar N8N:', n8nError)
      
      // Marcar triagem como erro
      await updateTriagemStatus(triagem.id, 'erro', {
        erro_mensagem: 'Falha ao conectar com serviço de triagem'
      })

      return NextResponse.json(
        { success: false, error: 'Falha ao iniciar triagem. Tente novamente.' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Erro ao iniciar triagem:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}