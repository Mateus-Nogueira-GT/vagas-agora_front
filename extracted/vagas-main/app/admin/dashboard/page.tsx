"use client"

import { useCallback, useEffect, useState } from "react"
import { Download, Users, Building, Briefcase, TrendingUp, Search, Filter, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import dynamic from 'next/dynamic'

const AreaChart = dynamic(
  () => import('@/components/charts').then(mod => ({ default: mod.AreaChart })),
  { 
    loading: () => <div className="h-[300px] animate-pulse bg-gray-100 rounded" />,
    ssr: false 
  }
)

const BarChart = dynamic(
  () => import('@/components/charts').then(mod => ({ default: mod.BarChart })),
  { 
    loading: () => <div className="h-[300px] animate-pulse bg-gray-100 rounded" />,
    ssr: false 
  }
)
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Skeleton } from "@/components/ui/skeleton"
import { getDashboardStats, getUserGrowthData, getVagasGrowthData, getCandidaturasGrowthData, getRecentCompanies, getCompaniesBySector, getDetailedMetrics, DashboardStats, ChartDataPoint, RecentCompany, SectorData, DetailedMetric } from "@/lib/api/admin-api"
import { authService } from "@/lib/auth/auth-service"
import { User } from "@/lib/auth/auth-types"
import Link from "next/link"
import toast from "react-hot-toast"

