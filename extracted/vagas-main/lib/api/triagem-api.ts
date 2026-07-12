import { supabase } from '@/lib/supabase'
import { 
  TriagemConfig, 
  Triagem, 
  TriagemResultado 
} from '@/lib/triagem/triagem-types'

// ============================================
// CONFIGURAÇÃO DE TRIAGEM
// ============================================

/**
 * Busca a configuração de triagem de um empregador
 * @param empregadorId - ID do empregador (auth.users.id)
 * @returns Configuração ou null se não existir
 */
export async function getTriagemConfig(
  empregadorId: string
): Promise<TriagemConfig | null> {
  const { data, error } = await supabase
    .from('triagem_configs')
    .select('*')
    .eq('empregador_id', empregadorId)
    .single()

  // PGRST116 = não encontrou registro (não é erro)
  if (error && error.code !== 'PGRST116') {
    console.error('Erro ao buscar config de triagem:', error)
    throw error
  }

  return data as TriagemConfig | null
}

/**
 * Cria ou atualiza a configuração de triagem do empregador
 * @param config - Dados da configuração
 * @returns Configuração salva
 */
export async function upsertTriagemConfig(
  config: Partial<TriagemConfig> & { empregador_id: string }
): Promise<TriagemConfig> {
  const { data, error } = await supabase
    .from('triagem_configs')
    .upsert(
      {
        ...config,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'empregador_id' }
    )
    .select()
    .single()

  if (error) {
    console.error('Erro ao salvar config de triagem:', error)
    throw error
  }

  return data as TriagemConfig
}

/**
 * Deleta a configuração de triagem do empregador
 * @param empregadorId - ID do empregador
 */
export async function deleteTriagemConfig(
  empregadorId: string
): Promise<void> {
  const { error } = await supabase
    .from('triagem_configs')
    .delete()
    .eq('empregador_id', empregadorId)

  if (error) {
    console.error('Erro ao deletar config de triagem:', error)
    throw error
  }
}

// ============================================
// EXECUÇÕES DE TRIAGEM
// ============================================

/**
 * Cria um novo registro de triagem
 * @param triagem - Dados da triagem
 * @returns Triagem criada
 */
