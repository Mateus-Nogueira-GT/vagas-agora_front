"use client"

import { useState, useEffect } from "react"
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

interface InteractiveButtonsProps {
  vaga: VagaData
}

export function InteractiveButtons({ vaga }: InteractiveButtonsProps) {
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
    if (user?.id && user.role === 'candidato') {
      loadCandidatoPerfil()
    }
  }, [user?.id, user?.role, loadCandidatoPerfil])

  const handleWithdraw = () => {
    // Lógica para desistir da candidatura
    setIsWithdrawDialogOpen(false)
    // Aqui você adicionaria a lógica para atualizar o status no banco de dados
    // e possivelmente redirecionar o usuário
  }

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



  // Se ainda está verificando o status da candidatura, mostrar loading
  if (isCheckingCandidatura) {
    return (
      <div className="space-y-3">
        <Button disabled className="w-full">
          Verificando...
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {!jaCandidatado ? (
        <Button 
          className="w-full bg-[#4400CC] hover:bg-[#3300AA]"
          onClick={() => setCandidaturaModalOpen(true)}
        >
          Quero me candidatar
        </Button>
      ) : (
        <>
          <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">✅ Você já se candidatou a esta vaga</p>
            <p className="text-green-600 text-sm mt-1">
              Status: {candidaturaExistente?.status || 'Em análise'}
            </p>
          </div>
          
          <Button
            variant="outline"
            className="w-full border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
            onClick={() => setCancelModalOpen(true)}
          >
            Desistir da candidatura
          </Button>
        </>
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
