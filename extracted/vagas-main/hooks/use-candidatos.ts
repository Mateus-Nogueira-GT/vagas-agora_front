"use client"

import { useState, useCallback } from 'react'
import { candidatosService } from '../lib/candidatos/candidatos-service'
import { useAuth } from './use-auth'
import { 
  Candidato, 
  CreateCandidatoRequest, 
  UpdateCandidatoRequest, 
  CandidatosFilters, 
  CandidatosListResponse 
} from '../lib/candidatos/candidatos-types'

interface UseCandidatosState {
  candidato: Candidato | null
  candidatos: Candidato[]
  isLoading: boolean
  error: string | null
  totalPages: number
  currentPage: number
}

interface UseCandidatosActions {
  loadCandidatoPerfil: () => Promise<void>
  loadCandidatoPublico: (id: string) => Promise<Candidato | null>
  createCandidatoPerfil: (candidatoData: CreateCandidatoRequest) => Promise<boolean>
  updateCandidatoPerfil: (candidatoData: UpdateCandidatoRequest) => Promise<boolean>
  updateCandidatoPerfilByUserId: (candidatoData: Partial<CreateCandidatoRequest>) => Promise<boolean>
  deleteCandidatoPerfil: (id: string) => Promise<boolean>
  listCandidatos: (filters?: CandidatosFilters) => Promise<void>
  clearError: () => void
  setCurrentPage: (page: number) => void
}

export function useCandidatos(): UseCandidatosState & UseCandidatosActions {
  const { user } = useAuth()
  const [state, setState] = useState<UseCandidatosState>({
    candidato: null,
    candidatos: [],
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

  const loadCandidatoPerfil = useCallback(async () => {
    if (!user?.id) {
      setState(prev => ({ ...prev, error: 'Usuário não autenticado' }))
      return
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await candidatosService.getCandidatoPerfil(user.id)

      if (response.error) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: response.error || 'Erro ao carregar perfil' 
        }))
        return
      }

      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        candidato: response.data,
        error: null 
      }))
    } catch (error) {
      console.error('Load candidato perfil error:', error)
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Erro inesperado ao carregar perfil' 
      }))
    }
  }, [user?.id])

  const loadCandidatoPublico = useCallback(async (id: string): Promise<Candidato | null> => {
    try {
      const response = await candidatosService.getCandidatoPublico(id)

      if (response.error) {
        console.error('Load candidato publico error:', response.error)
        return null
      }

      return response.data
    } catch (error) {
      console.error('Load candidato publico error:', error)
      return null
    }
  }, [])

  const createCandidatoPerfil = useCallback(async (candidatoData: CreateCandidatoRequest): Promise<boolean> => {
    if (!user?.id) {
      setState(prev => ({ ...prev, error: 'Usuário não autenticado' }))
      return false
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await candidatosService.createCandidatoPerfil(user.id, candidatoData)

      if (response.error) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: response.error || 'Erro ao criar perfil' 
        }))
        return false
      }

      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        candidato: response.data,
        error: null 
      }))
      return true
    } catch (error) {
      console.error('Create candidato perfil error:', error)
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Erro inesperado ao criar perfil' 
      }))
      return false
    }
  }, [user?.id])

  const updateCandidatoPerfil = useCallback(async (candidatoData: UpdateCandidatoRequest): Promise<boolean> => {
    if (!user?.id || user.role !== 'candidato') {
      setState(prev => ({ ...prev, error: 'Usuário não autorizado' }))
      return false
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await candidatosService.updateCandidatoPerfil(candidatoData)

      if (response.error) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: response.error || 'Erro ao atualizar perfil' 
        }))
        return false
      }

      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        candidato: response.data,
        error: null 
      }))
      return true
    } catch (error) {
      console.error('Update candidato perfil error:', error)
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Erro inesperado ao atualizar perfil' 
      }))
      return false
    }
  }, [user?.id, user?.role])

  const updateCandidatoPerfilByUserId = useCallback(async (candidatoData: Partial<CreateCandidatoRequest>): Promise<boolean> => {
    if (!user?.id || user.role !== 'candidato') {
      setState(prev => ({ ...prev, error: 'Usuário não autorizado' }))
      return false
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await candidatosService.updateCandidatoPerfilByUserId(user.id, candidatoData)

      if (response.error) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: response.error || 'Erro ao atualizar perfil' 
        }))
        return false
      }

      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        candidato: response.data,
        error: null 
      }))
      return true
    } catch (error) {
      console.error('Update candidato perfil by user id error:', error)
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Erro inesperado ao atualizar perfil' 
      }))
      return false
    }
  }, [user?.id, user?.role])

  const deleteCandidatoPerfil = useCallback(async (id: string): Promise<boolean> => {
    if (!user?.id || user.role !== 'candidato') {
      setState(prev => ({ ...prev, error: 'Usuário não autorizado' }))
      return false
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await candidatosService.deleteCandidatoPerfil(id)

      if (response.error) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: response.error || 'Erro ao deletar perfil' 
        }))
        return false
      }

      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        candidato: null,
        error: null 
      }))
      return true
    } catch (error) {
      console.error('Delete candidato perfil error:', error)
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Erro inesperado ao deletar perfil' 
      }))
      return false
    }
  }, [user?.id, user?.role])

  const listCandidatos = useCallback(async (filters?: CandidatosFilters) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await candidatosService.listCandidatos({
        ...filters,
        page: filters?.page || state.currentPage,
        limit: 10
      })

      if (response.error) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: response.error || 'Erro ao carregar candidatos' 
        }))
        return
      }

      const candidatos = response.data?.candidatos || []
      const total = response.data?.total || 0
      const totalPages = total > 10 ? Math.ceil(total / 10) : 1

      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        candidatos,
        totalPages,
        error: null 
      }))
    } catch (error) {
      console.error('List candidatos error:', error)
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Erro inesperado ao carregar candidatos' 
      }))
    }
  }, [state.currentPage])

  return {
    // State
    candidato: state.candidato,
    candidatos: state.candidatos,
    isLoading: state.isLoading,
    error: state.error,
    totalPages: state.totalPages,
    currentPage: state.currentPage,
    
    // Actions
    loadCandidatoPerfil,
    loadCandidatoPublico,
    createCandidatoPerfil,
    updateCandidatoPerfil,
    updateCandidatoPerfilByUserId,
    deleteCandidatoPerfil,
    listCandidatos,
    clearError,
    setCurrentPage
  }
}
