// Empresas API service following BMAD architecture
import { supabase } from '../supabase'
import type { 
  Empresa, 
  CreateEmpresaRequest, 
  UpdateEmpresaRequest,
  EmpresaResponse,
  EmpresasResponse
} from '../empresas/empresas-types'

class EmpresasApiService {
  /**
   * Get empresa by user ID
   */
  async getEmpresaByUserId(userId: string): Promise<EmpresaResponse> {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .eq('user_id', userId)
        .single()


      if (error) {
        if (error.code === 'PGRST116') {
          return { success: false, error: 'Empresa não encontrada' }
        }
        throw error
      }

      return { success: true, data }
    } catch (error) {
      console.error('❌ Error fetching empresa by user ID:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      }
    }
  }

  /**
   * Get empresa by ID
   */
  async getEmpresaById(empresaId: string): Promise<EmpresaResponse> {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .eq('id', empresaId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return { success: false, error: 'Empresa não encontrada' }
        }
        throw error
      }

      return { success: true, data }
    } catch (error) {
      console.error('Error fetching empresa by ID:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      }
    }
  }

  /**
   * Create a new empresa
   */
  async createEmpresa(empresaData: CreateEmpresaRequest): Promise<EmpresaResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' }
      }

      const { data, error } = await supabase
        .from('empresas')
        .insert({
          ...empresaData,
          user_id: user.id
        })
        .select()
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Error creating empresa:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao criar empresa' 
      }
    }
  }

  /**
   * Update empresa
   */
  async updateEmpresa(empresaData: UpdateEmpresaRequest): Promise<EmpresaResponse> {
    try {
      const { id, ...updateData } = empresaData

      const { data, error } = await supabase
        .from('empresas')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Error updating empresa:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao atualizar empresa' 
      }
    }
  }

  /**
   * Delete empresa
   */
  async deleteEmpresa(empresaId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('empresas')
        .delete()
        .eq('id', empresaId)

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Error deleting empresa:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao deletar empresa' 
      }
    }
  }

  /**
   * Check if user has empresa
   */
  async hasEmpresa(): Promise<{ success: boolean; hasEmpresa: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return { success: false, hasEmpresa: false, error: 'Usuário não autenticado' }
      }

      const { count, error } = await supabase
        .from('empresas')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if (error) throw error

      return { success: true, hasEmpresa: (count ?? 0) > 0 }
    } catch (error) {
      console.error('Error checking if user has empresa:', error)
      return { 
        success: false, 
        hasEmpresa: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      }
    }
  }
}

export const empresasApi = new EmpresasApiService()
