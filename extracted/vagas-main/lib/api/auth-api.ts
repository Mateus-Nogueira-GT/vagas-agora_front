// API service following BMAD service template patterns
import { User, LoginCredentials, RegisterCredentials, AuthResponse, AuthError } from '../auth/auth-types'
import { supabase } from '../supabase'

class AuthApiService {

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Login usando Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (error) {
        return {
          user: null,
          error: this.translateAuthError(error.message)
        }
      }

      if (!data.user) {
        return {
          user: null,
          error: 'Falha no login'
        }
      }

      // Buscar perfil do usuário na tabela profiles
      const userProfile = await this.getUserProfile(data.user.id)

      return {
        user: userProfile,
        error: undefined
      }
    } catch (error) {
      return {
        user: null,
        error: error instanceof Error ? error.message : 'Falha no login'
      }
    }
  }

  private async getUserProfile(userId: string): Promise<User> {
    // Buscar perfil do usuário na tabela profiles usando Supabase client
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error || !profile) {
      throw new Error('Perfil do usuário não encontrado')
    }

    // Verificar se o usuário está ativo
    if (profile.ativo === false) {
      throw new Error('CONTA_DESATIVADA')
    }

    return {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      nome: profile.nome,
      perfil_verificado: profile.perfil_verificado,
      ultimo_acesso: profile.ultimo_acesso,
      ativo: profile.ativo,
    }
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      // Criar usuário no Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined,
          data: {
            nome: credentials.nome,
            role: credentials.role,
          }
        }
      })

      if (error) {
        console.error('Erro no signup:', error)
        return {
          user: null,
          error: this.translateAuthError(error.message)
        }
      }

      if (!data.user) {
        return {
          user: null,
          error: 'Falha no cadastro'
        }
      }

      // Verificar se o usuário já existe (data.user existe mas session é null)
      // Isso acontece quando o email já foi registrado mas ainda não confirmado
      if (data.user && !data.session) {
      }

      // Atualizar ou criar perfil na tabela profiles (UPSERT)
      // O trigger handle_new_user() já cria um perfil básico, então vamos atualizar
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email: credentials.email,
          nome: credentials.nome,
          role: credentials.role,
          ativo: true,
        }, {
          onConflict: 'id'
        })

      if (profileError) {
        console.error('Erro ao atualizar perfil:', profileError)
        return {
          user: null,
          error: `Erro ao criar perfil: ${profileError.message || 'Erro desconhecido'}`
        }
      }

      // Criar registro na tabela específica (candidatos ou empresas) usando UPSERT
      if (credentials.role === 'candidato') {
        const { error: candidatoError } = await supabase
          .from('candidatos')
          .upsert({
            user_id: data.user.id,
            nome_completo: credentials.nome,
          }, {
            onConflict: 'user_id'
          })

        if (candidatoError) {
          console.error('Erro ao criar perfil de candidato:', candidatoError)
          // Não bloquear o cadastro se houver erro aqui
        }
      } else if (credentials.role === 'empregador') {
        // Validar que nomeEmpresa foi fornecido
        if (!credentials.nomeEmpresa) {
          return {
            user: null,
            error: 'Nome da empresa é obrigatório'
          }
        }

        const { error: empresaError } = await supabase
          .from('empresas')
          .upsert({
            user_id: data.user.id,
            nome: credentials.nomeEmpresa, // Nome da empresa
            email: credentials.email,
          }, {
            onConflict: 'user_id'
          })

        if (empresaError) {
          console.error('Erro ao criar perfil de empregador:', empresaError)
          return {
            user: null,
            error: 'Erro ao criar perfil da empresa'
          }
        }
      }

      // Retornar usuário criado
      return {
        user: {
          id: data.user.id,
          email: credentials.email,
          nome: credentials.nome,
          role: credentials.role,
          perfil_verificado: false,
        },
        error: undefined
      }
    } catch (error) {
      return {
        user: null,
        error: error instanceof Error ? error.message : 'Falha no cadastro'
      }
    }
  }

  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  private translateAuthError(errorMessage: string): string {
    // Traduzir mensagens de erro comuns do Supabase
    if (errorMessage.includes('Invalid login credentials')) {
      return 'Email ou senha incorretos'
    }
    if (errorMessage.includes('Email not confirmed')) {
      return 'Por favor, confirme seu email antes de fazer login'
    }
    if (errorMessage.includes('User already registered') || errorMessage.includes('user_already_exists')) {
      return 'Este email já está cadastrado. Por favor, faça login ou use outro email.'
    }
    if (errorMessage.includes('Password should be at least')) {
      return 'A senha deve ter pelo menos 6 caracteres'
    }
    if (errorMessage.includes('duplicate key value violates unique constraint')) {
      return 'Este email já está em uso'
    }
    return errorMessage
  }
}

export const authApiService = new AuthApiService()
