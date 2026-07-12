import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { 
  getTriagemConfig, 
  upsertTriagemConfig 
} from '@/lib/api/triagem-api'
import { encrypt } from '@/lib/triagem/crypto-utils'

// Helper para criar cliente Supabase server-side
async function getSupabaseUser() {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  return user
}

/**
 * GET /api/triagem/config
 * Retorna a configuração de triagem do empregador logado
 * NÃO retorna a chave descriptografada, apenas indica se existe
 */
export async function GET() {
  try {
    // 1. Verificar autenticação
    const user = await getSupabaseUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // 2. Buscar configuração
    const config = await getTriagemConfig(user.id)

    // 3. Retornar dados (sem a chave descriptografada)
    if (!config) {
      return NextResponse.json({
        success: true,
        data: {
          triagem_habilitada: false,
          modelo_ia: 'openai/gpt-4o-mini',
          has_api_key: false,
          api_key_last4: null
        }
      })
    }

    // Extrair últimos 4 caracteres da chave (se existir)
    let apiKeyLast4 = null
    if (config.openrouter_api_key_encrypted) {
      // A chave está criptografada, mas podemos guardar os últimos 4 chars
      // em um campo separado ou simplesmente indicar que existe
      apiKeyLast4 = '****'
    }

    return NextResponse.json({
      success: true,
      data: {
        triagem_habilitada: config.triagem_habilitada,
        modelo_ia: config.modelo_ia,
        max_candidatos_por_triagem: config.max_candidatos_por_triagem,
        has_api_key: !!config.openrouter_api_key_encrypted,
        api_key_last4: apiKeyLast4
      }
    })

  } catch (error) {
    console.error('Erro ao buscar config de triagem:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/triagem/config
 * Salva/atualiza a configuração de triagem
 * Body: { apiKey?, modelo?, habilitada?, maxCandidatos? }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verificar autenticação
    const user = await getSupabaseUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // 2. Ler body
    const body = await request.json()
    const { 
      apiKey, 
      modelo, 
      habilitada, 
      maxCandidatos 
    } = body

    // 3. Validar API key (se fornecida)
    if (apiKey && !apiKey.startsWith('sk-or-')) {
      return NextResponse.json(
        { success: false, error: 'Chave OpenRouter inválida. Deve começar com sk-or-' },
        { status: 400 }
      )
    }

    // 4. Montar dados para salvar
    const configData: Record<string, unknown> = {
      empregador_id: user.id
    }

    // Criptografar API key se fornecida
    if (apiKey) {
      configData.openrouter_api_key_encrypted = encrypt(apiKey)
    }

    if (modelo !== undefined) {
      configData.modelo_ia = modelo
    }

    if (habilitada !== undefined) {
      configData.triagem_habilitada = habilitada
    }

    if (maxCandidatos !== undefined) {
      configData.max_candidatos_por_triagem = maxCandidatos
    }

    // 5. Salvar
    const savedConfig = await upsertTriagemConfig(configData as any)

    // 6. Retornar (sem dados sensíveis)
    return NextResponse.json({
      success: true,
      data: {
        triagem_habilitada: savedConfig.triagem_habilitada,
        modelo_ia: savedConfig.modelo_ia,
        max_candidatos_por_triagem: savedConfig.max_candidatos_por_triagem,
        has_api_key: !!savedConfig.openrouter_api_key_encrypted
      }
    })

  } catch (error) {
    console.error('Erro ao salvar config de triagem:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}