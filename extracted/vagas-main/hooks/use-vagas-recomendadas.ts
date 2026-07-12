"use client"

import { useState, useCallback } from 'react'
import { vagasApiService } from '../lib/api/vagas-api'
import { useAuth } from './use-auth'
import { Vaga } from '../lib/vagas/vagas-types'

interface VagaRecomendada extends Vaga {
  match_score: number
  match_reasons: string[]
}

interface UseVagasRecomendadasState {
  vagasRecomendadas: VagaRecomendada[]
  isLoading: boolean
  error: string | null
  total: number
}

interface UseVagasRecomendadasActions {
  loadVagasRecomendadas: (limit?: number) => Promise<void>
  clearError: () => void
}

export function useVagasRecomendadas(): UseVagasRecomendadasState & UseVagasRecomendadasActions {
  const { user } = useAuth()
  const [state, setState] = useState<UseVagasRecomendadasState>({
    vagasRecomendadas: [],
    isLoading: false,
    error: null,
    total: 0
  })

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  const loadVagasRecomendadas = useCallback(async (limit: number = 5) => {
    if (!user?.id) {
      setState(prev => ({ ...prev, error: 'Usuário não autenticado' }))
      return
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const resultado = await vagasApiService.getVagasRecomendadas(user.id, limit)

      setState(prev => ({
        ...prev,
        isLoading: false,
        vagasRecomendadas: resultado.vagas,
        total: resultado.total,
        error: null
      }))
    } catch (error) {
      console.error('Load vagas recomendadas error:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Erro ao carregar vagas recomendadas'
      }))
    }
  }, [user?.id])

  return {
    ...state,
    loadVagasRecomendadas,
    clearError
  }
}
