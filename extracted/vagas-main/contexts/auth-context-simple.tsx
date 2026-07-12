"use client"

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from "react"

type SidebarContextType = {
  expanded: boolean
  toggleSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType>({
  expanded: true,
  toggleSidebar: () => {},
})

export const useSidebar = () => useContext(SidebarContext)

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [expanded, setExpanded] = useState(true)

  // ✅ useCallback: função não é recriada a cada render
  const toggleSidebar = useCallback(() => {
    setExpanded((prev) => !prev)
  }, [])

  // ✅ useMemo: objeto só é recriado quando expanded ou toggleSidebar mudam
  const value = useMemo(
    () => ({ expanded, toggleSidebar }),
    [expanded, toggleSidebar]
  )

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
}