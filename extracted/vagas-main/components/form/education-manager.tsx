'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Trash2, Edit2, Save, X, Plus } from 'lucide-react'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface FormacaoAcademica {
  instituicao: string
  curso: string
  nivel: 'tecnico' | 'graduacao' | 'pos' | 'mestrado' | 'doutorado'
  status: 'cursando' | 'concluido' | 'trancado' | 'incompleto'
  data_inicio?: string
  data_fim?: string
  descricao?: string
}

interface EducationManagerProps {
  educations: FormacaoAcademica[]
  onChange: (educations: FormacaoAcademica[]) => void
  disabled?: boolean
}

export default function EducationManager({ educations, onChange, disabled }: EducationManagerProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [currentEdu, setCurrentEdu] = useState<FormacaoAcademica>({
    instituicao: '',
    curso: '',
    nivel: 'graduacao',
    status: 'cursando',
    data_inicio: '',
    data_fim: ''
  })
  const [isAdding, setIsAdding] = useState(false)

  const handleAdd = () => {
    setIsAdding(true)
    setCurrentEdu({
      instituicao: '',
      curso: '',
      nivel: 'graduacao',
      status: 'cursando',
      data_inicio: '',
      data_fim: ''
    })
  }

  const handleSaveNew = () => {
    if (!currentEdu.instituicao.trim() || !currentEdu.curso.trim() || !currentEdu.data_inicio) {
      toast.error('Preencha os campos obrigatórios: Instituição, Curso e Data de início')
      return
    }

    onChange([...educations, currentEdu])
    setIsAdding(false)
    setCurrentEdu({
      instituicao: '',
      curso: '',
      nivel: 'graduacao',
      status: 'cursando',
      data_inicio: '',
      data_fim: ''
    })
    toast.success('Formação adicionada com sucesso')
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingIndex(null)
    setCurrentEdu({
      instituicao: '',
      curso: '',
      nivel: 'graduacao',
      status: 'cursando',
      data_inicio: '',
      data_fim: ''
    })
  }

  const handleEdit = (index: number) => {
    setEditingIndex(index)
    setCurrentEdu({ ...educations[index] })
  }

  const handleSaveEdit = () => {
    if (!currentEdu.instituicao.trim() || !currentEdu.curso.trim() || !currentEdu.data_inicio) {
      toast.error('Preencha os campos obrigatórios: Instituição, Curso e Data de início')
      return
    }

    const updated = [...educations]
    updated[editingIndex!] = currentEdu
    onChange(updated)
    setEditingIndex(null)
    toast.success('Formação atualizada com sucesso')
  }

  const handleDelete = (index: number) => {
    const updated = educations.filter((_, i) => i !== index)
    onChange(updated)
    toast.success('Formação removida com sucesso')
  }

  const formatDate = (date: string) => {
    if (!date) return ''
    const [year, month] = date.split('-')
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    return `${monthNames[parseInt(month) - 1]}/${year}`
  }

  const getNivelLabel = (nivel: string) => {
    const labels: Record<string, string> = {
      tecnico: 'Técnico',
      graduacao: 'Graduação',
      pos: 'Pós-graduação',
      mestrado: 'Mestrado',
      doutorado: 'Doutorado'
    }
    return labels[nivel] || nivel
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      cursando: 'Cursando',
      concluido: 'Concluído',
      trancado: 'Trancado'
    }
    return labels[status] || status
  }

  return (
    <div className="space-y-4">
      {/* Lista de formações existentes */}
      {educations.map((edu, index) => (
        <Card key={index} className="p-4 border-[#4400CC]/20 bg-[#4400CC]/5">
          {editingIndex === index ? (
            // Modo de edição
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`instituicao-${index}`}>Instituição *</Label>
                  <Input
                    id={`instituicao-${index}`}
                    value={currentEdu.instituicao}
                    onChange={(e) => setCurrentEdu({ ...currentEdu, instituicao: e.target.value })}
                    placeholder="Nome da instituição"
                    className="border-[#4400CC]/30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`curso-${index}`}>Curso *</Label>
                  <Input
                    id={`curso-${index}`}
                    value={currentEdu.curso}
                    onChange={(e) => setCurrentEdu({ ...currentEdu, curso: e.target.value })}
                    placeholder="Nome do curso"
                    className="border-[#4400CC]/30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`nivel-${index}`}>Nível *</Label>
                  <Select
                    value={currentEdu.nivel}
                    onValueChange={(value) => setCurrentEdu({ ...currentEdu, nivel: value as any })}
                  >
                    <SelectTrigger className="border-[#4400CC]/30">
                      <SelectValue placeholder="Selecione o nível" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tecnico">Técnico</SelectItem>
                      <SelectItem value="graduacao">Graduação</SelectItem>
                      <SelectItem value="pos">Pós-graduação</SelectItem>
                      <SelectItem value="mestrado">Mestrado</SelectItem>
                      <SelectItem value="doutorado">Doutorado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`status-${index}`}>Status *</Label>
                  <Select
                    value={currentEdu.status}
                    onValueChange={(value) => setCurrentEdu({ ...currentEdu, status: value as any })}
                  >
                    <SelectTrigger className="border-[#4400CC]/30">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cursando">Cursando</SelectItem>
                      <SelectItem value="concluido">Concluído</SelectItem>
                      <SelectItem value="trancado">Trancado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`data-inicio-${index}`}>Data de início *</Label>
                  <Input
                    id={`data-inicio-${index}`}
                    type="date"
                    value={currentEdu.data_inicio}
                    onChange={(e) => setCurrentEdu({ ...currentEdu, data_inicio: e.target.value })}
                    className="border-[#4400CC]/30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`data-fim-${index}`}>Data de conclusão</Label>
                  <Input
                    id={`data-fim-${index}`}
                    type="date"
                    value={currentEdu.data_fim}
                    onChange={(e) => setCurrentEdu({ ...currentEdu, data_fim: e.target.value })}
                    disabled={currentEdu.status === 'cursando'}
                    className="border-[#4400CC]/30"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  onClick={handleCancel}
                  variant="outline"
                  size="sm"
                >
                  <X size={16} className="mr-1" />
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveEdit}
                  className="bg-[#4400CC] hover:bg-[#3300AA]"
                  size="sm"
                >
                  <Save size={16} className="mr-1" />
                  Salvar
                </Button>
              </div>
            </div>
          ) : (
            // Modo de visualização
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-lg text-[#4400CC]">{edu.curso}</h4>
                  <p className="text-gray-700 font-medium">{edu.instituicao}</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="text-sm px-2 py-1 bg-[#4400CC]/10 text-[#4400CC] rounded">
                      {getNivelLabel(edu.nivel)}
                    </span>
                    <span className="text-sm px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      {getStatusLabel(edu.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(edu.data_inicio || '')} - {edu.status === 'cursando' ? 'Cursando' : formatDate(edu.data_fim || '')}
                  </p>
                </div>
                {!disabled && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEdit(index)}
                      variant="outline"
                      size="sm"
                      disabled={disabled}
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      onClick={() => handleDelete(index)}
                      variant="destructive"
                      size="sm"
                      disabled={disabled}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      ))}

      {/* Formulário para adicionar nova formação */}
      {isAdding && (
        <Card className="p-4 border-[#4400CC]/30 border-dashed">
          <div className="space-y-4">
            <h4 className="font-medium text-[#4400CC] flex items-center">
              <Plus size={18} className="mr-2" />
              Nova Formação Acadêmica
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-instituicao">Instituição *</Label>
                <Input
                  id="new-instituicao"
                  value={currentEdu.instituicao}
                  onChange={(e) => setCurrentEdu({ ...currentEdu, instituicao: e.target.value })}
                  placeholder="Nome da instituição"
                  className="border-[#4400CC]/30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-curso">Curso *</Label>
                <Input
                  id="new-curso"
                  value={currentEdu.curso}
                  onChange={(e) => setCurrentEdu({ ...currentEdu, curso: e.target.value })}
                  placeholder="Nome do curso"
                  className="border-[#4400CC]/30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-nivel">Nível *</Label>
                <Select
                  value={currentEdu.nivel}
                  onValueChange={(value) => setCurrentEdu({ ...currentEdu, nivel: value as any })}
                >
                  <SelectTrigger className="border-[#4400CC]/30">
                    <SelectValue placeholder="Selecione o nível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tecnico">Técnico</SelectItem>
                    <SelectItem value="graduacao">Graduação</SelectItem>
                    <SelectItem value="pos">Pós-graduação</SelectItem>
                    <SelectItem value="mestrado">Mestrado</SelectItem>
                    <SelectItem value="doutorado">Doutorado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-status">Status *</Label>
                <Select
                  value={currentEdu.status}
                  onValueChange={(value) => setCurrentEdu({ ...currentEdu, status: value as any })}
                >
                  <SelectTrigger className="border-[#4400CC]/30">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cursando">Cursando</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                    <SelectItem value="trancado">Trancado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-data-inicio">Data de início *</Label>
                <Input
                  id="new-data-inicio"
                  type="date"
                  value={currentEdu.data_inicio}
                  onChange={(e) => setCurrentEdu({ ...currentEdu, data_inicio: e.target.value })}
                  className="border-[#4400CC]/30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-data-fim">Data de conclusão</Label>
                <Input
                  id="new-data-fim"
                  type="date"
                  value={currentEdu.data_fim}
                  onChange={(e) => setCurrentEdu({ ...currentEdu, data_fim: e.target.value })}
                  disabled={currentEdu.status === 'cursando'}
                  className="border-[#4400CC]/30"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                onClick={handleCancel}
                variant="outline"
                size="sm"
              >
                <X size={16} className="mr-1" />
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSaveNew}
                className="bg-[#4400CC] hover:bg-[#3300AA]"
                size="sm"
              >
                <Save size={16} className="mr-1" />
                Adicionar
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Botão para adicionar nova formação */}
      {!isAdding && !disabled && editingIndex === null && (
        <Button
          type="button"
          onClick={handleAdd}
          className="w-full bg-[#4400CC]/10 hover:bg-[#4400CC]/20 text-[#4400CC] border border-dashed border-[#4400CC]/30"
        >
          <Plus size={18} className="mr-2" />
          Adicionar Formação
        </Button>
      )}
    </div>
  )
}
