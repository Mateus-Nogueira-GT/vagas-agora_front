"use client"

import { useState } from "react"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/hooks/use-auth"
import { LoginGuard } from "@/components/auth/login-guard"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { login, isLoading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    const result = await login({ email, password })
    
    if (!result.success) {
      setError(result.error)
    }
  }

  return (
    <LoginGuard>
    <div className="app-min-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4 [padding-bottom:max(1rem,env(safe-area-inset-bottom))] [padding-left:max(1rem,env(safe-area-inset-left))] [padding-right:max(1rem,env(safe-area-inset-right))] [padding-top:max(1rem,env(safe-area-inset-top))]">
      <Card className="w-full max-w-sm shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <CardContent className="p-6">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo-Vagas-Agora-kCs5jK59J2lfCgIXjngzVmXNfhi9tz.png"
              alt="Vagas Agora"
              width={180}
              height={40}
              className="h-10 w-auto"
              unoptimized
              priority
            />
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-gray-600 mb-1">Entre na sua conta</h1>
            <h2 className="text-xl font-semibold text-gray-800">Fazer Login</h2>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    enterKeyHint="next"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 border-gray-300 focus-visible:ring-[#4400CC] focus-visible:border-[#4400CC]"
                    required
                  />
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Senha
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    enterKeyHint="go"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-12 border-gray-300 focus-visible:ring-[#4400CC] focus-visible:border-[#4400CC]"
                    required
                  />
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 inline-flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="min-h-11 w-full bg-[#00FFAE] hover:bg-[#00E69D] text-[#4400CC] font-medium shadow-[0_0_10px_rgba(0,255,174,0.3)] transition-all"
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            {/* Forgot Password Link */}
            <div className="text-center mt-4">
              <Link
                href="/forgot-password"
                className="text-[#4400CC] hover:text-[#3300AA] text-sm transition-colors"
              >
                Esqueceu sua senha?
              </Link>
            </div>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">ou</span>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <span className="text-gray-600 text-sm">Não tem uma conta? </span>
              <Link
                href="/cadastro"
                className="text-[#4400CC] hover:text-[#3300AA] font-medium text-sm transition-colors"
              >
                Cadastre-se
              </Link>
            </div>
          </CardContent>
        </Card>

      {/* Footer */}
      <div className="text-center mt-6">
        <p className="text-xs text-gray-500">
          © 2025 Vagas Agora. Todos os direitos reservados.
        </p>
      </div>
    </div>
    </LoginGuard>
  )
}
