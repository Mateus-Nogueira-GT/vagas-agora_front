// Utilitários para controle de status de vagas

export type VagaStatus = 'Rascunho' | 'Ativa' | 'Encerrada' | 'Preenchida'

/**
 * Verifica se uma vaga pode ser editada baseado no seu status
 * Apenas vagas com status "Rascunho" podem ser editadas
 */
export function canEditVaga(status: VagaStatus): boolean {
  return status === 'Rascunho'
}

/**
 * Verifica se uma vaga pode ser excluída baseado no seu status
 * Apenas vagas com status "Rascunho" podem ser excluídas
 */
export function canDeleteVaga(status: VagaStatus): boolean {
  return status === 'Rascunho'
}

/**
 * Retorna a mensagem de tooltip para ações bloqueadas
 */
export function getBlockedActionTooltip(action: 'editar' | 'excluir'): string {
  return `Para ${action} esta vaga, primeiro altere o status para "Rascunho" (não publicado)`
}

/**
 * Retorna a cor do badge baseado no status
 */
export function getStatusColor(status: VagaStatus): string {
  switch (status) {
    case 'Rascunho':
      return '#6B7280' // Gray
    case 'Ativa':
      return '#059669' // Green
    case 'Encerrada':
      return '#DC2626' // Red
    case 'Preenchida':
      return '#7C3AED' // Purple
    default:
      return '#6B7280'
  }
}

/**
 * Retorna o texto descritivo do status
 */
export function getStatusLabel(status: VagaStatus): string {
  switch (status) {
    case 'Rascunho':
      return 'Não Publicado'
    case 'Ativa':
      return 'Publicado e Ativo'
    case 'Encerrada':
      return 'Encerrado'
    case 'Preenchida':
      return 'Preenchido'
    default:
      return status
  }
}
