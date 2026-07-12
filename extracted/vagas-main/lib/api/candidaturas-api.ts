import { supabase } from '@/lib/supabase'

export interface UpdateCandidaturaStatusData {
  candidaturaId: string
  novoStatus: string
  observacoes?: string
}

export interface UpdateCandidaturaStatusResponse {
  success: boolean
  data?: any
  error?: string
}

export async function updateCandidaturaStatus({ 
  candidaturaId, 
  novoStatus, 
  observacoes 
}: UpdateCandidaturaStatusData): Promise<UpdateCandidaturaStatusResponse> {
  try {
    // Validar status permitidos
    const statusPermitidos = ['Em análise', 'Aprovado', 'Rejeitado', 'Finalizado']
    if (!statusPermitidos.includes(novoStatus)) {
      return {
        success: false,
        error: 'Status inválido. Valores permitidos: Em análise, Aprovado, Rejeitado, Finalizado'
      }
    }

    // Atualizar a candidatura
    const { data, error } = await supabase
      .from('candidaturas')
      .update({
        status: novoStatus,
        ...(observacoes && { observacoes })
      })
      .eq('id', candidaturaId)
      .select(`
        *,
        candidato:candidato_id (
          id,
          email
        ),
        vaga:vaga_id (
          id,
          titulo
        )
      `)
      .single()

    if (error) {
      console.error('Erro ao atualizar candidatura:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return {
        success: false,
        error: `Erro ao atualizar candidatura: ${error.message}`
      }
    }

    // Log de auditoria (opcional - você pode implementar uma tabela de logs)

    return {
      success: true,
      data
    }
  } catch (error) {
    console.error('Erro inesperado ao atualizar candidatura:', {
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined,
      error: error
    })
    return {
      success: false,
      error: 'Erro inesperado ao atualizar candidatura'
    }
  }
}

// Função para obter histórico de mudanças de status (para implementar futuramente)
export async function getCandidaturaHistory(candidaturaId: string) {
  // Esta função pode ser implementada futuramente com uma tabela de histórico
  return {
    success: true,
    data: []
  }
}

// Interface para dados de criação de candidatura
export interface CreateCandidaturaData {
  vaga_id: string
  candidato_id: string
  carta_apresentacao?: string
}

// Função completamente nova para substituir a antiga
export async function buscarCandidaturasDoUsuarioNova(userId: string) {
  try {
    
    // Primeira tentativa: buscar candidaturas básicas
    const { data: candidaturasBasicas, error: erroBasico } = await supabase
      .from('candidaturas')
      .select(`
        id,
        vaga_id,
        candidato_id,
        status,
        data_candidatura,
        carta_apresentacao
      `)
      .eq('candidato_id', userId)
      .order('data_candidatura', { ascending: false })

    if (erroBasico) {
      console.error('Erro ao buscar candidaturas básicas:', {
        message: erroBasico.message,
        details: erroBasico.details,
        code: erroBasico.code
      })
      return {
        success: false,
        error: `Erro ao buscar candidaturas: ${erroBasico.message}`
      }
    }

    if (!candidaturasBasicas || candidaturasBasicas.length === 0) {
      return {
        success: true,
        data: []
      }
    }


    // Agora buscar os dados das vagas para cada candidatura
    const candidaturasCompletas = await Promise.all(
      candidaturasBasicas.map(async (candidatura) => {
        try {
          // Buscar dados da vaga
          const { data: vagaData, error: vagaError } = await supabase
            .from('vagas')
            .select(`
              id,
              titulo,
              cidade,
              estado,
              salario_de,
              salario_ate,
              modelo_trabalho,
              tipo_contratacao,
              empregador_id
            `)
            .eq('id', candidatura.vaga_id)
            .maybeSingle()

          if (vagaError) {
            console.warn(`Erro ao buscar vaga ${candidatura.vaga_id}:`, vagaError)
            return null
          }

          if (!vagaData) {
            console.warn(`Vaga ${candidatura.vaga_id} não encontrada`)
            return null
          }

          // Buscar dados da empresa
          let empresaNome = 'Empresa não informada'
          let empresaLogoUrl = null
          if (vagaData.empregador_id) {
            try {
              const { data: empresaData } = await supabase
                .from('empresas')
                .select('nome, logo_url')
                .eq('user_id', vagaData.empregador_id)
                .maybeSingle()

              empresaNome = empresaData?.nome || 'Empresa não informada'
              empresaLogoUrl = empresaData?.logo_url || null
            } catch (empresaError) {
              console.warn('Erro ao buscar empresa:', empresaError)
            }
          }

          // Montar o objeto completo
          return {
            id: candidatura.id,
            vaga_id: candidatura.vaga_id,
            candidato_id: candidatura.candidato_id,
            status: candidatura.status,
            data_candidatura: candidatura.data_candidatura,
            carta_apresentacao: candidatura.carta_apresentacao,
            vaga: {
              id: vagaData.id,
              titulo: vagaData.titulo,
              cidade: vagaData.cidade,
              estado: vagaData.estado,
              salario_de: vagaData.salario_de,
              salario_ate: vagaData.salario_ate,
              modelo_trabalho: vagaData.modelo_trabalho,
              tipo_contratacao: vagaData.tipo_contratacao,
              empregador: {
                nome: empresaNome,
                logo_url: empresaLogoUrl
              }
            }
          }
        } catch (error) {
          console.error(`Erro ao processar candidatura ${candidatura.id}:`, error)
          return null
        }
      })
    )

    // Filtrar candidaturas válidas
    const candidaturasValidas = candidaturasCompletas.filter(c => c !== null)


    return {
      success: true,
      data: candidaturasValidas
    }
  } catch (error) {
    console.error('NOVA VERSÃO - Erro inesperado ao buscar candidaturas:', {
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined,
      error: error
    })
    return {
      success: false,
      error: 'Erro inesperado ao buscar candidaturas'
    }
  }
}

