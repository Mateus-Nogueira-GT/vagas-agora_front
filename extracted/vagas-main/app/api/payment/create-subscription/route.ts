import { NextRequest, NextResponse } from 'next/server'
import { paymentService, CreateSubscriptionData } from '@/lib/payment/payment-service'
import { verifyAuth } from '@/lib/auth/api-auth'

export async function POST(request: NextRequest) {
  try {
    // 1. Verificar autenticação
    const auth = await verifyAuth()

    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error },
        { status: 401 }
      )
    }

    const body = await request.json()

    // 2. Usar o ID do usuário autenticado (mais seguro!)
    const userId = auth.user?.id
    const { billingType, value = 19.90, cycle = 'YEARLY', description, subscriptionType = 'CURRICULO_VERIFICACAO' } = body

    // Validação básica
    if (!userId || !billingType) {
      return NextResponse.json(
        { error: 'userId e billingType são obrigatórios' },
        { status: 400 }
      )
    }

    if (!['BOLETO', 'CREDIT_CARD', 'PIX'].includes(billingType)) {
      return NextResponse.json(
        { error: 'billingType deve ser BOLETO, CREDIT_CARD ou PIX' },
        { status: 400 }
      )
    }

    if (!['YEARLY', 'MONTHLY', 'QUARTERLY'].includes(cycle)) {
      return NextResponse.json(
        { error: 'cycle deve ser YEARLY, MONTHLY ou QUARTERLY' },
        { status: 400 }
      )
    }

    // Verificar se usuário já tem assinatura ativa OU pendente do mesmo tipo
    const statusResult = await paymentService.getUserSubscriptionStatus(userId, subscriptionType)

    if (!statusResult.success) {
      return NextResponse.json(
        { error: statusResult.error || 'Erro ao verificar status da assinatura' },
        { status: 500 }
      )
    }

    if (statusResult.isActive) {
      return NextResponse.json(
        { error: 'Você já possui uma assinatura ativa. Aguarde o vencimento ou cancele para criar uma nova.' },
        { status: 400 }
      )
    }

    // Se há assinatura PENDING, passar o ID para sobrescrever
    const pendingSubscriptionId = statusResult.subscription?.status === 'PENDING'
      ? statusResult.subscription.id
      : undefined

    // Criar assinatura (ou sobrescrever PENDING)
    const subscriptionData: CreateSubscriptionData = {
      userId,
      billingType,
      value,
      cycle,
      description: description || 'Assinatura Premium',
      subscriptionType: subscriptionType,
      replacePendingId: pendingSubscriptionId // ID da assinatura PENDING a ser substituída
    }

    const result = await paymentService.createSubscription(subscriptionData)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Erro ao criar assinatura' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      subscription: result.subscription,
      paymentUrl: result.paymentUrl
    })

  } catch (error) {
    console.error('Erro na API de criação de assinatura:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
