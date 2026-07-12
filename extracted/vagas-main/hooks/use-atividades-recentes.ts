"use client"

import { useState, useCallback } from 'react'
import { candidatosApiService } from '../lib/api/candidatos-api'
import { useAuth } from './use-auth'

interface AtividadeRecente {
  tipo: 'visualizacao' | 'candidatura' | 'recomendacao'
  titulo: string
  data: string
  icone: string
  empresa?: string
  status?: string
}

interface UseAtividadesRecentesState {
  atividades: AtividadeRecente[]
  isLoading: boolean
  error: string | null
}

interface UseAtividadesRecentesActions {
  loadAtividadesRecentes: (limit?: number) => Promise<void>
  clearError: () => void
}

export function useAtividadesRecentes(): UseAtividadesRecentesState & UseAtividadesRecentesActions {
  const { user } = useAuth()
  const [state, setState] = useState<UseAtividadesRecentesState>({
    atividades: [],
    isLoading: false,
    error: null
  })

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  const loadAtividadesRecentes = useCallback(async (limit: number = 10) => {
    if (!user?.id) {
      setState(prev => ({ ...prev, error: 'Usuário não autenticado' }))
      return
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const atividades = await candidatosApiService.getAtividadesRecentes(user.id, limit)

      setState(prev => ({
        ...prev,
        isLoading: false,
        atividades,
        error: null
      }))
    } catch (error) {
      console.error('Load atividades recentes error:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Erro ao carregar atividades recentes'
      }))
    }
  }, [user?.id])

  return {
    ...state,
    loadAtividadesRecentes,
    clearError
  }
}
