"use client"

import { useCallback, useEffect, useState } from "react"
import { Briefcase, Users, BarChart2, CreditCard, Plus, ArrowRight, MapPin, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useEmpresas } from "@/hooks/use-empresas"
import { useAuth } from "@/hooks/use-auth"
import { vagasApiService } from "@/lib/api/vagas-api"
import { Vaga } from "@/lib/vagas/vagas-types"
import { formatarTexto } from "@/lib/utils/format-text"

export default function EmployerHome() {
  const { user } = useAuth()
  const { currentEmpresa, loadCurrentEmpresa, loading: empresaLoading } = useEmpresas()

  const [metrics, setMetrics] = useState([
    {
      icon: Briefcase,
      color: "#4400CC",
      title: "Vagas ativas",
      value: "0",
      change: "0",
      positive: true,
    },
    {
      icon: Users,
      color: "#0057FF",
      title: "Candidaturas",
      value: "0",
      change: "0",
      positive: true,
    },
  ])

  const [recentJobs, setRecentJobs] = useState<Vaga[]>([])
  const [metricsLoading, setMetricsLoading] = useState(true)
  const [vagasLoading, setVagasLoading] = useState(true)

  // Carregar dados da empresa
  useEffect(() => {
    if (user?.id) {
      loadCurrentEmpresa()
    }
  }, [user?.id, loadCurrentEmpresa])

  // Carregar métricas e vagas quando a empresa for carregada
  const loadMetrics = useCallback(async () => {
    if (!user?.id) return

    setMetricsLoading(true)
    try {
      const metricsData = await vagasApiService.getVagasMetrics(user.id)

      // Calcular total de candidaturas
      const totalCandidaturas = await vagasApiService.getTotalCandidaturas(user.id)

      setMetrics([
        {
          icon: Briefcase,
          color: "#4400CC",
          title: "Vagas ativas",
          value: metricsData.vagas_ativas.toString(),
          change: `+${metricsData.vagas_ativas}`,
          positive: true,
        },
        {
          icon: Users,
          color: "#0057FF",
          title: "Candidaturas",
          value: totalCandidaturas.toString(),
          change: `+${totalCandidaturas}`,
          positive: true,
        },
      ])
    } catch (error) {
      console.error('Erro ao carregar métricas:', error)
    } finally {
      setMetricsLoading(false)
    }
  }, [user?.id])

  const loadRecentJobs = useCallback(async () => {
    if (!user?.id) return

    setVagasLoading(true)
    try {
      const response = await vagasApiService.getVagasByEmpregador(user.id, {
        limit: 3,
        offset: 0,
        status: 'Ativa'
      })

      setRecentJobs(response.vagas)
    } catch (error) {
      console.error('Erro ao carregar vagas recentes:', error)
    } finally {
      setVagasLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (user?.id) {
      loadMetrics()
      loadRecentJobs()
    }
  }, [loadMetrics, loadRecentJobs, user?.id])

  const formatDaysLeft = (dataExpiracao?: string) => {
    if (!dataExpiracao) return "Sem prazo"

    const expiracao = new Date(dataExpiracao)
    const hoje = new Date()
    const diffTime = expiracao.getTime() - hoje.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays <= 0) return "Expirada"
    return `${diffDays} dias restantes`
  }

  const formatLocation = (vaga: Vaga) => {
    const parts = []
    if (vaga.cidade) parts.push(vaga.cidade)
    if (vaga.estado) parts.push(vaga.estado)
    if (vaga.modelo_trabalho) parts.push(`• ${formatarTexto(vaga.modelo_trabalho)}`)
    return parts.join(', ') || 'Localização não informada'
  }

  return (
    <ProtectedRoute allowedRoles={['empregador']}>
      <div className="w-full pb-10">
      {/* Banner com gradiente roxo-azul neon */}
      <div className="flex min-h-[152px] flex-col justify-center bg-gradient-to-r from-[#4400CC] to-[#00FFAE] px-4 py-6 shadow-[0_0_20px_rgba(68,0,204,0.3)] sm:px-6 md:min-h-[200px] md:px-10">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
          Bem-vindo(a), {empresaLoading ? 'Carregando...' : (currentEmpresa?.nome || 'Empresa')}
        </h1>
        <p className="text-base md:text-lg text-white/90 mt-2">Gerencie suas vagas e encontre os melhores talentos</p>
      </div>

      {/* Card de criação de vaga */}
      <div className="relative z-10 -mt-6 px-4 sm:px-6 md:px-10">
        <Card className="bg-white border-[#4400CC]/30 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Publique uma nova vaga</h2>
                <p className="text-gray-600 mt-1">
                  Encontre os melhores profissionais para sua empresa. Crie uma vaga agora mesmo!
                </p>
              </div>
              <Link href="/empregador/criar-vaga">
                <Button className="w-full bg-[#4400CC] text-white shadow-[0_0_10px_rgba(68,0,204,0.2)] hover:bg-[#3300AA] md:w-auto">
                  <Plus size={18} className="mr-2" /> Criar nova vaga
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Card de assinatura */}
      <div className="mt-6 px-4 sm:px-6 md:px-10">
        <Card className="bg-gradient-to-r from-[#4400CC]/10 to-[#00FFAE]/10 border-[#4400CC]/30 shadow-lg">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <Badge className="bg-[#FFB800] text-white mb-2">Período de teste</Badge>
                <h2 className="text-xl font-bold text-gray-800">Seu período de teste termina em 30 dias</h2>
                <p className="text-gray-600 mt-1">
                  Aproveite todos os recursos premium e encontre os melhores candidatos para sua empresa.
                </p>
              </div>
              <Button className="bg-[#00FFAE] hover:bg-[#00FFAE]/80 text-[#4400CC] font-medium shadow-[0_0_10px_rgba(0,255,174,0.2)]">
                Assinar agora <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas */}
      <div className="mt-6 grid grid-cols-1 gap-4 px-4 sm:px-6 md:mt-8 md:grid-cols-2 md:gap-6 md:px-10">
        {metricsLoading ? (
          // Loading state for metrics
          Array.from({ length: 2 }).map((_, index) => (
            <Card
              key={index}
              className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)] animate-pulse"
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-lg bg-gray-200"></div>
                  <div className="ml-4 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                    <div className="h-6 bg-gray-200 rounded w-12"></div>
                    <div className="h-2 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          metrics.map((metric, index) => (
            <Card
              key={index}
              className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)] hover:shadow-[0_0_20px_rgba(68,0,204,0.2)] transition-all"
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center shadow-[0_0_10px_rgba(68,0,204,0.1)]"
                    style={{ backgroundColor: `${metric.color}10`, borderColor: `${metric.color}20` }}
                  >
                    <metric.icon className="text-[#4400CC]" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">{metric.title}</p>
                    <p className="text-2xl font-bold text-[#4400CC] mt-1">{metric.value}</p>
                    <p className="text-xs text-green-500 mt-1">
                      {metric.positive ? "+" : "-"}
                      {metric.change} {typeof metric.change === "string" && metric.change.includes("%") ? "" : "este mês"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Atalhos */}
      <div className="mt-6 px-4 sm:px-6 md:mt-8 md:px-10">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Acesso rápido</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/empregador/vagas">
            <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)] hover:shadow-[0_0_20px_rgba(68,0,204,0.2)] transition-all h-full cursor-pointer">
              <CardContent className="flex h-full flex-col items-center p-4 text-center sm:p-6">
                <Briefcase size={36} className="text-[#4400CC] mb-4" />
                <h3 className="font-medium text-gray-800">Gerenciar vagas</h3>
                <p className="text-sm text-gray-600 mt-2">Visualize e edite suas vagas publicadas</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/empregador/dashboard">
            <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)] hover:shadow-[0_0_20px_rgba(68,0,204,0.2)] transition-all h-full cursor-pointer">
              <CardContent className="flex h-full flex-col items-center p-4 text-center sm:p-6">
                <BarChart2 size={36} className="text-[#0057FF] mb-4" />
                <h3 className="font-medium text-gray-800">Dashboard</h3>
                <p className="text-sm text-gray-600 mt-2">Acompanhe o desempenho das suas vagas</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/empregador/assinatura">
            <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)] hover:shadow-[0_0_20px_rgba(68,0,204,0.2)] transition-all h-full cursor-pointer">
              <CardContent className="flex h-full flex-col items-center p-4 text-center sm:p-6">
                <CreditCard size={36} className="text-[#00FFAE] mb-4" />
                <h3 className="font-medium text-gray-800">Assinatura</h3>
                <p className="text-sm text-gray-600 mt-2">Gerencie seu plano e pagamentos</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Vagas recentes */}
      <div className="mt-6 px-4 sm:px-6 md:mt-8 md:px-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Vagas recentes</h2>
          <Link href="/empregador/vagas">
            <Button variant="link" className="text-[#4400CC] p-0 h-auto">
              Ver todas
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vagasLoading ? (
            // Loading state
            Array.from({ length: 3 }).map((_, index) => (
              <Card
                key={index}
                className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)] animate-pulse"
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="flex justify-between">
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : recentJobs.length > 0 ? (
            recentJobs.map((job) => (
              <Card
                key={job.id}
                className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)] hover:shadow-[0_0_20px_rgba(68,0,204,0.2)] transition-all"
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-800">{job.titulo}</h3>
                      <p className="text-sm text-gray-600 mt-1 flex items-center">
                        <MapPin size={12} className="mr-1" />
                        {formatLocation(job)}
                      </p>
                    </div>
                    <Badge className="bg-[#4400CC]/10 text-[#4400CC] border-[#4400CC]/20">
                      {job.status}
                    </Badge>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600">
                      <Users size={14} className="mr-1" />
                      <span>{job.total_candidatos || 0} candidatos</span>
                    </div>
                    <div className="text-sm text-[#4400CC] flex items-center">
                      <Calendar size={12} className="mr-1" />
                      {formatDaysLeft(job.data_expiracao)}
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link href={`/empregador/vagas/${job.id}`}>
                      <Button
                        variant="outline"
                        className="w-full border-[#4400CC]/30 text-[#4400CC] hover:bg-[#4400CC]/5"
                      >
                        Ver detalhes
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            // Empty state
            <div className="col-span-full text-center py-8">
              <Briefcase size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">Nenhuma vaga encontrada</h3>
              <p className="text-sm text-gray-400 mb-4">Comece criando sua primeira vaga!</p>
              <Link href="/empregador/criar-vaga">
                <Button className="bg-[#4400CC] hover:bg-[#3300AA] text-white">
                  <Plus size={16} className="mr-2" />
                  Criar primeira vaga
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
    </ProtectedRoute>
  )
}
