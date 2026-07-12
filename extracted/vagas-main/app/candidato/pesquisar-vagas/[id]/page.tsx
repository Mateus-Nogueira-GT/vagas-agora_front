"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  ChevronRight,
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  Building,
  Users,
  Share2,
  CalendarClock,
  FileText,
  Coffee,
  Bus,
  CheckCircle2,
  Upload,
  Star,
  Gift,
  Utensils,
  Percent,
  Mail,
  Phone,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { vagasApiService } from "@/lib/api/vagas-api"
import { InteractiveButtons } from "@/components/interactive-buttons"
import { HeaderButtons } from "@/components/header-buttons"
import { RastreadorVisualizacao } from "@/components/rastreador-visualizacao"
import { DocumentUpload } from "@/components/DocumentUpload"
import { formatarTexto } from "@/lib/utils/format-text"
import { formatarParaWhatsApp } from "@/lib/utils/format-phone"
import { JobDetailsSkeleton } from "@/components/job-details-skeleton"

export default function JobDetails() {
  const params = useParams()
  const id = params?.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [vaga, setVaga] = useState<any>(null)
  const [vagasSimilares, setVagasSimilares] = useState<any[]>([])
  const [estatisticas, setEstatisticas] = useState<any>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) return

    const loadVagaData = async () => {
      try {
        setIsLoading(true)

        // Buscar dados da vaga primeiro (mais importante)
        const vagaData = await vagasApiService.getVagaPublicaById(id)

        if (!vagaData) {
          setNotFound(true)
          setIsLoading(false)
          return
        }

        setVaga(vagaData)
        setIsLoading(false)

        // Buscar dados adicionais em paralelo (menos crítico)
        Promise.all([
          vagasApiService.getVagasSimilares(id, 3),
          vagasApiService.getEstatisticasVaga(id)
        ]).then(([similares, stats]) => {
          setVagasSimilares(similares)
          setEstatisticas(stats)
        }).catch(err => {
          console.error('Erro ao carregar dados adicionais:', err)
        })
      } catch (error) {
        console.error('Erro ao carregar vaga:', error)
        setNotFound(true)
        setIsLoading(false)
      }
    }

    loadVagaData()
  }, [id])

  // Função para formatar salário
  const formatSalario = (de?: number, ate?: number) => {
    if (!de && !ate) return "A combinar"
    if (de && ate) return `R$ ${de.toLocaleString()} - R$ ${ate.toLocaleString()}`
    if (de) return `A partir de R$ ${de.toLocaleString()}`
    if (ate) return `Até R$ ${ate.toLocaleString()}`
    return "A combinar"
  }

  // Função para calcular dias publicada
  const getDiasPublicada = (dataPublicacao?: string) => {
    if (!dataPublicacao) return "Recém publicada"
    const dias = Math.floor((new Date().getTime() - new Date(dataPublicacao).getTime()) / (1000 * 60 * 60 * 24))
    if (dias === 0) return "Publicada hoje"
    if (dias === 1) return "Publicada há 1 dia"
    return `Publicada há ${dias} dias`
  }

  // Função para gerar cor do avatar baseada no nome da empresa
  const getAvatarGradient = (companyName?: string) => {
    if (!companyName) return "from-white/10 to-white/20"

    const gradients = [
      "from-white/10 to-white/20",
      "from-blue-500/20 to-purple-500/20",
      "from-green-500/20 to-blue-500/20",
      "from-purple-500/20 to-pink-500/20",
      "from-orange-500/20 to-red-500/20",
      "from-teal-500/20 to-green-500/20"
    ]

    // Usar o código de hash do nome para escolher um gradiente consistente
    const hash = companyName.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)

    return gradients[Math.abs(hash) % gradients.length]
  }

  // Mostrar skeleton enquanto carrega
  if (isLoading) {
    return <JobDetailsSkeleton />
  }

  // Mostrar 404 se não encontrou
  if (notFound || !vaga) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Vaga não encontrada</h1>
          <p className="text-gray-600 mb-8">A vaga que você está procurando não existe ou foi removida.</p>
          <Link href="/candidato/pesquisar-vagas">
            <Button>Voltar para pesquisa de vagas</Button>
          </Link>
        </div>
      </div>
    )
  }

  const job = {
    id: vaga.id,
    title: vaga.titulo,
    company: vaga.empresa_nome || "Empresa não informada",
    companyLogo: vaga.empresa_logo_url || null,
    location: vaga.localizacao || `${vaga.cidade || ""}, ${vaga.estado || ""}`.replace(", ,", "").trim() || "Localização não informada",
    employees: "Informação não disponível",
    posted: getDiasPublicada(vaga.data_publicacao),
    description: vaga.descricao || "Descrição não disponível",
    salary: formatSalario(vaga.salario_de, vaga.salario_ate),
    contractType: formatarTexto(vaga.tipo_contratacao),
    workModel: formatarTexto(vaga.modelo_trabalho),
    level: formatarTexto(vaga.nivel),
    deadline: vaga.data_expiracao ? `Até ${new Date(vaga.data_expiracao).toLocaleDateString('pt-BR')}` : "Não definido",
    differentials: vaga.diferenciais && vaga.diferenciais.length > 0 ? vaga.diferenciais : [
      "Informações de diferenciais não disponíveis"
    ],
    responsibilities: vaga.responsabilidades && vaga.responsabilidades.length > 0 ? vaga.responsabilidades : [
      "Responsabilidades não informadas"
    ],
    requirements: {
      mandatory: vaga.requisitos && vaga.requisitos.length > 0 ? vaga.requisitos : ["Requisitos não informados"],
      desirable: vaga.diferenciais && vaga.diferenciais.length > 0 ? vaga.diferenciais : [],
    },
    benefits: vaga.beneficios && vaga.beneficios.length > 0 ? vaga.beneficios : ["Benefícios não informados"],
    compatibility: estatisticas ? `${Math.min(95, Math.max(70, 85 + (estatisticas.candidaturas_total > 5 ? -5 : 5)))}%` : "87%",
    responseTime: "Resposta em até 3 dias",
    tags: [
      ...(vaga.modelo_trabalho === "Remoto" ? ["Trabalho remoto"] : []),
      ...(vaga.modelo_trabalho === "Híbrido" ? ["Trabalho híbrido"] : []),
      ...(vaga.tipo_contratacao === "CLT" ? ["Regime CLT"] : []),
      ...(vaga.nivel ? [`Nível ${vaga.nivel}`] : []),
    ],
    companyInfo: {
      name: vaga.empresa_nome || "Empresa não informada",
      description: vaga.empresa_descricao || "Informações sobre a empresa não disponíveis",
      sector: vaga.empresa_setor || "Setor não informado",
      size: "Informação não disponível",
      founded: "Informação não disponível",
      website: vaga.empresa_site,
      logo: vaga.empresa_logo_url || null
    },
    similarJobs: vagasSimilares.map(v => ({
      id: v.id,
      title: v.titulo,
      company: v.empresa_nome || "Empresa não informada",
      location: v.localizacao || `${v.cidade || ""}, ${v.estado || ""}`.replace(", ,", "").trim() || "Localização não informada",
    })),
    stats: estatisticas
  }

  return (
    <div className="w-full pb-24">
      {/* Rastreador de visualização */}
      <RastreadorVisualizacao vagaId={id} />

      {/* Cabeçalho da empresa */}
      <div className="bg-[#4400CC] p-4 sm:p-6 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="flex items-center min-w-0">
          <div className={`w-16 h-16 md:w-20 md:h-20 rounded-xl ${job.companyLogo ? 'bg-white' : `bg-gradient-to-r ${getAvatarGradient(job.company)}`} flex items-center justify-center mr-4 border border-white/20 overflow-hidden`}>
            {job.companyLogo ? (
              <Image
                src={job.companyLogo}
                alt={`Logo da ${job.company}`}
                width={80}
                height={80}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <span className="text-2xl md:text-3xl font-bold text-white">
                {job.company?.charAt(0)?.toUpperCase() || 'E'}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-white break-words">{job.company}</h1>
            <div className="flex flex-wrap items-center gap-x-1 text-white/80 text-sm">
              <MapPin size={14} className="mr-1" />
              <span>{job.location}</span>
              <span className="mx-2">•</span>
              <Users size={14} className="mr-1" />
              <span>{job.employees}</span>
            </div>
          </div>
        </div>
        <HeaderButtons vaga={{
          id: vaga.id,
          titulo: vaga.titulo,
          empregador: vaga.empresa_nome ? { nome: vaga.empresa_nome } : undefined,
          cidade: vaga.cidade,
          estado: vaga.estado,
          modelo_trabalho: vaga.modelo_trabalho,
          salario_de: vaga.salario_de,
          salario_ate: vaga.salario_ate,
          descricao: vaga.descricao
        }} />
      </div>

      <div className="px-4 sm:px-6 md:px-10 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Coluna principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Título e salário */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{job.title}</h2>
              <p className="text-xl font-bold text-[#4400CC] mt-2">
                {job.salary} <span className="text-sm font-normal text-gray-500">/mês</span>
              </p>
            </div>

            {/* Cards de informações principais */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border border-gray-200">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <Briefcase className="h-6 w-6 text-[#4400CC] mb-2" />
                  <p className="text-sm text-gray-500">Tipo de contrato</p>
                  <p className="font-medium">{job.contractType}</p>
                </CardContent>
              </Card>

              <Card className="border border-gray-200">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <Building className="h-6 w-6 text-[#4400CC] mb-2" />
                  <p className="text-sm text-gray-500">Modelo de trabalho</p>
                  <p className="font-medium">{job.workModel}</p>
                </CardContent>
              </Card>

              <Card className="border border-gray-200">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <CalendarClock className="h-6 w-6 text-[#4400CC] mb-2" />
                  <p className="text-sm text-gray-500">Prazo para candidatura</p>
                  <p className="font-medium">{job.deadline}</p>
                </CardContent>
              </Card>
            </div>

            {/* Tags e informações adicionais */}
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {job.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-[#4400CC]/5 border-[#4400CC]/20 text-[#4400CC] px-3 py-1 rounded-full"
                  >
                    {tag === "Também para PCD" && <CheckCircle2 size={14} className="mr-1" />}
                    {tag === "Horário flexível" && <Clock size={14} className="mr-1" />}
                    {tag === "Alimentação" && <Coffee size={14} className="mr-1" />}
                    {tag === "Vale transporte" && <Bus size={14} className="mr-1" />}
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                <div className="flex items-center text-green-600">
                  <CheckCircle2 size={16} className="mr-1" />
                  <span>{job.compatibility} de compatibilidade</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <Clock size={16} className="mr-1" />
                  <span>{job.responseTime}</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <FileText size={16} className="mr-1" />
                  <span>{job.posted}</span>
                </div>
              </div>
            </div>

            {/* Descrição da vaga */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Descrição da Vaga</h3>
              <p className="text-gray-700">{job.description}</p>
            </div>

            {/* Diferenciais */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Star className="text-[#4400CC] mr-2" size={18} />
                Diferenciais da vaga
              </h3>
              <ul className="space-y-2">
                {job.differentials.map((item: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle2 size={18} className="text-[#4400CC] mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Responsabilidades */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Responsabilidades</h3>
              <ul className="space-y-3">
                {job.responsibilities.map((item: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#4400CC]/10 flex items-center justify-center mr-3">
                      <ChevronRight size={16} className="text-[#4400CC]" />
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Requisitos */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Requisitos</h3>

              {job.requirements.mandatory && job.requirements.mandatory.length > 0 && job.requirements.mandatory[0] !== "Requisitos não informados" && (
                <div className="bg-[#4400CC]/5 p-4 rounded-lg mb-4">
                  <h4 className="font-medium text-[#4400CC] mb-3 flex items-center">
                    <CheckCircle2 size={16} className="mr-2" />
                    OBRIGATÓRIOS
                  </h4>
                  <ul className="space-y-3">
                    {job.requirements.mandatory.map((item: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#4400CC]/10 flex items-center justify-center mr-3">
                          <ChevronRight size={16} className="text-[#4400CC]" />
                        </div>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {job.requirements.desirable && job.requirements.desirable.length > 0 && (
                <div className="bg-[#4400CC]/5 p-4 rounded-lg">
                  <h4 className="font-medium text-[#4400CC] mb-3 flex items-center">
                    <Star size={16} className="mr-2" />
                    DESEJÁVEIS
                  </h4>
                  <ul className="space-y-3">
                    {job.requirements.desirable.map((item: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#4400CC]/10 flex items-center justify-center mr-3">
                          <ChevronRight size={16} className="text-[#4400CC]" />
                        </div>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(!job.requirements.mandatory || job.requirements.mandatory.length === 0 || job.requirements.mandatory[0] === "Requisitos não informados") &&
               (!job.requirements.desirable || job.requirements.desirable.length === 0) && (
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <p className="text-gray-500">Nenhum requisito informado para esta vaga.</p>
                </div>
              )}
            </div>

            {/* Benefícios */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Gift className="text-[#4400CC] mr-2" size={18} />
                Benefícios
              </h3>

              {job.benefits && job.benefits.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {job.benefits.map((benefit: string, index: number) => (
                    <Card key={index} className="border border-gray-200">
                      <CardContent className="p-4 flex items-center">
                        <CheckCircle2 className="h-5 w-5 text-[#4400CC] mr-3" />
                        <span>{benefit}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <p className="text-gray-500">Nenhum benefício informado para esta vaga.</p>
                </div>
              )}
            </div>
          </div>

          {/* Coluna lateral */}
          <div className="space-y-6">
            {/* Sobre a empresa */}
            <Card className="border border-gray-200">
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Building className="text-[#4400CC] mr-2" size={18} />
                  Sobre a {job.companyInfo.name}
                </h3>

                <p className="text-gray-700 mb-4">{job.companyInfo.description}</p>

                {job.companyInfo.sector && (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row gap-1 sm:justify-between sm:items-center">
                      <span className="text-gray-500">Setor</span>
                      <span className="font-medium">{job.companyInfo.sector}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>


            {/* Contato com a empresa */}
            {(vaga.contato_email || vaga.contato_whatsapp) && (
              <Card className="border border-gray-200">
                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Mail className="text-[#4400CC] mr-2" size={18} />
                    Entre em contato com a empresa
                  </h3>

                  <p className="text-gray-700 mb-4">
                    Tem dúvidas sobre a vaga? Entre em contato diretamente:
                  </p>

                  <div className="space-y-3">
                    {vaga.contato_email && (
                      <a
                        href={`mailto:${vaga.contato_email}`}
                        className="flex items-center min-w-0 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Mail size={20} className="text-[#4400CC] mr-3" />
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900">E-mail</p>
                          <p className="text-sm text-gray-600 break-all">{vaga.contato_email}</p>
                        </div>
                      </a>
                    )}

                    {vaga.contato_whatsapp && (
                      <a
                        href={`https://wa.me/${formatarParaWhatsApp(vaga.contato_whatsapp)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center min-w-0 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                      >
                        <Phone size={20} className="text-green-600 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">WhatsApp</p>
                          <p className="text-sm text-gray-600">{vaga.contato_whatsapp}</p>
                        </div>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Vagas similares */}
            <Card className="border border-gray-200">
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-lg font-semibold mb-4">Vagas similares</h3>

                <div className="space-y-3">
                  {job.similarJobs.length > 0 ? (
                    job.similarJobs.map((similarJob, index) => (
                      <Link
                        key={similarJob.id || index}
                        href={`/candidato/pesquisar-vagas/${similarJob.id}`}
                        className="flex items-center justify-between gap-2 min-w-0 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                      >
                        <div className="flex items-center min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-[#4400CC]/10 flex items-center justify-center mr-3">
                            <Briefcase size={16} className="text-[#4400CC]" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium break-words">{similarJob.title}</p>
                            <p className="text-sm text-gray-500 break-words">
                              {similarJob.company} • {similarJob.location}
                            </p>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-gray-400" />
                      </Link>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      Nenhuma vaga similar encontrada no momento.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
