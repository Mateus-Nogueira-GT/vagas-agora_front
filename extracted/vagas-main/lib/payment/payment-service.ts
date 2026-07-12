// Payment Service - Integração ASAAS com Supabase
import { supabase } from '@/lib/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
import { asaasApiService, AsaasCustomer, AsaasSubscription } from './asaas-api'

// Constante para verificar se está em modo DEV (mesmo valor do asaas-api)
const DEV_MODE = false

export interface CustomerData {
  userId: string
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
}

export interface CreateSubscriptionData {
  userId: string
  billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX'
  value: number
  cycle: 'YEARLY' | 'MONTHLY' | 'QUARTERLY'
  description?: string
  subscriptionType?: 'CURRICULO_VERIFICACAO' | 'PREMIUM' | 'EMPREGADOR_MENSAL' | 'EMPREGADOR_TRIMESTRAL' | 'EMPREGADOR_ANUAL'
  replacePendingId?: number // ID da assinatura PENDING a ser substituída
}

class PaymentService {

  // Criar ou buscar cliente no ASAAS
  async getOrCreateCustomer(customerData: CustomerData): Promise<{ success: boolean; customerId?: string; error?: string }> {
    try {
      // Verificar se já existe cliente cadastrado para este usuário na tabela profiles
      const { data: existingProfile, error: dbError } = await supabase
        .from('profiles')
        .select('asaas_customer_id')
        .eq('id', customerData.userId)
        .single()

      if (dbError) {
        console.error('Erro ao buscar perfil do usuário:', dbError)
        return { success: false, error: 'Erro ao verificar perfil do usuário' }
      }

      // Se cliente já existe no ASAAS, retornar ID
      if (existingProfile?.asaas_customer_id) {
        return { success: true, customerId: existingProfile.asaas_customer_id }
      }


      // Criar novo cliente no ASAAS
      const asaasCustomer: AsaasCustomer = {
        name: customerData.name,
        cpfCnpj: customerData.cpfCnpj,
        email: customerData.email,
        phone: customerData.phone,
        mobilePhone: customerData.mobilePhone,
        address: customerData.address,
        addressNumber: customerData.addressNumber,
        complement: customerData.complement,
        province: customerData.province,
        postalCode: customerData.postalCode,
        cityName: customerData.cityName,
        state: customerData.state,
        country: 'Brasil'
      }

      const result = await asaasApiService.createCustomer(asaasCustomer)

      if (!result.success || !result.data) {
        console.error('[PAYMENT] Erro ao criar cliente no ASAAS:', result.error)
        return { success: false, error: result.error || 'Erro ao criar cliente no ASAAS' }
      }


      // Salvar o asaas_customer_id na tabela profiles
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ asaas_customer_id: result.data.id })
        .eq('id', customerData.userId)

      if (updateError) {
        console.error('Erro ao salvar asaas_customer_id no perfil:', updateError)
        return { success: false, error: 'Erro ao salvar ID do cliente' }
      }


