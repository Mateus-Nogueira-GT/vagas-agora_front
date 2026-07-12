// Geocoding Service - Serviço de geolocalização gratuito sem API key
// Usa ViaCEP para CEP brasileiro e Nominatim (OpenStreetMap) para coordenadas

export interface Address {
  cep?: string
  logradouro?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade: string
  estado: string
  latitude?: number
  longitude?: number
}

export interface ViaCEPResponse {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string // cidade
  uf: string // estado
  ibge: string
  gia: string
  ddd: string
  siafi: string
  erro?: boolean
}

export interface NominatimResponse {
  lat: string
  lon: string
  display_name: string
  address?: {
    city?: string
    town?: string
    state?: string
    country?: string
  }
}

interface QueuedRequest {
  execute: () => Promise<any>
  resolve: (value: any) => void
  reject: (error: any) => void
  retries: number
}

class GeocodingService {
  private readonly VIACEP_URL = 'https://viacep.com.br/ws'
  private readonly NOMINATIM_URL = 'https://nominatim.openstreetmap.org'

  // Cache simples para evitar requisições repetidas
  private cache = new Map<string, any>()
  private lastRequestTime = 0
  private readonly MIN_REQUEST_INTERVAL = 1100 // 1.1 segundo (Nominatim exige 1 req/seg)

  // Sistema de fila para evitar rate limit
  private requestQueue: QueuedRequest[] = []
  private isProcessingQueue = false
  private readonly MAX_RETRIES = 3

