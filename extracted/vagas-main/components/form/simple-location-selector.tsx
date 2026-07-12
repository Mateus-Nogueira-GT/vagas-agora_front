"use client"

import React, { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, CheckCircle2 } from "lucide-react"
import { ESTADOS_BRASIL, filterCidades } from "@/lib/data/brazil-locations"

interface SimpleLocationData {
  cidade: string
  estado: string
  latitude?: number
  longitude?: number
}

interface SimpleLocationSelectorProps {
  value: SimpleLocationData
  onChange: (location: SimpleLocationData) => void
  disabled?: boolean
}

export function SimpleLocationSelector({
  value,
  onChange,
  disabled = false
}: SimpleLocationSelectorProps) {
  // Estados para autocomplete de cidades
  const [cidadeBusca, setCidadeBusca] = useState(value.cidade || "")
  const [cidadesSugestoes, setCidadesSugestoes] = useState<string[]>([])
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false)
  const [buscandoCoordenadas, setBuscandoCoordenadas] = useState(false)

  // Limpar busca quando trocar de estado (só quando cidade for vazia)
  useEffect(() => {
    if (!value.cidade) {
      setCidadeBusca('')
    }
  }, [value.estado, value.cidade])

  // Atualizar sugestões quando estado ou busca mudar
  useEffect(() => {
    if (value.estado && cidadeBusca) {
      const sugestoes = filterCidades(value.estado, cidadeBusca, 15)
      setCidadesSugestoes(sugestoes)
    } else if (value.estado) {
      // Mostrar primeiras cidades se não houver busca
      const todasCidades = filterCidades(value.estado, "", 15)
      setCidadesSugestoes(todasCidades)
    } else {
      setCidadesSugestoes([])
    }
  }, [value.estado, cidadeBusca])

  // Buscar coordenadas automaticamente quando cidade e estado estiverem preenchidos
  useEffect(() => {
    const buscarCoordenadas = async () => {
      // Só busca se tiver cidade E estado, e ainda não tiver coordenadas
      if (value.cidade && value.estado && !value.latitude && !value.longitude) {
        setBuscandoCoordenadas(true)

        try {
          // Usar API Route do Next.js ao invés de chamar Nominatim diretamente (evita CORS)
          const params = new URLSearchParams({
            cidade: value.cidade,
            estado: value.estado
          })

          const response = await fetch(`/api/geocoding?${params}`)
          const result = await response.json()

          if (result.success && result.latitude && result.longitude) {
            // Usar callback para não depender de value na dependência
            onChange({
              cidade: value.cidade,
              estado: value.estado,
              latitude: result.latitude,
              longitude: result.longitude
            })
          } else {
            console.warn('⚠️ Não foi possível encontrar coordenadas:', result.error)
          }
        } catch (error) {
          console.error('Erro ao buscar coordenadas:', error)
        } finally {
          setBuscandoCoordenadas(false)
        }
      }
    }

    buscarCoordenadas()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.cidade, value.estado, value.latitude, value.longitude])

  const handleEstadoChange = (novoEstado: string) => {
    onChange({
      estado: novoEstado,
      cidade: '', // Limpa cidade ao mudar estado
      latitude: undefined, // Limpa coordenadas
      longitude: undefined
    })
    setCidadeBusca('')
  }

  const handleCidadeChange = (inputValue: string) => {
    setCidadeBusca(inputValue)
    setMostrarSugestoes(true)
    // NÃO chama onChange enquanto digita - apenas atualiza busca local
  }

  const handleCidadeSelect = (cidadeSelecionada: string) => {
    setCidadeBusca(cidadeSelecionada)
    setMostrarSugestoes(false)
    onChange({
      ...value,
      cidade: cidadeSelecionada,
      latitude: undefined, // Limpa coordenadas - serão buscadas automaticamente
      longitude: undefined
    })
  }

  return (
    <div className="space-y-4">
      {/* Estado */}
      <div className="space-y-2">
        <Label htmlFor="estado" className="text-gray-700">
          Estado
        </Label>
        <Select
          value={value.estado}
          onValueChange={handleEstadoChange}
          disabled={disabled}
        >
          <SelectTrigger id="estado" className="border-[#4400CC]/30 focus:ring-[#4400CC]">
            <SelectValue placeholder="Selecione o estado" />
          </SelectTrigger>
          <SelectContent>
            {ESTADOS_BRASIL.map((estado) => (
              <SelectItem key={estado.sigla} value={estado.sigla}>
                {estado.nome} ({estado.sigla})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Cidade com autocomplete */}
      <div className="space-y-2 relative">
        <Label htmlFor="cidade" className="text-gray-700">
          Cidade
        </Label>
        <Input
          id="cidade"
          type="text"
          value={cidadeBusca}
          onChange={(e) => handleCidadeChange(e.target.value)}
          onFocus={() => setMostrarSugestoes(true)}
          onBlur={() => setTimeout(() => setMostrarSugestoes(false), 200)}
          placeholder={value.estado ? "Digite para buscar..." : "Selecione o estado primeiro"}
          disabled={disabled || !value.estado}
          className={`${!value.estado ? 'bg-gray-100 cursor-not-allowed' : 'border-[#4400CC]/30 focus-visible:ring-[#4400CC]'}`}
          autoComplete="off"
        />

        {/* Sugestões de cidades */}
        {mostrarSugestoes && !disabled && value.estado && cidadesSugestoes.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {cidadesSugestoes.map((cidade, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleCidadeSelect(cidade)}
                className="w-full text-left px-4 py-2 hover:bg-[#4400CC]/10 transition-colors cursor-pointer"
              >
                {cidade}
              </button>
            ))}
          </div>
        )}

        {value.estado && cidadesSugestoes.length === 0 && cidadeBusca && !disabled && (
          <p className="text-xs text-gray-500 mt-1">
            Nenhuma cidade encontrada. Tente outra busca.
          </p>
        )}
      </div>

      {/* Mostrar loading quando estiver buscando */}
      {buscandoCoordenadas && value.cidade && value.estado && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800 flex items-center">
            <MapPin size={16} className="mr-2 animate-pulse" />
            Buscando localização...
          </p>
        </div>
      )}

      {/* Mostrar sucesso quando encontrar coordenadas */}
      {value.latitude && value.longitude && value.cidade && value.estado && !buscandoCoordenadas && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-800 flex items-center">
            <CheckCircle2 size={16} className="mr-2" />
            Localização encontrada com sucesso!
          </p>
        </div>
      )}
    </div>
  )
}
