// API service following BMAD service template patterns
import { 
  Vaga, 
  CreateVagaRequest, 
  UpdateVagaRequest, 
  VagasListResponse, 
  VagasFilters, 
  VagaMetrics,
  VagaWithCandidatos,
  VagasResponse,
  PublicVagasFilters,
  PublicVagasResponse
} from '../vagas/vagas-types'
import { env, validateConfig } from '../config/env'

class VagasApiService {
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

  async getVagasByEmpregador(empregadorId: string, filters?: VagasFilters): Promise<VagasListResponse> {
  try {
    let query = `/vagas?empregador_id=eq.${empregadorId}&select=*`

    // Add filters
    if (filters?.status && filters.status !== 'todas') {
      query += `&status=eq.${filters.status}`
    }

    if (filters?.search) {
      query += `&or=(titulo.ilike.*${filters.search}*,descricao.ilike.*${filters.search}*,cidade.ilike.*${filters.search}*)`
    }

    // Add pagination
    const page = filters?.page || 1
    const limit = filters?.limit || 10
    const offset = (page - 1) * limit
    query += `&limit=${limit}&offset=${offset}`

    // Order by data_publicacao desc
    query += `&order=data_publicacao.desc`

    const vagas = await this.makeRequest<Vaga[]>(query)

    // ✅ CORREÇÃO: Buscar TODAS as candidaturas de uma vez só
    if (vagas && vagas.length > 0) {
      const vagaIds = vagas.map(v => v.id)
      
      // Uma única query para todas as candidaturas
      const candidaturasQuery = `/candidaturas?vaga_id=in.(${vagaIds.join(',')})&select=vaga_id`
      const todasCandidaturas = await this.makeRequest<{vaga_id: string}[]>(candidaturasQuery)
      
      // Contar candidaturas por vaga em memória
      const contagemPorVaga: Record<string, number> = {}
      todasCandidaturas?.forEach(c => {
        contagemPorVaga[c.vaga_id] = (contagemPorVaga[c.vaga_id] || 0) + 1
      })
      
      // Adicionar contagem a cada vaga
      const vagasComCandidatos = vagas.map(vaga => ({
        ...vaga,
        total_candidatos: contagemPorVaga[vaga.id] || 0
      }))

      // Get total count for pagination
      const countQuery = `/vagas?empregador_id=eq.${empregadorId}&select=count`
      const countResult = await this.makeRequest<{count: number}[]>(countQuery)
      const total = countResult[0]?.count || 0

      return {
        vagas: vagasComCandidatos,
        total,
        page,
        limit
      }
    }

    // Get total count for pagination
    const countQuery = `/vagas?empregador_id=eq.${empregadorId}&select=count`
    const countResult = await this.makeRequest<{count: number}[]>(countQuery)
    const total = countResult[0]?.count || 0

    return {
      vagas: vagas || [],
      total,
      page,
      limit
    }
  } catch (error) {
    console.error('Get vagas error:', error)
    throw error
  }
}

  async getVagaById(id: string, empregadorId?: string): Promise<VagaWithCandidatos> {
    try {
      let query = `/vagas?id=eq.${id}&select=*,empresa:empresas(id,nome,logo_url,descricao,site,setor,endereco),candidaturas(id,candidato_id,data_candidatura,status,etapa,carta_apresentacao,anexos,curriculo_compartilhado,notas_processo,avaliacao_empregador,feedback_empregador,candidato:profiles(id,email))`
      
      // Se empregadorId for fornecido, adicionar filtro de autorização
      if (empregadorId) {
        query += `&empregador_id=eq.${empregadorId}`
      }
      
      const response = await this.makeRequest<VagaWithCandidatos[]>(query)
      
      if (!response || response.length === 0) {
        throw new Error('Vaga não encontrada')
      }

      const vaga = response[0]
      vaga.candidatos_count = vaga.candidaturas?.length || 0

      // Adicionar empresa_nome da relação empresa
      if (vaga.empresa && Array.isArray(vaga.empresa) && vaga.empresa.length > 0) {
        vaga.empresa_nome = vaga.empresa[0].nome
      } else if (vaga.empresa && typeof vaga.empresa === 'object' && 'nome' in vaga.empresa) {
        vaga.empresa_nome = vaga.empresa.nome
      }

      // Se há candidaturas, buscar dados detalhados dos candidatos
      if (vaga.candidaturas && vaga.candidaturas.length > 0) {
        const candidatoIds = vaga.candidaturas.map(c => c.candidato_id)

        // Buscar dados dos candidatos
        const candidatosQuery = `/candidatos?user_id=in.(${candidatoIds.join(',')})&select=*`
        const candidatosData = await this.makeRequest<any[]>(candidatosQuery)

        // Buscar emails dos profiles
        const profilesQuery = `/profiles?id=in.(${candidatoIds.join(',')})&select=id,email`
        const profilesData = await this.makeRequest<any[]>(profilesQuery)

        // Mapear dados dos candidatos para as candidaturas
        vaga.candidaturas = vaga.candidaturas.map(candidatura => {
          const candidatoData = candidatosData.find(c => c.user_id === candidatura.candidato_id)
          const profileData = profilesData.find(p => p.id === candidatura.candidato_id)
          return {
            ...candidatura,
            candidato_dados: candidatoData ? {
              id: candidatoData.id, // ID da tabela candidatos para a rota de visualização
              nome_completo: candidatoData.nome_completo,
              email: profileData?.email || candidatura.candidato?.email || '',
              telefone: candidatoData.telefone,
              cidade: candidatoData.cidade,
              estado: candidatoData.estado,
              data_nascimento: candidatoData.data_nascimento,
              titulo_profissional: candidatoData.titulo_profissional,
              resumo_profissional: candidatoData.resumo_profissional,
              nivel_senioridade: candidatoData.nivel_senioridade,
              anos_experiencia: candidatoData.anos_experiencia,
              foto_url: candidatoData.foto_url,
              habilidades_tecnicas: candidatoData.habilidades_tecnicas,
              experiencia_profissional: candidatoData.experiencia_profissional,
              formacao_academica: candidatoData.formacao_academica,
              idiomas: candidatoData.idiomas,
              links_portfolio: candidatoData.links_portfolio,
              linkedin_url: candidatoData.linkedin_url,
              github_url: candidatoData.github_url
            } : undefined
          }
        })
      }

      return vaga
    } catch (error) {
      console.error('Get vaga by id error:', error)
      throw error
    }
  }

