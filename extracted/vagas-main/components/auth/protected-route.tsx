"use client"

// Protected Route HOC following BMAD patterns
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../hooks/use-auth'
import { User } from '../../lib/auth/auth-types'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
  redirectTo?: string
}

export function ProtectedRoute({ 
  children, 
  allowedRoles, 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    // Se ainda está carregando, aguarda
    if (isLoading) return

    // Se não está autenticado, redireciona para login
    if (!isAuthenticated || !user) {
      router.push(redirectTo)
      return
    }

    // Se há roles específicas permitidas, verifica se o usuário tem acesso
    if (allowedRoles && allowedRoles.length > 0) {
      if (!allowedRoles.includes(user.role)) {
        // Redireciona para a página apropriada baseada no role do usuário
        const userRedirectPath = getUserRedirectPath(user)
        router.push(userRedirectPath)
        return
      }
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, router, redirectTo])

  // Mostra loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4400CC] mx-auto"></div>
          <p className="mt-2 text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // Se não está autenticado, não renderiza nada (vai redirecionar)
  if (!isAuthenticated || !user) {
    return null
  }

  // Se há roles específicas e o usuário não tem acesso, não renderiza
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return null
  }

  // Renderiza o conteúdo protegido
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
