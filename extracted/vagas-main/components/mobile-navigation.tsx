"use client"

import { useState, type ReactNode } from "react"
import Image from "next/image"
import * as Dialog from "@radix-ui/react-dialog"
import { LogOut, Menu, User, X, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface MobileNavigationItem {
  name: string
  href: string
  icon: LucideIcon
}

interface MobileNavigationProps {
  accountLabel: string
  accountName: string
  email?: string
  avatarUrl?: string | null
  avatarAlt: string
  fallbackIcon?: ReactNode
  items: MobileNavigationItem[]
  footerItems?: MobileNavigationItem[]
  isItemActive: (href: string) => boolean
  onNavigate: (href: string) => void
  onLogout: () => void
}

export function MobileNavigation({
  accountLabel,
  accountName,
  email,
  avatarUrl,
  avatarAlt,
  fallbackIcon = <User aria-hidden="true" size={24} />,
  items,
  footerItems = [],
  isItemActive,
  onNavigate,
  onLogout,
}: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false)

  const navigate = (href: string) => {
    setIsOpen(false)
    onNavigate(href)
  }

  const logout = () => {
    setIsOpen(false)
    onLogout()
  }

  const renderItem = (item: MobileNavigationItem) => {
    const active = isItemActive(item.href)

    return (
      <li key={item.href}>
        <button
          type="button"
          role="link"
          aria-current={active ? "page" : undefined}
          className={cn(
            "flex min-h-11 w-full items-center rounded-lg px-3 py-3 text-left transition-colors",
            active
              ? "bg-[#00FFAE] font-medium text-[#4400CC] shadow-[0_0_10px_rgba(0,255,174,0.3)]"
              : "text-gray-700 hover:bg-[#00FFAE]/10 hover:text-[#4400CC]",
          )}
          onClick={() => navigate(item.href)}
        >
          <item.icon aria-hidden="true" size={20} className={active ? "text-[#4400CC]" : "text-gray-600"} />
          <span className="ml-3 min-w-0 break-words">{item.name}</span>
        </button>
      </li>
    )
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <header className="mobile-safe-header fixed inset-x-0 top-0 z-[60] flex items-center justify-between border-b border-[#4400CC]/20 bg-white shadow-lg lg:hidden">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo-Vagas-Agora-kCs5jK59J2lfCgIXjngzVmXNfhi9tz.png"
          alt="Vagas Agora"
          width={180}
          height={40}
          className="h-6 w-auto"
          style={{ width: "auto" }}
          unoptimized
          priority
        />

        <Dialog.Trigger asChild>
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-[#4400CC] transition-colors hover:bg-[#4400CC]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4400CC] focus-visible:ring-offset-2"
            aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
          >
            {isOpen ? <X aria-hidden="true" size={24} /> : <Menu aria-hidden="true" size={24} />}
          </button>
        </Dialog.Trigger>
      </header>

      <Dialog.Portal>
        <Dialog.Overlay className="mobile-drawer-overlay fixed inset-x-0 bottom-0 z-40 bg-black/50 lg:hidden" />
        <Dialog.Content
          className="mobile-drawer-panel fixed bottom-0 right-0 z-50 flex w-[min(20rem,88vw)] flex-col border-l border-[#4400CC]/20 bg-white shadow-2xl outline-none lg:hidden"
          aria-describedby={undefined}
        >
          <Dialog.Title className="sr-only">Menu de {accountLabel}</Dialog.Title>
          <Dialog.Close asChild>
            <button
              type="button"
              className="absolute right-3 top-3 inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-[#4400CC] transition-colors hover:bg-[#4400CC]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4400CC] focus-visible:ring-offset-2"
              aria-label="Fechar menu"
            >
              <X aria-hidden="true" size={24} />
            </button>
          </Dialog.Close>

          <div className="flex shrink-0 items-center border-b border-[#4400CC]/20 p-4 pr-16">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#00FFAE] text-[#4400CC] shadow-[0_0_10px_rgba(0,255,174,0.3)]">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={avatarAlt}
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              ) : (
                fallbackIcon
              )}
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-800">{accountName}</p>
              {email && <p className="truncate text-xs text-gray-500">{email}</p>}
            </div>
          </div>

          <nav aria-label={`Navegação de ${accountLabel}`} className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-4">
            <ul className="space-y-2 px-3">{items.map(renderItem)}</ul>
          </nav>

          <div className="mobile-safe-footer shrink-0 border-t border-[#4400CC]/20 bg-white">
            <ul className="space-y-2 px-3 py-3">
              {footerItems.map(renderItem)}
              <li>
                <button
                  type="button"
                  className="flex min-h-11 w-full items-center rounded-lg px-3 py-3 text-left text-gray-700 transition-colors hover:bg-red-50 hover:text-red-600"
                  onClick={logout}
                >
                  <LogOut aria-hidden="true" size={20} />
                  <span className="ml-3">Sair</span>
                </button>
              </li>
            </ul>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
