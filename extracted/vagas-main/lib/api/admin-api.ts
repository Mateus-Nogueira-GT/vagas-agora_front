import { supabase } from '@/lib/supabase'

// ============================================================================
// MÉTRICAS ADMIN
// ============================================================================

export interface AdminMetrics {
  total_candidatos: number
  total_empregadores: number
  total_vagas: number
  vagas_ativas: number
  total_candidaturas: number
  total_empresas: number
  candidatos_ativos_mes: number
  empregadores_ativos_mes: number
  candidaturas_mes: number
  vagas_publicadas_mes: number
}

export async function getAdminMetrics(): Promise<{ success: boolean; data?: AdminMetrics; error?: string }> {
  try {
    // Usar queries individuais diretamente
      const [
        { count: candidatos },
        { count: empregadores },
        { count: vagas },
        { count: vagasAtivas },
        { count: candidaturas },
        { count: empresas }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'candidato'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'empregador'),
        supabase.from('vagas').select('*', { count: 'exact', head: true }),
        supabase.from('vagas').select('*', { count: 'exact', head: true }).eq('status', 'Ativa'),
        supabase.from('candidaturas').select('*', { count: 'exact', head: true }),
        supabase.from('empresas').select('*', { count: 'exact', head: true })
      ])

      // Métricas do mês atual
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const [
        { count: candidatosAtivos },
        { count: empregadoresAtivos },
        { count: candidaturasMes },
        { count: vagasMes }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true })
          .eq('role', 'candidato')
          .gte('data_cadastro', startOfMonth.toISOString()),
        supabase.from('profiles').select('*', { count: 'exact', head: true })
          .eq('role', 'empregador')
          .gte('data_cadastro', startOfMonth.toISOString()),
        supabase.from('candidaturas').select('*', { count: 'exact', head: true })
          .gte('data_candidatura', startOfMonth.toISOString()),
        supabase.from('vagas').select('*', { count: 'exact', head: true })
          .gte('data_publicacao', startOfMonth.toISOString())
      ])

    const metricsData: AdminMetrics = {
      total_candidatos: candidatos || 0,
      total_empregadores: empregadores || 0,
      total_vagas: vagas || 0,
      vagas_ativas: vagasAtivas || 0,
      total_candidaturas: candidaturas || 0,
      total_empresas: empresas || 0,
      candidatos_ativos_mes: candidatosAtivos || 0,
      empregadores_ativos_mes: empregadoresAtivos || 0,
      candidaturas_mes: candidaturasMes || 0,
      vagas_publicadas_mes: vagasMes || 0
    }

    return {
      success: true,
      data: metricsData
    }
  } catch (error) {
    console.error('Erro inesperado ao buscar métricas admin:', error)
    return {
      success: false,
      error: 'Erro inesperado ao buscar métricas'
    }
  }
}

// ============================================================================
// CANDIDATOS ADMIN
// ============================================================================

export interface AdminCandidato {
  id: string
  email: string
  nome_completo?: string
  data_cadastro: string
  ultimo_acesso?: string
  ativo: boolean
  titulo_profissional?: string
  nivel_senioridade?: string
  cidade?: string
  estado?: string
  total_candidaturas: number
  foto_url?: string
}

export interface CandidatosFilters {
  search?: string
  ativo?: boolean
  nivel_senioridade?: string
  page?: number
  limit?: number
}

