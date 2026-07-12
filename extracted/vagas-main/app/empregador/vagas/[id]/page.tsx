"use client"

import { useEffect, use, useState } from "react"
import Link from "next/link"
import toast from "react-hot-toast"
import {
  ChevronRight,
  MapPin,
  Clock,
  DollarSign,
  Building,
  Users,
  Globe,
  CheckCircle,
  Calendar,
  Edit,
  Trash2,
  ArrowLeft,
  User,
  Star,
  Eye,
  Filter,
  Share2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { useVagas } from "@/hooks/use-vagas"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { canEditVaga, canDeleteVaga, getBlockedActionTooltip, getStatusColor, VagaStatus } from "@/lib/vagas/vaga-utils"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CandidateProfileModal } from "@/components/CandidateProfileModal"
import { updateCandidaturaStatus } from "@/lib/api/candidaturas-api"
import { Candidatura } from "@/lib/vagas/vagas-types"

export default function JobDetails({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { currentVaga, isLoading, error, loadVagaById, changeVagaStatus, clearError, deleteVaga } = useVagas()
  const [selectedStatus, setSelectedStatus] = useState<VagaStatus>('Ativa')
  const [isSavingStatus, setIsSavingStatus] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [selectedCandidatura, setSelectedCandidatura] = useState<Candidatura | null>(null)
  const [visualizacoes, setVisualizacoes] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [candidatosPerPage] = useState(10)

  // Função para compartilhar vaga
  const handleCompartilharVaga = () => {
    if (!currentVaga) return

    const vagaUrl = `${window.location.origin}/candidato/pesquisar-vagas/${currentVaga.id}`

    // Tenta usar a API de compartilhamento nativa
    if (navigator.share) {
      navigator.share({
        title: currentVaga.titulo,
        text: `Confira esta vaga: ${currentVaga.titulo}`,
        url: vagaUrl,
      })
        .then(() => {
          toast.success('Vaga compartilhada com sucesso!', { duration: 3000 })
        })
        .catch((error) => {
          // Se o usuário cancelar, não mostra erro
          if (error.name !== 'AbortError') {
            console.error('Erro ao compartilhar:', error)
          }
        })
    } else {
      // Fallback: copia o link para o clipboard
      navigator.clipboard.writeText(vagaUrl)
        .then(() => {
          toast.success('Link da vaga copiado para a área de transferência!', {
            duration: 4000,
          })
        })
        .catch(() => {
          toast.error('Erro ao copiar link. Tente novamente.', {
            duration: 3000,
          })
        })
    }
  }

  // Função para rolar até a seção de candidatos
  const scrollToCandidatos = () => {
    const candidatosSection = document.getElementById('candidatos-section')
    if (candidatosSection) {
      candidatosSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  useEffect(() => {
    if (resolvedParams.id) {
      loadVagaById(resolvedParams.id)
    }
  }, [resolvedParams.id, loadVagaById])

  useEffect(() => {
    if (currentVaga) {
      setSelectedStatus(currentVaga.status)

      // Carregar visualizações
      const carregarVisualizacoes = async () => {
        try {
          const response = await fetch(`/api/vagas/${currentVaga.id}/visualizacoes`)
          if (response.ok) {
            const data = await response.json()
            setVisualizacoes(data.total || 0)
          }
        } catch (error) {
          console.error('Erro ao carregar visualizações:', error)
        }
      }

      carregarVisualizacoes()
    }
  }, [currentVaga])

  const handleSaveStatus = async () => {
    if (!currentVaga) return
    
    setIsSavingStatus(true)
    try {
      const success = await changeVagaStatus(currentVaga.id, selectedStatus)
      
      if (success) {
        toast.success(`Status da vaga alterado para "${selectedStatus}" com sucesso!`, {
          duration: 4000,
        })
      } else {
        toast.error('Erro ao alterar o status da vaga. Tente novamente.', {
          duration: 5000,
        })
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      toast.error('Erro inesperado ao alterar o status da vaga. Verifique sua conexão.', {
        duration: 5000,
      })
    } finally {
      setIsSavingStatus(false)
    }
  }

  const handleDeleteVaga = async () => {
    if (!currentVaga) return

    setIsDeleting(true)
    try {
      const success = await deleteVaga(currentVaga.id)
      
      if (success) {
        toast.success('Vaga excluída com sucesso!', {
          duration: 4000,
        })
        // Redirecionar para a lista de vagas após a exclusão
        window.location.href = '/empregador/vagas'
      } else {
        toast.error('Erro ao excluir a vaga. Tente novamente.', {
          duration: 5000,
        })
      }
    } catch (error) {
      console.error('Erro ao excluir vaga:', error)
      toast.error('Erro inesperado ao excluir a vaga. Verifique sua conexão.', {
        duration: 5000,
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  const handleOpenProfile = (candidatura: Candidatura) => {
    setSelectedCandidatura(candidatura)
    setIsProfileModalOpen(true)
  }

  const handleCandidaturaStatusChange = async (candidaturaId: string, novoStatus: string) => {
    try {
      const result = await updateCandidaturaStatus({ candidaturaId, novoStatus })
      
      if (result.success) {
        // Recarregar os dados da vaga para atualizar a lista de candidatos
        if (resolvedParams.id) {
          await loadVagaById(resolvedParams.id)
        }
        return true
      } else {
        throw new Error(result.error || 'Erro ao alterar status')
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      throw error
    }
  }

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={['empregador']}>
        <div className="w-full pb-10">
          <div className="px-4 pt-4 sm:px-6 md:px-10">
            {/* Header Skeleton */}
            <div className="mb-6">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-8 w-64" />
            </div>

            {/* Main Content Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Job Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Job Header Card */}
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start gap-4">
                      <Skeleton className="h-16 w-16 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-32" />
                        <div className="flex gap-2">
                          <Skeleton className="h-5 w-16" />
                          <Skeleton className="h-5 w-20" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Job Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-5 w-32" />
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Job Description */}
                <Card>
                  <CardContent className="space-y-4 p-4 sm:p-6">
                    <Skeleton className="h-6 w-48" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </CardContent>
                </Card>

                {/* Requirements and Benefits */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-4 sm:p-6">
                        <Skeleton className="h-6 w-32 mb-4" />
                        <div className="space-y-2">
                          {[1, 2, 3].map((j) => (
                            <Skeleton key={j} className="h-4 w-full" />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Right Column - Actions and Stats */}
              <div className="space-y-6">
                {/* Status Card */}
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <Skeleton className="h-6 w-24 mb-4" />
                    <Skeleton className="h-10 w-full mb-4" />
                    <Skeleton className="h-9 w-full" />
                  </CardContent>
                </Card>

                {/* Stats Cards */}
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Skeleton className="h-4 w-20 mb-1" />
                          <Skeleton className="h-6 w-8" />
                        </div>
                        <Skeleton className="h-8 w-8 rounded" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error || !currentVaga) {
    return (
      <ProtectedRoute allowedRoles={['empregador']}>
        <div className="w-full pb-10">
          <div className="px-4 pt-4 sm:px-6 md:px-10">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error || 'Vaga não encontrada'}</p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Button onClick={clearError} variant="outline" size="sm" className="w-full sm:w-auto">
                  Tentar novamente
                </Button>
                <Link href="/empregador/vagas" className="w-full sm:w-auto">
                  <Button size="sm" className="w-full sm:w-auto">
                    Voltar para lista
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  // Helper functions
  const candidaturas = currentVaga.candidaturas ?? []
  const totalCandidaturas = candidaturas.length
  const totalPages = Math.ceil(totalCandidaturas / candidatosPerPage)

  const formatLocation = () => {
    const parts = []
    
    // Prioriza localização se existir, senão usa cidade e estado
    if (currentVaga.localizacao) {
      parts.push(currentVaga.localizacao)
    } else if (currentVaga.cidade && currentVaga.estado) {
      parts.push(`${currentVaga.cidade}, ${currentVaga.estado}`)
    }
    
    // Adiciona modelo de trabalho se existir
    if (currentVaga.modelo_trabalho) {
      parts.push(currentVaga.modelo_trabalho)
    } else if (currentVaga.remoto) {
      parts.push('Remoto')
    }
    
    return parts.length > 0 ? parts.join(' • ') : 'Localização não informada'
  }

  const getDaysLeft = () => {
    if (!currentVaga.data_expiracao) return '-'
    const expirationDate = new Date(currentVaga.data_expiracao)
    const today = new Date()
    const diffTime = expirationDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? `${diffDays} dias` : 'Expirada'
  }

  const formatSalary = () => {
    if (currentVaga.salario_de && currentVaga.salario_ate) {
      return `R$ ${Number(currentVaga.salario_de).toLocaleString('pt-BR')} - R$ ${Number(currentVaga.salario_ate).toLocaleString('pt-BR')}`
    } else if (currentVaga.salario_de) {
      return `A partir de R$ ${Number(currentVaga.salario_de).toLocaleString('pt-BR')}`
    } else if (currentVaga.salario_ate) {
      return `Até R$ ${Number(currentVaga.salario_ate).toLocaleString('pt-BR')}`
    }
    return 'Salário a combinar'
  }

  const timeAgo = currentVaga.data_publicacao ? 
    new Date(currentVaga.data_publicacao).toLocaleDateString('pt-BR') : null

  return (
    <ProtectedRoute allowedRoles={['empregador']}>
      <div className="w-full pb-10">
        {/* Banner com gradiente roxo-azul neon */}
        <div className="flex min-h-[136px] flex-col justify-center bg-gradient-to-r from-[#4400CC] to-[#00FFAE] px-4 py-6 shadow-[0_0_20px_rgba(68,0,204,0.3)] sm:px-6 md:min-h-[160px] md:px-10">
          <h1 className="break-words text-2xl font-bold text-white md:text-3xl lg:text-4xl">{currentVaga.titulo}</h1>
          <p className="text-base md:text-lg text-white/80 mt-2">
            {formatLocation()} {timeAgo && `• Publicada ${timeAgo}`}
          </p>
        </div>

        {/* Breadcrumb */}
        <div className="flex min-w-0 items-center overflow-hidden px-4 py-4 text-sm sm:px-6 md:px-10">
          <Link href="/empregador/vagas" className="text-[#4400CC] hover:text-[#3300AA] flex items-center">
            <ArrowLeft size={14} className="mr-1" />
            Voltar para Gerenciar Vagas
          </Link>
          <ChevronRight size={14} className="mx-2 text-gray-400" />
          <span className="text-gray-600 truncate">{currentVaga.titulo}</span>
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-4 px-4 sm:px-6 md:gap-6 md:px-10 lg:grid-cols-3">
          {/* Coluna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card principal com informações da vaga */}
            <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)]">
              <CardContent className="p-4 sm:p-6">
                <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-[#4400CC]/10 to-[#0057FF]/10">
                    <span className="text-xl font-bold text-[#4400CC]">
                      {currentVaga.empresa_nome 
                        ? currentVaga.empresa_nome.split(' ').map(word => word[0]).join('').substring(0, 3).toUpperCase()
                        : 'EMP'
                      }
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 sm:ml-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <h2 className="break-words text-xl font-bold text-gray-800">{currentVaga.titulo}</h2>
                      <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div>
                                {canEditVaga(currentVaga.status) ? (
                                  <Link href={`/empregador/editar-vaga/${currentVaga.id}`}>
                                    <Button variant="outline" size="sm" className="border-[#4400CC]/30 text-[#4400CC] h-8">
                                      <Edit size={14} className="mr-1" /> Editar
                                    </Button>
                                  </Link>
                                ) : (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="border-gray-300 text-gray-400 h-8 cursor-not-allowed" 
                                    disabled
                                  >
                                    <Edit size={14} className="mr-1" /> Editar
                                  </Button>
                                )}
                              </div>
                            </TooltipTrigger>
                            {!canEditVaga(currentVaga.status) && (
                              <TooltipContent>
                                <p>{getBlockedActionTooltip('editar')}</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div>
                                {canDeleteVaga(currentVaga.status) ? (
                                  <>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="border-red-500 text-red-500 h-8 hover:bg-red-50"
                                      onClick={() => setIsDeleteDialogOpen(true)}
                                    >
                                      <Trash2 size={14} className="mr-1" /> Excluir
                                    </Button>
                                    
                                    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                                      <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-y-auto sm:max-w-md">
                                        <DialogHeader>
                                          <DialogTitle className="text-red-600 flex items-center gap-2">
                                            <Trash2 size={20} />
                                            Confirmar Exclusão da Vaga
                                          </DialogTitle>
                                          <DialogDescription>
                                            <div className="space-y-4 text-gray-700">
                                              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                                <p className="text-red-800 font-semibold mb-2">
                                                  ⚠️ Esta é uma ação irreversível!
                                                </p>
                                                <p className="text-red-700">
                                                  Ao excluir esta vaga, todos os dados relacionados serão permanentemente removidos.
                                                </p>
                                              </div>
                                              
                                              <div>
                                                <p className="font-medium text-gray-900 mb-2">
                                                  Os seguintes dados serão apagados:
                                                </p>
                                                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-2">
                                                  <li>Informações da vaga e descrição completa</li>
                                                  <li>Todas as candidaturas recebidas</li>
                                                  <li>Histórico de visualizações e estatísticas</li>
                                                  <li>Dados de métricas e relatórios</li>
                                                </ul>
                                              </div>
                                              
                                              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                                <p className="text-gray-800">
                                                  <strong>Vaga:</strong> &quot;{currentVaga.titulo}&quot;
                                                </p>
                                                <p className="text-gray-600 text-sm mt-1">
                                                  Tem certeza de que deseja excluir esta vaga?
                                                </p>
                                              </div>
                                            </div>
                                          </DialogDescription>
                                        </DialogHeader>
                                        
                                        <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:gap-0">
                                          <Button
                                            variant="outline"
                                            onClick={() => setIsDeleteDialogOpen(false)}
                                            disabled={isDeleting}
                                            className="w-full sm:w-auto sm:flex-none"
                                          >
                                            Cancelar
                                          </Button>
                                          <Button
                                            variant="destructive"
                                            onClick={handleDeleteVaga}
                                            disabled={isDeleting}
                                            className="w-full bg-red-600 hover:bg-red-700 sm:w-auto sm:flex-none"
                                          >
                                            {isDeleting ? (
                                              <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Excluindo...
                                              </>
                                            ) : (
                                              <>
                                                <Trash2 size={14} className="mr-2" />
                                                Sim, Excluir Vaga
                                              </>
                                            )}
                                          </Button>
                                        </DialogFooter>
                                      </DialogContent>
                                    </Dialog>
                                  </>
                                ) : (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="border-gray-300 text-gray-400 h-8 cursor-not-allowed"
                                    disabled
                                  >
                                    <Trash2 size={14} className="mr-1" /> Excluir
                                  </Button>
                                )}
                              </div>
                            </TooltipTrigger>
                            {!canDeleteVaga(currentVaga.status) && (
                              <TooltipContent>
                                <p>{getBlockedActionTooltip('excluir')}</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-y-2 mt-2">
                      <div className="flex items-center text-gray-600 text-sm mr-4">
                        <Building size={14} className="mr-1" />
                        <span>{currentVaga.empresa_nome || 'Empresa não informada'}</span>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm mr-4">
                        <MapPin size={14} className="mr-1" />
                        <span>{formatLocation()}</span>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm mr-4">
                        <Users size={14} className="mr-1" />
                        <span>{currentVaga.num_vagas ? `${currentVaga.num_vagas} vaga${currentVaga.num_vagas > 1 ? 's' : ''}` : '1 vaga'}</span>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm mr-4">
                        <Clock size={14} className="mr-1" />
                        <span>Publicada em {timeAgo || 'Data não disponível'}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge className="bg-[#4400CC] hover:bg-[#4400CC] text-white">{currentVaga.tipo_contratacao || 'N/A'}</Badge>
                      <Badge className="bg-[#0057FF] hover:bg-[#0057FF] text-white">{currentVaga.modelo_trabalho || 'N/A'}</Badge>
                      <Badge className="bg-[#00FFAE] hover:bg-[#00FFAE] text-[#4400CC]">{currentVaga.nivel || 'N/A'}</Badge>
                      <Badge 
                        className="text-white"
                        style={{ backgroundColor: getStatusColor(currentVaga.status) }}
                      >
                        {currentVaga.status || 'Status não definido'}
                      </Badge>
                    </div>

                    <div className="mt-4 flex items-center text-[#4400CC] font-medium">
                      <DollarSign size={16} className="mr-1 text-[#4400CC]" />
                      <span>{formatSalary()}</span>
                    </div>
                  </div>
                </div>

                <Separator className="my-6 bg-[#4400CC]/10" />

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-[#4400CC] mb-3">Descrição da vaga</h3>
                    <p className="text-gray-700 whitespace-pre-line">{currentVaga.descricao || 'Descrição não fornecida'}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-[#4400CC] mb-3">Responsabilidades</h3>
                    <ul className="space-y-2">
                      {currentVaga.responsabilidades && currentVaga.responsabilidades.length > 0 ? 
                        currentVaga.responsabilidades.map((item: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle size={18} className="text-[#4400CC] mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{item}</span>
                          </li>
                        )) : (
                          <li className="text-gray-500">Nenhuma responsabilidade informada</li>
                        )
                      }
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-[#4400CC] mb-3">Requisitos</h3>

                    {currentVaga.requisitos && currentVaga.requisitos.length > 0 ? (
                      <div className="bg-[#4400CC]/5 p-4 rounded-lg mb-4">
                        <h4 className="font-medium text-[#4400CC] mb-3 flex items-center">
                          <CheckCircle size={16} className="mr-2" />
                          OBRIGATÓRIOS
                        </h4>
                        <ul className="space-y-2">
                          {currentVaga.requisitos.map((item: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <ChevronRight size={16} className="text-[#4400CC] mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-gray-500 mb-4">Nenhum requisito informado</p>
                    )}

                    {/* Requisitos Desejáveis (diferenciais) */}
                    {currentVaga.diferenciais && currentVaga.diferenciais.length > 0 && (
                      <div className="bg-[#4400CC]/5 p-4 rounded-lg">
                        <h4 className="font-medium text-[#4400CC] mb-3 flex items-center">
                          <Star size={16} className="mr-2" />
                          DESEJÁVEIS
                        </h4>
                        <ul className="space-y-2">
                          {currentVaga.diferenciais.map((item: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <ChevronRight size={16} className="text-[#4400CC] mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-[#4400CC] mb-3">Benefícios</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {currentVaga.beneficios && currentVaga.beneficios.length > 0 ?
                        currentVaga.beneficios.map((item: string, index: number) => (
                          <div key={index} className="flex items-start">
                            <CheckCircle size={18} className="text-[#4400CC] mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{item}</span>
                          </div>
                        )) : (
                          <div className="text-gray-500">Nenhum benefício informado</div>
                        )
                      }
                    </div>
                  </div>

                  {currentVaga.empresa?.descricao && (
                    <div>
                      <h3 className="text-lg font-medium text-[#4400CC] mb-3">Sobre a empresa</h3>
                      <p className="text-gray-700 whitespace-pre-line">{currentVaga.empresa.descricao}</p>
                    </div>
                  )}

                  {currentVaga.etapas_processo && currentVaga.etapas_processo.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-[#4400CC] mb-3">Etapas do processo seletivo</h3>
                      <ul className="space-y-2">
                        {currentVaga.etapas_processo.map((etapa: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <div className="w-6 h-6 rounded-full bg-[#4400CC] text-white text-xs flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                              {index + 1}
                            </div>
                            <span className="text-gray-700">{etapa}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna lateral */}
          <div className="space-y-6">
            {/* Card de status da vaga */}
            <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)]">
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-lg font-medium text-[#4400CC] mb-4">Status da vaga</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-700 mb-2 block">Alterar status</label>
                    <Select 
                      value={selectedStatus} 
                      onValueChange={(value: VagaStatus) => setSelectedStatus(value)}
                    >
                      <SelectTrigger className="border-[#4400CC]/30 focus:ring-[#4400CC]">
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Rascunho">Rascunho (Não Publicado)</SelectItem>
                        <SelectItem value="Ativa">Ativa (Publicado)</SelectItem>
                        <SelectItem value="Preenchida">Preenchida</SelectItem>
                        <SelectItem value="Encerrada">Encerrada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={handleSaveStatus}
                    disabled={isSavingStatus || selectedStatus === currentVaga?.status}
                    className="w-full bg-[#4400CC] hover:bg-[#3300AA] text-white shadow-[0_0_10px_rgba(68,0,204,0.2)] disabled:opacity-50"
                  >
                    {isSavingStatus ? 'Salvando...' : 'Salvar alterações'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Card de estatísticas */}
            <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)]">
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-lg font-medium text-[#4400CC] mb-4">Estatísticas</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-gray-700">
                    <div className="flex items-center">
                      <Users size={16} className="text-[#4400CC] mr-2" />
                      <span className="text-sm">Candidatos: </span>
                    </div>
                    <span className="font-medium">{totalCandidaturas}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-700">
                    <div className="flex items-center">
                      <Eye size={16} className="text-[#0057FF] mr-2" />
                      <span className="text-sm">Visualizações: </span>
                    </div>
                    <span className="font-medium">{visualizacoes}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-700">
                    <div className="flex items-center">
                      <Calendar size={16} className="text-[#00FFAE] mr-2" />
                      <span className="text-sm">Dias restantes: </span>
                    </div>
                    <span className="font-medium">{getDaysLeft()}</span>
                  </div>
                  {currentVaga.data_expiracao && (
                    <div className="flex items-center justify-between text-gray-700">
                      <div className="flex items-center">
                        <Clock size={16} className="text-gray-500 mr-2" />
                        <span className="text-sm">Expira em: </span>
                      </div>
                      <span className="font-medium text-sm">
                        {new Date(currentVaga.data_expiracao).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Card de ações */}
            <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)]">
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-lg font-medium text-[#4400CC] mb-4">Ações</h3>
                <div className="space-y-3">
                  <Button
                    onClick={scrollToCandidatos}
                    className="w-full bg-[#00FFAE] hover:bg-[#00FFAE]/80 text-[#4400CC] shadow-[0_0_10px_rgba(0,255,174,0.2)]"
                  >
                    <Users size={16} className="mr-2" /> Ver todos os candidatos
                  </Button>
                  <Button
                    onClick={handleCompartilharVaga}
                    variant="outline"
                    className="w-full border-[#4400CC]/30 text-[#4400CC] hover:bg-[#4400CC]/5"
                  >
                    <Share2 size={16} className="mr-2" /> Compartilhar vaga
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Lista de candidatos */}
        <div id="candidatos-section" className="mt-8 scroll-mt-24 px-4 sm:px-6 md:px-10">
          <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)]">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h3 className="text-lg font-medium text-[#4400CC]">
                  Candidatos ({totalCandidaturas})
                </h3>
                {totalCandidaturas > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    <Select defaultValue="recentes">
                      <SelectTrigger className="w-full sm:w-[180px] border-[#4400CC]/30 focus:ring-[#4400CC]">
                        <SelectValue placeholder="Ordenar por" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recentes">Mais recentes</SelectItem>
                        <SelectItem value="match">Por status</SelectItem>
                        <SelectItem value="antigos">Mais antigos</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button className="w-full sm:w-auto bg-[#4400CC] hover:bg-[#3300AA] text-white shadow-[0_0_10px_rgba(68,0,204,0.2)]">
                      <Filter size={16} className="mr-2" /> Filtrar
                    </Button>
                  </div>
                )}
              </div>

              {totalCandidaturas === 0 ? (
                <div className="text-center py-12">
                  <Users size={48} className="mx-auto text-gray-400 mb-4" />
                  <h4 className="text-lg font-medium text-gray-600 mb-2">Nenhum candidato ainda</h4>
                  <p className="text-gray-500 mb-6">
                    Quando candidatos se inscreverem para esta vaga, eles aparecerão aqui.
                  </p>
                  <Button
                    onClick={handleCompartilharVaga}
                    className="bg-[#00FFAE] hover:bg-[#00FFAE]/80 text-[#4400CC] shadow-[0_0_10px_rgba(0,255,174,0.2)]"
                  >
                    <Globe size={16} className="mr-2" /> Compartilhar vaga
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {candidaturas
                      .slice((currentPage - 1) * candidatosPerPage, currentPage * candidatosPerPage)
                      .map((candidatura) => {
                      // Função para gerar iniciais do nome
                      const getInitials = (nome: string) => {
                        return nome.split(' ')
                          .map(word => word[0])
                          .join('')
                          .substring(0, 2)
                          .toUpperCase()
                      }

                      // Função para gerar cor do status
                      const getCandidaturaStatusColor = (status: string) => {
                        switch (status) {
                          case 'Em análise': return '#FFA500'
                          case 'Aprovado': return '#00FFAE'
                          case 'Rejeitado': return '#FF4D4D'
                          case 'Finalizado': return '#4400CC'
                          default: return '#FFA500'
                        }
                      }

                      // Função para calcular tempo decorrido
                      const getTimeAgo = (date: string) => {
                        const candidaturaDate = new Date(date)
                        const now = new Date()
                        const diffTime = Math.abs(now.getTime() - candidaturaDate.getTime())
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                        
                        if (diffDays === 1) return 'Há 1 dia'
                        if (diffDays < 30) return `Há ${diffDays} dias`
                        if (diffDays < 365) {
                          const months = Math.floor(diffDays / 30)
                          return `Há ${months} ${months === 1 ? 'mês' : 'meses'}`
                        }
                        const years = Math.floor(diffDays / 365)
                        return `Há ${years} ${years === 1 ? 'ano' : 'anos'}`
                      }

                      const candidatoNome = candidatura.candidato_dados?.nome_completo || 
                                          candidatura.candidato?.email?.split('@')[0] || 
                                          'Candidato Anônimo'
                      const candidatoTitulo = candidatura.candidato_dados?.titulo_profissional || 'Desenvolvedor'

                      return (
                        <div
                          key={candidatura.id}
                          className="p-4 border border-[#4400CC]/20 rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex flex-col gap-4">
                            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                              <div className="flex w-full min-w-0 flex-1 items-center">
                                <div className="w-12 h-12 rounded-full bg-[#4400CC]/10 flex items-center justify-center text-[#4400CC] font-medium overflow-hidden flex-shrink-0">
                                  {candidatura.candidato_dados?.foto_url ? (
                                    <img
                                      src={candidatura.candidato_dados.foto_url}
                                      alt={candidatoNome}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <span>{getInitials(candidatoNome)}</span>
                                  )}
                                </div>
                                <div className="ml-3 flex-1 min-w-0">
                                  <h4 className="font-medium text-gray-800 truncate">
                                    {candidatoNome}
                                  </h4>
                                  <p className="text-sm text-gray-600 truncate">{candidatoTitulo}</p>
                                  <div className="flex flex-wrap items-center text-sm text-gray-600 mt-1 gap-1">
                                    <Clock size={14} className="flex-shrink-0" />
                                    <span className="whitespace-nowrap">Candidatou-se {getTimeAgo(candidatura.data_candidatura)}</span>
                                    {candidatura.etapa && (
                                      <>
                                        <span>•</span>
                                        <span className="whitespace-nowrap">Etapa {candidatura.etapa}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <Badge
                                className="w-full flex-shrink-0 sm:w-auto"
                                style={{
                                  backgroundColor: getCandidaturaStatusColor(candidatura.status),
                                  color: candidatura.status === 'Aprovado' ? '#4400CC' : 'white'
                                }}
                              >
                                {candidatura.status}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-end">
                              <Button
                                className="w-full sm:w-auto bg-[#00FFAE] hover:bg-[#00FFAE]/80 text-[#4400CC] shadow-[0_0_10px_rgba(0,255,174,0.2)]"
                                onClick={() => handleOpenProfile(candidatura)}
                              >
                                <User size={16} className="mr-2" /> Ver perfil
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
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
                        Mostrando {((currentPage - 1) * candidatosPerPage) + 1} - {Math.min(currentPage * candidatosPerPage, totalCandidaturas)} de {totalCandidaturas.toLocaleString()} candidatos
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Modal do Perfil do Candidato */}
        {selectedCandidatura && (
          <CandidateProfileModal
            isOpen={isProfileModalOpen}
            onClose={() => {
              setIsProfileModalOpen(false)
              setSelectedCandidatura(null)
            }}
            candidatura={selectedCandidatura as any}
            vaga={{
              id: currentVaga.id,
              titulo: currentVaga.titulo,
              empresa_nome: currentVaga.empresa_nome || 'Empresa não informada'
            }}
            onStatusChange={handleCandidaturaStatusChange}
          />
        )}
      </div>
    </ProtectedRoute>
  )
}
