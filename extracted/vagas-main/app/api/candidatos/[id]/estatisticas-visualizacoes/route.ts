import { NextRequest, NextResponse } from 'next/server'
import { candidatosApiService } from '@/lib/api/candidatos-api'
import { verifyAuth } from '@/lib/auth/api-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Verificar autenticação
    const auth = await verifyAuth()

    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error },
        { status: 401 }
      )
    }

    // 2. Verificar se o usuário pode acessar este recurso
    const { id: userId } = await params
    if (auth.user?.id !== userId) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // 3. Continuar com a lógica original
    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      )
    }

    const estatisticas = await candidatosApiService.getEstatisticasVisualizacoes(userId)

    return NextResponse.json({
      data: estatisticas,
      success: true
    })

  } catch (error) {
    console.error('Erro ao buscar estatísticas de visualização:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
