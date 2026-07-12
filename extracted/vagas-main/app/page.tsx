"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'

export default function RootPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    // Aguarda o carregamento do estado de autenticação
    if (isLoading) return

    if (!isAuthenticated || !user) {
      // Se não está autenticado, redireciona para login
      router.push('/login')
      return
    }

    // Se está autenticado, redireciona baseado no role
    switch (user.role) {
      case 'admin':
        router.push('/admin')
        break
      case 'empregador':
        router.push('/empregador')
        break
      case 'candidato':
        router.push('/candidato')
        break
      default:
        router.push('/login')
    }
  }, [isAuthenticated, isLoading, user, router])

  // Mostra loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4400CC] mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  // Mostra algo enquanto redireciona
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4400CC] mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecionando...</p>
      </div>
    </div>
  )
}
