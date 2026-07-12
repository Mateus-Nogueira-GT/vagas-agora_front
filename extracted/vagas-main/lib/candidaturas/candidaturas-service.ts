import { 
  updateCandidaturaStatus, 
  buscarCandidaturasDoUsuarioNova,
  createCandidatura,
  verificarCandidaturaExistente,
  cancelarCandidatura,
  type UpdateCandidaturaStatusData,
  type CreateCandidaturaData
} from '@/lib/api/candidaturas-api'
import type { CandidaturaResponse, CandidaturaFilters } from './candidaturas-types'

export async function getCandidaturas(userId: string, filters?: CandidaturaFilters): Promise<CandidaturaResponse> {
  try {
    // Buscar candidaturas do banco
    const response = await buscarCandidaturasDoUsuarioNova(userId)
    
    if (!response.success || !response.data) {
      return {
        success: false,
        error: response.error || 'Erro ao buscar candidaturas'
      }
    }

    let candidaturas = response.data

    // Aplicar filtros se fornecidos
    if (filters) {
      // Filtro por status
      if (filters.status && filters.status !== 'all') {
        candidaturas = candidaturas.filter((c: any) => c.status === filters.status)
      }

      // Filtro por busca de texto (título da vaga ou nome da empresa)
      if (filters.search && filters.search.trim()) {
        const searchTerm = filters.search.toLowerCase()
        candidaturas = candidaturas.filter((c: any) => 
          c.vaga?.titulo?.toLowerCase().includes(searchTerm) ||
          c.vaga?.empregador?.nome?.toLowerCase().includes(searchTerm)
        )
      }
    }

    return {
      success: true,
      data: candidaturas
    }
  } catch (error) {
    console.error('Erro no service getCandidaturas:', {
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined,
      error: error
    })
    return {
      success: false,
      error: 'Erro interno ao buscar candidaturas'
    }
  }
}

export async function realizarCandidatura(
  vagaId: string,
  userId: string,
  cartaApresentacao?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!vagaId || !userId) {
      return {
        success: false,
        error: 'Dados inválidos para candidatura'
      }
    }

    const response = await createCandidatura({
      vaga_id: vagaId,
      candidato_id: userId,
      carta_apresentacao: cartaApresentacao
    })

    return {
      success: response.success,
      error: response.error
    }
  } catch (error) {
    console.error('Erro no service realizarCandidatura:', error)
    return {
      success: false,
      error: 'Erro interno ao realizar candidatura'
    }
  }
}

export async function verificarCandidatura(userId: string, vagaId: string): Promise<{
  success: boolean
  exists: boolean
  candidatura?: any
  error?: string
}> {
  try {
    return await verificarCandidaturaExistente(userId, vagaId)
  } catch (error) {
    console.error('Erro no service verificarCandidatura:', {
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined,
      error: error
    })
    return {
      success: false,
      exists: false,
      error: 'Erro interno ao verificar candidatura'
    }
  }
}

export async function cancelarCandidaturaService(userId: string, vagaId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    return await cancelarCandidatura(userId, vagaId)
  } catch (error) {
    console.error('Erro no service cancelarCandidatura:', {
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined,
      error: error
    })
    return {
      success: false,
      error: 'Erro interno ao cancelar candidatura'
    }
  }
}
