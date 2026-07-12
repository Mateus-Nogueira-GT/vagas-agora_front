"use client"

// Custom hook following BMAD state management patterns
import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '../lib/auth/auth-service'
import { User, LoginCredentials, RegisterCredentials, AuthState } from '../lib/auth/auth-types'

export function useAuth() {
  const router = useRouter()
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true, // Começar como loading até verificar o estado
    isAuthenticated: false,
  })

  // Carregar estado de autenticação após hidratação
  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    setAuthState({
      user: currentUser,
      isLoading: false,
      isAuthenticated: authService.isAuthenticated(),
    })
  }, [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true }))
    
    try {
      const response = await authService.login(credentials)
      
      if (response.user) {
        setAuthState({
          user: response.user,
          isLoading: false,
          isAuthenticated: true,
        })
        
        // Redirecionar baseado no role
        const redirectPath = authService.getRedirectPath(response.user)
        router.push(redirectPath)
        
        return { success: true, error: null }
      } else {
        setAuthState(prev => ({ 
          ...prev, 
          isLoading: false,
          isAuthenticated: false 
        }))
        
        return { 
          success: false, 
          error: response.error || 'Login failed' 
        }
      }
    } catch (error) {
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false,
        isAuthenticated: false 
      }))
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      }
    }
  }, [router])

  const register = useCallback(async (credentials: RegisterCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true }))

    try {
      const response = await authService.register(credentials)

      if (response.user) {
        setAuthState({
          user: response.user,
          isLoading: false,
          isAuthenticated: true,
        })

        // Redirecionar baseado no role
        const redirectPath = authService.getRedirectPath(response.user)
        router.push(redirectPath)

        return { success: true, error: null }
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          isAuthenticated: false
        }))

        return {
          success: false,
          error: response.error || 'Falha no cadastro'
        }
      }
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: false
      }))

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Falha no cadastro'
      }
    }
  }, [router])

  const logout = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }))

    try {
      await authService.logout()
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })

      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      // Mesmo com erro, limpar estado local
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })
      router.push('/login')
    }
  }, [router])

  return {
    ...authState,
    login,
    register,
    logout,
  }
}
