"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Briefcase, Building, CreditCard, FileBarChart, HelpCircle, Home, Settings } from "lucide-react"
import { MobileNavigation, type MobileNavigationItem } from "@/components/mobile-navigation"
import { useAuth } from "@/hooks/use-auth"
import { useEmpresas } from "@/hooks/use-empresas"

const employerNavItems: MobileNavigationItem[] = [
  { name: "Início", href: "/empregador", icon: Home },
  { name: "Gerenciar Vagas", href: "/empregador/vagas", icon: Briefcase },
  { name: "Relatórios", href: "/empregador/dashboard", icon: FileBarChart },
  { name: "Assinatura", href: "/empregador/assinatura", icon: CreditCard },
]

const employerFooterItems: MobileNavigationItem[] = [
  { name: "Ajuda", href: "/empregador/ajuda", icon: HelpCircle },
  { name: "Configurações", href: "/empregador/configuracoes", icon: Settings },
]

export default function EmployerMobileHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { currentEmpresa, loadCurrentEmpresa } = useEmpresas()

  useEffect(() => {
    if (user?.id && user.role === "empregador") {
      loadCurrentEmpresa().catch((error) => {
        console.error("[MOBILE HEADER] Erro ao carregar dados da empresa:", error)
      })
    }
  }, [loadCurrentEmpresa, user?.id, user?.role])

  const isItemActive = (href: string) => {
    if (pathname === href) return true
    if (href === "/empregador") return false
    return pathname?.startsWith(`${href}/`) ?? false
  }

  const accountName =
    currentEmpresa?.nome || user?.nome || user?.email?.split("@")[0] || "Empresa"

  return (
    <MobileNavigation
      accountLabel="empregador"
      accountName={accountName}
      email={user?.email}
      avatarUrl={currentEmpresa?.logo_url}
      avatarAlt="Logo da empresa"
      fallbackIcon={<Building aria-hidden="true" size={24} />}
      items={employerNavItems}
      footerItems={employerFooterItems}
      isItemActive={isItemActive}
      onNavigate={(href) => router.push(href)}
      onLogout={logout}
    />
  )
}
