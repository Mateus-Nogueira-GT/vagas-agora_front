"use client"

import { useState, useCallback } from 'react'
import { vagasApiService } from '../lib/api/vagas-api'
import { Vaga } from '../lib/vagas/vagas-types'

interface UseVagasRecentesState {
  vagasRecentes: Vaga[]
  isLoading: boolean
  error: string | null
}

interface UseVagasRecentesActions {
  loadVagasRecentes: (limit?: number) => Promise<void>
  clearError: () => void
}

export function useVagasRecentes(): UseVagasRecentesState & UseVagasRecentesActions {
  const [state, setState] = useState<UseVagasRecentesState>({
    vagasRecentes: [],
    isLoading: false,
    error: null
  })

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  const loadVagasRecentes = useCallback(async (limit: number = 6) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const vagas = await vagasApiService.getVagasRecentesPublicas(limit)

      setState(prev => ({
        ...prev,
        isLoading: false,
        vagasRecentes: vagas,
        error: null
      }))
    } catch (error) {
      console.error('Load vagas recentes error:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Erro ao carregar vagas recentes'
      }))
    }
  }, [])

  return {
    ...state,
    loadVagasRecentes,
    clearError
  }
}
