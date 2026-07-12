"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

export type ViewId = "candidato" | "empregador" | "administrador"

type ViewContextValue = {
  currentView: ViewId
  setView: (view: ViewId) => void
}

const ViewContext = createContext<ViewContextValue | null>(null)

export function ViewProvider({ children }: { children: ReactNode }) {
  const [currentView, setCurrentView] = useState<ViewId>("candidato")
  const setView = useCallback((view: ViewId) => setCurrentView(view), [])
  const value = useMemo(() => ({ currentView, setView }), [currentView, setView])

  return <ViewContext.Provider value={value}>{children}</ViewContext.Provider>
}

export function useView() {
  const context = useContext(ViewContext)

  if (!context) {
    throw new Error("useView deve ser usado dentro de ViewProvider")
  }

  return context
}
