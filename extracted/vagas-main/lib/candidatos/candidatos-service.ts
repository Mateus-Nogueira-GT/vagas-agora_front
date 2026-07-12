// Candidatos service following BMAD business logic patterns
import { candidatosApiService } from '../api/candidatos-api'
import { 
  Candidato,
  CreateCandidatoRequest,
  UpdateCandidatoRequest,
  CandidatosListResponse,
  CandidatosFilters,
  CandidatosResponse
} from './candidatos-types'

class CandidatosService {
  async getCandidatoPerfil(userId: string): Promise<CandidatosResponse> {
    try {
      // Validação básica
      if (!userId) {
        return {
          data: null,
          error: 'ID do usuário é obrigatório'
        }
      }

      // Chamada para a API
      const candidato = await candidatosApiService.getCandidatoByUserId(userId)
      
      return {
        data: candidato,
        error: undefined
      }
    } catch (error) {
      console.error('Get candidato perfil service error:', error)
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      }
    }
  }

  async getCandidatoPublico(id: string): Promise<CandidatosResponse> {
    try {
      // Validação básica
      if (!id) {
        return {
          data: null,
          error: 'ID do candidato é obrigatório'
        }
      }

      // Chamada para a API
      const candidato = await candidatosApiService.getCandidatoPublicoById(id)

      return {
        data: candidato,
        error: undefined
      }
    } catch (error) {
      console.error('Get candidato publico service error:', error)
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      }
    }
  }

  async createCandidatoPerfil(userId: string, candidatoData: CreateCandidatoRequest): Promise<CandidatosResponse> {
    try {
      // Validação básica
      if (!userId) {
        return {
          data: null,
          error: 'ID do usuário é obrigatório'
        }
      }

      if (!candidatoData.nome_completo || candidatoData.nome_completo.trim().length === 0) {
        return {
          data: null,
          error: 'Nome completo é obrigatório'
        }
      }

      if (candidatoData.nome_completo.length < 2) {
        return {
          data: null,
          error: 'Nome completo deve ter pelo menos 2 caracteres'
        }
      }

      if (candidatoData.nome_completo.length > 100) {
        return {
          data: null,
          error: 'Nome completo deve ter no máximo 100 caracteres'
        }
      }

      // Validação de telefone se fornecido
      if (candidatoData.telefone) {
        // Aceita ambos os formatos: (XX) XXXXX-XXXX ou (XX) X XXXX-XXXX
        const telefoneRegex = /^\(\d{2}\)\s\d{1}\s\d{4}-\d{4}$/
        const telefoneAlternativoRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/

        if (!telefoneRegex.test(candidatoData.telefone) && !telefoneAlternativoRegex.test(candidatoData.telefone)) {
          return {
            data: null,
            error: 'Telefone deve estar no formato (XX) X XXXX-XXXX'
          }
        }
      }

      // Validação de salário
      if (candidatoData.salario_pretendido_de && candidatoData.salario_pretendido_ate) {
        if (candidatoData.salario_pretendido_de > candidatoData.salario_pretendido_ate) {
          return {
            data: null,
            error: 'Salário inicial não pode ser maior que o salário final'
          }
        }
      }

      if (candidatoData.salario_pretendido_de && candidatoData.salario_pretendido_de < 0) {
        return {
          data: null,
          error: 'Salário não pode ser negativo'
        }
      }

      // Validação de anos de experiência
      if (candidatoData.anos_experiencia && candidatoData.anos_experiencia < 0) {
        return {
          data: null,
          error: 'Anos de experiência não pode ser negativo'
        }
      }

      if (candidatoData.anos_experiencia && candidatoData.anos_experiencia > 70) {
        return {
          data: null,
          error: 'Anos de experiência não pode ser maior que 70'
        }
      }

      // Validação de URLs se fornecidas
      const urlFields = ['portfolio_url', 'linkedin_url', 'github_url', 'site_pessoal']
      for (const field of urlFields) {
        const url = candidatoData[field as keyof CreateCandidatoRequest] as string
        if (url) {
          try {
            new URL(url)
          } catch {
            return {
              data: null,
              error: `URL inválida no campo ${field.replace('_', ' ')}`
            }
          }
        }
      }

      // Chamada para a API
      const candidato = await candidatosApiService.createCandidato(userId, candidatoData)
      
      return {
        data: candidato,
        error: undefined
      }
    } catch (error) {
      console.error('Create candidato perfil service error:', error)
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      }
    }
  }

  async updateCandidatoPerfil(candidatoData: UpdateCandidatoRequest): Promise<CandidatosResponse> {
    try {
      // Validação básica
      if (!candidatoData.id) {
        return {
          data: null,
          error: 'ID do candidato é obrigatório'
        }
      }

      // Aplicar as mesmas validações do create, mas apenas para campos fornecidos
      if (candidatoData.nome_completo !== undefined) {
        if (!candidatoData.nome_completo || candidatoData.nome_completo.trim().length === 0) {
          return {
            data: null,
            error: 'Nome completo é obrigatório'
          }
        }

        if (candidatoData.nome_completo.length < 2) {
          return {
            data: null,
            error: 'Nome completo deve ter pelo menos 2 caracteres'
          }
        }

        if (candidatoData.nome_completo.length > 100) {
          return {
            data: null,
            error: 'Nome completo deve ter no máximo 100 caracteres'
          }
        }
      }

      // Validação de telefone se fornecido
      if (candidatoData.telefone !== undefined && candidatoData.telefone) {
        // Aceita ambos os formatos: (XX) XXXXX-XXXX ou (XX) X XXXX-XXXX
        const telefoneRegex = /^\(\d{2}\)\s\d{1}\s\d{4}-\d{4}$/
        const telefoneAlternativoRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/

        if (!telefoneRegex.test(candidatoData.telefone) && !telefoneAlternativoRegex.test(candidatoData.telefone)) {
          return {
            data: null,
            error: 'Telefone deve estar no formato (XX) X XXXX-XXXX'
          }
        }
      }

      // Validação de salário
      if (candidatoData.salario_pretendido_de !== undefined && candidatoData.salario_pretendido_ate !== undefined) {
        if (candidatoData.salario_pretendido_de && candidatoData.salario_pretendido_ate && 
            candidatoData.salario_pretendido_de > candidatoData.salario_pretendido_ate) {
          return {
            data: null,
            error: 'Salário inicial não pode ser maior que o salário final'
          }
        }
      }

      if (candidatoData.salario_pretendido_de !== undefined && candidatoData.salario_pretendido_de && candidatoData.salario_pretendido_de < 0) {
        return {
          data: null,
          error: 'Salário não pode ser negativo'
        }
      }

      // Validação de anos de experiência
      if (candidatoData.anos_experiencia !== undefined && candidatoData.anos_experiencia) {
        if (candidatoData.anos_experiencia < 0) {
          return {
            data: null,
            error: 'Anos de experiência não pode ser negativo'
          }
        }

        if (candidatoData.anos_experiencia > 70) {
          return {
            data: null,
            error: 'Anos de experiência não pode ser maior que 70'
          }
        }
      }

      // Validação de URLs se fornecidas
      const urlFields = ['portfolio_url', 'linkedin_url', 'github_url', 'site_pessoal']
      for (const field of urlFields) {
        const url = candidatoData[field as keyof UpdateCandidatoRequest] as string
        if (url !== undefined && url) {
          try {
            new URL(url)
          } catch {
            return {
              data: null,
              error: `URL inválida no campo ${field.replace('_', ' ')}`
            }
          }
        }
      }

      // Chamada para a API
      const candidato = await candidatosApiService.updateCandidato(candidatoData)
      
      return {
        data: candidato,
        error: undefined
      }
    } catch (error) {
      console.error('Update candidato perfil service error:', error)
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      }
    }
  }

  async updateCandidatoPerfilByUserId(userId: string, candidatoData: Partial<CreateCandidatoRequest>): Promise<CandidatosResponse> {
    try {
      // Validação básica
      if (!userId) {
        return {
          data: null,
          error: 'ID do usuário é obrigatório'
        }
      }

      // Aplicar as mesmas validações do update, mas apenas para campos fornecidos
      if (candidatoData.nome_completo !== undefined) {
        if (!candidatoData.nome_completo || candidatoData.nome_completo.trim().length === 0) {
          return {
            data: null,
            error: 'Nome completo é obrigatório'
          }
        }

        if (candidatoData.nome_completo.length < 2) {
          return {
            data: null,
            error: 'Nome completo deve ter pelo menos 2 caracteres'
          }
        }

        if (candidatoData.nome_completo.length > 100) {
          return {
            data: null,
            error: 'Nome completo deve ter no máximo 100 caracteres'
          }
        }
      }

      // Validação de telefone se fornecido
      if (candidatoData.telefone !== undefined && candidatoData.telefone) {
        // Aceita ambos os formatos: (XX) XXXXX-XXXX ou (XX) X XXXX-XXXX
        const telefoneRegex = /^\(\d{2}\)\s\d{1}\s\d{4}-\d{4}$/
        const telefoneAlternativoRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/

        if (!telefoneRegex.test(candidatoData.telefone) && !telefoneAlternativoRegex.test(candidatoData.telefone)) {
          return {
            data: null,
            error: 'Telefone deve estar no formato (XX) X XXXX-XXXX'
          }
        }
      }

      // Chamada para a API
      const candidato = await candidatosApiService.updateCandidatoByUserId(userId, candidatoData)
      
      return {
        data: candidato,
        error: undefined
      }
    } catch (error) {
      console.error('Update candidato perfil by user id service error:', error)
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      }
    }
  }

  async deleteCandidatoPerfil(id: string): Promise<CandidatosResponse> {
    try {
      // Validação básica
      if (!id) {
        return {
          data: null,
          error: 'ID do candidato é obrigatório'
        }
      }

      // Chamada para a API
      await candidatosApiService.deleteCandidato(id)
      
      return {
        data: null,
        error: undefined
      }
    } catch (error) {
      console.error('Delete candidato perfil service error:', error)
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      }
    }
  }

  async listCandidatos(filters?: CandidatosFilters): Promise<{ data: CandidatosListResponse | null; error?: string }> {
    try {
      // Validação de filtros
      if (filters?.anos_experiencia_min !== undefined && filters.anos_experiencia_min < 0) {
        return {
          data: null,
          error: 'Anos mínimos de experiência não pode ser negativo'
        }
      }

      if (filters?.anos_experiencia_max !== undefined && filters.anos_experiencia_max < 0) {
        return {
          data: null,
          error: 'Anos máximos de experiência não pode ser negativo'
        }
      }

      if (filters?.anos_experiencia_min !== undefined && filters?.anos_experiencia_max !== undefined) {
        if (filters.anos_experiencia_min > filters.anos_experiencia_max) {
          return {
            data: null,
            error: 'Anos mínimos não pode ser maior que anos máximos'
          }
        }
      }

      // Chamada para a API
      const response = await candidatosApiService.listCandidatos(filters)
      
      return {
        data: response,
        error: undefined
      }
    } catch (error) {
      console.error('List candidatos service error:', error)
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      }
    }
  }
}

// Export singleton instance
export const candidatosService = new CandidatosService()
