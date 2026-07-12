import { useState, useEffect, useCallback } from 'react'
import { 
  getCandidaturas, 
  realizarCandidatura, 
  verificarCandidatura,
  cancelarCandidaturaService 
} from '@/lib/candidaturas/candidaturas-service'
import type { Candidatura, CandidaturaFilters } from '@/lib/candidaturas/candidaturas-types'

interface UseCandidaturasResult {
  candidaturas: Candidatura[]
  isLoading: boolean
  error: string | null
  loadCandidaturas: (candidatoId: string, filters?: CandidaturaFilters) => Promise<void>
  candidatarVaga: (vagaId: string, userId: string, cartaApresentacao?: string) => Promise<boolean>
  verificarCandidaturaExistente: (userId: string, vagaId: string) => Promise<{ exists: boolean; candidatura?: any }>
  cancelarCandidatura: (userId: string, vagaId: string) => Promise<boolean>
  clearError: () => void
  refetch: () => void
}

export function useCandidaturas(): UseCandidaturasResult {
  const [candidaturas, setCandidaturas] = useState<Candidatura[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastParams, setLastParams] = useState<{ candidatoId: string, filters?: CandidaturaFilters } | null>(null)

  const loadCandidaturas = useCallback(async (userId: string, filters?: CandidaturaFilters) => {
    if (!userId) return

    setIsLoading(true)
    setError(null)
    setLastParams({ candidatoId: userId, filters })

    try {
      const result = await getCandidaturas(userId, filters)

      if (result.success && result.data) {
        setCandidaturas(result.data)
      } else {
        setError(result.error || 'Erro ao carregar candidaturas')
        setCandidaturas([])
      }
    } catch (err) {
      setError('Erro inesperado ao carregar candidaturas')
      setCandidaturas([])
      console.error('Erro no hook useCandidaturas:', {
        message: err instanceof Error ? err.message : 'Erro desconhecido',
        stack: err instanceof Error ? err.stack : undefined,
        error: err
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const candidatarVaga = useCallback(async (vagaId: string, userId: string, cartaApresentacao?: string): Promise<boolean> => {
    try {
      const result = await realizarCandidatura(vagaId, userId, cartaApresentacao)
      
      if (result.success) {
        // Recarregar candidaturas após sucesso
        if (lastParams) {
          await loadCandidaturas(lastParams.candidatoId, lastParams.filters)
        }
        return true
      } else {
        setError(result.error || 'Erro ao realizar candidatura')
        return false
      }
    } catch (error) {
      console.error('Erro no hook candidatarVaga:', {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      })
      setError('Erro inesperado ao realizar candidatura')
      return false
    }
  }, [lastParams, loadCandidaturas])

  const verificarCandidaturaExistente = useCallback(async (userId: string, vagaId: string) => {
    try {
      const result = await verificarCandidatura(userId, vagaId)
      return {
        exists: result.exists,
        candidatura: result.candidatura
      }
    } catch (error) {
      console.error('Erro no hook verificarCandidaturaExistente:', {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      })
      return { exists: false }
    }
  }, [])

  const cancelarCandidatura = useCallback(async (userId: string, vagaId: string): Promise<boolean> => {
    try {
      const result = await cancelarCandidaturaService(userId, vagaId)
      
      if (result.success) {
        // Recarregar candidaturas após cancelamento
        if (lastParams) {
          await loadCandidaturas(lastParams.candidatoId, lastParams.filters)
        }
        return true
      } else {
        setError(result.error || 'Erro ao cancelar candidatura')
        return false
      }
    } catch (error) {
      console.error('Erro no hook cancelarCandidatura:', {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      })
      setError('Erro inesperado ao cancelar candidatura')
      return false
    }
  }, [lastParams, loadCandidaturas])

  const refetch = useCallback(() => {
    if (lastParams) {
      loadCandidaturas(lastParams.candidatoId, lastParams.filters)
    }
  }, [lastParams, loadCandidaturas])

  return {
    candidaturas,
    isLoading,
    error,
    loadCandidaturas,
    candidatarVaga,
    verificarCandidaturaExistente,
    cancelarCandidatura,
    clearError,
    refetch
  }
}
