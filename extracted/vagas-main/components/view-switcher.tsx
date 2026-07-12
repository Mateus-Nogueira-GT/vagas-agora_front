"use client"

import { useState } from "react"
import { ChevronDown, User, Briefcase, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { useView, type ViewId } from "@/contexts/view-context"

export default function ViewSwitcher({ expanded }: { expanded: boolean }) {
  const { currentView, setView } = useView()
  const [isOpen, setIsOpen] = useState(false)

  const views: Array<{ id: ViewId; label: string; icon: typeof User }> = [
    { id: "candidato", label: "Visão Candidato", icon: User },
    { id: "empregador", label: "Visão Empregador", icon: Briefcase },
    { id: "administrador", label: "Visão Administrador", icon: ShieldCheck },
  ]

  const currentViewData = views.find((view) => view.id === currentView)

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  const selectView = (viewId: ViewId) => {
    setView(viewId)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all",
          "bg-[#4400CC]/10 text-[#4400CC] hover:bg-[#4400CC]/20",
          !expanded && "justify-center",
        )}
      >
        <div className="flex items-center">
          {currentViewData && <currentViewData.icon size={20} className="flex-shrink-0" />}
          {expanded && <span className="ml-3 font-medium">{currentViewData?.label}</span>}
        </div>
        {expanded && <ChevronDown size={16} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-[#4400CC]/20 shadow-lg z-50">
          {views.map((view) => (
            <button
              key={view.id}
              onClick={() => selectView(view.id)}
              className={cn(
                "w-full flex items-center px-3 py-2 hover:bg-[#4400CC]/5 text-left",
                "first:rounded-t-lg last:rounded-b-lg",
                currentView === view.id ? "bg-[#4400CC]/10 text-[#4400CC] font-medium" : "text-gray-700",
              )}
            >
              <view.icon size={18} className="mr-2" />
              <span>{view.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
