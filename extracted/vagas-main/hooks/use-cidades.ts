import { useState, useEffect } from 'react'

export function useCidades(uf?: string, busca?: string) {
  const [cidades, setCidades] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCidades() {
      const params = new URLSearchParams()
      if (uf) params.set('uf', uf)
      if (busca) params.set('q', busca)

      const res = await fetch(`/api/cidades?${params}`)
      const data = await res.json()
      setCidades(data)
      setLoading(false)
    }

    fetchCidades()
  }, [uf, busca])

  return { cidades, loading }
}
