"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function CandidatoRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/candidato/dashboard")
  }, [router])

  return null
}
