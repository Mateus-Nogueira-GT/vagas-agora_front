import { GET } from '../route'
import { verifyAuth } from '@/lib/auth/api-auth'
import { paymentService } from '@/lib/payment/payment-service'

jest.mock('@/lib/auth/api-auth')
jest.mock('@/lib/payment/payment-service', () => ({
  paymentService: {
    getUserSubscriptionStatus: jest.fn(),
  },
}))

describe('GET /api/payment/status', () => {
  const supabase = { from: jest.fn() }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('retorna 401 sem usuário autenticado', async () => {
    ;(verifyAuth as jest.Mock).mockResolvedValue({
      authorized: false,
      user: null,
      supabase,
      error: 'Não autenticado',
    })

    const response = await GET()

    expect(response.status).toBe(401)
    expect(paymentService.getUserSubscriptionStatus).not.toHaveBeenCalled()
  })

  it('consulta somente o ID do usuário validado', async () => {
    ;(verifyAuth as jest.Mock).mockResolvedValue({
      authorized: true,
      user: { id: 'authenticated-user' },
      supabase,
      error: null,
    })
    ;(paymentService.getUserSubscriptionStatus as jest.Mock).mockResolvedValue({
      success: true,
      isActive: true,
      subscription: {
        id: 10,
        user_id: 'authenticated-user',
        asaas_subscription_id: 'must-not-leak',
        status: 'ACTIVE',
        billing_type: 'PIX',
        value: 19.9,
        cycle: 'YEARLY',
        next_due_date: '2027-07-12',
        subscription_type: 'CURRICULO_VERIFICACAO',
        verification_active: true,
        verification_expires_at: '2027-07-12T00:00:00.000Z',
      },
    })

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(paymentService.getUserSubscriptionStatus).toHaveBeenCalledWith(
      'authenticated-user',
      undefined,
      supabase
    )
    expect(body.subscription.user_id).toBeUndefined()
    expect(body.subscription.asaas_subscription_id).toBeUndefined()
    expect(body.subscription.verificationActive).toBe(true)
  })

  it('retorna assinatura nula quando o usuário não possui assinatura', async () => {
    ;(verifyAuth as jest.Mock).mockResolvedValue({
      authorized: true,
      user: { id: 'authenticated-user' },
      supabase,
      error: null,
    })
    ;(paymentService.getUserSubscriptionStatus as jest.Mock).mockResolvedValue({
      success: true,
      isActive: false,
    })

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({ success: true, isActive: false, subscription: null })
  })
})
