"use client"

import { Check, Download, ArrowRight, Calendar, ExternalLink, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useCallback, useEffect, useState } from "react"
import { productsService, Product } from "@/lib/products/products-service"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase"
import toast from "react-hot-toast"

export default function Subscription() {
  const { user } = useAuth()
  const [payments, setPayments] = useState<any[]>([])
  const [loadingPayments, setLoadingPayments] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<string>('trimestral')
  const [loading, setLoading] = useState(false)
  const [activeSubscription, setActiveSubscription] = useState<any>(null)
  const [loadingSubscription, setLoadingSubscription] = useState(true)

  const loadPayments = useCallback(async () => {
    if (!user?.id) return

    try {
      setLoadingPayments(true)

      // Buscar pagamentos do empregador via assinatura
      const { data: subscriptions } = await supabase
        .from('asaas_subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .in('subscription_type', ['EMPREGADOR_MENSAL', 'EMPREGADOR_TRIMESTRAL', 'EMPREGADOR_ANUAL'])

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
  }, [user?.id])

  const loadProducts = useCallback(async () => {
    try {
      setLoadingProducts(true)
      const result = await productsService.getProductsByAudience('empregador')

      if (result.success && result.products) {
        // Ordenar produtos: Mensal, Trimestral, Anual
        const sortedProducts = result.products.sort((a, b) => {
          const order = ['EMPREGADOR_MENSAL', 'EMPREGADOR_TRIMESTRAL', 'EMPREGADOR_ANUAL']
          return order.indexOf(a.code) - order.indexOf(b.code)
        })
        setProducts(sortedProducts)
      } else {
        toast.error(`Erro ao carregar produtos: ${result.error}`)
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
      toast.error('Erro ao carregar informações dos planos')
    } finally {
      setLoadingProducts(false)
    }
  }, [])

  const loadActiveSubscription = useCallback(async () => {
    if (!user?.id) return

    try {
      setLoadingSubscription(true)

      const { data: subscription, error } = await supabase
        .from('asaas_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .in('subscription_type', ['EMPREGADOR_MENSAL', 'EMPREGADOR_TRIMESTRAL', 'EMPREGADOR_ANUAL'])
        .eq('status', 'ACTIVE')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (!error && subscription) {
        setActiveSubscription(subscription)
      } else {
        setActiveSubscription(null)
      }
    } catch (error) {
      console.error('Erro ao carregar assinatura ativa:', error)
    } finally {
      setLoadingSubscription(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (user?.id) {
      loadPayments()
      loadProducts()
      loadActiveSubscription()
    }
  }, [loadActiveSubscription, loadPayments, loadProducts, user?.id])

  useEffect(() => {
    if (!user?.id) return

    const channel = supabase
      .channel('employer-subscription-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'asaas_subscriptions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.new) {
            const newSubscription = payload.new as any

            if (['EMPREGADOR_MENSAL', 'EMPREGADOR_TRIMESTRAL', 'EMPREGADOR_ANUAL'].includes(newSubscription.subscription_type)) {
              if (newSubscription.status === 'ACTIVE') {
                setActiveSubscription(newSubscription)
                toast.success('🎉 Pagamento confirmado! Sua assinatura está ativa!')
                loadPayments()
              } else if (newSubscription.status === 'PENDING') {
                toast('⏳ Aguardando confirmação do pagamento...', { icon: '💳' })
              }
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'asaas_payments'
        },
        () => {
          loadPayments()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [loadPayments, user?.id])

  const handlePayment = async (productCode: string) => {
    if (!user) {
      toast.error('Usuário não encontrado')
      return
    }

    const product = products.find(p => p.code === productCode)
    if (!product) {
      toast.error('Plano não encontrado')
      return
    }

    setLoading(true)

    try {
      // Determinar valor e ciclo baseado no produto
      let value = product.price_monthly || 0
      let cycle: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' = 'MONTHLY'

      if (productCode === 'EMPREGADOR_MENSAL') {
        cycle = 'MONTHLY'
        value = product.price_monthly || 0
      } else if (productCode === 'EMPREGADOR_TRIMESTRAL') {
        cycle = 'QUARTERLY'
        value = (product.price_monthly || 0) * 3 // R$ 269,70
      } else if (productCode === 'EMPREGADOR_ANUAL') {
        cycle = 'YEARLY'
        value = product.price_yearly || 0
      }

      const response = await fetch('/api/payment/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          billingType: 'CREDIT_CARD',
          value: value,
          cycle: cycle,
          description: product.description,
          subscriptionType: productCode
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

        // Recarregar pagamentos e assinatura ativa
        await loadPayments()
        await loadActiveSubscription()
      }

    } catch (error) {
      console.error('Erro ao processar pagamento:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao processar pagamento')
    } finally {
      setLoading(false)
    }
  }

  const getPlanData = () => {
    if (loadingProducts) {
      return []
    }

    return products.map(product => {
      const isMonthly = product.code === 'EMPREGADOR_MENSAL'
      const isQuarterly = product.code === 'EMPREGADOR_TRIMESTRAL'
      const isYearly = product.code === 'EMPREGADOR_ANUAL'

      const price = `R$ ${product.price_monthly?.toFixed(2).replace('.', ',')}`
      const period = 'por mês'
      let discount = null
      let total = null

      if (isQuarterly) {
        discount = '10% de desconto'
        const quarterlyTotal = (product.price_monthly || 0) * 3
        total = `R$ ${quarterlyTotal.toFixed(2).replace('.', ',')} a cada 3 meses`
      } else if (isYearly) {
        discount = '30% de desconto'
        total = `R$ ${product.price_yearly?.toFixed(2).replace('.', ',')} por ano`
      }

      return {
        id: product.code,
        name: product.name,
        price,
        period,
        features: product.features,
        recommended: isQuarterly,
        discount,
        total
      }
    })
  }

  const plans = getPlanData()

  return (
    <div className="w-full pb-10">
      {/* Banner com gradiente roxo-azul neon */}
      <div className="flex min-h-[152px] flex-col justify-center bg-gradient-to-r from-[#4400CC] to-[#00FFAE] px-4 py-6 shadow-[0_0_20px_rgba(68,0,204,0.3)] sm:px-6 md:min-h-[200px] md:px-10">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">Assinatura</h1>
        <p className="text-base md:text-lg text-white/90 mt-2">Gerencie seu plano e maximize seus resultados</p>
      </div>

      {/* Card de plano atual/ativo */}
      <div className="relative z-10 -mt-6 px-4 sm:px-6 md:px-10">
        {loadingSubscription ? (
          <Card className="bg-white border-[#4400CC]/30 shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="h-20 bg-gray-200 animate-pulse rounded"></div>
            </CardContent>
          </Card>
        ) : activeSubscription ? (
          <Card className="bg-white border-[#00FFAE] shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle className="h-8 w-8 text-[#00FFAE]" />
                    <div>
                      <Badge className="bg-[#00FFAE] text-[#4400CC] mb-1">Assinatura Ativa</Badge>
                      <h2 className="text-xl font-bold text-gray-800">
                        {activeSubscription.subscription_type === 'EMPREGADOR_MENSAL' && 'Plano Mensal'}
                        {activeSubscription.subscription_type === 'EMPREGADOR_TRIMESTRAL' && 'Plano Trimestral'}
                        {activeSubscription.subscription_type === 'EMPREGADOR_ANUAL' && 'Plano Anual'}
                      </h2>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-gray-600 text-xs mb-1">Valor</p>
                      <p className="text-gray-800 font-semibold">R$ {activeSubscription.value?.toFixed(2).replace('.', ',')}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-gray-600 text-xs mb-1">Ciclo</p>
                      <p className="text-gray-800 font-semibold">
                        {activeSubscription.cycle === 'MONTHLY' && 'Mensal'}
                        {activeSubscription.cycle === 'QUARTERLY' && 'Trimestral'}
                        {activeSubscription.cycle === 'YEARLY' && 'Anual'}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-gray-600 text-xs mb-1">Próximo vencimento</p>
                      <p className="text-gray-800 font-semibold">
                        {new Date(activeSubscription.next_due_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white border-[#4400CC]/30 shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <Badge className="bg-[#FFB800] text-white mb-2">Sem assinatura ativa</Badge>
                  <h2 className="text-xl font-bold text-gray-800">Assine agora e aproveite todos os recursos</h2>
                  <p className="text-gray-600 mt-1">
                    Encontre os melhores candidatos para sua empresa com ferramentas avançadas de recrutamento.
                  </p>
                </div>
                <Button
                  onClick={() => document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full bg-[#00FFAE] font-medium text-[#4400CC] shadow-[0_0_10px_rgba(0,255,174,0.2)] hover:bg-[#00FFAE]/80 md:w-auto"
                >
                  Ver planos <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Planos de assinatura */}
      <div id="planos" className="mt-8 scroll-mt-24 px-4 sm:px-6 md:px-10">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Escolha seu plano</h2>
        {loadingProducts ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pt-6">
                  <div className="h-24 bg-gray-200 rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="h-6 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div key={plan.id} className="relative">
                <RadioGroupItem value={plan.id} id={plan.id} className="sr-only" />
                <Label
                  htmlFor={plan.id}
                  className="cursor-pointer block h-full border-2 border-[#4400CC]/30 hover:border-[#4400CC] rounded-lg transition-all"
                >
                  {plan.recommended && (
                    <div className="absolute -top-3 left-0 right-0 flex justify-center">
                      <span className="bg-[#00FFAE] text-[#4400CC] text-xs font-bold px-3 py-1 rounded-full shadow-[0_0_10px_rgba(0,255,174,0.3)]">
                        Recomendado
                      </span>
                    </div>
                  )}
                  <Card className="bg-white border-0 h-full shadow-none">
                    <CardHeader className="pt-6">
                      <CardTitle className="text-center">
                        <span className="text-xl font-bold text-gray-800">{plan.name}</span>
                        <div className="mt-2">
                          <span className="text-2xl font-bold text-[#4400CC]">{plan.price}</span>
                          <span className="text-sm text-gray-500 ml-1">{plan.period}</span>
                        </div>
                        {plan.discount && (
                          <span className="text-sm text-[#00FFAE] font-medium block mt-1">{plan.discount}</span>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <Check size={16} className="text-[#00FFAE] mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      {plan.total && <p className="text-sm text-gray-500 mt-4 text-center">{plan.total}</p>}
                    </CardContent>
                    <CardFooter>
                      <Button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handlePayment(plan.id)
                        }}
                        disabled={loading}
                        className="w-full bg-[#4400CC] hover:bg-[#3300AA] text-white shadow-[0_0_10px_rgba(68,0,204,0.2)]"
                      >
                        {loading ? 'Processando...' : 'Selecionar plano'}
                      </Button>
                    </CardFooter>
                  </Card>
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}
      </div>

      {/* Histórico de pagamentos */}
      <div className="mt-10 px-4 sm:px-6 md:mt-12 md:px-10">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Histórico de pagamentos</h2>

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
          <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)]">
            <CardContent className="p-4 text-center text-gray-500 sm:p-8">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Nenhum pagamento encontrado</p>
              <p className="text-sm mt-2">Quando você assinar um plano, suas faturas aparecerão aqui</p>
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
                              {payment.description || 'Assinatura Empresarial'}
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

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                        <div className="text-left sm:text-right">
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
                            className="flex w-full items-center gap-2 sm:w-auto"
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

    </div>
  )
}
