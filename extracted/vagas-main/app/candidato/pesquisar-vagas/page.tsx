"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, MapPin, Filter, Briefcase, DollarSign, Building, Users, Calendar, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { ProtectedRoute } from "@/components/auth/protected-route"

import { VagaCard } from "@/components/VagaCard"
import { vagasApiService } from "@/lib/api/vagas-api"
import { Vaga, PublicVagasFilters } from "@/lib/vagas/vagas-types"
import { useAuth } from "@/hooks/use-auth"
import { ESTADOS_BRASIL, CIDADES_PRINCIPAIS, filterCidades } from "@/lib/data/brazil-locations"

import toast from "react-hot-toast"

export default function SearchJobs() {
  const { user } = useAuth()

  
  const [vagas, setVagas] = useState<Vaga[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalVagas, setTotalVagas] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [showMoreFilters, setShowMoreFilters] = useState(false)
  const router = useRouter()


  
  // Estados dos filtros
  const [filters, setFilters] = useState<PublicVagasFilters>({
    limit: 9,
    offset: 0
  })
  const [searchInput, setSearchInput] = useState('')
  const [locationInput, setLocationInput] = useState('')
  const [sortBy, setSortBy] = useState('recentes')
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [quickFilters, setQuickFilters] = useState({
    remoto: false,
    clt: false,
    publicadas_hoje: false,
    junior: false,
    pleno: false,
    senior: false
  })

  // Estados para filtros do painel lateral
  const [sidebarFilters, setSidebarFilters] = useState({
    setor: 'todos',
    cargo: '',
    localizacao_sidebar: '',
    palavras_chave: '',
    estado: '',
    cidade: '',
    modelo_trabalho: {
      presencial: false,
      hibrido: false,
      remoto: false
    },
    tipo_contratacao: {
      clt: false,
      pj: false,
      estagio: false,
      temporario: false
    },
    nivel_experiencia: {
      estagio: false,
      assistente: false,
      operacional: false,
      analista: false,
      coordenacao: false,
      gerencia: false,
      diretoria: false,
      especialista: false
    },
    data_publicacao: {
      ultimas_24h: false,
      ultimos_7dias: false,
      ultimos_30dias: false
    },
    beneficios: {
      vale_transporte: false,
      vale_refeicao: false,
      plano_saude: false,
      horario_flexivel: false
    }
  })

  // Estados para autocomplete de cidades
  const [cidadeBusca, setCidadeBusca] = useState("")
  const [cidadesSugestoes, setCidadesSugestoes] = useState<string[]>([])
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false)

  // Função para ordenar vagas
  const sortVagas = useCallback((vagasToSort: Vaga[], sortType: string) => {
    const sorted = [...vagasToSort]
    
    switch (sortType) {
      case 'recentes':
        return sorted.sort((a, b) => {
          const dateA = new Date(a.data_publicacao || '').getTime()
          const dateB = new Date(b.data_publicacao || '').getTime()
          return dateB - dateA // Mais recentes primeiro
        })
      case 'salario-desc':
        return sorted.sort((a, b) => {
          const salarioA = Math.max(a.salario_de || 0, a.salario_ate || 0)
          const salarioB = Math.max(b.salario_de || 0, b.salario_ate || 0)
          return salarioB - salarioA // Maior salário primeiro
        })
      case 'salario-asc':
        return sorted.sort((a, b) => {
          const salarioA = Math.min(a.salario_de || Infinity, a.salario_ate || Infinity)
          const salarioB = Math.min(b.salario_de || Infinity, b.salario_ate || Infinity)
          return salarioA - salarioB // Menor salário primeiro
        })
      case 'relevancia':
      default:
        return sorted // Mantém ordem da API por ora
    }
  }, [])

  // Função para buscar vagas
  const searchVagas = useCallback(async (newFilters?: PublicVagasFilters) => {
    setLoading(true)
    setError(null)
    try {
      const filterToUse = newFilters || filters
      const response = await vagasApiService.searchVagasPublicas(filterToUse)
      const sortedVagas = sortVagas(response.vagas, sortBy)
      setVagas(sortedVagas)
      setTotalVagas(response.total)
      setTotalPages(response.totalPages)
      setCurrentPage(response.page)
    } catch (error) {
      console.error('Erro ao buscar vagas:', error)
      setError('Erro ao buscar vagas. Tente novamente.')
      toast.error('Erro ao buscar vagas. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }, [filters, sortBy, sortVagas])

  // Alias para loadVagas
  const loadVagas = () => searchVagas()



  // Carregar vagas iniciais
  useEffect(() => {
    searchVagas()
  }, [searchVagas])

  // Sincronizar cidadeBusca com sidebarFilters.cidade
  useEffect(() => {
    if (sidebarFilters.cidade) {
      setCidadeBusca(sidebarFilters.cidade)
    }
  }, [sidebarFilters.cidade])

  // Atualizar sugestões quando estado ou busca mudar
  useEffect(() => {
    if (sidebarFilters.estado && cidadeBusca) {
      const sugestoes = filterCidades(sidebarFilters.estado, cidadeBusca, 15)
      setCidadesSugestoes(sugestoes)
    } else if (sidebarFilters.estado) {
      // Mostrar primeiras cidades se não houver busca
      setCidadesSugestoes(CIDADES_PRINCIPAIS[sidebarFilters.estado]?.slice(0, 15) || [])
    } else {
      setCidadesSugestoes([])
    }
  }, [sidebarFilters.estado, cidadeBusca])

  // Função para aplicar filtros
  const handleSearch = () => {
    const newFilters: PublicVagasFilters = {
      ...filters,
      busca: searchInput || undefined,
      localizacao: locationInput || undefined,
      offset: 0
    }
    setFilters(newFilters)
    setCurrentPage(1)
    searchVagas(newFilters)
  }

  // Função para limpar filtros
  const clearFilters = () => {
    setSearchInput('')
    setLocationInput('')
    const newFilters: PublicVagasFilters = {
      limit: 24,
      offset: 0
    }
    setFilters(newFilters)
    searchVagas(newFilters)
  }

  // Função para formatar salário
  const formatSalary = (vaga: Vaga) => {
    if (vaga.salario_de && vaga.salario_ate) {
      return `R$ ${vaga.salario_de.toLocaleString()} - R$ ${vaga.salario_ate.toLocaleString()}`
    } else if (vaga.salario_de) {
      return `A partir de R$ ${vaga.salario_de.toLocaleString()}`
    }
    return 'Salário a combinar'
  }

  // Função para formatar data
  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return 'Data não informada'
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Há 1 dia'
    if (diffDays < 7) return `Há ${diffDays} dias`
    if (diffDays < 30) return `Há ${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) > 1 ? 's' : ''}`
    return `Há ${Math.floor(diffDays / 30)} mês${Math.floor(diffDays / 30) > 1 ? 'es' : ''}`
  }



  // Função para lidar com mudança de ordenação
  const handleSortChange = (newSort: string) => {
    setSortBy(newSort)
    const sortedVagas = sortVagas(vagas, newSort)
    setVagas(sortedVagas)
  }

  // Função para aplicar filtros rápidos
  const applyQuickFilters = (filtersToApply: typeof quickFilters) => {
    const newFilters: PublicVagasFilters = {
      ...filters,
      busca: searchInput || undefined,
      localizacao: locationInput || undefined,
      offset: 0
    }

    // Aplicar filtros de modalidade
    if (filtersToApply.remoto) {
      newFilters.modelo_trabalho = 'Remoto'
    }

    // Aplicar filtros de contratação
    if (filtersToApply.clt) {
      newFilters.tipo_contratacao = 'CLT'
    }

    // Aplicar filtros de nível
    if (filtersToApply.junior) {
      newFilters.nivel = 'assistente'
    } else if (filtersToApply.pleno) {
      newFilters.nivel = 'analista'
    } else if (filtersToApply.senior) {
      newFilters.nivel = 'especialista'
    }

    // Para "Publicadas hoje" - filtrar por data
    if (filtersToApply.publicadas_hoje) {
      // Implementar filtro de dados das últimas 24h se necessário
    }

    setFilters(newFilters)
    setCurrentPage(1)
    searchVagas(newFilters)
  }

  // Função para toggle de filtro rápido
  const toggleQuickFilter = (filterKey: keyof typeof quickFilters, filterLabel: string) => {
    const newQuickFilters = {
      ...quickFilters,
      [filterKey]: !quickFilters[filterKey]
    }

    // Se for um filtro de nível, desativar os outros níveis
    if (['junior', 'pleno', 'senior'].includes(filterKey)) {
      newQuickFilters.junior = filterKey === 'junior' ? !quickFilters[filterKey] : false
      newQuickFilters.pleno = filterKey === 'pleno' ? !quickFilters[filterKey] : false
      newQuickFilters.senior = filterKey === 'senior' ? !quickFilters[filterKey] : false
    }

    setQuickFilters(newQuickFilters)

    // Atualizar lista de filtros ativos
    const newActiveFilters = [...activeFilters]
    const filterIndex = newActiveFilters.indexOf(filterLabel)
    
    if (newQuickFilters[filterKey] && filterIndex === -1) {
      newActiveFilters.push(filterLabel)
    } else if (!newQuickFilters[filterKey] && filterIndex > -1) {
      newActiveFilters.splice(filterIndex, 1)
    }

    // Remover outros níveis se aplicável
    if (['junior', 'pleno', 'senior'].includes(filterKey) && newQuickFilters[filterKey]) {
      const levelsToRemove = ['Júnior', 'Pleno', 'Sênior'].filter(level => level !== filterLabel)
      levelsToRemove.forEach(level => {
        const index = newActiveFilters.indexOf(level)
        if (index > -1) newActiveFilters.splice(index, 1)
      })
    }

    setActiveFilters(newActiveFilters)
    applyQuickFilters(newQuickFilters)
  }

  // Função para remover filtro ativo
  const removeActiveFilter = (filterLabel: string) => {
    const newActiveFilters = activeFilters.filter(f => f !== filterLabel)
    setActiveFilters(newActiveFilters)

    // Atualizar quickFilters baseado no filtro removido
    const newQuickFilters = { ...quickFilters }
    switch (filterLabel) {
      case 'Remoto':
        newQuickFilters.remoto = false
        break
      case 'CLT':
        newQuickFilters.clt = false
        break
      case 'Publicadas hoje':
        newQuickFilters.publicadas_hoje = false
        break
      case 'Júnior':
        newQuickFilters.junior = false
        break
      case 'Pleno':
        newQuickFilters.pleno = false
        break
      case 'Sênior':
        newQuickFilters.senior = false
        break
    }

    setQuickFilters(newQuickFilters)
    setCurrentPage(1)
    applyQuickFilters(newQuickFilters)
  }

  // Função para limpar todos os filtros
  const clearAllFilters = () => {
    setActiveFilters([])
    setQuickFilters({
      remoto: false,
      clt: false,
      publicadas_hoje: false,
      junior: false,
      pleno: false,
      senior: false
    })
    const clearedFilters: PublicVagasFilters = {
      limit: 9,
      offset: 0
    }
    setFilters(clearedFilters)
    setCurrentPage(1)
    searchVagas(clearedFilters)
  }

  // Funções de paginação
  const handlePageChange = (page: number) => {
    const newFilters: PublicVagasFilters = {
      ...filters,
      offset: (page - 1) * (filters.limit || 9)
    }
    setFilters(newFilters)
    setCurrentPage(page)
    searchVagas(newFilters)
    // Scroll para o topo quando mudar de página
    window.scrollTo({ top: 0, behavior: 'smooth' })
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

  // Funções para filtros do painel lateral
  const applySidebarFilters = () => {
    // Começar com filtros limpos, mantendo apenas limit
    const newFilters: PublicVagasFilters = {
      limit: 9,
      offset: 0,
      busca: searchInput || sidebarFilters.palavras_chave || sidebarFilters.cargo || undefined,
      localizacao: locationInput || sidebarFilters.localizacao_sidebar || undefined,
      estado: sidebarFilters.estado || undefined,
      cidade: sidebarFilters.cidade || undefined,
    }

    // Aplicar filtro de setor (ignorar se for "todos")
    if (sidebarFilters.setor && sidebarFilters.setor !== 'todos') {
      // Por enquanto não temos campo de setor na API, mas podemos buscar na descrição
      if (newFilters.busca) {
        newFilters.busca += ` ${sidebarFilters.setor}`
      } else {
        newFilters.busca = sidebarFilters.setor
      }
    }

    // Aplicar filtros de modelo de trabalho
    if (sidebarFilters.modelo_trabalho.remoto) {
      newFilters.modelo_trabalho = 'Remoto'
    } else if (sidebarFilters.modelo_trabalho.hibrido) {
      newFilters.modelo_trabalho = 'Híbrido'
    } else if (sidebarFilters.modelo_trabalho.presencial) {
      newFilters.modelo_trabalho = 'Presencial'
    }

    // Aplicar filtros de tipo de contratação (prioridade: CLT > PJ > Estágio)
    if (sidebarFilters.tipo_contratacao.clt) {
      newFilters.tipo_contratacao = 'CLT'
    } else if (sidebarFilters.tipo_contratacao.pj) {
      newFilters.tipo_contratacao = 'PJ'
    } else if (sidebarFilters.tipo_contratacao.estagio) {
      newFilters.tipo_contratacao = 'Estágio'
    }

    // Aplicar filtros de nível de experiência
    if (sidebarFilters.nivel_experiencia.estagio) {
      newFilters.nivel = 'estagio'
    } else if (sidebarFilters.nivel_experiencia.assistente) {
      newFilters.nivel = 'assistente'
    } else if (sidebarFilters.nivel_experiencia.operacional) {
      newFilters.nivel = 'operacional'
    } else if (sidebarFilters.nivel_experiencia.analista) {
      newFilters.nivel = 'analista'
    } else if (sidebarFilters.nivel_experiencia.coordenacao) {
      newFilters.nivel = 'coordenacao'
    } else if (sidebarFilters.nivel_experiencia.gerencia) {
      newFilters.nivel = 'gerencia'
    } else if (sidebarFilters.nivel_experiencia.diretoria) {
      newFilters.nivel = 'diretoria'
    } else if (sidebarFilters.nivel_experiencia.especialista) {
      newFilters.nivel = 'especialista'
    }

    setFilters(newFilters)
    setCurrentPage(1)
    searchVagas(newFilters)
    
    // Scroll para o topo dos resultados
    const resultadosSection = document.querySelector('.lg\\:col-span-3')
    if (resultadosSection) {
      resultadosSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const clearSidebarFilters = () => {
    setSidebarFilters({
      setor: 'todos',
      cargo: '',
      localizacao_sidebar: '',
      palavras_chave: '',
      estado: '',
      cidade: '',
      modelo_trabalho: {
        presencial: false,
        hibrido: false,
        remoto: false
      },
      tipo_contratacao: {
        clt: false,
        pj: false,
        estagio: false,
        temporario: false
      },
      nivel_experiencia: {
        estagio: false,
        assistente: false,
        operacional: false,
        analista: false,
        coordenacao: false,
        gerencia: false,
        diretoria: false,
        especialista: false
      },
      data_publicacao: {
        ultimas_24h: false,
        ultimos_7dias: false,
        ultimos_30dias: false
      },
      beneficios: {
        vale_transporte: false,
        vale_refeicao: false,
        plano_saude: false,
        horario_flexivel: false
      }
    })
    setCidadeBusca('')
    setMostrarSugestoes(false)
    
    const clearedFilters: PublicVagasFilters = {
      limit: 9,
      offset: 0
    }
    setFilters(clearedFilters)
    setCurrentPage(1)
    searchVagas(clearedFilters)
  }
  return (
    <ProtectedRoute allowedRoles={['candidato']}>
      <div className="w-full pb-10">
        {/* Banner com gradiente roxo-azul neon */}
        <div className="bg-gradient-to-r from-[#4400CC] to-[#00FFAE] min-h-[144px] sm:min-h-[160px] flex flex-col justify-center px-4 sm:px-6 md:px-10 py-6 shadow-[0_0_20px_rgba(68,0,204,0.3)]">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">Pesquisar Vagas</h1>
          <p className="text-base md:text-lg text-white/80 mt-2">Encontre as melhores oportunidades para sua carreira</p>
        </div>

        {/* Barra de filtros horizontal - OCULTO */}
        {false && (
        <div className="px-6 md:px-10 -mt-6 relative z-10">
          <div className="bg-white rounded-lg border border-[#4400CC]/30 shadow-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Busque por vagas ou palavras-chave"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10 border-[#4400CC]/30 focus-visible:ring-[#4400CC]"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>

              <div className="relative">
                <Input
                  type="text"
                  placeholder="Localização"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  className="pl-10 border-[#4400CC]/30 focus-visible:ring-[#4400CC]"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>

              <div className="relative">
                <Select value={filters.modelo_trabalho || 'todas'} onValueChange={(value) => setFilters(prev => ({...prev, modelo_trabalho: value === 'todas' ? undefined : value as any}))}>
                  <SelectTrigger className="border-[#4400CC]/30 focus:ring-[#4400CC]">
                    <SelectValue placeholder="Modalidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    <SelectItem value="Presencial">Presencial</SelectItem>
                    <SelectItem value="Remoto">Remoto</SelectItem>
                    <SelectItem value="Híbrido">Híbrido</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleSearch}
                disabled={loading}
                size="sm"
                className="bg-[#4400CC] hover:bg-[#3300AA] text-white shadow-[0_0_10px_rgba(68,0,204,0.2)] h-10"
              >
                <Search size={16} className="mr-2" /> {loading ? 'Buscando...' : 'Buscar Vagas'}
              </Button>
            </div>
          </div>
        </div>
        )}

        <div className="px-4 sm:px-6 md:px-10 mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Filtros laterais */}
        <div className="lg:col-span-1">
          <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)] sticky top-4">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-800">Refine sua busca</h3>
                <Button 
                  variant="link" 
                  size="sm" 
                  className="text-[#4400CC] p-0 h-auto text-sm"
                  onClick={clearSidebarFilters}
                >
                  Limpar
                </Button>
              </div>

              <div className="space-y-6">
                {/* Área de atuação ou setor */}
                <div>
                  <Label className="text-sm text-gray-600 mb-2 block">Área de atuação ou setor</Label>
                  <Select 
                    value={sidebarFilters.setor} 
                    onValueChange={(value) => setSidebarFilters(prev => ({...prev, setor: value}))}
                  >
                    <SelectTrigger className="bg-white border-[#4400CC]/30 focus:ring-[#4400CC]">
                      <SelectValue placeholder="Selecione o setor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os setores</SelectItem>
                      <SelectItem value="alimentacao">Alimentação</SelectItem>
                      <SelectItem value="comercio">Comércio</SelectItem>
                      <SelectItem value="educacao">Educação</SelectItem>
                      <SelectItem value="saude">Saúde</SelectItem>
                      <SelectItem value="tecnologia">Tecnologia</SelectItem>
                      <SelectItem value="servicos">Serviços</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Cargo ou função */}
                <div>
                  <Label className="text-sm text-gray-600 mb-2 block">Cargo ou função</Label>
                  <Input 
                    placeholder="Garçom/Garçonete" 
                    className="border-[#4400CC]/30 focus-visible:ring-[#4400CC]" 
                    value={sidebarFilters.cargo}
                    onChange={(e) => setSidebarFilters(prev => ({...prev, cargo: e.target.value}))}
                  />
                </div>

                {/* Localização - Estado e Cidade */}
                <div>
                  <Label className="text-sm text-gray-600 mb-2 block">Localização</Label>

                  {/* Estado */}
                  <div className="mb-2">
                    <Select
                      value={sidebarFilters.estado}
                      onValueChange={(value) => {
                        setSidebarFilters(prev => ({
                          ...prev,
                          estado: value,
                          cidade: '' // Limpar cidade ao mudar estado
                        }))
                        setCidadeBusca('')
                      }}
                    >
                      <SelectTrigger className="border-[#4400CC]/30 focus:ring-[#4400CC]">
                        <SelectValue placeholder="Selecione o estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {ESTADOS_BRASIL.map((uf) => (
                          <SelectItem key={uf.sigla} value={uf.sigla}>
                            {uf.nome} ({uf.sigla})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Cidade */}
                  <div className="relative">
                    <Input
                      placeholder={sidebarFilters.estado ? "Digite para buscar cidade..." : "Selecione o estado primeiro"}
                      className="border-[#4400CC]/30 focus-visible:ring-[#4400CC]"
                      value={cidadeBusca}
                      onChange={(e) => {
                        setCidadeBusca(e.target.value)
                        setMostrarSugestoes(true)
                      }}
                      onFocus={() => sidebarFilters.estado && setMostrarSugestoes(true)}
                      onBlur={() => setTimeout(() => setMostrarSugestoes(false), 200)}
                      disabled={!sidebarFilters.estado}
                    />
                    {mostrarSugestoes && sidebarFilters.estado && cidadesSugestoes.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {cidadesSugestoes.map((cidadeSugestao, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => {
                              setSidebarFilters(prev => ({...prev, cidade: cidadeSugestao}))
                              setCidadeBusca(cidadeSugestao)
                              setMostrarSugestoes(false)
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-[#4400CC]/10 transition-colors cursor-pointer text-sm"
                          >
                            {cidadeSugestao}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Palavras-chave */}
                <div>
                  <Label className="text-sm text-gray-600 mb-2 block">Palavras-chave</Label>
                  <Input
                    placeholder="Ex: atendimento, restaurante"
                    className="border-[#4400CC]/30 focus-visible:ring-[#4400CC]"
                    value={sidebarFilters.palavras_chave}
                    onChange={(e) => setSidebarFilters(prev => ({...prev, palavras_chave: e.target.value}))}
                  />
                </div>

                <Separator className="bg-[#4400CC]/10" />

                {/* Modalidade e experiência */}
                <div>
                  <h4 className="text-sm font-medium text-[#4400CC] mb-3 flex items-center">
                    Modalidade e experiência
                  </h4>

                  {/* Modelo de trabalho */}
                  <div className="mb-4">
                    <Label className="text-sm text-gray-600 mb-2 block">Modelo de trabalho</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="presencial"
                          className="border-[#4400CC]/50 data-[state=checked]:bg-[#4400CC] data-[state=checked]:text-white"
                          checked={sidebarFilters.modelo_trabalho.presencial}
                          onCheckedChange={(checked) => setSidebarFilters(prev => ({
                            ...prev, 
                            modelo_trabalho: {
                              presencial: !!checked,
                              hibrido: false,
                              remoto: false
                            }
                          }))}
                        />
                        <Label htmlFor="presencial" className="text-sm text-gray-700">
                          Presencial
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="hibrido"
                          className="border-[#4400CC]/50 data-[state=checked]:bg-[#4400CC] data-[state=checked]:text-white"
                          checked={sidebarFilters.modelo_trabalho.hibrido}
                          onCheckedChange={(checked) => setSidebarFilters(prev => ({
                            ...prev, 
                            modelo_trabalho: {
                              presencial: false,
                              hibrido: !!checked,
                              remoto: false
                            }
                          }))}
                        />
                        <Label htmlFor="hibrido" className="text-sm text-gray-700">
                          Híbrido
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="remoto"
                          className="border-[#4400CC]/50 data-[state=checked]:bg-[#4400CC] data-[state=checked]:text-white"
                          checked={sidebarFilters.modelo_trabalho.remoto}
                          onCheckedChange={(checked) => setSidebarFilters(prev => ({
                            ...prev, 
                            modelo_trabalho: {
                              presencial: false,
                              hibrido: false,
                              remoto: !!checked
                            }
                          }))}
                        />
                        <Label htmlFor="remoto" className="text-sm text-gray-700">
                          100% Remoto
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Tipo de contratação */}
                  <div className="mb-4">
                    <Label className="text-sm text-gray-600 mb-2 block">Tipo de contratação</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="clt"
                          className="border-[#4400CC]/50 data-[state=checked]:bg-[#4400CC] data-[state=checked]:text-white"
                          checked={sidebarFilters.tipo_contratacao.clt}
                          onCheckedChange={(checked) => setSidebarFilters(prev => ({
                            ...prev, 
                            tipo_contratacao: {
                              ...prev.tipo_contratacao,
                              clt: !!checked
                            }
                          }))}
                        />
                        <Label htmlFor="clt" className="text-sm text-gray-700">
                          CLT
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="pj"
                          className="border-[#4400CC]/50 data-[state=checked]:bg-[#4400CC] data-[state=checked]:text-white"
                          checked={sidebarFilters.tipo_contratacao.pj}
                          onCheckedChange={(checked) => setSidebarFilters(prev => ({
                            ...prev, 
                            tipo_contratacao: {
                              ...prev.tipo_contratacao,
                              pj: !!checked
                            }
                          }))}
                        />
                        <Label htmlFor="pj" className="text-sm text-gray-700">
                          PJ
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="estagio"
                          className="border-[#4400CC]/50 data-[state=checked]:bg-[#4400CC] data-[state=checked]:text-white"
                          checked={sidebarFilters.tipo_contratacao.estagio}
                          onCheckedChange={(checked) => setSidebarFilters(prev => ({
                            ...prev, 
                            tipo_contratacao: {
                              ...prev.tipo_contratacao,
                              estagio: !!checked
                            }
                          }))}
                        />
                        <Label htmlFor="estagio" className="text-sm text-gray-700">
                          Estágio
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="temporario"
                          className="border-[#4400CC]/50 data-[state=checked]:bg-[#4400CC] data-[state=checked]:text-white"
                          checked={sidebarFilters.tipo_contratacao.temporario}
                          onCheckedChange={(checked) => setSidebarFilters(prev => ({
                            ...prev, 
                            tipo_contratacao: {
                              ...prev.tipo_contratacao,
                              temporario: !!checked
                            }
                          }))}
                        />
                        <Label htmlFor="temporario" className="text-sm text-gray-700">
                          Temporário
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Nível de experiência */}
                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">Nível de experiência</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="estagio"
                          className="border-[#4400CC]/50 data-[state=checked]:bg-[#4400CC] data-[state=checked]:text-white"
                          checked={sidebarFilters.nivel_experiencia.estagio}
                          onCheckedChange={(checked) => setSidebarFilters(prev => ({
                            ...prev,
                            nivel_experiencia: {
                              ...prev.nivel_experiencia,
                              estagio: !!checked
                            }
                          }))}
                        />
                        <Label htmlFor="estagio" className="text-sm text-gray-700">
                          Estágio / Trainee
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="assistente"
                          className="border-[#4400CC]/50 data-[state=checked]:bg-[#4400CC] data-[state=checked]:text-white"
                          checked={sidebarFilters.nivel_experiencia.assistente}
                          onCheckedChange={(checked) => setSidebarFilters(prev => ({
                            ...prev,
                            nivel_experiencia: {
                              ...prev.nivel_experiencia,
                              assistente: !!checked
                            }
                          }))}
                        />
                        <Label htmlFor="assistente" className="text-sm text-gray-700">
                          Assistente / Auxiliar
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="operacional"
                          className="border-[#4400CC]/50 data-[state=checked]:bg-[#4400CC] data-[state=checked]:text-white"
                          checked={sidebarFilters.nivel_experiencia.operacional}
                          onCheckedChange={(checked) => setSidebarFilters(prev => ({
                            ...prev,
                            nivel_experiencia: {
                              ...prev.nivel_experiencia,
                              operacional: !!checked
                            }
                          }))}
                        />
                        <Label htmlFor="operacional" className="text-sm text-gray-700">
                          Operacional
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="analista"
                          className="border-[#4400CC]/50 data-[state=checked]:bg-[#4400CC] data-[state=checked]:text-white"
                          checked={sidebarFilters.nivel_experiencia.analista}
                          onCheckedChange={(checked) => setSidebarFilters(prev => ({
                            ...prev,
                            nivel_experiencia: {
                              ...prev.nivel_experiencia,
                              analista: !!checked
                            }
                          }))}
                        />
                        <Label htmlFor="analista" className="text-sm text-gray-700">
                          Analista
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="coordenacao"
                          className="border-[#4400CC]/50 data-[state=checked]:bg-[#4400CC] data-[state=checked]:text-white"
                          checked={sidebarFilters.nivel_experiencia.coordenacao}
                          onCheckedChange={(checked) => setSidebarFilters(prev => ({
                            ...prev,
                            nivel_experiencia: {
                              ...prev.nivel_experiencia,
                              coordenacao: !!checked
                            }
                          }))}
                        />
                        <Label htmlFor="coordenacao" className="text-sm text-gray-700">
                          Coordenação
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="gerencia"
                          className="border-[#4400CC]/50 data-[state=checked]:bg-[#4400CC] data-[state=checked]:text-white"
                          checked={sidebarFilters.nivel_experiencia.gerencia}
                          onCheckedChange={(checked) => setSidebarFilters(prev => ({
                            ...prev,
                            nivel_experiencia: {
                              ...prev.nivel_experiencia,
                              gerencia: !!checked
                            }
                          }))}
                        />
                        <Label htmlFor="gerencia" className="text-sm text-gray-700">
                          Gerência
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="diretoria"
                          className="border-[#4400CC]/50 data-[state=checked]:bg-[#4400CC] data-[state=checked]:text-white"
                          checked={sidebarFilters.nivel_experiencia.diretoria}
                          onCheckedChange={(checked) => setSidebarFilters(prev => ({
                            ...prev,
                            nivel_experiencia: {
                              ...prev.nivel_experiencia,
                              diretoria: !!checked
                            }
                          }))}
                        />
                        <Label htmlFor="diretoria" className="text-sm text-gray-700">
                          Diretoria
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="especialista"
                          className="border-[#4400CC]/50 data-[state=checked]:bg-[#4400CC] data-[state=checked]:text-white"
                          checked={sidebarFilters.nivel_experiencia.especialista}
                          onCheckedChange={(checked) => setSidebarFilters(prev => ({
                            ...prev,
                            nivel_experiencia: {
                              ...prev.nivel_experiencia,
                              especialista: !!checked
                            }
                          }))}
                        />
                        <Label htmlFor="especialista" className="text-sm text-gray-700">
                          Especialista
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="bg-[#4400CC]/10" />

                {/* Filtros complementares */}
                <div>
                  <h4 className="text-sm font-medium text-[#4400CC] mb-3 flex items-center">Filtros complementares</h4>

                  {/* Data de publicação */}
                  <div className="mb-4">
                    <Label className="text-sm text-gray-600 mb-2 block">Data de publicação</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="24h"
                          className="border-[#4400CC]/50 data-[state=checked]:bg-[#4400CC] data-[state=checked]:text-white"
                        />
                        <Label htmlFor="24h" className="text-sm text-gray-700">
                          Últimas 24 horas
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="7dias"
                          className="border-[#4400CC]/50 data-[state=checked]:bg-[#4400CC] data-[state=checked]:text-white"
                        />
                        <Label htmlFor="7dias" className="text-sm text-gray-700">
                          Últimos 7 dias
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="30dias"
                          className="border-[#4400CC]/50 data-[state=checked]:bg-[#4400CC] data-[state=checked]:text-white"
                        />
                        <Label htmlFor="30dias" className="text-sm text-gray-700">
                          Últimos 30 dias
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Benefícios oferecidos - OCULTO */}
                  {false && (
                  <div className="mb-4">
                    <Label className="text-sm text-gray-600 mb-2 block">Benefícios oferecidos</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="vt"
                          className="border-[#4400CC]/50 data-[state=checked]:bg-[#4400CC] data-[state=checked]:text-white"
                        />
                        <Label htmlFor="vt" className="text-sm text-gray-700">
                          Vale Transporte
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="vr"
                          className="border-[#4400CC]/50 data-[state=checked]:bg-[#4400CC] data-[state=checked]:text-white"
                        />
                        <Label htmlFor="vr" className="text-sm text-gray-700">
                          Vale Refeição
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="plano-saude"
                          className="border-[#4400CC]/50 data-[state=checked]:bg-[#4400CC] data-[state=checked]:text-white"
                        />
                        <Label htmlFor="plano-saude" className="text-sm text-gray-700">
                          Plano de Saúde
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="horario-flexivel"
                          className="border-[#4400CC]/50 data-[state=checked]:bg-[#4400CC] data-[state=checked]:text-white"
                        />
                        <Label htmlFor="horario-flexivel" className="text-sm text-gray-700">
                          Horário Flexível
                        </Label>
                      </div>
                    </div>
                  </div>
                  )}

                </div>

                <div className="flex justify-center">
                  <Button 
                    className="bg-[#4400CC] hover:bg-[#3300AA] text-white shadow-[0_0_10px_rgba(68,0,204,0.2)]"
                    onClick={applySidebarFilters}
                    disabled={loading}
                  >
                    <Filter size={14} className="mr-2" /> 
                    {loading ? 'Aplicando...' : 'Aplicar Filtros'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Grid de resultados */}
        <div className="lg:col-span-3">
          {/* Barra de filtros rápidos */}
          <div className="bg-white border border-[#4400CC]/30 rounded-lg p-4 mb-6 shadow-[0_0_15px_rgba(68,0,204,0.1)]">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700 mr-2">Resultados: </span>
                <Badge className="bg-[#4400CC] text-white">
                  {totalVagas > 0 ? `${totalVagas} vagas encontradas` : `${vagas.length} vagas encontradas`}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2">
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="h-8 text-xs border-[#4400CC]/30 focus:ring-[#4400CC] w-[180px]">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recentes">Mais recentes</SelectItem>
                    <SelectItem value="relevancia">Relevância</SelectItem>
                    <SelectItem value="salario-desc">Maior salário</SelectItem>
                    <SelectItem value="salario-asc">Menor salário</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700">Filtros rápidos:</span>
                <Badge 
                  className={`border cursor-pointer transition-colors ${
                    quickFilters.remoto 
                      ? 'bg-[#4400CC] text-white border-[#4400CC]' 
                      : 'bg-white text-[#4400CC] border-[#4400CC]/30 hover:bg-[#4400CC]/10'
                  }`}
                  onClick={() => toggleQuickFilter('remoto', 'Remoto')}
                >
                  Remoto
                </Badge>
                <Badge 
                  className={`border cursor-pointer transition-colors ${
                    quickFilters.clt 
                      ? 'bg-[#4400CC] text-white border-[#4400CC]' 
                      : 'bg-white text-[#4400CC] border-[#4400CC]/30 hover:bg-[#4400CC]/10'
                  }`}
                  onClick={() => toggleQuickFilter('clt', 'CLT')}
                >
                  CLT
                </Badge>
                <Badge 
                  className={`border cursor-pointer transition-colors ${
                    quickFilters.publicadas_hoje 
                      ? 'bg-[#4400CC] text-white border-[#4400CC]' 
                      : 'bg-white text-[#4400CC] border-[#4400CC]/30 hover:bg-[#4400CC]/10'
                  }`}
                  onClick={() => toggleQuickFilter('publicadas_hoje', 'Publicadas hoje')}
                >
                  Publicadas hoje
                </Badge>
                <Badge 
                  className={`border cursor-pointer transition-colors ${
                    quickFilters.junior 
                      ? 'bg-[#4400CC] text-white border-[#4400CC]' 
                      : 'bg-white text-[#4400CC] border-[#4400CC]/30 hover:bg-[#4400CC]/10'
                  }`}
                  onClick={() => toggleQuickFilter('junior', 'Júnior')}
                >
                  Júnior
                </Badge>
                <Badge 
                  className={`border cursor-pointer transition-colors ${
                    quickFilters.pleno 
                      ? 'bg-[#4400CC] text-white border-[#4400CC]' 
                      : 'bg-white text-[#4400CC] border-[#4400CC]/30 hover:bg-[#4400CC]/10'
                  }`}
                  onClick={() => toggleQuickFilter('pleno', 'Pleno')}
                >
                  Pleno
                </Badge>
                <Badge 
                  className={`border cursor-pointer transition-colors ${
                    quickFilters.senior 
                      ? 'bg-[#4400CC] text-white border-[#4400CC]' 
                      : 'bg-white text-[#4400CC] border-[#4400CC]/30 hover:bg-[#4400CC]/10'
                  }`}
                  onClick={() => toggleQuickFilter('senior', 'Sênior')}
                >
                  Sênior
                </Badge>
                <Badge className="bg-[#4400CC] text-white cursor-pointer">+ Mais filtros</Badge>
              </div>

              {activeFilters.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {activeFilters.map((filter, index) => (
                    <Badge 
                      key={index}
                      className="bg-[#4400CC]/10 text-[#4400CC] flex items-center gap-1 cursor-pointer hover:bg-[#4400CC]/20 transition-colors"
                      onClick={() => removeActiveFilter(filter)}
                    >
                      {filter}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-x"
                      >
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                    </Badge>
                  ))}
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="text-[#4400CC] p-0 h-auto text-xs hover:text-[#4400CC]/80"
                    onClick={clearAllFilters}
                  >
                    Limpar todos
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Loading, Error e Empty states */}
          {loading && (
            <div className="flex justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4400CC] mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando vagas...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-600 mb-4">Erro ao carregar vagas: {error}</p>
              <Button 
                onClick={loadVagas} 
                variant="outline" 
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                Tentar novamente
              </Button>
            </div>
          )}

          {!loading && !error && vagas.length === 0 && (
            <div className="text-center py-12">
              <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhuma vaga encontrada</h3>
              <p className="text-gray-500">Tente ajustar os filtros de busca</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vagas.map((vaga) => (
              <VagaCard key={vaga.id} vaga={vaga} />
            ))}
          </div>

          {/* Paginação - só mostra se há mais de uma página e vagas */}
          {!loading && !error && vagas.length > 0 && totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="flex items-center space-x-2">
                {/* Botão anterior */}
                <Button
                  variant="outline"
                  size="icon"
                  className="border-[#4400CC]/30 text-gray-700 hover:bg-[#4400CC]/5 hover:text-[#4400CC] h-8 w-8 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1 || loading}
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
                    disabled={loading}
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
                  disabled={currentPage === totalPages || loading}
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
        </div>
      </div>


    </ProtectedRoute>
  )
}
