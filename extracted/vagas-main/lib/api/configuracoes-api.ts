// API service for user settings
import { env, validateConfig } from '../config/env'
import { createClient } from '@supabase/supabase-js'

export interface UsuarioConfiguracao {
  id: string
  email: string
  nome_completo?: string
  cpf?: string
  foto_url?: string
  data_ultima_alteracao?: string
}

export interface AlterarSenhaRequest {
  senhaAtual: string
  novaSenha: string
}

class ConfiguracoesApiService {
  private readonly baseUrl: string
  private readonly apiKey: string

  constructor() {
    validateConfig()
    this.baseUrl = env.supabase.url
    this.apiKey = env.supabase.anonKey
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/rest/v1${endpoint}`

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'apikey': this.apiKey,
        'Authorization': `Bearer ${this.apiKey}`,
        'Prefer': 'return=representation',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  async getDadosUsuario(userId: string): Promise<UsuarioConfiguracao | null> {
    try {
      // Buscar dados do perfil incluindo role e nome
      const profileQuery = `/profiles?id=eq.${userId}&select=id,email,role,nome`
      const profileResult = await this.makeRequest<any[]>(profileQuery)

      if (!profileResult || profileResult.length === 0) {
        return null
      }

      const profile = profileResult[0]

      // Para admin, usar dados do profile
      if (profile.role === 'admin') {
        return {
          id: profile.id,
          email: profile.email,
          nome_completo: profile.nome || profile.email?.split('@')[0] || '',
          cpf: '',
          data_ultima_alteracao: undefined
        }
      }

      // Para candidatos, buscar dados na tabela candidatos
      if (profile.role === 'candidato') {
        const candidatoQuery = `/candidatos?user_id=eq.${userId}&select=nome_completo,cpf,foto_url,updated_at`
        const candidatoResult = await this.makeRequest<any[]>(candidatoQuery)
        const candidato = candidatoResult && candidatoResult.length > 0 ? candidatoResult[0] : null

        return {
          id: profile.id,
          email: profile.email,
          nome_completo: candidato?.nome_completo || '',
          cpf: candidato?.cpf || '',
          foto_url: candidato?.foto_url || '',
          data_ultima_alteracao: candidato?.updated_at
        }
      }

      // Para empregadores, buscar dados na tabela empresas
      if (profile.role === 'empregador') {
        const empresaQuery = `/empresas?user_id=eq.${userId}&select=nome,updated_at`
        const empresaResult = await this.makeRequest<any[]>(empresaQuery)
        const empresa = empresaResult && empresaResult.length > 0 ? empresaResult[0] : null

        return {
          id: profile.id,
          email: profile.email,
          nome_completo: empresa?.nome || '',
          cpf: '',
          data_ultima_alteracao: empresa?.updated_at
        }
      }

      // Fallback para roles desconhecidos
      return {
        id: profile.id,
        email: profile.email,
        nome_completo: '',
        cpf: '',
        data_ultima_alteracao: undefined
      }
    } catch (error) {
      console.error('Get dados usuario error:', error)
      throw error
    }
  }

  async atualizarDadosUsuario(userId: string, dados: Partial<UsuarioConfiguracao>): Promise<void> {
    try {
      // Primeiro, descobrir o role do usuário
      const profileQuery = `/profiles?id=eq.${userId}&select=id,email,role`
      const profileResult = await this.makeRequest<any[]>(profileQuery)

      if (!profileResult || profileResult.length === 0) {
        throw new Error('Usuário não encontrado')
      }

      const profile = profileResult[0]

      // Atualizar email no perfil se fornecido
      if (dados.email) {
        await this.makeRequest(`/profiles?id=eq.${userId}`, {
          method: 'PATCH',
          body: JSON.stringify({ email: dados.email })
        })
      }

      // Para admin, atualizar nome no próprio profile
      if (profile.role === 'admin') {
        if (dados.nome_completo) {
          await this.makeRequest(`/profiles?id=eq.${userId}`, {
            method: 'PATCH',
            body: JSON.stringify({ nome: dados.nome_completo })
          })
        }
        return
      }

      // Para candidatos, atualizar dados na tabela candidatos
      if (profile.role === 'candidato' && (dados.nome_completo || dados.cpf)) {
        // Buscar dados atuais do candidato para comparar o CPF
        const candidatoQuery = `/candidatos?user_id=eq.${userId}&select=cpf`
        const candidatoResult = await this.makeRequest<any[]>(candidatoQuery)
        const candidatoAtual = candidatoResult && candidatoResult.length > 0 ? candidatoResult[0] : null

        const candidatoData: any = {
          updated_at: new Date().toISOString()
        }

        if (dados.nome_completo) candidatoData.nome_completo = dados.nome_completo

        // Só incluir CPF se foi alterado ou está vazio no banco
        if (dados.cpf && dados.cpf !== candidatoAtual?.cpf) {
          candidatoData.cpf = dados.cpf
        }

        await this.makeRequest(`/candidatos?user_id=eq.${userId}`, {
          method: 'PATCH',
          body: JSON.stringify(candidatoData)
        })
      }

      // Para empregadores, atualizar nome na tabela empresas
      if (profile.role === 'empregador' && dados.nome_completo) {
        const empresaData: any = {
          nome: dados.nome_completo,
          updated_at: new Date().toISOString()
        }

        await this.makeRequest(`/empresas?user_id=eq.${userId}`, {
          method: 'PATCH',
          body: JSON.stringify(empresaData)
        })
      }
    } catch (error) {
      console.error('Atualizar dados usuario error:', error)
      throw error
    }
  }

  async alterarSenha(userEmail: string, dados: AlterarSenhaRequest): Promise<void> {
    try {
      validateConfig()

      // Criar cliente Supabase
      const supabase = createClient(this.baseUrl, this.apiKey)

      // Primeiro, validar a senha atual
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: dados.senhaAtual
      })

      if (signInError) {
        throw new Error('Senha atual incorreta')
      }

      // Alterar a senha
      const { error: updateError } = await supabase.auth.updateUser({
        password: dados.novaSenha
      })

      if (updateError) {
        throw new Error(updateError.message || 'Erro ao alterar senha')
      }
    } catch (error) {
      console.error('Alterar senha error:', error)
      throw error
    }
  }

  async desativarConta(userId: string): Promise<void> {
    try {
      await this.makeRequest(`/profiles?id=eq.${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ ativo: false })
      })
    } catch (error) {
      console.error('Desativar conta error:', error)
      throw error
    }
  }

  async excluirConta(userId: string): Promise<void> {
    try {
      // Marcar perfil como inativo primeiro
      await this.desativarConta(userId)

      // Nota: A exclusão completa seria feita em background
      // por uma função administrativa para manter integridade dos dados
    } catch (error) {
      console.error('Excluir conta error:', error)
      throw error
    }
  }
}

export const configuracoesApiService = new ConfiguracoesApiService()
