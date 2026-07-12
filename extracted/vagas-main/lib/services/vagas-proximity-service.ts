// Serviço para busca de vagas por proximidade geográfica
import { geocodingService } from './geocoding-service'

export interface LocationFilter {
  latitude: number
  longitude: number
  radiusKm: number
}

export interface VagaWithDistance {
  id: string
  titulo: string
  cidade?: string
  estado?: string
  latitude?: number
  longitude?: number
  distance?: number // distância em km
  [key: string]: any
}

/**
 * Filtra vagas por proximidade geográfica
 */
export function filterVagasByProximity(
  vagas: any[],
  userLocation: { latitude: number; longitude: number },
  radiusKm: number
): VagaWithDistance[] {
  return vagas
    .map((vaga) => {
      // Se a vaga não tem coordenadas, não pode calcular distância
      if (!vaga.latitude || !vaga.longitude) {
        return null
      }

      // Calcular distância
      const distance = geocodingService.calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        vaga.latitude,
        vaga.longitude
      )

      return {
        ...vaga,
        distance
      }
    })
    .filter((vaga): vaga is VagaWithDistance => {
      // Remover vagas sem coordenadas
      if (!vaga) return false

      // Filtrar por raio
      return vaga.distance !== undefined && vaga.distance <= radiusKm
    })
    .sort((a, b) => {
      // Ordenar por distância (mais próximas primeiro)
      return (a.distance || 0) - (b.distance || 0)
    })
}

/**
 * Ordena vagas por proximidade (sem filtrar por raio)
 */
export function sortVagasByProximity(
  vagas: any[],
  userLocation: { latitude: number; longitude: number }
): VagaWithDistance[] {
  return vagas
    .map((vaga) => {
      // Se a vaga não tem coordenadas, colocar no final
      if (!vaga.latitude || !vaga.longitude) {
        return {
          ...vaga,
          distance: Infinity
        }
      }

      // Calcular distância
      const distance = geocodingService.calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        vaga.latitude,
        vaga.longitude
      )

      return {
        ...vaga,
        distance
      }
    })
    .sort((a, b) => {
      // Ordenar por distância (mais próximas primeiro)
      return (a.distance || Infinity) - (b.distance || Infinity)
    })
}

/**
 * Formata distância para exibição
 */
export function formatDistance(distanceKm: number | undefined): string {
  if (distanceKm === undefined || distanceKm === Infinity) {
    return 'Localização não disponível'
  }

  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m de distância`
  }

  if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)}km de distância`
  }

  return `${Math.round(distanceKm)}km de distância`
}

/**
 * Obtém localização do usuário via Geolocation API
 */
export function getUserLocation(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalização não suportada pelo navegador'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })
      },
      (error) => {
        let message = 'Erro ao obter localização'

        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Permissão de localização negada'
            break
          case error.POSITION_UNAVAILABLE:
            message = 'Localização não disponível'
            break
          case error.TIMEOUT:
            message = 'Tempo esgotado ao obter localização'
            break
        }

        reject(new Error(message))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // Cache de 5 minutos
      }
    )
  })
}

/**
 * Raios de busca predefinidos (em km)
 */
export const RADIUS_OPTIONS = [
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 25, label: '25 km' },
  { value: 50, label: '50 km' },
  { value: 100, label: '100 km' },
  { value: 250, label: '250 km' },
  { value: 500, label: '500 km' }
]
