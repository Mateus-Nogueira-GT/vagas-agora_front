"use client"

import { useState, useCallback } from 'react'
import { configuracoesApiService, UsuarioConfiguracao, AlterarSenhaRequest } from '../lib/api/configuracoes-api'
import { useAuth } from './use-auth'

interface UseConfiguracoesState {
  dadosUsuario: UsuarioConfiguracao | null
  isLoading: boolean
  error: string | null
  isUpdating: boolean
  isChangingPassword: boolean
}

interface UseConfiguracoesActions {
  loadDadosUsuario: () => Promise<void>
  atualizarDados: (dados: Partial<UsuarioConfiguracao>) => Promise<boolean>
  alterarSenha: (dados: AlterarSenhaRequest) => Promise<boolean>
  desativarConta: () => Promise<boolean>
  excluirConta: () => Promise<boolean>
  clearError: () => void
}

export function useConfiguracoes(): UseConfiguracoesState & UseConfiguracoesActions {
  const { user } = useAuth()
  const [state, setState] = useState<UseConfiguracoesState>({
    dadosUsuario: null,
    isLoading: false,
    error: null,
    isUpdating: false,
    isChangingPassword: false
  })

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  const loadDadosUsuario = useCallback(async () => {
    if (!user?.id) {
      // Não mostrar erro se ainda está carregando a autenticação
      return
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const dados = await configuracoesApiService.getDadosUsuario(user.id)

      setState(prev => ({
        ...prev,
        isLoading: false,
        dadosUsuario: dados,
        error: null
      }))
    } catch (error) {
      console.error('Load dados usuario error:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Erro ao carregar dados do usuário'
      }))
    }
  }, [user?.id])

  const atualizarDados = useCallback(async (dados: Partial<UsuarioConfiguracao>): Promise<boolean> => {
    if (!user?.id) {
      setState(prev => ({ ...prev, error: 'Usuário não autenticado' }))
      return false
    }

    setState(prev => ({ ...prev, isUpdating: true, error: null }))

    try {
      await configuracoesApiService.atualizarDadosUsuario(user.id, dados)

      // Atualizar estado local
      setState(prev => ({
        ...prev,
        isUpdating: false,
        dadosUsuario: prev.dadosUsuario ? { ...prev.dadosUsuario, ...dados } : null,
        error: null
      }))

      // Para admin, atualizar também o user no localStorage
      if (user.role === 'admin' && dados.nome_completo && typeof window !== 'undefined') {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
        const updatedUser = { ...currentUser, nome: dados.nome_completo }
        localStorage.setItem('currentUser', JSON.stringify(updatedUser))

        // Força uma atualização da página para refletir no sidebar
        window.location.reload()
      }

      return true
    } catch (error) {
      console.error('Atualizar dados error:', error)
      setState(prev => ({
        ...prev,
        isUpdating: false,
        error: 'Erro ao atualizar dados'
      }))
      return false
    }
  }, [user?.id, user?.role])

  const alterarSenha = useCallback(async (dados: AlterarSenhaRequest): Promise<boolean> => {
    if (!user?.id || !user?.email) {
      setState(prev => ({ ...prev, error: 'Usuário não autenticado' }))
      return false
    }

    // Validar se as senhas não estão vazias
    if (!dados.senhaAtual || !dados.novaSenha) {
      setState(prev => ({ ...prev, error: 'Todos os campos de senha são obrigatórios' }))
      return false
    }

    // Validar se a nova senha tem pelo menos 6 caracteres
    if (dados.novaSenha.length < 6) {
      setState(prev => ({ ...prev, error: 'A nova senha deve ter pelo menos 6 caracteres' }))
      return false
    }

    setState(prev => ({ ...prev, isChangingPassword: true, error: null }))

    try {
      await configuracoesApiService.alterarSenha(user.email, dados)

      setState(prev => ({
        ...prev,
        isChangingPassword: false,
        error: null
      }))

      return true
    } catch (error) {
      console.error('Alterar senha error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro ao alterar senha'
      setState(prev => ({
        ...prev,
        isChangingPassword: false,
        error: errorMessage
      }))
      return false
    }
  }, [user?.id, user?.email])

  const desativarConta = useCallback(async (): Promise<boolean> => {
    if (!user?.id) {
      setState(prev => ({ ...prev, error: 'Usuário não autenticado' }))
      return false
    }

    setState(prev => ({ ...prev, isUpdating: true, error: null }))

    try {
      await configuracoesApiService.desativarConta(user.id)

      setState(prev => ({
        ...prev,
        isUpdating: false,
        error: null
      }))

      return true
    } catch (error) {
      console.error('Desativar conta error:', error)
      setState(prev => ({
        ...prev,
        isUpdating: false,
        error: 'Erro ao desativar conta'
      }))
      return false
    }
  }, [user?.id])

  const excluirConta = useCallback(async (): Promise<boolean> => {
    if (!user?.id) {
      setState(prev => ({ ...prev, error: 'Usuário não autenticado' }))
      return false
    }

    setState(prev => ({ ...prev, isUpdating: true, error: null }))

    try {
      await configuracoesApiService.excluirConta(user.id)

      setState(prev => ({
        ...prev,
        isUpdating: false,
        error: null
      }))

      return true
    } catch (error) {
      console.error('Excluir conta error:', error)
      setState(prev => ({
        ...prev,
        isUpdating: false,
        error: 'Erro ao excluir conta'
      }))
      return false
    }
  }, [user?.id])

  return {
    ...state,
    loadDadosUsuario,
    atualizarDados,
    alterarSenha,
    desativarConta,
    excluirConta,
    clearError
  }
}
