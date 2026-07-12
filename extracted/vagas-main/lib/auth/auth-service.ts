// Auth service following BMAD business logic patterns
import { authApiService } from '../api/auth-api'
import { User, LoginCredentials, RegisterCredentials, AuthResponse, AuthError } from './auth-types'
import { supabase } from '../supabase'

class AuthService {
  private currentUser: User | null = null

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Validação básica
      if (!credentials.email || !credentials.password) {
        return {
          user: null,
          error: 'Email e senha são obrigatórios'
        }
      }

      if (!this.isValidEmail(credentials.email)) {
        return {
          user: null,
          error: 'Email inválido'
        }
      }

      // Chamada para a API
      const response = await authApiService.login(credentials)

      // Verificar se há erro de conta desativada
      if (response.error === 'CONTA_DESATIVADA') {
        return {
          user: null,
          error: 'Sua conta está desativada. Entre em contato com o administrador.'
        }
      }

      if (response.user) {
        this.currentUser = response.user
        // Salvar no localStorage para persistência básica APENAS no cliente
        if (typeof window !== 'undefined') {
          localStorage.setItem('currentUser', JSON.stringify(response.user))
        }

        // Atualizar último acesso
        await this.updateLastAccess(response.user.id)
      }

      return response
    } catch (error) {
      console.error('Login service error:', error)
      return {
        user: null,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      }
    }
  }

  async logout(): Promise<void> {
    try {
      // Usar Supabase diretamente para logout
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Supabase logout error:', error)
      }
    } catch (error) {
      console.error('Logout service error:', error)
    } finally {
      this.currentUser = null
      if (typeof window !== 'undefined') {
        localStorage.removeItem('currentUser')
      }
    }
  }

  getCurrentUser(): User | null {
    if (this.currentUser) {
      return this.currentUser
    }

    // Tentar recuperar do localStorage APENAS no cliente
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('currentUser')
      if (storedUser) {
        try {
          this.currentUser = JSON.parse(storedUser)
          return this.currentUser
        } catch {
          localStorage.removeItem('currentUser')
        }
      }
    }

    return null
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      // Validação básica
      if (!credentials.nome || !credentials.email || !credentials.password) {
        return {
          user: null,
          error: 'Todos os campos são obrigatórios'
        }
      }

      // Validar nome da empresa para empregadores
      if (credentials.role === 'empregador' && !credentials.nomeEmpresa) {
        return {
          user: null,
          error: 'Nome da empresa é obrigatório'
        }
      }

      if (!this.isValidEmail(credentials.email)) {
        return {
          user: null,
          error: 'Email inválido'
        }
      }

      if (credentials.password.length < 8) {
        return {
          user: null,
          error: 'A senha deve ter no mínimo 8 caracteres'
        }
      }

      if (!/[A-Z]/.test(credentials.password)) {
        return {
          user: null,
          error: 'A senha deve conter pelo menos uma letra maiúscula'
        }
      }

      if (!/[a-z]/.test(credentials.password)) {
        return {
          user: null,
          error: 'A senha deve conter pelo menos uma letra minúscula'
        }
      }

      if (credentials.password !== credentials.confirmPassword) {
        return {
          user: null,
          error: 'As senhas não coincidem'
        }
      }

      // Chamada para a API
      const response = await authApiService.register(credentials)

      if (response.user) {
        this.currentUser = response.user
        // Salvar no localStorage para persistência básica APENAS no cliente
        if (typeof window !== 'undefined') {
          localStorage.setItem('currentUser', JSON.stringify(response.user))
        }
      }

      return response
    } catch (error) {
      console.error('Register service error:', error)
      return {
        user: null,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      }
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  private async updateLastAccess(userId: string): Promise<void> {
    try {
      // Atualizar último acesso via API do Supabase
      const url = `https://ltjqoxzkkvtxhgyharsm.supabase.co/rest/v1/profiles?id=eq.${userId}`
      
      await fetch(url, {
        method: 'PATCH',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0anFveHpra3Z0eGhneWhhcnNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5NTEzMDIsImV4cCI6MjA3MDUyNzMwMn0.KDAP71OyXdgV3UVBcSccoizMCYGof_-6KeFYnhMPN04',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0anFveHpra3Z0eGhneWhhcnNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5NTEzMDIsImV4cCI6MjA3MDUyNzMwMn0.KDAP71OyXdgV3UVBcSccoizMCYGof_-6KeFYnhMPN04',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ultimo_acesso: new Date().toISOString()
        }),
      })
    } catch (error) {
      console.error('Failed to update last access:', error)
    }
  }

  // Método para redirecionar baseado no role do usuário
  getRedirectPath(user: User): string {
    switch (user.role) {
      case 'admin':
        return '/admin'
      case 'empregador':
        return '/empregador'
      case 'candidato':
        return '/candidato'
      default:
        return '/candidato'
    }
  }
}

export const authService = new AuthService()
