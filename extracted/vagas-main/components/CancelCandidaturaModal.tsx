"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface CancelCandidaturaModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<boolean>
  vaga: {
    titulo: string
    empregador: {
      nome: string
    }
  }
}

export function CancelCandidaturaModal({ 
  isOpen, 
  onOpenChange, 
  onConfirm, 
  vaga 
}: CancelCandidaturaModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      const success = await onConfirm()
      if (success) {
        onOpenChange(false)
      }
    } catch (error) {
      console.error('Erro ao cancelar candidatura:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Cancelar Candidatura
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-gray-700 mb-4">
            Tem certeza que deseja cancelar sua candidatura para a vaga:
          </p>
          
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="font-medium text-gray-900 mb-1">{vaga.titulo}</h3>
            <p className="text-sm text-gray-600">{vaga.empregador.nome}</p>
          </div>
          
          <p className="text-sm text-gray-500 mt-3">
            Esta ação não pode ser desfeita. Você precisará se candidatar novamente se mudar de ideia.
          </p>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Manter Candidatura
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Cancelando...' : 'Cancelar Candidatura'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
