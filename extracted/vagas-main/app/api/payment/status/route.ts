import { NextResponse } from 'next/server'
import { paymentService } from '@/lib/payment/payment-service'
import { verifyAuth } from '@/lib/auth/api-auth'

export async function GET() {
  try {
    const auth = await verifyAuth()

    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error },
        { status: 401 }
      )
    }

    const result = await paymentService.getUserSubscriptionStatus(
      auth.user.id,
      undefined,
      auth.supabase
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Erro ao verificar status' },
        { status: 500 }
      )
    }

    const subscription = result.subscription
      ? {
          id: result.subscription.id,
          status: result.subscription.status,
          billingType: result.subscription.billing_type,
          value: result.subscription.value,
          cycle: result.subscription.cycle,
          nextDueDate: result.subscription.next_due_date,
          subscriptionType: result.subscription.subscription_type,
          verificationActive: result.subscription.verification_active,
          verificationExpiresAt: result.subscription.verification_expires_at,
        }
      : null

    return NextResponse.json({
      success: true,
      isActive: result.isActive || false,
      subscription
    })

  } catch (error) {
    console.error('Erro na API de status de pagamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
