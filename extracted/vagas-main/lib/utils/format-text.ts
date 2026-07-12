/**
 * Formata textos de campos da aplicação com capitalização e acentuação corretas
 */
export function formatarTexto(texto?: string): string {
  if (!texto) return "Não informado"

  // Mapa de correções específicas para campos comuns
  const correcoes: Record<string, string> = {
    // Tipos de contratação
    'freelancer': 'Freelancer',
    'clt': 'CLT',
    'pj': 'PJ',
    'temporario': 'Temporário',

    // Modelos de trabalho
    'hibrido': 'Híbrido',
    'remoto': 'Remoto',
    'presencial': 'Presencial',

    // Níveis de experiência (valores atuais do sistema)
    'estagio': 'Estágio / Trainee',
    'assistente': 'Assistente / Auxiliar',
    'operacional': 'Operacional',
    'analista': 'Analista',
    'coordenacao': 'Coordenação',
    'gerencia': 'Gerência',
    'diretoria': 'Diretoria',
    'especialista': 'Especialista',

    // Níveis antigos (manter compatibilidade com dados antigos)
    'junior': 'Júnior',
    'pleno': 'Pleno',
    'senior': 'Sênior',
    'estagiario': 'Estagiário',
    'trainee': 'Trainee',

    // Outras palavras comuns
    'tecnico': 'Técnico',
    'basico': 'Básico',
    'avancado': 'Avançado',
    'intermediario': 'Intermediário'
  }

  const textoLower = texto.toLowerCase().trim()
  return correcoes[textoLower] || texto.charAt(0).toUpperCase() + texto.slice(1)
}

/**
 * Formata múltiplos textos de uma vez
 */
export function formatarTextos(textos: (string | undefined)[]): string[] {
  return textos.map(texto => formatarTexto(texto))
}
