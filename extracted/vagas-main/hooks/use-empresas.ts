// Empresas hook following BMAD architecture
'use client'

import { useState, useCallback, useEffect } from 'react'
import { empresasApi } from '../lib/api/empresas-api'
import { empresasService } from '../lib/empresas/empresas-service'
import type { 
  Empresa, 
  CreateEmpresaRequest, 
  UpdateEmpresaRequest 
} from '../lib/empresas/empresas-types'

export interface UseEmpresasState {
  currentEmpresa: Empresa | null
  loading: boolean
  error: string | null
  creating: boolean
  updating: boolean
}

export interface UseEmpresasActions {
  loadCurrentEmpresa: () => Promise<void>
  createEmpresa: (empresaData: CreateEmpresaRequest) => Promise<{
    success: boolean
    errors?: Record<string, string>
  }>
  updateEmpresa: (empresaData: UpdateEmpresaRequest) => Promise<{
    success: boolean
    errors?: Record<string, string>
  }>
  clearError: () => void
  checkHasEmpresa: () => Promise<boolean>
}

export function useEmpresas(): UseEmpresasState & UseEmpresasActions {
  const [currentEmpresa, setCurrentEmpresa] = useState<Empresa | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const loadCurrentEmpresa = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const empresa = await empresasService.getCurrentUserEmpresa()
      setCurrentEmpresa(empresa)
    } catch (err) {
      console.error('❌ Error loading current empresa:', err)
      setError('Erro ao carregar dados da empresa')
    } finally {
      setLoading(false)
    }
  }, [])

  const createEmpresa = useCallback(async (empresaData: CreateEmpresaRequest) => {
    try {
      setCreating(true)
      setError(null)

      const result = await empresasService.createEmpresa(empresaData)
      
      if (result.success && result.data) {
        setCurrentEmpresa(result.data)
        return { success: true }
      } else {
        return { success: false, errors: result.errors }
      }
    } catch (err) {
      console.error('Error creating empresa:', err)
      setError('Erro ao criar empresa')
      return { 
        success: false, 
        errors: { general: 'Erro interno do servidor' } 
      }
    } finally {
      setCreating(false)
    }
  }, [])

  const updateEmpresa = useCallback(async (empresaData: UpdateEmpresaRequest) => {
    try {
      setUpdating(true)
      setError(null)

      const result = await empresasService.updateEmpresa(empresaData)
      
      if (result.success && result.data) {
        setCurrentEmpresa(result.data)
        return { success: true }
      } else {
        return { success: false, errors: result.errors }
      }
    } catch (err) {
      console.error('Error updating empresa:', err)
      setError('Erro ao atualizar empresa')
      return { 
        success: false, 
        errors: { general: 'Erro interno do servidor' } 
      }
    } finally {
      setUpdating(false)
    }
  }, [])

  const checkHasEmpresa = useCallback(async (): Promise<boolean> => {
    try {
      const response = await empresasApi.hasEmpresa()
      return response.success && response.hasEmpresa
    } catch (error) {
      console.error('Error checking if user has empresa:', error)
      return false
    }
  }, [])

  return {
    // State
    currentEmpresa,
    loading,
    error,
    creating,
    updating,
    
    // Actions
    loadCurrentEmpresa,
    createEmpresa,
    updateEmpresa,
    clearError,
    checkHasEmpresa
  }
}