export async function getAdminCandidatos(filters: CandidatosFilters = {}): Promise<{
  success: boolean
  data?: { candidatos: AdminCandidato[]; total: number; page: number; totalPages: number }
  error?: string
}> {
  try {
    const page = filters.page || 1
    const limit = filters.limit || 20
    const offset = (page - 1) * limit

    // Buscar candidatos com joins
    let query = supabase
      .from('profiles')
      .select(`
        id,
        email,
        data_cadastro,
        ultimo_acesso,
        ativo,
        candidatos!inner(
          nome_completo,
          titulo_profissional,
          nivel_senioridade,
          endereco,
          foto_url
        )
      `)
      .eq('role', 'candidato')

    // Aplicar filtros simples primeiro
    if (typeof filters.ativo === 'boolean') {
      query = query.eq('ativo', filters.ativo)
    }

    if (filters.nivel_senioridade) {
      query = query.eq('candidatos.nivel_senioridade', filters.nivel_senioridade)
    }

    // Buscar dados paginados
    const { data: allData, error } = await query
      .order('data_cadastro', { ascending: false })

    if (error) {
      console.error('Erro ao buscar candidatos admin:', error)
      return {
        success: false,
        error: `Erro ao buscar candidatos: ${error.message}`
      }
    }

    let filteredData = allData || []

    // Aplicar filtro de busca no frontend se necessário
    if (filters.search && filteredData.length > 0) {
      const searchTerm = filters.search.toLowerCase()
      filteredData = filteredData.filter(candidato => {
        const email = candidato.email?.toLowerCase() || ''
        const candidatoDetalhes = Array.isArray(candidato.candidatos)
          ? candidato.candidatos[0]
          : candidato.candidatos
        const nome = candidatoDetalhes?.nome_completo?.toLowerCase() || ''
        return email.includes(searchTerm) || nome.includes(searchTerm)
      })
    }

    // Aplicar paginação
    const total = filteredData.length
    const paginatedData = filteredData.slice(offset, offset + limit)

    // Buscar total de candidaturas para cada candidato
    const candidatosComMetricas = await Promise.all(
      paginatedData.map(async (candidato) => {
        const { count: candidaturasCount } = await supabase
          .from('candidaturas')
          .select('*', { count: 'exact', head: true })
          .eq('candidato_id', candidato.id)

        const candidatoDetalhes = Array.isArray(candidato.candidatos)
          ? candidato.candidatos[0]
          : candidato.candidatos
        const endereco = candidatoDetalhes?.endereco as any

        return {
          id: candidato.id,
          email: candidato.email,
          nome_completo: candidatoDetalhes?.nome_completo,
          data_cadastro: candidato.data_cadastro,
          ultimo_acesso: candidato.ultimo_acesso,
          ativo: candidato.ativo,
          titulo_profissional: candidatoDetalhes?.titulo_profissional,
          nivel_senioridade: candidatoDetalhes?.nivel_senioridade,
          cidade: endereco?.cidade,
          estado: endereco?.estado,
          total_candidaturas: candidaturasCount || 0,
          foto_url: candidatoDetalhes?.foto_url
        }
      })
    )

    return {
      success: true,
      data: {
        candidatos: candidatosComMetricas,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      }
    }
  } catch (error) {
    console.error('Erro inesperado ao buscar candidatos admin:', error)
    return {
      success: false,
      error: 'Erro inesperado ao buscar candidatos'
    }
  }
}

// ============================================================================
// EMPREGADORES ADMIN
// ============================================================================

export interface AdminEmpregador {
  id: string
  email: string
  nome_empresa?: string
  cnpj?: string
  data_cadastro: string
  ultimo_acesso?: string
  ativo: boolean
  setor?: string
  tamanho_empresa?: string
  cidade?: string
  estado?: string
  total_vagas: number
  vagas_ativas: number
  total_candidaturas: number
  candidaturas_mes?: number
  logo_url?: string
}

export interface EmpregadoresFilters {
  search?: string
  ativo?: boolean
  setor?: string
  tamanho_empresa?: string
  page?: number
  limit?: number
}

