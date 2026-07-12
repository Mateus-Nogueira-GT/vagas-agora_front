import { verifyAuth } from '@/lib/auth/api-auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'

jest.mock('@/lib/supabase/server')

describe('verifyAuth', () => {
  it('deve retornar authorized: false quando não há usuário validado', async () => {
    const mockGetUser = jest.fn().mockResolvedValue({
      data: { user: null },
      error: null
    })

    ;(createServerSupabaseClient as jest.Mock).mockResolvedValue({
      auth: { getUser: mockGetUser }
    })

    const result = await verifyAuth()

    expect(result.authorized).toBe(false)
    expect(result.user).toBeNull()
    expect(result.error).toBe('Não autenticado')
  })

  it('deve retornar authorized: true com usuário validado', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com'
    }

    const mockGetUser = jest.fn().mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    ;(createServerSupabaseClient as jest.Mock).mockResolvedValue({
      auth: { getUser: mockGetUser }
    })

    const result = await verifyAuth()

    expect(result.authorized).toBe(true)
    expect(result.user).toEqual(mockUser)
    expect(result.error).toBeNull()
  })
})
