/**
 * Formata um número para o formato de moeda brasileira (Real)
 * Exemplo: 5000 -> "5.000"
 *
 * @param value - Valor numérico a ser formatado
 * @returns String formatada no padrão brasileiro (sem R$ e sem centavos)
 */
export function formatCurrency(value: number | string | undefined): string {
  if (!value && value !== 0) return ''

  const numValue = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(numValue)) return ''

  return Math.floor(numValue).toLocaleString('pt-BR')
}

/**
 * Remove a formatação de moeda e retorna apenas o número
 * Exemplo: "5.000" -> 5000
 *
 * @param formattedValue - String formatada
 * @returns Número sem formatação
 */
export function parseCurrency(formattedValue: string): number {
  if (!formattedValue) return 0

  // Remove tudo que não é número
  const cleanValue = formattedValue.replace(/\D/g, '')

  return parseInt(cleanValue, 10) || 0
}

/**
 * Formata o valor enquanto o usuário digita
 * Exemplo: usuário digita "5000" -> exibe "5.000"
 *
 * @param value - Valor digitado
 * @returns Valor formatado
 */
export function formatCurrencyInput(value: string): string {
  // Remove tudo que não é número
  const numericValue = value.replace(/\D/g, '')

  if (!numericValue) return ''

  // Converte para número e formata
  const numberValue = parseInt(numericValue, 10)

  return formatCurrency(numberValue)
}

/**
 * Formata um valor para exibição com prefixo R$
 * Exemplo: 5000 -> "R$ 5.000"
 *
 * @param value - Valor numérico
 * @returns String formatada com R$
 */
export function formatCurrencyDisplay(value: number | undefined): string {
  if (!value && value !== 0) return 'A combinar'

  return `R$ ${formatCurrency(value)}`
}

/**
 * Formata range de salário
 * Exemplo: (5000, 10000) -> "R$ 5.000 - R$ 10.000"
 *
 * @param min - Salário mínimo
 * @param max - Salário máximo
 * @returns String formatada
 */
export function formatSalaryRange(min?: number, max?: number): string {
  if (!min && !max) return 'A combinar'
  if (min && !max) return `A partir de R$ ${formatCurrency(min)}`
  if (!min && max) return `Até R$ ${formatCurrency(max)}`
  return `R$ ${formatCurrency(min!)} - R$ ${formatCurrency(max!)}`
}
