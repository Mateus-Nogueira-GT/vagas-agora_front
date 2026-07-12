// Auth types following BMAD frontend architecture standards
export interface User {
  id: string
  email: string
  role: 'candidato' | 'empregador' | 'admin'
  nome?: string
  perfil_verificado?: boolean
  ultimo_acesso?: string
  ativo?: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  nome: string
  email: string
  password: string
  confirmPassword: string
  role: 'candidato' | 'empregador'
  nomeEmpresa?: string // Obrigatório apenas para empregadores
}

export interface AuthResponse {
  user: User | null
  error?: string
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export type AuthError = {
  message: string
  code?: string
}
