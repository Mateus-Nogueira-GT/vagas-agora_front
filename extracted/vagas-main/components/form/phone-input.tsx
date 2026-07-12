"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatarTelefone, limparTelefone, validarTelefoneBrasileiro } from "@/lib/utils/format-phone"
import { Phone } from "lucide-react"

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
}

export function PhoneInput({
  value,
  onChange,
  label = "Telefone",
  placeholder = "(00) 0 0000-0000",
  required = false,
  disabled = false,
  error
}: PhoneInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const formatted = formatarTelefone(inputValue)

    // Armazenar valor formatado
    onChange(formatted)
  }

  // Validação visual
  const isValid = !value || validarTelefoneBrasileiro(value)
  const showError = value && !isValid

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor="phone-input" className="text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}

      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Phone className="h-4 w-4" />
        </div>

        <Input
          id="phone-input"
          type="tel"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`pl-10 ${showError ? 'border-red-500 focus:ring-red-500' : ''}`}
          maxLength={18} // "(00) 0 0000-0000"
        />
      </div>

      {showError && (
        <p className="text-xs text-red-500 mt-1">
          Telefone deve ter 10 ou 11 dígitos
        </p>
      )}

      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}

      {value && isValid && (
        <p className="text-xs text-green-600 mt-1">
          Formato válido
        </p>
      )}
    </div>
  )
}

/**
 * Hook para usar com formulários controlados
 */
export function usePhoneInput(initialValue: string = "") {
  const [phone, setPhone] = React.useState(initialValue)

  const getCleanValue = () => limparTelefone(phone)

  const isValid = validarTelefoneBrasileiro(phone)

  return {
    phone,
    setPhone,
    getCleanValue,
    isValid
  }
}
