'use client'

import { useEffect } from 'react'

interface RastreadorVisualizacaoProps {
  vagaId: string
}

// Cache de visualizações da sessão atual (evita múltiplas chamadas à API na mesma navegação)
const visualizacoesRegistradas = new Set<string>()

// Função para gerar hash do navegador
function gerarHashNavegador(): string {
  const navegadorInfo = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset()
  ].join('|')

  let hash = 0
  for (let i = 0; i < navegadorInfo.length; i++) {
    const char = navegadorInfo.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }

  return Math.abs(hash).toString(36)
}

// Função para obter ou criar o hash do visualizador
function obterHashVisualizador(): string {
  const STORAGE_KEY = 'visualizador_hash'

  let hash = localStorage.getItem(STORAGE_KEY)

  if (!hash) {
    hash = gerarHashNavegador()
    localStorage.setItem(STORAGE_KEY, hash)
  }

  return hash
}

export function RastreadorVisualizacao({ vagaId }: RastreadorVisualizacaoProps) {
  useEffect(() => {
    // Se já registrou nesta sessão, não registrar novamente
    if (visualizacoesRegistradas.has(vagaId)) {
      return
    }

    const registrarVisualizacao = async () => {
      try {
        const visualizadorHash = obterHashVisualizador()

        // Marcar como registrado ANTES da chamada para evitar duplicatas
        visualizacoesRegistradas.add(vagaId)

        await fetch(`/api/vagas/${vagaId}/visualizacoes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ visualizadorHash })
        })
      } catch (error) {
        // Falha silenciosa - não deve afetar a experiência do usuário
        console.error('Erro ao registrar visualização:', error)
        // Remover do cache em caso de erro para tentar novamente
        visualizacoesRegistradas.delete(vagaId)
      }
    }

    // Registrar após um pequeno delay para garantir que é uma visualização real
    const timer = setTimeout(registrarVisualizacao, 1000)

    return () => clearTimeout(timer)
  }, [vagaId])

  return null
}
