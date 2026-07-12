/**
 * Formata número de telefone brasileiro para o padrão (00) 0 0000-0000
 */
export function formatarTelefone(valor: string): string {
  // Remove tudo que não é número
  const numeros = valor.replace(/\D/g, '')

  // Limita a 11 dígitos (DDD + 9 dígitos)
  const numeroLimitado = numeros.slice(0, 11)

  // Aplica a máscara conforme o tamanho
  if (numeroLimitado.length <= 2) {
    return numeroLimitado
  } else if (numeroLimitado.length <= 3) {
    return `(${numeroLimitado.slice(0, 2)}) ${numeroLimitado.slice(2)}`
  } else if (numeroLimitado.length <= 7) {
    return `(${numeroLimitado.slice(0, 2)}) ${numeroLimitado.slice(2, 3)} ${numeroLimitado.slice(3)}`
  } else {
    return `(${numeroLimitado.slice(0, 2)}) ${numeroLimitado.slice(2, 3)} ${numeroLimitado.slice(3, 7)}-${numeroLimitado.slice(7, 11)}`
  }
}

/**
 * Remove formatação do telefone, deixando apenas números
 */
export function limparTelefone(valor: string): string {
  return valor.replace(/\D/g, '')
}

/**
 * Converte número brasileiro para formato WhatsApp (com DDI +55)
 * Exemplo: (11) 9 1234-5678 -> 5511912345678
 */
export function formatarParaWhatsApp(telefone: string): string {
  const numeros = limparTelefone(telefone)

  // Se já tem 55 na frente, retorna direto
  if (numeros.startsWith('55') && numeros.length === 13) {
    return numeros
  }

  // Adiciona 55 na frente
  return `55${numeros}`
}

/**
 * Valida se o telefone brasileiro está completo
 */
export function validarTelefoneBrasileiro(telefone: string): boolean {
  const numeros = limparTelefone(telefone)
  // Deve ter 11 dígitos (DDD + 9 dígitos com o 9 na frente)
  // ou 10 dígitos (DDD + 8 dígitos para fixo)
  return numeros.length === 10 || numeros.length === 11
}
