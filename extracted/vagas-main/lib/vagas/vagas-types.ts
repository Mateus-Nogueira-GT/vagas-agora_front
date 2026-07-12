// Job types following BMAD frontend architecture standards

// Enum para níveis de experiência (matching database enum)
export type NivelExperiencia =
  | 'estagio'
  | 'assistente'
  | 'operacional'
  | 'analista'
  | 'coordenacao'
  | 'gerencia'
  | 'diretoria'
  | 'especialista'

export interface EmpresaBasic {
  id: string
  nome: string
  logo_url?: string
  descricao?: string
  site?: string
  setor?: string
  endereco?: {
    logradouro?: string
    cidade?: string
    estado?: string
    cep?: string
    bairro?: string
  }
}

export interface Vaga {
  id: string
  empregador_id: string
  titulo: string
  descricao?: string
  cidade?: string
  estado?: string
  localizacao?: string
  latitude?: number
  longitude?: number
  nivel?: NivelExperiencia
  tipo_contratacao?: string
  modelo_trabalho?: string
  responsabilidades?: string[]
  requisitos?: string[]
  diferenciais?: string[]
  beneficios?: string[] // Benefícios combinados (empresa + vaga específica)
  etapas_processo?: string[]
  salario_de?: number
  salario_ate?: number
  data_expiracao?: string
  remoto?: boolean
  num_vagas?: number
  status: 'Rascunho' | 'Ativa' | 'Encerrada' | 'Preenchida'
  data_publicacao?: string
  total_candidatos?: number // Contagem de candidatos para a vaga
  // Campos de contato
  contato_email?: string
  contato_whatsapp?: string
  area_atuacao?: string
  // Campos da empresa (vindos via JOIN)
  empresa_nome?: string
  empresa_logo_url?: string
  empresa_site?: string
  empresa_descricao?: string
  empresa_setor?: string
  empresa_endereco?: {
    logradouro?: string
    cidade?: string
    estado?: string
    cep?: string
    bairro?: string
  }
}

export interface CreateVagaRequest {
  titulo: string
  descricao?: string
  cidade?: string
  estado?: string
  localizacao?: string
  latitude?: number
  longitude?: number
  nivel?: NivelExperiencia
  tipo_contratacao?: string
  modelo_trabalho?: string
  responsabilidades?: string[]
  requisitos?: string[]
  diferenciais?: string[]
  beneficios?: string[]
  etapas_processo?: string[]
  sobre_empresa?: string
  salario_de?: number
  salario_ate?: number
  data_expiracao?: string
  remoto?: boolean
  num_vagas?: number
  status?: 'Rascunho' | 'Ativa' | 'Encerrada' | 'Preenchida'
  contato_email?: string
  contato_whatsapp?: string
  area_atuacao?: string
}

export interface UpdateVagaRequest extends Partial<CreateVagaRequest> {
  id: string
  status?: 'Rascunho' | 'Ativa' | 'Encerrada' | 'Preenchida'
}

export interface VagasListResponse {
  vagas: Vaga[]
  total: number
  page: number
  limit: number
}

export interface VagasFilters {
  status?: 'Rascunho' | 'Ativa' | 'Encerrada' | 'Preenchida' | 'todas'
  search?: string
  page?: number
  limit?: number
  offset?: number
}

export interface VagaMetrics {
  total_vagas: number
  vagas_ativas: number
  vagas_encerradas: number
  maior_numero_candidatos: number
}

export interface VagaWithCandidatos extends Vaga {
  candidatos_count: number
  candidaturas?: Candidatura[]
  empresa?: EmpresaBasic
}

export interface Candidatura {
  id: string
  vaga_id: string
  candidato_id: string
  curriculo_compartilhado?: boolean
  data_candidatura: string
  status: 'Em análise' | 'Aprovado' | 'Rejeitado' | 'Finalizado'
  etapa?: number
  carta_apresentacao?: string
  anexos?: Array<{
    nome: string
    url: string
    tipo: string
    tamanho?: number
  }>
  notas_processo?: string
  avaliacao_empregador?: number
  feedback_empregador?: string
  candidato?: {
    id?: string
    email?: string
  }
  candidato_dados?: {
    nome_completo: string
    titulo_profissional: string
    nivel_senioridade: string
    anos_experiencia: number
    habilidades_tecnicas: string[]
    email?: string
    telefone?: string
    cidade?: string
    estado?: string
    data_nascimento?: string
    resumo_profissional?: string
    foto_url?: string
    experiencia_profissional?: Array<{
      empresa: string
      cargo: string
      inicio: string
      fim?: string
      descricao?: string
      atual: boolean
    }>
    formacao_academica?: Array<{
      instituicao: string
      curso: string
      nivel: string
      inicio: string
      fim?: string
      status: string
    }>
    idiomas?: Array<{
      idioma: string
      nivel: string
    }>
    links_portfolio?: Array<{
      titulo: string
      url: string
      tipo: string
    }>
    linkedin_url?: string
    github_url?: string
  }
}

export type VagasError = {
  message: string
  code?: string
}

export interface VagasResponse {
  data: Vaga[] | Vaga | VagaMetrics | VagasListResponse | null
  error?: string
}

// ============================================================================
// PUBLIC JOB SEARCH TYPES (for candidates)
// ============================================================================

export interface PublicVagasFilters {
  busca?: string
  localizacao?: string
  estado?: string
  cidade?: string
  modelo_trabalho?: 'Presencial' | 'Remoto' | 'Híbrido'
  tipo_contratacao?: 'CLT' | 'PJ' | 'Estágio' | 'Freelancer'
  nivel?: NivelExperiencia
  salario_min?: number
  salario_max?: number
  orderBy?: 'data_publicacao' | 'salario_de' | 'titulo'
  orderDirection?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

export interface PublicVagasResponse {
  vagas: Vaga[]
  total: number
  page: number
  totalPages: number
}
