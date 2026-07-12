"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Trash2, Edit2, Save, X, Briefcase } from "lucide-react"
import { ExperienciaProfissional } from "@/lib/candidatos/candidatos-types"

interface ExperienceManagerProps {
  experiences: ExperienciaProfissional[]
  onChange: (experiences: ExperienciaProfissional[]) => void
  disabled?: boolean
}

export function ExperienceManager({ experiences, onChange, disabled = false }: ExperienceManagerProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [currentExp, setCurrentExp] = useState<ExperienciaProfissional>({
    empresa: '',
    cargo: '',
    data_inicio: '',
    data_fim: '',
    atual: false,
    descricao: ''
  })

  const handleAdd = () => {
    setIsAdding(true)
    setCurrentExp({
      empresa: '',
      cargo: '',
      data_inicio: '',
      data_fim: '',
      atual: false,
      descricao: ''
    })
  }

  const handleEdit = (index: number) => {
    setEditingIndex(index)
    setCurrentExp({ ...experiences[index] })
  }

  const handleSave = () => {
    if (!currentExp.empresa || !currentExp.cargo || !currentExp.data_inicio) {
      return
    }

    let newExperiences: ExperienciaProfissional[]

    if (isAdding) {
      newExperiences = [...experiences, currentExp]
    } else if (editingIndex !== null) {
      newExperiences = experiences.map((exp, idx) =>
        idx === editingIndex ? currentExp : exp
      )
    } else {
      return
    }

    onChange(newExperiences)
    handleCancel()
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingIndex(null)
    setCurrentExp({
      empresa: '',
      cargo: '',
      data_inicio: '',
      data_fim: '',
      atual: false,
      descricao: ''
    })
  }

  const handleDelete = (index: number) => {
    const newExperiences = experiences.filter((_, idx) => idx !== index)
    onChange(newExperiences)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const [year, month] = dateString.split('-')
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    return `${months[parseInt(month) - 1]} ${year}`
  }

  return (
    <div className="space-y-4">
      {/* Lista de experiências existentes */}
      {experiences.map((exp, index) => (
        <Card key={index} className="p-4 border-[#4400CC]/20 bg-[#4400CC]/5">
          {editingIndex === index ? (
            // Modo de edição
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`empresa-${index}`}>Empresa *</Label>
                    <Input
                      id={`empresa-${index}`}
                      value={currentExp.empresa}
                      onChange={(e) => setCurrentExp({ ...currentExp, empresa: e.target.value })}
                      placeholder="Nome da empresa"
                      className="border-[#4400CC]/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`cargo-${index}`}>Cargo *</Label>
                    <Input
                      id={`cargo-${index}`}
                      value={currentExp.cargo}
                      onChange={(e) => setCurrentExp({ ...currentExp, cargo: e.target.value })}
                      placeholder="Seu cargo"
                      className="border-[#4400CC]/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`data-inicio-${index}`}>Data de início *</Label>
                    <Input
                      id={`data-inicio-${index}`}
                      type="month"
                      value={currentExp.data_inicio}
                      onChange={(e) => setCurrentExp({ ...currentExp, data_inicio: e.target.value })}
                      className="border-[#4400CC]/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`data-fim-${index}`}>Data de término</Label>
                    <Input
                      id={`data-fim-${index}`}
                      type="month"
                      value={currentExp.data_fim}
                      onChange={(e) => setCurrentExp({ ...currentExp, data_fim: e.target.value })}
                      disabled={currentExp.atual}
                      className="border-[#4400CC]/30"
                    />
                  </div>

                  <div className="flex items-center space-x-2 md:col-span-2">
                    <Checkbox
                      id={`atual-${index}`}
                      checked={currentExp.atual}
                      onCheckedChange={(checked) => {
                        setCurrentExp({
                          ...currentExp,
                          atual: checked === true,
                          data_fim: checked === true ? '' : currentExp.data_fim
                        })
                      }}
                    />
                    <Label htmlFor={`atual-${index}`} className="cursor-pointer">
                      Trabalho aqui atualmente
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`descricao-${index}`}>Descrição das atividades</Label>
                  <Textarea
                    id={`descricao-${index}`}
                    value={currentExp.descricao}
                    onChange={(e) => setCurrentExp({ ...currentExp, descricao: e.target.value })}
                    placeholder="Descreva suas principais responsabilidades e conquistas..."
                    rows={4}
                    className="border-[#4400CC]/30"
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    size="sm"
                  >
                    <X size={16} className="mr-1" />
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
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
                    <h4 className="font-semibold text-lg text-[#4400CC]">{exp.cargo}</h4>
                    <p className="text-gray-700 font-medium">{exp.empresa}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="text-sm px-2 py-1 bg-[#4400CC]/10 text-[#4400CC] rounded">
                        {formatDate(exp.data_inicio)} - {exp.atual ? 'Atual' : formatDate(exp.data_fim || '')}
                      </span>
                      {exp.atual && (
                        <span className="text-sm px-2 py-1 bg-[#00FFAE]/20 text-[#4400CC] rounded font-medium">
                          Emprego Atual
                        </span>
                      )}
                    </div>
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
                {exp.descricao && (
                  <p className="text-gray-600 text-sm whitespace-pre-line mt-2">{exp.descricao}</p>
                )}
              </div>
            )}
        </Card>
      ))}

      {/* Formulário de nova experiência */}
      {isAdding && (
        <Card className="p-4 border-[#4400CC]/30 border-dashed">
          <div className="space-y-4">
            <h4 className="font-medium text-[#4400CC] flex items-center">
              <Plus size={18} className="mr-2" />
              Nova Experiência Profissional
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nova-empresa">Empresa *</Label>
                <Input
                  id="nova-empresa"
                  value={currentExp.empresa}
                  onChange={(e) => setCurrentExp({ ...currentExp, empresa: e.target.value })}
                  placeholder="Nome da empresa"
                  className="border-[#4400CC]/30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="novo-cargo">Cargo *</Label>
                <Input
                  id="novo-cargo"
                  value={currentExp.cargo}
                  onChange={(e) => setCurrentExp({ ...currentExp, cargo: e.target.value })}
                  placeholder="Seu cargo"
                  className="border-[#4400CC]/30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nova-data-inicio">Data de início *</Label>
                <Input
                  id="nova-data-inicio"
                  type="month"
                  value={currentExp.data_inicio}
                  onChange={(e) => setCurrentExp({ ...currentExp, data_inicio: e.target.value })}
                  className="border-[#4400CC]/30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nova-data-fim">Data de término</Label>
                <Input
                  id="nova-data-fim"
                  type="month"
                  value={currentExp.data_fim}
                  onChange={(e) => setCurrentExp({ ...currentExp, data_fim: e.target.value })}
                  disabled={currentExp.atual}
                  className="border-[#4400CC]/30"
                />
              </div>

              <div className="flex items-center space-x-2 md:col-span-2">
                <Checkbox
                  id="nova-atual"
                  checked={currentExp.atual}
                  onCheckedChange={(checked) => {
                    setCurrentExp({
                      ...currentExp,
                      atual: checked === true,
                      data_fim: checked === true ? '' : currentExp.data_fim
                    })
                  }}
                />
                <Label htmlFor="nova-atual" className="cursor-pointer">
                  Trabalho aqui atualmente
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nova-descricao">Descrição das atividades</Label>
              <Textarea
                id="nova-descricao"
                value={currentExp.descricao}
                onChange={(e) => setCurrentExp({ ...currentExp, descricao: e.target.value })}
                placeholder="Descreva suas principais responsabilidades e conquistas..."
                rows={4}
                className="border-[#4400CC]/30"
              />
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
                onClick={handleSave}
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

      {/* Botão para adicionar nova experiência */}
      {!isAdding && !disabled && editingIndex === null && (
        <Button
          type="button"
          onClick={handleAdd}
          className="w-full bg-[#4400CC]/10 hover:bg-[#4400CC]/20 text-[#4400CC] border border-dashed border-[#4400CC]/30"
        >
          <Plus size={18} className="mr-2" />
          Adicionar Experiência Profissional
        </Button>
      )}
    </div>
  )
}
