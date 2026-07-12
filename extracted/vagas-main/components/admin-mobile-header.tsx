"use client"

import { usePathname, useRouter } from "next/navigation"
import { Building, Home, Settings, Shield, User } from "lucide-react"
import { MobileNavigation, type MobileNavigationItem } from "@/components/mobile-navigation"
import { useAuth } from "@/hooks/use-auth"

const adminNavItems: MobileNavigationItem[] = [
  { name: "Início", href: "/admin", icon: Home },
  { name: "Candidatos", href: "/admin/candidatos", icon: User },
  { name: "Empregadores", href: "/admin/empregadores", icon: Building },
  { name: "Configurações", href: "/admin/configuracoes", icon: Settings },
]

export default function AdminMobileHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const isItemActive = (href: string) => {
    if (pathname === href) return true
    if (href === "/admin") return false
    return pathname?.startsWith(`${href}/`) ?? false
  }

  return (
    <MobileNavigation
      accountLabel="administração"
      accountName={user?.nome || user?.email?.split("@")[0] || "Administrador"}
      email={user?.email}
      avatarAlt="Administrador"
      fallbackIcon={<Shield aria-hidden="true" size={24} />}
      items={adminNavItems}
      isItemActive={isItemActive}
      onNavigate={(href) => router.push(href)}
      onLogout={logout}
    />
  )
}
