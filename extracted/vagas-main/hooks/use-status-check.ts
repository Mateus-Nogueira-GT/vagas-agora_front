'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

interface UseStatusCheckOptions {
  enabled?: boolean
  interval?: number // em milissegundos
}

/**
 * Hook para verificar o status ativo/inativo do usuário em tempo real
 * Se o usuário for desativado, redireciona para página de conta desativada
 */
export function useStatusCheck(options: UseStatusCheckOptions = {}) {
  const { enabled = true, interval = 30000 } = options // padrão: 30 segundos
  const router = useRouter()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastStatusRef = useRef<boolean | null>(null)

  useEffect(() => {
    if (!enabled) return

    const checkStatus = async () => {
      try {
        // Obter sessão do Supabase
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        })

        if (!response.ok) {
          // Se não autorizado, fazer logout
          if (response.status === 401) {
            await supabase.auth.signOut()
            localStorage.removeItem('currentUser')
            router.push('/')
            return
          }
          return
        }

        const data = await response.json()

        // Verificar se o usuário está ativo
        if (data.user && data.user.ativo === false) {
          // Se mudou de ativo para inativo
          if (lastStatusRef.current === true || lastStatusRef.current === null) {
            toast.error('Sua conta foi desativada pelo administrador', {
              duration: 5000,
            })
          }

          lastStatusRef.current = false

          // Limpar dados e redirecionar
          await supabase.auth.signOut()
          localStorage.removeItem('currentUser')
          router.push('/conta-desativada')
        } else if (data.user) {
          lastStatusRef.current = data.user.ativo
        }
      } catch (error) {
        console.error('Erro ao verificar status do usuário:', error)
      }
    }

    // Verificar imediatamente ao montar
    checkStatus()

    // Configurar verificação periódica
    intervalRef.current = setInterval(checkStatus, interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [enabled, interval, router])
}

/**
 * Hook para verificar status apenas uma vez (útil para verificação ao carregar página)
 */
export function useStatusCheckOnce() {
  const router = useRouter()

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // Obter sessão do Supabase
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        })

        if (!response.ok) {
          if (response.status === 401) {
            await supabase.auth.signOut()
            localStorage.removeItem('currentUser')
            router.push('/')
          }
          return
        }

        const data = await response.json()

        if (data.user && data.user.ativo === false) {
          toast.error('Sua conta está desativada', {
            duration: 5000,
          })
          await supabase.auth.signOut()
          localStorage.removeItem('currentUser')
          router.push('/conta-desativada')
        }
      } catch (error) {
        console.error('Erro ao verificar status do usuário:', error)
      }
    }

    checkStatus()
  }, [router])
}
