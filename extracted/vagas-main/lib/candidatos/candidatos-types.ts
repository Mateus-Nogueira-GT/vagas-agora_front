// Candidatos types following BMAD business logic patterns

// Base interfaces for candidatos data
export interface Endereco {
  cep?: string
  logradouro?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  estado?: string
  pais?: string
  latitude?: number
  longitude?: number
}

export interface Idioma {
  idioma: string
  nivel: 'basico' | 'intermediario' | 'avancado' | 'fluente' | 'nativo'
}

export interface Formacao {
  instituicao: string
  curso: string
  nivel: 'tecnico' | 'graduacao' | 'pos' | 'mestrado' | 'doutorado'
  status: 'cursando' | 'concluido' | 'trancado' | 'incompleto'
  data_inicio?: string
  data_fim?: string
  descricao?: string
}

export interface Certificacao {
  nome: string
  instituicao: string
  data_obtencao?: string
  data_expiracao?: string
  credencial_url?: string
  descricao?: string
}

export interface ExperienciaProfissional {
  empresa: string
  cargo: string
  data_inicio: string
  data_fim?: string
  atual?: boolean
  descricao?: string
  localizacao?: string
}

// Novas interfaces para campos JSONB
export interface RedesSociais {
  linkedin_url?: string
  github_url?: string
  portfolio_url?: string
  site_pessoal?: string
  instagram_url?: string
  facebook_url?: string
  youtube_url?: string
}

export interface Disponibilidade {
  tipo: 'imediato' | 'com_aviso_previo'
  data_inicio?: string
  observacoes?: string
}

// Main candidato interface
export interface Candidato {
  id: string
  user_id: string
  nome_completo: string
  email?: string
  data_nascimento?: string
  cpf?: string
  telefone?: string
  genero?: string
  raca_etnia?: string
  orientacao_sexual?: string
  pcd?: string
  titulo_profissional?: string
  bio?: string
  anos_experiencia?: number
  nivel_senioridade?: string
  endereco?: Endereco
  salario_pretendido_de?: number
  salario_pretendido_ate?: number
  tipo_contratacao_preferido?: string
  modelo_trabalho_preferido?: string

  // Redes sociais (mantido para compatibilidade, mas use redes_sociais JSONB)
  portfolio_url?: string
  linkedin_url?: string
  github_url?: string
  site_pessoal?: string
  instagram_url?: string
  facebook_url?: string
  youtube_url?: string

  // Novos campos JSONB
  redes_sociais?: RedesSociais
  disponibilidade?: Disponibilidade

  // Disponibilidade legada (mantido para compatibilidade)
  data_disponibilidade?: string
  disponivel_remoto?: boolean
  disponivel_relocacao?: boolean

  // Currículo PDF
  curriculo_pdf_url?: string
  curriculo_pdf_nome?: string

  // Habilitação
  possui_cnh?: string
  categoria_cnh?: string
  veiculo_proprio?: string

  // Disponibilidade
  mudanca_cidade?: boolean
  mudanca_estado?: boolean
  mudanca_pais?: boolean
  disponibilidade_tipo?: 'imediato' | 'com_aviso_previo'
  aceita_presencial?: boolean
  aceita_hibrido?: boolean
  aceita_remoto?: boolean

  // Skills e formação
  habilidades_tecnicas?: string[]
  idiomas?: Idioma[]
  formacao?: Formacao[]
  certificacoes?: Certificacao[]
  experiencias?: ExperienciaProfissional[]
  disponivel_trabalho?: boolean
  aceita_propostas?: boolean
  visibilidade_perfil?: 'publico' | 'restrito' | 'privado'
  foto_url?: string
  created_at?: string
  updated_at?: string
}

