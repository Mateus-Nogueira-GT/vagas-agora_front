/**
 * Utilitários para formatação de telefone brasileiro
 */

/**
 * Formata um número de telefone brasileiro
 * @param phone - Número de telefone (apenas dígitos ou com formatação)
 * @returns Número formatado como (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return ''

  // Remove tudo que não é dígito
  const numbers = phone.replace(/\D/g, '')

  // Não formata se não tiver pelo menos 10 dígitos (DDD + número)
  if (numbers.length < 10) return phone

  // Celular: (XX) XXXXX-XXXX
  if (numbers.length === 11) {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }

  // Fixo: (XX) XXXX-XXXX
  if (numbers.length === 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }

  return phone
}

/**
 * Remove a formatação do telefone, deixando apenas os dígitos
 * @param phone - Número de telefone formatado
 * @returns Apenas os dígitos do telefone
 */
export function unformatPhoneNumber(phone: string): string {
  return phone.replace(/\D/g, '')
}

/**
 * Valida se um número de telefone brasileiro é válido
 * @param phone - Número de telefone
 * @returns true se o telefone é válido
 */
export function isValidPhoneNumber(phone: string): boolean {
  const numbers = unformatPhoneNumber(phone)

  // Deve ter 10 (fixo) ou 11 (celular) dígitos
  if (numbers.length !== 10 && numbers.length !== 11) {
    return false
  }

  // DDD não pode começar com 0
  const ddd = parseInt(numbers.substring(0, 2))
  if (ddd < 11 || ddd > 99) {
    return false
  }

  // Se for celular (11 dígitos), o terceiro dígito deve ser 9
  if (numbers.length === 11 && numbers[2] !== '9') {
    return false
  }

  return true
}

/**
 * Aplica máscara de telefone enquanto o usuário digita
 * @param value - Valor atual do input
 * @returns Valor formatado
 */
export function maskPhoneInput(value: string): string {
  const numbers = value.replace(/\D/g, '')

  if (numbers.length <= 2) {
    return numbers
  }

  if (numbers.length <= 6) {
    return numbers.replace(/(\d{2})(\d{0,4})/, '($1) $2')
  }

  if (numbers.length <= 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
  }

  return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
}