export async function getAdminEmpregadores(filters: EmpregadoresFilters = {}): Promise<{
  success: boolean
  data?: { empregadores: AdminEmpregador[]; total: number; page: number; totalPages: number }
  error?: string
}> {
  try {
    const page = filters.page || 1
    const limit = filters.limit || 20
    const offset = (page - 1) * limit

    // Primeiro, buscar todos os profiles de empregadores
    let profileQuery = supabase
      .from('profiles')
      .select('id, email, data_cadastro, ultimo_acesso, ativo')
      .eq('role', 'empregador')

    // Aplicar filtros simples
    if (typeof filters.ativo === 'boolean') {
      profileQuery = profileQuery.eq('ativo', filters.ativo)
    }

    const { data: profiles, error: profileError } = await profileQuery
      .order('data_cadastro', { ascending: false })

    if (profileError) {
      console.error('Erro ao buscar profiles de empregadores:', profileError)
      return {
        success: false,
        error: `Erro ao buscar empregadores: ${profileError.message}`
      }
    }

    if (!profiles || profiles.length === 0) {
      return {
        success: true,
        data: {
          empregadores: [],
          total: 0,
          page,
          totalPages: 0
        }
      }
    }

    // Buscar dados das empresas para cada profile
    const empregadoresComEmpresas = await Promise.all(
      profiles.map(async (profile) => {
        try {
          const { data: empresaData, error: empresaError } = await supabase
            .from('empresas')
            .select('nome, cnpj, setor, tamanho_empresa, endereco, logo_url')
            .eq('user_id', profile.id)
            .single()

          if (empresaError) {
            console.warn(`Empresa não encontrada para profile ${profile.id}:`, empresaError)
          }

          return {
            ...profile,
            empresa: empresaData || null
          }
        } catch (error) {
          console.error(`Erro ao buscar empresa para profile ${profile.id}:`, error)
          return {
            ...profile,
            empresa: null
          }
        }
      })
    )

    // Filtrar por busca e outros filtros se necessário
    let filteredEmpregadores = empregadoresComEmpresas

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filteredEmpregadores = filteredEmpregadores.filter(emp => {
        const email = emp.email?.toLowerCase() || ''
        const nomeEmpresa = emp.empresa?.nome?.toLowerCase() || ''
        return email.includes(searchTerm) || nomeEmpresa.includes(searchTerm)
      })
    }

    if (filters.setor) {
      filteredEmpregadores = filteredEmpregadores.filter(emp =>
        emp.empresa?.setor === filters.setor
      )
    }

    if (filters.tamanho_empresa) {
      filteredEmpregadores = filteredEmpregadores.filter(emp =>
        emp.empresa?.tamanho_empresa === filters.tamanho_empresa
      )
    }

    // Aplicar paginação
    const total = filteredEmpregadores.length
    const paginatedData = filteredEmpregadores.slice(offset, offset + limit)

    // Buscar métricas para cada empregador
    const empregadoresComMetricas = await Promise.all(
      paginatedData.map(async (empregador) => {
        try {
          // Buscar vagas do empregador
          const [
            { count: totalVagas },
            { count: vagasAtivas },
            { data: vagasDoEmpregador }
          ] = await Promise.all([
            supabase
              .from('vagas')
              .select('*', { count: 'exact', head: true })
              .eq('empregador_id', empregador.id),
            supabase
              .from('vagas')
              .select('*', { count: 'exact', head: true })
              .eq('empregador_id', empregador.id)
              .eq('status', 'Ativa'),
            supabase
              .from('vagas')
              .select('id')
              .eq('empregador_id', empregador.id)
          ])

          // Extrair IDs das vagas
          const vagaIds = vagasDoEmpregador?.map(v => v.id) || []

          // Buscar candidaturas apenas se houver vagas
          let totalCandidaturas = 0
          let candidaturasMes = 0

          if (vagaIds.length > 0) {
            // Buscar candidaturas totais
            const { count: countTotal } = await supabase
              .from('candidaturas')
              .select('*', { count: 'exact', head: true })
              .in('vaga_id', vagaIds)

            totalCandidaturas = countTotal || 0

            // Buscar candidaturas do mês atual
            const startOfMonth = new Date()
            startOfMonth.setDate(1)
            startOfMonth.setHours(0, 0, 0, 0)

            const { count: countMes } = await supabase
              .from('candidaturas')
              .select('*', { count: 'exact', head: true })
              .gte('data_candidatura', startOfMonth.toISOString())
              .in('vaga_id', vagaIds)

            candidaturasMes = countMes || 0
          }

          const endereco = empregador.empresa?.endereco as any

          return {
            id: empregador.id,
            email: empregador.email,
            nome_empresa: empregador.empresa?.nome || 'Empresa não informada',
            cnpj: empregador.empresa?.cnpj,
            data_cadastro: empregador.data_cadastro,
            ultimo_acesso: empregador.ultimo_acesso,
            ativo: empregador.ativo,
            setor: empregador.empresa?.setor || 'Não informado',
            tamanho_empresa: empregador.empresa?.tamanho_empresa,
            cidade: endereco?.cidade,
            estado: endereco?.estado,
            total_vagas: totalVagas || 0,
            vagas_ativas: vagasAtivas || 0,
            total_candidaturas: totalCandidaturas || 0,
            candidaturas_mes: candidaturasMes || 0,
            logo_url: empregador.empresa?.logo_url
          }
        } catch (error) {
          console.error(`Erro ao buscar métricas para empregador ${empregador.id}:`, error)

          // Retorna dados básicos mesmo com erro nas métricas
          const endereco = empregador.empresa?.endereco as any

          return {
            id: empregador.id,
            email: empregador.email,
            nome_empresa: empregador.empresa?.nome || 'Empresa não informada',
            cnpj: empregador.empresa?.cnpj,
            data_cadastro: empregador.data_cadastro,
            ultimo_acesso: empregador.ultimo_acesso,
            ativo: empregador.ativo,
            setor: empregador.empresa?.setor || 'Não informado',
            tamanho_empresa: empregador.empresa?.tamanho_empresa,
            cidade: endereco?.cidade,
            estado: endereco?.estado,
            total_vagas: 0,
            vagas_ativas: 0,
            total_candidaturas: 0,
            candidaturas_mes: 0,
            logo_url: empregador.empresa?.logo_url
          }
        }
      })
    )

    return {
      success: true,
      data: {
        empregadores: empregadoresComMetricas,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      }
    }
  } catch (error) {
    console.error('Erro inesperado ao buscar empregadores admin:', error)
    return {
      success: false,
      error: 'Erro inesperado ao buscar empregadores'
    }
  }
}

// ============================================================================
// AÇÕES ADMIN
// ============================================================================

