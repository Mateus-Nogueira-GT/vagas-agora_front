"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { MapPin, Building, DollarSign, Clock, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CandidaturaModal } from "@/components/CandidaturaModal"
import { CancelCandidaturaModal } from "@/components/CancelCandidaturaModal"
import { useAuth } from "@/hooks/use-auth"
import { useCandidatos } from "@/hooks/use-candidatos"
import { useCandidaturas } from "@/hooks/use-candidaturas"
import { formatarTexto } from "@/lib/utils/format-text"
import toast from "react-hot-toast"

interface Vaga {
  id: string
  titulo: string
  empresa_nome?: string
  empresa_logo_url?: string
  cidade?: string
  estado?: string
  salario_de?: number
  salario_ate?: number
  modelo_trabalho?: string
  tipo_contratacao?: string
  nivel?: string
  descricao?: string
  data_publicacao?: string
  habilidades_tecnicas?: string[]
}

interface VagaCardProps {
  vaga: Vaga
}

function formatSalario(salarioMin?: number, salarioMax?: number): string {
  if (!salarioMin && !salarioMax) return "A combinar"
  if (salarioMin && salarioMax) {
    return `R$ ${salarioMin.toLocaleString()} - R$ ${salarioMax.toLocaleString()}`
  }
  if (salarioMin) return `A partir de R$ ${salarioMin.toLocaleString()}`
  if (salarioMax) return `Até R$ ${salarioMax.toLocaleString()}`
  return "A combinar"
}

function getTimeAgo(dateString?: string): string {
  if (!dateString) return "Data não informada"
  
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  
  if (diffDays < 1) return "Hoje"
  if (diffDays < 2) return "Há 1 dia"
  if (diffDays < 7) return `Há ${Math.floor(diffDays)} dia${Math.floor(diffDays) > 1 ? 's' : ''}`
  if (diffDays < 30) return `Há ${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) > 1 ? 's' : ''}`
  return `Há ${Math.floor(diffDays / 30)} mês${Math.floor(diffDays / 30) > 1 ? 'es' : ''}`
}

