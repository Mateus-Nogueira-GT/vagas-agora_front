"use client"

import { Users, Briefcase, Building, BarChart2, DollarSign, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import Link from "next/link"
import Image from "next/image"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useEffect, useState } from "react"
import { authService } from "@/lib/auth/auth-service"
import { User } from "@/lib/auth/auth-types"
import { getDashboardStats, DashboardStats, getUserGrowthData, ChartDataPoint, getRecentCompanies, RecentCompany, getCompaniesBySector, SectorData } from "@/lib/api/admin-api"

export default function AdminDashboard() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [chartLoading, setChartLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'7' | '30' | '90'>('30')
  const [recentCompanies, setRecentCompanies] = useState<RecentCompany[]>([])
  const [companiesLoading, setCompaniesLoading] = useState(true)
  const [sectorData, setSectorData] = useState<SectorData[]>([])
  const [sectorLoading, setSectorLoading] = useState(true)

  useEffect(() => {
    const user = authService.getCurrentUser()
    setCurrentUser(user)
  }, [])

  useEffect(() => {
    const loadStats = async () => {
      setStatsLoading(true)
      try {
        const response = await getDashboardStats()
        if (response.success && response.data) {
          setDashboardStats(response.data)
        }
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error)
      } finally {
        setStatsLoading(false)
      }
    }

    loadStats()
  }, [])

  useEffect(() => {
    const loadChartData = async () => {
      setChartLoading(true)
      try {
        const response = await getUserGrowthData(selectedPeriod)
        if (response.success && response.data) {
          setChartData(response.data)
        }
      } catch (error) {
        console.error('Erro ao carregar dados do gráfico:', error)
      } finally {
        setChartLoading(false)
      }
    }

    loadChartData()
  }, [selectedPeriod])

  useEffect(() => {
    const loadRecentCompanies = async () => {
      setCompaniesLoading(true)
      try {
        const response = await getRecentCompanies(3)
        if (response.success && response.data) {
          setRecentCompanies(response.data)
        }
      } catch (error) {
        console.error('Erro ao carregar empresas recentes:', error)
      } finally {
        setCompaniesLoading(false)
      }
    }

    loadRecentCompanies()
  }, [])

  useEffect(() => {
    const loadSectorData = async () => {
      setSectorLoading(true)
      try {
        const response = await getCompaniesBySector(5)
        if (response.success && response.data) {
          setSectorData(response.data)
        }
      } catch (error) {
        console.error('Erro ao carregar dados de setores:', error)
      } finally {
        setSectorLoading(false)
      }
    }

    loadSectorData()
  }, [])

  // Dados de exemplo para o gráfico
  const usuariosData = [
    { date: "Jan", views: 120 },
    { date: "Fev", views: 145 },
    { date: "Mar", views: 162 },
    { date: "Abr", views: 190 },
    { date: "Mai", views: 210 },
    { date: "Jun", views: 235 },
    { date: "Jul", views: 258 },
  ]


  // Estatísticas dinâmicas
  const stats = [
    {
      icon: Users,
      color: "#4400CC",
      title: "Usuários",
      value: statsLoading ? "..." : (dashboardStats?.usuarios.value.toLocaleString('pt-BR') || "0"),
      change: statsLoading ? "..." : `${dashboardStats?.usuarios.is_positive ? '+' : '-'}${dashboardStats?.usuarios.growth_percentage || 0}%`,
      positive: dashboardStats?.usuarios.is_positive ?? true,
    },
    {
      icon: Building,
      color: "#0057FF",
      title: "Empresas",
      value: statsLoading ? "..." : (dashboardStats?.empresas.value.toLocaleString('pt-BR') || "0"),
      change: statsLoading ? "..." : `${dashboardStats?.empresas.is_positive ? '+' : '-'}${dashboardStats?.empresas.growth_percentage || 0}%`,
      positive: dashboardStats?.empresas.is_positive ?? true,
    },
    {
      icon: Briefcase,
      color: "#00FFAE",
      title: "Vagas",
      value: statsLoading ? "..." : (dashboardStats?.vagas.value.toLocaleString('pt-BR') || "0"),
      change: statsLoading ? "..." : `${dashboardStats?.vagas.is_positive ? '+' : '-'}${dashboardStats?.vagas.growth_percentage || 0}%`,
      positive: dashboardStats?.vagas.is_positive ?? true,
    },
  ]

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="w-full pb-10">
      {/* Banner com gradiente roxo-azul neon */}
      <div className="bg-gradient-to-r from-[#4400CC] to-[#00FFAE] h-[200px] flex flex-col justify-center px-6 md:px-10 shadow-[0_0_20px_rgba(68,0,204,0.3)]">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
          Bem-vindo(a), {currentUser?.nome || 'Admin'}
        </h1>
        <p className="text-base md:text-lg text-white/90 mt-2">Gerencie usuários, empresas e vagas</p>
      </div>

      {/* Card de Gerenciar Assinaturas */}
      <div className="px-6 md:px-10 mt-8">
        <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)] hover:shadow-[0_0_20px_rgba(68,0,204,0.2)] transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-lg bg-[#4400CC]/10 flex items-center justify-center shadow-[0_0_10px_rgba(68,0,204,0.1)]">
                  <CreditCard className="text-[#4400CC]" size={24} />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-[#4400CC]">Gerenciar Assinaturas</h3>
                  <p className="text-sm text-gray-600 mt-1">Acesse o painel de assinaturas e pagamentos</p>
                </div>
              </div>
              <Link href="https://www.asaas.com/" target="_blank" rel="noopener noreferrer">
                <Button className="bg-[#4400CC] hover:bg-[#4400CC]/90 text-white shadow-[0_0_10px_rgba(68,0,204,0.2)]">
                  Acessar Painel
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="px-6 md:px-10 mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
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
                  <p className={`text-xs mt-1 ${stat.positive ? 'text-green-500' : 'text-red-500'}`}>
                    {stat.change} este mês
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="px-6 md:px-10 mt-8 grid grid-cols-1 gap-6">
        {/* Gráfico de usuários */}
        <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-800">Crescimento de usuários</h3>
              <div className="flex space-x-2">
                <Badge
                  className={`cursor-pointer transition-colors ${
                    selectedPeriod === '7'
                      ? 'bg-[#4400CC] hover:bg-[#4400CC] text-white'
                      : 'bg-white text-[#4400CC] border border-[#4400CC]/30 hover:bg-[#4400CC]/10'
                  }`}
                  onClick={() => setSelectedPeriod('7')}
                >
                  Últimos 7 dias
                </Badge>
                <Badge
                  className={`cursor-pointer transition-colors ${
                    selectedPeriod === '30'
                      ? 'bg-[#4400CC] hover:bg-[#4400CC] text-white'
                      : 'bg-white text-[#4400CC] border border-[#4400CC]/30 hover:bg-[#4400CC]/10'
                  }`}
                  onClick={() => setSelectedPeriod('30')}
                >
                  Últimos 30 dias
                </Badge>
                <Badge
                  className={`cursor-pointer transition-colors ${
                    selectedPeriod === '90'
                      ? 'bg-[#4400CC] hover:bg-[#4400CC] text-white'
                      : 'bg-white text-[#4400CC] border border-[#4400CC]/30 hover:bg-[#4400CC]/10'
                  }`}
                  onClick={() => setSelectedPeriod('90')}
                >
                  Últimos 90 dias
                </Badge>
              </div>
            </div>
            <div className="h-[300px] w-full overflow-hidden">
              {chartLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-gray-500">Carregando dados...</div>
                </div>
              ) : (
                <AreaChart
                  data={chartData}
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
      </div>

      <div className="px-6 md:px-10 mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Empresas por setor */}
        <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-800">Empresas por setor</h3>
            </div>
            <div className="h-[300px] w-full overflow-hidden">
              {sectorLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-gray-500">Carregando dados...</div>
                </div>
              ) : sectorData.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-gray-500">Nenhum dado encontrado</div>
                </div>
              ) : (
                <BarChart
                  data={sectorData}
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

        {/* Empresas recentes */}
        <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-800">Empresas recentes</h3>
              <Link href="/admin/empresas">
                <Button variant="link" className="text-[#4400CC] p-0 h-auto">
                  Ver todas
                </Button>
              </Link>
            </div>
            <div className="space-y-4">
              {companiesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-500">Carregando empresas...</div>
                </div>
              ) : recentCompanies.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-500">Nenhuma empresa encontrada</div>
                </div>
              ) : (
                recentCompanies.map((company) => (
                  <div
                    key={company.id}
                    className="p-4 border border-[#4400CC]/20 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-lg bg-[#4400CC]/10 flex items-center justify-center text-[#4400CC] font-medium overflow-hidden">
                          {company.logo && company.logo.startsWith('http') ? (
                            <Image
                              src={company.logo}
                              alt={company.nome}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                              unoptimized
                            />
                          ) : (
                            <span>{company.logo || company.nome?.charAt(0)?.toUpperCase() || 'E'}</span>
                          )}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-800">{company.nome}</p>
                          <p className="text-xs text-gray-600">{company.setor}</p>
                        </div>
                      </div>
                      <Badge style={{ backgroundColor: company.statusColor }} className="text-white">
                        {company.status}
                      </Badge>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-600">
                        <Briefcase size={14} className="mr-1" />
                        <span>{company.total_vagas} vagas publicadas</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#4400CC]/30 text-[#4400CC] hover:bg-[#4400CC]/5 h-8"
                      >
                        Ver detalhes
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="px-6 md:px-10 mt-8">
        <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)]">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Ações rápidas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/admin/candidatos">
                <Button className="w-full bg-white border border-[#4400CC]/30 hover:bg-[#4400CC]/5 text-[#4400CC] shadow-[0_0_10px_rgba(68,0,204,0.1)] h-auto py-6 flex flex-col items-center">
                  <Users size={24} className="mb-2" />
                  <span>Gerenciar candidatos</span>
                </Button>
              </Link>
              <Link href="/admin/empregadores">
                <Button className="w-full bg-white border border-[#4400CC]/30 hover:bg-[#4400CC]/5 text-[#4400CC] shadow-[0_0_10px_rgba(68,0,204,0.1)] h-auto py-6 flex flex-col items-center">
                  <Building size={24} className="mb-2" />
                  <span>Gerenciar empregadores</span>
                </Button>
              </Link>
              {/* Gerar relatórios - Oculto temporariamente */}
              {false && (
              <Button className="bg-white border border-[#4400CC]/30 hover:bg-[#4400CC]/5 text-[#4400CC] shadow-[0_0_10px_rgba(68,0,204,0.1)] h-auto py-6 flex flex-col items-center">
                <BarChart2 size={24} className="mb-2" />
                <span>Gerar relatórios</span>
              </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </ProtectedRoute>
  )
}
