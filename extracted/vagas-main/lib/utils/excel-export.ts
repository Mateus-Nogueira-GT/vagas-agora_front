import writeXlsxFile, { type Cell } from 'write-excel-file/browser'
import type { Vaga } from '../vagas/vagas-types'

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

export interface ExportData {
  stats: DashboardStats
  vagas: Vaga[]
  candidaturasTempo: CandidaturasTempo[]
  vagasStatus: VagasStatus[]
  empresaNome: string
}

type RawCell = string | number
type RawRow = RawCell[]

function toRows(rows: RawRow[]): Cell[][] {
  return rows.map((row, rowIndex) => row.map((value) => ({
    value,
    type: typeof value === 'number' ? Number : String,
    fontWeight: rowIndex === 0 ? 'bold' : undefined,
  })))
}

export async function exportDashboardToExcel(data: ExportData): Promise<string> {
  const resumo = toRows([
    [`RELATÓRIO DE VAGAS - ${data.empresaNome.toUpperCase()}`],
    ['Data de Geração:', new Date().toLocaleDateString('pt-BR')],
    [''],
    ['MÉTRICAS PRINCIPAIS'],
    ['Vagas Ativas', data.stats.vagas_ativas],
    ['Total de Candidaturas', data.stats.total_candidaturas],
    ['Vagas Preenchidas', data.stats.vagas_preenchidas],
    ['Taxa de Conversão', `${data.stats.taxa_conversao}%`],
    ['Candidatos por Vaga', data.stats.candidatos_por_vaga],
    ['Visualizações Estimadas', data.stats.visualizacoes_vagas],
    [''],
    ['DISTRIBUIÇÃO POR STATUS'],
    ...data.vagasStatus.map((status): RawRow => [status.name, status.count]),
  ])

  const vagas = toRows([
    [
      'ID', 'Título', 'Status', 'Cidade', 'Estado', 'Modelo de Trabalho',
      'Nível', 'Tipo de Contratação', 'Salário De', 'Salário Até',
      'Total de Candidatos', 'Data de Publicação', 'Data de Expiração', 'Número de Vagas',
    ],
    ...data.vagas.map((vaga): RawRow => [
      vaga.id,
      vaga.titulo,
      vaga.status,
      vaga.cidade || '',
      vaga.estado || '',
      vaga.modelo_trabalho || '',
      vaga.nivel || '',
      vaga.tipo_contratacao || '',
      vaga.salario_de || '',
      vaga.salario_ate || '',
      vaga.total_candidatos || 0,
      vaga.data_publicacao ? new Date(vaga.data_publicacao).toLocaleDateString('pt-BR') : '',
      vaga.data_expiracao ? new Date(vaga.data_expiracao).toLocaleDateString('pt-BR') : 'Sem prazo',
      vaga.num_vagas || 1,
    ]),
  ])

  const candidaturas = toRows([
    ['Período', 'Número de Candidaturas'],
    ...data.candidaturasTempo.map((item): RawRow => [item.date, item.candidaturas]),
  ])

  const localizacoes: Record<string, number> = {}
  const modelos: Record<string, number> = {}
  const niveis: Record<string, number> = {}

  data.vagas.forEach((vaga) => {
    const localizacao = vaga.cidade && vaga.estado
      ? `${vaga.cidade}, ${vaga.estado}`
      : vaga.cidade || vaga.estado || 'Não informado'
    const modelo = vaga.modelo_trabalho || 'Não informado'
    const nivel = vaga.nivel || 'Não informado'

    localizacoes[localizacao] = (localizacoes[localizacao] || 0) + 1
    modelos[modelo] = (modelos[modelo] || 0) + 1
    niveis[nivel] = (niveis[nivel] || 0) + 1
  })

  const analises = toRows([
    ['ANÁLISES POR CATEGORIA'],
    [''],
    ['POR LOCALIZAÇÃO'],
    ...Object.entries(localizacoes),
    [''],
    ['POR MODELO DE TRABALHO'],
    ...Object.entries(modelos),
    [''],
    ['POR NÍVEL'],
    ...Object.entries(niveis),
  ])

  const fileName = `relatorio-vagas-${data.empresaNome.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.xlsx`

  await writeXlsxFile([
    { data: resumo, sheet: 'Resumo Executivo' },
    { data: vagas, sheet: 'Vagas Detalhadas' },
    { data: candidaturas, sheet: 'Candidaturas por Período' },
    { data: analises, sheet: 'Análises' },
  ]).toFile(fileName)

  return fileName
}