  /**
   * Adiciona uma requisição à fila e processa automaticamente
   */
  private async enqueueRequest<T>(
    requestFn: () => Promise<T>,
    retries: number = 0
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({
        execute: requestFn,
        resolve,
        reject,
        retries
      })

      // Iniciar processamento da fila se não estiver processando
      if (!this.isProcessingQueue) {
        this.processQueue()
      }
    })
  }

  /**
   * Processa a fila de requisições respeitando rate limit
   */
  private async processQueue() {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return
    }

    this.isProcessingQueue = true

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift()!

      try {
        // Aguardar rate limit
        await this.waitForRateLimit()

        // Executar requisição
        const result = await request.execute()
        request.resolve(result)

      } catch (error: any) {
        // Se der erro de rate limit (429) ou timeout, tentar novamente
        if (
          (error.status === 429 || error.message?.includes('timeout')) &&
          request.retries < this.MAX_RETRIES
        ) {

          // Adicionar de volta à fila com contador de retry incrementado
          this.requestQueue.unshift({
            ...request,
            retries: request.retries + 1
          })

          // Aguardar um tempo extra antes de tentar novamente
          await new Promise(resolve => setTimeout(resolve, 2000))
        } else {
          // Se não for rate limit ou excedeu tentativas, rejeitar
          request.reject(error)
        }
      }
    }

    this.isProcessingQueue = false
  }

  /**
   * Aguarda o intervalo mínimo entre requisições
   */
  private async waitForRateLimit() {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime

    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      await new Promise(resolve =>
        setTimeout(resolve, this.MIN_REQUEST_INTERVAL - timeSinceLastRequest)
      )
    }

    this.lastRequestTime = Date.now()
  }

  /**
   * Busca endereço completo por CEP usando ViaCEP
   */
  async getAddressByCEP(cep: string): Promise<{ success: boolean; address?: Partial<Address>; error?: string }> {
    try {
      // Limpar CEP (remover pontos e traços)
      const cleanCEP = cep.replace(/\D/g, '')

      if (cleanCEP.length !== 8) {
        return { success: false, error: 'CEP inválido' }
      }

      // Verificar cache
      const cacheKey = `viacep_${cleanCEP}`
      if (this.cache.has(cacheKey)) {
        return { success: true, address: this.cache.get(cacheKey) }
      }

      const response = await fetch(`${this.VIACEP_URL}/${cleanCEP}/json/`)

      if (!response.ok) {
        return { success: false, error: 'Erro ao buscar CEP' }
      }

      const data: ViaCEPResponse = await response.json()

      if (data.erro) {
        return { success: false, error: 'CEP não encontrado' }
      }

      const address: Partial<Address> = {
        cep: cleanCEP,
        logradouro: data.logradouro,
        bairro: data.bairro,
        cidade: data.localidade,
        estado: data.uf
      }

      // Armazenar no cache
      this.cache.set(cacheKey, address)

      return { success: true, address }

    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
      return { success: false, error: 'Erro ao buscar CEP' }
    }
  }

  /**
   * Busca coordenadas (latitude/longitude) usando Nominatim (OpenStreetMap)
   */
  async getCoordinates(address: Partial<Address>): Promise<{ success: boolean; latitude?: number; longitude?: number; error?: string }> {
    try {
      // Montar query de busca - usar array para evitar vírgulas no início
      const queryParts: string[] = []

      if (address.logradouro && address.numero) {
        queryParts.push(`${address.logradouro}, ${address.numero}`)
      } else if (address.logradouro) {
        queryParts.push(address.logradouro)
      }

      if (address.bairro) {
        queryParts.push(address.bairro)
      }

      if (address.cidade) {
        queryParts.push(address.cidade)
      }

      if (address.estado) {
        queryParts.push(address.estado)
      }

      queryParts.push('Brasil')

      const searchQuery = queryParts.join(', ')

      if (!searchQuery || searchQuery === 'Brasil') {
        return { success: false, error: 'Endereço incompleto para buscar coordenadas' }
      }

      // Verificar cache
      const cacheKey = `nominatim_${searchQuery}`
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey)
      }

      // Adicionar à fila para respeitar rate limit
      const result = await this.enqueueRequest(async () => {
        const params = new URLSearchParams({
          q: searchQuery,
          format: 'json',
          limit: '1',
          countrycodes: 'br'
        })

        try {
          const response = await fetch(`${this.NOMINATIM_URL}/search?${params}`, {
            headers: {
              'User-Agent': 'AgioVagas/1.0 (contact@agiovagas.com.br)'
            }
          })

          if (!response.ok) {
            if (response.status === 429) {
              const error: any = new Error('Rate limit atingido')
              error.status = 429
              throw error
            }
            return { success: false, error: 'Erro ao buscar coordenadas' }
          }

          const data: NominatimResponse[] = await response.json()

          if (!data || data.length === 0) {
            return { success: false, error: 'Coordenadas não encontradas para este endereço' }
          }

          const coordsResult = {
            success: true,
            latitude: parseFloat(data[0].lat),
            longitude: parseFloat(data[0].lon)
          }

          // Armazenar no cache
          this.cache.set(cacheKey, coordsResult)

          return coordsResult
        } catch (fetchError) {
          // Erro de rede ou fetch - retornar erro silenciosamente durante SSR
          console.warn('Aviso: Não foi possível buscar coordenadas (possível ambiente SSR):', fetchError instanceof Error ? fetchError.message : 'Erro desconhecido')
          return { success: false, error: 'Serviço de geolocalização temporariamente indisponível' }
        }
      })

      return result

    } catch (error) {
      console.error('Erro ao buscar coordenadas:', error)
      return { success: false, error: 'Erro ao buscar coordenadas' }
    }
  }

  /**
   * Busca endereço completo com coordenadas a partir de um CEP
   */
  async getFullAddressByCEP(cep: string, numero?: string): Promise<{ success: boolean; address?: Address; error?: string }> {
    try {
      // Buscar endereço pelo CEP
      const addressResult = await this.getAddressByCEP(cep)

      if (!addressResult.success || !addressResult.address) {
        return { success: false, error: addressResult.error }
      }

      const address = addressResult.address

      // Adicionar número se fornecido
      if (numero) {
        address.numero = numero
      }

      // Buscar coordenadas
      const coordsResult = await this.getCoordinates(address)

      if (coordsResult.success) {
        address.latitude = coordsResult.latitude
        address.longitude = coordsResult.longitude
      }

      return {
        success: true,
        address: address as Address
      }

    } catch (error) {
      console.error('Erro ao buscar endereço completo:', error)
      return { success: false, error: 'Erro ao buscar endereço completo' }
    }
  }

  /**
   * Busca coordenadas de uma cidade/estado
   */
  async getCityCoordinates(cidade: string, estado: string): Promise<{ success: boolean; latitude?: number; longitude?: number; error?: string }> {
    try {
      return await this.getCoordinates({ cidade, estado })
    } catch (error) {
      console.error('Erro ao buscar coordenadas da cidade:', error)
      return { success: false, error: 'Erro ao buscar coordenadas da cidade' }
    }
  }

  /**
   * Calcula distância entre duas coordenadas em km (fórmula de Haversine)
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371 // Raio da Terra em km
    const dLat = this.toRad(lat2 - lat1)
    const dLon = this.toRad(lon2 - lon1)

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c

    return Math.round(distance * 10) / 10 // Arredondar para 1 casa decimal
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180)
  }

  /**
   * Limpar cache (útil para testes)
   */
  clearCache() {
    this.cache.clear()
  }

  /**
   * Obtém o tamanho atual da fila
   */
  getQueueSize(): number {
    return this.requestQueue.length
  }

  /**
   * Verifica se está processando a fila
   */
  isProcessing(): boolean {
    return this.isProcessingQueue
  }
}

export const geocodingService = new GeocodingService()