// Função antiga - DEPRECATED - não usar
export async function buscarCandidaturasDoUsuario(userId: string) {
  return {
    success: false,
    error: 'Função deprecated - usar nova versão'
  }
}

// Função para criar candidatura
export async function createCandidatura(candidaturaData: CreateCandidaturaData) {
  try {
    const { data, error } = await supabase
      .from('candidaturas')
      .insert({
        vaga_id: candidaturaData.vaga_id,
        candidato_id: candidaturaData.candidato_id,
        carta_apresentacao: candidaturaData.carta_apresentacao,
        status: 'Em análise',
        data_candidatura: new Date().toISOString()
      })
      .select(`
        *,
        vaga:vaga_id (
          titulo
        )
      `)
      .single()

    if (error) {
      console.error('Erro ao criar candidatura:', error)
      return {
        success: false,
        error: `Erro ao criar candidatura: ${error.message}`
      }
    }

    return {
      success: true,
      data
    }
  } catch (error) {
    console.error('Erro inesperado ao criar candidatura:', error)
    return {
      success: false,
      error: 'Erro inesperado ao criar candidatura'
    }
  }
}

// Função para verificar se candidatura já existe
export async function verificarCandidaturaExistente(userId: string, vagaId: string) {
  try {
    const { data, error } = await supabase
      .from('candidaturas')
      .select('*')
      .eq('candidato_id', userId)
      .eq('vaga_id', vagaId)
      .maybeSingle()

    if (error) {
      console.error('Erro ao verificar candidatura:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return {
        success: false,
        exists: false,
        error: error.message
      }
    }

    return {
      success: true,
      exists: !!data,
      candidatura: data
    }
  } catch (error) {
    console.error('Erro inesperado ao verificar candidatura:', {
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined,
      error: error
    })
    return {
      success: false,
      exists: false,
      error: 'Erro inesperado ao verificar candidatura'
    }
  }
}

// Função para cancelar candidatura
export async function cancelarCandidatura(userId: string, vagaId: string) {
  try {
    const { error } = await supabase
      .from('candidaturas')
      .delete()
      .eq('candidato_id', userId)
      .eq('vaga_id', vagaId)

    if (error) {
      console.error('Erro ao cancelar candidatura:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return {
        success: false,
        error: `Erro ao cancelar candidatura: ${error.message}`
      }
    }

    return {
      success: true
    }
  } catch (error) {
    console.error('Erro inesperado ao cancelar candidatura:', {
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined,
      error: error
    })
    return {
      success: false,
      error: 'Erro inesperado ao cancelar candidatura'
    }
  }
}
