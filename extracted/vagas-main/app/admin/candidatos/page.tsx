"use client"

import { useCallback, useEffect, useState } from "react"
import { Search, Filter, Download, Check, X, Eye, MoreHorizontal, ArrowUpDown, AlertCircle, User, MapPin, Calendar, Briefcase, Mail, Phone, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getAdminCandidatos, toggleUserStatus } from "@/lib/api/admin-api"
import { AdminCandidato, CandidatosFilters, NIVEIS_SENIORIDADE } from "@/lib/admin/admin-types"
import { formatarTexto } from "@/lib/utils/format-text"
import Image from "next/image"
import Link from "next/link"
import toast from "react-hot-toast"

export default function AdminCandidatos() {
  const [candidatos, setCandidatos] = useState<AdminCandidato[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCandidatos, setTotalCandidatos] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [activeTab, setActiveTab] = useState("todos")
  const [searchTerm, setSearchTerm] = useState("")
  const [levelFilter, setLevelFilter] = useState<string>("todos")
  const [selectedCandidato, setSelectedCandidato] = useState<AdminCandidato | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const loadCandidatos = useCallback(async (filters: CandidatosFilters = {}) => {
    try {
      setLoading(true)
      setError(null)

      const finalFilters: CandidatosFilters = {
        ...filters,
        page: currentPage,
        limit: 10,
      }

      // Aplicar filtros baseados na tab ativa
      if (activeTab === "ativos") {
        finalFilters.ativo = true
      } else if (activeTab === "inativos") {
        finalFilters.ativo = false
      }

      // Aplicar busca
      if (searchTerm.trim()) {
        finalFilters.search = searchTerm.trim()
      }

      // Aplicar filtro de nível
      if (levelFilter && levelFilter !== "todos") {
        finalFilters.nivel_senioridade = levelFilter
      }

      const result = await getAdminCandidatos(finalFilters)

      if (result.success && result.data) {
        setCandidatos(result.data.candidatos)
        setTotalCandidatos(result.data.total)
        setTotalPages(result.data.totalPages)
      } else {
        setError(result.error || 'Erro ao carregar candidatos')
        toast.error('Erro ao carregar candidatos')
      }
    } catch (error) {
      console.error('Erro ao carregar candidatos:', error)
      setError('Erro inesperado ao carregar candidatos')
      toast.error('Erro inesperado ao carregar candidatos')
    } finally {
      setLoading(false)
    }
  }, [activeTab, currentPage, levelFilter, searchTerm])

  useEffect(() => {
    loadCandidatos()
  }, [loadCandidatos])

  const handleSearch = () => {
    setCurrentPage(1)
    loadCandidatos()
  }

  const handleFilterChange = () => {
    setCurrentPage(1)
    loadCandidatos()
  }

  const handleViewDetails = (candidato: AdminCandidato) => {
    setSelectedCandidato(candidato)
    setShowDetailsModal(true)
  }

  const handleToggleStatus = async (candidatoId: string, novoStatus: boolean) => {
    try {
      const result = await toggleUserStatus(candidatoId, novoStatus)

      if (result.success) {
        toast.success(`Candidato ${novoStatus ? 'ativado' : 'desativado'} com sucesso`)
        loadCandidatos() // Recarregar dados
      } else {
        toast.error(result.error || 'Erro ao alterar status')
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      toast.error('Erro inesperado ao alterar status')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatLastAccess = (dateString?: string) => {
    if (!dateString) return "Nunca acessou"

    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)
    const diffDays = diffMs / (1000 * 60 * 60 * 24)

    if (diffHours < 1) return "Agora mesmo"
    if (diffHours < 24) return `Há ${Math.floor(diffHours)} hora${Math.floor(diffHours) > 1 ? 's' : ''}`
    if (diffDays < 7) return `Há ${Math.floor(diffDays)} dia${Math.floor(diffDays) > 1 ? 's' : ''}`
    return formatDate(dateString)
  }

  // Estatísticas calculadas
  const stats = [
    {
      title: "Total de Candidatos",
      value: totalCandidatos.toLocaleString(),
      subtitle: "candidatos cadastrados"
    },
    {
      title: "Candidatos Ativos",
      value: candidatos.filter(c => c.ativo).length.toLocaleString(),
      subtitle: "candidatos ativos"
    },
    {
      title: "Candidatos Inativos",
      value: candidatos.filter(c => !c.ativo).length.toLocaleString(),
      subtitle: "candidatos inativos"
    },
    {
      title: "Com Candidaturas",
      value: candidatos.filter(c => c.total_candidaturas > 0).length.toLocaleString(),
      subtitle: "já se candidataram"
    },
  ]

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="w-full pb-10">
        {/* Cabeçalho */}
        <div className="bg-gradient-to-r from-[#4400CC] to-[#00FFAE] h-[200px] flex flex-col justify-center px-6 md:px-10 shadow-[0_0_20px_rgba(68,0,204,0.3)]">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">Gerenciar Candidatos</h1>
              <p className="text-base md:text-lg text-white/90 mt-2">
                Visualize e gerencie todos os candidatos da plataforma
              </p>
            </div>
          </div>
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

        {/* Estatísticas */}
        <div className="px-6 md:px-10 mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)]">
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-8 w-16 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </CardContent>
              </Card>
            ))
          ) : (
            stats.map((stat, index) => (
              <Card
                key={index}
                className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)] hover:shadow-[0_0_20px_rgba(68,0,204,0.2)] transition-all"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col">
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-[#4400CC] mt-1">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Barra de pesquisa e filtros */}
        <div className="px-6 md:px-10 mt-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 bg-white border-[#4400CC]/30 focus-visible:ring-[#4400CC]"
              />
            </div>
            <div className="flex gap-2">
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-48 border-[#4400CC]/30">
                  <SelectValue placeholder="Filtrar por nível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os níveis</SelectItem>
                  {NIVEIS_SENIORIDADE.map((nivel) => (
                    <SelectItem key={nivel} value={nivel}>
                      {nivel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleFilterChange}
                variant="outline"
                className="border-[#4400CC]/30 text-[#4400CC] hover:bg-[#4400CC]/5"
              >
                <Filter className="mr-2 h-4 w-4" />
                Aplicar
              </Button>
              <Button
                onClick={handleSearch}
                className="bg-[#4400CC] hover:bg-[#3300AA] text-white"
              >
                Buscar
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs e Tabela */}
        <div className="px-6 md:px-10 mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full md:w-auto grid-cols-3 h-auto p-1 bg-[#4400CC]/10">
              <TabsTrigger value="todos" className="py-2 data-[state=active]:bg-[#4400CC] data-[state=active]:text-white">
                Todos
              </TabsTrigger>
              <TabsTrigger value="ativos" className="py-2 data-[state=active]:bg-[#4400CC] data-[state=active]:text-white">
                Ativos
              </TabsTrigger>
              <TabsTrigger value="inativos" className="py-2 data-[state=active]:bg-[#4400CC] data-[state=active]:text-white">
                Inativos
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)]">
                <CardContent className="p-6">
                  {error ? (
                    <div className="text-center py-8">
                      <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                      <h3 className="text-lg font-medium text-red-600 mb-2">Erro ao carregar candidatos</h3>
                      <p className="text-red-500 mb-4">{error}</p>
                      <Button onClick={() => loadCandidatos()} className="bg-red-600 hover:bg-red-700 text-white">
                        Tentar novamente
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-[#4400CC]/20">
                              <th className="text-left py-3 px-4 font-medium text-gray-600">Nome</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-600">Email</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-600">Título</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-600">Nível</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-600">Candidaturas</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-600">Último Acesso</th>
                              <th className="text-right py-3 px-4 font-medium text-gray-600">Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {loading ? (
                              Array.from({ length: 5 }).map((_, index) => (
                                <tr key={index} className="border-b border-[#4400CC]/10">
                                  <td className="py-3 px-4">
                                    <div className="flex items-center">
                                      <Skeleton className="w-8 h-8 rounded-full mr-2" />
                                      <Skeleton className="h-4 w-32" />
                                    </div>
                                  </td>
                                  <td className="py-3 px-4"><Skeleton className="h-4 w-40" /></td>
                                  <td className="py-3 px-4"><Skeleton className="h-4 w-28" /></td>
                                  <td className="py-3 px-4"><Skeleton className="h-4 w-20" /></td>
                                  <td className="py-3 px-4"><Skeleton className="h-6 w-16" /></td>
                                  <td className="py-3 px-4"><Skeleton className="h-4 w-12" /></td>
                                  <td className="py-3 px-4"><Skeleton className="h-4 w-24" /></td>
                                  <td className="py-3 px-4"><Skeleton className="h-8 w-8 rounded" /></td>
                                </tr>
                              ))
                            ) : candidatos.length === 0 ? (
                              <tr>
                                <td colSpan={8} className="py-12 text-center text-gray-500">
                                  <User className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                                  <p className="text-lg font-medium mb-2">Nenhum candidato encontrado</p>
                                  <p>Tente ajustar os filtros ou a busca</p>
                                </td>
                              </tr>
                            ) : (
                              candidatos.map((candidato) => (
                                <tr key={candidato.id} className="border-b border-[#4400CC]/10 hover:bg-[#4400CC]/5">
                                  <td className="py-3 px-4">
                                    <div className="flex items-center">
                                      <div className="w-8 h-8 rounded-full bg-[#4400CC]/10 flex items-center justify-center text-[#4400CC] font-medium mr-2 overflow-hidden">
                                        {candidato.foto_url ? (
                                          <Image
                                            src={candidato.foto_url}
                                            alt={candidato.nome_completo || 'Foto'}
                                            width={32}
                                            height={32}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          (candidato.nome_completo?.charAt(0) || candidato.email.charAt(0)).toUpperCase()
                                        )}
                                      </div>
                                      <span className="font-medium">
                                        {candidato.nome_completo || candidato.email.split('@')[0]}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 text-gray-600">{candidato.email}</td>
                                  <td className="py-3 px-4 text-gray-600">
                                    {candidato.titulo_profissional || '-'}
                                  </td>
                                  <td className="py-3 px-4 text-gray-600">
                                    {candidato.nivel_senioridade ? formatarTexto(candidato.nivel_senioridade) : '-'}
                                  </td>
                                  <td className="py-3 px-4">
                                    <Badge
                                      className={`${
                                        candidato.ativo
                                          ? "bg-green-100 text-green-800"
                                          : "bg-red-100 text-red-800"
                                      }`}
                                    >
                                      {candidato.ativo ? 'Ativo' : 'Inativo'}
                                    </Badge>
                                  </td>
                                  <td className="py-3 px-4 text-gray-600 text-center">
                                    <Badge variant="outline" className="border-[#4400CC]/30 text-[#4400CC]">
                                      {candidato.total_candidaturas}
                                    </Badge>
                                  </td>
                                  <td className="py-3 px-4 text-gray-600 text-sm">
                                    {formatLastAccess(candidato.ultimo_acesso)}
                                  </td>
                                  <td className="py-3 px-4 text-right">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => handleViewDetails(candidato)}>
                                          <Eye className="mr-2 h-4 w-4" />
                                          <span>Ver detalhes</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => handleToggleStatus(candidato.id, !candidato.ativo)}
                                        >
                                          {candidato.ativo ? (
                                            <>
                                              <X className="mr-2 h-4 w-4" />
                                              <span>Desativar</span>
                                            </>
                                          ) : (
                                            <>
                                              <Check className="mr-2 h-4 w-4" />
                                              <span>Ativar</span>
                                            </>
                                          )}
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Paginação */}
                      {totalPages > 1 && (
                        <div className="flex flex-col items-center gap-4 mt-6">
                          <div className="flex items-center justify-center gap-2 flex-wrap">
                            {/* Primeira página */}
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-[#4400CC]/30 text-[#4400CC] hover:bg-[#4400CC]/5"
                              disabled={currentPage <= 1}
                              onClick={() => setCurrentPage(1)}
                            >
                              Primeira
                            </Button>

                            {/* -10 páginas */}
                            {totalPages > 20 && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-[#4400CC]/30 text-[#4400CC] hover:bg-[#4400CC]/5"
                                disabled={currentPage <= 10}
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 10))}
                              >
                                -10
                              </Button>
                            )}

                            {/* Anterior */}
                            <Button
                              variant="outline"
                              className="border-[#4400CC]/30 text-[#4400CC] hover:bg-[#4400CC]/5"
                              disabled={currentPage <= 1}
                              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            >
                              Anterior
                            </Button>

                            {/* Input de página */}
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">Página</span>
                              <Input
                                type="number"
                                min="1"
                                max={totalPages}
                                value={currentPage}
                                onChange={(e) => {
                                  const page = parseInt(e.target.value)
                                  if (page >= 1 && page <= totalPages) {
                                    setCurrentPage(page)
                                  }
                                }}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    const page = parseInt(e.currentTarget.value)
                                    if (page >= 1 && page <= totalPages) {
                                      setCurrentPage(page)
                                    }
                                  }
                                }}
                                className="w-20 h-9 text-center border-[#4400CC]/30 focus-visible:ring-[#4400CC]"
                              />
                              <span className="text-sm text-gray-600">de {totalPages.toLocaleString()}</span>
                            </div>

                            {/* Próximo */}
                            <Button
                              variant="outline"
                              className="border-[#4400CC]/30 text-[#4400CC] hover:bg-[#4400CC]/5"
                              disabled={currentPage >= totalPages}
                              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            >
                              Próximo
                            </Button>

                            {/* +10 páginas */}
                            {totalPages > 20 && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-[#4400CC]/30 text-[#4400CC] hover:bg-[#4400CC]/5"
                                disabled={currentPage >= totalPages - 10}
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 10))}
                              >
                                +10
                              </Button>
                            )}

                            {/* Última página */}
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-[#4400CC]/30 text-[#4400CC] hover:bg-[#4400CC]/5"
                              disabled={currentPage >= totalPages}
                              onClick={() => setCurrentPage(totalPages)}
                            >
                              Última
                            </Button>
                          </div>

                          {/* Info de registros */}
                          <div className="text-sm text-gray-600">
                            Mostrando {((currentPage - 1) * 10) + 1} - {Math.min(currentPage * 10, totalCandidatos)} de {totalCandidatos.toLocaleString()} candidatos
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Modal de Detalhes do Candidato */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="w-12 h-12 rounded-full bg-[#4400CC]/10 flex items-center justify-center overflow-hidden">
                {selectedCandidato?.foto_url ? (
                  <Image
                    src={selectedCandidato.foto_url}
                    alt={selectedCandidato.nome_completo || 'Foto'}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-[#4400CC]" />
                )}
              </div>
              {selectedCandidato?.nome_completo || selectedCandidato?.email.split('@')[0]}
            </DialogTitle>
            <DialogDescription>
              Informações detalhadas do candidato
            </DialogDescription>
          </DialogHeader>

          {selectedCandidato && (
            <div className="space-y-6 mt-6">
              {/* Informações Básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-[#4400CC]/20">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <User className="w-4 h-4 mr-2 text-[#4400CC]" />
                      Informações Pessoais
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-gray-600">Email:</span>
                        <span className="ml-2 font-medium">{selectedCandidato.email}</span>
                      </div>
                      {selectedCandidato.cidade && (
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="text-gray-600">Localização:</span>
                          <span className="ml-2 font-medium">
                            {selectedCandidato.cidade}{selectedCandidato.estado && `, ${selectedCandidato.estado}`}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-gray-600">Cadastro:</span>
                        <span className="ml-2 font-medium">
                          {new Date(selectedCandidato.data_cadastro).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      {selectedCandidato.ultimo_acesso && (
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                          <span className="text-gray-600">Último acesso:</span>
                          <span className="ml-2 font-medium">
                            {formatLastAccess(selectedCandidato.ultimo_acesso)}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-[#4400CC]/20">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <Briefcase className="w-4 h-4 mr-2 text-[#4400CC]" />
                      Informações Profissionais
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Título:</span>
                        <span className="ml-2 font-medium">
                          {selectedCandidato.titulo_profissional || 'Não informado'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Nível:</span>
                        <span className="ml-2 font-medium">
                          {formatarTexto(selectedCandidato.nivel_senioridade)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Status:</span>
                        <Badge
                          className={`ml-2 ${
                            selectedCandidato.ativo
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {selectedCandidato.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Estatísticas */}
              <Card className="border-[#4400CC]/20">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <Briefcase className="w-4 h-4 mr-2 text-[#4400CC]" />
                    Estatísticas de Candidaturas
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-[#4400CC]/5 rounded-lg">
                      <div className="text-2xl font-bold text-[#4400CC]">
                        {selectedCandidato.total_candidaturas}
                      </div>
                      <div className="text-sm text-gray-600">Total de Candidaturas</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedCandidato.ativo ? 1 : 0}
                      </div>
                      <div className="text-sm text-gray-600">Perfil Ativo</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {new Date(selectedCandidato.data_cadastro).getFullYear()}
                      </div>
                      <div className="text-sm text-gray-600">Ano de Cadastro</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  )
}
