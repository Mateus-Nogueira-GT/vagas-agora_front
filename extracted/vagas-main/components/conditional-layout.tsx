"use client"

import React from "react"
import { usePathname } from "next/navigation"
import dynamic from "next/dynamic"
import { SidebarProvider } from "@/contexts/sidebar-context"
import { ViewProvider } from "@/contexts/view-context"

const Sidebar = dynamic(() => import("@/components/sidebar"), { ssr: false })
const MainContent = dynamic(() => import("@/components/main-content").then(mod => ({ default: mod.MainContent })), { ssr: false })
const EmployerMobileHeader = dynamic(() => import("@/components/employer-mobile-header"), { ssr: false })
const CandidateMobileHeader = dynamic(() => import("@/components/candidate-mobile-header"), { ssr: false })
const AdminMobileHeader = dynamic(() => import("@/components/admin-mobile-header"), { ssr: false })

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // Rotas que não devem ter sidebar
  const routesWithoutSidebar = ["/login", "/cadastro", "/forgot-password"]
  const shouldHideSidebar = routesWithoutSidebar.some(route => pathname?.startsWith(route))

  // Verificar se está na área de empregador ou candidato
  const isEmployerRoute = pathname?.startsWith('/empregador')
  const isCandidateRoute = pathname?.startsWith('/candidato')
  const isAdminRoute = pathname?.startsWith('/admin')

  if (shouldHideSidebar) {
    return <>{children}</>
  }

  return (
    <ViewProvider>
      <SidebarProvider>
        <div className="app-min-screen flex w-full">
          <Sidebar />
          {/* Headers mobile por papel */}
          {isEmployerRoute && <EmployerMobileHeader />}
          {isCandidateRoute && <CandidateMobileHeader />}
          {isAdminRoute && <AdminMobileHeader />}
          <MainContent>{children}</MainContent>
        </div>
      </SidebarProvider>
    </ViewProvider>
  )
}
