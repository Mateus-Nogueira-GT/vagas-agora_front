"use client"
import Link from "next/link"
import { useState, useEffect } from "react"
import { ChevronRight, Star, CheckCircle, Search, MessageSquare, ArrowLeft, CheckCheck, CreditCard, FileText, QrCode, Loader2, Calendar, DollarSign, Download, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { authService } from "@/lib/auth/auth-service"
import toast from "react-hot-toast"
import { supabase } from "@/lib/supabase"
import { productsService, Product } from "@/lib/products/products-service"

export default function VerifyResume() {
  const [loading, setLoading] = useState(false)
  const [subscription, setSubscription] = useState<any>(null)
  const [isActive, setIsActive] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'PIX' | 'BOLETO' | 'CREDIT_CARD'>('PIX')
  const [user, setUser] = useState<any>(null)
  const [product, setProduct] = useState<Product | null>(null)
  const [loadingProduct, setLoadingProduct] = useState(true)
  const [payments, setPayments] = useState<any[]>([])
  const [loadingPayments, setLoadingPayments] = useState(false)

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    if (!currentUser) {
      toast.error('Usuário não encontrado')
      return
    }
    setUser(currentUser)
    checkSubscriptionStatus()
    loadProduct()
    loadPayments(currentUser.id)

    // 🔥 CONFIGURAR REALTIME para atualizar a tela automaticamente quando o pagamento for confirmado

    const channel = supabase
      .channel('subscription-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Ouvir INSERT, UPDATE e DELETE
          schema: 'public',
          table: 'asaas_subscriptions',
          filter: `user_id=eq.${currentUser.id}` // Apenas assinaturas deste usuário
        },
        (payload) => {

          // Atualizar o estado com os novos dados
          if (payload.new) {
            const newSubscription = payload.new as any
            setSubscription(newSubscription)

            // Se mudou para ACTIVE, mostrar toast de sucesso
            if (newSubscription.status === 'ACTIVE' && newSubscription.verification_active) {
              setIsActive(true)
              toast.success('🎉 Pagamento confirmado! Sua verificação está ativa!')
              // Recarregar pagamentos para mostrar a fatura atualizada
              loadPayments(currentUser.id)
            } else if (newSubscription.status === 'PENDING') {
              setIsActive(false)
              toast('⏳ Aguardando confirmação do pagamento...', { icon: '💳' })
            } else if (newSubscription.status === 'OVERDUE') {
              setIsActive(false)
              toast.error('Pagamento vencido. Por favor, efetue o pagamento.')
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*', // Ouvir mudanças em pagamentos também
          schema: 'public',
          table: 'asaas_payments'
        },
        (payload) => {
          // Recarregar lista de pagamentos quando houver mudança
          loadPayments(currentUser.id)
        }
      )
      .subscribe()

    // Cleanup: remover listener quando componente desmontar
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadProduct = async () => {
    try {
      setLoadingProduct(true)

      const result = await productsService.getProductByCode('CURRICULO_VERIFICACAO')


      if (result.success && result.product) {
        setProduct(result.product)
      } else {
        console.error('[PRODUCT] Erro:', result.error)
        toast.error(`Erro ao carregar produto: ${result.error}`)
      }
    } catch (error) {
      console.error('[PRODUCT] Erro inesperado:', error)
      toast.error('Erro ao carregar informações do produto')
    } finally {
      setLoadingProduct(false)
    }
  }

  const checkSubscriptionStatus = async () => {
    try {
      const response = await fetch('/api/payment/status')
      const data = await response.json()

      if (data.success) {
        setIsActive(data.isActive)
        setSubscription(data.subscription)
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error)
    }
  }

  const loadPayments = async (userId: string) => {
    try {
      setLoadingPayments(true)

      // Buscar pagamentos do usuário via assinatura
      const { data: subscriptions } = await supabase
        .from('asaas_subscriptions')
        .select('id')
        .eq('user_id', userId)
        .eq('subscription_type', 'CURRICULO_VERIFICACAO')

      if (!subscriptions || subscriptions.length === 0) {
        setPayments([])
        return
      }

      const subscriptionIds = subscriptions.map(s => s.id)

      const { data: paymentsData, error } = await supabase
        .from('asaas_payments')
        .select('*')
        .in('subscription_id', subscriptionIds)
        .order('due_date', { ascending: false })

      if (!error && paymentsData) {
        setPayments(paymentsData)
      }
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error)
    } finally {
      setLoadingPayments(false)
    }
  }

  const handlePayment = async () => {
    if (!user) {
      toast.error('Usuário não encontrado')
      return
    }

    if (!product || !product.price_yearly) {
      toast.error('Informações do produto não disponíveis')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/payment/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          billingType: selectedPaymentMethod,
          value: product.price_yearly,
          cycle: 'YEARLY',
          description: product.description
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar pagamento')
      }

      if (data.success) {
        toast.success('Assinatura criada com sucesso!')

        // Se tem URL de pagamento, abrir em nova aba
        if (data.paymentUrl) {
          window.open(data.paymentUrl, '_blank')
          toast.success('URL de pagamento aberta em nova aba')
        }

        // Atualizar status
        await checkSubscriptionStatus()
      }

    } catch (error) {
      console.error('Erro ao processar pagamento:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao processar pagamento')
    } finally {
      setLoading(false)
    }
  }

  const paymentMethods = [
    {
      id: 'PIX' as const,
      name: 'PIX',
      icon: QrCode,
      description: 'Pagamento instantâneo'
    },
    {
      id: 'BOLETO' as const,
      name: 'Boleto Bancário',
      icon: FileText,
      description: 'Vencimento em 3 dias úteis'
    },
    {
      id: 'CREDIT_CARD' as const,
      name: 'Cartão de Crédito',
      icon: CreditCard,
      description: 'Pagamento recorrente automático'
    }
  ]

  // Benefícios da verificação
  const benefits = [
    {
      icon: Star,
      color: "#FFB800",
      title: "Destaque nas buscas",
      description: "Seu currículo aparece no topo das buscas realizadas por recrutadores, aumentando sua visibilidade.",
    },
    {
      icon: CheckCircle,
      color: "#00FFAE",
      title: "Badge de verificação",
      description:
        "Receba um selo de verificação que demonstra aos recrutadores que seu perfil foi validado pela plataforma.",
    },
    {
      icon: Search,
      color: "#4400CC",
      title: "Análise profissional",
      description:
        "Especialistas em recrutamento analisam seu currículo e identificam pontos fortes e oportunidades de melhoria.",
    },
    {
      icon: MessageSquare,
      color: "#0057FF",
      title: "Feedback personalizado",
      description:
        "Receba sugestões personalizadas para melhorar seu currículo e aumentar suas chances de contratação.",
    },
  ]

  return (
    <div className="w-full pb-16">
      {/* Banner com gradiente roxo-azul neon */}
      <div className="bg-gradient-to-r from-[#4400CC] to-[#00FFAE] min-h-[144px] sm:min-h-[160px] flex flex-col justify-center px-4 sm:px-6 md:px-10 py-6 shadow-[0_0_20px_rgba(68,0,204,0.3)]">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">Verificação de Currículo</h1>
        <p className="text-base md:text-lg text-white/80 mt-2">
          Destaque seu perfil e aumente suas chances de contratação
        </p>
      </div>

      {/* Breadcrumb */}
      <div className="px-4 sm:px-6 md:px-10 py-4 flex items-center text-sm min-w-0 overflow-hidden">
        <Link href="/candidato/curriculo" className="text-[#4400CC] hover:text-[#3300AA] flex items-center">
          <ArrowLeft size={14} className="mr-1" />
          Voltar para Currículo
        </Link>
        <ChevronRight size={14} className="mx-2 text-gray-400" />
        <span className="text-gray-600">Verificar</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10">
        {isActive ? (
          /* TELA PARA USUÁRIO VERIFICADO - Mostra plano ativo e faturas */
          <>
            {/* Informações do plano ativo */}
            <div className="mb-12">
              <Card className="max-w-3xl mx-auto bg-gradient-to-br from-[#4400CC] to-[#00FFAE]/20 border-[#00FFAE]">
                <CardContent className="p-8">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <CheckCircle className="h-10 w-10 text-[#00FFAE]" />
                        <div>
                          <h2 className="text-2xl font-bold text-white">Verificação Ativa</h2>
                          <p className="text-white/80 text-sm">Seu perfil está em destaque</p>
                        </div>
                      </div>

                      {subscription && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                            <p className="text-white/70 text-xs mb-1">Plano</p>
                            <p className="text-white font-semibold">{product?.name || 'Premium'}</p>
                          </div>
                          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                            <p className="text-white/70 text-xs mb-1">Valor</p>
                            <p className="text-white font-semibold">R$ {subscription.value?.toFixed(2).replace('.', ',')}/ano</p>
                          </div>
                          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                            <p className="text-white/70 text-xs mb-1">Válido até</p>
                            <p className="text-white font-semibold">
                              {new Date(subscription.verification_expires_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    <Badge className="bg-[#00FFAE] text-[#4400CC] hover:bg-[#00FFAE]/90">
                      Ativo
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lista de faturas */}
            <div className="mb-12">
              <h2 className="text-xl font-medium text-gray-800 mb-6">Histórico de Pagamentos</h2>

              {loadingPayments ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-4 sm:p-6">
                        <div className="h-20 bg-gray-200 animate-pulse rounded"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : payments.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Nenhum pagamento encontrado</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {payments.map((payment) => {
                    const statusColors: Record<string, { bg: string; text: string; label: string }> = {
                      'PENDING': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendente' },
                      'CONFIRMED': { bg: 'bg-green-100', text: 'text-green-800', label: 'Confirmado' },
                      'RECEIVED': { bg: 'bg-green-100', text: 'text-green-800', label: 'Recebido' },
                      'OVERDUE': { bg: 'bg-red-100', text: 'text-red-800', label: 'Vencido' },
                      'REFUNDED': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Reembolsado' },
                    }

                    const status = statusColors[payment.status] || statusColors['PENDING']

                    return (
                      <Card key={payment.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Calendar className="h-5 w-5 text-gray-400" />
                                <div>
                                  <p className="font-medium text-gray-800">
                                    {payment.description || 'Verificação de Currículo Premium'}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Vencimento: {new Date(payment.due_date).toLocaleDateString('pt-BR')}
                                  </p>
                                </div>
                              </div>

                              {payment.payment_date && (
                                <p className="text-xs text-gray-500 ml-8">
                                  Pago em: {new Date(payment.payment_date).toLocaleDateString('pt-BR')}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-lg font-bold text-gray-800">
                                  R$ {payment.value?.toFixed(2).replace('.', ',')}
                                </p>
                                <Badge className={`${status.bg} ${status.text} hover:${status.bg}`}>
                                  {status.label}
                                </Badge>
                              </div>

                              {(payment.invoice_url || payment.bank_slip_url) && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(payment.invoice_url || payment.bank_slip_url, '_blank')}
                                  className="flex items-center gap-2"
                                >
                                  <ExternalLink size={16} />
                                  Ver fatura
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          /* TELA PARA USUÁRIO NÃO VERIFICADO - Mostra planos e forma de pagamento */
          <>
            {/* Benefícios da verificação */}
            <div className="mb-12">
          <h2 className="text-xl font-medium text-gray-800 mb-8 text-center">Por que verificar seu currículo?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <Card
                key={index}
                className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)] hover:shadow-[0_0_20px_rgba(68,0,204,0.2)] transition-all"
              >
                <CardContent className="p-4 sm:p-6">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${benefit.color}20` }}
                  >
                    <benefit.icon size={24} style={{ color: benefit.color }} />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Plano de verificação */}
        <div className="mb-12">
          <h2 className="text-xl font-medium text-gray-800 mb-8 text-center">Plano de verificação</h2>
          <div className="max-w-md mx-auto">
            {loadingProduct ? (
              <Card className="bg-white border-[#4400CC]/30">
                <CardHeader className="pt-6">
                  <div className="h-20 bg-gray-200 animate-pulse rounded"></div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-6 bg-gray-200 animate-pulse rounded"></div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : product ? (
              <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_20px_rgba(0,255,174,0.2)]">
                <CardHeader className="pt-6">
                  <CardTitle className="text-center">
                    <span className="text-xl font-bold text-gray-800">{product.name}</span>
                    <div className="mt-2">
                      <span className="text-2xl font-bold text-[#00FFAE]">
                        R$ {product.price_yearly?.toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">por ano</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCheck size={16} className="text-[#00FFAE] mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white border-red-300">
                <CardContent className="p-4 sm:p-6 text-center text-red-600">
                  Erro ao carregar informações do plano
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Status da assinatura ou pagamento */}
        <div className="mb-12">
          {isActive ? (
            <div className="text-center">
              <Card className="max-w-md mx-auto bg-green-50 border-green-200">
                <CardContent className="p-4 sm:p-6">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    Verificação Ativa!
                  </h3>
                  <p className="text-green-700 mb-4">
                    Seu currículo está verificado e em destaque até{" "}
                    {subscription?.verification_expires_at
                      ? new Date(subscription.verification_expires_at).toLocaleDateString('pt-BR')
                      : 'indeterminado'
                    }
                  </p>
                  <Badge className="bg-green-600 hover:bg-green-700">
                    Premium Ativo
                  </Badge>
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-medium text-gray-800 mb-8 text-center">
                Formas de pagamento
              </h2>

              {/* Seleção de método de pagamento */}
              <div className="max-w-2xl mx-auto mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {paymentMethods.map((method) => (
                    <Card
                      key={method.id}
                      className={`cursor-pointer transition-all ${
                        selectedPaymentMethod === method.id
                          ? 'border-[#4400CC] bg-[#4400CC]/5'
                          : 'border-gray-200 hover:border-[#4400CC]/50'
                      }`}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                    >
                      <CardContent className="p-4 text-center">
                        <method.icon
                          className={`h-8 w-8 mx-auto mb-2 ${
                            selectedPaymentMethod === method.id
                              ? 'text-[#4400CC]'
                              : 'text-gray-600'
                          }`}
                        />
                        <h4 className="font-medium mb-1">{method.name}</h4>
                        <p className="text-xs text-gray-600">{method.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Botão de pagamento */}
              <div className="flex justify-center">
                <Button
                  onClick={handlePayment}
                  disabled={loading || loadingProduct || !product}
                  className="bg-[#4400CC] hover:bg-[#3300AA] text-white font-medium px-8 py-6 h-auto flex items-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      {selectedPaymentMethod === 'PIX' && <QrCode className="mr-3 h-6 w-6" />}
                      {selectedPaymentMethod === 'BOLETO' && <FileText className="mr-3 h-6 w-6" />}
                      {selectedPaymentMethod === 'CREDIT_CARD' && <CreditCard className="mr-3 h-6 w-6" />}
                      Pagar R$ {product?.price_yearly?.toFixed(2).replace('.', ',') || '0,00'} por ano
                    </>
                  )}
                </Button>
              </div>

              <p className="text-center text-sm text-gray-500 mt-4">
                {selectedPaymentMethod === 'PIX' && 'Você será redirecionado para gerar o código PIX'}
                {selectedPaymentMethod === 'BOLETO' && 'Você será redirecionado para gerar o boleto bancário'}
                {selectedPaymentMethod === 'CREDIT_CARD' && 'Você será redirecionado para inserir os dados do cartão'}
              </p>
            </>
          )}
        </div>
          </>
        )}
      </div>
    </div>
  )
}
