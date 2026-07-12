"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Briefcase, Eye, FileCheck, AlertTriangle, ArrowRight, MapPin, Star, Zap, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useCandidatos } from "@/hooks/use-candidatos"
import { useCandidaturas } from "@/hooks/use-candidaturas"
import { useAuth } from "@/hooks/use-auth"
import { useEstatisticasVisualizacoes } from "@/hooks/use-estatisticas-visualizacoes"
import { useVagasRecomendadas } from "@/hooks/use-vagas-recomendadas"
import { useAtividadesRecentes } from "@/hooks/use-atividades-recentes"
import { useVagasRecentes } from "@/hooks/use-vagas-recentes"
import { Candidato } from "@/lib/candidatos/candidatos-types"
import { CandidaturaModal } from "@/components/CandidaturaModal"
import { VagaCard } from "@/components/VagaCard"
import { formatarTexto } from "@/lib/utils/format-text"
import toast from "react-hot-toast"
import { supabase } from "@/lib/supabase"

export default function Home() {
  const { user } = useAuth()
  const { candidato, loadCandidatoPerfil } = useCandidatos()
  const { candidaturas, loadCandidaturas, candidatarVaga } = useCandidaturas()
  const { estatisticas: estatisticasVisualizacoes, loadEstatisticasVisualizacoes } = useEstatisticasVisualizacoes()
  const { vagasRecomendadas, loadVagasRecomendadas, isLoading: loadingVagas } = useVagasRecomendadas()
  const { atividades, loadAtividadesRecentes, isLoading: loadingAtividades } = useAtividadesRecentes()
  const { vagasRecentes, loadVagasRecentes, isLoading: loadingVagasRecentes } = useVagasRecentes()
  const [curriculoProgress, setCurriculoProgress] = useState(0)
  const [isVerified, setIsVerified] = useState(false)

  // Estados para modal de candidatura
  const [candidaturaModalOpen, setCandidaturaModalOpen] = useState(false)
  const [vagaSelecionada, setVagaSelecionada] = useState<any>(null)
  const [isSubmittingCandidatura, setIsSubmittingCandidatura] = useState(false)
  const [totalCandidaturas, setTotalCandidaturas] = useState(0)
  const [novasEstaSemana, setNovasEstaSemana] = useState(0)

  // Estados para os filtros de busca
  const [searchTerm, setSearchTerm] = useState('')
  const [locationTerm, setLocationTerm] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (user?.id) {
      loadCandidatoPerfil()
    }
  }, [user?.id, loadCandidatoPerfil])

  useEffect(() => {
    if (user?.id) {
      loadCandidaturas(user.id)
    }
  }, [user?.id, loadCandidaturas])

  useEffect(() => {
    if (user?.id) {
      loadEstatisticasVisualizacoes()
    }
  }, [user?.id, loadEstatisticasVisualizacoes])

  useEffect(() => {
    if (user?.id) {
      loadVagasRecomendadas(6) // Carregar 6 vagas recomendadas
    }
  }, [user?.id, loadVagasRecomendadas])

  useEffect(() => {
    if (user?.id) {
      loadAtividadesRecentes(5) // Carregar 5 atividades recentes
    }
  }, [user?.id, loadAtividadesRecentes])

  useEffect(() => {
    loadVagasRecentes(4) // Carregar 4 vagas recentes
  }, [loadVagasRecentes])

  // Recarregar estatísticas quando a página volta ao foco (útil para quando o usuário compartilha o link do currículo)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user?.id) {
        loadEstatisticasVisualizacoes()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [user?.id, loadEstatisticasVisualizacoes])

  useEffect(() => {
    if (candidato) {
      const progress = calcularProgressoCurriculo(candidato)
      setCurriculoProgress(progress)
    }
  }, [candidato])

  // Verificar status da assinatura
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (!user?.id) return

      try {
        const { data: subscription, error } = await supabase
          .from('asaas_subscriptions')
          .select('status, verification_active, verification_expires_at')
          .eq('user_id', user.id)
          .eq('subscription_type', 'CURRICULO_VERIFICACAO')
          .eq('status', 'ACTIVE')
          .eq('verification_active', true)
          .maybeSingle()

        if (!error && subscription) {
          // Verificar se ainda não expirou
          const now = new Date()
          const expiresAt = new Date(subscription.verification_expires_at)
          setIsVerified(expiresAt > now)
        } else {
          setIsVerified(false)
        }
      } catch (error) {
        console.error('Erro ao verificar assinatura:', error)
        setIsVerified(false)
      }
    }

    checkSubscriptionStatus()
  }, [user?.id])

  useEffect(() => {
    // Calcular estatísticas das candidaturas
    setTotalCandidaturas(candidaturas.length)
    
    // Calcular quantas candidaturas são desta semana
    const hoje = new Date()
    const inicioSemana = new Date(hoje)
    inicioSemana.setDate(hoje.getDate() - hoje.getDay()) // Domingo da semana atual
    inicioSemana.setHours(0, 0, 0, 0)
    
    const novas = candidaturas.filter(candidatura => {
      const dataCandidatura = new Date(candidatura.data_candidatura)
      return dataCandidatura >= inicioSemana
    }).length
    
    setNovasEstaSemana(novas)
  }, [candidaturas])

  // Função para calcular o progresso do currículo
  // Conta apenas campos essenciais que todo candidato pode preencher
  const calcularProgressoCurriculo = (candidato: Candidato): number => {
    let totalCampos = 0
    let camposPreenchidos = 0

    // 1. Dados Pessoais Básicos (5 campos essenciais)
    const camposBasicos = ['nome_completo', 'email', 'telefone', 'data_nascimento']
    camposBasicos.forEach(campo => {
      totalCampos++
      if (candidato[campo as keyof Candidato]) {
        camposPreenchidos++
      }
    })

    // Localização (cidade e estado)
    totalCampos++
    if (candidato.endereco?.cidade && candidato.endereco?.estado) {
      camposPreenchidos++
    }

    // 2. Habilitação (1 campo)
    totalCampos++
    if (candidato.possui_cnh) {
      camposPreenchidos++
    }

    // 3. Diversidade (2 campos - mesmo que "prefiro não informar" conta como preenchido)
    totalCampos++
    if (candidato.genero) {
      camposPreenchidos++
    }

    totalCampos++
    if (candidato.raca_etnia) {
      camposPreenchidos++
    }

    // 4. Idiomas (pelo menos 1)
    totalCampos++
    if (candidato.idiomas && candidato.idiomas.length > 0) {
      camposPreenchidos++
    }

    // 5. Formação Acadêmica (pelo menos 1)
    totalCampos++
    if (candidato.formacao && candidato.formacao.length > 0) {
      camposPreenchidos++
    }

    // 6. Disponibilidade
    totalCampos++
    if (candidato.disponibilidade_tipo) {
      camposPreenchidos++
    }

    // 7. Experiência Profissional (pelo menos 1)
    totalCampos++
    if (candidato.experiencias && candidato.experiencias.length > 0) {
      camposPreenchidos++
    }

    // 8. Redes Sociais (pelo menos uma)
    totalCampos++
    if (candidato.linkedin_url || candidato.github_url || candidato.portfolio_url ||
        candidato.site_pessoal || candidato.instagram_url) {
      camposPreenchidos++
    }

    // Total: 13 campos essenciais que qualquer pessoa pode preencher
    const progresso = Math.round((camposPreenchidos / totalCampos) * 100)
    return progresso
  }

  // Função para abrir modal de candidatura
  const handleCandidatarClick = (vaga: any) => {
    setVagaSelecionada(vaga)
    setCandidaturaModalOpen(true)
  }

  // Função para processar candidatura
  const handleConfirmCandidatura = async (vagaId: string, cartaApresentacao?: string) => {
    if (!user?.id) {
      toast.error('Você precisa estar logado para se candidatar')
      return false
    }

    if (!candidato) {
      toast.error('Carregando seu perfil... Aguarde um momento e tente novamente')
      return false
    }

    // Verificar campos obrigatórios
    if (!candidato.nome_completo) {
      toast.error('Por favor, complete seu nome no currículo antes de se candidatar')
      return false
    }

    setIsSubmittingCandidatura(true)

    try {
      const success = await candidatarVaga(vagaId, user.id, cartaApresentacao)
      if (success) {
        setCandidaturaModalOpen(false)
        // Recarregar candidaturas
        loadCandidaturas(user.id)
      }
      return success
    } catch (error: any) {
      console.error('Erro ao candidatar:', error)
      return false
    } finally {
      setIsSubmittingCandidatura(false)
    }
  }

  // Função para lidar com busca
  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchTerm) params.append('busca', searchTerm)
    if (locationTerm) params.append('localizacao', locationTerm)

    router.push(`/candidato/pesquisar-vagas?${params.toString()}`)
  }

  const vagaPrincipal = vagasRecomendadas[0]

  return (
    <ProtectedRoute allowedRoles={['candidato']}>
      <div className="w-full">
      <div className="bg-gradient-to-r from-[#4400CC] to-[#00FFAE] min-h-[168px] sm:min-h-[200px] flex flex-col justify-center px-4 sm:px-6 md:px-10 py-6 shadow-[0_0_20px_rgba(68,0,204,0.3)]">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white break-words">Bem-vindo(a) de volta, {candidato?.nome_completo?.split(' ')[0] || 'Candidato'}</h1>
        <p className="text-base md:text-lg text-white/90 mt-2">Continue sua jornada profissional</p>
      </div>

      {/* Card de Alerta para Completar o Currículo - Só aparece se não estiver 100% completo */}
      {curriculoProgress < 100 && (
        <div className="px-4 sm:px-6 md:px-10 mt-6">
          <div className="bg-gradient-to-r from-orange-100 to-amber-100 border-2 border-orange-400 rounded-lg shadow-lg p-4 animate-pulse-border">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="text-orange-600 h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-orange-800">Atenção! Seu currículo está incompleto</h3>
                <p className="text-orange-700 mt-1">
                  Um currículo completo aumenta em até 3x suas chances de ser contratado. Recrutadores priorizam perfis
                  completos.
                </p>
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-orange-800">Apenas {curriculoProgress}% concluído</span>
                  </div>
                  <div className="w-full bg-orange-200 rounded-full h-2.5">
                    <div className="bg-orange-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${curriculoProgress}%` }}></div>
                  </div>
                </div>
              </div>
              <div className="mt-4 md:mt-0 w-full md:w-auto">
                <Link href="/candidato/curriculo">
                  <Button className="w-full md:w-auto bg-orange-600 hover:bg-orange-700 text-white">
                    Completar agora <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 sm:px-6 md:px-10 mt-6 sm:mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)]">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start">
              <div className="w-12 h-12 rounded-lg bg-[#4400CC]/10 border border-[#4400CC]/20 flex items-center justify-center shadow-[0_0_10px_rgba(68,0,204,0.1)]">
                <Briefcase className="text-[#4400CC]" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Candidaturas recentes</p>
                <p className="text-2xl font-bold text-[#4400CC] mt-1">{totalCandidaturas}</p>
                <p className="text-xs text-gray-500 mt-1">{novasEstaSemana} novas esta semana</p>
              </div>
            </div>
          </CardContent>
        </Card>

{false && (
        <Link href="/candidato/curriculo/visualizacoes">
          <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)] hover:shadow-[0_0_20px_rgba(68,0,204,0.2)] transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-start">
                <div className="w-12 h-12 rounded-lg bg-[#4400CC]/10 border border-[#4400CC]/20 flex items-center justify-center shadow-[0_0_10px_rgba(68,0,204,0.1)]">
                  <Eye className="text-[#4400CC]" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Visualizações do currículo</p>
                  <p className="text-2xl font-bold text-[#4400CC] mt-1">{estatisticasVisualizacoes?.total_visualizacoes || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {estatisticasVisualizacoes?.percentual_crescimento !== undefined
                      ? `${(estatisticasVisualizacoes?.percentual_crescimento ?? 0) > 0 ? '+' : ''}${estatisticasVisualizacoes?.percentual_crescimento ?? 0}% em relação ao mês anterior`
                      : 'Sem dados suficientes'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        )}

        <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)]">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start">
              <div className={`w-12 h-12 rounded-lg border flex items-center justify-center shadow-[0_0_10px_rgba(68,0,204,0.1)] ${
                isVerified
                  ? 'bg-green-50 border-green-200'
                  : 'bg-amber-50 border-amber-200'
              }`}>
                <FileCheck className={isVerified ? 'text-green-600' : 'text-amber-600'} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Status do currículo</p>
                <p className={`text-lg font-bold mt-1 ${isVerified ? 'text-green-600' : 'text-amber-600'}`}>
                  {isVerified ? 'Verificado' : 'Não verificado'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {isVerified ? 'Seu perfil está verificado' : 'Verifique seu perfil para ter mais credibilidade'}
                </p>
                <Link href="/candidato/curriculo/verificar">
                  <button className="mt-2 text-xs font-medium text-[#4400CC] hover:text-[#3300AA] transition-colors">
                    {isVerified ? 'Gerenciar verificação →' : 'Verificar currículo →'}
                  </button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Card de Recomendação de Vagas - OCULTO */}
      {false && (
      <div className="px-4 sm:px-6 md:px-10 mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Vagas recomendadas para o seu perfil</h2>
          <Link href="/candidato/pesquisar-vagas">
            <Button variant="link" className="text-[#4400CC] hover:text-[#3300AA]">
              Ver todas <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="mt-2">
          <p className="text-sm text-gray-600">
            Baseado nas suas habilidades, experiência e preferências de localização
          </p>
        </div>

        {loadingVagas ? (
          <div className="mt-4">
            <Card className="bg-gradient-to-r from-[#4400CC]/5 to-[#00FFAE]/5 border-[#4400CC]/30 shadow-lg">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                  <div className="h-20 bg-gray-300 rounded mt-4"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : vagaPrincipal ? (
          <div className="mt-4">
            {/* Vaga principal (melhor match) */}
            <Card className="bg-gradient-to-r from-[#4400CC]/5 to-[#00FFAE]/5 border-[#4400CC]/30 shadow-lg overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4 bg-gradient-to-r from-[#4400CC]/10 to-[#00FFAE]/10 border-b border-[#4400CC]/20">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-500 mr-2" />
                    <h3 className="font-semibold text-[#4400CC]">
                      {vagaPrincipal.match_score >= 80 ? 'Correspondência de perfil excepcional' :
                       vagaPrincipal.match_score >= 60 ? 'Boa correspondência de perfil' :
                       'Correspondência de perfil moderada'}
                    </h3>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">{vagaPrincipal.titulo}</h3>
                          <p className="text-[#0057FF] font-medium">{vagaPrincipal.empresa_nome || 'Empresa'}</p>
                        </div>
                        <Badge className="bg-[#4400CC] hover:bg-[#4400CC] text-white">
                          {formatarTexto(vagaPrincipal.tipo_contratacao)}
                        </Badge>
                      </div>

                      <div className="flex items-center mt-3">
                        <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                        <span className="text-sm text-gray-600">
                          {vagaPrincipal.cidade}, {vagaPrincipal.estado} • {formatarTexto(vagaPrincipal.modelo_trabalho)}
                        </span>
                      </div>

                      <div className="mt-4">
                        <p className="text-sm text-gray-700">
                          {vagaPrincipal.descricao?.substring(0, 200)}
                          {(vagaPrincipal.descricao?.length ?? 0) > 200 ? '...' : ''}
                        </p>
                      </div>

                      {(vagaPrincipal.requisitos?.length ?? 0) > 0 && (
                        <div className="mt-4">
                          <div className="flex flex-wrap gap-2">
                            {vagaPrincipal.requisitos?.slice(0, 3).map((requisito, idx) => (
                              <Badge key={idx} variant="outline" className="bg-[#4400CC]/5 text-[#4400CC] border-[#4400CC]/30">
                                {requisito}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-5 flex items-center justify-between">
                        <p className="text-[#4400CC] font-bold">
                          {vagaPrincipal.salario_de && vagaPrincipal.salario_ate ?
                            `R$ ${vagaPrincipal.salario_de?.toLocaleString()} - ${vagaPrincipal.salario_ate?.toLocaleString()}` :
                            'Salário a combinar'
                          }
                        </p>
                        <p className="text-sm text-gray-500">
                          {vagaPrincipal.data_publicacao
                            ? `Publicada há ${Math.max(1, Math.floor((Date.now() - new Date(vagaPrincipal.data_publicacao!).getTime()) / (1000 * 60 * 60 * 24)))} dia(s)`
                            : 'Publicação recente'}
                        </p>
                      </div>
                    </div>

                    <div className="md:w-80 flex flex-col">
                      <div className="bg-white rounded-lg border border-[#4400CC]/20 p-5">
                        <h4 className="font-medium text-gray-800 mb-4 text-center">Compatibilidade com seu perfil</h4>

                        <div className="space-y-3">
                          {vagaPrincipal.match_reasons.slice(0, 4).map((reason, idx) => {
                            // Calcular um valor mais realista para cada critério
                            const baseValue = Math.floor(vagaPrincipal.match_score / vagaPrincipal.match_reasons.length)
                            const variation = Math.floor(Math.random() * 20) - 10 // Variação de -10% a +10%
                            const value = Math.max(10, Math.min(100, baseValue + variation))

                            return (
                              <div key={idx}>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-medium text-gray-700 flex-1 pr-2">{reason}</span>
                                  <span className="text-xs font-bold text-[#4400CC] min-w-[35px] text-right">
                                    {value}%
                                  </span>
                                </div>
                                <Progress
                                  value={value}
                                  className="h-2 bg-[#4400CC]/10 [&>div]:bg-[#4400CC]"
                                />
                              </div>
                            )
                          })}
                        </div>

                        <div className="mt-5 pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-center">
                            <Zap className="h-4 w-4 text-yellow-500 mr-2" />
                            <span className="text-sm font-bold text-gray-800">
                              Match: {vagaPrincipal.match_score}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col gap-2">
                        <Link href={`/candidato/pesquisar-vagas/${vagaPrincipal.id}`} className="w-full">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-[#4400CC]/30 text-[#4400CC] hover:bg-[#4400CC]/5 w-full"
                          >
                            Ver detalhes
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          className="bg-[#00FFAE] hover:bg-[#00FFAE]/80 text-[#4400CC] font-medium shadow-[0_0_10px_rgba(0,255,174,0.2)] w-full"
                          onClick={() => handleCandidatarClick(vagaPrincipal)}
                        >
                          Candidatar-se
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Outras vagas recomendadas */}
            {vagasRecomendadas.length > 1 && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {vagasRecomendadas.slice(1, 5).map((vaga, index) => (
                  <Card
                    key={vaga.id}
                    className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)] hover:shadow-[0_0_20px_rgba(68,0,204,0.2)] transition-all"
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-[#4400CC]/10 to-[#0057FF]/10 flex items-center justify-center border border-[#4400CC]/20 overflow-hidden">
                          {vaga.empresa_logo_url ? (
                            <Image
                              src={vaga.empresa_logo_url}
                              alt={`Logo da ${vaga.empresa_nome}`}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                              unoptimized
                            />
                          ) : (
                            <span className="text-lg font-bold text-[#4400CC]">
                              {(vaga.empresa_nome || vaga.titulo || 'V').substring(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium text-gray-800">{vaga.titulo}</h3>
                              <p className="text-sm text-[#0057FF]">{vaga.empresa_nome || 'Empresa'}</p>
                              <p className="text-sm text-gray-600 mt-1">
                                {vaga.cidade}, {vaga.estado} • {formatarTexto(vaga.modelo_trabalho)}
                              </p>
                            </div>
                            <div className="flex items-center bg-[#4400CC]/10 px-2 py-1 rounded-full">
                              <span className="text-xs font-bold text-[#4400CC]">{vaga.match_score}% match</span>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            <span className="text-xs text-gray-600">
                              {vaga.match_reasons[0] || 'Perfil compatível'}
                            </span>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <p className="text-[#4400CC] font-medium">
                              {vaga.salario_de && vaga.salario_ate ?
                            `R$ ${vaga.salario_de.toLocaleString()} - ${vaga.salario_ate.toLocaleString()}` :
                                'Salário a combinar'
                              }
                            </p>
                            <p className="text-xs text-gray-500">
                              {vaga.data_publicacao
                                ? `${Math.max(1, Math.floor((Date.now() - new Date(vaga.data_publicacao).getTime()) / (1000 * 60 * 60 * 24)))} dia(s) atrás`
                                : 'Publicação recente'}
                            </p>
                          </div>
                          <div className="mt-3 flex flex-col sm:flex-row gap-2 justify-start">
                            <Link href={`/candidato/pesquisar-vagas/${vaga.id}`} className="w-full sm:w-auto">
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full sm:w-auto border-[#4400CC]/30 text-[#4400CC] hover:bg-[#4400CC]/5"
                              >
                                Ver detalhes
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              className="w-full sm:w-auto bg-[#00FFAE] hover:bg-[#00FFAE]/80 text-[#4400CC] font-medium shadow-[0_0_10px_rgba(0,255,174,0.2)]"
                              onClick={() => handleCandidatarClick(vaga)}
                            >
                              Candidatar-se
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4">
            <Card className="bg-white border-[#4400CC]/30 shadow-lg">
              <CardContent className="p-6 text-center">
                <Briefcase size={48} className="mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">Nenhuma vaga encontrada</h3>
                <p className="text-gray-600 mb-4">
                  Não encontramos vagas que correspondam ao seu perfil no momento.
                </p>
                <Link href="/candidato/pesquisar-vagas">
                  <Button className="bg-[#4400CC] hover:bg-[#3300AA] text-white">
                    Explorar todas as vagas
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      )}

      {/* Atividades Recentes - OCULTO */}
      {false && (
      <div className="px-4 sm:px-6 md:px-10 mt-8">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Atividades recentes</h2>
        </div>

        {loadingAtividades ? (
          <div className="mt-4 space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-white border-[#4400CC]/30 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
                    <div className="ml-3 flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
                      <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : atividades.length > 0 ? (
          <div className="mt-4 space-y-4">
            {atividades.map((atividade, index) => (
              <Card key={index} className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)] hover:shadow-[0_0_20px_rgba(68,0,204,0.2)] transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#4400CC]/10 to-[#0057FF]/10 flex items-center justify-center">
                      {atividade.tipo === 'visualizacao' ? (
                        <span className="text-sm font-bold text-[#4400CC]">{atividade.icone}</span>
                      ) : atividade.tipo === 'candidatura' ? (
                        <Briefcase size={18} className="text-[#4400CC]" />
                      ) : (
                        <Search size={18} className="text-[#4400CC]" />
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-gray-800">{atividade.titulo}</p>
                        <p className="text-sm text-gray-500 mt-1 sm:mt-0">
                          {(() => {
                            const dataAtividade = new Date(atividade.data)
                            const agora = new Date()
                            const diffDias = Math.floor((agora.getTime() - dataAtividade.getTime()) / (1000 * 60 * 60 * 24))

                            if (diffDias === 0) {
                              return `Hoje às ${dataAtividade.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
                            } else if (diffDias === 1) {
                              return `Ontem às ${dataAtividade.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
                            } else {
                              return `${diffDias} dias atrás`
                            }
                          })()}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="mt-4">
            <Card className="bg-white border-[#4400CC]/30 shadow-lg">
              <CardContent className="p-6 text-center">
                <Search size={48} className="mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">Nenhuma atividade recente</h3>
                <p className="text-gray-600">
                  Suas atividades aparecerão aqui conforme você usar a plataforma.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      )}

      <div className="px-4 sm:px-6 md:px-10 mt-10 pb-10">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Vagas adicionadas recentemente</h2>
        </div>

        {loadingVagasRecentes ? (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-white border-[#4400CC]/30 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start">
                    <div className="w-12 h-12 rounded-lg bg-gray-200 animate-pulse" />
                    <div className="ml-4 flex-1">
                      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2 animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded w-2/3 mb-4 animate-pulse" />
                      <div className="h-10 bg-gray-200 rounded w-full animate-pulse" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : vagasRecentes.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {vagasRecentes.map((vaga) => (
              <VagaCard key={vaga.id} vaga={vaga} />
            ))}
          </div>
        ) : (
          <div className="mt-4">
            <Card className="bg-white border-[#4400CC]/30 shadow-lg">
              <CardContent className="p-6 text-center">
                <Briefcase size={48} className="mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">Nenhuma vaga disponível</h3>
                <p className="text-gray-600">
                  Não há vagas recentes no momento. Volte em breve para conferir as novidades.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>

      {/* Modal de Candidatura */}
      {vagaSelecionada && (
        <CandidaturaModal
          vaga={{
            id: vagaSelecionada.id,
            titulo: vagaSelecionada.titulo,
            empregador: { nome: vagaSelecionada.empresa_nome || 'Empresa' },
            cidade: vagaSelecionada.cidade,
            estado: vagaSelecionada.estado,
            modelo_trabalho: vagaSelecionada.modelo_trabalho,
            salario_de: vagaSelecionada.salario_de,
            salario_ate: vagaSelecionada.salario_ate,
            descricao: vagaSelecionada.descricao
          }}
          isOpen={candidaturaModalOpen}
          onOpenChange={setCandidaturaModalOpen}
          onConfirm={handleConfirmCandidatura}
          isLoading={isSubmittingCandidatura}
        />
      )}
    </ProtectedRoute>
  )
}