  async createVaga(empregadorId: string, vagaData: CreateVagaRequest): Promise<Vaga> {
    try {
      // First, get empresa data for the employer
      const empresaResponse = await this.makeRequest<any[]>(
        `/empresas?user_id=eq.${empregadorId}&select=*`
      )

      let empresaData = null
      if (empresaResponse && empresaResponse.length > 0) {
        empresaData = empresaResponse[0]
      }

      // Remove campos que não existem na tabela vagas
      const cleanVagaData = { ...vagaData } as Record<string, any>
      delete cleanVagaData.empresa_nome
      delete cleanVagaData.sobre_empresa

      const payload = {
        ...cleanVagaData,
        empregador_id: empregadorId,
        status: 'Ativa' as const,
        data_publicacao: new Date().toISOString()
      }

      const response = await this.makeRequest<Vaga[]>('/vagas', {
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response || response.length === 0) {
        throw new Error('Erro ao criar vaga')
      }

      return response[0]
    } catch (error) {
      console.error('Create vaga error:', error)
      throw error
    }
  }

  async updateVaga(vagaData: UpdateVagaRequest): Promise<Vaga> {
    try {
      const { id, ...restData } = vagaData
      const updateData = { ...restData } as Record<string, any>
      delete updateData.empresa_nome
      delete updateData.sobre_empresa
      // Remove campos que não existem na tabela vagas
      const cleanUpdateData = { ...updateData }

      const response = await this.makeRequest<Vaga[]>(`/vagas?id=eq.${id}`, {
        method: 'PATCH',
        body: JSON.stringify(cleanUpdateData)
      })

      if (!response || response.length === 0) {
        throw new Error('Erro ao atualizar vaga')
      }

      return response[0]
    } catch (error) {
      console.error('Update vaga error:', error)
      throw error
    }
  }

  async deleteVaga(id: string): Promise<void> {
    try {
      await this.makeRequest(`/vagas?id=eq.${id}`, {
        method: 'DELETE'
      })
    } catch (error) {
      console.error('Delete vaga error:', error)
      throw error
    }
  }

  async getTotalCandidaturas(empregadorId: string): Promise<number> {
    try {
      const candidaturasQuery = `/candidaturas?select=vaga_id,vagas!inner(empregador_id)&vagas.empregador_id=eq.${empregadorId}`
      const candidaturas = await this.makeRequest<{vaga_id: string}[]>(candidaturasQuery)
      return candidaturas?.length || 0
    } catch (error) {
      console.error('Get total candidaturas error:', error)
      return 0
    }
  }

  async getCandidaturasPorPeriodo(empregadorId: string, days: number = 7): Promise<{date: string, candidaturas: number}[]> {
    try {
      const dataInicio = new Date()
      dataInicio.setDate(dataInicio.getDate() - days)

      const candidaturasQuery = `/candidaturas?select=data_candidatura,vaga_id,vagas!inner(empregador_id)&vagas.empregador_id=eq.${empregadorId}&data_candidatura=gte.${dataInicio.toISOString()}&order=data_candidatura.asc`
      const candidaturas = await this.makeRequest<{data_candidatura: string, vaga_id: string}[]>(candidaturasQuery)

      // Agrupar candidaturas por dia
      const candidaturasPorDia: Record<string, number> = {}

      if (candidaturas && candidaturas.length > 0) {
        candidaturas.forEach(candidatura => {
          const data = new Date(candidatura.data_candidatura)
          const dataStr = data.toDateString()
          candidaturasPorDia[dataStr] = (candidaturasPorDia[dataStr] || 0) + 1
        })
      }

      // Para 30 dias, agrupar por semanas para melhor visualização
      if (days === 30) {
        const resultado = []
        const semanasInterval = 5 // Mostrar a cada 5 dias

        for (let i = days - 1; i >= 0; i -= semanasInterval) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          const dateStr = date.toDateString()

          // Somar candidaturas dos próximos 5 dias a partir deste ponto
          let totalCandidaturas = 0
          for (let j = 0; j < semanasInterval && (i - j) >= 0; j++) {
            const tempDate = new Date()
            tempDate.setDate(tempDate.getDate() - (i - j))
            const tempDateStr = tempDate.toDateString()
            totalCandidaturas += candidaturasPorDia[tempDateStr] || 0
          }

          const label = i === 0 ? 'Hoje' :
                      i <= 7 ? `Há ${i} dia${i > 1 ? 's' : ''}` :
                      `Há ${Math.round(i / 7)} sem${Math.round(i / 7) > 1 ? 's' : ''}`

          resultado.push({
            date: label,
            candidaturas: totalCandidaturas
          })
        }

        return resultado.reverse()
      }

      // Para 7 dias, manter o formato atual (dia por dia)
      else {
        const resultado = []
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          const dateStr = date.toDateString()

          resultado.push({
            date: i === 0 ? 'Hoje' : `Há ${i} dia${i > 1 ? 's' : ''}`,
            candidaturas: candidaturasPorDia[dateStr] || 0
          })
        }

        return resultado
      }
    } catch (error) {
      console.error('Get candidaturas por periodo error:', error)
      return []
    }
  }

  async getVagasMetrics(empregadorId: string): Promise<VagaMetrics> {
    try {
      // Get all vagas for this empregador
      const vagasQuery = `/vagas?empregador_id=eq.${empregadorId}&select=id,status`
      const vagas = await this.makeRequest<{id: string, status: string}[]>(vagasQuery)

      // Get candidaturas count per vaga
      const candidaturasQuery = `/candidaturas?select=vaga_id,vagas!inner(empregador_id)&vagas.empregador_id=eq.${empregadorId}`
      const candidaturas = await this.makeRequest<{vaga_id: string}[]>(candidaturasQuery)

      // Calculate metrics
      const total_vagas = vagas.length
      const vagas_ativas = vagas.filter(v => v.status === 'Ativa').length
      const vagas_encerradas = vagas.filter(v => v.status === 'Encerrada').length

      // Count candidaturas per vaga
      const candidaturasPorVaga: Record<string, number> = {}
      candidaturas.forEach(c => {
        candidaturasPorVaga[c.vaga_id] = (candidaturasPorVaga[c.vaga_id] || 0) + 1
      })

      const maior_numero_candidatos = Math.max(0, ...Object.values(candidaturasPorVaga))

      return {
        total_vagas,
        vagas_ativas,
        vagas_encerradas,
        maior_numero_candidatos
      }
    } catch (error) {
      console.error('Get vagas metrics error:', error)
      throw error
    }
  }

  async changeVagaStatus(id: string, status: 'Rascunho' | 'Ativa' | 'Encerrada' | 'Preenchida'): Promise<Vaga> {
    try {
      const updateData = { status }
      const response = await this.makeRequest<Vaga[]>(
        `/vagas?id=eq.${id}`,
        {
          method: 'PATCH',
          body: JSON.stringify(updateData)
        }
      )
      
      if (!response || response.length === 0) {
        throw new Error('Vaga não encontrada para atualização')
      }

      return response[0]
    } catch (error) {
      console.error('Change vaga status error:', error)
      throw error
    }
  }

  // ============================================================================
  // PUBLIC JOB SEARCH METHODS (for candidates)
  // ============================================================================

  async searchVagasPublicas(filters: PublicVagasFilters = {}): Promise<PublicVagasResponse> {
    try {
      let query = '/vagas?status=eq.Ativa&select=*'
      
      // Apply search filters
      if (filters.busca) {
        const busca = encodeURIComponent(filters.busca.toLowerCase())
        query += `&or=(titulo.ilike.*${busca}*,descricao.ilike.*${busca}*)`
      }
      
      if (filters.localizacao) {
        const localizacao = encodeURIComponent(filters.localizacao)
        query += `&or=(cidade.ilike.*${localizacao}*,estado.ilike.*${localizacao}*)`
      }

      if (filters.estado) {
        query += `&estado=eq.${encodeURIComponent(filters.estado)}`
      }

      if (filters.cidade) {
        query += `&cidade=eq.${encodeURIComponent(filters.cidade)}`
      }

      if (filters.modelo_trabalho) {
        query += `&modelo_trabalho=eq.${encodeURIComponent(filters.modelo_trabalho)}`
      }
      
      if (filters.tipo_contratacao) {
        query += `&tipo_contratacao=eq.${encodeURIComponent(filters.tipo_contratacao)}`
      }
      
      if (filters.nivel) {
        query += `&nivel=eq.${encodeURIComponent(filters.nivel)}`
      }
      
      if (filters.salario_min) {
        query += `&salario_de=gte.${filters.salario_min}`
      }
      
      if (filters.salario_max) {
        query += `&salario_ate=lte.${filters.salario_max}`
      }
      
      // Ordering and pagination
      const orderBy = filters.orderBy || 'data_publicacao'
      const orderDirection = filters.orderDirection || 'desc'
      query += `&order=${orderBy}.${orderDirection}`
      
      if (filters.limit) {
        query += `&limit=${filters.limit}`
      }
      
      if (filters.offset) {
        query += `&offset=${filters.offset}`
      }

      const response = await this.makeRequest<Vaga[]>(query)
      
      // Buscar dados das empresas para todas as vagas
      if (response && response.length > 0) {
        const empregadorIds = [...new Set(response.map(vaga => vaga.empregador_id))]

        try {
          const empresasResponse = await this.makeRequest<any[]>(
            `/empresas?user_id=in.(${empregadorIds.join(',')})&select=user_id,nome,logo_url,descricao,site,setor,endereco,beneficios`
          )


          const empresasMap = new Map(empresasResponse.map(emp => [emp.user_id, emp]))
          
          // Mapear dados da empresa para cada vaga e combinar benefícios
          response.forEach(vaga => {
            const empresa = empresasMap.get(vaga.empregador_id)
            if (empresa) {
              vaga.empresa_nome = empresa.nome
              vaga.empresa_logo_url = empresa.logo_url
              vaga.empresa_descricao = empresa.descricao
              vaga.empresa_site = empresa.site
              vaga.empresa_setor = empresa.setor
              vaga.empresa_endereco = empresa.endereco

              
              // Combinar benefícios
              const beneficiosEmpresa = empresa.beneficios || []
              const beneficiosVaga = vaga.beneficios || []
              const todosBeneficios = [...new Set([...beneficiosEmpresa, ...beneficiosVaga])]
              vaga.beneficios = todosBeneficios.length > 0 ? todosBeneficios : undefined
            }
          })
        } catch (empresaError) {
          console.warn('Erro ao buscar dados das empresas:', empresaError)
        }
      }
      
      // Get total count for pagination - aplicar os mesmos filtros
      let countQuery = '/vagas?status=eq.Ativa&select=count'
      
      // Apply the same filters to count query
      if (filters.busca) {
        const busca = encodeURIComponent(filters.busca.toLowerCase())
        countQuery += `&or=(titulo.ilike.*${busca}*,descricao.ilike.*${busca}*)`
      }
      
      if (filters.localizacao) {
        const localizacao = encodeURIComponent(filters.localizacao)
        countQuery += `&or=(cidade.ilike.*${localizacao}*,estado.ilike.*${localizacao}*)`
      }

      if (filters.estado) {
        countQuery += `&estado=eq.${encodeURIComponent(filters.estado)}`
      }

      if (filters.cidade) {
        countQuery += `&cidade=eq.${encodeURIComponent(filters.cidade)}`
      }

      if (filters.modelo_trabalho) {
        countQuery += `&modelo_trabalho=eq.${encodeURIComponent(filters.modelo_trabalho)}`
      }
      
      if (filters.tipo_contratacao) {
        countQuery += `&tipo_contratacao=eq.${encodeURIComponent(filters.tipo_contratacao)}`
      }
      
      if (filters.nivel) {
        countQuery += `&nivel=eq.${encodeURIComponent(filters.nivel)}`
      }
      
      if (filters.salario_min) {
        countQuery += `&salario_de=gte.${filters.salario_min}`
      }
      
      if (filters.salario_max) {
        countQuery += `&salario_ate=lte.${filters.salario_max}`
      }

      const countResponse = await this.makeRequest<[{ count: number }]>(countQuery)
      const totalCount = countResponse[0]?.count || 0
      
      return {
        vagas: response || [],
        total: totalCount,
        page: Math.floor((filters.offset || 0) / (filters.limit || 10)) + 1,
        totalPages: Math.ceil(totalCount / (filters.limit || 10))
      }
    } catch (error) {
      console.error('Search vagas publicas error:', error)
      throw error
    }
  }

  async verificarCandidaturaExistente(vagaId: string, candidatoId: string): Promise<{
    ja_candidatou: boolean
    data_candidatura?: string
    status?: string
    etapa?: number
  }> {
    try {
      const response = await this.makeRequest<{
        id: string
        data_candidatura: string
        status: string
        etapa: number
      }[]>(
        `/candidaturas?vaga_id=eq.${vagaId}&candidato_id=eq.${candidatoId}&select=id,data_candidatura,status,etapa&limit=1`
      )
      
      if (response && response.length > 0) {
        const candidatura = response[0]
        return {
          ja_candidatou: true,
          data_candidatura: candidatura.data_candidatura,
          status: candidatura.status,
          etapa: candidatura.etapa
        }
      }
      
      return { ja_candidatou: false }
    } catch (error) {
      console.error('Verificar candidatura existente error:', error)
      return { ja_candidatou: false }
    }
  }

  async getEstatisticasVaga(vagaId: string): Promise<{
    candidaturas_total: number
    visualizacoes_total: number
    candidaturas_ultimos_7_dias: number
    vaga_ativa_ha_dias: number
  } | null> {
    try {
      // Buscar candidaturas para esta vaga
      const candidaturasResponse = await this.makeRequest<{id: string, data_candidatura: string}[]>(
        `/candidaturas?vaga_id=eq.${vagaId}&select=id,data_candidatura`
      )
      
      const candidaturas = candidaturasResponse || []
      const candidaturas_total = candidaturas.length
      
      // Calcular candidaturas dos últimos 7 dias
      const seteViasAtras = new Date()
      seteViasAtras.setDate(seteViasAtras.getDate() - 7)
      
      const candidaturas_ultimos_7_dias = candidaturas.filter(c => 
        new Date(c.data_candidatura) >= seteViasAtras
      ).length

      // Buscar dados da vaga para calcular dias ativa
      const vaga = await this.getVagaPublicaById(vagaId)
      let vaga_ativa_ha_dias = 0
      
      if (vaga?.data_publicacao) {
        const dataPublicacao = new Date(vaga.data_publicacao)
        const hoje = new Date()
        vaga_ativa_ha_dias = Math.floor((hoje.getTime() - dataPublicacao.getTime()) / (1000 * 60 * 60 * 24))
      }

      // Buscar visualizações reais do banco
      let visualizacoes_total = 0
      try {
        const visualizacoesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/vagas/${vagaId}/visualizacoes`)
        if (visualizacoesResponse.ok) {
          const data = await visualizacoesResponse.json()
          visualizacoes_total = data.total || 0
        }
      } catch (error) {
        console.error('Erro ao buscar visualizações:', error)
        // Fallback: estimativa baseada em candidaturas
        visualizacoes_total = candidaturas_total * 10
      }

      return {
        candidaturas_total,
        visualizacoes_total,
        candidaturas_ultimos_7_dias,
        vaga_ativa_ha_dias
      }
    } catch (error) {
      console.error('Get estatisticas vaga error:', error)
      return null
    }
  }

  async getVagasSimilares(vagaId: string, limit: number = 3): Promise<Vaga[]> {
    try {
      // Primeiro, buscar a vaga atual para usar como referência
      const vagaAtual = await this.getVagaPublicaById(vagaId)
      if (!vagaAtual) return []

      // Buscar todas as vagas ativas (exceto a atual) para calcular similaridade
      // Limitamos a 50 para performance, mas fazemos pontuação inteligente
      const query = `/vagas?status=eq.Ativa&id=neq.${vagaId}&select=*&limit=50`

      const response = await this.makeRequest<Vaga[]>(query)
      if (!response || response.length === 0) return []

      // Calcular pontuação de similaridade para cada vaga
      const vagasComPontuacao = response.map(vaga => {
        let pontuacao = 0

        // 1. Mesma área de atuação (peso 30)
        if (vagaAtual.area_atuacao && vaga.area_atuacao === vagaAtual.area_atuacao) {
          pontuacao += 30
        }

        // 2. Mesmo nível (peso 20)
        if (vagaAtual.nivel && vaga.nivel === vagaAtual.nivel) {
          pontuacao += 20
        }

        // 3. Mesmo modelo de trabalho (peso 15)
        if (vagaAtual.modelo_trabalho && vaga.modelo_trabalho === vagaAtual.modelo_trabalho) {
          pontuacao += 15
        }

        // 4. Mesmo tipo de contratação (peso 10)
        if (vagaAtual.tipo_contratacao && vaga.tipo_contratacao === vagaAtual.tipo_contratacao) {
          pontuacao += 10
        }

        // 5. Faixa salarial similar (peso 15)
        if (vagaAtual.salario_de && vaga.salario_de) {
          const diferencaSalarial = Math.abs(vagaAtual.salario_de - vaga.salario_de)
          const diferencaPercentual = diferencaSalarial / vagaAtual.salario_de
          if (diferencaPercentual <= 0.3) { // Diferença de até 30%
            pontuacao += 15
          } else if (diferencaPercentual <= 0.5) { // Diferença de até 50%
            pontuacao += 8
          }
        }

        // 6. Mesma cidade/região (peso 10)
        if (vagaAtual.cidade && vaga.cidade === vagaAtual.cidade) {
          pontuacao += 10
        }

        // 7. Similaridade no título (peso 20)
        if (vagaAtual.titulo && vaga.titulo) {
          const palavrasVagaAtual = vagaAtual.titulo.toLowerCase().split(' ').filter(p => p.length > 3)
          const palavrasVaga = vaga.titulo.toLowerCase().split(' ').filter(p => p.length > 3)

          const palavrasComuns = palavrasVagaAtual.filter(p =>
            palavrasVaga.some(pv => pv.includes(p) || p.includes(pv))
          )

          if (palavrasComuns.length > 0) {
            const percentualSimilaridade = palavrasComuns.length / Math.max(palavrasVagaAtual.length, 1)
            pontuacao += Math.floor(percentualSimilaridade * 20)
          }
        }

        return { vaga, pontuacao }
      })

      // Ordenar por pontuação (maior para menor) e pegar as top N
      const vagasSimilaresOrdenadas = vagasComPontuacao
        .filter(v => v.pontuacao > 0) // Apenas vagas com alguma similaridade
        .sort((a, b) => b.pontuacao - a.pontuacao)
        .slice(0, limit)
        .map(v => v.vaga)

      // Buscar dados das empresas para as vagas similares ordenadas
      if (vagasSimilaresOrdenadas && vagasSimilaresOrdenadas.length > 0) {
        const empregadorIds = [...new Set(vagasSimilaresOrdenadas.map(vaga => vaga.empregador_id))]

        try {
          const empresasResponse = await this.makeRequest<any[]>(
            `/empresas?user_id=in.(${empregadorIds.join(',')})&select=user_id,nome,logo_url,descricao,site,setor,endereco,beneficios`
          )

          const empresasMap = new Map(empresasResponse.map(emp => [emp.user_id, emp]))

          // Mapear dados da empresa para cada vaga similar
          vagasSimilaresOrdenadas.forEach(vaga => {
            const empresa = empresasMap.get(vaga.empregador_id)
            if (empresa) {
              vaga.empresa_nome = empresa.nome
              vaga.empresa_logo_url = empresa.logo_url
              vaga.empresa_descricao = empresa.descricao
              vaga.empresa_site = empresa.site
              vaga.empresa_setor = empresa.setor
              vaga.empresa_endereco = empresa.endereco
            }
          })
        } catch (empresaError) {
          console.warn('Erro ao buscar dados das empresas:', empresaError)
        }
      }

      return vagasSimilaresOrdenadas
    } catch (error) {
      console.error('Get vagas similares error:', error)
      return []
    }
  }

  async getVagaPublicaById(id: string): Promise<Vaga | null> {
    try {
      // Buscar vaga
      const vagaResponse = await this.makeRequest<any[]>(
        `/vagas?id=eq.${id}&status=eq.Ativa&select=*`
      )
      
      const vagaData = vagaResponse?.[0]
      if (!vagaData) return null

      // Buscar dados da empresa separadamente
      let empresaData = null
      if (vagaData.empregador_id) {
        try {
          const empresaResponse = await this.makeRequest<any[]>(
            `/empresas?user_id=eq.${vagaData.empregador_id}&select=nome,descricao,site,setor,endereco,tamanho_empresa,fundacao_ano,beneficios,telefone,email,cnpj,logo_url`
          )
          empresaData = empresaResponse?.[0]
        } catch (empresaError) {
          console.warn('Erro ao buscar dados da empresa:', empresaError)
        }
      }

      // Combinar benefícios da empresa com benefícios específicos da vaga
      const beneficiosEmpresa = empresaData?.beneficios || []
      const beneficiosVaga = vagaData.beneficios || []
      const todosBeneficios = [...new Set([...beneficiosEmpresa, ...beneficiosVaga])]

      // Construir objeto vaga com dados da empresa integrados
      const vaga: Vaga = {
        id: vagaData.id,
        empregador_id: vagaData.empregador_id,
        titulo: vagaData.titulo,
        descricao: vagaData.descricao,
        cidade: vagaData.cidade,
        estado: vagaData.estado,
        localizacao: vagaData.localizacao,
        nivel: vagaData.nivel,
        tipo_contratacao: vagaData.tipo_contratacao,
        modelo_trabalho: vagaData.modelo_trabalho,
        area_atuacao: vagaData.area_atuacao,
        responsabilidades: vagaData.responsabilidades,
        requisitos: vagaData.requisitos,
        diferenciais: vagaData.diferenciais,
        beneficios: todosBeneficios.length > 0 ? todosBeneficios : undefined,
        etapas_processo: vagaData.etapas_processo,
        salario_de: vagaData.salario_de,
        salario_ate: vagaData.salario_ate,
        data_expiracao: vagaData.data_expiracao,
        remoto: vagaData.remoto,
        num_vagas: vagaData.num_vagas,
        status: vagaData.status,
        data_publicacao: vagaData.data_publicacao,
        contato_email: vagaData.contato_email,
        contato_whatsapp: vagaData.contato_whatsapp,
        // Dados da empresa
        empresa_nome: empresaData?.nome,
        empresa_logo_url: empresaData?.logo_url,
        empresa_descricao: empresaData?.descricao,
        empresa_site: empresaData?.site,
        empresa_setor: empresaData?.setor,
        empresa_endereco: empresaData?.endereco
      }

      // Garantir que campos JSON sejam arrays válidos
      if (vaga.responsabilidades && typeof vaga.responsabilidades === 'string') {
        try {
          vaga.responsabilidades = JSON.parse(vaga.responsabilidades)
        } catch {
          vaga.responsabilidades = []
        }
      }
      
      if (vaga.requisitos && typeof vaga.requisitos === 'string') {
        try {
          vaga.requisitos = JSON.parse(vaga.requisitos)
        } catch {
          vaga.requisitos = []
        }
      }
      
      if (vaga.beneficios && typeof vaga.beneficios === 'string') {
        try {
          vaga.beneficios = JSON.parse(vaga.beneficios)
        } catch {
          vaga.beneficios = []
        }
      }
      
      if (vaga.diferenciais && typeof vaga.diferenciais === 'string') {
        try {
          vaga.diferenciais = JSON.parse(vaga.diferenciais)
        } catch {
          vaga.diferenciais = []
        }
      }
      
      if (vaga.etapas_processo && typeof vaga.etapas_processo === 'string') {
        try {
          vaga.etapas_processo = JSON.parse(vaga.etapas_processo)
        } catch {
          vaga.etapas_processo = []
        }
      }
      
      return vaga
    } catch (error) {
      console.error('Get vaga publica by id error:', error)
      throw error
    }
  }

  async getVagasRecentesPublicas(limit: number = 6): Promise<Vaga[]> {
    try {
      const response = await this.makeRequest<Vaga[]>(
        `/vagas?status=eq.Ativa&select=*&order=data_publicacao.desc&limit=${limit}`
      )

      // Buscar dados das empresas para todas as vagas
      if (response && response.length > 0) {
        const empregadorIds = [...new Set(response.map(vaga => vaga.empregador_id))]

        try {
          const empresasResponse = await this.makeRequest<any[]>(
            `/empresas?user_id=in.(${empregadorIds.join(',')})&select=user_id,nome,logo_url,descricao,site,setor,endereco,beneficios`
          )

          const empresasMap = new Map(empresasResponse.map(emp => [emp.user_id, emp]))

          // Mapear dados da empresa para cada vaga
          response.forEach(vaga => {
            const empresa = empresasMap.get(vaga.empregador_id)
            if (empresa) {
              vaga.empresa_nome = empresa.nome
              vaga.empresa_logo_url = empresa.logo_url
              vaga.empresa_descricao = empresa.descricao
              vaga.empresa_site = empresa.site
              vaga.empresa_setor = empresa.setor
              vaga.empresa_endereco = empresa.endereco
            }
          })
        } catch (empresaError) {
          console.warn('Erro ao buscar dados das empresas:', empresaError)
        }
      }

      return response || []
    } catch (error) {
      console.error('Get vagas recentes publicas error:', error)
      throw error
    }
  }

  async getVagasRecomendadas(userId: string, limit: number = 5): Promise<{
    vagas: (Vaga & { match_score: number; match_reasons: string[] })[]
    total: number
  }> {
    try {
      // Primeiro, buscar o candidato pelo user_id
      const candidatoQuery = `/candidatos?user_id=eq.${userId}&select=*`
      const candidatoResult = await this.makeRequest<any[]>(candidatoQuery)

      if (!candidatoResult || candidatoResult.length === 0) {
        return { vagas: [], total: 0 }
      }

      const candidato = candidatoResult[0]

      // Buscar todas as vagas ativas
      const query = `/vagas?status=eq.Ativa&select=*&order=data_publicacao.desc`
      const todasVagas = await this.makeRequest<Vaga[]>(query)

      if (!todasVagas || todasVagas.length === 0) {
        return { vagas: [], total: 0 }
      }

      // Buscar dados das empresas para as vagas
      const empregadorIds = [...new Set(todasVagas.map(vaga => vaga.empregador_id))]

      let empresasMap = new Map()
      if (empregadorIds.length > 0) {
        try {
          const empresasResponse = await this.makeRequest<any[]>(
            `/empresas?user_id=in.(${empregadorIds.join(',')})&select=user_id,nome,logo_url,descricao,site,setor,endereco,beneficios`
          )
          empresasMap = new Map(empresasResponse.map(emp => [emp.user_id, emp]))
        } catch (empresaError) {
          console.warn('Erro ao buscar dados das empresas:', empresaError)
        }
      }

      // Calcular pontuação de compatibilidade para cada vaga
      const vagasComScore = todasVagas.map(vaga => {
        let score = 0
        const reasons: string[] = []

        // 1. Compatibilidade de localização (peso: 25%)
        if (candidato.endereco?.estado && vaga.estado) {
          if (candidato.endereco.estado === vaga.estado) {
            score += 25
            reasons.push('Localização ideal')
          }
        }
        if (candidato.disponivel_remoto && (vaga.modelo_trabalho === 'Remoto' || vaga.remoto)) {
          score += 20
          reasons.push('Trabalho remoto disponível')
        }

        // 2. Compatibilidade de nível/experiência (peso: 20%)
        if (candidato.nivel_senioridade && vaga.nivel) {
          const nivelCandidato = candidato.nivel_senioridade.toLowerCase()
          const nivelVaga = vaga.nivel.toLowerCase()

          if (nivelCandidato === nivelVaga) {
            score += 20
            reasons.push('Nível de experiência compatível')
          } else if (
            (nivelCandidato === 'senior' && (nivelVaga === 'pleno' || nivelVaga === 'junior')) ||
            (nivelCandidato === 'pleno' && nivelVaga === 'junior')
          ) {
            score += 15
            reasons.push('Experiência compatível')
          }
        }

        // 3. Compatibilidade salarial (peso: 15%)
        if (candidato.salario_pretendido_de && vaga.salario_de) {
          const salarioCandidato = typeof candidato.salario_pretendido_de === 'string' 
          ? parseFloat(candidato.salario_pretendido_de) 
          : candidato.salario_pretendido_de || 0

          const salarioVaga = typeof vaga.salario_de === 'string'
            ? parseFloat(vaga.salario_de)
            : vaga.salario_de || 0

          if (salarioVaga >= salarioCandidato) {
            score += 15
            reasons.push('Faixa salarial compatível')
          } else if (salarioVaga >= salarioCandidato * 0.8) {
            score += 10
            reasons.push('Salário próximo ao desejado')
          }
        }

        // 4. Compatibilidade de tipo de contratação (peso: 10%)
        if (candidato.tipo_contratacao_preferido && vaga.tipo_contratacao) {
          if (candidato.tipo_contratacao_preferido === vaga.tipo_contratacao) {
            score += 10
            reasons.push('Tipo de contratação desejado')
          }
        }

        // 5. Compatibilidade de modelo de trabalho (peso: 10%)
        if (candidato.modelo_trabalho_preferido && vaga.modelo_trabalho) {
          if (candidato.modelo_trabalho_preferido === vaga.modelo_trabalho) {
            score += 10
            reasons.push('Modelo de trabalho ideal')
          }
        }

        // 6. Compatibilidade de habilidades técnicas (peso: 20%)
        if (candidato.habilidades_tecnicas && vaga.requisitos &&
            candidato.habilidades_tecnicas.length > 0 && vaga.requisitos.length > 0) {
          const habilidadesCandidato = candidato.habilidades_tecnicas.map((h: string) => h.toLowerCase())
          const requisitosVaga = vaga.requisitos.map((r: string) => r.toLowerCase())

          const habilidadesComuns = habilidadesCandidato.filter((habilidade: string) =>
            requisitosVaga.some((requisito: string) =>
              requisito.includes(habilidade) || habilidade.includes(requisito)
            )
          )

          if (habilidadesComuns.length > 0) {
            const percentualMatch = (habilidadesComuns.length / requisitosVaga.length) * 20
            score += Math.min(percentualMatch, 20)
            reasons.push(`${habilidadesComuns.length} habilidade(s) em comum`)
          }
        }

        // Adicionar dados da empresa
        const empresa = empresasMap.get(vaga.empregador_id)
        if (empresa) {
          vaga.empresa_nome = empresa.nome
          vaga.empresa_logo_url = empresa.logo_url
          vaga.empresa_descricao = empresa.descricao
          vaga.empresa_site = empresa.site
          vaga.empresa_setor = empresa.setor
          vaga.empresa_endereco = empresa.endereco
        }

        return {
          ...vaga,
          match_score: Math.round(score),
          match_reasons: reasons
        }
      })

      // Filtrar vagas com score mínimo de 30 e ordenar por score
      const vagasFiltradas = vagasComScore
        .filter(vaga => vaga.match_score >= 30)
        .sort((a, b) => b.match_score - a.match_score)
        .slice(0, limit)

      return {
        vagas: vagasFiltradas,
        total: vagasFiltradas.length
      }
    } catch (error) {
      console.error('Get vagas recomendadas error:', error)
      return { vagas: [], total: 0 }
    }
  }
}

export const vagasApiService = new VagasApiService()
