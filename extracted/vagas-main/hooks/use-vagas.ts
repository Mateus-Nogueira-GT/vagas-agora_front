"use client"

import { useState, useEffect, useCallback } from 'react'
import { vagasService } from '../lib/vagas/vagas-service'
import { useAuth } from './use-auth'
import { 
  Vaga, 
  CreateVagaRequest, 
  UpdateVagaRequest, 
  VagasFilters, 
  VagaMetrics,
  VagaWithCandidatos 
} from '../lib/vagas/vagas-types'

interface UseVagasState {
  vagas: Vaga[]
  currentVaga: VagaWithCandidatos | null
  metrics: VagaMetrics | null
  isLoading: boolean
  error: string | null
  totalPages: number
  currentPage: number
}

interface UseVagasActions {
  loadVagas: (filters?: VagasFilters) => Promise<void>
  loadVagaById: (id: string) => Promise<void>
  loadMetrics: () => Promise<void>
  createVaga: (vagaData: CreateVagaRequest) => Promise<boolean>
  updateVaga: (vagaData: UpdateVagaRequest) => Promise<boolean>
  deleteVaga: (id: string) => Promise<boolean>
  changeVagaStatus: (id: string, status: 'Rascunho' | 'Ativa' | 'Encerrada' | 'Preenchida') => Promise<boolean>
  clearError: () => void
  setCurrentPage: (page: number) => void
}

export function useVagas(): UseVagasState & UseVagasActions {
  const { user } = useAuth()
  const [state, setState] = useState<UseVagasState>({
    vagas: [],
    currentVaga: null,
    metrics: null,
    isLoading: false,
    error: null,
    totalPages: 1,
    currentPage: 1
  })

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  const setCurrentPage = useCallback((page: number) => {
    setState(prev => ({ ...prev, currentPage: page }))
  }, [])

  const loadVagas = useCallback(async (filters?: VagasFilters) => {
    if (!user?.id || user.role !== 'empregador') {
      setState(prev => ({ ...prev, error: 'Usuário não autorizado' }))
      return
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await vagasService.getVagasByEmpregador(user.id, {
        ...filters,
        page: filters?.page || state.currentPage,
        limit: 10
      })

      if (response.error) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: response.error || 'Erro ao carregar vagas' 
        }))
        return
      }

      // Verifica se response.data é um VagasListResponse ou um array simples
      let vagas: Vaga[] = []
      let total = 0
      
      if (response.data && typeof response.data === 'object' && 'vagas' in response.data) {
        // É um VagasListResponse
        const listResponse = response.data as any
        vagas = listResponse.vagas || []
        total = listResponse.total || 0
      } else if (Array.isArray(response.data)) {
        // É um array simples
        vagas = response.data
        total = vagas.length
      }
      
      // Só calcula páginas se há um total definido pelo backend ou se há mais de 10 itens
      const totalPages = total > 10 ? Math.ceil(total / 10) : 1

      setState(prev => ({ 
        ...prev, 
        vagas,
        totalPages,
        isLoading: false 
      }))
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Erro ao carregar vagas' 
      }))
    }
  }, [user, state.currentPage])

  const loadVagaById = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Passar empregadorId para validação de autorização se for empregador
      const empregadorId = user?.role === 'empregador' ? user.id : undefined
      const response = await vagasService.getVagaById(id, empregadorId)

      if (response.error) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: response.error || 'Erro ao carregar vaga' 
        }))
        return
      }

      setState(prev => ({ 
        ...prev, 
        currentVaga: response.data as VagaWithCandidatos,
        isLoading: false 
      }))
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Erro ao carregar vaga' 
      }))
    }
  }, [user?.id, user?.role])

  const loadMetrics = useCallback(async () => {
    if (!user?.id || user.role !== 'empregador') {
      setState(prev => ({ ...prev, error: 'Usuário não autorizado' }))
      return
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await vagasService.getVagasMetrics(user.id)

      if (response.error) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: response.error || 'Erro ao carregar métricas' 
        }))
        return
      }

      setState(prev => ({ 
        ...prev, 
        metrics: response.data as VagaMetrics,
        isLoading: false 
      }))
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Erro ao carregar métricas' 
      }))
    }
  }, [user])

  const createVaga = useCallback(async (vagaData: CreateVagaRequest): Promise<boolean> => {
    if (!user?.id || user.role !== 'empregador') {
      setState(prev => ({ ...prev, error: 'Usuário não autorizado' }))
      return false
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await vagasService.createVaga(user.id, vagaData)

      if (response.error) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: response.error || 'Erro ao criar vaga' 
        }))
        return false
      }

      // Reload vagas list
      await loadVagas()
      await loadMetrics()

      setState(prev => ({ ...prev, isLoading: false }))
      return true
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Erro ao criar vaga' 
      }))
      return false
    }
  }, [user, loadVagas, loadMetrics])

  const updateVaga = useCallback(async (vagaData: UpdateVagaRequest): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await vagasService.updateVaga(vagaData)

      if (response.error) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: response.error || 'Erro ao atualizar vaga' 
        }))
        return false
      }

      // Reload vagas list
      await loadVagas()
      await loadMetrics()

      setState(prev => ({ ...prev, isLoading: false }))
      return true
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Erro ao atualizar vaga' 
      }))
      return false
    }
  }, [loadVagas, loadMetrics])

  const deleteVaga = useCallback(async (id: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await vagasService.deleteVaga(id)

      if (response.error) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: response.error || 'Erro ao excluir vaga' 
        }))
        return false
      }

      // Reload vagas list
      await loadVagas()
      await loadMetrics()

      setState(prev => ({ ...prev, isLoading: false }))
      return true
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Erro ao excluir vaga' 
      }))
      return false
    }
  }, [loadVagas, loadMetrics])

  const changeVagaStatus = useCallback(async (id: string, status: 'Rascunho' | 'Ativa' | 'Encerrada' | 'Preenchida'): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await vagasService.changeVagaStatus(id, status)

      if (response.error) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: response.error || 'Erro ao alterar status da vaga' 
        }))
        return false
      }

      // Reload vagas list and current vaga
      await loadVagas()
      await loadMetrics()
      
      // Reload current vaga if it's the one being updated
      if (state.currentVaga?.id === id) {
        await loadVagaById(id)
      }

      setState(prev => ({ ...prev, isLoading: false }))
      return true
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Erro ao alterar status da vaga' 
      }))
      return false
    }
  }, [loadVagas, loadMetrics, loadVagaById, state.currentVaga?.id])

  // Load initial data when user changes
  useEffect(() => {
    if (user?.id && user.role === 'empregador') {
      loadVagas()
      loadMetrics()
    }
  }, [user, loadVagas, loadMetrics])

  return {
    ...state,
    loadVagas,
    loadVagaById,
    loadMetrics,
    createVaga,
    updateVaga,
    deleteVaga,
    changeVagaStatus,
    clearError,
    setCurrentPage
  }
}
