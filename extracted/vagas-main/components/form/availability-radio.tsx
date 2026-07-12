"use client"

import React from "react"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Clock, AlertCircle } from "lucide-react"

type DisponibilidadeType = "imediato" | "com_aviso_previo"

interface AvailabilityRadioProps {
  value: DisponibilidadeType
  onChange: (value: DisponibilidadeType) => void
  disabled?: boolean
}

export function AvailabilityRadio({
  value,
  onChange,
  disabled = false
}: AvailabilityRadioProps) {
  return (
    <div className="space-y-4">
      <RadioGroup
        value={value}
        onValueChange={(val) => onChange(val as DisponibilidadeType)}
        disabled={disabled}
        className="space-y-3"
      >
        {/* Início Imediato */}
        <div
          className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
            value === "imediato"
              ? "border-[#4400CC] bg-[#4400CC]/5"
              : "border-gray-200 hover:border-[#4400CC]/50"
          }`}
          onClick={() => !disabled && onChange("imediato")}
        >
          <RadioGroupItem
            value="imediato"
            id="imediato"
            className="mt-0.5"
          />
          <div className="flex-1">
            <Label
              htmlFor="imediato"
              className="font-medium text-gray-900 cursor-pointer"
            >
              Início Imediato
            </Label>
            <p className="text-sm text-gray-600 mt-1">
              Posso começar a trabalhar imediatamente após a contratação
            </p>
          </div>
        </div>

        {/* Com Aviso Prévio */}
        <div
          className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
            value === "com_aviso_previo"
              ? "border-[#4400CC] bg-[#4400CC]/5"
              : "border-gray-200 hover:border-[#4400CC]/50"
          }`}
          onClick={() => !disabled && onChange("com_aviso_previo")}
        >
          <RadioGroupItem
            value="com_aviso_previo"
            id="com_aviso_previo"
            className="mt-0.5"
          />
          <div className="flex-1">
            <Label
              htmlFor="com_aviso_previo"
              className="font-medium text-gray-900 cursor-pointer"
            >
              Com Aviso Prévio
            </Label>
            <p className="text-sm text-gray-600 mt-1">
              Preciso cumprir aviso prévio no emprego atual (normalmente 30 dias)
            </p>
          </div>
        </div>
      </RadioGroup>

      <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
        <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-blue-900">
          <strong>Dica:</strong> Seja transparente sobre sua disponibilidade. Empresas valorizam
          candidatos honestos sobre seus prazos.
        </p>
      </div>
    </div>
  )
}

/**
 * Hook para gerenciar estado de disponibilidade
 */
export function useAvailability(initialValue: DisponibilidadeType = "imediato") {
  const [disponibilidade, setDisponibilidade] = React.useState<DisponibilidadeType>(initialValue)

  return {
    disponibilidade,
    setDisponibilidade,
    isImediato: disponibilidade === "imediato",
    isComAvisoPrevio: disponibilidade === "com_aviso_previo"
  }
}
