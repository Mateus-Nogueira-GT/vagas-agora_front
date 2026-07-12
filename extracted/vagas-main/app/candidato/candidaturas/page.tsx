"use client"

import { Calendar, ChevronRight, Clock, Building, Filter, Search, MapPin, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { CancelCandidaturaModal } from "@/components/CancelCandidaturaModal"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/hooks/use-auth"
import { useCandidaturas } from "@/hooks/use-candidaturas"
import { useCandidatos } from "@/hooks/use-candidatos"
import type { Candidatura } from "@/lib/candidaturas/candidaturas-types"
import toast from "react-hot-toast"

export default function MyApplications() {
  const { user } = useAuth()
  const { candidato } = useCandidatos()
  const { candidaturas, isLoading, error, loadCandidaturas } = useCandidaturas()
  
  // Estados para filtros
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [locationFilter, setLocationFilter] = useState<string>('todas')

  // Carregar candidaturas quando o usuário for carregado
  useEffect(() => {
    if (user?.id) {
      loadCandidaturas(user.id)
    }
  }, [user?.id, loadCandidaturas])

  // Função para filtrar candidaturas localmente
  const filteredCandidaturas = candidaturas.filter((candidatura) => {
    // Filtro por status
    if (selectedStatus !== 'all' && candidatura.status !== selectedStatus) {
      return false
    }

    // Filtro por termo de busca (cargo ou empresa)
    if (searchTerm) {
      const termo = searchTerm.toLowerCase()
      const tituloMatch = candidatura.vaga?.titulo?.toLowerCase().includes(termo)
      const empresaMatch = candidatura.vaga?.empregador?.nome?.toLowerCase().includes(termo)
      if (!tituloMatch && !empresaMatch) {
        return false
      }
    }

    // Filtro por localização
    if (locationFilter && locationFilter !== 'todas') {
      if (locationFilter === 'remoto') {
        if (candidatura.vaga?.modelo_trabalho !== 'Remoto') {
          return false
        }
      } else {
        const locationMatch = `${candidatura.vaga?.cidade}, ${candidatura.vaga?.estado}`.toLowerCase().includes(locationFilter.toLowerCase())
        if (!locationMatch) {
          return false
        }
      }
    }

    return true
  })

  // Função para formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }

  // Função para formatar salário
  const formatSalary = (salarioMin?: number, salarioMax?: number) => {
    if (!salarioMin && !salarioMax) return 'A combinar'
    if (salarioMin && salarioMax) {
      return `R$ ${salarioMin.toLocaleString()} - ${salarioMax.toLocaleString()}`
    }
    if (salarioMin) return `A partir de R$ ${salarioMin.toLocaleString()}`
    if (salarioMax) return `Até R$ ${salarioMax.toLocaleString()}`
    return 'A combinar'
  }

  // Função para gerar logo da empresa
  const generateCompanyLogo = (companyName: string) => {
    return companyName ? companyName.charAt(0).toUpperCase() : '?'
  }

  return (
    <ProtectedRoute allowedRoles={['candidato']}>
      <div className="w-full pb-10">
      {/* Banner com gradiente roxo-azul neon */}
      <div className="bg-gradient-to-r from-[#4400CC] to-[#00FFAE] min-h-[144px] sm:min-h-[160px] flex flex-col justify-center px-4 sm:px-6 md:px-10 py-6 shadow-[0_0_20px_rgba(68,0,204,0.3)]">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">Minhas Candidaturas</h1>
        <p className="text-base md:text-lg text-white/80 mt-2">Acompanhe o status das suas candidaturas</p>
      </div>

      <div className="px-4 sm:px-6 md:px-10 mt-6 sm:mt-8">
        {/* Barra de pesquisa e filtros */}
        <div className="bg-white border border-[#4400CC]/30 rounded-lg p-4 mb-6 shadow-[0_0_15px_rgba(68,0,204,0.1)]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Busque por cargo ou empresa"
                className="pl-10 text-base border-[#4400CC]/30 focus-visible:ring-[#4400CC]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoComplete="off"
                enterKeyHint="search"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            <div className="relative">
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="pl-10 border-[#4400CC]/30 focus:ring-[#4400CC]">
                  <SelectValue placeholder="Localização" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as localizações</SelectItem>
                  <SelectItem value="sp">São Paulo, SP</SelectItem>
                  <SelectItem value="rj">Rio de Janeiro, RJ</SelectItem>
                  <SelectItem value="bh">Belo Horizonte, MG</SelectItem>
                  <SelectItem value="remoto">Remoto</SelectItem>
                </SelectContent>
              </Select>
              <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            <div className="flex items-center justify-center">
              <Badge className="bg-[#4400CC] text-white text-sm py-2">
                {isLoading ? '...' : `${filteredCandidaturas.length} candidaturas encontradas`}
              </Badge>
            </div>
          </div>

          <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-10 text-sm border-[#4400CC]/30 focus:ring-[#4400CC] w-full sm:w-[180px]">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="Em análise">Em análise</SelectItem>
                  <SelectItem value="Aprovado">Aprovado</SelectItem>
                  <SelectItem value="Rejeitado">Rejeitado</SelectItem>
                  <SelectItem value="Finalizado">Finalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="border-[#4400CC]/20">
                  <CardContent className="p-4">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2 mb-4" />
                    <Skeleton className="h-6 w-20 mb-2" />
                    <Skeleton className="h-3 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
            </div>
          ) : candidaturas.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Você ainda não possui candidaturas.</p>
            </div>
          ) : filteredCandidaturas.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhuma candidatura encontrada com os filtros aplicados.</p>
              <Button
                variant="link"
                className="text-[#4400CC] mt-2"
                onClick={() => {
                  setSearchTerm('')
                  setLocationFilter('todas')
                  setSelectedStatus('all')
                }}
              >
                Limpar filtros
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCandidaturas.map((candidatura) => (
                <ApplicationCard key={candidatura.id} candidatura={candidatura} />
              ))}
            </div>
          )}
        </div>
      </div>
      </div>
    </ProtectedRoute>
  )
}

