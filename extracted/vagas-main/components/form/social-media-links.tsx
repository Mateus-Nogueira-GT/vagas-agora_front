"use client"

import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Linkedin, Github, Globe, Instagram, Facebook, Youtube, ExternalLink, CheckCircle2, X } from "lucide-react"

export interface SocialMediaData {
  linkedin_url?: string
  github_url?: string
  site_pessoal?: string
  instagram_url?: string
  facebook_url?: string
  youtube_url?: string
  portfolio_url?: string
}

interface SocialMediaLinksProps {
  value: SocialMediaData
  onChange: (data: SocialMediaData) => void
  disabled?: boolean
}

export function SocialMediaLinks({
  value,
  onChange,
  disabled = false
}: SocialMediaLinksProps) {
  const handleChange = (field: keyof SocialMediaData, url: string) => {
    onChange({
      ...value,
      [field]: url
    })
  }

  const isValidUrl = (url: string): boolean => {
    if (!url) return true // Empty is valid (optional)
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 mb-4">Todas as redes sociais são opcionais</p>

      {/* LinkedIn */}
      <SocialMediaInput
        icon={<Linkedin className="h-4 w-4" />}
        label="LinkedIn"
        placeholder="https://www.linkedin.com/in/seu-perfil"
        value={value.linkedin_url || ''}
        onChange={(val) => handleChange('linkedin_url', val)}
        disabled={disabled}
        color="#0A66C2"
      />

      {/* GitHub */}
      <SocialMediaInput
        icon={<Github className="h-4 w-4" />}
        label="GitHub"
        placeholder="https://github.com/seu-usuario"
        value={value.github_url || ''}
        onChange={(val) => handleChange('github_url', val)}
        disabled={disabled}
        color="#181717"
      />

      {/* Portfolio / Site Pessoal */}
      <SocialMediaInput
        icon={<Globe className="h-4 w-4" />}
        label="Portfolio / Site Pessoal"
        placeholder="https://seuportfolio.com"
        value={value.portfolio_url || value.site_pessoal || ''}
        onChange={(val) => {
          handleChange('portfolio_url', val)
          handleChange('site_pessoal', val)
        }}
        disabled={disabled}
        color="#4400CC"
      />

      {/* Instagram */}
      <SocialMediaInput
        icon={<Instagram className="h-4 w-4" />}
        label="Instagram"
        placeholder="https://www.instagram.com/seu-usuario"
        value={value.instagram_url || ''}
        onChange={(val) => handleChange('instagram_url', val)}
        disabled={disabled}
        color="#E4405F"
      />

      {/* Facebook */}
      <SocialMediaInput
        icon={<Facebook className="h-4 w-4" />}
        label="Facebook"
        placeholder="https://www.facebook.com/seu-perfil"
        value={value.facebook_url || ''}
        onChange={(val) => handleChange('facebook_url', val)}
        disabled={disabled}
        color="#1877F2"
      />

      {/* YouTube */}
      <SocialMediaInput
        icon={<Youtube className="h-4 w-4" />}
        label="YouTube"
        placeholder="https://www.youtube.com/@seu-canal"
        value={value.youtube_url || ''}
        onChange={(val) => handleChange('youtube_url', val)}
        disabled={disabled}
        color="#FF0000"
      />
    </div>
  )
}

interface SocialMediaInputProps {
  icon: React.ReactNode
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  disabled: boolean
  color: string
}

function SocialMediaInput({
  icon,
  label,
  placeholder,
  value,
  onChange,
  disabled,
  color
}: SocialMediaInputProps) {
  const isValid = !value || isValidUrl(value)
  const hasValue = !!value && isValid

  return (
    <div className="space-y-2">
      <Label htmlFor={label.toLowerCase()} className="text-sm font-medium text-gray-700 flex items-center gap-2">
        <span style={{ color }}>{icon}</span>
        {label}
      </Label>

      <div className="relative">
        <Input
          id={label.toLowerCase()}
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`pr-10 ${!isValid ? 'border-red-500 focus:ring-red-500' : ''} ${hasValue ? 'border-green-500' : ''}`}
        />

        {/* Ícone de status */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {hasValue ? (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-700"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          ) : value && !isValid ? (
            <X className="h-4 w-4 text-red-500" />
          ) : null}
        </div>
      </div>

      {value && !isValid && (
        <p className="text-xs text-red-500">URL inválida. Deve começar com http:// ou https://</p>
      )}
    </div>
  )
}

function isValidUrl(url: string): boolean {
  if (!url) return true
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}
