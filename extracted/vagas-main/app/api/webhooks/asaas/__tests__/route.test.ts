import { POST } from '../route'
import { NextRequest } from 'next/server'
import crypto from 'crypto'

describe('POST /api/webhooks/asaas', () => {
  const mockWebhookSecret = 'test-secret-123'
  const originalEnv = process.env.ASAAS_WEBHOOK_SECRET

  beforeEach(() => {
    process.env.ASAAS_WEBHOOK_SECRET = mockWebhookSecret
    jest.clearAllMocks()
  })

  afterEach(() => {
    process.env.ASAAS_WEBHOOK_SECRET = originalEnv
  })

  // Helper para criar NextRequest
  const createNextRequest = (body: string, headers?: Record<string, string>) => {
    return new NextRequest('http://localhost/api/webhooks/asaas', {
      method: 'POST',
      body,
      headers: headers || {}
    })
  }

  it('deve rejeitar webhook sem assinatura quando secret está configurado', async () => {
    const req = createNextRequest(JSON.stringify({ event: 'PAYMENT_RECEIVED' }))

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toContain('inválida')
  })

  it('deve rejeitar webhook com assinatura inválida', async () => {
    const body = JSON.stringify({ event: 'PAYMENT_RECEIVED' })

    const req = createNextRequest(body, {
      'asaas-access-token': 'assinatura-invalida'
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toContain('inválida')
  })

  it('deve aceitar webhook com assinatura válida', async () => {
    const body = JSON.stringify({ 
      event: 'SUBSCRIPTION_CREATED', 
      subscription: { id: 'sub_123', status: 'ACTIVE' } 
    })

    const signature = crypto
      .createHmac('sha256', mockWebhookSecret)
      .update(body)
      .digest('hex')

    const req = createNextRequest(body, {
      'asaas-access-token': signature
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it('deve rejeitar webhook quando o secret não está configurado', async () => {
    delete process.env.ASAAS_WEBHOOK_SECRET

    const req = createNextRequest(JSON.stringify({ 
      event: 'SUBSCRIPTION_CREATED', 
      subscription: { id: 'sub_456', status: 'ACTIVE' } 
    }))

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(503)
    expect(data.error).toContain('indisponível')
  })

  it('deve rejeitar JSON inválido', async () => {
    const body = '{invalid-json'
    const signature = crypto
      .createHmac('sha256', mockWebhookSecret)
      .update(body)
      .digest('hex')

    const response = await POST(createNextRequest(body, {
      'asaas-access-token': signature
    }))

    expect(response.status).toBe(400)
  })
})