// Componente de card de candidatura
function ApplicationCard({ candidatura }: { candidatura: Candidatura }) {
  const router = useRouter()
  const { user } = useAuth()
  const { cancelarCandidatura, loadCandidaturas } = useCandidaturas()
  const [cancelModalOpen, setCancelModalOpen] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }

  const formatSalary = (salarioMin?: number, salarioMax?: number) => {
    if (!salarioMin && !salarioMax) return 'A combinar'
    if (salarioMin && salarioMax) {
      return `R$ ${salarioMin.toLocaleString()} - ${salarioMax.toLocaleString()}`
    }
    if (salarioMin) return `A partir de R$ ${salarioMin.toLocaleString()}`
    if (salarioMax) return `Até R$ ${salarioMax.toLocaleString()}`
    return 'A combinar'
  }

  const generateCompanyLogo = (companyName: string) => {
    return companyName ? companyName.charAt(0).toUpperCase() : '?'
  }

  const getStatusConfig = (status: string) => {
    const config = {
      'Em análise': { variant: 'secondary' as const, label: 'Em análise' },
      'Aprovado': { variant: 'default' as const, label: 'Aprovado' },
      'Rejeitado': { variant: 'destructive' as const, label: 'Rejeitado' },
      'Finalizado': { variant: 'outline' as const, label: 'Finalizado' }
    }
    return config[status as keyof typeof config] || config['Em análise']
  }

  const handleCancelarCandidatura = async () => {
    if (!user?.id || !candidatura.vaga_id) return false

    try {
      const success = await cancelarCandidatura(user.id, candidatura.vaga_id)
      if (success) {
        toast.success('Candidatura cancelada com sucesso!')
        // Reload candidaturas to update the list
        if (user?.id) {
          loadCandidaturas(user.id)
        }
      }
      return success
    } catch (error) {
      console.error('Erro ao cancelar candidatura:', error)
      toast.error('Erro ao cancelar candidatura')
      return false
    }
  }

  const status = getStatusConfig(candidatura.status)
  const location = candidatura.vaga?.cidade && candidatura.vaga?.estado
    ? `${candidatura.vaga.cidade}, ${candidatura.vaga.estado}`
    : 'Local não informado'

  return (
    <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)] hover:shadow-[0_0_20px_rgba(68,0,204,0.2)] transition-all">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start min-w-0">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-[#4400CC]/10 to-[#0057FF]/10 flex items-center justify-center border border-[#4400CC]/20 overflow-hidden">
            {candidatura.vaga?.empregador?.logo_url ? (
              <Image
                src={candidatura.vaga.empregador.logo_url}
                alt={`Logo da ${candidatura.vaga.empregador.nome}`}
                width={48}
                height={48}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <span className="text-lg font-bold text-[#4400CC]">
                {generateCompanyLogo(candidatura.vaga?.empregador?.nome || '')}
              </span>
            )}
          </div>
          <div className="ml-3 sm:ml-4 flex-1 min-w-0">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-medium text-gray-800 break-words">{candidatura.vaga?.titulo || 'Vaga não informada'}</h3>
                <p className="text-sm text-[#0057FF] font-medium break-words">{candidatura.vaga?.empregador?.nome || 'Empresa não informada'}</p>

                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <Calendar size={14} className="mr-1" />
                  <span>Candidatura: {formatDate(candidatura.data_candidatura)}</span>
                </div>
              </div>
              <div className="mt-2 md:mt-0">
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin size={14} className="mr-1" />
                <span>{location}</span>
              </div>
              {candidatura.vaga?.modelo_trabalho && (
                <div className="flex items-center text-sm text-gray-600">
                  <Building size={14} className="mr-1" />
                  <span>{candidatura.vaga.modelo_trabalho}</span>
                </div>
              )}
              <div className="flex items-center text-sm text-[#4400CC]">
                <DollarSign size={14} className="mr-1" />
                <span>{formatSalary(candidatura.vaga?.salario_de, candidatura.vaga?.salario_ate)}</span>
              </div>
            </div>

            <div className="mt-4">
              <div className="text-xs text-gray-600 flex space-x-4 mb-3">
                <span className="flex items-center">
                  <Clock size={12} className="mr-1" />
                  {candidatura.data_ultima_interacao
                    ? `Atualizado em ${formatDate(candidatura.data_ultima_interacao)}`
                    : 'Sem atualizações'
                  }
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between pt-3 border-t border-gray-100">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto min-h-11 border-[#4400CC]/30 text-[#4400CC] hover:bg-[#4400CC]/5"
                  onClick={() => router.push(`/candidato/pesquisar-vagas/${candidatura.vaga_id}`)}
                >
                  Detalhes da Vaga
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="w-full sm:w-auto min-h-11 border-green-500 text-green-600 bg-green-50 hover:bg-green-100"
                  onClick={() => setCancelModalOpen(true)}
                >
                  ✅ Candidatado
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Modal de Cancelar Candidatura */}
      <CancelCandidaturaModal
        vaga={{
          titulo: candidatura.vaga?.titulo || 'Vaga não informada',
          empregador: {
            nome: candidatura.vaga?.empregador?.nome || 'Empresa não informada'
          }
        }}
        isOpen={cancelModalOpen}
        onOpenChange={setCancelModalOpen}
        onConfirm={handleCancelarCandidatura}
      />
    </Card>
  )
}
