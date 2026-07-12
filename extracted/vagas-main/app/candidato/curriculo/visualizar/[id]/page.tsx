"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { PDFGeneratorService } from "@/lib/services/pdf-generator-service"
import {
  ChevronRight,
  Download,
  Mail,
  Phone,
  MapPin,
  Globe,
  Calendar,
  ArrowLeft,
  FileText,
  User,
  Linkedin,
  Github,
  Instagram,
  Facebook,
  Youtube,
  Eye,
  Car,
  Award,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useCandidatos } from "@/hooks/use-candidatos"
import { Candidato } from "@/lib/candidatos/candidatos-types"
import { useAuth } from "@/hooks/use-auth"
import { candidatosApiService } from "@/lib/api/candidatos-api"
import { supabase } from "@/lib/supabase"

export default function ViewPublicResume() {
  const params = useParams()
  const candidatoId = params.id as string
  const [candidato, setCandidato] = useState<Candidato | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isVerified, setIsVerified] = useState(false)

  const { loadCandidatoPublico } = useCandidatos()
  const { user } = useAuth()

  const handleDownloadPDF = async () => {
    if (!candidato) return

    try {
      const pdfService = new PDFGeneratorService()
      await pdfService.generatePDF(candidato)
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      alert('Erro ao gerar o PDF. Por favor, tente novamente.')
    }
  }

  // Verificar status da assinatura
  const checkSubscriptionStatus = async (userId: string) => {
    try {
      const { data: subscription, error } = await supabase
        .from('asaas_subscriptions')
        .select('status, verification_active, verification_expires_at')
        .eq('user_id', userId)
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

  useEffect(() => {
    const loadCandidato = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const candidatoData = await loadCandidatoPublico(candidatoId)

        if (!candidatoData) {
          setError('Candidato não encontrado ou não está público')
          setCandidato(null)
        } else {
          setCandidato(candidatoData)

          // Verificar status da assinatura
          if (candidatoData.user_id) {
            await checkSubscriptionStatus(candidatoData.user_id)
          }

          // Registrar visualização se não for o proprietário do currículo
          if (user?.id && user.id !== candidatoId) {
            try {
              await candidatosApiService.registrarVisualizacaoCurriculo(candidatoId, user.id)
            } catch (error) {
              console.error('Erro ao registrar visualização:', error)
            }
          } else if (!user?.id) {
            // Para visitantes não logados, criar um ID único
            const visitorId = `visitor_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
            try {
              await candidatosApiService.registrarVisualizacaoCurriculo(candidatoId, visitorId)
            } catch (error) {
              console.error('Erro ao registrar visualização de visitante:', error)
            }
          }
        }
      } catch (err) {
        console.error('Erro ao carregar candidato:', err)
        setError('Erro ao carregar os dados do candidato')
        setCandidato(null)
      } finally {
        setIsLoading(false)
      }
    }

    if (candidatoId) {
      loadCandidato()
    }
  }, [candidatoId, loadCandidatoPublico, user?.id])

  // Skeleton de carregamento
  if (isLoading) {
    return (
      <div className="w-full pb-16">
        {/* Banner Skeleton */}
        <div className="bg-gradient-to-r from-[#4400CC] to-[#00FFAE] min-h-[144px] sm:min-h-[160px] flex flex-col justify-center px-4 sm:px-6 md:px-10 py-6">
          <Skeleton className="h-8 w-64 bg-white/20 mb-2" />
          <Skeleton className="h-5 w-96 bg-white/20" />
        </div>

        {/* Breadcrumb Skeleton */}
        <div className="px-4 sm:px-6 md:px-10 py-4">
          <Skeleton className="h-5 w-48" />
        </div>

        {/* Content Skeleton */}
        <div className="px-4 sm:px-6 md:px-10">
          <Card>
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-64 flex-shrink-0">
                  <div className="flex flex-col items-center">
                    <Skeleton className="w-40 h-40 rounded-full mb-4" />
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-5 w-24 mb-2" />
                    <Skeleton className="h-6 w-20 mb-6" />
                    <div className="space-y-2 w-full">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Skeleton key={i} className="h-4 w-full" />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="space-y-6">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i}>
                        <Skeleton className="h-6 w-48 mb-4" />
                        <Skeleton className="h-32 w-full" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Estado de erro
  if (error || !candidato) {
    return (
      <div className="w-full pb-16">
        <div className="bg-gradient-to-r from-[#4400CC] to-[#00FFAE] min-h-[144px] sm:min-h-[160px] flex flex-col justify-center px-4 sm:px-6 md:px-10 py-6">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">Currículo não encontrado</h1>
          <p className="text-base md:text-lg text-white/80 mt-2">O currículo solicitado não foi encontrado ou não está público</p>
        </div>

        <div className="px-4 sm:px-6 md:px-10 py-4">
          <Link href="/" className="text-[#4400CC] hover:text-[#3300AA] flex items-center">
            <ArrowLeft size={14} className="mr-1" />
            Voltar ao início
          </Link>
        </div>

        <div className="px-4 sm:px-6 md:px-10">
          <Card>
            <CardContent className="p-8 text-center">
              <FileText size={64} className="mx-auto mb-4 text-gray-300" />
              <h2 className="text-xl font-medium text-gray-800 mb-2">Currículo não disponível</h2>
              <p className="text-gray-600 mb-4">
                Este currículo pode ter sido removido, tornado privado ou o link pode estar incorreto.
              </p>
              <Link href="/">
                <Button className="bg-[#4400CC] hover:bg-[#3300AA] text-white">
                  Ir para página inicial
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Verificar se o perfil é público
  if (candidato.visibilidade_perfil !== 'publico') {
    return (
      <div className="w-full pb-16">
        <div className="bg-gradient-to-r from-[#4400CC] to-[#00FFAE] min-h-[144px] sm:min-h-[160px] flex flex-col justify-center px-4 sm:px-6 md:px-10 py-6">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">Currículo privado</h1>
          <p className="text-base md:text-lg text-white/80 mt-2">Este currículo não está disponível publicamente</p>
        </div>

        <div className="px-4 sm:px-6 md:px-10 py-4">
          <Link href="/" className="text-[#4400CC] hover:text-[#3300AA] flex items-center">
            <ArrowLeft size={14} className="mr-1" />
            Voltar ao início
          </Link>
        </div>

        <div className="px-4 sm:px-6 md:px-10">
          <Card>
            <CardContent className="p-8 text-center">
              <User size={64} className="mx-auto mb-4 text-gray-300" />
              <h2 className="text-xl font-medium text-gray-800 mb-2">Perfil privado</h2>
              <p className="text-gray-600 mb-4">
                O candidato optou por manter seu currículo privado.
              </p>
              <Link href="/">
                <Button className="bg-[#4400CC] hover:bg-[#3300AA] text-white">
                  Ir para página inicial
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full pb-16">
      {/* Banner com gradiente roxo-azul neon */}
      <div className="bg-gradient-to-r from-[#4400CC] to-[#00FFAE] min-h-[144px] sm:min-h-[160px] flex flex-col justify-center px-4 sm:px-6 md:px-10 py-6 shadow-[0_0_20px_rgba(68,0,204,0.3)]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">Currículo {candidato.nome_completo}</h1>
            <p className="text-base md:text-lg text-white/80 mt-2">Perfil público disponível para recrutadores</p>
          </div>
          <div className="flex space-x-2 mt-4 md:mt-0">
            <Button
              onClick={handleDownloadPDF}
              className="bg-[#0057FF] hover:bg-[#0044CC] text-white shadow-[0_0_10px_rgba(0,87,255,0.2)]"
            >
              <Download size={16} className="mr-2" /> Baixar PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="px-4 sm:px-6 md:px-10 py-4 flex items-center text-sm min-w-0 overflow-hidden">
        <Link href="/" className="text-[#4400CC] hover:text-[#3300AA] flex items-center">
          <ArrowLeft size={14} className="mr-1" />
          Página inicial
        </Link>
        <ChevronRight size={14} className="mx-2 text-gray-400" />
        <span className="text-gray-600">Currículo</span>
        <ChevronRight size={14} className="mx-2 text-gray-400" />
        <span className="text-gray-600">{candidato.nome_completo}</span>
      </div>

      {/* Visualização do currículo */}
      <div className="px-4 sm:px-6 md:px-10">
        <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)]">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Bloco lateral com foto de perfil */}
              <div className="w-full md:w-64 flex-shrink-0">
                <div className="flex flex-col items-center">
                  {/* Foto de perfil */}
                  <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-[#4400CC]/20 shadow-lg mb-4 bg-gray-100 flex items-center justify-center">
                    {candidato.foto_url ? (
                      <Image
                        src={candidato.foto_url}
                        alt="Foto de perfil"
                        width={160}
                        height={160}
                        className="w-full h-full object-cover object-center"
                      />
                    ) : (
                      <User size={64} className="text-gray-400" />
                    )}
                  </div>

                  {/* Nome e profissão */}
                  <h2 className="text-2xl font-bold text-gray-800 text-center">{candidato.nome_completo}</h2>
                  <p className="text-lg text-[#4400CC] font-medium mb-2 text-center">{candidato.titulo_profissional}</p>

                  {/* Status de verificado */}
                  {isVerified ? (
                    <div className="flex items-center bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium mb-6">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1.5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Verificado
                    </div>
                  ) : (
                    <div className="flex items-center bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full text-sm font-medium mb-6">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1.5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Não verificado
                    </div>
                  )}

                  {/* Informações de contato */}
                  <div className="w-full space-y-2 border-t border-gray-200 pt-4">
                    <div className="flex items-center text-gray-600">
                      <Mail size={14} className="text-[#4400CC] mr-2" />
                      <span>{candidato.email}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Phone size={14} className="text-[#4400CC] mr-2" />
                      <span>{candidato.telefone}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin size={14} className="text-[#4400CC] mr-2" />
                      <span>{candidato.endereco?.cidade}, {candidato.endereco?.estado}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Conteúdo principal do currículo */}
              <div className="flex-1">
                <Separator className="my-6 bg-[#4400CC]/10" />

                {/* Resumo profissional */}
                {candidato.bio && (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-[#4400CC] mb-3">Sobre</h3>
                    <p className="text-gray-700">{candidato.bio}</p>
                  </div>
                )}

                {/* Redes Sociais */}
                {(candidato.linkedin_url || candidato.github_url || candidato.portfolio_url ||
                  candidato.site_pessoal || candidato.instagram_url || candidato.facebook_url ||
                  candidato.youtube_url) && (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-[#4400CC] mb-4">Redes Sociais e Portfólio</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {candidato.linkedin_url && (
                        <a
                          href={candidato.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 border border-[#4400CC]/20 rounded-lg bg-[#4400CC]/5 hover:bg-[#4400CC]/10 transition-colors flex items-center gap-3"
                        >
                          <Linkedin size={20} className="text-[#0077B5]" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">LinkedIn</p>
                            <p className="text-sm text-gray-600 truncate">{candidato.linkedin_url.replace('https://', '').replace('http://', '')}</p>
                          </div>
                        </a>
                      )}
                      {candidato.github_url && (
                        <a
                          href={candidato.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 border border-[#4400CC]/20 rounded-lg bg-[#4400CC]/5 hover:bg-[#4400CC]/10 transition-colors flex items-center gap-3"
                        >
                          <Github size={20} className="text-gray-800" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">GitHub</p>
                            <p className="text-sm text-gray-600 truncate">{candidato.github_url.replace('https://', '').replace('http://', '')}</p>
                          </div>
                        </a>
                      )}
                      {(candidato.portfolio_url || candidato.site_pessoal) && (
                        <a
                          href={candidato.portfolio_url || candidato.site_pessoal}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 border border-[#4400CC]/20 rounded-lg bg-[#4400CC]/5 hover:bg-[#4400CC]/10 transition-colors flex items-center gap-3"
                        >
                          <Globe size={20} className="text-[#4400CC]" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">Site/Portfólio</p>
                            <p className="text-sm text-gray-600 truncate">{(candidato.portfolio_url || candidato.site_pessoal)?.replace('https://', '').replace('http://', '')}</p>
                          </div>
                        </a>
                      )}
                      {candidato.instagram_url && (
                        <a
                          href={candidato.instagram_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 border border-[#4400CC]/20 rounded-lg bg-[#4400CC]/5 hover:bg-[#4400CC]/10 transition-colors flex items-center gap-3"
                        >
                          <Instagram size={20} className="text-[#E4405F]" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">Instagram</p>
                            <p className="text-sm text-gray-600 truncate">{candidato.instagram_url.replace('https://', '').replace('http://', '')}</p>
                          </div>
                        </a>
                      )}
                      {candidato.facebook_url && (
                        <a
                          href={candidato.facebook_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 border border-[#4400CC]/20 rounded-lg bg-[#4400CC]/5 hover:bg-[#4400CC]/10 transition-colors flex items-center gap-3"
                        >
                          <Facebook size={20} className="text-[#1877F2]" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">Facebook</p>
                            <p className="text-sm text-gray-600 truncate">{candidato.facebook_url.replace('https://', '').replace('http://', '')}</p>
                          </div>
                        </a>
                      )}
                      {candidato.youtube_url && (
                        <a
                          href={candidato.youtube_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 border border-[#4400CC]/20 rounded-lg bg-[#4400CC]/5 hover:bg-[#4400CC]/10 transition-colors flex items-center gap-3"
                        >
                          <Youtube size={20} className="text-[#FF0000]" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">YouTube</p>
                            <p className="text-sm text-gray-600 truncate">{candidato.youtube_url.replace('https://', '').replace('http://', '')}</p>
                          </div>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Experiência profissional */}
                {candidato.experiencias && candidato.experiencias.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-[#4400CC] mb-4">Experiência Profissional</h3>
                    {candidato.experiencias.map((exp, index) => (
                      <div key={index} className="p-4 border border-[#4400CC]/20 rounded-lg bg-[#4400CC]/5 mb-4">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                          <div>
                            <h4 className="font-medium text-gray-800">{exp.cargo}</h4>
                            <p className="text-[#0057FF] font-medium">{exp.empresa}</p>
                            {exp.localizacao && (
                              <p className="text-sm text-gray-600 flex items-center mt-1">
                                <MapPin size={12} className="mr-1" />
                                {exp.localizacao}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center mt-2 md:mt-0 text-gray-600">
                            <Calendar size={14} className="mr-1" />
                            <span>
                              {new Date(exp.data_inicio).toLocaleDateString('pt-BR', {
                                month: 'short',
                                year: 'numeric'
                              })} - {exp.data_fim ? new Date(exp.data_fim).toLocaleDateString('pt-BR', {
                                month: 'short',
                                year: 'numeric'
                              }) : 'Atual'}
                            </span>
                          </div>
                        </div>
                        {exp.descricao && (
                          <p className="text-gray-700 mt-2">{exp.descricao}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Formação acadêmica */}
                {candidato.formacao && candidato.formacao.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-[#4400CC] mb-4">Formação Acadêmica</h3>
                    {candidato.formacao.map((form, index) => (
                      <div key={index} className="p-4 border border-[#4400CC]/20 rounded-lg bg-[#4400CC]/5 mb-4">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                          <div>
                            <h4 className="font-medium text-gray-800">{form.curso}</h4>
                            <p className="text-[#4400CC] font-medium">{form.instituicao}</p>
                          </div>
                          <div className="flex items-center mt-2 md:mt-0 text-gray-600">
                            <span className="capitalize">{form.nivel.replace('_', ' ')} • {form.status}</span>
                          </div>
                        </div>
                        {(form.data_inicio || form.data_fim) && (
                          <div className="flex items-center mt-2 text-gray-600">
                            <Calendar size={14} className="mr-1" />
                            <span>
                              {form.data_inicio && new Date(form.data_inicio).toLocaleDateString('pt-BR', {
                                month: 'short',
                                year: 'numeric'
                              })} - {form.data_fim ? new Date(form.data_fim).toLocaleDateString('pt-BR', {
                                month: 'short',
                                year: 'numeric'
                              }) : 'Presente'}
                            </span>
                          </div>
                        )}
                        {form.descricao && (
                          <p className="text-gray-700 mt-2 text-sm">{form.descricao}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Certificações */}
                {candidato.certificacoes && candidato.certificacoes.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-[#4400CC] mb-4">Certificações</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {candidato.certificacoes.map((cert, index) => (
                        <div key={index} className="p-4 border border-[#4400CC]/20 rounded-lg bg-[#4400CC]/5">
                          <div className="flex items-start gap-3">
                            <Award size={20} className="text-[#4400CC] mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-800">{cert.nome}</h4>
                              <p className="text-sm text-gray-600">{cert.instituicao}</p>
                              {cert.data_obtencao && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Obtido em: {new Date(cert.data_obtencao).toLocaleDateString('pt-BR', {
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </p>
                              )}
                              {cert.credencial_url && (
                                <a
                                  href={cert.credencial_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-[#4400CC] hover:underline mt-1 inline-block"
                                >
                                  Ver credencial
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Habilidades técnicas */}
                {candidato.habilidades_tecnicas && candidato.habilidades_tecnicas.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-[#4400CC] mb-4">Habilidades Técnicas</h3>
                    <div className="flex flex-wrap gap-2">
                      {candidato.habilidades_tecnicas.map((habilidade, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-[#4400CC]/10 text-[#4400CC] rounded-full text-sm font-medium"
                        >
                          {habilidade}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Idiomas */}
                {candidato.idiomas && candidato.idiomas.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-[#4400CC] mb-4">Idiomas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {candidato.idiomas.map((idioma, index) => (
                        <div key={index} className="p-4 border border-[#4400CC]/20 rounded-lg bg-[#4400CC]/5">
                          <div className="flex justify-between items-center">
                            <p className="font-medium text-gray-800 capitalize">{idioma.idioma}</p>
                            <p className="text-gray-600 capitalize">{idioma.nivel}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Diversidade */}
                {(candidato.genero || candidato.raca_etnia || candidato.orientacao_sexual || candidato.pcd) && (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-[#4400CC] mb-4">Informações de Diversidade</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {candidato.genero && (
                        <div className="p-4 border border-[#4400CC]/20 rounded-lg bg-[#4400CC]/5">
                          <p className="font-medium text-gray-800">Gênero</p>
                          <p className="text-gray-600 capitalize">{candidato.genero}</p>
                        </div>
                      )}
                      {candidato.raca_etnia && (
                        <div className="p-4 border border-[#4400CC]/20 rounded-lg bg-[#4400CC]/5">
                          <p className="font-medium text-gray-800">Raça/Etnia</p>
                          <p className="text-gray-600 capitalize">{candidato.raca_etnia}</p>
                        </div>
                      )}
                      {candidato.orientacao_sexual && (
                        <div className="p-4 border border-[#4400CC]/20 rounded-lg bg-[#4400CC]/5">
                          <p className="font-medium text-gray-800">Orientação Sexual</p>
                          <p className="text-gray-600 capitalize">{candidato.orientacao_sexual}</p>
                        </div>
                      )}
                      {candidato.pcd && (
                        <div className="p-4 border border-[#4400CC]/20 rounded-lg bg-[#4400CC]/5">
                          <p className="font-medium text-gray-800">Pessoa com Deficiência (PcD)</p>
                          <p className="text-gray-600 capitalize">{candidato.pcd}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Habilitação (CNH) */}
                {(candidato.possui_cnh || candidato.categoria_cnh || candidato.veiculo_proprio) && (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-[#4400CC] mb-4">Habilitação</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {candidato.possui_cnh && (
                        <div className="p-4 border border-[#4400CC]/20 rounded-lg bg-[#4400CC]/5">
                          <div className="flex items-center gap-2 mb-1">
                            <Car size={16} className="text-[#4400CC]" />
                            <p className="font-medium text-gray-800">Possui CNH</p>
                          </div>
                          <p className="text-gray-600 capitalize">{candidato.possui_cnh}</p>
                        </div>
                      )}
                      {candidato.categoria_cnh && (
                        <div className="p-4 border border-[#4400CC]/20 rounded-lg bg-[#4400CC]/5">
                          <p className="font-medium text-gray-800">Categoria</p>
                          <p className="text-gray-600">{candidato.categoria_cnh}</p>
                        </div>
                      )}
                      {candidato.veiculo_proprio && (
                        <div className="p-4 border border-[#4400CC]/20 rounded-lg bg-[#4400CC]/5">
                          <p className="font-medium text-gray-800">Veículo Próprio</p>
                          <p className="text-gray-600 capitalize">{candidato.veiculo_proprio}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Disponibilidade */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-[#4400CC] mb-4">Disponibilidade</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Disponibilidade para mudança */}
                    {(candidato.mudanca_cidade || candidato.mudanca_estado || candidato.mudanca_pais) && (
                      <div className="space-y-3">
                        <p className="font-medium text-gray-800">Disponibilidade para mudança</p>
                        <div className="space-y-2">
                          {candidato.mudanca_cidade && (
                            <div className="flex items-center">
                              <div className="w-4 h-4 rounded-sm bg-[#4400CC] mr-2 flex items-center justify-center">
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
                                  className="text-white"
                                >
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              </div>
                              <p className="text-gray-700">Disponível para mudar de cidade</p>
                            </div>
                          )}
                          {candidato.mudanca_estado && (
                            <div className="flex items-center">
                              <div className="w-4 h-4 rounded-sm bg-[#4400CC] mr-2 flex items-center justify-center">
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
                                  className="text-white"
                                >
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              </div>
                              <p className="text-gray-700">Disponível para mudar de estado</p>
                            </div>
                          )}
                          {candidato.mudanca_pais && (
                            <div className="flex items-center">
                              <div className="w-4 h-4 rounded-sm bg-[#4400CC] mr-2 flex items-center justify-center">
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
                                  className="text-white"
                                >
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              </div>
                              <p className="text-gray-700">Disponível para mudar de país</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Modalidade de trabalho */}
                    {(candidato.aceita_presencial || candidato.aceita_hibrido || candidato.aceita_remoto) && (
                      <div className="space-y-3">
                        <p className="font-medium text-gray-800">Modalidade de trabalho</p>
                        <div className="space-y-2">
                          {candidato.aceita_presencial && (
                            <div className="flex items-center">
                              <div className="w-4 h-4 rounded-sm bg-[#4400CC] mr-2 flex items-center justify-center">
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
                                  className="text-white"
                                >
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              </div>
                              <p className="text-gray-700">Presencial</p>
                            </div>
                          )}
                          {candidato.aceita_hibrido && (
                            <div className="flex items-center">
                              <div className="w-4 h-4 rounded-sm bg-[#4400CC] mr-2 flex items-center justify-center">
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
                                  className="text-white"
                                >
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              </div>
                              <p className="text-gray-700">Híbrido</p>
                            </div>
                          )}
                          {candidato.aceita_remoto && (
                            <div className="flex items-center">
                              <div className="w-4 h-4 rounded-sm bg-[#4400CC] mr-2 flex items-center justify-center">
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
                                  className="text-white"
                                >
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              </div>
                              <p className="text-gray-700">Remoto</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Currículo PDF */}
                {candidato.curriculo_pdf_url && (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-[#4400CC] mb-4">Currículo em PDF</h3>
                    <div className="p-4 border border-[#4400CC]/20 rounded-lg bg-[#4400CC]/5 flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText size={20} className="text-[#4400CC] mr-3" />
                        <div>
                          <p className="font-medium text-gray-800">{candidato.curriculo_pdf_nome || 'curriculo.pdf'}</p>
                          <p className="text-sm text-gray-600">Documento anexado pelo candidato</p>
                        </div>
                      </div>
                      <a
                        href={candidato.curriculo_pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" className="border-[#4400CC] text-[#4400CC] hover:bg-[#4400CC] hover:text-white">
                          <Eye size={16} className="mr-2" /> Visualizar PDF
                        </Button>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