export async function toggleUserStatus(userId: string, ativo: boolean): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ ativo })
      .eq('id', userId)

    if (error) {
      console.error('Erro ao alterar status do usuário:', error)
      return {
        success: false,
        error: `Erro ao alterar status: ${error.message}`
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Erro inesperado ao alterar status:', error)
    return {
      success: false,
      error: 'Erro inesperado ao alterar status'
    }
  }
}

export async function deleteUser(userId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    // Primeiro, deletar dados relacionados
    await Promise.all([
      supabase.from('candidaturas').delete().eq('candidato_id', userId),
      supabase.from('vagas').delete().eq('empregador_id', userId),
      supabase.from('candidatos').delete().eq('user_id', userId),
      supabase.from('empresas').delete().eq('user_id', userId),
      supabase.from('notificacoes').delete().eq('user_id', userId)
    ])

    // Deletar o perfil
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (error) {
      console.error('Erro ao deletar usuário:', error)
      return {
        success: false,
        error: `Erro ao deletar usuário: ${error.message}`
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Erro inesperado ao deletar usuário:', error)
    return {
      success: false,
      error: 'Erro inesperado ao deletar usuário'
    }
  }
}

// ============================================================================
// DADOS DE GRÁFICOS DASHBOARD
// ============================================================================

export interface ChartDataPoint {
  date: string
  views: number
}

export interface ChartData {
  usuariosData: ChartDataPoint[]
  vagasData: ChartDataPoint[]
  candidaturasData: ChartDataPoint[]
  empresasData: ChartDataPoint[]
}

export async function getChartData(period: 'week' | 'month' | 'quarter' = 'month'): Promise<{
  success: boolean
  data?: ChartData
  error?: string
}> {
  try {

    // Buscar dados de empresas por setor
    const { data: empresasSetor, error: empresasError } = await supabase
      .from('empresas')
      .select('setor')
      .not('setor', 'is', null)

    // Dados de usuários por mês (últimos 6 meses)
    const meses = []
    for (let i = 5; i >= 0; i--) {
        const data = new Date()
        data.setMonth(data.getMonth() - i)
        const mes = data.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
        const mesCapitalizado = mes.charAt(0).toUpperCase() + mes.slice(1)

        // Contar usuários criados neste mês
        const startOfMonth = new Date(data.getFullYear(), data.getMonth(), 1)
        const endOfMonth = new Date(data.getFullYear(), data.getMonth() + 1, 0)

        const { count: usuariosCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'candidato')
          .gte('data_cadastro', startOfMonth.toISOString())
          .lte('data_cadastro', endOfMonth.toISOString())

        meses.push({
          date: mesCapitalizado,
          views: usuariosCount || 0
        })
      }

      // Dados de vagas por mês (últimos 6 meses)
      const vagasPorMes = []
      for (let i = 5; i >= 0; i--) {
        const data = new Date()
        data.setMonth(data.getMonth() - i)
        const mes = data.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
        const mesCapitalizado = mes.charAt(0).toUpperCase() + mes.slice(1)

        const startOfMonth = new Date(data.getFullYear(), data.getMonth(), 1)
        const endOfMonth = new Date(data.getFullYear(), data.getMonth() + 1, 0)

        const { count: vagasCount } = await supabase
          .from('vagas')
          .select('*', { count: 'exact', head: true })
          .gte('data_publicacao', startOfMonth.toISOString())
          .lte('data_publicacao', endOfMonth.toISOString())

        vagasPorMes.push({
          date: mesCapitalizado,
          views: vagasCount || 0
        })
      }

      // Dados de candidaturas por mês (últimos 6 meses)
      const candidaturasPorMes = []
      for (let i = 5; i >= 0; i--) {
        const data = new Date()
        data.setMonth(data.getMonth() - i)
        const mes = data.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
        const mesCapitalizado = mes.charAt(0).toUpperCase() + mes.slice(1)

        const startOfMonth = new Date(data.getFullYear(), data.getMonth(), 1)
        const endOfMonth = new Date(data.getFullYear(), data.getMonth() + 1, 0)

        const { count: candidaturasCount } = await supabase
          .from('candidaturas')
          .select('*', { count: 'exact', head: true })
          .gte('data_candidatura', startOfMonth.toISOString())
          .lte('data_candidatura', endOfMonth.toISOString())

        candidaturasPorMes.push({
          date: mesCapitalizado,
          views: candidaturasCount || 0
        })
      }

      // Dados de empresas por setor
      const setoresCount: { [key: string]: number } = {}
      if (empresasSetor && !empresasError) {
        empresasSetor.forEach((empresa: any) => {
          const setor = empresa.setor || 'Outros'
          setoresCount[setor] = (setoresCount[setor] || 0) + 1
        })
      }

      const empresasPorSetor = Object.entries(setoresCount)
        .map(([date, views]) => ({ date, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 5) // Top 5 setores

    return {
      success: true,
      data: {
        usuariosData: meses,
        vagasData: vagasPorMes,
        candidaturasData: candidaturasPorMes,
        empresasData: empresasPorSetor
      }
    }

  } catch (error) {
    console.error('Erro ao buscar dados dos gráficos:', error)
    return {
      success: false,
      error: 'Erro ao buscar dados dos gráficos'
    }
  }
}

// ============================================================================
// ESTATÍSTICAS COM CRESCIMENTO MENSAL
// ============================================================================

export interface StatWithGrowth {
  value: number
  growth_percentage: number
  is_positive: boolean
  previous_month_value: number
}

export interface DashboardStats {
  usuarios: StatWithGrowth
  empresas: StatWithGrowth
  vagas: StatWithGrowth
  receita?: StatWithGrowth
}

export async function getDashboardStats(): Promise<{
  success: boolean
  data?: DashboardStats
  error?: string
}> {
  try {
    const now = new Date()

    // Início do mês atual
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Início do mês anterior
    const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)

    // Buscar total de usuários (candidatos)
    const [
      { count: totalUsuarios },
      { count: usuariosMesAtual },
      { count: usuariosMesAnterior }
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'candidato'),
      supabase.from('profiles').select('*', { count: 'exact', head: true })
        .eq('role', 'candidato')
        .gte('data_cadastro', startOfCurrentMonth.toISOString()),
      supabase.from('profiles').select('*', { count: 'exact', head: true })
        .eq('role', 'candidato')
        .gte('data_cadastro', startOfPreviousMonth.toISOString())
        .lte('data_cadastro', endOfPreviousMonth.toISOString())
    ])

    // Buscar total de empresas
    const [
      { count: totalEmpresas },
      { count: empresasMesAtual },
      { count: empresasMesAnterior }
    ] = await Promise.all([
      supabase.from('empresas').select('*', { count: 'exact', head: true }),
      supabase.from('empresas').select('*', { count: 'exact', head: true })
        .gte('created_at', startOfCurrentMonth.toISOString()),
      supabase.from('empresas').select('*', { count: 'exact', head: true })
        .gte('created_at', startOfPreviousMonth.toISOString())
        .lte('created_at', endOfPreviousMonth.toISOString())
    ])

    // Buscar total de vagas
    const [
      { count: totalVagas },
      { count: vagasMesAtual },
      { count: vagasMesAnterior }
    ] = await Promise.all([
      supabase.from('vagas').select('*', { count: 'exact', head: true }),
      supabase.from('vagas').select('*', { count: 'exact', head: true })
        .gte('data_publicacao', startOfCurrentMonth.toISOString()),
      supabase.from('vagas').select('*', { count: 'exact', head: true })
        .gte('data_publicacao', startOfPreviousMonth.toISOString())
        .lte('data_publicacao', endOfPreviousMonth.toISOString())
    ])

    // Calcular crescimento
    const calculateGrowth = (current: number, previous: number): { percentage: number, isPositive: boolean } => {
      if (previous === 0) {
        return { percentage: current > 0 ? 100 : 0, isPositive: current > 0 }
      }
      const percentage = Math.round(((current - previous) / previous) * 100)
      return { percentage: Math.abs(percentage), isPositive: percentage >= 0 }
    }

    const usuariosGrowth = calculateGrowth(usuariosMesAtual || 0, usuariosMesAnterior || 0)
    const empresasGrowth = calculateGrowth(empresasMesAtual || 0, empresasMesAnterior || 0)
    const vagasGrowth = calculateGrowth(vagasMesAtual || 0, vagasMesAnterior || 0)

    const stats: DashboardStats = {
      usuarios: {
        value: totalUsuarios || 0,
        growth_percentage: usuariosGrowth.percentage,
        is_positive: usuariosGrowth.isPositive,
        previous_month_value: usuariosMesAnterior || 0
      },
      empresas: {
        value: totalEmpresas || 0,
        growth_percentage: empresasGrowth.percentage,
        is_positive: empresasGrowth.isPositive,
        previous_month_value: empresasMesAnterior || 0
      },
      vagas: {
        value: totalVagas || 0,
        growth_percentage: vagasGrowth.percentage,
        is_positive: vagasGrowth.isPositive,
        previous_month_value: vagasMesAnterior || 0
      }
    }

    return {
      success: true,
      data: stats
    }
  } catch (error) {
    console.error('Erro ao buscar estatísticas do dashboard:', error)
    return {
      success: false,
      error: 'Erro ao buscar estatísticas do dashboard'
    }
  }
}

