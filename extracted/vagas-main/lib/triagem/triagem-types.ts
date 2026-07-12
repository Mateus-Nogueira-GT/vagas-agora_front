export interface TriagemConfig {
  id: string
  empregador_id: string
  openrouter_api_key_encrypted?: string
  triagem_habilitada: boolean
  modelo_ia: string
  max_candidatos_por_triagem: number
  webhook_secret?: string
  created_at: string
  updated_at: string
}

export interface Triagem {
  id: string
  vaga_id: string
  empregador_id: string
  status: 'pendente' | 'processando' | 'concluida' | 'erro'
  total_candidatos: number
  candidatos_processados: number
  candidatos_aprovados: number
  candidatos_rejeitados: number
  iniciada_em?: string
  concluida_em?: string
  erro_mensagem?: string
  modelo_usado?: string
  created_at: string
  updated_at: string
}

export interface TriagemResultado {
  id: string
  triagem_id: string
  candidatura_id: string
  candidato_id: string
  nota: number
  classificacao: 'altamente_qualificado' | 'qualificado' | 'com_ressalvas' | 'nao_recomendado'
  resumo: string
  pontos_fortes: string[]
  pontos_fracos: string[]
  compatibilidade_requisitos: Record<string, number>
  recomendacao: 'aprovar' | 'analisar' | 'rejeitar'
  processado_em: string
}

export interface N8NTriagemPayload {
  triagem_id: string
  vaga: {
    id: string
    titulo: string
    descricao?: string
    requisitos?: string[]
    responsabilidades?: string[]
    diferenciais?: string[]
    nivel?: string
    modelo_trabalho?: string
    salario_de?: number
    salario_ate?: number
  }
  candidatos: Array<{
    candidatura_id: string
    candidato_id: string
    nome_completo: string
    titulo_profissional?: string
    anos_experiencia?: number
    habilidades_tecnicas?: string[]
    formacao?: Array<{ instituicao: string; curso: string; nivel: string }>
    experiencias?: Array<{ empresa: string; cargo: string; descricao?: string }>
    carta_apresentacao?: string
    cidade?: string
    estado?: string
  }>
  openrouter_api_key: string
  modelo_ia: string
  callback_url: string
  webhook_secret: string
}

export interface N8NTriagemCallback {
  triagem_id: string
  webhook_secret: string
  status: 'concluida' | 'erro'
  resultados?: Array<{
    candidatura_id: string
    candidato_id: string
    nota: number
    classificacao: string
    resumo: string
    pontos_fortes: string[]
    pontos_fracos: string[]
    compatibilidade_requisitos: Record<string, number>
    recomendacao: 'aprovar' | 'analisar' | 'rejeitar'
  }>
  erro_mensagem?: string
}