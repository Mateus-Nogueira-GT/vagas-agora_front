"use client"

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Languages,
  Building,
  Clock,
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
  FileSearch,
  AlertCircle,
  Globe,
  Linkedin,
  Github,
  FileText,
  Star,
  Eye,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import toast from "react-hot-toast"

interface CandidateProfileModalProps {
  isOpen: boolean
  onClose: () => void
  candidatura: {
    id: string
    status: string
    data_candidatura: string
    etapa?: number
    carta_apresentacao?: string
    anexos?: Array<{
      nome: string
      url: string
      tipo: string
      tamanho?: number
    }>
    curriculo_compartilhado?: boolean
    notas_processo?: string
    avaliacao_empregador?: number
    feedback_empregador?: string
    candidato_dados: {
      id: string
      nome_completo: string
      email: string
      telefone?: string
      cidade?: string
      estado?: string
      data_nascimento?: string
      titulo_profissional?: string
      resumo_profissional?: string
      anos_experiencia: number
      foto_url?: string
      habilidades_tecnicas?: string[]
      experiencia_profissional?: Array<{
        empresa: string
        cargo: string
        inicio: string
        fim?: string
        descricao?: string
        atual: boolean
      }>
      formacao_academica?: Array<{
        instituicao: string
        curso: string
        nivel: string
        inicio: string
        fim?: string
        status: string
      }>
      idiomas?: Array<{
        idioma: string
        nivel: string
      }>
      links_portfolio?: Array<{
        titulo: string
        url: string
        tipo: string
      }>
      linkedin_url?: string
      github_url?: string
    }
  }
  vaga: {
    id: string
    titulo: string
    empresa_nome: string
  }
  onStatusChange?: (candidaturaId: string, novoStatus: string) => void
}

const statusConfig = {
  'Em análise': { color: '#FFA500', label: 'Em Análise', bgColor: 'bg-orange-100', textColor: 'text-orange-800' },
  'Aprovado': { color: '#00FFAE', label: 'Aprovado', bgColor: 'bg-green-100', textColor: 'text-green-800' },
  'Rejeitado': { color: '#FF4D4D', label: 'Reprovado', bgColor: 'bg-red-100', textColor: 'text-red-800' },
  'Finalizado': { color: '#4400CC', label: 'Finalizado', bgColor: 'bg-purple-100', textColor: 'text-purple-800' },
}

