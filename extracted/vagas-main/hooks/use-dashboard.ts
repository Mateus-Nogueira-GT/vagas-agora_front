"use client"

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './use-auth'
import { vagasApiService } from '../lib/api/vagas-api'
import { VagaMetrics, Vaga } from '../lib/vagas/vagas-types'

interface DashboardStats {
  vagas_ativas: number
  total_candidaturas: number
  vagas_preenchidas: number
  taxa_conversao: number
  candidatos_por_vaga: number
  visualizacoes_vagas: number
}

interface CandidaturasTempo {
  date: string
  candidaturas: number
}

interface VagasStatus {
  name: string
  count: number
}

interface UseDashboardState {
  stats: DashboardStats | null
  candidaturasTempo: CandidaturasTempo[]
  vagasStatus: VagasStatus[]
  filteredVagas: Vaga[]
  isLoading: boolean
  error: string | null
}

export function useDashboard(): UseDashboardState & {
  loadDashboardData: (period?: string) => Promise<void>
  loadFilteredVagas: (searchTerm?: string, statusFilter?: string) => Promise<void>
  clearError: () => void
} {
  const { user } = useAuth()
  const [state, setState] = useState<UseDashboardState>({
    stats: null,
    candidaturasTempo: [],
    vagasStatus: [],
    filteredVagas: [],
    isLoading: false,
    error: null
  })

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  const loadDashboardData = useCallback(async (period: string = "7") => {
    if (!user?.id || user.role !== 'empregador') {
      setState(prev => ({ ...prev, error: 'Usuário não autorizado' }))
      return
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Carregar métricas básicas
      const metrics = await vagasApiService.getVagasMetrics(user.id)
      const totalCandidaturas = await vagasApiService.getTotalCandidaturas(user.id)

      // Calcular estatísticas
      const candidatos_por_vaga = metrics.vagas_ativas > 0
        ? Math.round(totalCandidaturas / metrics.vagas_ativas)
        : 0

      const taxa_conversao = totalCandidaturas > 0
        ? Math.round((metrics.vagas_encerradas / totalCandidaturas) * 100)
        : 0

      const visualizacoes_vagas = totalCandidaturas * 8 // Estimativa baseada em candidaturas

      const dashboardStats: DashboardStats = {
        vagas_ativas: metrics.vagas_ativas,
        total_candidaturas: totalCandidaturas,
        vagas_preenchidas: 0, // Será implementado quando tivermos status "Preenchida"
        taxa_conversao,
        candidatos_por_vaga,
        visualizacoes_vagas
      }

      // Dados reais para gráfico de candidaturas ao longo do tempo
      const days = parseInt(period)
      const candidaturasTempo = await vagasApiService.getCandidaturasPorPeriodo(user.id, days)

      // Dados para gráfico de vagas por status
      const vagasStatus: VagasStatus[] = [
        { name: "Ativas", count: metrics.vagas_ativas },
        { name: "Encerradas", count: metrics.vagas_encerradas },
        { name: "Total", count: metrics.total_vagas },
      ]

      setState(prev => ({
        ...prev,
        stats: dashboardStats,
        candidaturasTempo,
        vagasStatus,
        isLoading: false
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Erro ao carregar dados do dashboard'
      }))
    }
  }, [user])

  const loadFilteredVagas = useCallback(async (searchTerm: string = "", statusFilter: string = "todas") => {
    if (!user?.id || user.role !== 'empregador') {
      return
    }

    try {
      const filters = {
        search: searchTerm || undefined,
        status: statusFilter !== "todas" ? statusFilter as any : undefined,
        limit: 10,
        offset: 0
      }

      const response = await vagasApiService.getVagasByEmpregador(user.id, filters)

      setState(prev => ({
        ...prev,
        filteredVagas: response.vagas || []
      }))
    } catch (error) {
      console.error('Erro ao carregar vagas filtradas:', error)
    }
  }, [user])

  // Load data when user changes
  useEffect(() => {
    if (user?.id && user.role === 'empregador') {
      loadDashboardData()
      loadFilteredVagas()
    }
  }, [user, loadDashboardData, loadFilteredVagas])

  return {
    ...state,
    loadDashboardData,
    loadFilteredVagas,
    clearError
  }
}