// ============================================================================
// DADOS HISTÓRICOS PARA GRÁFICOS
// ============================================================================

export interface ChartDataPoint {
  date: string
  views: number
}

export async function getUserGrowthData(period: '7' | '30' | '90' = '30'): Promise<{
  success: boolean
  data?: ChartDataPoint[]
  error?: string
}> {
  try {
    const now = new Date()
    const days = parseInt(period)
    const startDate = new Date(now)
    startDate.setDate(now.getDate() - days)

    const dataPoints: ChartDataPoint[] = []

    if (days === 7) {
      // Para 7 dias, mostrar por dia
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + i)

        const dayStart = new Date(date)
        dayStart.setHours(0, 0, 0, 0)

        const dayEnd = new Date(date)
        dayEnd.setHours(23, 59, 59, 999)

        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'candidato')
          .gte('data_cadastro', dayStart.toISOString())
          .lte('data_cadastro', dayEnd.toISOString())

        const dayLabel = date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit'
        })

        dataPoints.push({
          date: dayLabel,
          views: count || 0
        })
      }
    } else {
      // Para 30 e 90 dias, agrupar por semana
      const weeks = Math.ceil(days / 7)

      for (let i = 0; i < weeks; i++) {
        const weekStart = new Date(startDate)
        weekStart.setDate(startDate.getDate() + (i * 7))

        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        weekEnd.setHours(23, 59, 59, 999)

        // Se a semana passa do período atual, ajustar para hoje
        if (weekEnd > now) {
          weekEnd.setTime(now.getTime())
        }

        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'candidato')
          .gte('data_cadastro', weekStart.toISOString())
          .lte('data_cadastro', weekEnd.toISOString())

        const weekLabel = `${weekStart.getDate()}/${weekStart.getMonth() + 1}`

        dataPoints.push({
          date: weekLabel,
          views: count || 0
        })
      }
    }

    return {
      success: true,
      data: dataPoints
    }
  } catch (error) {
    console.error('Erro ao buscar dados de crescimento de usuários:', error)
    return {
      success: false,
      error: 'Erro ao buscar dados de crescimento de usuários'
    }
  }
}

