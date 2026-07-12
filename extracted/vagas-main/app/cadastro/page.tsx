"use client"

import { useState } from "react"
import { Eye, EyeOff, Mail, Lock, User, Briefcase, UserCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/hooks/use-auth"
import { LoginGuard } from "@/components/auth/login-guard"
import { cn } from "@/lib/utils"

type UserRole = 'candidato' | 'empregador' | null

export default function CadastroPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>(null)
  const [nome, setNome] = useState("")
  const [nomeEmpresa, setNomeEmpresa] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, isLoading } = useAuth()

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return "A senha deve ter no mínimo 8 caracteres"
    }
    if (!/[A-Z]/.test(pwd)) {
      return "A senha deve conter pelo menos uma letra maiúscula"
    }
    if (!/[a-z]/.test(pwd)) {
      return "A senha deve conter pelo menos uma letra minúscula"
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!selectedRole) {
      setError("Selecione um tipo de conta")
      return
    }

    // Validar nome da empresa se for empregador
    if (selectedRole === 'empregador' && !nomeEmpresa.trim()) {
      setError("Nome da empresa é obrigatório")
      return
    }

    // Validar senha
    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      return
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem")
      return
    }

    const result = await register({
      nome,
      email,
      password,
      confirmPassword,
      role: selectedRole,
      nomeEmpresa: selectedRole === 'empregador' ? nomeEmpresa : undefined
    })

    if (!result.success) {
      setError(result.error)
    }
  }

  const showForm = selectedRole !== null

  return (
    <LoginGuard>
      <div className="app-min-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4 [padding-bottom:max(1rem,env(safe-area-inset-bottom))] [padding-left:max(1rem,env(safe-area-inset-left))] [padding-right:max(1rem,env(safe-area-inset-right))] [padding-top:max(1rem,env(safe-area-inset-top))]">
        <Card className="w-full max-w-2xl shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardContent className="p-5 sm:p-8">
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
            <div className="text-center mb-8">
              <h1 className="text-gray-600 mb-1">Crie sua conta</h1>
              <h2 className="text-xl font-semibold text-gray-800">Cadastro</h2>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6 text-sm">
                {error}
              </div>
            )}

            {/* Role Selection Cards */}
            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-700 mb-4 text-center">
                Selecione o tipo de conta
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Candidato Card */}
                <button
                  type="button"
                  onClick={() => setSelectedRole('candidato')}
                  className={cn(
                    "min-h-11 p-4 sm:p-6 rounded-lg border-2 transition-all duration-200 text-left hover:shadow-md",
                    selectedRole === 'candidato'
                      ? "border-[#4400CC] bg-[#4400CC]/5 shadow-md"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "p-3 rounded-lg",
                      selectedRole === 'candidato' ? "bg-[#4400CC]" : "bg-gray-100"
                    )}>
                      <UserCircle className={cn(
                        "w-6 h-6",
                        selectedRole === 'candidato' ? "text-white" : "text-gray-600"
                      )} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">Candidato</h4>
                      <p className="text-sm text-gray-600">
                        Procure vagas, candidate-se e gerencie suas aplicações
                      </p>
                    </div>
                    {selectedRole === 'candidato' && (
                      <div className="flex-shrink-0">
                        <div className="w-5 h-5 rounded-full bg-[#00FFAE] flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-[#4400CC]" />
                        </div>
                      </div>
                    )}
                  </div>
                </button>

                {/* Empregador Card */}
                <button
                  type="button"
                  onClick={() => setSelectedRole('empregador')}
                  className={cn(
                    "min-h-11 p-4 sm:p-6 rounded-lg border-2 transition-all duration-200 text-left hover:shadow-md",
                    selectedRole === 'empregador'
                      ? "border-[#4400CC] bg-[#4400CC]/5 shadow-md"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "p-3 rounded-lg",
                      selectedRole === 'empregador' ? "bg-[#4400CC]" : "bg-gray-100"
                    )}>
                      <Briefcase className={cn(
                        "w-6 h-6",
                        selectedRole === 'empregador' ? "text-white" : "text-gray-600"
                      )} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">Empregador</h4>
                      <p className="text-sm text-gray-600">
                        Crie vagas, encontre talentos e gerencie processos seletivos
                      </p>
                    </div>
                    {selectedRole === 'empregador' && (
                      <div className="flex-shrink-0">
                        <div className="w-5 h-5 rounded-full bg-[#00FFAE] flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-[#4400CC]" />
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* Form - Only shows when a role is selected */}
            {showForm && (
              <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in duration-300">
                {/* Nome Field */}
                <div>
                  <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                    {selectedRole === 'empregador' ? 'Nome do responsável' : 'Nome completo'}
                  </label>
                  <div className="relative">
                    <Input
                      id="nome"
                      type="text"
                      autoComplete="name"
                      enterKeyHint="next"
                      placeholder={selectedRole === 'empregador' ? 'Nome do responsável pela empresa' : 'Seu nome completo'}
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="pl-10 border-gray-300 focus-visible:ring-[#4400CC] focus-visible:border-[#4400CC]"
                      required
                    />
                    <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                {/* Nome da Empresa Field - Only for empregador */}
                {selectedRole === 'empregador' && (
                  <div>
                    <label htmlFor="nomeEmpresa" className="block text-sm font-medium text-gray-700 mb-1">
                      Nome da empresa
                    </label>
                    <div className="relative">
                      <Input
                        id="nomeEmpresa"
                        type="text"
                        autoComplete="organization"
                        enterKeyHint="next"
                        placeholder="Nome da sua empresa"
                        value={nomeEmpresa}
                        onChange={(e) => setNomeEmpresa(e.target.value)}
                        className="pl-10 border-gray-300 focus-visible:ring-[#4400CC] focus-visible:border-[#4400CC]"
                        required
                      />
                      <Briefcase className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                )}

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
                      autoComplete="new-password"
                      enterKeyHint="next"
                      placeholder="Mínimo 8 caracteres"
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
                  <p className="text-xs text-gray-500 mt-1">
                    Mínimo 8 caracteres, uma letra maiúscula e uma minúscula
                  </p>
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar senha
                  </label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      enterKeyHint="done"
                      placeholder="Digite a senha novamente"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-12 border-gray-300 focus-visible:ring-[#4400CC] focus-visible:border-[#4400CC]"
                      required
                    />
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-0 top-1/2 inline-flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center text-gray-400 hover:text-gray-600"
                      aria-label={showConfirmPassword ? "Ocultar confirmação de senha" : "Mostrar confirmação de senha"}
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className={cn(
                    "min-h-11 w-full bg-[#00FFAE] hover:bg-[#00E69D] text-[#4400CC] font-medium shadow-[0_0_10px_rgba(0,255,174,0.3)] transition-all mt-6",
                    isLoading && "opacity-70 cursor-not-allowed hover:bg-[#00FFAE]"
                  )}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#4400CC] border-t-transparent rounded-full animate-spin" />
                      <span>Criando conta...</span>
                    </div>
                  ) : (
                    "Criar conta"
                  )}
                </Button>
              </form>
            )}

            {/* Login Link */}
            <div className="text-center mt-6">
              <span className="text-gray-600 text-sm">Já tem uma conta? </span>
              <Link
                href="/login"
                className="text-[#4400CC] hover:text-[#3300AA] font-medium text-sm transition-colors"
              >
                Faça login
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
