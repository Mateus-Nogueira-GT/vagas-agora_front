// API service following BMAD service template patterns
import { 
  Candidato,
  CreateCandidatoRequest,
  UpdateCandidatoRequest,
  CandidatosListResponse,
  CandidatosFilters,
  CurriculoVisualizacoesStats
} from '../candidatos/candidatos-types'
import { env, validateConfig } from '../config/env'

class CandidatosApiService {
  private readonly baseUrl: string
  private readonly apiKey: string

  constructor() {
    // Validate environment configuration on instantiation
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

  private async getProfileEmail(userId: string): Promise<string> {
    try {
      const profiles = await this.makeRequest<Array<{ email?: string }>>(
        `/profiles?id=eq.${encodeURIComponent(userId)}&select=email&limit=1`,
      )
      return profiles[0]?.email || ''
    } catch (error) {
      console.warn('Não foi possível carregar o email do perfil:', error)
      return ''
    }
  }

  async getCandidatoByUserId(userId: string): Promise<Candidato | null> {
    try {
      const query = `/candidatos?user_id=eq.${encodeURIComponent(userId)}&select=*&limit=1`
      const response = await this.makeRequest<Candidato[]>(query)
      
      if (!response || response.length === 0) {
        return null
      }

      const candidato = response[0]
      return {
        ...candidato,
        email: await this.getProfileEmail(candidato.user_id),
      }
    } catch (error) {
      console.error('Get candidato by user id error:', error)
      throw error
    }
  }

  async getCandidatoById(id: string): Promise<Candidato> {
    try {
      const query = `/candidatos?id=eq.${id}&select=*`
      const response = await this.makeRequest<Candidato[]>(query)

      if (!response || response.length === 0) {
        throw new Error('Candidato não encontrado')
      }

      return response[0]
    } catch (error) {
      console.error('Get candidato by id error:', error)
      throw error
    }
  }

  async getCandidatoPublicoById(id: string): Promise<Candidato | null> {
    try {
      const query = `/candidatos?id=eq.${encodeURIComponent(id)}&visibilidade_perfil=eq.publico&select=*&limit=1`
      const response = await this.makeRequest<Candidato[]>(query)

      if (!response || response.length === 0) {
        return null
      }

      const candidato = response[0]
      return {
        ...candidato,
        email: await this.getProfileEmail(candidato.user_id),
      }
    } catch (error) {
      console.error('Get candidato publico by id error:', error)
      throw error
    }
  }

  async createCandidato(userId: string, candidatoData: CreateCandidatoRequest): Promise<Candidato> {
    try {
      const payload = {
        ...candidatoData,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const response = await this.makeRequest<Candidato[]>('/candidatos', {
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response || response.length === 0) {
        throw new Error('Erro ao criar perfil de candidato')
      }

      // Atualizar nome no profile também (profiles.nome)
      if (candidatoData.nome_completo) {
        try {
          await this.makeRequest<any[]>(`/profiles?id=eq.${userId}`, {
            method: 'PATCH',
            body: JSON.stringify({ nome: candidatoData.nome_completo })
          })
        } catch (profileError) {
          console.warn('Erro ao atualizar profile (não crítico):', profileError)
          // Não falha a requisição se o profile não puder ser atualizado
        }
      }

      return response[0]
    } catch (error) {
      console.error('Create candidato error:', error)
      throw error
    }
  }

  async updateCandidato(candidatoData: UpdateCandidatoRequest): Promise<Candidato> {
    try {
      const { id, ...updateData } = candidatoData
      
      const payload = {
        ...updateData,
        updated_at: new Date().toISOString()
      }

      const response = await this.makeRequest<Candidato[]>(`/candidatos?id=eq.${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      })

      if (!response || response.length === 0) {
        throw new Error('Erro ao atualizar perfil de candidato')
      }

      return response[0]
    } catch (error) {
      console.error('Update candidato error:', error)
      throw error
    }
  }

  async updateCandidatoByUserId(userId: string, candidatoData: Partial<UpdateCandidatoRequest>): Promise<Candidato> {
    try {
      // Remove campos que não devem ser atualizados
      const { id, ...updateData } = candidatoData

      const payload = {
        ...updateData,
        updated_at: new Date().toISOString()
      }

      // Atualizar candidato
      const response = await this.makeRequest<Candidato[]>(`/candidatos?user_id=eq.${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      })

      if (!response || response.length === 0) {
        throw new Error('Erro ao atualizar perfil de candidato')
      }

      // Atualizar nome no profile também (profiles.nome)
      if (candidatoData.nome_completo) {
        try {
          await this.makeRequest<any[]>(`/profiles?id=eq.${userId}`, {
            method: 'PATCH',
            body: JSON.stringify({ nome: candidatoData.nome_completo })
          })
        } catch (profileError) {
          console.warn('Erro ao atualizar profile (não crítico):', profileError)
          // Não falha a requisição se o profile não puder ser atualizado
        }
      }

      return response[0]
    } catch (error) {
      console.error('Update candidato by user id error:', error)
      throw error
    }
  }

  async deleteCandidato(id: string): Promise<void> {
    try {
      await this.makeRequest(`/candidatos?id=eq.${id}`, {
        method: 'DELETE'
      })
    } catch (error) {
      console.error('Delete candidato error:', error)
      throw error
    }
  }

  async listCandidatos(filters?: CandidatosFilters): Promise<CandidatosListResponse> {
    try {
      let query = `/candidatos?select=*`
      
      // Add filters
      if (filters?.search) {
        query += `&or=(nome_completo.ilike.*${filters.search}*,titulo_profissional.ilike.*${filters.search}*,bio.ilike.*${filters.search}*)`
      }

      if (filters?.nivel_senioridade) {
        query += `&nivel_senioridade=eq.${filters.nivel_senioridade}`
      }

      if (filters?.anos_experiencia_min !== undefined) {
        query += `&anos_experiencia=gte.${filters.anos_experiencia_min}`
      }

      if (filters?.anos_experiencia_max !== undefined) {
        query += `&anos_experiencia=lte.${filters.anos_experiencia_max}`
      }

      if (filters?.disponivel_remoto !== undefined) {
        query += `&disponivel_remoto=eq.${filters.disponivel_remoto}`
      }

      if (filters?.disponivel_relocacao !== undefined) {
        query += `&disponivel_relocacao=eq.${filters.disponivel_relocacao}`
      }

      // Add pagination
      const page = filters?.page || 1
      const limit = filters?.limit || 10
      const offset = (page - 1) * limit
      query += `&limit=${limit}&offset=${offset}`

      // Order by updated_at desc
      query += `&order=updated_at.desc`

      const candidatos = await this.makeRequest<Candidato[]>(query)
      
      // Get total count for pagination
      const countQuery = `/candidatos?select=count`
      const countResult = await this.makeRequest<{count: number}[]>(countQuery)
      const total = countResult[0]?.count || 0

      return {
        candidatos,
        total,
        page,
        limit
      }
    } catch (error) {
      console.error('List candidatos error:', error)
      throw error
    }
  }

  async registrarVisualizacaoCurriculo(candidatoId: string, visualizadorId: string): Promise<void> {
    try {
      // Verificar se já existe uma visualização hoje do mesmo visualizador
      const hoje = new Date().toISOString().split('T')[0]
      const checkQuery = `/curriculo_visualizacoes?candidato_id=eq.${candidatoId}&visualizador_id=eq.${visualizadorId}&data_visualizacao=gte.${hoje}T00:00:00.000Z&data_visualizacao=lte.${hoje}T23:59:59.999Z`
      const existingViews = await this.makeRequest<any[]>(checkQuery)

      // Se já existe visualização hoje, não registra novamente
      if (existingViews && existingViews.length > 0) {
        return
      }

      // Registrar nova visualização
      const payload = {
        candidato_id: candidatoId,
        visualizador_id: visualizadorId,
        data_visualizacao: new Date().toISOString()
      }

      await this.makeRequest('/curriculo_visualizacoes', {
        method: 'POST',
        body: JSON.stringify(payload)
      })
    } catch (error) {
      console.error('Registrar visualizacao curriculo error:', error)
      throw error
    }
  }

  async getEstatisticasVisualizacoes(userId: string): Promise<CurriculoVisualizacoesStats> {
    try {
      // Primeiro, buscar o candidato pelo user_id
      const candidatoQuery = `/candidatos?user_id=eq.${userId}&select=id`
      const candidatoResult = await this.makeRequest<{id: string}[]>(candidatoQuery)

      if (!candidatoResult || candidatoResult.length === 0) {
        // Se não encontrou candidato, retorna estatísticas zeradas
        return {
          total_visualizacoes: 0,
          visualizacoes_mes_atual: 0,
          visualizacoes_mes_anterior: 0,
          percentual_crescimento: 0
        }
      }

      const candidatoId = candidatoResult[0].id

      const hoje = new Date()
      const mesAtual = hoje.getMonth()
      const anoAtual = hoje.getFullYear()

      // Mês anterior
      const mesAnterior = mesAtual === 0 ? 11 : mesAtual - 1
      const anoMesAnterior = mesAtual === 0 ? anoAtual - 1 : anoAtual

      // Calcular total de visualizações
      const totalQuery = `/curriculo_visualizacoes?candidato_id=eq.${candidatoId}&select=count`
      const totalResult = await this.makeRequest<{count: number}[]>(totalQuery)
      const totalVisualizacoes = totalResult[0]?.count || 0

      // Visualizações do mês atual
      const inicioMesAtual = new Date(anoAtual, mesAtual, 1).toISOString()
      const fimMesAtual = new Date(anoAtual, mesAtual + 1, 0, 23, 59, 59, 999).toISOString()
      const mesAtualQuery = `/curriculo_visualizacoes?candidato_id=eq.${candidatoId}&data_visualizacao=gte.${inicioMesAtual}&data_visualizacao=lte.${fimMesAtual}&select=count`
      const mesAtualResult = await this.makeRequest<{count: number}[]>(mesAtualQuery)
      const visualizacoesMesAtual = mesAtualResult[0]?.count || 0

      // Visualizações do mês anterior
      const inicioMesAnterior = new Date(anoMesAnterior, mesAnterior, 1).toISOString()
      const fimMesAnterior = new Date(anoMesAnterior, mesAnterior + 1, 0, 23, 59, 59, 999).toISOString()
      const mesAnteriorQuery = `/curriculo_visualizacoes?candidato_id=eq.${candidatoId}&data_visualizacao=gte.${inicioMesAnterior}&data_visualizacao=lte.${fimMesAnterior}&select=count`
      const mesAnteriorResult = await this.makeRequest<{count: number}[]>(mesAnteriorQuery)
      const visualizacoesMesAnterior = mesAnteriorResult[0]?.count || 0

      // Calcular percentual de crescimento
      let percentualCrescimento = 0
      if (visualizacoesMesAnterior > 0) {
        percentualCrescimento = Math.round(((visualizacoesMesAtual - visualizacoesMesAnterior) / visualizacoesMesAnterior) * 100)
      } else if (visualizacoesMesAtual > 0) {
        percentualCrescimento = 100 // Se não tinha visualizações no mês anterior mas tem agora
      }

      return {
        total_visualizacoes: totalVisualizacoes,
        visualizacoes_mes_atual: visualizacoesMesAtual,
        visualizacoes_mes_anterior: visualizacoesMesAnterior,
        percentual_crescimento: percentualCrescimento
      }
    } catch (error) {
      console.error('Get estatisticas visualizacoes error:', error)
      throw error
    }
  }

  async getAtividadesRecentes(userId: string, limit: number = 10): Promise<any[]> {
    try {
      // Primeiro, buscar o candidato pelo user_id
      const candidatoQuery = `/candidatos?user_id=eq.${userId}&select=id`
      const candidatoResult = await this.makeRequest<{id: string}[]>(candidatoQuery)

      if (!candidatoResult || candidatoResult.length === 0) {
        return []
      }

      const candidatoId = candidatoResult[0].id
      const atividades: any[] = []

      try {
        // 1. Buscar visualizações do currículo (últimos 7 dias)
        const seteDiasAtras = new Date()
        seteDiasAtras.setDate(seteDiasAtras.getDate() - 7)

        const visualizacoesQuery = `/curriculo_visualizacoes?candidato_id=eq.${candidatoId}&data_visualizacao=gte.${seteDiasAtras.toISOString()}&order=data_visualizacao.desc&limit=${Math.floor(limit/3)}`
        const visualizacoes = await this.makeRequest<any[]>(visualizacoesQuery)

        // Buscar dados dos visualizadores (empregadores)
        if (visualizacoes && visualizacoes.length > 0) {
          const visualizadorIds = visualizacoes
            .map(v => v.visualizador_id)
            .filter(id => id && id.length === 36) // Filtrar apenas UUIDs válidos

          if (visualizadorIds.length > 0) {
            try {
              const empregadoresQuery = `/empresas?user_id=in.(${visualizadorIds.join(',')})`
              const empregadores = await this.makeRequest<any[]>(empregadoresQuery)
              const empregadoresMap = new Map(empregadores.map(emp => [emp.user_id, emp]))

              visualizacoes.forEach(vis => {
                const empregador = empregadoresMap.get(vis.visualizador_id)
                if (empregador) {
                  atividades.push({
                    tipo: 'visualizacao',
                    titulo: `${empregador.nome} visualizou seu currículo`,
                    data: vis.data_visualizacao,
                    icone: empregador.nome.substring(0, 2).toUpperCase(),
                    empresa: empregador.nome
                  })
                }
              })
            } catch (empError) {
              console.warn('Erro ao buscar dados dos empregadores:', empError)
            }
          }
        }
      } catch (visError) {
        console.warn('Erro ao buscar visualizações:', visError)
      }

      try {
        // 2. Buscar candidaturas recentes (últimos 30 dias)
        const trintaDiasAtras = new Date()
        trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30)

        const candidaturasQuery = `/candidaturas?candidato_id=eq.${userId}&data_candidatura=gte.${trintaDiasAtras.toISOString()}&select=*,vaga:vagas(titulo)&order=data_candidatura.desc&limit=${Math.floor(limit/2)}`
        const candidaturas = await this.makeRequest<any[]>(candidaturasQuery)

        if (candidaturas && candidaturas.length > 0) {
          candidaturas.forEach(cand => {
            atividades.push({
              tipo: 'candidatura',
              titulo: `Sua candidatura para ${cand.vaga?.titulo || 'vaga'} foi recebida`,
              data: cand.data_candidatura,
              icone: '💼',
              status: cand.status
            })
          })
        }
      } catch (candError) {
        console.warn('Erro ao buscar candidaturas:', candError)
      }

      // Adicionar algumas atividades de exemplo para completar
      const agora = new Date()
      const ontem = new Date(agora)
      ontem.setDate(ontem.getDate() - 1)
      const doisDiasAtras = new Date(agora)
      doisDiasAtras.setDate(doisDiasAtras.getDate() - 2)

      if (atividades.length < 3) {
        atividades.push({
          tipo: 'recomendacao',
          titulo: `${8 + Math.floor(Math.random() * 5)} novas vagas recomendadas para você`,
          data: doisDiasAtras.toISOString(),
          icone: '🔍'
        })
      }

      // Ordenar por data (mais recente primeiro) e limitar
      return atividades
        .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
        .slice(0, limit)

    } catch (error) {
      console.error('Get atividades recentes error:', error)
      return []
    }
  }
}

// Export singleton instance
export const candidatosApiService = new CandidatosApiService()
