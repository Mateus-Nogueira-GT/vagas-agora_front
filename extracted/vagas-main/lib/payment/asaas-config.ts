// Configuração do Asaas - carregada apenas no servidor
export function getAsaasApiKey(): string {
  const apiKey = process.env.ASAAS_API_KEY

  if (!apiKey) {
    console.error('[ASAAS CONFIG] ASAAS_API_KEY não encontrada em process.env')
    console.error('[ASAAS CONFIG] Variáveis disponíveis:', Object.keys(process.env).filter(k => k.includes('ASAAS')))
    throw new Error('ASAAS_API_KEY não está configurada')
  }

  return apiKey
}

export const ASAAS_BASE_URL = 'https://api-sandbox.asaas.com/v3'
export const DEV_MODE = false
