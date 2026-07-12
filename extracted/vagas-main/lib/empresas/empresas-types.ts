// Empresa types following BMAD frontend architecture standards
export interface Empresa {
  id: string
  user_id: string
  nome: string
  cnpj?: string
  razao_social?: string
  descricao?: string
  site?: string
  telefone?: string
  email?: string
  endereco?: {
    logradouro?: string
    numero?: string
    complemento?: string
    bairro?: string
    cidade?: string
    estado?: string
    cep?: string
    latitude?: number
    longitude?: number
  }
  setor: string  // Campo obrigatório
  tamanho_empresa?: 'Startup' | 'Pequena' | 'Média' | 'Grande'
  fundacao_ano?: number
  logo_url?: string
  linkedin?: string
  instagram?: string
  facebook?: string
  beneficios?: string[]
  cultura_valores?: string[]
  created_at?: string
  updated_at?: string
}

export interface CreateEmpresaRequest {
  nome: string
  cnpj?: string
  razao_social?: string
  descricao?: string
  site?: string
  telefone?: string
  email?: string
  endereco?: {
    logradouro?: string
    numero?: string
    complemento?: string
    bairro?: string
    cidade?: string
    estado?: string
    cep?: string
    latitude?: number
    longitude?: number
  }
  setor: string  // Campo obrigatório
  tamanho_empresa?: 'Startup' | 'Pequena' | 'Média' | 'Grande'
  fundacao_ano?: number
  logo_url?: string
  linkedin?: string
  instagram?: string
  facebook?: string
  beneficios?: string[]
  cultura_valores?: string[]
}

export interface UpdateEmpresaRequest extends Partial<CreateEmpresaRequest> {
  id: string
}

export interface EmpresaResponse {
  success: boolean
  data?: Empresa
  error?: string
}

export interface EmpresasResponse {
  success: boolean
  data?: Empresa[]
  error?: string
}