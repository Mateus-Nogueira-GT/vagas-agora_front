"use client"

import { useState, useEffect } from "react"
import { Briefcase, Users, Clock, Plus, Search, Filter, CheckCircle, XCircle, Eye, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useVagas } from "@/hooks/use-vagas"
import { vagasService } from "@/lib/vagas/vagas-service"
import { VagasFilters } from "@/lib/vagas/vagas-types"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { formatarTexto } from "@/lib/utils/format-text"

export default function ManageJobs() {
  const { 
    vagas, 
    metrics, 
    isLoading, 
    error, 
    loadVagas, 
    clearError,
    changeVagaStatus,
    totalPages,
    currentPage,
    setCurrentPage
  } = useVagas()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("todas")

  // Handle search and filter
  const handleFilter = () => {
    const filters: VagasFilters = {
      status: statusFilter as any,
      search: searchTerm || undefined
    }
    loadVagas(filters)
  }

  // Handle status change
  const handleStatusChange = async (id: string, newStatus: 'Ativa' | 'Encerrada' | 'Preenchida') => {
    await changeVagaStatus(id, newStatus)
  }

  // Reset search
  const handleClearSearch = () => {
    setSearchTerm("")
    setStatusFilter("todas")
    loadVagas()
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    const filters: VagasFilters = {
      status: statusFilter as any,
      search: searchTerm || undefined,
      page
    }
    loadVagas(filters)
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1)
    }
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    
    return pages
  }

  // Dados de exemplo para métricas (será substituído pelos dados reais)
  const metricsData = [
    {
      icon: Briefcase,
      color: "#4400CC",
      title: "Total de vagas",
      value: metrics?.total_vagas?.toString() || "0",
    },
    {
      icon: CheckCircle,
      color: "#00FFAE",
      title: "Vagas ativas",
      value: metrics?.vagas_ativas?.toString() || "0",
    },
    {
      icon: XCircle,
      color: "#FF4D4D",
      title: "Vagas encerradas",
      value: metrics?.vagas_encerradas?.toString() || "0",
    },
    {
      icon: Users,
      color: "#0057FF",
      title: "Maior número de candidaturas",
      value: metrics?.maior_numero_candidatos?.toString() || "0",
    },
  ]

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Rascunho': return '#6B7280'
      case 'Ativa': return '#00FFAE'
      case 'Encerrada': return '#FF4D4D'
      case 'Preenchida': return '#0057FF'
      default: return '#4400CC'
    }
  }

  const formatLocation = (vaga: any) => {
    const parts = []
    if (vaga.cidade && vaga.estado) {
      parts.push(`${vaga.cidade}, ${vaga.estado}`)
    } else if (vaga.localizacao) {
      parts.push(vaga.localizacao)
    }

    if (vaga.modelo_trabalho) {
      parts.push(formatarTexto(vaga.modelo_trabalho))
    } else if (vaga.remoto) {
      parts.push('Remoto')
    }

    return parts.join(' • ')
  }

  return (
    <ProtectedRoute allowedRoles={['empregador']}>
      <div className="w-full pb-10">
      {/* Banner com gradiente roxo-azul neon */}
      <div className="flex min-h-[152px] flex-col justify-center bg-gradient-to-r from-[#4400CC] to-[#00FFAE] px-4 py-6 shadow-[0_0_20px_rgba(68,0,204,0.3)] sm:px-6 md:min-h-[200px] md:px-10">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">Gerenciar Vagas</h1>
        <p className="text-base md:text-lg text-white/90 mt-2">Visualize e administre todas as suas vagas</p>
      </div>

      {/* Métricas */}
      <div className="mt-6 grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 sm:px-6 md:mt-8 md:gap-6 md:px-10 lg:grid-cols-4">
        {metricsData.map((metric, index) => (
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
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Barra de pesquisa e filtros */}
      <div className="mt-6 px-4 sm:px-6 md:mt-8 md:px-10">
        <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)]">
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Buscar por título ou localização"
                  className="pl-10 border-[#4400CC]/30 focus-visible:ring-[#4400CC]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-[#4400CC]/30 focus:ring-[#4400CC]">
                  <SelectValue placeholder="Status da vaga" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="Rascunho">Rascunhos</SelectItem>
                  <SelectItem value="Ativa">Ativas</SelectItem>
                  <SelectItem value="Encerrada">Encerradas</SelectItem>
                  <SelectItem value="Preenchida">Preenchidas</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button 
                  className="bg-[#4400CC] hover:bg-[#3300AA] text-white shadow-[0_0_10px_rgba(68,0,204,0.2)] flex-1"
                  onClick={handleFilter}
                  disabled={isLoading}
                >
                  <Filter size={16} className="mr-2" /> Filtrar
                </Button>
                <Link href="/empregador/criar-vaga" className="w-full sm:w-auto">
                  <Button className="w-full bg-[#00FFAE] text-[#4400CC] shadow-[0_0_10px_rgba(0,255,174,0.2)] hover:bg-[#00FFAE]/80 sm:w-auto">
                    <Plus size={16} className="mr-2" /> Nova vaga
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de vagas */}
      <div className="mt-6 px-4 sm:px-6 md:mt-8 md:px-10">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
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
        )}
        
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Carregando vagas...</p>
          </div>
        ) : vagas.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Nenhuma vaga encontrada</p>
            <Link href="/empregador/criar-vaga">
              <Button className="mt-4 bg-[#00FFAE] hover:bg-[#00FFAE]/80 text-[#4400CC]">
                <Plus size={16} className="mr-2" /> Criar primeira vaga
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {vagas.map((vaga) => (
              <Card
                key={vaga.id}
                className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)] hover:shadow-[0_0_20px_rgba(68,0,204,0.2)] transition-all"
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="break-words font-medium text-gray-800">{vaga.titulo}</h3>
                        <Badge className="text-white" style={{ backgroundColor: getStatusColor(vaga.status) }}>
                          {vaga.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{formatLocation(vaga)}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Users size={14} className="mr-1" />
                          <span>{vaga.total_candidatos || 0} candidatos</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock size={14} className="mr-1" />
                          <span>Criada em {vagasService.formatTimeAgo(vaga.data_publicacao || '')}</span>
                        </div>
                        {vaga.data_expiracao && vagasService.getDaysLeft(vaga.data_expiracao) > 0 && (
                          <div className="flex items-center text-sm text-[#4400CC]">
                            <span>{vagasService.getDaysLeft(vaga.data_expiracao)} dias restantes</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:flex-wrap">
                      <Link href={`/empregador/vagas/${vaga.id}`} className="w-full sm:w-auto">
                        <Button variant="outline" size="sm" className="w-full border-[#4400CC]/30 text-[#4400CC] hover:bg-[#4400CC]/5 sm:w-auto">
                          <Eye size={14} className="mr-1" /> Detalhes
                        </Button>
                      </Link>
                      {vaga.status === "Ativa" && (
                        <Link href={`/empregador/vagas/${vaga.id}#candidatos`} className="w-full sm:w-auto">
                          <Button size="sm" className="w-full bg-[#00FFAE] text-[#4400CC] shadow-[0_0_10px_rgba(0,255,174,0.2)] hover:bg-[#00FFAE]/80 sm:w-auto">
                            <Users size={14} className="mr-1" /> Candidatos ({vaga.total_candidatos || 0})
                          </Button>
                        </Link>
                      )}
                      <Link href={`/empregador/editar-vaga/${vaga.id}`} className="w-full sm:w-auto">
                        <Button variant="outline" size="sm" className="w-full border-[#4400CC]/30 text-[#4400CC] hover:bg-[#4400CC]/5 sm:w-auto">
                          <Edit size={14} className="mr-1" /> Editar
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Paginação - só mostra se há mais de uma página */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center overflow-x-auto px-4 sm:px-6 md:px-10">
          <div className="flex min-w-max items-center space-x-2 pb-2">
            {/* Botão anterior */}
            <Button
              variant="outline"
              size="icon"
              className="border-[#4400CC]/30 text-gray-700 hover:bg-[#4400CC]/5 hover:text-[#4400CC] h-8 w-8 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handlePreviousPage}
              disabled={currentPage === 1 || isLoading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </Button>

            {/* Números das páginas */}
            {getPageNumbers().map((pageNum) => (
              <Button
                key={pageNum}
                variant="outline"
                size="sm"
                className={`h-8 min-w-[32px] px-3 border-[#4400CC]/30 ${
                  pageNum === currentPage
                    ? 'bg-[#4400CC] text-white hover:bg-[#3300AA]'
                    : 'text-gray-700 hover:bg-[#4400CC]/5 hover:text-[#4400CC]'
                }`}
                onClick={() => handlePageChange(pageNum)}
                disabled={isLoading}
              >
                {pageNum}
              </Button>
            ))}

            {/* Botão próxima */}
            <Button
              variant="outline"
              size="icon"
              className="border-[#4400CC]/30 text-gray-700 hover:bg-[#4400CC]/5 hover:text-[#4400CC] h-8 w-8 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleNextPage}
              disabled={currentPage === totalPages || isLoading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Button>
          </div>

          {/* Informação da paginação */}
          <div className="ml-4 text-sm text-gray-600 flex items-center">
            Página {currentPage} de {totalPages}
          </div>
        </div>
      )}
      </div>
    </ProtectedRoute>
  )
}