export function VagaCard({ vaga }: VagaCardProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { candidato, loadCandidatoPerfil } = useCandidatos()
  const { candidatarVaga, verificarCandidaturaExistente, cancelarCandidatura } = useCandidaturas()

  const [modalOpen, setModalOpen] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [jaCandidatado, setJaCandidatado] = useState(false)
  const [candidaturaExistente, setCandidaturaExistente] = useState<any>(null)
  const [isCheckingCandidatura, setIsCheckingCandidatura] = useState(true)

  // Carregar o perfil do candidato
  useEffect(() => {
    if (user?.id && user?.role === 'candidato') {
      loadCandidatoPerfil()
    }
  }, [user?.id, user?.role, loadCandidatoPerfil])

  // Verificar se o usuário já se candidatou a esta vaga
  useEffect(() => {
    const verificarCandidaturaStatus = async () => {
      if (user?.id && vaga?.id) {
        setIsCheckingCandidatura(true)
        try {
          const result = await verificarCandidaturaExistente(user.id, vaga.id)
          setJaCandidatado(result.exists)
          setCandidaturaExistente(result.candidatura)
        } catch (error) {
          console.error('Erro ao verificar candidatura:', error)
          setJaCandidatado(false)
        } finally {
          setIsCheckingCandidatura(false)
        }
      } else {
        setIsCheckingCandidatura(false)
      }
    }

    verificarCandidaturaStatus()
  }, [user?.id, vaga?.id, verificarCandidaturaExistente])

  const handleConfirmCandidatura = async (vagaId: string, cartaApresentacao?: string): Promise<boolean> => {
    if (!user?.id) {
      toast.error('Você precisa estar logado para se candidatar')
      return false
    }

    if (!candidato) {
      toast.error('Carregando seu perfil... Aguarde um momento e tente novamente')
      return false
    }

    if (!candidato.nome_completo) {
      toast.error('Por favor, complete seu nome no currículo antes de se candidatar')
      return false
    }

    try {
      const success = await candidatarVaga(vagaId, user.id, cartaApresentacao)

      if (success) {
        setJaCandidatado(true)
        setModalOpen(false)

        const result = await verificarCandidaturaExistente(user.id, vagaId)
        setCandidaturaExistente(result.candidatura)
      }
      return success
    } catch (error) {
      console.error('Erro ao se candidatar:', error)
      return false
    }
  }

  const handleCancelarCandidatura = async () => {
    if (!user?.id || !vaga?.id) return false

    try {
      const success = await cancelarCandidatura(user.id, vaga.id)
      if (success) {
        setJaCandidatado(false)
        setCandidaturaExistente(null)
        toast.success('Candidatura cancelada com sucesso!')
      } else {
        toast.error('Erro ao cancelar candidatura')
      }
      return success
    } catch (error) {
      console.error('Erro ao cancelar candidatura:', error)
      toast.error('Erro ao cancelar candidatura')
      return false
    }
  }

  return (
    <Card className="border border-[#4400CC]/20 hover:border-[#4400CC]/40 transition-all duration-200 hover:shadow-[0_0_15px_rgba(68,0,204,0.1)] group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-[#4400CC]/10 to-[#00FFAE]/10 flex items-center justify-center border border-[#4400CC]/20 overflow-hidden">
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
                  {vaga.empresa_nome?.charAt(0)?.toUpperCase() || 'E'}
                </span>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 text-lg mb-1 group-hover:text-[#4400CC] transition-colors">
                {vaga.titulo}
              </h3>
              <p className="text-[#0057FF] font-medium text-sm">
                {vaga.empresa_nome || "Empresa não informada"}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-1">
            {vaga.nivel && (
              <Badge
                variant="secondary"
                className="bg-[#4400CC]/10 text-[#4400CC] hover:bg-[#4400CC]/20 text-xs"
              >
                {formatarTexto(vaga.nivel)}
              </Badge>
            )}
            <span className="text-xs text-gray-500">
              {getTimeAgo(vaga.data_publicacao)}
            </span>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600 text-sm">
            <MapPin size={16} className="mr-2 text-[#4400CC]" />
            <span>{vaga.cidade && vaga.estado ? `${vaga.cidade}, ${vaga.estado}` : "Localização não informada"}</span>
          </div>
          
          <div className="flex items-center text-gray-600 text-sm">
            <DollarSign size={16} className="mr-2 text-[#4400CC]" />
            <span className="text-[#4400CC] font-medium">
              {formatSalario(vaga.salario_de, vaga.salario_ate)}
            </span>
          </div>

          {vaga.modelo_trabalho && (
            <div className="flex items-center text-gray-600 text-sm">
              <Building size={16} className="mr-2 text-[#4400CC]" />
              <span>{formatarTexto(vaga.modelo_trabalho)}</span>
            </div>
          )}

          {vaga.tipo_contratacao && (
            <div className="flex items-center text-gray-600 text-sm">
              <Briefcase size={16} className="mr-2 text-[#4400CC]" />
              <span>{formatarTexto(vaga.tipo_contratacao)}</span>
            </div>
          )}
        </div>

        {vaga.habilidades_tecnicas && vaga.habilidades_tecnicas.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {vaga.habilidades_tecnicas.slice(0, 3).map((skill, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs border-[#4400CC]/30 text-[#4400CC] hover:bg-[#4400CC]/5"
              >
                {skill}
              </Badge>
            ))}
            {vaga.habilidades_tecnicas.length > 3 && (
              <Badge
                variant="outline"
                className="text-xs border-[#4400CC]/30 text-[#4400CC] hover:bg-[#4400CC]/5"
              >
                +{vaga.habilidades_tecnicas.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <Button
            variant="outline"
            size="sm"
            className="border-[#4400CC]/30 text-[#4400CC] hover:bg-[#4400CC]/5"
            onClick={() => router.push(`/candidato/pesquisar-vagas/${vaga.id}`)}
          >
            Detalhes da Vaga
          </Button>
          
          {isCheckingCandidatura ? (
            <Button
              size="sm"
              disabled
              className="bg-gray-300 text-gray-500"
            >
              Verificando...
            </Button>
          ) : !jaCandidatado ? (
            <Button
              size="sm"
              className="bg-[#00FFAE] hover:bg-[#00FFAE]/80 text-[#4400CC] font-medium shadow-[0_0_10px_rgba(0,255,174,0.2)]"
              onClick={() => setModalOpen(true)}
            >
              Candidatar-se
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="border-green-500 text-green-600 bg-green-50 hover:bg-green-100"
              onClick={() => setCancelModalOpen(true)}
            >
              ✅ Candidatado
            </Button>
          )}
        </div>

        {/* Modal de Candidatura */}
        <CandidaturaModal
          vaga={{
            id: vaga.id,
            titulo: vaga.titulo,
            empregador: vaga.empresa_nome ? { nome: vaga.empresa_nome } : undefined,
            cidade: vaga.cidade,
            estado: vaga.estado,
            modelo_trabalho: vaga.modelo_trabalho,
            salario_de: vaga.salario_de,
            salario_ate: vaga.salario_ate,
            descricao: vaga.descricao
          }}
          isOpen={modalOpen}
          onOpenChange={setModalOpen}
          onConfirm={handleConfirmCandidatura}
        />

        {/* Modal de Cancelar Candidatura */}
        <CancelCandidaturaModal
          vaga={{
            titulo: vaga.titulo,
            empregador: {
              nome: vaga.empresa_nome || 'Empresa não informada'
            }
          }}
          isOpen={cancelModalOpen}
          onOpenChange={setCancelModalOpen}
          onConfirm={handleCancelarCandidatura}
        />
      </CardContent>
    </Card>
  )
}
