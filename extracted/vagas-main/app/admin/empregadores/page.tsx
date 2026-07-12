"use client"

import { useCallback, useEffect, useState } from "react"
import { Search, Filter, Download, Check, X, Eye, MoreHorizontal, ArrowUpDown, AlertCircle, Building, MapPin, Calendar, Briefcase, Mail, Phone, Users, FileText, CreditCard } from "lucide-react"
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
import { getAdminEmpregadores, toggleUserStatus } from "@/lib/api/admin-api"
import { AdminEmpregador, EmpregadoresFilters, SETORES_EMPRESA, TAMANHOS_EMPRESA } from "@/lib/admin/admin-types"
import Image from "next/image"
import Link from "next/link"
import toast from "react-hot-toast"

export default function AdminEmpregadores() {
  const [empregadores, setEmpregadores] = useState<AdminEmpregador[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalEmpregadores, setTotalEmpregadores] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [activeTab, setActiveTab] = useState("todos")
  const [searchTerm, setSearchTerm] = useState("")
  const [setorFilter, setSetorFilter] = useState<string>("")
  const [tamanhoFilter, setTamanhoFilter] = useState<string>("")
  const [selectedEmpregador, setSelectedEmpregador] = useState<AdminEmpregador | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const loadEmpregadores = useCallback(async (filters: EmpregadoresFilters = {}) => {
    try {
      setLoading(true)
      setError(null)

      const finalFilters: EmpregadoresFilters = {
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

      // Aplicar filtros
      if (setorFilter && setorFilter !== "todos") {
        finalFilters.setor = setorFilter
      }

      if (tamanhoFilter && tamanhoFilter !== "todos") {
        finalFilters.tamanho_empresa = tamanhoFilter
      }

      const result = await getAdminEmpregadores(finalFilters)

      if (result.success && result.data) {
        setEmpregadores(result.data.empregadores)
        setTotalEmpregadores(result.data.total)
        setTotalPages(result.data.totalPages)
      } else {
        setError(result.error || 'Erro ao carregar empregadores')
        toast.error('Erro ao carregar empregadores')
      }
    } catch (error) {
      console.error('Erro ao carregar empregadores:', error)
      setError('Erro inesperado ao carregar empregadores')
      toast.error('Erro inesperado ao carregar empregadores')
    } finally {
      setLoading(false)
    }
  }, [activeTab, currentPage, searchTerm, setorFilter, tamanhoFilter])

  useEffect(() => {
    loadEmpregadores()
  }, [loadEmpregadores])

  const handleSearch = () => {
    setCurrentPage(1)
    loadEmpregadores()
  }

  const handleFilterChange = () => {
    setCurrentPage(1)
    loadEmpregadores()
  }

  const handleToggleStatus = async (empregadorId: string, novoStatus: boolean) => {
    try {
      const result = await toggleUserStatus(empregadorId, novoStatus)

      if (result.success) {
        toast.success(`Empregador ${novoStatus ? 'ativado' : 'desativado'} com sucesso`)
        loadEmpregadores() // Recarregar dados
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

  const handleViewDetails = (empregador: AdminEmpregador) => {
    setSelectedEmpregador(empregador)
    setShowDetailsModal(true)
  }
  // Estatísticas calculadas
  const stats = [
    {
      title: "Total de Empregadores",
      value: totalEmpregadores.toLocaleString(),
      subtitle: "empregadores cadastrados"
    },
    {
      title: "Empregadores Ativos",
      value: empregadores.filter(e => e.ativo).length.toLocaleString(),
      subtitle: "empregadores ativos"
    },
    {
      title: "Empregadores Inativos",
      value: empregadores.filter(e => !e.ativo).length.toLocaleString(),
      subtitle: "empregadores inativos"
    },
    {
      title: "Com Vagas Ativas",
      value: empregadores.filter(e => e.vagas_ativas > 0).length.toLocaleString(),
      subtitle: "com vagas publicadas"
    },
  ]


  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="w-full pb-10">
      {/* Cabeçalho */}
      <div className="bg-gradient-to-r from-[#4400CC] to-[#00FFAE] h-[200px] flex flex-col justify-center px-6 md:px-10 shadow-[0_0_20px_rgba(68,0,204,0.3)]">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">Gerenciar Empregadores</h1>
            <p className="text-base md:text-lg text-white/90 mt-2">
              Visualize e gerencie todas as empresas da plataforma
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
              placeholder="Buscar por nome da empresa ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 bg-white border-[#4400CC]/30 focus-visible:ring-[#4400CC]"
            />
          </div>
          <div className="flex gap-2">
            <Select value={setorFilter} onValueChange={setSetorFilter}>
              <SelectTrigger className="w-48 border-[#4400CC]/30">
                <SelectValue placeholder="Filtrar por setor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os setores</SelectItem>
                {SETORES_EMPRESA.map((setor) => (
                  <SelectItem key={setor} value={setor}>
                    {setor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* <Select value={tamanhoFilter} onValueChange={setTamanhoFilter}>
              <SelectTrigger className="w-48 border-[#4400CC]/30">
                <SelectValue placeholder="Filtrar por tamanho" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tamanhos</SelectItem>
                {TAMANHOS_EMPRESA.map((tamanho) => (
                  <SelectItem key={tamanho} value={tamanho}>
                    {tamanho}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select> */}
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
                    <h3 className="text-lg font-medium text-red-600 mb-2">Erro ao carregar empregadores</h3>
                    <p className="text-red-500 mb-4">{error}</p>
                    <Button onClick={() => loadEmpregadores()} className="bg-red-600 hover:bg-red-700 text-white">
                      Tentar novamente
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-[#4400CC]/20">
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Nome da Empresa</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Email</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Setor</th>
                            {/* <th className="text-left py-3 px-4 font-medium text-gray-600">Tamanho</th> */}
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Vagas</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Candidaturas</th>
                            <th className="text-right py-3 px-4 font-medium text-gray-600">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {loading ? (
                            Array.from({ length: 5 }).map((_, index) => (
                              <tr key={index} className="border-b border-[#4400CC]/10">
                                <td className="py-3 px-4">
                                  <div className="flex items-center">
                                    <Skeleton className="w-8 h-8 rounded-lg mr-2" />
                                    <Skeleton className="h-4 w-32" />
                                  </div>
                                </td>
                                <td className="py-3 px-4"><Skeleton className="h-4 w-40" /></td>
                                <td className="py-3 px-4"><Skeleton className="h-4 w-24" /></td>
                                <td className="py-3 px-4"><Skeleton className="h-4 w-20" /></td>
                                <td className="py-3 px-4"><Skeleton className="h-6 w-16" /></td>
                                <td className="py-3 px-4"><Skeleton className="h-4 w-12" /></td>
                                <td className="py-3 px-4"><Skeleton className="h-4 w-12" /></td>
                                <td className="py-3 px-4"><Skeleton className="h-8 w-8 rounded" /></td>
                              </tr>
                            ))
                          ) : empregadores.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="py-12 text-center text-gray-500">
                                <Building className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                                <p className="text-lg font-medium mb-2">Nenhum empregador encontrado</p>
                                <p>Tente ajustar os filtros ou a busca</p>
                              </td>
                            </tr>
                          ) : (
                            empregadores.map((empregador) => (
                              <tr key={empregador.id} className="border-b border-[#4400CC]/10 hover:bg-[#4400CC]/5">
                                <td className="py-3 px-4">
                                  <div className="flex items-center">
                                    <div className="w-8 h-8 rounded-lg bg-[#4400CC]/10 flex items-center justify-center text-[#4400CC] font-medium mr-2 overflow-hidden">
                                      {empregador.logo_url ? (
                                        <Image
                                          src={empregador.logo_url}
                                          alt={empregador.nome_empresa || 'Logo'}
                                          width={32}
                                          height={32}
                                          className="object-cover w-full h-full"
                                          unoptimized
                                        />
                                      ) : (
                                        (empregador.nome_empresa?.charAt(0) || empregador.email.charAt(0)).toUpperCase()
                                      )}
                                    </div>
                                    <span className="font-medium">
                                      {empregador.nome_empresa || empregador.email.split('@')[0]}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-gray-600">{empregador.email}</td>
                                <td className="py-3 px-4 text-gray-600">{empregador.setor || '-'}</td>
                                {/* <td className="py-3 px-4 text-gray-600">{empregador.tamanho_empresa || '-'}</td> */}
                                <td className="py-3 px-4">
                                  <Badge
                                    className={`${
                                      empregador.ativo
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {empregador.ativo ? 'Ativo' : 'Inativo'}
                                  </Badge>
                                </td>
                                <td className="py-3 px-4 text-gray-600 text-center">
                                  <Badge variant="outline" className="border-[#4400CC]/30 text-[#4400CC]">
                                    {empregador.total_vagas}
                                  </Badge>
                                </td>
                                <td className="py-3 px-4 text-gray-600 text-center">
                                  <Badge variant="outline" className="border-green-500/30 text-green-600">
                                    {empregador.total_candidaturas}
                                  </Badge>
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
                                      <DropdownMenuItem onClick={() => handleViewDetails(empregador)}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        <span>Ver detalhes</span>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleToggleStatus(empregador.id, !empregador.ativo)}
                                      >
                                        {empregador.ativo ? (
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
                          Mostrando {((currentPage - 1) * 10) + 1} - {Math.min(currentPage * 10, totalEmpregadores)} de {totalEmpregadores.toLocaleString()} empregadores
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

    {/* Modal de Detalhes do Empregador */}
    <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#4400CC] flex items-center gap-2">
            <Building className="h-5 w-5" />
            Detalhes do Empregador
          </DialogTitle>
          <DialogDescription>
            Informações completas sobre a empresa e suas atividades na plataforma
          </DialogDescription>
        </DialogHeader>

        {selectedEmpregador && (
          <div className="space-y-6 mt-6">
            {/* Informações da Empresa */}
            <div className="bg-gradient-to-r from-[#4400CC]/10 to-[#00FFAE]/10 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-[#4400CC] mb-4 flex items-center gap-2">
                <Building className="h-5 w-5" />
                Informações da Empresa
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-16 rounded-lg bg-[#4400CC]/10 flex items-center justify-center overflow-hidden">
                      {selectedEmpregador.logo_url ? (
                        <Image
                          src={selectedEmpregador.logo_url}
                          alt={selectedEmpregador.nome_empresa || 'Logo'}
                          width={64}
                          height={64}
                          className="object-cover w-full h-full"
                          unoptimized
                        />
                      ) : (
                        <Building className="h-8 w-8 text-[#4400CC]" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{selectedEmpregador.nome_empresa || 'Nome não informado'}</p>
                      <p className="text-gray-600 flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {selectedEmpregador.email}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">CNPJ</label>
                      <p className="text-gray-800">{selectedEmpregador.cnpj || 'Não informado'}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">Setor de Atuação</label>
                      <p className="text-gray-800">{selectedEmpregador.setor || 'Não informado'}</p>
                    </div>

                    {/* <div>
                      <label className="text-sm font-medium text-gray-600">Tamanho da Empresa</label>
                      <p className="text-gray-800">{selectedEmpregador.tamanho_empresa || 'Não informado'}</p>
                    </div> */}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <div className="mt-1">
                      <Badge
                        className={`${
                          selectedEmpregador.ativo
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {selectedEmpregador.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Data de Cadastro</label>
                    <p className="text-gray-800 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {selectedEmpregador.data_cadastro ? formatDate(selectedEmpregador.data_cadastro) : 'Não disponível'}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Último Acesso</label>
                    <p className="text-gray-800 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {selectedEmpregador.ultimo_acesso ? formatDate(selectedEmpregador.ultimo_acesso) : 'Não disponível'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Informações de Localização */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-[#4400CC] mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Localização
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Cidade</label>
                  <p className="text-gray-800">{selectedEmpregador.cidade || 'Não informado'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Estado</label>
                  <p className="text-gray-800">{selectedEmpregador.estado || 'Não informado'}</p>
                </div>
              </div>
            </div>

            {/* Estatísticas da Empresa */}
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-[#4400CC] mb-4 flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Estatísticas de Atividade
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-2xl font-bold text-[#4400CC]">{selectedEmpregador.total_vagas}</p>
                    <p className="text-sm text-gray-600">Total de Vagas</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-2xl font-bold text-green-600">{selectedEmpregador.vagas_ativas}</p>
                    <p className="text-sm text-gray-600">Vagas Ativas</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-2xl font-bold text-blue-600">{selectedEmpregador.total_candidaturas}</p>
                    <p className="text-sm text-gray-600">Total Candidaturas</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-2xl font-bold text-orange-600">{selectedEmpregador.candidaturas_mes || 0}</p>
                    <p className="text-sm text-gray-600">Candidaturas Mês</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </DialogContent>
    </Dialog>
    </ProtectedRoute>
  )
}