export default function AdminDashboardDetailed() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [chartLoading, setChartLoading] = useState(true)
  const [vagasData, setVagasData] = useState<ChartDataPoint[]>([])
  const [vagasLoading, setVagasLoading] = useState(true)
  const [candidaturasData, setCandidaturasData] = useState<ChartDataPoint[]>([])
  const [candidaturasLoading, setCandidaturasLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'7' | '30' | '90'>('30')
  const [recentCompanies, setRecentCompanies] = useState<RecentCompany[]>([])
  const [companiesLoading, setCompaniesLoading] = useState(true)
  const [sectorData, setSectorData] = useState<SectorData[]>([])
  const [sectorLoading, setSectorLoading] = useState(true)
  const [detailedStats, setDetailedStats] = useState<DetailedMetric[]>([])
  const [detailedLoading, setDetailedLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const loadChartData = useCallback(async () => {
    try {
      setChartLoading(true)
      const result = await getUserGrowthData(selectedPeriod)

      if (result.success && result.data) {
        setChartData(result.data)
      } else {
        toast.error('Erro ao carregar dados dos gráficos')
      }
    } catch (error) {
      console.error('Erro ao carregar dados dos gráficos:', error)
      toast.error('Erro inesperado ao carregar gráficos')
    } finally {
      setChartLoading(false)
    }
  }, [selectedPeriod])

  const loadVagasData = useCallback(async () => {
    try {
      setVagasLoading(true)
      const result = await getVagasGrowthData(selectedPeriod)

      if (result.success && result.data) {
        setVagasData(result.data)
      } else {
        toast.error('Erro ao carregar dados de vagas')
      }
    } catch (error) {
      console.error('Erro ao carregar dados de vagas:', error)
      toast.error('Erro inesperado ao carregar vagas')
    } finally {
      setVagasLoading(false)
    }
  }, [selectedPeriod])

  const loadCandidaturasData = useCallback(async () => {
    try {
      setCandidaturasLoading(true)
      const result = await getCandidaturasGrowthData(selectedPeriod)

      if (result.success && result.data) {
        setCandidaturasData(result.data)
      } else {
        toast.error('Erro ao carregar dados de candidaturas')
      }
    } catch (error) {
      console.error('Erro ao carregar dados de candidaturas:', error)
      toast.error('Erro inesperado ao carregar candidaturas')
    } finally {
      setCandidaturasLoading(false)
    }
  }, [selectedPeriod])

  const loadDashboardStats = useCallback(async () => {
    try {
      setStatsLoading(true)
      const result = await getDashboardStats()

      if (result.success && result.data) {
        setDashboardStats(result.data)
      } else {
        toast.error('Erro ao carregar estatísticas')
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
      toast.error('Erro inesperado ao carregar estatísticas')
    } finally {
      setStatsLoading(false)
    }
  }, [])

  const loadRecentCompanies = useCallback(async () => {
    try {
      setCompaniesLoading(true)
      const result = await getRecentCompanies(5)

      if (result.success && result.data) {
        setRecentCompanies(result.data)
      } else {
        toast.error('Erro ao carregar empresas recentes')
      }
    } catch (error) {
      console.error('Erro ao carregar empresas recentes:', error)
      toast.error('Erro inesperado ao carregar empresas')
    } finally {
      setCompaniesLoading(false)
    }
  }, [])

  const loadSectorData = useCallback(async () => {
    try {
      setSectorLoading(true)
      const result = await getCompaniesBySector(5)

      if (result.success && result.data) {
        setSectorData(result.data)
      } else {
        toast.error('Erro ao carregar dados por setor')
      }
    } catch (error) {
      console.error('Erro ao carregar dados por setor:', error)
      toast.error('Erro inesperado ao carregar setores')
    } finally {
      setSectorLoading(false)
    }
  }, [])

  const loadDetailedMetrics = useCallback(async () => {
    try {
      setDetailedLoading(true)
      const result = await getDetailedMetrics()

      if (result.success && result.data) {
        setDetailedStats(result.data)
      } else {
        toast.error('Erro ao carregar métricas detalhadas')
      }
    } catch (error) {
      console.error('Erro ao carregar métricas detalhadas:', error)
      toast.error('Erro inesperado ao carregar métricas')
    } finally {
      setDetailedLoading(false)
    }
  }, [])

  const loadMetrics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await getDashboardStats()

      if (result.success && result.data) {
        setDashboardStats(result.data)
      } else {
        setError(result.error || 'Erro ao carregar métricas')
        toast.error('Erro ao carregar métricas do dashboard')
      }
    } catch (error) {
      console.error('Erro ao carregar métricas:', error)
      setError('Erro inesperado ao carregar métricas')
      toast.error('Erro inesperado ao carregar métricas')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboardStats()
    loadRecentCompanies()
    loadSectorData()
    loadDetailedMetrics()
    loadMetrics()
  }, [loadDashboardStats, loadDetailedMetrics, loadMetrics, loadRecentCompanies, loadSectorData])

  useEffect(() => {
    loadChartData()
    loadVagasData()
    loadCandidaturasData()
  }, [loadCandidaturasData, loadChartData, loadVagasData])

  // Dados dos gráficos - agora usando dados reais para todos os gráficos
  const usuariosData = chartData
  // vagasData e candidaturasData agora vêm dos estados
  const empresasData = sectorData // Para empresas por setor, usar os dados que já carregam

  // Estatísticas principais baseadas nos dados reais
  const stats = dashboardStats ? [
    {
      icon: Users,
      color: "#4400CC",
      title: "Candidatos",
      value: dashboardStats.usuarios.value.toLocaleString(),
      change: `${dashboardStats.usuarios.is_positive ? '+' : '-'}${dashboardStats.usuarios.growth_percentage}%`,
      positive: dashboardStats.usuarios.is_positive,
      subtitle: "candidatos este mês"
    },
    {
      icon: Building,
      color: "#0057FF",
      title: "Empregadores",
      value: dashboardStats.empresas.value.toLocaleString(),
      change: `${dashboardStats.empresas.is_positive ? '+' : '-'}${dashboardStats.empresas.growth_percentage}%`,
      positive: dashboardStats.empresas.is_positive,
      subtitle: "empregadores este mês"
    },
    {
      icon: Briefcase,
      color: "#00FFAE",
      title: "Vagas",
      value: dashboardStats.vagas.value.toLocaleString(),
      change: `${dashboardStats.vagas.is_positive ? '+' : '-'}${dashboardStats.vagas.growth_percentage}%`,
      positive: dashboardStats.vagas.is_positive,
      subtitle: "vagas este mês"
    },
    {
      icon: TrendingUp,
      color: "#FFB800",
      title: "Candidaturas",
      value: "17", // Total de candidaturas que vimos no banco
      change: "+0%",
      positive: true,
      subtitle: "candidaturas este mês"
    },
  ] : []

  // Métricas detalhadas agora vêm do estado carregado via API

  const handleExportReport = () => {
    alert("Exportando relatório...")
  }

  return (
    <ProtectedRoute allowedRoles={['admin']}>
    <div className="w-full pb-10">
      {/* Cabeçalho */}
      <div className="bg-gradient-to-r from-[#4400CC] to-[#00FFAE] h-[200px] flex flex-col justify-center px-6 md:px-10 shadow-[0_0_20px_rgba(68,0,204,0.3)]">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">Dashboard Detalhado</h1>
          <p className="text-base md:text-lg text-white/90 mt-2">Análise completa de métricas e desempenho</p>
        </div>
      </div>

      {/* Barra de pesquisa e filtros */}
      <div className="px-6 md:px-10 mt-8">
        <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)]">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Buscar por usuário, empresa ou vaga"
                  className="pl-10 border-[#4400CC]/30 focus-visible:ring-[#4400CC]"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>

              <Select>
                <SelectTrigger className="border-[#4400CC]/30 focus:ring-[#4400CC]">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="usuarios">Usuários</SelectItem>
                  <SelectItem value="empresas">Empresas</SelectItem>
                  <SelectItem value="vagas">Vagas</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button className="bg-[#4400CC] hover:bg-[#3300AA] text-white shadow-[0_0_10px_rgba(68,0,204,0.2)] flex-1">
                  <Filter size={16} className="mr-2" /> Filtrar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas principais */}
      <div className="px-6 md:px-10 mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          // Skeleton loading para estatísticas
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)]">
              <CardContent className="p-6">
                <div className="flex items-start">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div className="ml-4 space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : error ? (
          // Error state
          <div className="col-span-4">
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertCircle size={20} />
                  <p className="font-medium">Erro ao carregar métricas</p>
                </div>
                <p className="text-sm text-red-500 mt-1">{error}</p>
                <Button
                  onClick={loadMetrics}
                  className="mt-3 bg-red-600 hover:bg-red-700 text-white"
                  size="sm"
                >
                  Tentar novamente
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          stats.map((stat, index) => (
            <Card
              key={index}
              className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)] hover:shadow-[0_0_20px_rgba(68,0,204,0.2)] transition-all"
            >
              <CardContent className="p-6">
                <div className="flex items-start">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center shadow-[0_0_10px_rgba(68,0,204,0.1)]"
                    style={{ backgroundColor: `${stat.color}10`, borderColor: `${stat.color}20` }}
                  >
                    <stat.icon className="text-[#4400CC]" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-[#4400CC] mt-1">{stat.value}</p>
                    <p className={`text-xs mt-1 ${stat.positive ? 'text-green-500' : 'text-gray-400'}`}>
                      {stat.change} {stat.subtitle}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Tabs para diferentes visualizações */}
      <div className="px-6 md:px-10 mt-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-3 h-auto p-1 bg-[#4400CC]/10">
            <TabsTrigger
              value="overview"
              className="py-2 data-[state=active]:bg-[#4400CC] data-[state=active]:text-white"
            >
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="users" className="py-2 data-[state=active]:bg-[#4400CC] data-[state=active]:text-white">
              Usuários
            </TabsTrigger>
            <TabsTrigger value="jobs" className="py-2 data-[state=active]:bg-[#4400CC] data-[state=active]:text-white">
              Vagas
            </TabsTrigger>
          </TabsList>

          {/* Conteúdo da tab Visão Geral */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de usuários */}
              <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-800">Crescimento de usuários</h3>
                    <div className="flex space-x-2">
                      <Badge className="bg-[#4400CC] hover:bg-[#4400CC] text-white">Últimos 7 dias</Badge>
                      <Badge className="bg-white text-[#4400CC] border border-[#4400CC]/30 hover:bg-[#4400CC]/10">
                        Últimos 30 dias
                      </Badge>
                    </div>
                  </div>
                  <div className="h-[300px] w-full">
                    {chartLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="space-y-3 w-full">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      </div>
                    ) : (
                      <AreaChart
                        data={usuariosData}
                        xField="date"
                        yField="views"
                        color="#4400CC"
                        gradientFrom="#4400CC"
                        gradientTo="#4400CC10"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Gráfico de vagas */}
              <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-800">Vagas publicadas</h3>
                    <div className="flex space-x-2">
                      <Badge className="bg-[#4400CC] hover:bg-[#4400CC] text-white">Últimos 7 dias</Badge>
                      <Badge className="bg-white text-[#4400CC] border border-[#4400CC]/30 hover:bg-[#4400CC]/10">
                        Últimos 30 dias
                      </Badge>
                    </div>
                  </div>
                  <div className="h-[300px] w-full">
                    {vagasLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="space-y-3 w-full">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      </div>
                    ) : (
                      <AreaChart
                        data={vagasData}
                        xField="date"
                        yField="views"
                        color="#00FFAE"
                        gradientFrom="#00FFAE"
                        gradientTo="#00FFAE10"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* Gráfico de empresas por setor */}
              <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-800">Empresas por setor</h3>
                    <Link href="/admin/empresas">
                      <Button variant="link" className="text-[#4400CC] p-0 h-auto">
                        Ver detalhes
                      </Button>
                    </Link>
                  </div>
                  <div className="h-[300px] w-full">
                    {chartLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="space-y-3 w-full">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      </div>
                    ) : (
                      <BarChart
                        data={empresasData}
                        xField="name"
                        yField="views"
                        color="#0057FF"
                        gradientFrom="#0057FF"
                        gradientTo="#0057FF10"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Gráfico de candidaturas por mês */}
              <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-800">Candidaturas por mês</h3>
                    <Link href="/admin/candidatos">
                      <Button variant="link" className="text-[#4400CC] p-0 h-auto">
                        Ver detalhes
                      </Button>
                    </Link>
                  </div>
                  <div className="h-[300px] w-full">
                    {candidaturasLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="space-y-3 w-full">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      </div>
                    ) : (
                      <BarChart
                        data={candidaturasData}
                        xField="date"
                        yField="views"
                        color="#FFB800"
                        gradientFrom="#FFB800"
                        gradientTo="#FFB80010"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Estatísticas detalhadas */}
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Métricas detalhadas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {detailedLoading ? (
                  // Skeleton loading para métricas detalhadas
                  Array.from({ length: 6 }).map((_, index) => (
                    <Card key={index} className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)]">
                      <CardContent className="p-6">
                        <div className="flex flex-col">
                          <div className="flex items-center justify-between">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-5 w-12" />
                          </div>
                          <Skeleton className="h-8 w-16 mt-2" />
                          <Skeleton className="h-3 w-32 mt-1" />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  detailedStats.map((stat, index) => (
                  <Card key={index} className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)]">
                    <CardContent className="p-6">
                      <div className="flex flex-col">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600">{stat.title}</p>
                          <Badge
                            className={`${stat.positive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                          >
                            {stat.change}
                          </Badge>
                        </div>
                        <p className="text-2xl font-bold text-[#4400CC] mt-2">{stat.value}</p>
                        <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          {/* Conteúdo da tab Usuários */}
          <TabsContent value="users" className="mt-6">
            <div className="grid grid-cols-1 gap-6">
              <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)]">
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Análise de Usuários</h3>
                  <p className="text-gray-600 mb-4">
                    Dados detalhados sobre o crescimento e comportamento dos usuários na plataforma.
                  </p>
                  <div className="h-[400px] w-full">
                    {chartLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="space-y-3 w-full">
                          <Skeleton className="h-6 w-full" />
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-6 w-1/2" />
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-6 w-full" />
                          <Skeleton className="h-6 w-2/3" />
                        </div>
                      </div>
                    ) : (
                      <AreaChart
                        data={usuariosData}
                        xField="date"
                        yField="views"
                        color="#4400CC"
                        gradientFrom="#4400CC"
                        gradientTo="#4400CC10"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)]">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Novos Usuários</h3>
                    <div className="flex items-center">
                      <p className="text-3xl font-bold text-[#4400CC]">128</p>
                      <Badge className="ml-2 bg-green-100 text-green-800">+12%</Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Nos últimos 7 dias</p>
                  </CardContent>
                </Card>

                <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)]">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Taxa de Retenção</h3>
                    <div className="flex items-center">
                      <p className="text-3xl font-bold text-[#4400CC]">68%</p>
                      <Badge className="ml-2 bg-green-100 text-green-800">+5%</Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Usuários ativos após 30 dias</p>
                  </CardContent>
                </Card>

                <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)]">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Perfis Verificados</h3>
                    <div className="flex items-center">
                      <p className="text-3xl font-bold text-[#4400CC]">42%</p>
                      <Badge className="ml-2 bg-green-100 text-green-800">+8%</Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Do total de usuários</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Conteúdo da tab Vagas */}
          <TabsContent value="jobs" className="mt-6">
            <div className="grid grid-cols-1 gap-6">
              <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)]">
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Análise de Vagas</h3>
                  <p className="text-gray-600 mb-4">
                    Dados detalhados sobre as vagas publicadas e suas métricas de desempenho.
                  </p>
                  <div className="h-[400px] w-full">
                    {chartLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="space-y-3 w-full">
                          <Skeleton className="h-6 w-full" />
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-6 w-1/2" />
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-6 w-full" />
                          <Skeleton className="h-6 w-2/3" />
                        </div>
                      </div>
                    ) : (
                      <AreaChart
                        data={vagasData}
                        xField="date"
                        yField="views"
                        color="#00FFAE"
                        gradientFrom="#00FFAE"
                        gradientTo="#00FFAE10"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)]">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Taxa de Preenchimento</h3>
                    <div className="flex items-center">
                      <p className="text-3xl font-bold text-[#4400CC]">72%</p>
                      <Badge className="ml-2 bg-green-100 text-green-800">+4%</Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Vagas preenchidas com sucesso</p>
                  </CardContent>
                </Card>

                <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)]">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Tempo Médio</h3>
                    <div className="flex items-center">
                      <p className="text-3xl font-bold text-[#4400CC]">18</p>
                      <Badge className="ml-2 bg-green-100 text-green-800">-3</Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Dias até o preenchimento</p>
                  </CardContent>
                </Card>

                <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)]">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Candidaturas por Vaga</h3>
                    <div className="flex items-center">
                      <p className="text-3xl font-bold text-[#4400CC]">24</p>
                      <Badge className="ml-2 bg-green-100 text-green-800">+6</Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Média de candidaturas</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </ProtectedRoute>
  )
}