export function CandidateProfileModal({
  isOpen,
  onClose,
  candidatura,
  vaga,
  onStatusChange
}: CandidateProfileModalProps) {
  const [isChangingStatus, setIsChangingStatus] = useState(false)

  const { candidato_dados } = candidatura

  // Função para gerar iniciais
  const getInitials = (nome: string) => {
    return nome.split(' ')
      .map(word => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
  }

  // Função para formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
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

  // Função para alterar status
  const handleStatusChange = async (novoStatus: string) => {
    if (!onStatusChange) {
      toast.error('Função de alteração de status não configurada')
      return
    }

    setIsChangingStatus(true)
    try {
      await onStatusChange(candidatura.id, novoStatus)
      toast.success(`Status alterado para "${statusConfig[novoStatus as keyof typeof statusConfig]?.label}" com sucesso!`)
      onClose() // Fecha o modal após alterar o status
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      console.error('Erro ao alterar status:', { error, errorMessage, candidaturaId: candidatura.id, novoStatus })
      toast.error(`Erro ao alterar status: ${errorMessage}`)
    } finally {
      setIsChangingStatus(false)
    }
  }

  // Função para calcular idade
  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }

    return age
  }

  // Função para formatar nível de idioma
  const formatNivelIdioma = (nivel: string) => {
    const niveisMap: Record<string, string> = {
      'basico': 'Básico',
      'intermediario': 'Intermediário',
      'avancado': 'Avançado',
      'fluente': 'Fluente',
      'nativo': 'Nativo'
    }
    return niveisMap[nivel.toLowerCase()] || nivel.charAt(0).toUpperCase() + nivel.slice(1)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              {candidato_dados.foto_url && (
                <AvatarImage
                  src={candidato_dados.foto_url}
                  alt={candidato_dados.nome_completo}
                  className="object-cover"
                />
              )}
              <AvatarFallback className="bg-[#4400CC]/10 text-[#4400CC] text-lg font-medium">
                {getInitials(candidato_dados.nome_completo)}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-800">
                {candidato_dados.nome_completo}
              </DialogTitle>
              <p className="text-gray-600 mt-1">
                {candidato_dados.titulo_profissional || 'Desenvolvedor'}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge 
                  className={`${statusConfig[candidatura.status as keyof typeof statusConfig]?.bgColor} ${statusConfig[candidatura.status as keyof typeof statusConfig]?.textColor} hover:opacity-80`}
                >
                  {statusConfig[candidatura.status as keyof typeof statusConfig]?.label || candidatura.status}
                </Badge>
                <span className="text-sm text-gray-500">
                  • Candidatou-se {getTimeAgo(candidatura.data_candidatura)}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Ações do Empregador */}
          <Card className="border-[#4400CC]/20">
            <CardContent className="p-4">
              <h3 className="text-lg font-medium text-[#4400CC] mb-4 flex items-center">
                <Building size={20} className="mr-2" />
                Ações do Empregador
              </h3>
              
              <Alert className="mb-4">
                <AlertCircle size={16} />
                <AlertDescription>
                  <strong>Vaga:</strong> {vaga.titulo} • <strong>Empresa:</strong> {vaga.empresa_nome}
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                <Button
                  variant="outline"
                  className="border-orange-500 text-orange-600 hover:bg-orange-50"
                  onClick={() => handleStatusChange('Em análise')}
                  disabled={isChangingStatus || candidatura.status === 'Em análise'}
                >
                  <FileSearch size={16} className="mr-2" />
                  Em Análise
                </Button>

                <Button
                  variant="outline"
                  className="border-green-500 text-green-600 hover:bg-green-50"
                  onClick={() => handleStatusChange('Aprovado')}
                  disabled={isChangingStatus || candidatura.status === 'Aprovado'}
                >
                  <ThumbsUp size={16} className="mr-2" />
                  Aprovar
                </Button>

                <Button
                  variant="outline"
                  className="border-red-500 text-red-600 hover:bg-red-50"
                  onClick={() => handleStatusChange('Rejeitado')}
                  disabled={isChangingStatus || candidatura.status === 'Rejeitado'}
                >
                  <ThumbsDown size={16} className="mr-2" />
                  Rejeitar
                </Button>

                <Button
                  variant="outline"
                  className="border-purple-500 text-purple-600 hover:bg-purple-50"
                  onClick={() => handleStatusChange('Finalizado')}
                  disabled={isChangingStatus || candidatura.status === 'Finalizado'}
                >
                  <CheckCircle size={16} className="mr-2" />
                  Finalizar
                </Button>
              </div>

              {/* Botão Ver Currículo Completo */}
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  className="border-[#4400CC] text-[#4400CC] hover:bg-[#4400CC]/10 font-medium"
                  onClick={() => {
                    // Usar o ID correto da tabela candidatos
                    const candidatoId = candidato_dados.id
                    if (candidatoId) {
                      window.open(`/candidato/curriculo/visualizar/${candidatoId}`, '_blank')
                    } else {
                      console.error('ID do candidato não encontrado:', { candidato_dados })
                      alert('ID do candidato não encontrado. Verifique o console para mais detalhes.')
                    }
                  }}
                >
                  <Eye size={16} className="mr-2" />
                  Ver Currículo Completo
                </Button>
              </div>
              
              {isChangingStatus && (
                <div className="mt-3 flex items-center justify-center text-sm text-gray-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4400CC] mr-2"></div>
                  Alterando status...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dados da Candidatura */}
          <Card className="border-[#4400CC]/20">
            <CardContent className="p-4">
              <h3 className="text-lg font-medium text-[#4400CC] mb-4 flex items-center">
                <FileSearch size={20} className="mr-2" />
                Dados da Candidatura
              </h3>

              {/* Carta de Apresentação */}
              {candidatura.carta_apresentacao && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                    <Briefcase size={16} className="mr-2 text-[#4400CC]" />
                    Carta de Apresentação
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-[#4400CC]">
                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                      {candidatura.carta_apresentacao}
                    </p>
                  </div>
                </div>
              )}

              {/* Anexos */}
              {candidatura.anexos && candidatura.anexos.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                    <FileText size={16} className="mr-2 text-[#4400CC]" />
                    Anexos ({candidatura.anexos.length})
                  </h4>
                  <div className="space-y-2">
                    {candidatura.anexos.map((anexo, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                        <div className="flex items-center">
                          <FileText size={16} className="mr-3 text-[#4400CC]" />
                          <div>
                            <p className="font-medium text-gray-800">{anexo.nome}</p>
                            <p className="text-xs text-gray-600">{anexo.tipo}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={anexo.url} target="_blank" rel="noopener noreferrer">
                            Ver arquivo
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Informações Adicionais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center text-gray-700">
                  <CheckCircle size={16} className="mr-2 text-[#4400CC]" />
                  <span className="text-sm font-medium mr-2">Currículo compartilhado:</span>
                  <Badge variant={candidatura.curriculo_compartilhado ? "default" : "secondary"}>
                    {candidatura.curriculo_compartilhado ? 'Sim' : 'Não'}
                  </Badge>
                </div>

                <div className="flex items-center text-gray-700">
                  <Clock size={16} className="mr-2 text-[#4400CC]" />
                  <span className="text-sm font-medium mr-2">Data da candidatura:</span>
                  <span className="text-sm">{formatDate(candidatura.data_candidatura)}</span>
                </div>
              </div>

              {/* Notas do Processo */}
              {candidatura.notas_processo && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-800 mb-2">Notas do Processo</h4>
                  <div className="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-400">
                    <p className="text-blue-800 text-sm">{candidatura.notas_processo}</p>
                  </div>
                </div>
              )}

              {/* Feedback do Empregador */}
              {(candidatura.avaliacao_empregador || candidatura.feedback_empregador) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                    <Building size={16} className="mr-2 text-[#4400CC]" />
                    Avaliação do Empregador
                  </h4>
                  
                  {candidatura.avaliacao_empregador && (
                    <div className="mb-3">
                      <span className="text-sm font-medium text-gray-700">Nota: </span>
                      <div className="inline-flex items-center">
                        {[1,2,3,4,5].map((star) => (
                          <Star 
                            key={star}
                            size={16} 
                            className={star <= candidatura.avaliacao_empregador! ? "text-yellow-500 mr-1" : "text-gray-300 mr-1"} 
                            fill={star <= candidatura.avaliacao_empregador! ? "currentColor" : "none"}
                          />
                        ))}
                        <span className="ml-2 text-sm text-gray-600">({candidatura.avaliacao_empregador}/5)</span>
                      </div>
                    </div>
                  )}

                  {candidatura.feedback_empregador && (
                    <div>
                      <span className="text-sm font-medium text-gray-700 block mb-2">Comentários:</span>
                      <div className="bg-yellow-50 rounded-lg p-3 border-l-4 border-yellow-400">
                        <p className="text-yellow-800 text-sm">{candidatura.feedback_empregador}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informações Pessoais */}
          <Card className="border-[#4400CC]/20">
            <CardContent className="p-4">
              <h3 className="text-lg font-medium text-[#4400CC] mb-4 flex items-center">
                <User size={20} className="mr-2" />
                Informações Pessoais
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center text-gray-700">
                  <Mail size={16} className="mr-2 text-[#4400CC]" />
                  <span className="text-sm font-medium mr-2">Email:</span>
                  <span className="text-sm">{candidato_dados.email}</span>
                </div>
                
                {candidato_dados.telefone && (
                  <div className="flex items-center text-gray-700">
                    <Phone size={16} className="mr-2 text-[#4400CC]" />
                    <span className="text-sm font-medium mr-2">Telefone:</span>
                    <span className="text-sm">{candidato_dados.telefone}</span>
                  </div>
                )}
                
                {(candidato_dados.cidade || candidato_dados.estado) && (
                  <div className="flex items-center text-gray-700">
                    <MapPin size={16} className="mr-2 text-[#4400CC]" />
                    <span className="text-sm font-medium mr-2">Localização:</span>
                    <span className="text-sm">
                      {candidato_dados.cidade && candidato_dados.estado 
                        ? `${candidato_dados.cidade}, ${candidato_dados.estado}`
                        : candidato_dados.cidade || candidato_dados.estado
                      }
                    </span>
                  </div>
                )}
                
                {candidato_dados.data_nascimento && (
                  <div className="flex items-center text-gray-700">
                    <Calendar size={16} className="mr-2 text-[#4400CC]" />
                    <span className="text-sm font-medium mr-2">Idade:</span>
                    <span className="text-sm">{calculateAge(candidato_dados.data_nascimento)} anos</span>
                  </div>
                )}
              </div>
              
              {candidato_dados.resumo_profissional && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Resumo Profissional</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {candidato_dados.resumo_profissional}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Habilidades Técnicas */}
          {candidato_dados.habilidades_tecnicas && candidato_dados.habilidades_tecnicas.length > 0 && (
            <Card className="border-[#4400CC]/20">
              <CardContent className="p-4">
                <h3 className="text-lg font-medium text-[#4400CC] mb-4">
                  Habilidades Técnicas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {candidato_dados.habilidades_tecnicas.map((skill, index) => (
                    <Badge 
                      key={index}
                      variant="outline" 
                      className="border-[#4400CC]/30 text-[#4400CC] hover:bg-[#4400CC]/10"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Experiência Profissional */}
          {candidato_dados.experiencia_profissional && candidato_dados.experiencia_profissional.length > 0 && (
            <Card className="border-[#4400CC]/20">
              <CardContent className="p-4">
                <h3 className="text-lg font-medium text-[#4400CC] mb-4 flex items-center">
                  <Briefcase size={20} className="mr-2" />
                  Experiência Profissional
                </h3>
                <div className="space-y-4">
                  {candidato_dados.experiencia_profissional.map((exp, index) => (
                    <div key={index} className="border-l-2 border-[#4400CC]/30 pl-4">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-800">{exp.cargo}</h4>
                        <Badge variant="outline" className="text-xs">
                          {exp.atual ? 'Atual' : 'Concluído'}
                        </Badge>
                      </div>
                      <p className="text-sm text-[#4400CC] font-medium">{exp.empresa}</p>
                      <p className="text-xs text-gray-600 mb-2">
                        {formatDate(exp.inicio)} - {exp.atual ? 'Atual' : (exp.fim ? formatDate(exp.fim) : 'Não informado')}
                      </p>
                      {exp.descricao && (
                        <p className="text-sm text-gray-700">{exp.descricao}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Formação Acadêmica */}
          {candidato_dados.formacao_academica && candidato_dados.formacao_academica.length > 0 && (
            <Card className="border-[#4400CC]/20">
              <CardContent className="p-4">
                <h3 className="text-lg font-medium text-[#4400CC] mb-4 flex items-center">
                  <GraduationCap size={20} className="mr-2" />
                  Formação Acadêmica
                </h3>
                <div className="space-y-3">
                  {candidato_dados.formacao_academica.map((edu, index) => (
                    <div key={index} className="border-l-2 border-[#00FFAE]/50 pl-4">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-800">{edu.curso}</h4>
                        <Badge 
                          variant="outline" 
                          className="text-xs border-[#00FFAE]/50 text-[#4400CC]"
                        >
                          {edu.nivel}
                        </Badge>
                      </div>
                      <p className="text-sm text-[#4400CC] font-medium">{edu.instituicao}</p>
                      <p className="text-xs text-gray-600">
                        {formatDate(edu.inicio)} - {edu.status === 'concluido' ? (edu.fim ? formatDate(edu.fim) : 'Concluído') : 'Em andamento'}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Idiomas */}
          {candidato_dados.idiomas && candidato_dados.idiomas.length > 0 && (
            <Card className="border-[#4400CC]/20">
              <CardContent className="p-4">
                <h3 className="text-lg font-medium text-[#4400CC] mb-4 flex items-center">
                  <Languages size={20} className="mr-2" />
                  Idiomas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {candidato_dados.idiomas.map((lang, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="font-medium text-gray-800 capitalize">{lang.idioma}</span>
                      <Badge variant="outline" className="text-xs">
                        {formatNivelIdioma(lang.nivel)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Links e Portfolio */}
          {((candidato_dados.linkedin_url) || (candidato_dados.github_url) || (candidato_dados.links_portfolio && candidato_dados.links_portfolio.length > 0)) && (
            <Card className="border-[#4400CC]/20">
              <CardContent className="p-4">
                <h3 className="text-lg font-medium text-[#4400CC] mb-4 flex items-center">
                  <Globe size={20} className="mr-2" />
                  Links e Portfólio
                </h3>
                <div className="space-y-3">
                  {candidato_dados.linkedin_url && (
                    <div className="flex items-center">
                      <Linkedin size={16} className="mr-3 text-blue-600" />
                      <a 
                        href={candidato_dados.linkedin_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        LinkedIn
                      </a>
                    </div>
                  )}
                  
                  {candidato_dados.github_url && (
                    <div className="flex items-center">
                      <Github size={16} className="mr-3 text-gray-800" />
                      <a 
                        href={candidato_dados.github_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-800 hover:underline text-sm"
                      >
                        GitHub
                      </a>
                    </div>
                  )}
                  
                  {candidato_dados.links_portfolio && candidato_dados.links_portfolio.map((link, index) => (
                    <div key={index} className="flex items-center">
                      <Globe size={16} className="mr-3 text-[#4400CC]" />
                      <div className="flex-1">
                        <a 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#4400CC] hover:underline text-sm font-medium"
                        >
                          {link.titulo}
                        </a>
                        <p className="text-xs text-gray-600">{link.tipo}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
