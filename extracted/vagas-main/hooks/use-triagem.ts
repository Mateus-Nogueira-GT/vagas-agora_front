'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

// ============================================
// TIPOS
// ============================================

export interface TriagemConfig {
  triagem_habilitada: boolean
  modelo_ia: string
  max_candidatos_por_triagem?: number
  has_api_key: boolean
  api_key_last4?: string | null
}

export interface Triagem {
  id: string
  vaga_id: string
  status: 'pendente' | 'processando' | 'concluida' | 'erro'
  total_candidatos: number
  candidatos_processados: number
  candidatos_aprovados: number
  candidatos_rejeitados: number
  modelo_usado?: string
  iniciada_em?: string
  concluida_em?: string
  erro_mensagem?: string
}

export interface TriagemResultado {
  candidatura_id: string
  candidato_id: string
  nota: number
  classificacao: 'altamente_qualificado' | 'qualificado' | 'com_ressalvas' | 'nao_recomendado'
  resumo: string
  pontos_fortes: string[]
  pontos_fracos: string[]
  recomendacao: 'aprovar' | 'analisar' | 'rejeitar'
}

export interface EstatisticasTriagem {
  total_triagens: number
  total_processados: number
  total_aprovados: number
  total_rejeitados: number
  total_em_analise: number
}

interface UseTriagemReturn {
  // Estado
  config: TriagemConfig | null
  triagens: Triagem[]
  currentTriagem: Triagem | null
  resultados: TriagemResultado[]
  estatisticas: EstatisticasTriagem | null
  
  // Flags de loading
  isLoading: boolean
  isLoadingConfig: boolean
  isSavingConfig: boolean
  isTriaging: boolean
  
  // Erros
  error: string | null
  
  // Ações - Config
  loadConfig: () => Promise<void>
  saveConfig: (apiKey: string | null, modelo: string, habilitada: boolean) => Promise<boolean>
  
  // Ações - Triagem
  triggerTriagem: (vagaId: string) => Promise<boolean>
  loadTriagemStatus: (triagemId: string) => Promise<void>
  loadTriagensByVaga: (vagaId: string) => Promise<void>
  
  // Utilidades
  clearError: () => void
  stopPolling: () => void
}

// ============================================
// HOOK
// ============================================

