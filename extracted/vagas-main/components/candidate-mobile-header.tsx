"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Briefcase, FileText, HelpCircle, Home, Search, Settings, User } from "lucide-react"
import { MobileNavigation, type MobileNavigationItem } from "@/components/mobile-navigation"
import { useAuth } from "@/hooks/use-auth"
import { useCandidatos } from "@/hooks/use-candidatos"

const candidateNavItems: MobileNavigationItem[] = [
  { name: "Início", href: "/candidato", icon: Home },
  { name: "Pesquisar Vagas", href: "/candidato/pesquisar-vagas", icon: Search },
  { name: "Minhas Candidaturas", href: "/candidato/candidaturas", icon: Briefcase },
  { name: "Meu Currículo", href: "/candidato/curriculo", icon: FileText },
]

const candidateFooterItems: MobileNavigationItem[] = [
  { name: "Ajuda", href: "/candidato/ajuda", icon: HelpCircle },
  { name: "Configurações", href: "/candidato/configuracoes", icon: Settings },
]

export default function CandidateMobileHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { candidato, loadCandidatoPerfil } = useCandidatos()

  useEffect(() => {
    if (user?.id && user.role === "candidato") {
      loadCandidatoPerfil().catch((error) => {
        console.error("[MOBILE HEADER] Erro ao carregar dados do candidato:", error)
      })
    }
  }, [loadCandidatoPerfil, user?.id, user?.role])

  const isItemActive = (href: string) => {
    if (pathname === href) return true
    if (href === "/candidato") return pathname === "/candidato/dashboard"
    return pathname?.startsWith(`${href}/`) ?? false
  }

  const accountName =
    candidato?.nome_completo || user?.nome || user?.email?.split("@")[0] || "Candidato"

  return (
    <MobileNavigation
      accountLabel="candidato"
      accountName={accountName}
      email={user?.email}
      avatarUrl={candidato?.foto_url}
      avatarAlt="Foto do candidato"
      fallbackIcon={<User aria-hidden="true" size={24} />}
      items={candidateNavItems}
      footerItems={candidateFooterItems}
      isItemActive={isItemActive}
      onNavigate={(href) => router.push(href)}
      onLogout={logout}
    />
  )
}