// Request interfaces
export interface CreateCandidatoRequest {
  nome_completo: string
  data_nascimento?: string
  cpf?: string
  telefone?: string
  genero?: string
  raca_etnia?: string
  orientacao_sexual?: string
  pcd?: string
  titulo_profissional?: string
  bio?: string
  anos_experiencia?: number
  nivel_senioridade?: string
  endereco?: Endereco
  salario_pretendido_de?: number
  salario_pretendido_ate?: number
  tipo_contratacao_preferido?: string
  modelo_trabalho_preferido?: string
  portfolio_url?: string
  linkedin_url?: string
  github_url?: string
  site_pessoal?: string
  instagram_url?: string
  facebook_url?: string
  youtube_url?: string
  data_disponibilidade?: string
  disponivel_remoto?: boolean
  disponivel_relocacao?: boolean
  habilidades_tecnicas?: string[]
  idiomas?: Idioma[]
  formacao?: Formacao[]
  certificacoes?: Certificacao[]
  experiencias?: ExperienciaProfissional[]
  disponivel_trabalho?: boolean
  aceita_propostas?: boolean
  visibilidade_perfil?: 'publico' | 'restrito' | 'privado'
  foto_url?: string
  redes_sociais?: RedesSociais
  disponibilidade?: Disponibilidade
  curriculo_pdf_url?: string
  curriculo_pdf_nome?: string
  possui_cnh?: string
  categoria_cnh?: string
  veiculo_proprio?: string
  mudanca_cidade?: boolean
  mudanca_estado?: boolean
  mudanca_pais?: boolean
  disponibilidade_tipo?: 'imediato' | 'com_aviso_previo'
  aceita_presencial?: boolean
  aceita_hibrido?: boolean
  aceita_remoto?: boolean
}

export interface UpdateCandidatoRequest {
  id: string
  nome_completo?: string
  data_nascimento?: string
  telefone?: string
  genero?: string
  titulo_profissional?: string
  bio?: string
  anos_experiencia?: number
  nivel_senioridade?: string
  endereco?: Endereco
  salario_pretendido_de?: number
  salario_pretendido_ate?: number
  tipo_contratacao_preferido?: string
  modelo_trabalho_preferido?: string
  portfolio_url?: string
  linkedin_url?: string
  github_url?: string
  site_pessoal?: string
  instagram_url?: string
  facebook_url?: string
  youtube_url?: string
  data_disponibilidade?: string
  disponivel_remoto?: boolean
  disponivel_relocacao?: boolean
  habilidades_tecnicas?: string[]
  idiomas?: Idioma[]
  formacao?: Formacao[]
  certificacoes?: Certificacao[]
  experiencias?: ExperienciaProfissional[]
  disponivel_trabalho?: boolean
  aceita_propostas?: boolean
  visibilidade_perfil?: 'publico' | 'restrito' | 'privado'
  foto_url?: string
  redes_sociais?: RedesSociais
  disponibilidade?: Disponibilidade
  curriculo_pdf_url?: string
  curriculo_pdf_nome?: string
  possui_cnh?: string
  categoria_cnh?: string
  veiculo_proprio?: string
  mudanca_cidade?: boolean
  mudanca_estado?: boolean
  mudanca_pais?: boolean
  disponibilidade_tipo?: 'imediato' | 'com_aviso_previo'
  aceita_presencial?: boolean
  aceita_hibrido?: boolean
  aceita_remoto?: boolean
}

// Response interfaces following BMAD patterns
export interface CandidatosResponse {
  data: Candidato | null
  error?: string
}

export interface CandidatosListResponse {
  candidatos: Candidato[]
  total: number
  page: number
  limit: number
}

// Filters interface
export interface CandidatosFilters {
  search?: string
  nivel_senioridade?: string
  anos_experiencia_min?: number
  anos_experiencia_max?: number
  disponivel_remoto?: boolean
  disponivel_relocacao?: boolean
  habilidades?: string[]
  page?: number
  limit?: number
}

// Visualizações do currículo
export interface CurriculoVisualizacao {
  id: string
  candidato_id: string
  visualizador_id: string
  data_visualizacao: string
}

export interface CurriculoVisualizacoesStats {
  total_visualizacoes: number
  visualizacoes_mes_atual: number
  visualizacoes_mes_anterior: number
  percentual_crescimento: number
}

export interface RegistrarVisualizacaoRequest {
  candidato_id: string
  visualizador_id: string
}
