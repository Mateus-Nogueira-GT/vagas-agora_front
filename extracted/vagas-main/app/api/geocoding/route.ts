import { NextRequest, NextResponse } from 'next/server'

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org'

// Cache para evitar requisições repetidas
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 15 * 60 * 1000 // 15 minutos

// Rate limiting: 1 requisição por segundo
let lastRequestTime = 0
const MIN_REQUEST_INTERVAL = 1100 // 1.1 segundo

async function waitForRateLimit() {
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve =>
      setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest)
    )
  }

  lastRequestTime = Date.now()
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const cidade = searchParams.get('cidade')
    const estado = searchParams.get('estado')

    if (!cidade || !estado) {
      return NextResponse.json(
        { success: false, error: 'Cidade e estado são obrigatórios' },
        { status: 400 }
      )
    }

    // Montar query
    const query = `${cidade}, ${estado}, Brasil`
    const cacheKey = `nominatim_${query}`

    // Verificar cache
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data)
    }

    // Aguardar rate limit
    await waitForRateLimit()

    // Fazer requisição ao Nominatim
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      limit: '1',
      countrycodes: 'br'
    })

    const response = await fetch(`${NOMINATIM_URL}/search?${params}`, {
      headers: {
        'User-Agent': 'AgioVagas/1.0 (contact@agiovagas.com.br)'
      }
    })

    if (!response.ok) {
      console.error('Erro do Nominatim:', response.status, response.statusText)
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar coordenadas' },
        { status: response.status }
      )
    }

    const data = await response.json()

    if (!data || data.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Coordenadas não encontradas para este endereço'
      })
    }

    const result = {
      success: true,
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon)
    }

    // Armazenar no cache
    cache.set(cacheKey, { data: result, timestamp: Date.now() })

    return NextResponse.json(result)

  } catch (error) {
    console.error('Erro na API de geocoding:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar coordenadas' },
      { status: 500 }
    )
  }
}
