import { NextResponse } from 'next/server'
import { TODAS_CIDADES } from '@/lib/data/todas-cidades'

export const dynamic = 'force-static'
export const revalidate = 86400

// Tipo para as cidades
type Cidade = {
  nome: string
  uf: string
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const uf = searchParams.get('uf')
  const busca = searchParams.get('q')

  // Converter o objeto para array de cidades
  let resultado: Cidade[] = []
  
  Object.entries(TODAS_CIDADES).forEach(([estado, cidades]) => {
    cidades.forEach((nome) => {
      resultado.push({ nome, uf: estado })
    })
  })

  // Filtrar por UF
  if (uf) {
    resultado = resultado.filter((c) => c.uf === uf.toUpperCase())
  }

  // Filtrar por busca
  if (busca) {
    const termo = busca.toLowerCase()
    resultado = resultado.filter((c) =>
      c.nome.toLowerCase().includes(termo)
    )
  }

  return NextResponse.json(resultado)
}