export async function createTriagem(
  triagem: Partial<Triagem>
): Promise<Triagem> {
  const { data, error } = await supabase
    .from('triagens')
    .insert({
      ...triagem,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Erro ao criar triagem:', error)
    throw error
  }

  return data as Triagem
}

/**
 * Busca uma triagem pelo ID
 * @param triagemId - ID da triagem
 * @returns Triagem ou null
 */
export async function getTriagemById(
  triagemId: string
): Promise<Triagem | null> {
  const { data, error } = await supabase
    .from('triagens')
    .select('*')
    .eq('id', triagemId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Erro ao buscar triagem:', error)
    throw error
  }

  return data as Triagem | null
}

/**
 * Atualiza o status de uma triagem
 * @param triagemId - ID da triagem
 * @param status - Novo status
 * @param dados - Dados adicionais para atualizar
 * @returns Triagem atualizada
 */
export async function updateTriagemStatus(
  triagemId: string,
  status: Triagem['status'],
  dados?: Partial<Triagem>
): Promise<Triagem> {
  const updateData: Partial<Triagem> = {
    status,
    updated_at: new Date().toISOString(),
    ...dados
  }

  // Se concluída ou erro, registra timestamp
  if (status === 'concluida' || status === 'erro') {
    updateData.concluida_em = new Date().toISOString()
  }

  // Se começou a processar, registra timestamp
  if (status === 'processando') {
    updateData.iniciada_em = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('triagens')
    .update(updateData)
    .eq('id', triagemId)
    .select()
    .single()

  if (error) {
    console.error('Erro ao atualizar status da triagem:', error)
    throw error
  }

  return data as Triagem
}

/**
 * Busca todas as triagens de uma vaga
 * @param vagaId - ID da vaga
 * @returns Lista de triagens ordenada por data (mais recente primeiro)
 */
export async function getTriagensByVaga(
  vagaId: string
): Promise<Triagem[]> {
  const { data, error } = await supabase
    .from('triagens')
    .select('*')
    .eq('vaga_id', vagaId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar triagens da vaga:', error)
    throw error
  }

  return data as Triagem[]
}

/**
 * Busca a última triagem concluída de uma vaga
 * @param vagaId - ID da vaga
 * @returns Última triagem concluída ou null
 */
export async function getUltimaTriagemConcluida(
  vagaId: string
): Promise<Triagem | null> {
  const { data, error } = await supabase
    .from('triagens')
    .select('*')
    .eq('vaga_id', vagaId)
    .eq('status', 'concluida')
    .order('concluida_em', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Erro ao buscar última triagem:', error)
    throw error
  }

  return data as Triagem | null
}

/**
 * Verifica se existe triagem em andamento para uma vaga
 * @param vagaId - ID da vaga
 * @returns true se existe triagem pendente ou processando
 */
export async function existeTriagemEmAndamento(
  vagaId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('triagens')
    .select('id')
    .eq('vaga_id', vagaId)
    .in('status', ['pendente', 'processando'])
    .limit(1)

  if (error) {
    console.error('Erro ao verificar triagem em andamento:', error)
    throw error
  }

  return (data?.length ?? 0) > 0
}

// ============================================
// RESULTADOS DE TRIAGEM
// ============================================

/**
 * Insere resultados de triagem em batch
 * @param resultados - Array de resultados
 * @returns Resultados inseridos
 */
export async function insertTriagemResultados(
  resultados: Partial<TriagemResultado>[]
): Promise<TriagemResultado[]> {
  if (resultados.length === 0) {
    return []
  }

  const { data, error } = await supabase
    .from('triagem_resultados')
    .insert(resultados)
    .select()

  if (error) {
    console.error('Erro ao inserir resultados de triagem:', error)
    throw error
  }

  return data as TriagemResultado[]
}

/**
 * Busca resultados de uma triagem
 * @param triagemId - ID da triagem
 * @returns Lista de resultados
 */
export async function getTriagemResultados(
  triagemId: string
): Promise<TriagemResultado[]> {
  const { data, error } = await supabase
    .from('triagem_resultados')
    .select('*')
    .eq('triagem_id', triagemId)
    .order('nota', { ascending: false })

  if (error) {
    console.error('Erro ao buscar resultados de triagem:', error)
    throw error
  }

  return data as TriagemResultado[]
}

/**
 * Busca resultado de triagem de uma candidatura específica
 * @param candidaturaId - ID da candidatura
 * @returns Último resultado ou null
 */
export async function getResultadoByCandidatura(
  candidaturaId: string
): Promise<TriagemResultado | null> {
  const { data, error } = await supabase
    .from('triagem_resultados')
    .select('*')
    .eq('candidatura_id', candidaturaId)
    .order('processado_em', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Erro ao buscar resultado da candidatura:', error)
    throw error
  }

  return data as TriagemResultado | null
}

// ============================================
// ATUALIZAÇÃO DE CANDIDATURAS (campos IA)
// ============================================

/**
 * Atualiza os campos de IA em uma candidatura
 * @param candidaturaId - ID da candidatura
 * @param nota - Nota da IA (0-10)
 * @param recomendacao - Recomendação (aprovar/analisar/rejeitar)
 * @param resumo - Resumo gerado pela IA
 */
export async function updateCandidaturaIAData(
  candidaturaId: string,
  nota: number,
  recomendacao: string,
  resumo: string
): Promise<void> {
  const { error } = await supabase
    .from('candidaturas')
    .update({
      ia_nota: nota,
      ia_recomendacao: recomendacao,
      ia_resumo: resumo,
      ia_processado_em: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', candidaturaId)

  if (error) {
    console.error('Erro ao atualizar dados IA da candidatura:', error)
    throw error
  }
}

/**
 * Atualiza o status de uma candidatura baseado na nota da IA
 * @param candidaturaId - ID da candidatura
 * @param novoStatus - Novo status
 */
export async function updateCandidaturaStatus(
  candidaturaId: string,
  novoStatus: string
): Promise<void> {
  const { error } = await supabase
    .from('candidaturas')
    .update({
      status: novoStatus,
      updated_at: new Date().toISOString()
    })
    .eq('id', candidaturaId)

  if (error) {
    console.error('Erro ao atualizar status da candidatura:', error)
    throw error
  }
}

/**
 * Atualiza candidatura com dados IA E muda status automaticamente
 * @param candidaturaId - ID da candidatura
 * @param nota - Nota da IA
 * @param recomendacao - Recomendação
 * @param resumo - Resumo
 */
export async function processarResultadoCandidatura(
  candidaturaId: string,
  nota: number,
  recomendacao: string,
  resumo: string
): Promise<void> {
  // Determinar novo status baseado na nota
  let novoStatus: string
  if (nota >= 7) {
    novoStatus = 'Aprovado'
  } else if (nota < 4) {
    novoStatus = 'Rejeitado'
  } else {
    novoStatus = 'Em análise' // Mantém para análise manual
  }

  const { error } = await supabase
    .from('candidaturas')
    .update({
      ia_nota: nota,
      ia_recomendacao: recomendacao,
      ia_resumo: resumo,
      ia_processado_em: new Date().toISOString(),
      status: novoStatus,
      updated_at: new Date().toISOString()
    })
    .eq('id', candidaturaId)

  if (error) {
    console.error('Erro ao processar resultado da candidatura:', error)
    throw error
  }
}

// ============================================
// CONSULTAS AUXILIARES
// ============================================

/**
 * Busca candidaturas "Em análise" de uma vaga para triagem
 * @param vagaId - ID da vaga
 * @returns Lista de candidaturas com dados do candidato
 */
export async function getCandidaturasParaTriagem(vagaId: string) {
  const { data, error } = await supabase
    .from('candidaturas')
    .select(`
      id,
      candidato_id,
      carta_apresentacao,
      data_candidatura,
      candidatos (
        nome_completo,
        titulo_profissional,
        nivel_senioridade,
        anos_experiencia,
        habilidades_tecnicas,
        resumo_profissional,
        experiencia_profissional,
        formacao_academica,
        cidade,
        estado
      )
    `)
    .eq('vaga_id', vagaId)
    .eq('status', 'Em análise')
    .is('ia_nota', null) // Apenas não processadas

  if (error) {
    console.error('Erro ao buscar candidaturas para triagem:', error)
    throw error
  }

  return data
}

/**
 * Busca dados da vaga para enviar ao N8N
 * @param vagaId - ID da vaga
 * @returns Dados da vaga
 */
export async function getVagaParaTriagem(vagaId: string) {
  const { data, error } = await supabase
    .from('vagas')
    .select(`
      id,
      titulo,
      descricao,
      requisitos,
      responsabilidades,
      diferenciais,
      nivel,
      modelo_trabalho,
      salario_de,
      salario_ate,
      cidade,
      estado
    `)
    .eq('id', vagaId)
    .single()

  if (error) {
    console.error('Erro ao buscar vaga para triagem:', error)
    throw error
  }

  return data
}

/**
 * Conta estatísticas de triagem de uma vaga
 * @param vagaId - ID da vaga
 */
export async function getEstatisticasTriagem(vagaId: string) {
  const { data: triagens, error: errorTriagens } = await supabase
    .from('triagens')
    .select('candidatos_aprovados, candidatos_rejeitados, total_candidatos')
    .eq('vaga_id', vagaId)
    .eq('status', 'concluida')

  if (errorTriagens) {
    console.error('Erro ao buscar estatísticas:', errorTriagens)
    throw errorTriagens
  }

  const stats = {
    total_triagens: triagens?.length ?? 0,
    total_processados: 0,
    total_aprovados: 0,
    total_rejeitados: 0,
    total_em_analise: 0
  }

  triagens?.forEach(t => {
    stats.total_processados += t.total_candidatos ?? 0
    stats.total_aprovados += t.candidatos_aprovados ?? 0
    stats.total_rejeitados += t.candidatos_rejeitados ?? 0
  })

  stats.total_em_analise = stats.total_processados - stats.total_aprovados - stats.total_rejeitados

  return stats
}