export function useTriagem(): UseTriagemReturn {
  // Estado principal
  const [config, setConfig] = useState<TriagemConfig | null>(null)
  const [triagens, setTriagens] = useState<Triagem[]>([])
  const [currentTriagem, setCurrentTriagem] = useState<Triagem | null>(null)
  const [resultados, setResultados] = useState<TriagemResultado[]>([])
  const [estatisticas, setEstatisticas] = useState<EstatisticasTriagem | null>(null)
  
  // Flags de loading
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingConfig, setIsLoadingConfig] = useState(false)
  const [isSavingConfig, setIsSavingConfig] = useState(false)
  const [isTriaging, setIsTriaging] = useState(false)
  
  // Erros
  const [error, setError] = useState<string | null>(null)
  
  // Ref para controlar polling
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const pollingTriagemIdRef = useRef<string | null>(null)

  // ============================================
  // FUNÇÕES AUXILIARES
  // ============================================

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    pollingTriagemIdRef.current = null
  }, [])

  // Limpar polling ao desmontar
  useEffect(() => {
    return () => {
      stopPolling()
    }
  }, [stopPolling])

  // ============================================
  // POLLING
  // ============================================

  const startPolling = useCallback((triagemId: string) => {
    // Parar polling anterior se existir
    stopPolling()
    
    pollingTriagemIdRef.current = triagemId
    
    // Função de polling
    const poll = async () => {
      // Verificar se ainda deve fazer polling
      if (pollingTriagemIdRef.current !== triagemId) {
        return
      }
      
      try {
        const response = await fetch(`/api/triagem/status/${triagemId}`)
        const data = await response.json()
        
        if (data.success) {
          const triagem = data.data.triagem
          
          setCurrentTriagem(triagem)
          
          if (data.data.resultados) {
            setResultados(data.data.resultados)
          }
          
          // Se terminou, parar polling
          if (triagem.status === 'concluida' || triagem.status === 'erro') {
            stopPolling()
            setIsTriaging(false)
            
            // Atualizar lista de triagens
            setTriagens(prev => {
              const exists = prev.find(t => t.id === triagem.id)
              if (exists) {
                return prev.map(t => t.id === triagem.id ? triagem : t)
              }
              return [triagem, ...prev]
            })
          }
        }
      } catch (err) {
        console.error('Erro no polling:', err)
        // Não parar polling por erro temporário
      }
    }
    
    // Fazer primeira chamada imediatamente
    poll()
    
    // Configurar intervalo (a cada 3 segundos)
    pollingIntervalRef.current = setInterval(poll, 3000)
  }, [stopPolling])

  // ============================================
  // CONFIGURAÇÃO
  // ============================================

  const loadConfig = useCallback(async () => {
    setIsLoadingConfig(true)
    setError(null)
    
    try {
      const response = await fetch('/api/triagem/config')
      const data = await response.json()
      
      if (data.success) {
        setConfig(data.data)
      } else {
        setError(data.error || 'Erro ao carregar configuração')
      }
    } catch (err) {
      console.error('Erro ao carregar config:', err)
      setError('Erro de conexão ao carregar configuração')
    } finally {
      setIsLoadingConfig(false)
    }
  }, [])

  const saveConfig = useCallback(async (
    apiKey: string | null,
    modelo: string,
    habilitada: boolean
  ): Promise<boolean> => {
    setIsSavingConfig(true)
    setError(null)
    
    try {
      const body: Record<string, unknown> = {
        modelo,
        habilitada
      }
      
      // Só envia apiKey se foi fornecida (para não sobrescrever com vazio)
      if (apiKey !== null && apiKey.trim() !== '') {
        body.apiKey = apiKey
      }
      
      const response = await fetch('/api/triagem/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setConfig(data.data)
        return true
      } else {
        setError(data.error || 'Erro ao salvar configuração')
        return false
      }
    } catch (err) {
      console.error('Erro ao salvar config:', err)
      setError('Erro de conexão ao salvar configuração')
      return false
    } finally {
      setIsSavingConfig(false)
    }
  }, [])

  // ============================================
  // TRIAGEM - TRIGGER
  // ============================================

  const triggerTriagem = useCallback(async (vagaId: string): Promise<boolean> => {
    setIsTriaging(true)
    setError(null)
    
    try {
      const response = await fetch('/api/triagem/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ vaga_id: vagaId })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Criar objeto de triagem a partir da resposta
        const novaTriagem: Triagem = {
          id: data.data.triagem_id,
          vaga_id: vagaId,
          status: 'processando',
          total_candidatos: data.data.total_candidatos,
          candidatos_processados: 0,
          candidatos_aprovados: 0,
          candidatos_rejeitados: 0
        }
        
        setCurrentTriagem(novaTriagem)
        setResultados([])
        
        // Iniciar polling para acompanhar status
        startPolling(data.data.triagem_id)
        
        return true
      } else {
        setError(data.error || 'Erro ao iniciar triagem')
        setIsTriaging(false)
        return false
      }
    } catch (err) {
      console.error('Erro ao iniciar triagem:', err)
      setError('Erro de conexão ao iniciar triagem')
      setIsTriaging(false)
      return false
    }
  }, [startPolling])

  // ============================================
  // TRIAGEM - STATUS
  // ============================================

  const loadTriagemStatus = useCallback(async (triagemId: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/triagem/status/${triagemId}`)
      const data = await response.json()
      
      if (data.success) {
        setCurrentTriagem(data.data.triagem)
        
        if (data.data.resultados) {
          setResultados(data.data.resultados)
        }
        
        // Se ainda está processando, iniciar polling
        if (data.data.triagem.status === 'processando' || data.data.triagem.status === 'pendente') {
          setIsTriaging(true)
          startPolling(triagemId)
        }
      } else {
        setError(data.error || 'Erro ao carregar status')
      }
    } catch (err) {
      console.error('Erro ao carregar status:', err)
      setError('Erro de conexão ao carregar status')
    } finally {
      setIsLoading(false)
    }
  }, [startPolling])

  // ============================================
  // TRIAGEM - POR VAGA
  // ============================================

  const loadTriagensByVaga = useCallback(async (vagaId: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/triagem/vagas/${vagaId}`)
      const data = await response.json()
      
      if (data.success) {
        setTriagens(data.data.triagens || [])
        setEstatisticas(data.data.estatisticas || null)
        
        // Se tem última triagem, carregar detalhes
        if (data.data.ultima_triagem) {
          setCurrentTriagem({
            id: data.data.ultima_triagem.id,
            vaga_id: vagaId,
            status: 'concluida',
            total_candidatos: 0,
            candidatos_processados: 0,
            candidatos_aprovados: 0,
            candidatos_rejeitados: 0,
            concluida_em: data.data.ultima_triagem.concluida_em
          })
          
          if (data.data.ultima_triagem.resultados) {
            setResultados(data.data.ultima_triagem.resultados)
          }
        }
        
        // Verificar se há triagem em andamento
        const emAndamento = data.data.triagens?.find(
          (t: Triagem) => t.status === 'pendente' || t.status === 'processando'
        )
        
        if (emAndamento) {
          setIsTriaging(true)
          setCurrentTriagem(emAndamento)
          startPolling(emAndamento.id)
        }
      } else {
        setError(data.error || 'Erro ao carregar triagens')
      }
    } catch (err) {
      console.error('Erro ao carregar triagens:', err)
      setError('Erro de conexão ao carregar triagens')
    } finally {
      setIsLoading(false)
    }
  }, [startPolling])

  // ============================================
  // RETORNO
  // ============================================

  return {
    // Estado
    config,
    triagens,
    currentTriagem,
    resultados,
    estatisticas,
    
    // Flags de loading
    isLoading,
    isLoadingConfig,
    isSavingConfig,
    isTriaging,
    
    // Erros
    error,
    
    // Ações - Config
    loadConfig,
    saveConfig,
    
    // Ações - Triagem
    triggerTriagem,
    loadTriagemStatus,
    loadTriagensByVaga,
    
    // Utilidades
    clearError,
    stopPolling
  }
}

