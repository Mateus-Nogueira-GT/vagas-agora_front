export interface Candidatura {
  id: string
  vaga_id: string
  candidato_id: string
  data_candidatura: string
  status: 'Em análise' | 'Aprovado' | 'Rejeitado' | 'Finalizado'
  etapa?: number
  curriculo_compartilhado?: boolean
  carta_apresentacao?: string
  anexos?: any[]
  notas_processo?: string
  data_ultima_interacao?: string
  avaliacao_empregador?: number
  feedback_empregador?: string
  // Relacionamentos
  vaga?: {
    id: string
    titulo: string
    salario_de?: number
    salario_ate?: number
    modelo_trabalho?: string
    cidade?: string
    estado?: string
    descricao?: string
    empregador?: {
      nome: string
      logo_url?: string
    }
  }
  candidato?: {
    id: string
    nome_completo?: string
    email?: string
  }
}

export interface CandidaturaResponse {
  success: boolean
  data?: Candidatura[]
  error?: string
}

export interface CandidaturaFilters {
  status?: string
  search?: string
}

// Status mapping para exibição
export const statusConfig = {
  'Em análise': {
    label: 'Em análise',
    variant: 'secondary' as const,
    progress: 1
  },
  'Aprovado': {
    label: 'Aprovado',
    variant: 'default' as const,
    progress: 2
  },
  'Rejeitado': {
    label: 'Rejeitado',
    variant: 'destructive' as const,
    progress: 0
  },
  'Finalizado': {
    label: 'Finalizado',
    variant: 'outline' as const,
    progress: 3
  }
}
