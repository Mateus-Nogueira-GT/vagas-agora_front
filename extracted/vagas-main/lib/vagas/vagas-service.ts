// Vagas service following BMAD business logic patterns
import { vagasApiService } from '../api/vagas-api'
import { 
  Vaga, 
  CreateVagaRequest, 
  UpdateVagaRequest, 
  VagasListResponse, 
  VagasFilters, 
  VagaMetrics,
  VagaWithCandidatos,
  VagasResponse 
} from './vagas-types'

class VagasService {
  async getVagasByEmpregador(empregadorId: string, filters?: VagasFilters): Promise<VagasResponse> {
    try {
      // Validação básica
      if (!empregadorId) {
        return {
          data: null,
          error: 'ID do empregador é obrigatório'
        }
      }

      // Chamada para a API
      const response = await vagasApiService.getVagasByEmpregador(empregadorId, filters)
      
      return {
        data: response, // Retorna o VagasListResponse completo
        error: undefined
      }
    } catch (error) {
      console.error('Get vagas service error:', error)
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      }
    }
  }

  async getVagaById(id: string, empregadorId?: string): Promise<VagasResponse> {
    try {
      // Validação básica
      if (!id) {
        return {
          data: null,
          error: 'ID da vaga é obrigatório'
        }
      }

      // Chamada para a API
      const vaga = await vagasApiService.getVagaById(id, empregadorId)
      
      return {
        data: vaga,
        error: undefined
      }
    } catch (error) {
      console.error('Get vaga by id service error:', error)
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      }
    }
  }

  async createVaga(empregadorId: string, vagaData: CreateVagaRequest): Promise<VagasResponse> {
    try {
      // Validação básica
      if (!empregadorId) {
        return {
          data: null,
          error: 'ID do empregador é obrigatório'
        }
      }

      if (!vagaData.titulo || vagaData.titulo.trim().length === 0) {
        return {
          data: null,
          error: 'Título da vaga é obrigatório'
        }
      }

      if (vagaData.titulo.length < 3) {
        return {
          data: null,
          error: 'Título da vaga deve ter pelo menos 3 caracteres'
        }
      }

      if (vagaData.titulo.length > 100) {
        return {
          data: null,
          error: 'Título da vaga deve ter no máximo 100 caracteres'
        }
      }

      // Validação de salários
      if (vagaData.salario_de && vagaData.salario_ate) {
        if (vagaData.salario_de > vagaData.salario_ate) {
          return {
            data: null,
            error: 'Salário inicial não pode ser maior que o salário final'
          }
        }
      }

      if (vagaData.salario_de && vagaData.salario_de < 0) {
        return {
          data: null,
          error: 'Salário não pode ser negativo'
        }
      }

      // Validação de número de vagas
      if (vagaData.num_vagas && vagaData.num_vagas < 1) {
        return {
          data: null,
          error: 'Número de vagas deve ser pelo menos 1'
        }
      }

      // Chamada para a API
      const vaga = await vagasApiService.createVaga(empregadorId, vagaData)
      
      return {
        data: vaga,
        error: undefined
      }
    } catch (error) {
      console.error('Create vaga service error:', error)
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      }
    }
  }

  async updateVaga(vagaData: UpdateVagaRequest): Promise<VagasResponse> {
    try {
      // Validação básica
      if (!vagaData.id) {
        return {
          data: null,
          error: 'ID da vaga é obrigatório'
        }
      }

      if (vagaData.titulo !== undefined) {
        if (!vagaData.titulo || vagaData.titulo.trim().length === 0) {
          return {
            data: null,
            error: 'Título da vaga é obrigatório'
          }
        }

        if (vagaData.titulo.length < 3) {
          return {
            data: null,
            error: 'Título da vaga deve ter pelo menos 3 caracteres'
          }
        }

        if (vagaData.titulo.length > 100) {
          return {
            data: null,
            error: 'Título da vaga deve ter no máximo 100 caracteres'
          }
        }
      }

      // Validação de salários
      if (vagaData.salario_de !== undefined && vagaData.salario_ate !== undefined) {
        if (vagaData.salario_de > vagaData.salario_ate) {
          return {
            data: null,
            error: 'Salário inicial não pode ser maior que o salário final'
          }
        }
      }

      if (vagaData.salario_de !== undefined && vagaData.salario_de < 0) {
        return {
          data: null,
          error: 'Salário não pode ser negativo'
        }
      }

      // Validação de número de vagas
      if (vagaData.num_vagas !== undefined && vagaData.num_vagas < 1) {
        return {
          data: null,
          error: 'Número de vagas deve ser pelo menos 1'
        }
      }

      // Chamada para a API
      const vaga = await vagasApiService.updateVaga(vagaData)
      
      return {
        data: vaga,
        error: undefined
      }
    } catch (error) {
      console.error('Update vaga service error:', error)
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      }
    }
  }

  async deleteVaga(id: string): Promise<VagasResponse> {
    try {
      // Validação básica
      if (!id) {
        return {
          data: null,
          error: 'ID da vaga é obrigatório'
        }
      }

      // Chamada para a API
      await vagasApiService.deleteVaga(id)
      
      return {
        data: null,
        error: undefined
      }
    } catch (error) {
      console.error('Delete vaga service error:', error)
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      }
    }
  }

  async getVagasMetrics(empregadorId: string): Promise<VagasResponse> {
    try {
      // Validação básica
      if (!empregadorId) {
        return {
          data: null,
          error: 'ID do empregador é obrigatório'
        }
      }

      // Chamada para a API
      const metrics = await vagasApiService.getVagasMetrics(empregadorId)
      
      return {
        data: metrics,
        error: undefined
      }
    } catch (error) {
      console.error('Get vagas metrics service error:', error)
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      }
    }
  }

  async changeVagaStatus(id: string, status: 'Rascunho' | 'Ativa' | 'Encerrada' | 'Preenchida'): Promise<VagasResponse> {
    try {
      // Validação básica
      if (!id) {
        return {
          data: null,
          error: 'ID da vaga é obrigatório'
        }
      }

      if (!['Rascunho', 'Ativa', 'Encerrada', 'Preenchida'].includes(status)) {
        return {
          data: null,
          error: 'Status inválido'
        }
      }

      // Chamada para a API
      const vaga = await vagasApiService.changeVagaStatus(id, status)
      
      return {
        data: vaga,
        error: undefined
      }
    } catch (error) {
      console.error('Change vaga status service error:', error)
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      }
    }
  }

  // Helper methods for frontend
  formatSalaryRange(salario_de?: number, salario_ate?: number): string {
    if (!salario_de && !salario_ate) return 'A combinar'
    
    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value)
    }

    if (salario_de && salario_ate) {
      return `${formatCurrency(salario_de)} - ${formatCurrency(salario_ate)}`
    } else if (salario_de) {
      return `A partir de ${formatCurrency(salario_de)}`
    } else if (salario_ate) {
      return `Até ${formatCurrency(salario_ate)}`
    }

    return 'A combinar'
  }

  formatTimeAgo(date: string): string {
    const now = new Date()
    const past = new Date(date)
    const diffInHours = Math.floor((now.getTime() - past.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return 'Há poucos minutos'
    } else if (diffInHours < 24) {
      return `Há ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      if (diffInDays < 30) {
        return `Há ${diffInDays} dia${diffInDays > 1 ? 's' : ''}`
      } else {
        return past.toLocaleDateString('pt-BR')
      }
    }
  }

  getDaysLeft(dataExpiracao?: string): number {
    if (!dataExpiracao) return 0
    
    const now = new Date()
    const expiration = new Date(dataExpiracao)
    const diffInTime = expiration.getTime() - now.getTime()
    const diffInDays = Math.ceil(diffInTime / (1000 * 3600 * 24))
    
    return Math.max(0, diffInDays)
  }
}

export const vagasService = new VagasService()
