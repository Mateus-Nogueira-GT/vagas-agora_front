import { vagasApiService } from '@/lib/api/vagas-api'

// Mock do fetch global
global.fetch = jest.fn()

describe('VagasApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock padrão do fetch
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ([
        {
          id: 'vaga-1',
          titulo: 'Desenvolvedor',
          empregador_id: 'emp-1',
          status: 'Ativa'
        }
      ])
    })
  })

  describe('getVagasByEmpregador', () => {
    it('deve buscar vagas de um empregador', async () => {
      // Mock para vagas
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ([
            { id: 'vaga-1', titulo: 'Dev Frontend', empregador_id: 'emp-123' }
          ])
        })
        // Mock para candidaturas
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ([
            { vaga_id: 'vaga-1' },
            { vaga_id: 'vaga-1' }
          ])
        })

      const result = await vagasApiService.getVagasByEmpregador('emp-123')

      expect(global.fetch).toHaveBeenCalled()
      expect(result.vagas).toBeInstanceOf(Array)
      expect(result.vagas[0]).toHaveProperty('id')
    })

    it('deve aplicar filtros de busca', async () => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ([])
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ([])
        })

      await vagasApiService.getVagasByEmpregador('emp-123', {
        status: 'Ativa',
        search: 'developer',
        page: 1,
        limit: 10
      })

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0][0]
      expect(fetchCall).toContain('empregador_id=eq.emp-123')
      expect(fetchCall).toContain('status=eq.Ativa')
    })

   it('deve evitar N+1 queries (máximo 3 chamadas)', async () => {
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ([
            { id: 'vaga-1', titulo: 'Dev' },
            { id: 'vaga-2', titulo: 'Designer' }
          ])
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ([
            { vaga_id: 'vaga-1' },
            { vaga_id: 'vaga-2' }
          ])
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ count: 2 })
        })

      await vagasApiService.getVagasByEmpregador('emp-123')

      // Deve fazer no máximo 3 chamadas (vagas + candidaturas + count)
      // Antes da correção N+1, faria 1 + N chamadas (uma por vaga)
      expect(global.fetch).toHaveBeenCalledTimes(3)
    })
  })
})