// ============================================
// UTILITÁRIOS
// ============================================

/**
 * Retorna cor baseada na nota
 */
export function getNotaColor(nota: number): string {
  if (nota >= 8) return '#22c55e' // verde
  if (nota >= 6) return '#eab308' // amarelo
  if (nota >= 4) return '#f97316' // laranja
  return '#ef4444' // vermelho
}

/**
 * Retorna label da classificação
 */
export function getClassificacaoLabel(classificacao: string): string {
  const labels: Record<string, string> = {
    'altamente_qualificado': 'Altamente Qualificado',
    'qualificado': 'Qualificado',
    'com_ressalvas': 'Com Ressalvas',
    'nao_recomendado': 'Não Recomendado'
  }
  return labels[classificacao] || classificacao
}

/**
 * Retorna label da recomendação
 */
export function getRecomendacaoLabel(recomendacao: string): string {
  const labels: Record<string, string> = {
    'aprovar': 'Aprovar',
    'analisar': 'Analisar',
    'rejeitar': 'Rejeitar'
  }
  return labels[recomendacao] || recomendacao
}

/**
 * Retorna cor da recomendação
 */
export function getRecomendacaoColor(recomendacao: string): string {
  const colors: Record<string, string> = {
    'aprovar': '#22c55e',
    'analisar': '#eab308',
    'rejeitar': '#ef4444'
  }
  return colors[recomendacao] || '#6b7280'
}