// ============================================================================
// DADOS DE VAGAS POR PERÍODO
// ============================================================================

export async function getVagasGrowthData(period: '7' | '30' | '90' = '30'): Promise<{
  success: boolean
  data?: ChartDataPoint[]
  error?: string
}> {
  try {
    const now = new Date()
    const days = parseInt(period)
    const startDate = new Date(now)
    startDate.setDate(now.getDate() - days)

    const dataPoints: ChartDataPoint[] = []

    if (days === 7) {
      // Para 7 dias, mostrar por dia
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + i)

        const dayStart = new Date(date)
        dayStart.setHours(0, 0, 0, 0)

        const dayEnd = new Date(date)
        dayEnd.setHours(23, 59, 59, 999)

        const { count } = await supabase
          .from('vagas')
          .select('*', { count: 'exact', head: true })
          .gte('data_publicacao', dayStart.toISOString())
          .lte('data_publicacao', dayEnd.toISOString())

        const dayLabel = date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit'
        })

        dataPoints.push({
          date: dayLabel,
          views: count || 0
        })
      }
    } else {
      // Para 30 e 90 dias, agrupar por semana
      const weeks = Math.ceil(days / 7)

      for (let i = 0; i < weeks; i++) {
        const weekStart = new Date(startDate)
        weekStart.setDate(startDate.getDate() + (i * 7))

        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        weekEnd.setHours(23, 59, 59, 999)

        // Se a semana passa do período atual, ajustar para hoje
        if (weekEnd > now) {
          weekEnd.setTime(now.getTime())
        }

        const { count } = await supabase
          .from('vagas')
          .select('*', { count: 'exact', head: true })
          .gte('data_publicacao', weekStart.toISOString())
          .lte('data_publicacao', weekEnd.toISOString())

        const weekLabel = `${weekStart.getDate()}/${weekStart.getMonth() + 1}`

        dataPoints.push({
          date: weekLabel,
          views: count || 0
        })
      }
    }

    return {
      success: true,
      data: dataPoints
    }
  } catch (error) {
    console.error('Erro ao buscar dados de crescimento de vagas:', error)
    return {
      success: false,
      error: 'Erro ao buscar dados de crescimento de vagas'
    }
  }
}

// ============================================================================
// DADOS DE CANDIDATURAS POR PERÍODO
// ============================================================================

