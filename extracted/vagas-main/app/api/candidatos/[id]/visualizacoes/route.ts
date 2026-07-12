import { NextRequest, NextResponse } from 'next/server'
import { candidatosApiService } from '@/lib/api/candidatos-api'
import { verifyAuth } from '@/lib/auth/api-auth'

export async function POST(
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

    // 2. Continuar com a lógica original
    const { id: candidatoId } = await params
    const body = await request.json()
    
    // 3. Usar o ID do usuário autenticado como visualizador (mais seguro!)
    const visualizadorId = auth.user?.id

    if (!candidatoId || !visualizadorId) {
      return NextResponse.json(
        { error: 'ID do candidato e visualizador são obrigatórios' },
        { status: 400 }
      )
    }

    await candidatosApiService.registrarVisualizacaoCurriculo(candidatoId, visualizadorId)

    return NextResponse.json({
      success: true,
      message: 'Visualização registrada com sucesso'
    })

  } catch (error) {
    console.error('Erro ao registrar visualização:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
