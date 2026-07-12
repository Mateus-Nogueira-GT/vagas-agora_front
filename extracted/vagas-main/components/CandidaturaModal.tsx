"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertCircle, Briefcase, Building, MapPin, DollarSign, Users, Send, FileText, Shield, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import toast from "react-hot-toast"

interface Vaga {
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

interface CandidaturaModalProps {
  vaga: Vaga
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (vagaId: string, cartaApresentacao?: string) => Promise<boolean>
  isLoading?: boolean
  trigger?: React.ReactNode
}

export function CandidaturaModal({
  vaga,
  isOpen,
  onOpenChange,
  onConfirm,
  isLoading = false,
  trigger
}: CandidaturaModalProps) {
  const [cartaApresentacao, setCartaApresentacao] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Proteção caso a vaga não seja fornecida
  if (!vaga) {
    return null
  }

  const formatSalary = (salarioMin?: number, salarioMax?: number) => {
    if (!salarioMin && !salarioMax) return "A combinar"
    if (salarioMin && salarioMax) {
      return `R$ ${salarioMin.toLocaleString()} - ${salarioMax.toLocaleString()}`
    }
    if (salarioMin) return `A partir de R$ ${salarioMin.toLocaleString()}`
    if (salarioMax) return `Até R$ ${salarioMax.toLocaleString()}`
    return "A combinar"
  }

  const location = vaga?.cidade && vaga?.estado 
    ? `${vaga.cidade}, ${vaga.estado}`
    : "Local não informado"

  const handleConfirm = async () => {
    setIsSubmitting(true)

    try {
      const success = await onConfirm(vaga.id, cartaApresentacao.trim() || undefined)

      if (success) {
        onOpenChange(false)
        setCartaApresentacao("") // Limpar o campo
        toast.success("Candidatura realizada com sucesso!")
      }
    } catch (error) {
      console.error("Erro na candidatura:", error)
      toast.error("Erro inesperado. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const content = (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-[#4400CC]" />
          Confirmar Candidatura
        </DialogTitle>
        <DialogDescription>
          Revise os detalhes da vaga e confirme sua candidatura
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {/* Informações da Vaga */}
        <Card className="border-[#4400CC]/20">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-lg text-gray-800">{vaga?.titulo || "Título não informado"}</h3>
                <p className="text-[#4400CC] font-medium">{vaga?.empregador?.nome || "Empresa não informada"}</p>
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {location !== "Local não informado" && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{location}</span>
                  </div>
                )}
                
                {vaga?.modelo_trabalho && (
                  <div className="flex items-center gap-1">
                    <Building className="w-4 h-4" />
                    <span>{vaga.modelo_trabalho}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-[#4400CC] font-medium">
                    {formatSalary(vaga?.salario_de, vaga?.salario_ate)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alertas sobre compartilhamento de dados */}
        <Alert className="border-[#4400CC]/30 bg-[#4400CC]/5">
          <Shield className="h-4 w-4 text-[#4400CC]" />
          <AlertDescription className="text-sm">
            <strong>Compartilhamento de dados:</strong> Ao confirmar sua candidatura, seus dados do currículo 
            (incluindo experiências, formação, habilidades e informações de contato) serão compartilhados 
            com <strong>{vaga.empregador?.nome || "a empresa"}</strong> para análise da sua candidatura.
          </AlertDescription>
        </Alert>

        <Alert className="border-blue-300 bg-blue-50">
          <CheckCircle2 className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm text-blue-800">
            <strong>Processo seletivo:</strong> Você irá concorrer à vaga juntamente com outros candidatos. 
            A empresa entrará em contato caso seu perfil seja selecionado para as próximas etapas.
          </AlertDescription>
        </Alert>

        {/* Carta de Apresentação (Opcional) */}
        <div className="space-y-3">
          <div>
            <Label htmlFor="carta-apresentacao" className="text-sm font-medium">
              Carta de Apresentação (Opcional)
            </Label>
            <p className="text-xs text-gray-500 mt-1">
              Use este espaço para destacar por que você é o candidato ideal para esta vaga
            </p>
          </div>
          <Textarea
            id="carta-apresentacao"
            placeholder="Escreva uma breve apresentação sobre você e por que tem interesse nesta vaga..."
            value={cartaApresentacao}
            onChange={(e) => setCartaApresentacao(e.target.value)}
            className="min-h-[100px] resize-none"
            maxLength={500}
          />
          <p className="text-xs text-gray-400 text-right">
            {cartaApresentacao.length}/500 caracteres
          </p>
        </div>

        {/* Botões de Ação */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting || isLoading}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting || isLoading}
            className="flex-1 bg-[#4400CC] hover:bg-[#3300AA] text-white"
          >
            {isSubmitting || isLoading ? (
              <>
                <Users className="w-4 h-4 mr-2 animate-spin" />
                Candidatando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Confirmar Candidatura
              </>
            )}
          </Button>
        </div>
      </div>
    </DialogContent>
  )

  if (trigger) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        {content}
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {content}
    </Dialog>
  )
}