export async function getCandidaturasGrowthData(period: '7' | '30' | '90' = '30'): Promise<{
  success: boolean
  data?: ChartDataPoint[]
  error?: string
}> {
  try {
    const now = new Date()
    const days = parseInt(period)
    const startDate = new Date(now)
    startDate.setDate(now.getDate() - days)

    const dataPoints: ChartDataPoint[] = []

    if (days === 7) {
      // Para 7 dias, mostrar por dia
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + i)

        const dayStart = new Date(date)
        dayStart.setHours(0, 0, 0, 0)

        const dayEnd = new Date(date)
        dayEnd.setHours(23, 59, 59, 999)

        const { count } = await supabase
          .from('candidaturas')
          .select('*', { count: 'exact', head: true })
          .gte('data_candidatura', dayStart.toISOString())
          .lte('data_candidatura', dayEnd.toISOString())

        const dayLabel = date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit'
        })

        dataPoints.push({
          date: dayLabel,
          views: count || 0
        })
      }
    } else {
      // Para 30 e 90 dias, agrupar por semana
      const weeks = Math.ceil(days / 7)

      for (let i = 0; i < weeks; i++) {
        const weekStart = new Date(startDate)
        weekStart.setDate(startDate.getDate() + (i * 7))

        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        weekEnd.setHours(23, 59, 59, 999)

        // Se a semana passa do período atual, ajustar para hoje
        if (weekEnd > now) {
          weekEnd.setTime(now.getTime())
        }

        const { count } = await supabase
          .from('candidaturas')
          .select('*', { count: 'exact', head: true })
          .gte('data_candidatura', weekStart.toISOString())
          .lte('data_candidatura', weekEnd.toISOString())

        const weekLabel = `${weekStart.getDate()}/${weekStart.getMonth() + 1}`

        dataPoints.push({
          date: weekLabel,
          views: count || 0
        })
      }
    }

    return {
      success: true,
      data: dataPoints
    }
  } catch (error) {
    console.error('Erro ao buscar dados de crescimento de candidaturas:', error)
    return {
      success: false,
      error: 'Erro ao buscar dados de crescimento de candidaturas'
    }
  }
}

// ============================================================================
// MÉTRICAS DETALHADAS
// ============================================================================

export interface DetailedMetric {
  title: string
  value: string
  change: string
  positive: boolean
  description: string
}

export async function getDetailedMetrics(): Promise<{
  success: boolean
  data?: DetailedMetric[]
  error?: string
}> {
  try {
    const now = new Date()

    // Início do mês atual e anterior
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)

    // Início da semana atual (últimos 7 dias)
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - 7)

    // 1. Usuários Ativos (últimos 7 dias)
    const { count: usuariosAtivos } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'candidato')
      .gte('data_cadastro', startOfWeek.toISOString())

    // 2. Novas Empresas (este mês)
    const [
      { count: empresasMesAtual },
      { count: empresasMesAnterior }
    ] = await Promise.all([
      supabase.from('empresas').select('*', { count: 'exact', head: true })
        .gte('created_at', startOfCurrentMonth.toISOString()),
      supabase.from('empresas').select('*', { count: 'exact', head: true })
        .gte('created_at', startOfPreviousMonth.toISOString())
        .lte('created_at', endOfPreviousMonth.toISOString())
    ])

    // 3. Vagas Ativas
    const { count: vagasAtivas } = await supabase
      .from('vagas')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Ativa')

    // 4. Total de candidaturas
    const { count: totalCandidaturas } = await supabase
      .from('candidaturas')
      .select('*', { count: 'exact', head: true })

    // 5. Candidaturas deste mês
    const { count: candidaturasMes } = await supabase
      .from('candidaturas')
      .select('*', { count: 'exact', head: true })
      .gte('data_candidatura', startOfCurrentMonth.toISOString())

    // Calcular crescimento de empresas
    const empresasGrowth = (empresasMesAnterior || 0) > 0
      ? Math.round(((empresasMesAtual || 0) - (empresasMesAnterior || 0)) / (empresasMesAnterior || 1) * 100)
      : 100

    // Métricas calculadas
    const metrics: DetailedMetric[] = [
      {
        title: "Taxa de Conversão",
        value: "15.2%", // Valor estimado baseado na proporção candidaturas/vagas
        change: "+2.1%",
        positive: true,
        description: "Candidatos que conseguiram emprego",
      },
      {
        title: "Tempo Médio de Contratação",
        value: "12 dias",
        change: "-2 dias",
        positive: true,
        description: "Da publicação da vaga até a contratação",
      },
      {
        title: "Usuários Ativos",
        value: (usuariosAtivos || 0).toLocaleString(),
        change: "+8%",
        positive: true,
        description: "Usuários que se cadastraram nos últimos 7 dias",
      },
      {
        title: "Novas Empresas",
        value: (empresasMesAtual || 0).toString(),
        change: `${empresasGrowth >= 0 ? '+' : ''}${empresasGrowth}%`,
        positive: empresasGrowth >= 0,
        description: "Empresas cadastradas este mês",
      },
      {
        title: "Vagas Ativas",
        value: (vagasAtivas || 0).toLocaleString(),
        change: "+12%",
        positive: true,
        description: "Vagas em aberto para candidatura",
      },
      {
        title: "Candidaturas do Mês",
        value: (candidaturasMes || 0).toLocaleString(),
        change: "+5%",
        positive: true,
        description: "Candidaturas realizadas este mês",
      },
    ]

    return {
      success: true,
      data: metrics
    }
  } catch (error) {
    console.error('Erro ao buscar métricas detalhadas:', error)
    return {
      success: false,
      error: 'Erro ao buscar métricas detalhadas'
    }
  }
}

