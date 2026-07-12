// API service for notifications
import { env, validateConfig } from '../config/env'

export interface Notificacao {
  id: number
  user_id: string
  tipo: string
  titulo: string
  descricao: string
  data: string
  lida: boolean
}

class NotificacoesApiService {
  private readonly baseUrl: string
  private readonly apiKey: string

  constructor() {
    validateConfig()
    this.baseUrl = env.supabase.url
    this.apiKey = env.supabase.anonKey
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/rest/v1${endpoint}`

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'apikey': this.apiKey,
        'Authorization': `Bearer ${this.apiKey}`,
        'Prefer': 'return=representation',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  async getNotificacoes(userId: string, filtro?: 'todas' | 'nao-lidas', limit: number = 20): Promise<Notificacao[]> {
    try {
      let query = `/notificacoes?user_id=eq.${userId}&order=data.desc&limit=${limit}`

      if (filtro === 'nao-lidas') {
        query += `&lida=eq.false`
      }

      const response = await this.makeRequest<Notificacao[]>(query)

      return response || []
    } catch (error) {
      console.error('Get notificacoes error:', error)
      return []
    }
  }

  async marcarComoLida(notificacaoId: number): Promise<void> {
    try {
      await this.makeRequest(`/notificacoes?id=eq.${notificacaoId}`, {
        method: 'PATCH',
        body: JSON.stringify({ lida: true })
      })
    } catch (error) {
      console.error('Marcar como lida error:', error)
      throw error
    }
  }

  async excluirNotificacao(notificacaoId: number): Promise<void> {
    try {
      await this.makeRequest(`/notificacoes?id=eq.${notificacaoId}`, {
        method: 'DELETE'
      })
    } catch (error) {
      console.error('Excluir notificacao error:', error)
      throw error
    }
  }

  async marcarTodasComoLidas(userId: string): Promise<void> {
    try {
      await this.makeRequest(`/notificacoes?user_id=eq.${userId}&lida=eq.false`, {
        method: 'PATCH',
        body: JSON.stringify({ lida: true })
      })
    } catch (error) {
      console.error('Marcar todas como lidas error:', error)
      throw error
    }
  }

  async criarNotificacao(userId: string, tipo: string, titulo: string, descricao: string): Promise<Notificacao> {
    try {
      const payload = {
        user_id: userId,
        tipo,
        titulo,
        descricao,
        data: new Date().toISOString(),
        lida: false
      }

      const response = await this.makeRequest<Notificacao[]>('/notificacoes', {
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response || response.length === 0) {
        throw new Error('Erro ao criar notificação')
      }

      return response[0]
    } catch (error) {
      console.error('Criar notificacao error:', error)
      throw error
    }
  }

  private criarNotificacoesExemplo(): Notificacao[] {
    const hoje = new Date()
    const ontem = new Date(hoje)
    ontem.setDate(ontem.getDate() - 1)
    const doisDiasAtras = new Date(hoje)
    doisDiasAtras.setDate(doisDiasAtras.getDate() - 2)
    const tresDiasAtras = new Date(hoje)
    tresDiasAtras.setDate(tresDiasAtras.getDate() - 3)

    return [
      {
        id: 1,
        user_id: 'temp',
        tipo: 'candidatura',
        titulo: 'Entrevista agendada',
        descricao: 'Você tem uma entrevista agendada para a vaga de Desenvolvedor Frontend na TechCorp.',
        data: hoje.toISOString(),
        lida: false
      },
      {
        id: 2,
        user_id: 'temp',
        tipo: 'sistema',
        titulo: 'Currículo verificado',
        descricao: 'Seu currículo foi verificado e está pronto para ser visualizado por recrutadores.',
        data: ontem.toISOString(),
        lida: false
      },
      {
        id: 3,
        user_id: 'temp',
        tipo: 'candidatura',
        titulo: 'Nova etapa de seleção',
        descricao: 'Você avançou para a próxima etapa do processo seletivo na empresa Design Studio.',
        data: ontem.toISOString(),
        lida: true
      },
      {
        id: 4,
        user_id: 'temp',
        tipo: 'alerta',
        titulo: 'Complete seu perfil',
        descricao: 'Adicione suas experiências profissionais para aumentar suas chances de contratação.',
        data: doisDiasAtras.toISOString(),
        lida: true
      },
      {
        id: 5,
        user_id: 'temp',
        tipo: 'candidatura',
        titulo: 'Candidatura visualizada',
        descricao: 'Sua candidatura para a vaga de UX Designer foi visualizada pela empresa Creative Labs.',
        data: tresDiasAtras.toISOString(),
        lida: true
      },
      {
        id: 6,
        user_id: 'temp',
        tipo: 'sistema',
        titulo: 'Novas vagas disponíveis',
        descricao: 'Encontramos 5 novas vagas que correspondem ao seu perfil profissional.',
        data: tresDiasAtras.toISOString(),
        lida: true
      }
    ]
  }
}

export const notificacoesApiService = new NotificacoesApiService()
