import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import crypto from 'crypto'

// Função para verificar assinatura do webhook
function verifyWebhookSignature(rawBody: string, signature: string | null): boolean | null {
  const webhookSecret = process.env.ASAAS_WEBHOOK_SECRET
  
  if (!webhookSecret) {
    console.error('[ASAAS WEBHOOK] ASAAS_WEBHOOK_SECRET não configurado')
    return null
  }
  
  if (!signature) {
    return false
  }
  
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex')
  
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  } catch {
    return false
  }
}

// Webhook ÚNICO do Asaas para receber notificações de PAGAMENTOS e ASSINATURAS
export async function POST(request: NextRequest) {
  try {
    // 1. Pegar o corpo como texto para verificação
    const rawBody = await request.text()
    
    // 2. Verificar assinatura do webhook
    const signature = request.headers.get('asaas-access-token') ||
                     request.headers.get('x-asaas-signature')
    
    const signatureStatus = verifyWebhookSignature(rawBody, signature)

    if (signatureStatus === null) {
      return NextResponse.json(
        { error: 'Webhook temporariamente indisponível' },
        { status: 503 }
      )
    }

    if (!signatureStatus) {
      console.error('[ASAAS WEBHOOK] ❌ Assinatura inválida')
      return NextResponse.json(
        { error: 'Assinatura de webhook inválida' },
        { status: 403 }
      )
    }
    
    // 3. Parsear o body após verificação
    let body: unknown

    try {
      body = JSON.parse(rawBody)
    } catch {
      return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
    }

    const { event, payment, subscription } = body as {
      event?: string
      payment?: Record<string, any>
      subscription?: Record<string, any>
    }

    // Validar que o evento existe
    if (!event) {
      console.error('[ASAAS WEBHOOK] ❌ Evento não informado no payload')
      return NextResponse.json({ error: 'Event is required' }, { status: 400 })
    }

    if (event.startsWith('PAYMENT_') && !payment) {
      return NextResponse.json({ error: 'Payment is required' }, { status: 400 })
    }

    if (event.startsWith('SUBSCRIPTION_') && !subscription) {
      return NextResponse.json({ error: 'Subscription is required' }, { status: 400 })
    }

    const paymentData = payment ?? {}
    const subscriptionData = subscription ?? {}

    // ========================================
    // EVENTOS DE PAGAMENTO (PAYMENT_*)
    // ========================================

    if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
      // Pagamento confirmado! Ativar verificação do currículo

      // Buscar a assinatura relacionada a este pagamento
      const { data: dbSubscription, error: subError } = await supabase
        .from('asaas_subscriptions')
        .select('*')
        .eq('asaas_subscription_id', paymentData.subscription)
        .maybeSingle()

      if (subError) {
        console.error('[ASAAS WEBHOOK] Erro ao buscar assinatura:', subError)
        return NextResponse.json({ error: 'Database error' }, { status: 500 })
      }

      if (!dbSubscription) {
        console.error('[ASAAS WEBHOOK] ⚠️ Assinatura não encontrada:', paymentData.subscription)
        return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
      }

      // Atualizar status da assinatura para ACTIVE e ativar verificação
      const { error: updateError } = await supabase
        .from('asaas_subscriptions')
        .update({
          status: 'ACTIVE',
          verification_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', dbSubscription.id)

      if (updateError) {
        console.error('[ASAAS WEBHOOK] Erro ao atualizar assinatura:', updateError)
        return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
      }


      // Atualizar ou inserir o pagamento na tabela asaas_payments
      const { data: existingPayment } = await supabase
        .from('asaas_payments')
        .select('id')
        .eq('asaas_payment_id', paymentData.id)
        .maybeSingle()

      if (existingPayment) {
        // Atualizar pagamento existente
        const { error: updatePaymentError } = await supabase
          .from('asaas_payments')
          .update({
            status: paymentData.status,
            payment_date: paymentData.paymentDate || paymentData.clientPaymentDate,
            net_value: paymentData.netValue,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingPayment.id)

        if (updatePaymentError) {
          console.error('[ASAAS WEBHOOK] Erro ao atualizar pagamento:', updatePaymentError)
        } else {
        }
      } else {
        // Inserir novo pagamento
        const { error: insertPaymentError } = await supabase
          .from('asaas_payments')
          .insert({
            subscription_id: dbSubscription.id,
            asaas_payment_id: paymentData.id,
            billing_type: paymentData.billingType,
            value: paymentData.value,
            net_value: paymentData.netValue,
            original_value: paymentData.originalValue,
            status: paymentData.status,
            due_date: paymentData.dueDate,
            payment_date: paymentData.paymentDate || paymentData.clientPaymentDate,
            invoice_url: paymentData.invoiceUrl,
            bank_slip_url: paymentData.bankSlipUrl,
            transaction_receipt_url: paymentData.transactionReceiptUrl,
            description: paymentData.description
          })

        if (insertPaymentError) {
          console.error('[ASAAS WEBHOOK] Erro ao inserir pagamento:', insertPaymentError)
        } else {
        }
      }


      return NextResponse.json({
        success: true,
        message: 'Payment confirmed and subscription activated'
      })
    }

    if (event === 'PAYMENT_OVERDUE') {
      // Pagamento vencido - desativar verificação

      const { data: dbSubscription } = await supabase
        .from('asaas_subscriptions')
        .select('*')
        .eq('asaas_subscription_id', paymentData.subscription)
        .maybeSingle()

      if (dbSubscription) {
        await supabase
          .from('asaas_subscriptions')
          .update({
            status: 'OVERDUE',
            verification_active: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', dbSubscription.id)

        // Atualizar status do pagamento
        await supabase
          .from('asaas_payments')
          .update({
            status: 'OVERDUE',
            updated_at: new Date().toISOString()
          })
          .eq('asaas_payment_id', paymentData.id)

      }

      return NextResponse.json({ success: true, message: 'Payment overdue processed' })
    }

    if (event === 'PAYMENT_UPDATED') {

      // Atualizar dados do pagamento
      await supabase
        .from('asaas_payments')
        .update({
          status: paymentData.status,
          value: paymentData.value,
          net_value: paymentData.netValue,
          payment_date: paymentData.paymentDate || paymentData.clientPaymentDate,
          updated_at: new Date().toISOString()
        })
        .eq('asaas_payment_id', paymentData.id)

      return NextResponse.json({ success: true, message: 'Payment updated' })
    }

    // ========================================
    // EVENTOS DE ASSINATURA (SUBSCRIPTION_*)
    // ========================================

    if (event === 'SUBSCRIPTION_CREATED') {
      return NextResponse.json({ success: true, message: 'Subscription created event received' })
    }

    if (event === 'SUBSCRIPTION_UPDATED') {

      await supabase
        .from('asaas_subscriptions')
        .update({
          status: subscriptionData.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
          value: subscriptionData.value,
          next_due_date: subscriptionData.nextDueDate,
          updated_at: new Date().toISOString()
        })
        .eq('asaas_subscription_id', subscriptionData.id)

      return NextResponse.json({ success: true, message: 'Subscription updated' })
    }

    if (event === 'SUBSCRIPTION_DELETED') {

      await supabase
        .from('asaas_subscriptions')
        .update({
          status: 'INACTIVE',
          verification_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('asaas_subscription_id', subscriptionData.id)


      return NextResponse.json({ success: true, message: 'Subscription deleted' })
    }

    // ========================================
    // EVENTOS NÃO TRATADOS
    // ========================================


    return NextResponse.json({
      success: true,
      message: 'Event received but not handled',
      event
    })

  } catch (error) {
    console.error('[ASAAS WEBHOOK] ❌ Erro ao processar webhook:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Permitir GET para teste
export async function GET() {
  return NextResponse.json({
    message: 'Asaas Webhook endpoint is working',
    endpoint: '/api/webhooks/asaas',
    timestamp: new Date().toISOString(),
    events_handled: [
      'PAYMENT_RECEIVED',
      'PAYMENT_CONFIRMED',
      'PAYMENT_OVERDUE',
      'PAYMENT_UPDATED',
      'SUBSCRIPTION_CREATED',
      'SUBSCRIPTION_UPDATED',
      'SUBSCRIPTION_DELETED'
    ]
  })
}