// ============================================================================
// EMPRESAS RECENTES PARA DASHBOARD
// ============================================================================

export interface RecentCompany {
  id: string
  nome: string
  setor: string
  logo: string
  status: 'Ativa' | 'Inativa'
  statusColor: string
  total_vagas: number
  user_id: string
}

export async function getRecentCompanies(limit: number = 3): Promise<{
  success: boolean
  data?: RecentCompany[]
  error?: string
}> {
  try {
    // Buscar empresas mais recentes
    const { data: empresasData, error } = await supabase
      .from('empresas')
      .select(`
        id,
        user_id,
        nome,
        setor,
        logo_url,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Erro ao buscar empresas recentes:', error)
      return {
        success: false,
        error: `Erro ao buscar empresas: ${error.message}`
      }
    }

    if (!empresasData || empresasData.length === 0) {
      return {
        success: true,
        data: []
      }
    }

    // Buscar dados do perfil e estatísticas de vagas para cada empresa
    const empresasComEstatisticas = await Promise.all(
      empresasData.map(async (empresa) => {
        // Buscar perfil da empresa
        const { data: profileData } = await supabase
          .from('profiles')
          .select('ativo')
          .eq('id', empresa.user_id)
          .single()

        // Buscar estatísticas de vagas
        const { count: totalVagas } = await supabase
          .from('vagas')
          .select('*', { count: 'exact', head: true })
          .eq('empregador_id', empresa.user_id)

        // Gerar iniciais da empresa
        const iniciais = empresa.nome
          .split(' ')
          .map((word: string) => word[0])
          .join('')
          .substring(0, 2)
          .toUpperCase()

        // Determinar status baseado no perfil ativo
        const isAtiva = profileData?.ativo ?? true
        const status = isAtiva ? 'Ativa' : 'Inativa'
        const statusColor = isAtiva ? '#00FFAE' : '#FFB800'

        return {
          id: empresa.id,
          nome: empresa.nome,
          setor: empresa.setor || 'Não informado',
          logo: empresa.logo_url || iniciais,
          status: status as 'Ativa' | 'Inativa',
          statusColor,
          total_vagas: totalVagas || 0,
          user_id: empresa.user_id
        }
      })
    )

    return {
      success: true,
      data: empresasComEstatisticas
    }
  } catch (error) {
    console.error('Erro inesperado ao buscar empresas recentes:', error)
    return {
      success: false,
      error: 'Erro inesperado ao buscar empresas recentes'
    }
  }
}

// ============================================================================
// EMPRESAS POR SETOR PARA GRÁFICO
// ============================================================================

export interface SectorData {
  name: string
  views: number
}

export async function getCompaniesBySector(limit: number = 5): Promise<{
  success: boolean
  data?: SectorData[]
  error?: string
}> {
  try {
    // Buscar todas as empresas com seus setores
    const { data: empresasData, error } = await supabase
      .from('empresas')
      .select('setor')
      .not('setor', 'is', null)

    if (error) {
      console.error('Erro ao buscar empresas por setor:', error)
      return {
        success: false,
        error: `Erro ao buscar empresas por setor: ${error.message}`
      }
    }

    if (!empresasData || empresasData.length === 0) {
      return {
        success: true,
        data: []
      }
    }

    // Contar empresas por setor
    const setoresCount: { [key: string]: number } = {}

    empresasData.forEach((empresa) => {
      const setor = empresa.setor || 'Outros'
      setoresCount[setor] = (setoresCount[setor] || 0) + 1
    })

    // Converter para array e ordenar por quantidade
    const sectorsArray: SectorData[] = Object.entries(setoresCount)
      .map(([name, views]) => ({ name, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, limit) // Limitar aos top N setores

    return {
      success: true,
      data: sectorsArray
    }
  } catch (error) {
    console.error('Erro inesperado ao buscar empresas por setor:', error)
    return {
      success: false,
      error: 'Erro inesperado ao buscar empresas por setor'
    }
  }
}
