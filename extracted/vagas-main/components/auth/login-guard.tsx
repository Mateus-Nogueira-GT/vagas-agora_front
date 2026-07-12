"use client"

// Login Route Guard following BMAD patterns
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../hooks/use-auth'
import { User } from '../../lib/auth/auth-types'

interface LoginGuardProps {
  children: React.ReactNode
}

export function LoginGuard({ children }: LoginGuardProps) {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    // Se ainda está carregando, aguarda
    if (isLoading) return

    // Se está autenticado, redireciona para a página apropriada
    if (isAuthenticated && user) {
      const redirectPath = getUserRedirectPath(user)
      router.push(redirectPath)
      return
    }
  }, [isAuthenticated, isLoading, user, router])

  // Mostra loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  // Se está autenticado, não renderiza nada (vai redirecionar)
  if (isAuthenticated && user) {
    return null
  }

  // Renderiza a página de login
  return <>{children}</>
}

// Helper function para redirecionamento baseado no role
function getUserRedirectPath(user: User): string {
  switch (user.role) {
    case 'admin':
      return '/admin/dashboard'
    case 'empregador':
      return '/empregador'
    case 'candidato':
      return '/candidato'
    default:
      return '/login'
  }
}
