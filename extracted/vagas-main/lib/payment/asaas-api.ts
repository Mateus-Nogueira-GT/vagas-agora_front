// ASAAS API Integration Service
import { getAsaasApiKey, ASAAS_BASE_URL, DEV_MODE } from './asaas-config'

export interface AsaasCustomer {
  id?: string
  name: string
  cpfCnpj: string
  email: string
  phone?: string
  mobilePhone?: string
  address?: string
  addressNumber?: string
  complement?: string
  province?: string
  postalCode?: string
  cityName?: string
  state?: string
  country?: string
}

export interface AsaasSubscription {
  id?: string
  customer: string // Customer ID
  billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX'
  value: number
  nextDueDate: string // YYYY-MM-DD format
  cycle: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'YEARLY'
  description?: string
  endDate?: string
  maxPayments?: number
  externalReference?: string
}

export interface AsaasSubscriptionResponse {
  object: string
  id: string
  dateCreated: string
  customer: string
  paymentLink?: string
  billingType: string
  cycle: string
  value: number
  nextDueDate: string
  endDate?: string
  description: string
  status: string
  discount?: any
  fine?: any
  interest?: any
  deleted: boolean
  maxPayments?: number
  externalReference?: string
  checkoutSession?: string
  split?: any[]
}

export interface AsaasPayment {
  id: string
  customer: string
  subscription?: string
  billingType: string
  value: number
  netValue?: number
  originalValue?: number
  interestValue?: number
  description?: string
  status: string
  dueDate: string
  paymentDate?: string
  clientPaymentDate?: string
  installmentNumber?: number
  invoiceUrl?: string
  bankSlipUrl?: string
  transactionReceiptUrl?: string
}

class AsaasApiService {
  private apiKey: string
  private baseUrl: string

  constructor() {
    // Carregar a API Key usando a função de configuração
    this.apiKey = getAsaasApiKey()
    this.baseUrl = ASAAS_BASE_URL

  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; error?: string }> {

    // Modo de desenvolvimento - simular respostas
    if (DEV_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500)) // Simular delay

      if (endpoint === '/customers') {
        return {
          success: true,
          data: {
            id: 'cus_mock_' + Date.now(),
            name: 'Cliente Teste',
            email: 'teste@exemplo.com'
          } as any
        }
      }

      if (endpoint === '/subscriptions') {
        return {
          success: true,
          data: {
            id: 'sub_mock_' + Date.now(),
            customer: 'cus_mock_123',
            status: 'ACTIVE',
            value: 19.90,
            nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          } as any
        }
      }

      // Simular busca de pagamentos de uma assinatura
      if (endpoint.includes('/subscriptions/') && endpoint.includes('/payments')) {
        return {
          success: true,
          data: {
            data: [
              {
                id: 'pay_mock_' + Date.now(),
                status: 'PENDING',
                bankSlipUrl: 'https://sandbox.asaas.com/i/mock-boleto-' + Date.now(),
                invoiceUrl: 'https://sandbox.asaas.com/c/mock-pix-' + Date.now()
              }
            ]
          } as any
        }
      }

      return {
        success: true,
        data: {} as any
      }
    }

    const url = `${this.baseUrl}${endpoint}`

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'access_token': this.apiKey,
        'User-Agent': 'Vagas Agora API Client',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)

      const responseData = await response.json()

      if (!response.ok) {
        console.error('[ASAAS] API Error:', responseData)
        return {
          success: false,
          error: responseData.errors?.[0]?.description || responseData.message || `HTTP error! status: ${response.status}`
        }
      }

      return {
        success: true,
        data: responseData
      }
    } catch (error) {
      console.error('[ASAAS] Request failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Request failed'
      }
    }
  }

  // Customer methods
  async createCustomer(customer: AsaasCustomer): Promise<{ success: boolean; data?: any; error?: string }> {

    const result = await this.makeRequest('/customers', {
      method: 'POST',
      body: JSON.stringify(customer),
    })

    return result
  }

  async getCustomer(customerId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.makeRequest(`/customers/${customerId}`)
  }

  async updateCustomer(customerId: string, customer: Partial<AsaasCustomer>): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.makeRequest(`/customers/${customerId}`, {
      method: 'PUT',
      body: JSON.stringify(customer),
    })
  }

  // Subscription methods
  async createSubscription(subscription: AsaasSubscription): Promise<{ success: boolean; data?: any; error?: string }> {

    const result = await this.makeRequest('/subscriptions', {
      method: 'POST',
      body: JSON.stringify(subscription),
    })

    return result
  }

  async getSubscription(subscriptionId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.makeRequest(`/subscriptions/${subscriptionId}`)
  }

  async updateSubscription(subscriptionId: string, subscription: Partial<AsaasSubscription>): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.makeRequest(`/subscriptions/${subscriptionId}`, {
      method: 'PUT',
      body: JSON.stringify(subscription),
    })
  }

  async cancelSubscription(subscriptionId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.makeRequest(`/subscriptions/${subscriptionId}`, {
      method: 'DELETE',
    })
  }

  // Payment methods
  async getPayment(paymentId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.makeRequest(`/payments/${paymentId}`)
  }

  async getSubscriptionPayments(subscriptionId: string, limit = 20, offset = 0): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.makeRequest(`/subscriptions/${subscriptionId}/payments?limit=${limit}&offset=${offset}`)
  }

  // Generate payment link for boleto or pix
  async generatePaymentLink(paymentId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.makeRequest(`/payments/${paymentId}/identificationField`)
  }
}

// Lazy initialization para evitar carregar a API Key no momento do import
let _asaasApiServiceInstance: AsaasApiService | null = null

export const asaasApiService = {
  get instance(): AsaasApiService {
    if (!_asaasApiServiceInstance) {
      _asaasApiServiceInstance = new AsaasApiService()
    }
    return _asaasApiServiceInstance
  },

  // Métodos proxy para manter compatibilidade
  createCustomer: (customer: AsaasCustomer) => asaasApiService.instance.createCustomer(customer),
  getCustomer: (customerId: string) => asaasApiService.instance.getCustomer(customerId),
  updateCustomer: (customerId: string, customer: Partial<AsaasCustomer>) => asaasApiService.instance.updateCustomer(customerId, customer),
  createSubscription: (subscription: AsaasSubscription) => asaasApiService.instance.createSubscription(subscription),
  getSubscription: (subscriptionId: string) => asaasApiService.instance.getSubscription(subscriptionId),
  updateSubscription: (subscriptionId: string, subscription: Partial<AsaasSubscription>) => asaasApiService.instance.updateSubscription(subscriptionId, subscription),
  cancelSubscription: (subscriptionId: string) => asaasApiService.instance.cancelSubscription(subscriptionId),
  getPayment: (paymentId: string) => asaasApiService.instance.getPayment(paymentId),
  getSubscriptionPayments: (subscriptionId: string, limit = 20, offset = 0) => asaasApiService.instance.getSubscriptionPayments(subscriptionId, limit, offset),
  generatePaymentLink: (paymentId: string) => asaasApiService.instance.generatePaymentLink(paymentId),
}
