"use client"

import React, { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Search, Loader2, CheckCircle2 } from "lucide-react"
import { geocodingService, Address } from "@/lib/services/geocoding-service"
import { ESTADOS_BRASIL, CIDADES_PRINCIPAIS, formatCEP, filterCidades } from "@/lib/data/brazil-locations"
import toast from "react-hot-toast"

interface LocationData {
  cep?: string
  logradouro?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade: string
  estado: string
  latitude?: number
  longitude?: number
}

interface LocationSelectorProps {
  value: LocationData
  onChange: (location: LocationData) => void
  required?: boolean
  disabled?: boolean
  showCoordinates?: boolean
}

export function LocationSelector({
  value,
  onChange,
  required = false,
  disabled = false,
  showCoordinates = true
}: LocationSelectorProps) {
  const [cep, setCep] = useState(value.cep || "")
  const [isBuscandoCEP, setIsBuscandoCEP] = useState(false)
  const [isBuscandoCoordenadas, setIsBuscandoCoordenadas] = useState(false)

  // Estados para autocomplete de cidades
  const [cidadeBusca, setCidadeBusca] = useState(value.cidade || "")
  const [cidadesSugestoes, setCidadesSugestoes] = useState<string[]>([])
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false)
  const sugestoesRef = useRef<HTMLDivElement>(null)

  // Atualizar sugestões quando estado ou busca mudar
  useEffect(() => {
    if (value.estado && cidadeBusca) {
      const sugestoes = filterCidades(value.estado, cidadeBusca, 15)
      setCidadesSugestoes(sugestoes)
    } else if (value.estado) {
      // Mostrar primeiras cidades se não houver busca
      setCidadesSugestoes(CIDADES_PRINCIPAIS[value.estado]?.slice(0, 15) || [])
    } else {
      setCidadesSugestoes([])
    }
  }, [value.estado, cidadeBusca])

  // Fechar sugestões ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sugestoesRef.current && !sugestoesRef.current.contains(event.target as Node)) {
        setMostrarSugestoes(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleBuscarCEP = async () => {
    if (!cep || cep.replace(/\D/g, '').length !== 8) {
      toast.error('CEP inválido')
      return
    }

    setIsBuscandoCEP(true)

    try {
      const queueSize = geocodingService.getQueueSize()
      if (queueSize > 0) {
        toast.loading(`Aguardando na fila... (${queueSize} na frente)`, { duration: 2000 })
      }

      const result = await geocodingService.getFullAddressByCEP(cep, value.numero)

      if (result.success && result.address) {
        const addr = result.address
        onChange({
          ...value,
          cep: addr.cep || cep,
          logradouro: addr.logradouro || value.logradouro || '',
          bairro: addr.bairro || value.bairro || '',
          cidade: addr.cidade,
          estado: addr.estado,
          latitude: addr.latitude,
          longitude: addr.longitude
        })

        setCidadeBusca(addr.cidade)

        if (addr.latitude && addr.longitude) {
          toast.success('Endereço encontrado com localização!')
        } else {
          toast.success('Endereço encontrado!')
        }
      } else {
        toast.error(result.error || 'CEP não encontrado')
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
      toast.error('Erro ao buscar CEP')
    } finally {
      setIsBuscandoCEP(false)
    }
  }

  const handleBuscarCoordenadas = async () => {
    if (!value.cidade || !value.estado) {
      toast.error('Preencha cidade e estado primeiro')
      return
    }

    setIsBuscandoCoordenadas(true)

    try {
      const queueSize = geocodingService.getQueueSize()
      if (queueSize > 0) {
        toast.loading(`Aguardando na fila... (${queueSize} requisição(ões) na frente)`, { duration: 2000 })
      } else {
        toast.loading('Buscando localização...', { duration: 1000 })
      }

      const result = await geocodingService.getCityCoordinates(value.cidade, value.estado)

      if (result.success && result.latitude && result.longitude) {
        onChange({
          ...value,
          latitude: result.latitude,
          longitude: result.longitude
        })
        toast.success('Localização encontrada!')
      } else {
        toast.error('Não foi possível encontrar as coordenadas')
      }
    } catch (error) {
      console.error('Erro ao buscar coordenadas:', error)
      toast.error('Erro ao buscar localização')
    } finally {
      setIsBuscandoCoordenadas(false)
    }
  }

  const handleCidadeChange = (inputValue: string) => {
    setCidadeBusca(inputValue)
    setMostrarSugestoes(true)
    onChange({
      ...value,
      cidade: inputValue,
      latitude: undefined,
      longitude: undefined
    })
  }

  const handleCidadeSelect = (cidadeSelecionada: string) => {
    setCidadeBusca(cidadeSelecionada)
    setMostrarSugestoes(false)
    onChange({
      ...value,
      cidade: cidadeSelecionada,
      latitude: undefined,
      longitude: undefined
    })
  }

  const handleEstadoChange = (novoEstado: string) => {
    onChange({
      ...value,
      estado: novoEstado,
      cidade: '',
      latitude: undefined,
      longitude: undefined
    })
    setCidadeBusca('')
  }

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const formatted = formatCEP(inputValue)
    setCep(formatted)
    onChange({ ...value, cep: formatted })
  }

  return (
    <div className="space-y-4">
      {/* CEP com busca automática */}
      <div className="space-y-2">
        <Label htmlFor="cep" className="text-sm font-medium text-gray-700">
          CEP {required && <span className="text-red-500">*</span>}
        </Label>
        <div className="flex gap-2">
          <Input
            id="cep"
            type="text"
            value={cep}
            onChange={handleCepChange}
            placeholder="00000-000"
            disabled={disabled}
            maxLength={9}
            className="flex-1"
          />
          <Button
            type="button"
            onClick={handleBuscarCEP}
            disabled={disabled || isBuscandoCEP || !cep}
            variant="outline"
            size="default"
          >
            {isBuscandoCEP ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Estado */}
      <div className="space-y-2">
        <Label htmlFor="estado" className="text-sm font-medium text-gray-700">
          Estado {required && <span className="text-red-500">*</span>}
        </Label>
        <Select
          value={value.estado}
          onValueChange={handleEstadoChange}
          disabled={disabled}
        >
          <SelectTrigger id="estado">
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
      <div className="space-y-2 relative" ref={sugestoesRef}>
        <Label htmlFor="cidade" className="text-sm font-medium text-gray-700">
          Cidade {required && <span className="text-red-500">*</span>}
        </Label>
        <Input
          id="cidade"
          type="text"
          value={cidadeBusca}
          onChange={(e) => handleCidadeChange(e.target.value)}
          onFocus={() => setMostrarSugestoes(true)}
          placeholder="Digite a cidade"
          disabled={disabled || !value.estado}
          autoComplete="off"
        />

        {/* Sugestões de cidades */}
        {mostrarSugestoes && cidadesSugestoes.length > 0 && (
          <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
            {cidadesSugestoes.map((cidade, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleCidadeSelect(cidade)}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 transition-colors"
              >
                {cidade}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Logradouro */}
      <div className="space-y-2">
        <Label htmlFor="logradouro" className="text-sm font-medium text-gray-700">
          Logradouro (Rua, Av, etc)
        </Label>
        <Input
          id="logradouro"
          type="text"
          value={value.logradouro || ''}
          onChange={(e) => onChange({ ...value, logradouro: e.target.value })}
          placeholder="Nome da rua"
          disabled={disabled}
        />
      </div>

      {/* Número e Complemento */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="numero" className="text-sm font-medium text-gray-700">
            Número
          </Label>
          <Input
            id="numero"
            type="text"
            value={value.numero || ''}
            onChange={(e) => onChange({ ...value, numero: e.target.value })}
            placeholder="123"
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="complemento" className="text-sm font-medium text-gray-700">
            Complemento
          </Label>
          <Input
            id="complemento"
            type="text"
            value={value.complemento || ''}
            onChange={(e) => onChange({ ...value, complemento: e.target.value })}
            placeholder="Apto, Sala, etc"
            disabled={disabled}
          />
        </div>
      </div>

      {/* Bairro */}
      <div className="space-y-2">
        <Label htmlFor="bairro" className="text-sm font-medium text-gray-700">
          Bairro
        </Label>
        <Input
          id="bairro"
          type="text"
          value={value.bairro || ''}
          onChange={(e) => onChange({ ...value, bairro: e.target.value })}
          placeholder="Nome do bairro"
          disabled={disabled}
        />
      </div>

      {/* Coordenadas */}
      {showCoordinates && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700">
              Localização GPS
            </Label>
            <Button
              type="button"
              onClick={handleBuscarCoordenadas}
              disabled={disabled || isBuscandoCoordenadas || !value.cidade || !value.estado}
              variant="outline"
              size="sm"
            >
              {isBuscandoCoordenadas ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin mr-2" />
                  Buscando...
                </>
              ) : (
                <>
                  <MapPin className="h-3 w-3 mr-2" />
                  Buscar Localização
                </>
              )}
            </Button>
          </div>

          {value.latitude && value.longitude ? (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded">
              <CheckCircle2 className="h-4 w-4" />
              <span>
                Lat: {value.latitude.toFixed(6)}, Long: {value.longitude.toFixed(6)}
              </span>
            </div>
          ) : (
            <p className="text-xs text-gray-500">
              Localização GPS não definida. Use o botão acima para buscar automaticamente.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
