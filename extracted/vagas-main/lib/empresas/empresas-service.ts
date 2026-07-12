// Empresas service following BMAD architecture
import { supabase } from '../supabase'
import { empresasApi } from '../api/empresas-api'
import { authService } from '../auth/auth-service'
import type { 
  Empresa, 
  CreateEmpresaRequest, 
  UpdateEmpresaRequest 
} from './empresas-types'

class EmpresasService {
  /**
   * Get current user's empresa
   */
  async getCurrentUserEmpresa(): Promise<Empresa | null> {
    try {
      
      // Primeiro vamos verificar o authService também
      const authUser = authService.getCurrentUser()
      
      let userId: string | null = null

      // Get current user from auth
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        userId = user.id
      } else {
        
        if (authUser && authUser.id) {
          userId = authUser.id
        } else {
          return null
        }
      }

      
      // Buscar empresa diretamente pelo user_id
      const response = await empresasApi.getEmpresaByUserId(userId)
      return response.success ? response.data! : null
    } catch (error) {
      console.error('❌ Error getting current user empresa:', error)
      return null
    }
  }

  /**
   * Create empresa with validation
   */
  async createEmpresa(empresaData: CreateEmpresaRequest): Promise<{
    success: boolean
    data?: Empresa
    errors?: Record<string, string>
  }> {
    try {
      // Validate required fields
      const errors: Record<string, string> = {}

      if (!empresaData.nome?.trim()) {
        errors.nome = 'Nome da empresa é obrigatório'
      }

      if (empresaData.cnpj && !this.isValidCNPJ(empresaData.cnpj)) {
        errors.cnpj = 'CNPJ inválido'
      }

      if (Object.keys(errors).length > 0) {
        return { success: false, errors }
      }

      const response = await empresasApi.createEmpresa(empresaData)
      
      if (response.success) {
        return { success: true, data: response.data }
      } else {
        return { success: false, errors: { general: response.error || 'Erro ao criar empresa' } }
      }
    } catch (error) {
      console.error('Error in createEmpresa service:', error)
      return { 
        success: false, 
        errors: { general: 'Erro interno do servidor' } 
      }
    }
  }

  /**
   * Update empresa with validation
   */
  async updateEmpresa(empresaData: UpdateEmpresaRequest): Promise<{
    success: boolean
    data?: Empresa
    errors?: Record<string, string>
  }> {
    try {
      const errors: Record<string, string> = {}

      if (empresaData.nome !== undefined && !empresaData.nome?.trim()) {
        errors.nome = 'Nome da empresa é obrigatório'
      }

      if (empresaData.cnpj && !this.isValidCNPJ(empresaData.cnpj)) {
        errors.cnpj = 'CNPJ inválido'
      }

      if (Object.keys(errors).length > 0) {
        return { success: false, errors }
      }

      const response = await empresasApi.updateEmpresa(empresaData)
      
      if (response.success) {
        return { success: true, data: response.data }
      } else {
        return { success: false, errors: { general: response.error || 'Erro ao atualizar empresa' } }
      }
    } catch (error) {
      console.error('Error in updateEmpresa service:', error)
      return { 
        success: false, 
        errors: { general: 'Erro interno do servidor' } 
      }
    }
  }

  /**
   * Format empresa data for display
   */
  formatEmpresaForDisplay(empresa: Empresa): {
    displayName: string
    displayAddress: string
    displaySize: string
    displayFoundedYear: string
  } {
    const displayName = empresa.nome || 'Empresa sem nome'
    
    const displayAddress = empresa.endereco 
      ? `${empresa.endereco.cidade || ''}, ${empresa.endereco.estado || ''}`.replace(/^,\s*|,\s*$/g, '') || 'Endereço não informado'
      : 'Endereço não informado'
    
    const displaySize = empresa.tamanho_empresa || 'Tamanho não informado'
    
    const displayFoundedYear = empresa.fundacao_ano 
      ? `Fundada em ${empresa.fundacao_ano}`
      : 'Ano de fundação não informado'

    return {
      displayName,
      displayAddress,
      displaySize,
      displayFoundedYear
    }
  }

  /**
   * Validate CNPJ format
   */
  private isValidCNPJ(cnpj: string): boolean {
    // Remove special characters
    const cleanCNPJ = cnpj.replace(/[^\d]/g, '')
    
    // Check if has 14 digits
    if (cleanCNPJ.length !== 14) return false
    
    // Check if all digits are the same
    if (/^(\d)\1+$/.test(cleanCNPJ)) return false
    
    // Validate CNPJ algorithm
    let sum = 0
    let weight = 2
    
    // First verification digit
    for (let i = 11; i >= 0; i--) {
      sum += parseInt(cleanCNPJ[i]) * weight
      weight = weight === 9 ? 2 : weight + 1
    }
    
    const firstDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11)
    if (parseInt(cleanCNPJ[12]) !== firstDigit) return false
    
    // Second verification digit
    sum = 0
    weight = 2
    
    for (let i = 12; i >= 0; i--) {
      sum += parseInt(cleanCNPJ[i]) * weight
      weight = weight === 9 ? 2 : weight + 1
    }
    
    const secondDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11)
    return parseInt(cleanCNPJ[13]) === secondDigit
  }

  /**
   * Format CNPJ for display
   */
  formatCNPJ(cnpj: string): string {
    const cleanCNPJ = cnpj.replace(/[^\d]/g, '')
    if (cleanCNPJ.length === 14) {
      return cleanCNPJ.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
    }
    return cnpj
  }
}

export const empresasService = new EmpresasService()
