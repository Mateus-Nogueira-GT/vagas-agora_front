"use client"

import { useState, useCallback } from 'react'
import { candidatosApiService } from '../lib/api/candidatos-api'
import { useAuth } from './use-auth'
import { CurriculoVisualizacoesStats } from '../lib/candidatos/candidatos-types'

interface UseEstatisticasVisualizacoesState {
  estatisticas: CurriculoVisualizacoesStats | null
  isLoading: boolean
  error: string | null
}

interface UseEstatisticasVisualizacoesActions {
  loadEstatisticasVisualizacoes: () => Promise<void>
  clearError: () => void
}

export function useEstatisticasVisualizacoes(): UseEstatisticasVisualizacoesState & UseEstatisticasVisualizacoesActions {
  const { user } = useAuth()
  const [state, setState] = useState<UseEstatisticasVisualizacoesState>({
    estatisticas: null,
    isLoading: false,
    error: null
  })

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  const loadEstatisticasVisualizacoes = useCallback(async () => {
    if (!user?.id) {
      setState(prev => ({ ...prev, error: 'Usuário não autenticado' }))
      return
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const estatisticas = await candidatosApiService.getEstatisticasVisualizacoes(user.id)

      setState(prev => ({
        ...prev,
        isLoading: false,
        estatisticas,
        error: null
      }))
    } catch (error) {
      console.error('Load estatisticas visualizacoes error:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Erro ao carregar estatísticas de visualizações'
      }))
    }
  }, [user?.id])

  return {
    ...state,
    loadEstatisticasVisualizacoes,
    clearError
  }
}
