// Products Service - Gerenciamento de produtos e planos do sistema
import { supabase } from '@/lib/supabase'

export interface Product {
  id: number
  code: string
  name: string
  description: string
  type: 'subscription' | 'one_time'
  target_audience: 'candidato' | 'empregador'
  price_monthly?: number
  price_yearly?: number
  duration_days?: number
  features: string[]
  active: boolean
  created_at: string
  updated_at: string
}

class ProductsService {

  /**
   * Buscar todos os produtos ativos
   */
  async getActiveProducts(targetAudience?: 'candidato' | 'empregador'): Promise<{ success: boolean; products?: Product[]; error?: string }> {
    try {
      let query = supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .order('price_yearly', { ascending: true })

      if (targetAudience) {
        query = query.eq('target_audience', targetAudience)
      }

      const { data, error } = await query

      if (error) {
        console.error('Erro ao buscar produtos:', error)
        return { success: false, error: 'Erro ao buscar produtos' }
      }

      return { success: true, products: data as Product[] }

    } catch (error) {
      console.error('Erro inesperado ao buscar produtos:', error)
      return { success: false, error: 'Erro inesperado' }
    }
  }

  /**
   * Buscar produto por código
   */
  async getProductByCode(code: string): Promise<{ success: boolean; product?: Product; error?: string }> {
    try {

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('code', code)
        .eq('active', true)
        .maybeSingle()


      if (error) {
        console.error(`[PRODUCTS SERVICE] Erro ao buscar produto ${code}:`, error)
        return { success: false, error: `Erro no banco: ${error.message}` }
      }

      if (!data) {
        console.error(`[PRODUCTS SERVICE] Produto ${code} não encontrado ou inativo`)
        return { success: false, error: 'Produto não encontrado' }
      }

      return { success: true, product: data as Product }

    } catch (error) {
      console.error('[PRODUCTS SERVICE] Erro inesperado ao buscar produto:', error)
      return { success: false, error: 'Erro inesperado' }
    }
  }

  /**
   * Buscar produto por ID
   */
  async getProductById(id: number): Promise<{ success: boolean; product?: Product; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('active', true)
        .maybeSingle()

      if (error) {
        console.error(`Erro ao buscar produto ID ${id}:`, error)
        return { success: false, error: 'Produto não encontrado' }
      }

      if (!data) {
        console.error(`Produto ID ${id} não encontrado ou inativo`)
        return { success: false, error: 'Produto não encontrado' }
      }

      return { success: true, product: data as Product }

    } catch (error) {
      console.error('Erro inesperado ao buscar produto:', error)
      return { success: false, error: 'Erro inesperado' }
    }
  }

  /**
   * Criar novo produto (apenas admin)
   */
  async createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; product?: Product; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar produto:', error)
        return { success: false, error: 'Erro ao criar produto' }
      }

      return { success: true, product: data as Product }

    } catch (error) {
      console.error('Erro inesperado ao criar produto:', error)
      return { success: false, error: 'Erro inesperado' }
    }
  }

  /**
   * Atualizar produto (apenas admin)
   */
  async updateProduct(id: number, updates: Partial<Product>): Promise<{ success: boolean; product?: Product; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Erro ao atualizar produto:', error)
        return { success: false, error: 'Erro ao atualizar produto' }
      }

      return { success: true, product: data as Product }

    } catch (error) {
      console.error('Erro inesperado ao atualizar produto:', error)
      return { success: false, error: 'Erro inesperado' }
    }
  }

  /**
   * Desativar produto (soft delete)
   */
  async deactivateProduct(id: number): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) {
        console.error('Erro ao desativar produto:', error)
        return { success: false, error: 'Erro ao desativar produto' }
      }

      return { success: true }

    } catch (error) {
      console.error('Erro inesperado ao desativar produto:', error)
      return { success: false, error: 'Erro inesperado' }
    }
  }

  /**
   * Buscar produtos por público-alvo
   */
  async getProductsByAudience(targetAudience: 'candidato' | 'empregador'): Promise<{ success: boolean; products?: Product[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('target_audience', targetAudience)
        .eq('active', true)
        .order('price_monthly', { ascending: true })

      if (error) {
        console.error('Erro ao buscar produtos:', error)
        return { success: false, error: 'Erro ao buscar produtos' }
      }

      return { success: true, products: data as Product[] }

    } catch (error) {
      console.error('Erro inesperado ao buscar produtos:', error)
      return { success: false, error: 'Erro inesperado' }
    }
  }
}

export const productsService = new ProductsService()
