// Types para telas de admin

export interface AdminMetrics {
  total_candidatos: number
  total_empregadores: number
  total_vagas: number
  vagas_ativas: number
  total_candidaturas: number
  total_empresas: number
  candidatos_ativos_mes: number
  empregadores_ativos_mes: number
  candidaturas_mes: number
  vagas_publicadas_mes: number
}

export interface AdminCandidato {
  id: string
  email: string
  nome_completo?: string
  data_cadastro: string
  ultimo_acesso?: string
  ativo: boolean
  titulo_profissional?: string
  nivel_senioridade?: string
  cidade?: string
  estado?: string
  total_candidaturas: number
  foto_url?: string
}

export interface AdminEmpregador {
  id: string
  email: string
  nome_empresa?: string
  cnpj?: string
  data_cadastro: string
  ultimo_acesso?: string
  ativo: boolean
  setor?: string
  tamanho_empresa?: string
  cidade?: string
  estado?: string
  total_vagas: number
  vagas_ativas: number
  total_candidaturas: number
  candidaturas_mes?: number
  logo_url?: string
}

export interface AdminVaga {
  id: string
  titulo: string
  empresa_nome: string
  cidade?: string
  estado?: string
  status: 'Rascunho' | 'Ativa' | 'Encerrada' | 'Preenchida'
  data_publicacao: string
  total_candidaturas: number
  salario_de?: number
  salario_ate?: number
  modelo_trabalho?: string
  tipo_contratacao?: string
}

export interface CandidatosFilters {
  search?: string
  ativo?: boolean
  nivel_senioridade?: string
  page?: number
  limit?: number
}

export interface EmpregadoresFilters {
  search?: string
  ativo?: boolean
  setor?: string
  tamanho_empresa?: string
  page?: number
  limit?: number
}

export interface VagasFilters {
  search?: string
  status?: 'Rascunho' | 'Ativa' | 'Encerrada' | 'Preenchida' | 'todas'
  setor?: string
  modelo_trabalho?: string
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  totalPages: number
}

export interface AdminResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// Opções para filtros
export const NIVEIS_SENIORIDADE = [
  'Estagiário',
  'Júnior',
  'Pleno',
  'Sênior',
  'Especialista',
  'Líder',
  'Gerente',
  'Diretor'
] as const

export const SETORES_EMPRESA = [
  'Tecnologia',
  'Saúde',
  'Educação',
  'Financeiro',
  'Varejo',
  'Indústria',
  'Serviços',
  'Consultoria',
  'Marketing',
  'Governo',
  'ONGs',
  'Outros'
] as const

export const TAMANHOS_EMPRESA = [
  'Startup',
  'Pequena',
  'Média',
  'Grande',
  'Multinacional'
] as const

export const MODELOS_TRABALHO = [
  'Presencial',
  'Remoto',
  'Híbrido'
] as const

export const TIPOS_CONTRATACAO = [
  'CLT',
  'PJ',
  'Estágio',
  'Freelancer',
  'Temporário'
] as const

export const STATUS_VAGA = [
  'Rascunho',
  'Ativa',
  'Encerrada',
  'Preenchida'
] as const
