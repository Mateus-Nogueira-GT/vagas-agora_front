"use client"

import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"
import {
  Home,
  Search,
  Briefcase,
  FileText,
  Bell,
  HelpCircle,
  Settings,
  ChevronRight,
  ChevronLeft,
  User,
  Building,
  CreditCard,
  Layers,
  Palette,
  LogOut,
  CheckCircle2,
  FileBarChart,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/contexts/sidebar-context"
import { useAuth } from "@/hooks/use-auth"
import { useCandidatos } from "@/hooks/use-candidatos"
import { useEmpresas } from "@/hooks/use-empresas"
import { useStatusCheck } from "@/hooks/use-status-check"
import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import { supabase } from "@/lib/supabase"

export default function Sidebar() {
  const router = useRouter()
  const { expanded, toggleSidebar } = useSidebar()
  const { user, logout, isLoading } = useAuth()
  const { candidato, loadCandidatoPerfil } = useCandidatos()
  const { currentEmpresa, loadCurrentEmpresa } = useEmpresas()
  const pathname = usePathname()
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false)

  // Verificar se está na área de empregador ou candidato
  const isEmployerRoute = pathname?.startsWith('/empregador')
  const isCandidateRoute = pathname?.startsWith('/candidato')
  const isAdminRoute = pathname?.startsWith('/admin')
  const isAuthenticatedRoute = isEmployerRoute || isCandidateRoute || isAdminRoute

  // Verificar status do usuário em tempo real (30 segundos)
  useStatusCheck({ enabled: !!user, interval: 30000 })

  // Carregar dados do candidato se for um usuário candidato
  useEffect(() => {
    if (user?.id && user?.role === 'candidato') {
      loadCandidatoPerfil().catch(err => {
        console.error('[SIDEBAR] Erro ao carregar perfil do candidato:', err)
      })
      checkSubscriptionStatus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.role])

  // Carregar dados da empresa se for um usuário empregador
  useEffect(() => {
    if (user?.id && user?.role === 'empregador') {
      loadCurrentEmpresa().catch(err => {
        console.error('[SIDEBAR] Erro ao carregar dados da empresa:', err)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.role])

  // Verificar se candidato tem assinatura ativa
  const checkSubscriptionStatus = useCallback(async () => {
    if (!user?.id) return

    try {
      const { data: subscription, error } = await supabase
        .from('asaas_subscriptions')
        .select('status, verification_active, verification_expires_at')
        .eq('user_id', user.id)
        .eq('subscription_type', 'CURRICULO_VERIFICACAO')
        .eq('status', 'ACTIVE')
        .eq('verification_active', true)
        .maybeSingle()

      if (!error && subscription) {
        // Verificar se ainda não expirou
        const now = new Date()
        const expiresAt = new Date(subscription.verification_expires_at)
        setHasActiveSubscription(expiresAt > now)
      } else {
        setHasActiveSubscription(false)
      }
    } catch (error) {
      console.error('Erro ao verificar assinatura:', error)
      setHasActiveSubscription(false)
    }
  }, [user?.id])

  // Realtime listener para atualizar banner quando assinatura mudar
  useEffect(() => {
    if (!user?.id || user?.role !== 'candidato') return


    const channel = supabase
      .channel('sidebar-subscription-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'asaas_subscriptions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          checkSubscriptionStatus()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [checkSubscriptionStatus, user?.id, user?.role])

  // Navigation items for candidate view
  const candidateNavItems = [
    { name: "Início", href: "/candidato", icon: Home },
    { name: "Pesquisar Vagas", href: "/candidato/pesquisar-vagas", icon: Search },
    { name: "Minhas Candidaturas", href: "/candidato/candidaturas", icon: Briefcase },
    { name: "Currículo", href: "/candidato/curriculo", icon: FileText },
    //{ name: "Notificações", href: "/candidato/notificacoes", icon: Bell },
  ]

  // Navigation items for employer view
  const employerNavItems = [
    { name: "Início", href: "/empregador", icon: Home },
    { name: "Gerenciar Vagas", href: "/empregador/vagas", icon: Briefcase },
    { name: "Relatórios", href: "/empregador/dashboard", icon: FileBarChart },
    { name: "Assinatura", href: "/empregador/assinatura", icon: CreditCard },
  ]

  // Navigation items for admin view
  const adminNavItems = [
    { name: "Início", href: "/admin", icon: Home },
    //{ name: "Dashboard", href: "/admin/dashboard", icon: BarChart },
    { name: "Candidatos", href: "/admin/candidatos", icon: User },
    { name: "Empregadores", href: "/admin/empregadores", icon: Building },
    { name: "Configurações", href: "/admin/configuracoes", icon: Settings },
  ]

  // Select the appropriate navigation items based on the user role
  // Se não houver user ou role, retornar array vazio para evitar renderização de menu vazio
  const navItems =
    user?.role === "candidato" ? candidateNavItems :
    user?.role === "empregador" ? employerNavItems :
    user?.role === "admin" ? adminNavItems : []

  // Se ainda está carregando, mostrar skeleton do sidebar
  if (isLoading) {
    return (
      <aside
        className={cn(
          "fixed h-full bg-white transition-all duration-300 z-10 flex flex-col border-r border-[#4400CC]/20 shadow-lg",
          expanded ? "w-64" : "w-16",
          // Em áreas autenticadas, a navegação mobile substitui a sidebar.
          isAuthenticatedRoute && "hidden lg:flex"
        )}
      >
        <div className="p-4 flex items-center justify-center">
          <div className="h-8 w-32 bg-gray-200 animate-pulse rounded" />
        </div>
        <div className={cn("mt-6 px-3 flex items-center", expanded ? "justify-start" : "justify-center")}>
          <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
          {expanded && (
            <div className="ml-3 flex-1 space-y-2">
              <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
              <div className="h-3 w-24 bg-gray-200 animate-pulse rounded" />
            </div>
          )}
        </div>
        <nav className="mt-8 px-3">
          <ul className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <li key={i}>
                <div className="flex items-center py-3 px-3 rounded-lg">
                  <div className="w-5 h-5 bg-gray-200 animate-pulse rounded" />
                  {expanded && <div className="ml-3 h-4 w-24 bg-gray-200 animate-pulse rounded" />}
                </div>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    )
  }

  // Se não há usuário, não renderizar o sidebar
  if (!user) {
    return null
  }

  // Footer items - "Ajuda" para candidatos e empregadores
  const footerItems = []

  if (user?.role === "candidato") {
    footerItems.push({ name: "Ajuda", href: "/candidato/ajuda", icon: HelpCircle })
  } else if (user?.role === "empregador") {
    footerItems.push({ name: "Ajuda", href: "/empregador/ajuda", icon: HelpCircle })
  }

  // Adiciona "Configurações" no footer para candidato e empregador
  if (user?.role === "candidato") {
    footerItems.push({ name: "Configurações", href: "/candidato/configuracoes", icon: Settings })
  } else if (user?.role === "empregador") {
    footerItems.push({ name: "Configurações", href: "/empregador/configuracoes", icon: Settings })
  }

  // Função para navegar usando o router do Next.js - com tratamento de erro
  const handleNavigation = (href: string) => {
    try {
      // Usando router.push para navegação do lado do cliente
      router.push(href)
    } catch (error) {
      console.error("Erro ao navegar:", error)
      // Fallback para navegação tradicional em caso de erro
      window.location.href = href
    }
  }

  // Função para verificar se um item está ativo
  const isItemActive = (itemHref: string) => {
    // Correspondência exata primeiro
    if (pathname === itemHref) {
      return true
    }

    // Tratamento especial para rotas de início/dashboard
    if (itemHref === "/candidato" && (pathname === "/" || pathname === "/candidato" || pathname === "/candidato/dashboard")) {
      return true
    }

    if (itemHref === "/empregador" && pathname === "/empregador") {
      return true
    }

    if (itemHref === "/admin" && pathname === "/admin") {
      return true
    }

    // Para subpáginas - verifica se o pathname começa com o href do item
    // Mas evita conflitos entre rotas similares
    if (itemHref !== "/" &&
        itemHref !== "/candidato" &&
        itemHref !== "/empregador" &&
        itemHref !== "/admin" &&
        pathname?.startsWith(itemHref + "/")) {
      return true
    }

    return false
  }

  return (
    <aside
      className={cn(
        "fixed h-full bg-white transition-all duration-300 z-10 flex flex-col border-r border-[#4400CC]/20 shadow-lg",
        expanded ? "w-64" : "w-16",
        // Em áreas autenticadas, a navegação mobile substitui a sidebar.
        isAuthenticatedRoute && "hidden lg:flex"
      )}
    >
      <div className="relative">
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-16 bg-white border border-[#4400CC]/30 rounded-full p-1 text-[#4400CC] shadow-[0_0_10px_rgba(68,0,204,0.2)]"
        >
          {expanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      <div className="p-4 flex items-center justify-center">
        <div className="flex items-center">
          {expanded ? (
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo-Vagas-Agora-kCs5jK59J2lfCgIXjngzVmXNfhi9tz.png"
              alt="Vagas Agora"
              className="h-8 w-auto"
            />
          ) : (
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo-Vagas-Agora-Colapsado-Hs9ar2SQJR4nyCeqWv1EVswDWIZ3sy.png"
              alt="Vagas Agora"
              className="h-8 w-auto"
            />
          )}
        </div>
      </div>

      <div className={cn("mt-6 px-3 flex items-center", expanded ? "justify-start" : "justify-center")}>
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-[#00FFAE] flex items-center justify-center text-[#4400CC] shadow-[0_0_10px_rgba(0,255,174,0.3)] overflow-hidden">
            {user?.role === 'candidato' && candidato?.foto_url ? (
              <Image
                src={candidato.foto_url}
                alt="Foto do perfil"
                width={40}
                height={40}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : user?.role === 'empregador' && currentEmpresa?.logo_url ? (
              <Image
                src={currentEmpresa.logo_url}
                alt="Logo da empresa"
                width={40}
                height={40}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              user?.role === 'empregador' ? <Building size={20} /> : <User size={20} />
            )}
          </div>
          {user?.perfil_verificado && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#00FFAE] rounded-full border-2 border-white shadow-[0_0_5px_rgba(0,255,174,0.5)]"></div>
          )}
        </div>
        {expanded && (
          <div className="ml-3 flex-1 min-w-0">
            <p className="font-medium text-sm text-gray-800 truncate">
              {user?.role === 'candidato' && candidato?.nome_completo
                ? candidato.nome_completo
                : user?.role === 'empregador' && currentEmpresa?.nome
                ? currentEmpresa.nome
                : user?.role === 'admin'
                ? (user?.nome || user?.email?.split('@')[0] || 'Administrador')
                : user?.nome || user?.email?.split('@')[0] || 'Usuário'}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            {user?.perfil_verificado && (
              <p className="text-xs text-[#4400CC]">Perfil verificado</p>
            )}
          </div>
        )}
      </div>

      {/* Área de scroll para navegação */}
      <div className="flex-1 overflow-y-auto">
        <nav className="mt-8">
          <ul className="space-y-2 px-3">
            {navItems.map((item) => (
              <li key={item.name}>
                <button
                  role="link"
                  aria-label={`Navegar para ${item.name}`}
                  className={cn(
                    "w-full flex items-center py-3 px-3 rounded-lg transition-all text-left",
                    isItemActive(item.href)
                      ? "bg-[#00FFAE] text-[#4400CC] font-medium shadow-[0_0_10px_rgba(0,255,174,0.3)]"
                      : "hover:bg-[#00FFAE]/10 hover:text-[#4400CC]",
                  )}
                  onClick={() => handleNavigation(item.href)}
                >
                  <item.icon size={20} className={isItemActive(item.href) ? "text-[#4400CC]" : "text-gray-600"} />
                  {expanded && <span className="ml-3">{item.name}</span>}
                </button>
              </li>
            ))}
          </ul>

          {user?.role === "candidato" && (
            <div className="mt-6 px-3">
              <div
                className={cn(
                  hasActiveSubscription
                    ? "p-3 rounded-lg bg-gradient-to-br from-[#4400CC] to-[#00FFAE]/30 text-white shadow-[0_0_15px_rgba(68,0,204,0.3)]"
                    : "p-3 rounded-lg bg-[#00FFAE] text-[#4400CC] shadow-[0_0_15px_rgba(0,255,174,0.3)]",
                  !expanded && "flex justify-center",
                )}
              >
                {expanded && (
                  <div className="mt-2">
                    {hasActiveSubscription ? (
                      <>
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 size={16} className="text-[#00FFAE]" />
                          <h4 className="font-medium text-sm">Verificação Ativa</h4>
                        </div>
                        <p className="text-xs text-white/80 mt-1">Seu perfil está em destaque</p>
                        <button
                          className="mt-2 text-xs font-medium text-[#00FFAE] hover:text-white transition-colors"
                          onClick={() => handleNavigation("/candidato/curriculo/verificar")}
                        >
                          Gerenciar assinatura →
                        </button>
                      </>
                    ) : (
                      <>
                        <h4 className="font-medium text-sm">Verifique seu currículo</h4>
                        <p className="text-xs text-[#4400CC]/90 mt-1">Destaque seu perfil para recrutadores</p>
                        <button
                          className="mt-2 text-xs font-medium text-[#4400CC] hover:text-[#3300AA] transition-colors"
                          onClick={() => handleNavigation("/candidato/curriculo/verificar")}
                        >
                          Verificar agora →
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Footer com botões de configuração e logout */}
      <div className="mt-auto mb-6">
        <ul className="space-y-2 px-3">
          {footerItems.map((item) => (
            <li key={item.name}>
              <button
                role="link"
                aria-label={`Navegar para ${item.name}`}
                className={cn(
                  "w-full flex items-center py-3 px-3 rounded-lg transition-all text-left",
                  isItemActive(item.href)
                    ? "bg-[#00FFAE] text-[#4400CC] font-medium shadow-[0_0_10px_rgba(0,255,174,0.3)]"
                    : "hover:bg-[#00FFAE]/10 hover:text-[#4400CC]",
                )}
                onClick={() => handleNavigation(item.href)}
              >
                <item.icon size={20} className={isItemActive(item.href) ? "text-[#4400CC]" : "text-gray-600"} />
                {expanded && <span className="ml-3">{item.name}</span>}
              </button>
            </li>
          ))}
          
          {/* Botão de Logout */}
          <li>
            <button
              aria-label="Sair da conta"
              className="w-full flex items-center py-3 px-3 rounded-lg transition-all text-left hover:bg-red-50 hover:text-red-600"
              onClick={logout}
            >
              <LogOut size={20} className="text-gray-600 hover:text-red-600" />
              {expanded && <span className="ml-3">Sair</span>}
            </button>
          </li>
        </ul>
      </div>
    </aside>
  )
}