      return { success: true, customerId: result.data.id }

    } catch (error) {
      console.error('Erro inesperado ao criar cliente:', error)
      return { success: false, error: 'Erro inesperado ao criar cliente' }
    }
  }

  // Criar assinatura
  async createSubscription(subscriptionData: CreateSubscriptionData): Promise<{ success: boolean; subscription?: any; paymentUrl?: string; error?: string }> {
    try {
      // Se estiver em modo DEV, retornar resposta simulada sem salvar no banco
      if (DEV_MODE) {

        const paymentUrl = subscriptionData.billingType === 'PIX'
          ? 'https://sandbox.asaas.com/c/mock-pix-' + Date.now()
          : subscriptionData.billingType === 'BOLETO'
          ? 'https://sandbox.asaas.com/i/mock-boleto-' + Date.now()
          : 'https://sandbox.asaas.com/checkout/mock-card-' + Date.now()

        return {
          success: true,
          subscription: {
            id: 'mock_sub_' + Date.now(),
            status: 'ACTIVE',
            value: subscriptionData.value,
            billingType: subscriptionData.billingType,
            cycle: subscriptionData.cycle
          },
          paymentUrl
        }
      }
      // Buscar dados do usuário
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('id', subscriptionData.userId)
        .single()

      if (userError || !userData) {
        return { success: false, error: 'Usuário não encontrado' }
      }

      // Buscar dados do candidato ou empregador
      let customerName = ''
      let customerCpf = ''
      let customerPhone = ''

      // Tentar buscar candidato
      const { data: candidateData } = await supabase
        .from('candidatos')
        .select('nome_completo, cpf, telefone')
        .eq('user_id', subscriptionData.userId)
        .single()

      if (candidateData) {
        customerName = candidateData.nome_completo || ''
        customerCpf = candidateData.cpf || ''
        customerPhone = candidateData.telefone || ''
      } else {
        // Tentar buscar empregador
        const { data: empresaData } = await supabase
          .from('empresas')
          .select('nome, cnpj, telefone')
          .eq('user_id', subscriptionData.userId)
          .single()

        if (empresaData) {
          customerName = empresaData.nome || ''
          customerCpf = empresaData.cnpj || ''
          customerPhone = empresaData.telefone || ''
        }
      }

      if (!customerName && !customerCpf) {
        return { success: false, error: 'Dados do usuário não encontrados (candidato ou empresa)' }
      }

      // Criar ou buscar cliente

      // Validar dados obrigatórios antes de criar cliente
      const finalCustomerName = customerName || userData.email.split('@')[0]
      const finalCustomerCpf = customerCpf
      const customerEmail = userData.email


      // ASAAS requer nome, email e cpfCnpj como campos obrigatórios
      if (!finalCustomerName || !customerEmail || !finalCustomerCpf) {
        console.error('[PAYMENT] Dados obrigatórios ausentes para criação do cliente')
        return { success: false, error: 'Dados incompletos. Nome, email e CPF/CNPJ são obrigatórios.' }
      }

      const customerData = {
        userId: subscriptionData.userId,
        name: finalCustomerName,
        cpfCnpj: finalCustomerCpf,
        email: customerEmail,
        phone: customerPhone || '',
        mobilePhone: customerPhone || ''
      }


      const customerResult = await this.getOrCreateCustomer(customerData)


      if (!customerResult.success || !customerResult.customerId) {
        return { success: false, error: customerResult.error || 'Erro ao criar cliente' }
      }

      // Calcular próxima data de vencimento
      const nextDueDate = new Date()
      if (subscriptionData.cycle === 'YEARLY') {
        nextDueDate.setFullYear(nextDueDate.getFullYear() + 1)
      } else if (subscriptionData.cycle === 'QUARTERLY') {
        nextDueDate.setMonth(nextDueDate.getMonth() + 3)
      } else {
        nextDueDate.setMonth(nextDueDate.getMonth() + 1)
      }

      // Criar assinatura no ASAAS
      const asaasSubscription: AsaasSubscription = {
        customer: customerResult.customerId,
        billingType: subscriptionData.billingType,
        value: subscriptionData.value,
        nextDueDate: nextDueDate.toISOString().split('T')[0], // YYYY-MM-DD
        cycle: subscriptionData.cycle,
        description: subscriptionData.description || 'Verificação de Currículo Premium'
      }

      const subscriptionResult = await asaasApiService.createSubscription(asaasSubscription)

      if (!subscriptionResult.success || !subscriptionResult.data) {
        return { success: false, error: subscriptionResult.error || 'Erro ao criar assinatura' }
      }

      // Calcular data de expiração da verificação (apenas para CURRICULO_VERIFICACAO)
      const isVerification = subscriptionData.subscriptionType === 'CURRICULO_VERIFICACAO'
      const verificationExpiresAt = new Date()
      verificationExpiresAt.setFullYear(verificationExpiresAt.getFullYear() + 1)

      let dbSubscription: any

      // Se há uma assinatura PENDING para substituir
      if (subscriptionData.replacePendingId) {

        // Buscar assinatura antiga para cancelar no Asaas
        const { data: oldSubscription } = await supabase
          .from('asaas_subscriptions')
          .select('asaas_subscription_id')
          .eq('id', subscriptionData.replacePendingId)
          .single()

        // Cancelar assinatura antiga no Asaas (se existir)
        if (oldSubscription?.asaas_subscription_id) {
          await asaasApiService.cancelSubscription(oldSubscription.asaas_subscription_id)
        }

        // Deletar pagamentos antigos relacionados a esta assinatura
        const { error: deletePaymentsError } = await supabase
          .from('asaas_payments')
          .delete()
          .eq('subscription_id', subscriptionData.replacePendingId)

        if (deletePaymentsError) {
          console.error('[PAYMENT] Erro ao deletar pagamentos antigos:', deletePaymentsError)
          // Não retornar erro aqui, só logar
        } else {
        }

        // Preparar dados de atualização
        const updateData: any = {
          asaas_subscription_id: subscriptionResult.data.id,
          billing_type: subscriptionData.billingType,
          value: subscriptionData.value,
          next_due_date: nextDueDate.toISOString().split('T')[0],
          cycle: subscriptionData.cycle,
          description: subscriptionData.description || 'Assinatura Premium',
          subscription_type: subscriptionData.subscriptionType || 'CURRICULO_VERIFICACAO',
          status: 'PENDING',
          updated_at: new Date().toISOString()
        }

        // Adicionar campos de verificação apenas se for CURRICULO_VERIFICACAO
        if (isVerification) {
          updateData.verification_expires_at = verificationExpiresAt.toISOString()
          updateData.verification_active = false
        }

        // Atualizar a assinatura existente com os novos dados
        const { data: updatedSubscription, error: updateError } = await supabase
          .from('asaas_subscriptions')
          .update(updateData)
          .eq('id', subscriptionData.replacePendingId)
          .select()
          .single()

        if (updateError) {
          console.error('Erro ao atualizar assinatura no banco:', updateError)
          await asaasApiService.cancelSubscription(subscriptionResult.data.id)
          return { success: false, error: 'Erro ao atualizar assinatura' }
        }

        dbSubscription = updatedSubscription

      } else {
        // Preparar dados de inserção
        const insertData: any = {
          user_id: subscriptionData.userId,
          asaas_subscription_id: subscriptionResult.data.id,
          billing_type: subscriptionData.billingType,
          value: subscriptionData.value,
          next_due_date: nextDueDate.toISOString().split('T')[0],
          cycle: subscriptionData.cycle,
          description: subscriptionData.description || 'Assinatura Premium',
          subscription_type: subscriptionData.subscriptionType || 'CURRICULO_VERIFICACAO',
          status: 'PENDING'
        }

        // Adicionar campos de verificação apenas se for CURRICULO_VERIFICACAO
        if (isVerification) {
          insertData.verification_expires_at = verificationExpiresAt.toISOString()
          insertData.verification_active = false
        }

        // Criar nova assinatura no banco
        const { data: newSubscription, error: dbError } = await supabase
          .from('asaas_subscriptions')
          .insert(insertData)
          .select()
          .single()

        if (dbError) {
          console.error('Erro ao salvar assinatura no banco:', dbError)
          console.error('Detalhes do erro:', JSON.stringify(dbError, null, 2))
          await asaasApiService.cancelSubscription(subscriptionResult.data.id)
          return { success: false, error: 'Erro ao salvar assinatura' }
        }

        dbSubscription = newSubscription
      }

      // Buscar URL de pagamento das cobranças da assinatura
      let paymentUrl = ''


      // Buscar as cobranças desta assinatura
      const paymentsResult = await asaasApiService.getSubscriptionPayments(subscriptionResult.data.id, 1, 0)

      if (paymentsResult.success && paymentsResult.data?.data?.length > 0) {
        const firstPayment = paymentsResult.data.data[0]

        // Registrar o pagamento na tabela asaas_payments
        const { error: paymentError } = await supabase
          .from('asaas_payments')
          .insert({
            subscription_id: dbSubscription.id,
            asaas_payment_id: firstPayment.id,
            billing_type: firstPayment.billingType,
            value: firstPayment.value,
            net_value: firstPayment.netValue,
            original_value: firstPayment.originalValue,
            status: firstPayment.status,
            due_date: firstPayment.dueDate,
            payment_date: firstPayment.paymentDate,
            client_payment_date: firstPayment.clientPaymentDate,
            installment_number: firstPayment.installmentNumber,
            invoice_url: firstPayment.invoiceUrl,
            bank_slip_url: firstPayment.bankSlipUrl,
            transaction_receipt_url: firstPayment.transactionReceiptUrl,
            description: firstPayment.description
          })

        if (paymentError) {
          console.error('[PAYMENT] Erro ao registrar pagamento na tabela asaas_payments:', paymentError)
          // Não retornar erro aqui, pois a assinatura já foi criada
        } else {
        }

        // Pegar a URL de pagamento baseada no tipo
        if (subscriptionData.billingType === 'BOLETO' && firstPayment.bankSlipUrl) {
          paymentUrl = firstPayment.bankSlipUrl
        } else if (subscriptionData.billingType === 'PIX' && firstPayment.invoiceUrl) {
          paymentUrl = firstPayment.invoiceUrl
        } else if (firstPayment.invoiceUrl) {
          // Fallback para invoiceUrl genérica
          paymentUrl = firstPayment.invoiceUrl
        }
      } else {
      }

      return {
        success: true,
        subscription: {
          ...dbSubscription,
          asaas_data: subscriptionResult.data
        },
        paymentUrl
      }

    } catch (error) {
      console.error('Erro inesperado ao criar assinatura:', error)
      console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro inesperado ao criar assinatura'
      }
    }
  }

  // Verificar status da assinatura do usuário
  async getUserSubscriptionStatus(
    userId: string,
    subscriptionType?: string,
    client: SupabaseClient = supabase
  ): Promise<{ success: boolean; subscription?: any; isActive?: boolean; error?: string }> {
    try {
      // Buscar qualquer assinatura do usuário (ACTIVE ou PENDING)
      let query = client
        .from('asaas_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .in('status', ['ACTIVE', 'PENDING'])

      // Se subscription_type foi especificado, filtrar por ele
      if (subscriptionType) {
        query = query.eq('subscription_type', subscriptionType)
      }

      const { data: subscriptions, error } = await query
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar assinatura:', error)
        return { success: false, error: 'Erro ao verificar assinatura' }
      }

      const subscription = subscriptions && subscriptions.length > 0 ? subscriptions[0] : null

      if (!subscription) {
        return { success: true, isActive: false }
      }

      // Se for PENDING, retornar como não ativo mas com a subscription
      if (subscription.status === 'PENDING') {
        return {
          success: true,
          subscription,
          isActive: false
        }
      }

      // Se for ACTIVE, verificar se ainda está ativo (não expirou)
      const now = new Date()
      const expiresAt = new Date(subscription.verification_expires_at)
      const isActive = subscription.verification_active && expiresAt > now

      return {
        success: true,
        subscription,
        isActive
      }

    } catch (error) {
      console.error('Erro inesperado ao verificar assinatura:', error)
      return { success: false, error: 'Erro inesperado' }
    }
  }

  // Cancelar assinatura
  async cancelSubscription(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: subscription, error: findError } = await supabase
        .from('asaas_subscriptions')
        .select('asaas_subscription_id')
        .eq('user_id', userId)
        .eq('status', 'ACTIVE')
        .single()

      if (findError || !subscription) {
        return { success: false, error: 'Assinatura não encontrada' }
      }

      // Cancelar no ASAAS
      const cancelResult = await asaasApiService.cancelSubscription(subscription.asaas_subscription_id)

      if (!cancelResult.success) {
        return { success: false, error: cancelResult.error || 'Erro ao cancelar no ASAAS' }
      }

      // Atualizar status no banco
      const { error: updateError } = await supabase
        .from('asaas_subscriptions')
        .update({
          status: 'INACTIVE',
          verification_active: false
        })
        .eq('user_id', userId)
        .eq('status', 'ACTIVE')

      if (updateError) {
        console.error('Erro ao atualizar status da assinatura:', updateError)
        return { success: false, error: 'Erro ao atualizar status' }
      }

      return { success: true }

    } catch (error) {
      console.error('Erro inesperado ao cancelar assinatura:', error)
      return { success: false, error: 'Erro inesperado' }
    }
  }
}

export const paymentService = new PaymentService()
