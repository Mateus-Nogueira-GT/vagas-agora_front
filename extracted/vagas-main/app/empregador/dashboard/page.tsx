"use client"

import { useState } from "react"
import { Briefcase, Users, Calendar, TrendingUp, CheckCircle, XCircle, Search, Filter, Download, Eye } from "lucide-react"
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
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useDashboard } from "@/hooks/use-dashboard"
import { useEmpresas } from "@/hooks/use-empresas"
import { useAuth } from "@/hooks/use-auth"
import { exportDashboardToExcel } from "@/lib/utils/excel-export"
import { formatarTexto } from "@/lib/utils/format-text"
import toast from "react-hot-toast"

export default function EmployerDashboard() {
  const { stats, candidaturasTempo, vagasStatus, filteredVagas, isLoading, error, clearError, loadDashboardData, loadFilteredVagas } = useDashboard()
  const { currentEmpresa } = useEmpresas()
  const { user } = useAuth()
  const [selectedPeriod, setSelectedPeriod] = useState("7")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todas")
  const [isExporting, setIsExporting] = useState(false)

  // Verificar se há filtros ativos
  const hasActiveFilters = searchTerm.trim() !== "" || statusFilter !== "todas"

  const handlePeriodChange = async (period: string) => {
    setSelectedPeriod(period)
    await loadDashboardData(period)
  }

  const handleFilter = async () => {
    await loadFilteredVagas(searchTerm, statusFilter)
  }

  const handleClearFilters = async () => {
    setSearchTerm("")
    setStatusFilter("todas")
    await loadFilteredVagas("", "todas")
  }

  // Função para formatar localização
  const formatLocation = (vaga: any) => {
    const parts = []
    if (vaga.cidade) parts.push(vaga.cidade)
    if (vaga.estado) parts.push(vaga.estado)
    if (vaga.modelo_trabalho) parts.push(`• ${formatarTexto(vaga.modelo_trabalho)}`)
    return parts.join(', ') || 'Localização não informada'
  }

  // Estatísticas principais usando dados reais
  const mainStats = [
    {
      icon: Briefcase,
      color: "#4400CC",
      title: "Vagas ativas",
      value: stats?.vagas_ativas?.toString() || "0",
      change: `+${stats?.vagas_ativas || 0}`,
      positive: true,
    },
    {
      icon: Users,
      color: "#0057FF",
      title: "Candidaturas",
      value: stats?.total_candidaturas?.toString() || "0",
      change: `+${stats?.total_candidaturas || 0}`,
      positive: true,
    },
    {
      icon: Calendar,
      color: "#00FFAE",
      title: "Contratações",
      value: stats?.vagas_preenchidas?.toString() || "0",
      change: `+${stats?.vagas_preenchidas || 0}`,
      positive: true,
    },
    {
      icon: TrendingUp,
      color: "#FFB800",
      title: "Taxa de conversão",
      value: `${stats?.taxa_conversao || 0}%`,
      change: `+${stats?.taxa_conversao || 0}%`,
      positive: true,
    },
  ]

  // Estatísticas secundárias usando dados reais
  const secondaryStats = [
    {
      icon: CheckCircle,
      color: "#00FFAE",
      title: "Vagas preenchidas",
      value: stats?.vagas_preenchidas?.toString() || "0",
      change: `+${stats?.vagas_preenchidas || 0}`,
      positive: true,
    },
    {
      icon: Users,
      color: "#0057FF",
      title: "Candidatos por vaga",
      value: stats?.candidatos_por_vaga?.toString() || "0",
      change: `+${stats?.candidatos_por_vaga || 0}`,
      positive: true,
    },
    {
      icon: Eye,
      color: "#4400CC",
      title: "Visualizações de vagas",
      value: stats?.visualizacoes_vagas?.toLocaleString() || "0",
      change: `+${Math.round((stats?.visualizacoes_vagas || 0) * 0.15)}`,
      positive: true,
    },
    {
      icon: TrendingUp,
      color: "#FFB800",
      title: "Engajamento médio",
      value: `${Math.round((stats?.total_candidaturas || 0) / (stats?.vagas_ativas || 1))}`,
      change: "+12%",
      positive: true,
    },
  ]

  const handleExportReport = async () => {
    if (!stats || !user?.id) {
      alert("Dados não carregados ainda. Tente novamente.")
      return
    }

    try {
      // Buscar todas as vagas para o relatório
      const vagasApiService = (await import("@/lib/api/vagas-api")).vagasApiService
      const todasVagas = await vagasApiService.getVagasByEmpregador(user.id, {
        limit: 100, // Buscar mais vagas para o relatório
        page: 1
      })

      const exportData = {
        stats,
        vagas: todasVagas.vagas || [],
        candidaturasTempo,
        vagasStatus,
        empresaNome: currentEmpresa?.nome || user.nome || "Empresa"
      }

      const fileName = await exportDashboardToExcel(exportData)

      // Mostrar feedback de sucesso
      alert(`Relatório exportado com sucesso: ${fileName}`)
    } catch (error) {
      console.error('Erro ao exportar relatório:', error)
      alert("Erro ao exportar relatório. Tente novamente.")
    }
  }

  return (
    <ProtectedRoute allowedRoles={['empregador']}>
    <div className="w-full pb-10">
      {/* Banner com gradiente roxo-azul neon */}
      <div className="flex min-h-[152px] flex-col justify-center bg-gradient-to-r from-[#4400CC] to-[#00FFAE] px-4 py-6 shadow-[0_0_20px_rgba(68,0,204,0.3)] sm:px-6 md:min-h-[200px] md:px-10">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">Dashboard</h1>
        <p className="text-base md:text-lg text-white/90 mt-2">
          Acompanhe o desempenho das suas vagas e processos seletivos
        </p>
      </div>

      {/* Barra de pesquisa e filtros */}
      <div className="mt-6 px-4 sm:px-6 md:mt-8 md:px-10">
        <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)]">
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-[#4400CC]/30 focus:ring-[#4400CC]">
                  <SelectValue placeholder="Status da vaga" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="Ativa">Ativas</SelectItem>
                  <SelectItem value="Encerrada">Encerradas</SelectItem>
                  <SelectItem value="Preenchida">Preenchidas</SelectItem>
                  <SelectItem value="Rascunho">Rascunhos</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  onClick={handleFilter}
                  className="bg-[#4400CC] hover:bg-[#3300AA] text-white shadow-[0_0_10px_rgba(68,0,204,0.2)] flex-1"
                  disabled={isLoading}
                >
                  <Filter size={16} className="mr-2" /> Filtrar
                </Button>
                {hasActiveFilters && (
                  <Button
                    onClick={handleClearFilters}
                    variant="outline"
                    className="border-[#4400CC]/30 text-[#4400CC] hover:bg-[#4400CC]/5 flex-1"
                    disabled={isLoading}
                  >
                    Limpar
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleExportReport}
                  className="bg-[#00FFAE] hover:bg-[#00FFAE]/80 text-[#4400CC] shadow-[0_0_10px_rgba(0,255,174,0.2)] w-full"
                >
                  <Download size={16} className="mr-2" /> Exportar
                </Button>
              </div>
            </div>

            {/* Indicador de filtros ativos */}
            {hasActiveFilters && (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-sm text-gray-600">Filtros ativos:</span>
                {searchTerm && (
                  <Badge variant="secondary" className="bg-[#4400CC]/10 text-[#4400CC]">
                    Busca: &quot;{searchTerm}&quot;
                  </Badge>
                )}
                {statusFilter !== "todas" && (
                  <Badge variant="secondary" className="bg-[#4400CC]/10 text-[#4400CC]">
                    Status: {statusFilter}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-6 px-4 sm:px-6 md:mt-8 md:px-10">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
            <Button
              onClick={clearError}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Fechar
            </Button>
          </div>
        </div>
      )}

      {/* Métricas principais */}
      <div className="mt-6 grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 sm:px-6 md:mt-8 md:gap-6 md:px-10 lg:grid-cols-4">
        {isLoading ? (
          // Loading states
          Array.from({ length: 4 }).map((_, index) => (
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
          mainStats.map((stat, index) => (
            <Card
              key={index}
              className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)] hover:shadow-[0_0_20px_rgba(68,0,204,0.2)] transition-all"
            >
              <CardContent className="p-4 sm:p-6">
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
                    <p className="text-xs text-green-500 mt-1">
                      {stat.positive ? "+" : "-"}
                      {stat.change} {typeof stat.change === "string" && stat.change.includes("%") ? "" : "este mês"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="mt-6 grid min-w-0 grid-cols-1 gap-4 px-4 sm:px-6 md:mt-8 md:gap-6 md:px-10 lg:grid-cols-3">
        {/* Gráfico de candidaturas */}
        <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)] lg:col-span-2">
          <CardContent className="min-w-0 p-4 sm:p-6">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-medium text-gray-800">Candidaturas ao longo do tempo</h3>
              <div className="flex flex-wrap gap-2">
                <Badge
                  className={`cursor-pointer ${selectedPeriod === "7" ? "bg-[#4400CC] text-white" : "bg-white text-[#4400CC] border border-[#4400CC]/30 hover:bg-[#4400CC]/10"}`}
                  onClick={() => handlePeriodChange("7")}
                >
                  Últimos 7 dias
                </Badge>
                <Badge
                  className={`cursor-pointer ${selectedPeriod === "30" ? "bg-[#4400CC] text-white" : "bg-white text-[#4400CC] border border-[#4400CC]/30 hover:bg-[#4400CC]/10"}`}
                  onClick={() => handlePeriodChange("30")}
                >
                  Últimos 30 dias
                </Badge>
              </div>
            </div>
            {isLoading ? (
              <div className="h-[300px] w-full bg-gray-100 rounded animate-pulse flex items-center justify-center">
                <p className="text-gray-500">Carregando gráfico...</p>
              </div>
            ) : candidaturasTempo.length > 0 ? (
              <div className="h-[300px] w-full">
                <AreaChart
                  data={candidaturasTempo}
                  xField="date"
                  yField="candidaturas"
                  color="#4400CC"
                  gradientFrom="#4400CC"
                  gradientTo="#4400CC10"
                />
              </div>
            ) : (
              <div className="h-[300px] w-full bg-gray-50 rounded flex items-center justify-center">
                <p className="text-gray-500">Nenhum dado disponível</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gráfico de vagas por status */}
        <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)]">
          <CardContent className="min-w-0 p-4 sm:p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Vagas por status</h3>
            {isLoading ? (
              <div className="h-[300px] w-full bg-gray-100 rounded animate-pulse flex items-center justify-center">
                <p className="text-gray-500">Carregando...</p>
              </div>
            ) : vagasStatus.length > 0 ? (
              <div className="h-[300px] w-full">
                <BarChart
                  data={vagasStatus}
                  xField="name"
                  yField="count"
                  color="#0057FF"
                  gradientFrom="#0057FF"
                  gradientTo="#0057FF10"
                />
              </div>
            ) : (
              <div className="h-[300px] w-full bg-gray-50 rounded flex items-center justify-center">
                <p className="text-gray-500">Nenhum dado disponível</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Métricas secundárias */}
      <div className="mt-6 px-4 sm:px-6 md:mt-8 md:px-10">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Métricas detalhadas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            // Loading states for secondary stats
            Array.from({ length: 4 }).map((_, index) => (
              <Card
                key={index}
                className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)] animate-pulse"
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-lg bg-gray-200"></div>
                    <div className="ml-4 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                      <div className="h-5 bg-gray-200 rounded w-10"></div>
                      <div className="h-2 bg-gray-200 rounded w-12"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            secondaryStats.map((stat, index) => (
              <Card
                key={index}
                className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)] hover:shadow-[0_0_20px_rgba(68,0,204,0.2)] transition-all"
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shadow-[0_0_10px_rgba(68,0,204,0.1)]"
                      style={{ backgroundColor: `${stat.color}10`, borderColor: `${stat.color}20` }}
                    >
                      <stat.icon size={20} className="text-[#4400CC]" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">{stat.title}</p>
                      <p className="text-xl font-bold text-[#4400CC] mt-1">{stat.value}</p>
                      <p className="text-xs text-green-500 mt-1">
                        {stat.positive ? "+" : "-"}
                        {stat.change} {typeof stat.change === "string" && stat.change.includes("%") ? "" : "este mês"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Seção de vagas filtradas */}
      {hasActiveFilters && (
        <div className="mt-6 px-4 sm:px-6 md:mt-8 md:px-10">
          <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)]">
            <CardContent className="p-4 sm:p-6">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-medium text-gray-800">
                  Vagas filtradas ({filteredVagas.length} resultado{filteredVagas.length !== 1 ? 's' : ''})
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                  className="border-[#4400CC]/30 text-[#4400CC] hover:bg-[#4400CC]/5"
                >
                  Ver todas as vagas
                </Button>
              </div>

              {filteredVagas.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhuma vaga encontrada com os filtros aplicados</p>
                  <Button
                    onClick={handleClearFilters}
                    className="mt-4 bg-[#4400CC] hover:bg-[#3300AA] text-white"
                  >
                    Limpar filtros
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredVagas.map((vaga) => (
                    <div
                      key={vaga.id}
                      className="flex min-w-0 flex-col gap-4 rounded-lg border border-[#4400CC]/20 p-4 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <h4 className="break-words font-medium text-gray-800">{vaga.titulo}</h4>
                          <Badge
                            className={`${
                              vaga.status === 'Ativa' ? 'bg-[#00FFAE]/10 text-[#00FFAE] border-[#00FFAE]/20' :
                              vaga.status === 'Encerrada' ? 'bg-red-50 text-red-600 border-red-200' :
                              vaga.status === 'Preenchida' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                              'bg-gray-50 text-gray-600 border-gray-200'
                            }`}
                          >
                            {vaga.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{formatLocation(vaga)}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users size={14} />
                            {vaga.total_candidatos || 0} candidatos
                          </span>
                          {vaga.data_publicacao && (
                            <span>
                              Publicada há {Math.floor((Date.now() - new Date(vaga.data_publicacao).getTime()) / (1000 * 60 * 60 * 24))} dias
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex w-full items-center gap-2 sm:w-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-[#4400CC]/30 text-[#4400CC] hover:bg-[#4400CC]/5 sm:w-auto"
                          onClick={() => window.open(`/empregador/vagas/${vaga.id}`, '_blank')}
                        >
                          Ver detalhes
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
    </ProtectedRoute>
  )
}
