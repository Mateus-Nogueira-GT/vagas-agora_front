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

export interface Idioma {
  idioma: string
  nivel: 'basico' | 'intermediario' | 'avancado' | 'fluente' | 'nativo'
}

interface LanguageManagerProps {
  languages: Idioma[]
  onChange: (languages: Idioma[]) => void
  disabled?: boolean
}

export default function LanguageManager({ languages, onChange, disabled }: LanguageManagerProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [currentLang, setCurrentLang] = useState<Idioma>({
    idioma: '',
    nivel: 'basico'
  })
  const [isAdding, setIsAdding] = useState(false)
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customLanguage, setCustomLanguage] = useState('')

  const predefinedLanguages = [
    { value: 'ingles', label: 'Inglês' },
    { value: 'espanhol', label: 'Espanhol' },
    { value: 'frances', label: 'Francês' },
    { value: 'alemao', label: 'Alemão' },
    { value: 'italiano', label: 'Italiano' },
    { value: 'portugues', label: 'Português' },
    { value: 'mandarim', label: 'Mandarim' },
    { value: 'japones', label: 'Japonês' },
    { value: 'coreano', label: 'Coreano' },
    { value: 'russo', label: 'Russo' },
    { value: 'arabe', label: 'Árabe' },
  ]

  const handleAdd = () => {
    setIsAdding(true)
    setShowCustomInput(false)
    setCustomLanguage('')
    setCurrentLang({
      idioma: '',
      nivel: 'basico'
    })
  }

  const handleSaveNew = () => {
    const languageToSave = showCustomInput ? customLanguage : currentLang.idioma

    if (!languageToSave.trim()) {
      toast.error('Selecione ou digite um idioma')
      return
    }

    onChange([...languages, { ...currentLang, idioma: languageToSave }])
    setIsAdding(false)
    setShowCustomInput(false)
    setCustomLanguage('')
    setCurrentLang({
      idioma: '',
      nivel: 'basico'
    })
    toast.success('Idioma adicionado com sucesso')
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingIndex(null)
    setShowCustomInput(false)
    setCustomLanguage('')
    setCurrentLang({
      idioma: '',
      nivel: 'basico'
    })
  }

  const handleEdit = (index: number) => {
    setEditingIndex(index)
    const lang = languages[index]
    setCurrentLang({ ...lang })

    // Verificar se o idioma é customizado
    const isPredefined = predefinedLanguages.some(pl => pl.value === lang.idioma)
    if (!isPredefined) {
      setShowCustomInput(true)
      setCustomLanguage(lang.idioma)
    } else {
      setShowCustomInput(false)
      setCustomLanguage('')
    }
  }

  const handleSaveEdit = () => {
    const languageToSave = showCustomInput ? customLanguage : currentLang.idioma

    if (!languageToSave.trim()) {
      toast.error('Selecione ou digite um idioma')
      return
    }

    const updated = [...languages]
    updated[editingIndex!] = { ...currentLang, idioma: languageToSave }
    onChange(updated)
    setEditingIndex(null)
    setShowCustomInput(false)
    setCustomLanguage('')
    toast.success('Idioma atualizado com sucesso')
  }

  const handleDelete = (index: number) => {
    const updated = languages.filter((_, i) => i !== index)
    onChange(updated)
    toast.success('Idioma removido com sucesso')
  }

  const handleLanguageSelectChange = (value: string) => {
    if (value === 'outro') {
      setShowCustomInput(true)
      setCustomLanguage('')
      setCurrentLang({ ...currentLang, idioma: '' })
    } else {
      setShowCustomInput(false)
      setCustomLanguage('')
      setCurrentLang({ ...currentLang, idioma: value })
    }
  }

  const getNivelLabel = (nivel: string) => {
    const labels: Record<string, string> = {
      basico: 'Básico',
      intermediario: 'Intermediário',
      avancado: 'Avançado',
      fluente: 'Fluente',
      nativo: 'Nativo'
    }
    return labels[nivel] || nivel
  }

  const getLanguageLabel = (idioma: string) => {
    const found = predefinedLanguages.find(pl => pl.value === idioma)
    return found ? found.label : idioma.charAt(0).toUpperCase() + idioma.slice(1)
  }

  return (
    <div className="space-y-4">
      {/* Lista de idiomas existentes */}
      {languages.map((lang, index) => (
        <Card key={index} className="p-4 border-[#4400CC]/20 bg-[#4400CC]/5">
          {editingIndex === index ? (
            // Modo de edição
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`idioma-${index}`}>Idioma *</Label>
                  {showCustomInput ? (
                    <div className="space-y-2">
                      <Input
                        id={`idioma-custom-${index}`}
                        value={customLanguage}
                        onChange={(e) => setCustomLanguage(e.target.value)}
                        placeholder="Digite o nome do idioma"
                        className="border-[#4400CC]/30"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowCustomInput(false)
                          setCustomLanguage('')
                        }}
                        className="text-xs text-[#4400CC]"
                      >
                        Voltar para lista
                      </Button>
                    </div>
                  ) : (
                    <Select
                      value={currentLang.idioma}
                      onValueChange={handleLanguageSelectChange}
                    >
                      <SelectTrigger className="border-[#4400CC]/30">
                        <SelectValue placeholder="Selecione o idioma" />
                      </SelectTrigger>
                      <SelectContent>
                        {predefinedLanguages.map(lang => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                        <SelectItem value="outro">Outro (digitar)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`nivel-${index}`}>Nível *</Label>
                  <Select
                    value={currentLang.nivel}
                    onValueChange={(value) => setCurrentLang({ ...currentLang, nivel: value as any })}
                  >
                    <SelectTrigger className="border-[#4400CC]/30">
                      <SelectValue placeholder="Selecione o nível" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basico">Básico</SelectItem>
                      <SelectItem value="intermediario">Intermediário</SelectItem>
                      <SelectItem value="avancado">Avançado</SelectItem>
                      <SelectItem value="fluente">Fluente</SelectItem>
                      <SelectItem value="nativo">Nativo</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <h4 className="font-semibold text-lg text-[#4400CC]">{getLanguageLabel(lang.idioma)}</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="text-sm px-2 py-1 bg-[#4400CC]/10 text-[#4400CC] rounded">
                      {getNivelLabel(lang.nivel)}
                    </span>
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
            </div>
          )}
        </Card>
      ))}

      {/* Formulário para adicionar novo idioma */}
      {isAdding && (
        <Card className="p-4 border-[#4400CC]/30 border-dashed">
          <div className="space-y-4">
            <h4 className="font-medium text-[#4400CC] flex items-center">
              <Plus size={18} className="mr-2" />
              Novo Idioma
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-idioma">Idioma *</Label>
                {showCustomInput ? (
                  <div className="space-y-2">
                    <Input
                      id="new-idioma-custom"
                      value={customLanguage}
                      onChange={(e) => setCustomLanguage(e.target.value)}
                      placeholder="Digite o nome do idioma (ex: Catalão, Sueco, etc)"
                      className="border-[#4400CC]/30"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowCustomInput(false)
                        setCustomLanguage('')
                      }}
                      className="text-xs text-[#4400CC]"
                    >
                      ← Voltar para lista
                    </Button>
                  </div>
                ) : (
                  <Select
                    value={currentLang.idioma}
                    onValueChange={handleLanguageSelectChange}
                  >
                    <SelectTrigger className="border-[#4400CC]/30">
                      <SelectValue placeholder="Selecione o idioma" />
                    </SelectTrigger>
                    <SelectContent>
                      {predefinedLanguages.map(lang => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                      <SelectItem value="outro">
                        <span className="flex items-center">
                          ✏️ Outro (digitar manualmente)
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-nivel">Nível *</Label>
                <Select
                  value={currentLang.nivel}
                  onValueChange={(value) => setCurrentLang({ ...currentLang, nivel: value as any })}
                >
                  <SelectTrigger className="border-[#4400CC]/30">
                    <SelectValue placeholder="Selecione o nível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basico">Básico</SelectItem>
                    <SelectItem value="intermediario">Intermediário</SelectItem>
                    <SelectItem value="avancado">Avançado</SelectItem>
                    <SelectItem value="fluente">Fluente</SelectItem>
                    <SelectItem value="nativo">Nativo</SelectItem>
                  </SelectContent>
                </Select>
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

      {/* Botão para adicionar novo idioma */}
      {!isAdding && !disabled && editingIndex === null && (
        <Button
          type="button"
          onClick={handleAdd}
          className="w-full bg-[#4400CC]/10 hover:bg-[#4400CC]/20 text-[#4400CC] border border-dashed border-[#4400CC]/30"
        >
          <Plus size={18} className="mr-2" />
          Adicionar Idioma
        </Button>
      )}
    </div>
  )
}
