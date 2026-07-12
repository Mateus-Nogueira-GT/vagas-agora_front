"use client"

import { useState, useEffect } from "react"
import { Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CandidaturaModal } from "@/components/CandidaturaModal"
import { CancelCandidaturaModal } from "@/components/CancelCandidaturaModal"
import { useAuth } from "@/hooks/use-auth"
import { useCandidatos } from "@/hooks/use-candidatos"
import { useCandidaturas } from "@/hooks/use-candidaturas"
import toast from "react-hot-toast"

interface VagaData {
  id: string
  titulo: string
  empregador?: {
    nome: string
  }
  cidade?: string
  estado?: string
  modelo_trabalho?: string
  salario_de?: number
  salario_ate?: number
  descricao?: string
}

interface HeaderButtonsProps {
  vaga: VagaData
}

export function HeaderButtons({ vaga }: HeaderButtonsProps) {
  const { user } = useAuth()
  const { candidato, loadCandidatoPerfil } = useCandidatos()
  const { candidatarVaga, verificarCandidaturaExistente, cancelarCandidatura } = useCandidaturas()
  
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false)
  const [candidaturaModalOpen, setCandidaturaModalOpen] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [jaCandidatado, setJaCandidatado] = useState(false)
  const [candidaturaExistente, setCandidaturaExistente] = useState<any>(null)
  const [isCheckingCandidatura, setIsCheckingCandidatura] = useState(true)

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

  // Carregar perfil do candidato quando o usuário mudar
  useEffect(() => {
    if (user?.id) {
      loadCandidatoPerfil()
    }
  }, [user?.id, loadCandidatoPerfil])

  const handleConfirmCandidatura = async (vagaId: string, cartaApresentacao?: string): Promise<boolean> => {
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

    try {
      const success = await candidatarVaga(vagaId, user.id, cartaApresentacao)
      if (success) {
        // Atualizar o status da candidatura
        setJaCandidatado(true)
        setCandidaturaModalOpen(false)
        
        // Verificar novamente para obter dados da candidatura
        const result = await verificarCandidaturaExistente(user.id, vagaId)
        setCandidaturaExistente(result.candidatura)
        
        toast.success('Candidatura realizada com sucesso!')
      }
      return success
    } catch (error) {
      console.error('Erro ao se candidatar:', error)
      toast.error('Erro ao realizar candidatura')
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
        setIsWithdrawDialogOpen(false)
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

  // Função para compartilhar vaga
  const handleCompartilharVaga = async () => {
    const url = `${window.location.origin}/candidato/pesquisar-vagas/${vaga.id}`
    const texto = `Confira esta vaga: ${vaga.titulo}${vaga.empregador?.nome ? ` na ${vaga.empregador.nome}` : ''}`

    // Tentar usar a API nativa de compartilhamento se disponível
    if (navigator.share) {
      try {
        await navigator.share({
          title: vaga.titulo,
          text: texto,
          url: url,
        })
        toast.success('Vaga compartilhada com sucesso!')
      } catch (error) {
        // Usuário cancelou o compartilhamento
      }
    } else {
      // Fallback: copiar link para área de transferência
      try {
        await navigator.clipboard.writeText(url)
        toast.success('Link copiado para área de transferência!')
      } catch (error) {
        console.error('Erro ao copiar link:', error)
        toast.error('Erro ao copiar link')
      }
    }
  }

  // Se ainda está verificando o status da candidatura, mostrar loading
  if (isCheckingCandidatura) {
    return (
      <div className="flex mt-4 md:mt-0 space-x-3">
        <Button
          variant="outline"
          size="sm"
          className="bg-white/10 text-white border-white/20 hover:bg-white/20"
          onClick={handleCompartilharVaga}
        >
          <Share2 size={16} className="mr-2" />
          Compartilhar
        </Button>
        <Button size="sm" className="bg-white text-[#4400CC] hover:bg-white/90" disabled>
          Verificando...
        </Button>
      </div>
    )
  }

  return (
    <div className="flex mt-4 md:mt-0 space-x-3">
      <Button
        variant="outline"
        size="sm"
        className="bg-white/10 text-white border-white/20 hover:bg-white/20"
        onClick={handleCompartilharVaga}
      >
        <Share2 size={16} className="mr-2" />
        Compartilhar
      </Button>
      
      {!jaCandidatado ? (
        <Button 
          size="sm" 
          className="bg-white text-[#4400CC] hover:bg-white/90"
          onClick={() => setCandidaturaModalOpen(true)}
        >
          Quero me candidatar
        </Button>
      ) : (
        <Button
          size="sm"
          variant="outline" 
          className="bg-white/10 text-white border-white/20 hover:bg-white/20"
          onClick={() => setCancelModalOpen(true)}
        >
          ✅ Candidatado
        </Button>
      )}

      {/* Modal de Candidatura */}
      <CandidaturaModal
        vaga={vaga}
        isOpen={candidaturaModalOpen}
        onOpenChange={setCandidaturaModalOpen}
        onConfirm={handleConfirmCandidatura}
      />

      {/* Modal de Cancelar Candidatura */}
      <CancelCandidaturaModal
        vaga={{
          titulo: vaga.titulo,
          empregador: {
            nome: vaga.empregador?.nome || 'Empresa não informada'
          }
        }}
        isOpen={cancelModalOpen}
        onOpenChange={setCancelModalOpen}
        onConfirm={handleCancelarCandidatura}
      />
    </div>
  )
}
