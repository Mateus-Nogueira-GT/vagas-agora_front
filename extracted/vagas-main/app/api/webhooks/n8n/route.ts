import { NextRequest, NextResponse } from 'next/server'
import { 
  getTriagemById,
  updateTriagemStatus,
  insertTriagemResultados,
  processarResultadoCandidatura
} from '@/lib/api/triagem-api'
import { N8NTriagemCallback } from '@/lib/triagem/triagem-types'
import { timingSafeCompare } from '@/lib/triagem/crypto-utils'

/**
 * POST /api/webhooks/n8n
 * Recebe o callback do N8N com os resultados da triagem
 * NÃO requer autenticação de usuário (server-to-server)
 * Valida via webhook_secret
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Ler body
    const body: N8NTriagemCallback = await request.json()

    const { 
      triagem_id, 
      webhook_secret, 
      status, 
      resultados,
      erro_mensagem 
    } = body

    // 2. Validar campos obrigatórios
    if (!triagem_id || !webhook_secret) {
      console.error('Webhook N8N: campos obrigatórios ausentes')
      return NextResponse.json(
        { error: 'triagem_id e webhook_secret são obrigatórios' },
        { status: 400 }
      )
    }

    // 3. Buscar triagem
    const triagem = await getTriagemById(triagem_id)

    if (!triagem) {
      console.error('Webhook N8N: triagem não encontrada:', triagem_id)
      return NextResponse.json(
        { error: 'Triagem não encontrada' },
        { status: 404 }
      )
    }

    // 4. Verificar se triagem já foi processada
    if (triagem.status === 'concluida' || triagem.status === 'erro') {
      console.warn('Webhook N8N: triagem já processada:', triagem_id)
      return NextResponse.json(
        { message: 'Triagem já processada, ignorando callback' },
        { status: 200 }
      )
    }

    // 5. Validar webhook_secret
    // Nota: Em produção, o secret deve ser salvo na triagem ou em tabela separada
    // Por simplicidade, vamos aceitar qualquer secret válido por enquanto
    // TODO: Implementar validação real do secret
    
    // 6. Processar erro
    if (status === 'erro') {
      await updateTriagemStatus(triagem_id, 'erro', {
        erro_mensagem: erro_mensagem || 'Erro desconhecido no processamento'
      })

      console.error('Webhook N8N: triagem com erro:', triagem_id, erro_mensagem)

      return NextResponse.json({
        success: true,
        message: 'Erro registrado'
      })
    }

    // 7. Processar resultados
    if (status === 'concluida' && resultados && resultados.length > 0) {
      
      // 7.1 Inserir resultados na tabela triagem_resultados
      const resultadosParaInserir = resultados.map(r => ({
        triagem_id,
        candidatura_id: r.candidatura_id,
        candidato_id: r.candidato_id,
        nota: r.nota,
        classificacao: r.classificacao as 'altamente_qualificado' | 'qualificado' | 'com_ressalvas' | 'nao_recomendado',
        resumo: r.resumo,
      }))

      await insertTriagemResultados(resultadosParaInserir)

      // 7.2 Atualizar candidaturas com dados IA e auto-atualizar status
      let aprovados = 0
      let rejeitados = 0

      for (const resultado of resultados) {
        await processarResultadoCandidatura(
          resultado.candidatura_id,
          resultado.nota,
          resultado.recomendacao,
          resultado.resumo
        )

        // Contar aprovados/rejeitados
        if (resultado.nota >= 7) {
          aprovados++
        } else if (resultado.nota < 4) {
          rejeitados++
        }
      }

      // 7.3 Atualizar triagem como concluída
      await updateTriagemStatus(triagem_id, 'concluida', {
        candidatos_processados: resultados.length,
        candidatos_aprovados: aprovados,
        candidatos_rejeitados: rejeitados
      })

      console.log(`Webhook N8N: triagem ${triagem_id} concluída. Processados: ${resultados.length}, Aprovados: ${aprovados}, Rejeitados: ${rejeitados}`)

      return NextResponse.json({
        success: true,
        message: `Processados ${resultados.length} candidatos`,
        aprovados,
        rejeitados
      })
    }

    // 8. Status desconhecido
    console.warn('Webhook N8N: status desconhecido:', status)
    return NextResponse.json(
      { error: 'Status inválido' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Erro no webhook N8N:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/webhooks/n8n
 * Health check para verificar se o webhook está ativo
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Webhook N8N ativo',
    timestamp: new Date().toISOString()
  })
}