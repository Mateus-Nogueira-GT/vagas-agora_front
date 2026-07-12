"use client"

import React from "react"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  showHome?: boolean
}

export function Breadcrumb({ items, showHome = true }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center flex-wrap gap-2 text-sm">
        {showHome && (
          <>
            <li>
              <Link
                href="/"
                className="flex items-center text-gray-500 hover:text-[#4400CC] transition-colors"
              >
                <Home className="h-4 w-4" />
                <span className="sr-only">Home</span>
              </Link>
            </li>
            <li>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </li>
          </>
        )}

        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <React.Fragment key={index}>
              <li>
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="text-gray-500 hover:text-[#4400CC] transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={isLast ? "font-medium text-gray-900" : "text-gray-500"}
                    aria-current={isLast ? "page" : undefined}
                  >
                    {item.label}
                  </span>
                )}
              </li>
              {!isLast && (
                <li>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </li>
              )}
            </React.Fragment>
          )
        })}
      </ol>
    </nav>
  )
}

// Breadcrumbs pré-configurados para páginas comuns do candidato
export const candidatoBreadcrumbs = {
  dashboard: [
    { label: "Candidato", href: "/candidato" },
    { label: "Dashboard" }
  ],
  curriculo: [
    { label: "Candidato", href: "/candidato" },
    { label: "Meu Currículo" }
  ],
  curriculoVerificar: [
    { label: "Candidato", href: "/candidato" },
    { label: "Meu Currículo", href: "/candidato/curriculo" },
    { label: "Verificar Currículo" }
  ],
  pesquisarVagas: [
    { label: "Candidato", href: "/candidato" },
    { label: "Pesquisar Vagas" }
  ],
  detalhesVaga: (titulo?: string) => [
    { label: "Candidato", href: "/candidato" },
    { label: "Pesquisar Vagas", href: "/candidato/pesquisar-vagas" },
    { label: titulo || "Detalhes da Vaga" }
  ],
  candidaturas: [
    { label: "Candidato", href: "/candidato" },
    { label: "Minhas Candidaturas" }
  ],
  configuracoes: [
    { label: "Candidato", href: "/candidato" },
    { label: "Configurações" }
  ],
  ajuda: [
    { label: "Candidato", href: "/candidato" },
    { label: "Ajuda" }
  ]
}

// Breadcrumbs pré-configurados para páginas do empregador
export const empregadorBreadcrumbs = {
  dashboard: [
    { label: "Empregador", href: "/empregador/dashboard" },
    { label: "Dashboard" }
  ],
  criarVaga: [
    { label: "Empregador", href: "/empregador/dashboard" },
    { label: "Criar Vaga" }
  ],
  editarVaga: (titulo?: string) => [
    { label: "Empregador", href: "/empregador/dashboard" },
    { label: "Vagas", href: "/empregador/vagas" },
    { label: titulo || "Editar Vaga" }
  ],
  vagas: [
    { label: "Empregador", href: "/empregador/dashboard" },
    { label: "Minhas Vagas" }
  ],
  configuracoes: [
    { label: "Empregador", href: "/empregador/dashboard" },
    { label: "Configurações" }
  ],
  assinatura: [
    { label: "Empregador", href: "/empregador/dashboard" },
    { label: "Assinatura" }
  ],
  ajuda: [
    { label: "Empregador", href: "/empregador/dashboard" },
    { label: "Ajuda" }
  ]
}

// Breadcrumbs pré-configurados para páginas admin
export const adminBreadcrumbs = {
  dashboard: [
    { label: "Admin", href: "/admin/dashboard" },
    { label: "Dashboard" }
  ],
  empregadores: [
    { label: "Admin", href: "/admin/dashboard" },
    { label: "Empregadores" }
  ],
  empregadorDetalhes: (nome?: string) => [
    { label: "Admin", href: "/admin/dashboard" },
    { label: "Empregadores", href: "/admin/empregadores" },
    { label: nome || "Detalhes" }
  ],
  candidatos: [
    { label: "Admin", href: "/admin/dashboard" },
    { label: "Candidatos" }
  ],
  profissoes: [
    { label: "Admin", href: "/admin/dashboard" },
    { label: "Profissões" }
  ],
  configuracoes: [
    { label: "Admin", href: "/admin/dashboard" },
    { label: "Configurações" }
  ]
}
