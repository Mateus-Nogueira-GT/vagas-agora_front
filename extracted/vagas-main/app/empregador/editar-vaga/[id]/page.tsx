"use client"

import { use } from "react"
import CriarVaga from "../../criar-vaga/page"

export default function EditarVaga({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  
  return <CriarVaga vagaId={resolvedParams.id} />
}
