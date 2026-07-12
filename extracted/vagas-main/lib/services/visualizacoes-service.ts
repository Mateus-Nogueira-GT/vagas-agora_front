import { createBrowserClient } from '@supabase/ssr'

// Função simples para gerar um hash único do navegador
function gerarHashNavegador(): string {
  // Usar informações do navegador para criar um identificador único
  const navegadorInfo = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset()
  ].join('|')

  // Hash simples (não criptográfico, apenas para identificação)
  let hash = 0
  for (let i = 0; i < navegadorInfo.length; i++) {
    const char = navegadorInfo.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Converter para inteiro de 32 bits
  }

  return Math.abs(hash).toString(36)
}

// Função para obter ou criar o hash do visualizador
function obterHashVisualizador(): string {
  const STORAGE_KEY = 'visualizador_hash'

  // Tentar obter do localStorage
  let hash = localStorage.getItem(STORAGE_KEY)

  if (!hash) {
    // Se não existir, criar novo
    hash = gerarHashNavegador()
    localStorage.setItem(STORAGE_KEY, hash)
  }

  return hash
}

export async function registrarVisualizacao(vagaId: string): Promise<void> {
  try {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const visualizadorHash = obterHashVisualizador()

    // Tentar inserir a visualização
    // Se já existir (constraint unique), não faz nada
    const { error } = await supabase
      .from('vaga_visualizacoes')
      .insert({
        vaga_id: vagaId,
        visualizador_hash: visualizadorHash
      })
      .select()

    // Ignorar erro de duplicação (já visualizou antes)
    if (error && !error.message.includes('duplicate')) {
      console.error('Erro ao registrar visualização:', error)
    }
  } catch (error) {
    // Falha silenciosa - não deve afetar a experiência do usuário
    console.error('Erro ao registrar visualização:', error)
  }
}

export async function obterTotalVisualizacoes(vagaId: string): Promise<number> {
  try {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { count, error } = await supabase
      .from('vaga_visualizacoes')
      .select('*', { count: 'exact', head: true })
      .eq('vaga_id', vagaId)

    if (error) {
      console.error('Erro ao obter visualizações:', error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error('Erro ao obter visualizações:', error)
    return 0
  }
}
