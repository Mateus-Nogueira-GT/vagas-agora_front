"use client"

import { useState, useCallback } from 'react'
import { notificacoesApiService, Notificacao } from '../lib/api/notificacoes-api'
import { useAuth } from './use-auth'

interface UseNotificacoesState {
  notificacoes: Notificacao[]
  isLoading: boolean
  error: string | null
  filtroAtivo: 'todas' | 'nao-lidas'
}

interface UseNotificacoesActions {
  loadNotificacoes: (filtro?: 'todas' | 'nao-lidas') => Promise<void>
  marcarComoLida: (notificacaoId: number) => Promise<void>
  excluirNotificacao: (notificacaoId: number) => Promise<void>
  marcarTodasComoLidas: () => Promise<void>
  setFiltro: (filtro: 'todas' | 'nao-lidas') => void
  clearError: () => void
}

export function useNotificacoes(): UseNotificacoesState & UseNotificacoesActions {
  const { user } = useAuth()
  const [state, setState] = useState<UseNotificacoesState>({
    notificacoes: [],
    isLoading: false,
    error: null,
    filtroAtivo: 'todas'
  })

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  const loadNotificacoes = useCallback(async (filtro: 'todas' | 'nao-lidas' = 'todas') => {
    if (!user?.id) {
      setState(prev => ({ ...prev, error: 'Usuário não autenticado' }))
      return
    }

    setState(prev => ({ ...prev, isLoading: true, error: null, filtroAtivo: filtro }))

    try {
      const notificacoes = await notificacoesApiService.getNotificacoes(user.id, filtro)

      setState(prev => ({
        ...prev,
        isLoading: false,
        notificacoes,
        error: null
      }))
    } catch (error) {
      console.error('Load notificacoes error:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Erro ao carregar notificações'
      }))
    }
  }, [user?.id])

  const marcarComoLida = useCallback(async (notificacaoId: number) => {
    try {
      await notificacoesApiService.marcarComoLida(notificacaoId)

      // Atualizar o estado local
      setState(prev => ({
        ...prev,
        notificacoes: prev.notificacoes.map(notif =>
          notif.id === notificacaoId ? { ...notif, lida: true } : notif
        )
      }))
    } catch (error) {
      console.error('Marcar como lida error:', error)
      setState(prev => ({ ...prev, error: 'Erro ao marcar como lida' }))
    }
  }, [])

  const excluirNotificacao = useCallback(async (notificacaoId: number) => {
    try {
      await notificacoesApiService.excluirNotificacao(notificacaoId)

      // Remover do estado local
      setState(prev => ({
        ...prev,
        notificacoes: prev.notificacoes.filter(notif => notif.id !== notificacaoId)
      }))
    } catch (error) {
      console.error('Excluir notificacao error:', error)
      setState(prev => ({ ...prev, error: 'Erro ao excluir notificação' }))
    }
  }, [])

  const marcarTodasComoLidas = useCallback(async () => {
    if (!user?.id) return

    try {
      await notificacoesApiService.marcarTodasComoLidas(user.id)

      // Atualizar todas no estado local
      setState(prev => ({
        ...prev,
        notificacoes: prev.notificacoes.map(notif => ({ ...notif, lida: true }))
      }))
    } catch (error) {
      console.error('Marcar todas como lidas error:', error)
      setState(prev => ({ ...prev, error: 'Erro ao marcar todas como lidas' }))
    }
  }, [user?.id])

  const setFiltro = useCallback((filtro: 'todas' | 'nao-lidas') => {
    loadNotificacoes(filtro)
  }, [loadNotificacoes])

  return {
    ...state,
    loadNotificacoes,
    marcarComoLida,
    excluirNotificacao,
    marcarTodasComoLidas,
    setFiltro,
    clearError
  }
}
