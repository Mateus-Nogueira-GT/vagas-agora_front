// Estados e cidades brasileiras para autocomplete
import { TODAS_CIDADES } from './todas-cidades'

export const ESTADOS_BRASIL = [
  { sigla: 'AC', nome: 'Acre' },
  { sigla: 'AL', nome: 'Alagoas' },
  { sigla: 'AP', nome: 'Amapá' },
  { sigla: 'AM', nome: 'Amazonas' },
  { sigla: 'BA', nome: 'Bahia' },
  { sigla: 'CE', nome: 'Ceará' },
  { sigla: 'DF', nome: 'Distrito Federal' },
  { sigla: 'ES', nome: 'Espírito Santo' },
  { sigla: 'GO', nome: 'Goiás' },
  { sigla: 'MA', nome: 'Maranhão' },
  { sigla: 'MT', nome: 'Mato Grosso' },
  { sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { sigla: 'MG', nome: 'Minas Gerais' },
  { sigla: 'PA', nome: 'Pará' },
  { sigla: 'PB', nome: 'Paraíba' },
  { sigla: 'PR', nome: 'Paraná' },
  { sigla: 'PE', nome: 'Pernambuco' },
  { sigla: 'PI', nome: 'Piauí' },
  { sigla: 'RJ', nome: 'Rio de Janeiro' },
  { sigla: 'RN', nome: 'Rio Grande do Norte' },
  { sigla: 'RS', nome: 'Rio Grande do Sul' },
  { sigla: 'RO', nome: 'Rondônia' },
  { sigla: 'RR', nome: 'Roraima' },
  { sigla: 'SC', nome: 'Santa Catarina' },
  { sigla: 'SP', nome: 'São Paulo' },
  { sigla: 'SE', nome: 'Sergipe' },
  { sigla: 'TO', nome: 'Tocantins' }
]

// Principais cidades por estado (Top 10 de cada estado)
export const CIDADES_PRINCIPAIS: Record<string, string[]> = {
  'SP': [
    'São Paulo', 'Guarulhos', 'Campinas', 'São Bernardo do Campo', 'Santo André',
    'Osasco', 'São José dos Campos', 'Ribeirão Preto', 'Sorocaba', 'Santos'
  ],
  'RJ': [
    'Rio de Janeiro', 'São Gonçalo', 'Duque de Caxias', 'Nova Iguaçu', 'Niterói',
    'Belford Roxo', 'Campos dos Goytacazes', 'São João de Meriti', 'Petrópolis', 'Volta Redonda'
  ],
  'MG': [
    'Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim',
    'Montes Claros', 'Ribeirão das Neves', 'Uberaba', 'Governador Valadares', 'Ipatinga'
  ],
  'BA': [
    'Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari', 'Itabuna',
    'Juazeiro', 'Lauro de Freitas', 'Ilhéus', 'Jequié', 'Teixeira de Freitas'
  ],
  'PR': [
    'Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel',
    'São José dos Pinhais', 'Foz do Iguaçu', 'Colombo', 'Guarapuava', 'Paranaguá'
  ],
  'RS': [
    'Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Canoas', 'Santa Maria',
    'Gravataí', 'Viamão', 'Novo Hamburgo', 'São Leopoldo', 'Rio Grande'
  ],
  'PE': [
    'Recife', 'Jaboatão dos Guararapes', 'Olinda', 'Caruaru', 'Petrolina',
    'Paulista', 'Cabo de Santo Agostinho', 'Camaragibe', 'Garanhuns', 'Vitória de Santo Antão'
  ],
  'CE': [
    'Fortaleza', 'Caucaia', 'Juazeiro do Norte', 'Maracanaú', 'Sobral',
    'Crato', 'Itapipoca', 'Maranguape', 'Iguatu', 'Quixadá'
  ],
  'SC': [
    'Florianópolis', 'Joinville', 'Blumenau', 'São José', 'Criciúma',
    'Chapecó', 'Itajaí', 'Jaraguá do Sul', 'Lages', 'Palhoça'
  ],
  'GO': [
    'Goiânia', 'Aparecida de Goiânia', 'Anápolis', 'Rio Verde', 'Luziânia',
    'Águas Lindas de Goiás', 'Valparaíso de Goiás', 'Trindade', 'Formosa', 'Novo Gama'
  ],
  'MA': [
    'São Luís', 'Imperatriz', 'São José de Ribamar', 'Timon', 'Caxias',
    'Codó', 'Paço do Lumiar', 'Açailândia', 'Bacabal', 'Balsas'
  ],
  'PB': [
    'João Pessoa', 'Campina Grande', 'Santa Rita', 'Patos', 'Bayeux',
    'Sousa', 'Cajazeiras', 'Guarabira', 'Mamanguape', 'Sapé'
  ],
  'AM': [
    'Manaus', 'Parintins', 'Itacoatiara', 'Manacapuru', 'Coari',
    'Tefé', 'Tabatinga', 'Maués', 'Humaitá', 'São Gabriel da Cachoeira'
  ],
  'ES': [
    'Vitória', 'Vila Velha', 'Serra', 'Cariacica', 'Cachoeiro de Itapemirim',
    'Linhares', 'São Mateus', 'Colatina', 'Guarapari', 'Aracruz'
  ],
  'MT': [
    'Cuiabá', 'Várzea Grande', 'Rondonópolis', 'Sinop', 'Tangará da Serra',
    'Cáceres', 'Sorriso', 'Lucas do Rio Verde', 'Barra do Garças', 'Primavera do Leste'
  ],
  'RN': [
    'Natal', 'Mossoró', 'Parnamirim', 'São Gonçalo do Amarante', 'Macaíba',
    'Ceará-Mirim', 'Caicó', 'Assu', 'Currais Novos', 'Nova Cruz'
  ],
  'MS': [
    'Campo Grande', 'Dourados', 'Três Lagoas', 'Corumbá', 'Ponta Porã',
    'Sidrolândia', 'Naviraí', 'Nova Andradina', 'Aquidauana', 'Paranaíba'
  ],
  'AL': [
    'Maceió', 'Arapiraca', 'Rio Largo', 'Palmeira dos Índios', 'União dos Palmares',
    'Penedo', 'Delmiro Gouveia', 'Coruripe', 'São Miguel dos Campos', 'Santana do Ipanema'
  ],
  'PI': [
    'Teresina', 'Parnaíba', 'Picos', 'Piripiri', 'Floriano',
    'Campo Maior', 'Barras', 'Altos', 'União', 'José de Freitas'
  ],
  'PA': [
    'Belém', 'Ananindeua', 'Santarém', 'Marabá', 'Castanhal',
    'Parauapebas', 'Itaituba', 'Cametá', 'Bragança', 'Abaetetuba'
  ],
  'DF': [
    'Brasília', 'Taguatinga', 'Ceilândia', 'Samambaia', 'Planaltina',
    'Águas Claras', 'Gama', 'Santa Maria', 'Sobradinho', 'São Sebastião'
  ],
  'RO': [
    'Porto Velho', 'Ji-Paraná', 'Ariquemes', 'Cacoal', 'Vilhena',
    'Jaru', 'Rolim de Moura', 'Guajará-Mirim', 'Pimenta Bueno', 'Ouro Preto do Oeste'
  ],
  'TO': [
    'Palmas', 'Araguaína', 'Gurupi', 'Porto Nacional', 'Paraíso do Tocantins',
    'Colinas do Tocantins', 'Guaraí', 'Formoso do Araguaia', 'Miracema do Tocantins', 'Araguatins'
  ],
  'AC': [
    'Rio Branco', 'Cruzeiro do Sul', 'Sena Madureira', 'Tarauacá', 'Feijó',
    'Senador Guiomard', 'Plácido de Castro', 'Brasiléia', 'Xapuri', 'Epitaciolândia'
  ],
  'AP': [
    'Macapá', 'Santana', 'Laranjal do Jari', 'Oiapoque', 'Mazagão',
    'Porto Grande', 'Tartarugalzinho', 'Pedra Branca do Amapari', 'Vitória do Jari', 'Amapá'
  ],
  'RR': [
    'Boa Vista', 'Rorainópolis', 'Caracaraí', 'Mucajaí', 'Alto Alegre',
    'Bonfim', 'Cantá', 'Normandia', 'Pacaraima', 'São João da Baliza'
  ],
  'SE': [
    'Aracaju', 'Nossa Senhora do Socorro', 'Lagarto', 'Itabaiana', 'Estância',
    'São Cristóvão', 'Propriá', 'Tobias Barreto', 'Simão Dias', 'Laranjeiras'
  ]
}

/**
 * Formata CEP: 12345678 -> 12345-678
 */
export function formatCEP(cep: string): string {
  const cleaned = cep.replace(/\D/g, '')
  if (cleaned.length !== 8) return cep
  return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`
}

/**
 * Formata telefone: 11999999999 -> (11) 99999-9999
 */
export function formatTelefone(telefone: string): string {
  const cleaned = telefone.replace(/\D/g, '')

  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
  } else if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
  }

  return telefone
}

/**
 * Filtra cidades por busca fuzzy (busca flexível)
 * Retorna até maxResults cidades que correspondem à busca
 * Agora busca em TODAS as cidades do Brasil (5.571 municípios)
 */
export function filterCidades(estado: string, busca: string, maxResults: number = 15): string[] {
  if (!estado) return []

  // Usar TODAS as cidades se disponível, senão usar principais
  const todasCidades = TODAS_CIDADES[estado]
  const cidadesDoEstado = todasCidades || CIDADES_PRINCIPAIS[estado]

  if (!cidadesDoEstado) return []

  // Se não houver busca, retornar principais primeiro
  if (!busca || busca.trim().length === 0) {
    const principais = CIDADES_PRINCIPAIS[estado] || []
    return principais.slice(0, maxResults)
  }

  const buscaNormalizada = busca.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

  // Ordenar por relevância: cidades que começam com a busca vêm primeiro
  const resultados = cidadesDoEstado
    .map(cidade => {
      const cidadeNormalizada = cidade.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

      // Calcular score de relevância
      let score = 0
      if (cidadeNormalizada.startsWith(buscaNormalizada)) {
        score = 100 // Máxima prioridade para cidades que começam com a busca
      } else if (cidadeNormalizada.includes(buscaNormalizada)) {
        score = 50 // Segunda prioridade para cidades que contêm a busca
      } else {
        // Busca fuzzy: verifica se contém as letras na ordem
        let lastIndex = -1
        let matches = 0
        for (const char of buscaNormalizada) {
          const index = cidadeNormalizada.indexOf(char, lastIndex + 1)
          if (index > lastIndex) {
            matches++
            lastIndex = index
          }
        }
        if (matches === buscaNormalizada.length) {
          score = 10 // Terceira prioridade para busca fuzzy
        }
      }

      return { cidade, score }
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(item => item.cidade)

  return resultados
}
