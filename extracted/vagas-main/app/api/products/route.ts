import { NextRequest, NextResponse } from 'next/server'
import { productsService } from '@/lib/products/products-service'

/**
 * GET /api/products
 * Buscar produtos ativos
 * Query params:
 * - target_audience: 'candidato' | 'empregador' (opcional)
 * - code: string (opcional - buscar produto específico por código)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const targetAudience = searchParams.get('target_audience') as 'candidato' | 'empregador' | null
    const code = searchParams.get('code')

    // Se código foi fornecido, buscar produto específico
    if (code) {
      const result = await productsService.getProductByCode(code)

      if (!result.success) {
        return NextResponse.json(
          { error: result.error || 'Produto não encontrado' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        product: result.product
      })
    }

    // Buscar todos os produtos
    const result = await productsService.getActiveProducts(targetAudience || undefined)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Erro ao buscar produtos' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      products: result.products
    })

  } catch (error) {
    console.error('Erro na API de produtos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
