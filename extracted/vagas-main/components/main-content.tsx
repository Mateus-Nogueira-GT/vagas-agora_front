"use client"

import type { ReactNode } from "react"
import { useSidebar } from "@/contexts/sidebar-context"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function MainContent({ children }: { children: ReactNode }) {
  const { expanded } = useSidebar()
  const pathname = usePathname()

  // Verificar se está na área de empregador ou candidato
  const isEmployerRoute = pathname?.startsWith('/empregador')
  const isCandidateRoute = pathname?.startsWith('/candidato')
  const isAdminRoute = pathname?.startsWith('/admin')

  if (isEmployerRoute || isCandidateRoute || isAdminRoute) {
    // Layout autenticado responsivo para todos os papéis
    return (
      <main
        className={cn(
          "min-w-0 flex-1 transition-all duration-300",
          // Em mobile: sem margem, 100% width, com padding-top do header
          "mobile-main-offset ml-0 w-full",
          // Em desktop (lg+): com margem e width ajustados, sem padding-top
          "lg:pt-0",
          expanded ? "lg:ml-64 lg:w-[calc(100%-16rem)]" : "lg:ml-16 lg:w-[calc(100%-4rem)]"
        )}
      >
        {children}
      </main>
    )
  }

  // Layout padrão para outras rotas
  return (
    <main
      className={cn(
        "min-w-0 flex-1 transition-all duration-300",
        expanded ? "lg:ml-64 lg:w-[calc(100%-16rem)]" : "lg:ml-16 lg:w-[calc(100%-4rem)]",
      )}
    >
      {children}
    </main>
  )
}
