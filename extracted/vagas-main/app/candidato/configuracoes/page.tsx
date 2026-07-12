"use client"

import { useState, useEffect } from "react"
import { User, Key, AlertTriangle, Save, Eye, EyeOff, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useConfiguracoes } from "@/hooks/use-configuracoes"
import { useAuth } from "@/hooks/use-auth"
import { useCandidatos } from "@/hooks/use-candidatos"
import { uploadApiService } from "@/lib/api/upload-api"
import toast from "react-hot-toast"

export default function SettingsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const {
    dadosUsuario,
    isLoading,
    error,
    isUpdating,
    isChangingPassword,
    loadDadosUsuario,
    atualizarDados,
    alterarSenha,
    desativarConta,
    excluirConta,
    clearError
  } = useConfiguracoes()

  const { updateCandidatoPerfilByUserId, loadCandidatoPerfil } = useCandidatos()

  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [cpf, setCpf] = useState("")
  const [fotoUrl, setFotoUrl] = useState<string | null>(null)
  const [isUploadingFoto, setIsUploadingFoto] = useState(false)
  const [senhaAtual, setSenhaAtual] = useState("")
  const [novaSenha, setNovaSenha] = useState("")
  const [confirmarSenha, setConfirmarSenha] = useState("")
  const [showSenhaAtual, setShowSenhaAtual] = useState(false)
  const [showNovaSenha, setShowNovaSenha] = useState(false)
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false)

  // Função para validar CPF
  const validarCPF = (cpf: string): boolean => {
    // Remove caracteres não numéricos
    cpf = cpf.replace(/[^\d]+/g, '')

    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false

    // Valida primeiro dígito
    let soma = 0
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf.charAt(i)) * (10 - i)
    }
    let resto = (soma * 10) % 11
    if (resto === 10 || resto === 11) resto = 0
    if (resto !== parseInt(cpf.charAt(9))) return false

    // Valida segundo dígito
    soma = 0
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf.charAt(i)) * (11 - i)
    }
    resto = (soma * 10) % 11
    if (resto === 10 || resto === 11) resto = 0
    if (resto !== parseInt(cpf.charAt(10))) return false

    return true
  }

  // Função para formatar CPF
  const formatarCPF = (valor: string): string => {
    const apenasNumeros = valor.replace(/[^\d]/g, '')
    if (apenasNumeros.length <= 11) {
      return apenasNumeros
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    }
    return valor
  }

  // Função para validar força da senha
  const validarSenha = (senha: string): { valida: boolean, mensagem: string } => {
    if (senha.length < 8) {
      return { valida: false, mensagem: 'A senha deve ter no mínimo 8 caracteres' }
    }
    if (!/[A-Z]/.test(senha)) {
      return { valida: false, mensagem: 'A senha deve conter ao menos uma letra maiúscula' }
    }
    if (!/[a-z]/.test(senha)) {
      return { valida: false, mensagem: 'A senha deve conter ao menos uma letra minúscula' }
    }
    if (!/[0-9]/.test(senha)) {
      return { valida: false, mensagem: 'A senha deve conter ao menos um número' }
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(senha)) {
      return { valida: false, mensagem: 'A senha deve conter ao menos um caractere especial' }
    }
    return { valida: true, mensagem: 'Senha forte' }
  }

  useEffect(() => {
    // Só carregar dados após autenticação estar completa
    if (!authLoading && user) {
      loadDadosUsuario()
    }
  }, [authLoading, user, loadDadosUsuario])

  useEffect(() => {
    if (dadosUsuario) {
      setNome(dadosUsuario.nome_completo || '')
      setEmail(dadosUsuario.email || '')
      // Formatar CPF ao carregar
      const cpfCarregado = dadosUsuario.cpf || ''
      setCpf(cpfCarregado ? formatarCPF(cpfCarregado) : '')
      setFotoUrl(dadosUsuario.foto_url || null)
    }
  }, [dadosUsuario])

  useEffect(() => {
    if (error) {
      toast.error(error)
      clearError()
    }
  }, [error, clearError])

  const handleFotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user?.id) return

    setIsUploadingFoto(true)

    try {
      // Upload da foto para o Supabase Storage
      const uploadResult = await uploadApiService.uploadProfileImage(user.id, file)

      // Atualizar preview local
      setFotoUrl(uploadResult.url)

      // Salvar automaticamente no banco de dados
      const sucesso = await updateCandidatoPerfilByUserId({
        foto_url: uploadResult.url
      })

      if (sucesso) {
        toast.success('Foto enviada e salva com sucesso!')
        // Recarregar dados do usuário
        await loadDadosUsuario()
      } else {
        toast.error('Foto enviada mas erro ao salvar no banco')
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Erro ao enviar foto')
    } finally {
      setIsUploadingFoto(false)
    }
  }

  const handleSalvar = async () => {
    // Validar CPF se foi preenchido
    if (cpf && !validarCPF(cpf)) {
      toast.error('CPF inválido! Por favor, verifique o número digitado.')
      return
    }

    const sucesso = await atualizarDados({
      nome_completo: nome,
      cpf: cpf.replace(/[^\d]/g, '') // Remove formatação antes de salvar
    })

    if (sucesso) {
      toast.success('Informações salvas com sucesso!')
    }
  }

  const handleAlterarSenha = async () => {
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      toast.error("Preencha todos os campos de senha")
      return
    }

    if (novaSenha !== confirmarSenha) {
      toast.error("As senhas não coincidem!")
      return
    }

    if (novaSenha.length < 8) {
      toast.error("A nova senha deve ter no mínimo 8 caracteres")
      return
    }

    if (!/[A-Z]/.test(novaSenha)) {
      toast.error("A senha deve conter pelo menos uma letra maiúscula")
      return
    }

    if (!/[a-z]/.test(novaSenha)) {
      toast.error("A senha deve conter pelo menos uma letra minúscula")
      return
    }

    const sucesso = await alterarSenha({
      senhaAtual,
      novaSenha
    })

    if (sucesso) {
      toast.success("Senha alterada com sucesso!")
      setSenhaAtual("")
      setNovaSenha("")
      setConfirmarSenha("")
    }
  }

  const handleDesativar = async () => {
    const sucesso = await desativarConta()

    if (sucesso) {
      toast.success('Conta desativada com sucesso!')
    }
  }

  const handleExcluir = async () => {
    const sucesso = await excluirConta()

    if (sucesso) {
      toast.success('Solicitação de exclusão enviada. Sua conta será removida em até 30 dias.')
    }
  }

  return (
    <ProtectedRoute allowedRoles={['candidato']}>
      <div className="w-full pb-16">
        {/* Banner com gradiente roxo-azul neon */}
        <div className="bg-gradient-to-r from-[#4400CC] to-[#00FFAE] min-h-[144px] sm:min-h-[160px] flex flex-col justify-center px-4 sm:px-6 md:px-10 py-6 shadow-[0_0_20px_rgba(68,0,204,0.3)]">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">Configurações</h1>
          <p className="text-base md:text-lg text-white/80 mt-2">Gerencie suas informações pessoais e preferências</p>
        </div>

      <div className="px-4 sm:px-6 md:px-10 mt-6 sm:mt-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {authLoading || isLoading ? (
            <div className="text-center py-8 text-gray-500">Carregando configurações...</div>
          ) : (
            <>
          {/* Dados Pessoais */}
          <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)]">
            <CardContent className="p-4 sm:p-6">
              <h2 className="text-xl font-medium text-gray-800 mb-6 flex items-center">
                <User className="w-5 h-5 mr-2 text-[#4400CC]" />
                Dados Pessoais
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 md:col-span-2">
                  <Label className="text-gray-700">Foto de perfil</Label>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden border border-[#4400CC]/30 flex items-center justify-center relative">
                      {fotoUrl ? (
                        <Image
                          src={fotoUrl}
                          alt="Foto de perfil"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <User size={32} className="text-gray-400" />
                      )}
                    </div>
                    <div>
                      <label htmlFor="foto-upload" className={`cursor-pointer ${isUploadingFoto ? 'pointer-events-none' : ''}`}>
                        <div className={`flex items-center gap-2 bg-[#4400CC]/10 hover:bg-[#4400CC]/20 text-[#4400CC] px-4 py-2 rounded-md ${isUploadingFoto ? 'opacity-50' : ''}`}>
                          <Upload size={16} />
                          <span>{isUploadingFoto ? 'Enviando...' : 'Carregar foto'}</span>
                        </div>
                        <input
                          type="file"
                          id="foto-upload"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFotoUpload}
                          disabled={isUploadingFoto}
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-2">Recomendado: PNG, JPG. Máx 5MB</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nome" className="text-gray-700">
                    Nome completo
                  </Label>
                  <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    autoComplete="name"
                    enterKeyHint="next"
                    className="text-base border-[#4400CC]/30 focus-visible:ring-[#4400CC]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">
                    E-mail
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    autoComplete="email"
                    inputMode="email"
                    className="text-base border-[#4400CC]/30 focus-visible:ring-[#4400CC] bg-gray-50 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500">O e-mail não pode ser alterado</p>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="cpf" className="text-gray-700">
                    CPF
                  </Label>
                  <Input
                    id="cpf"
                    value={cpf}
                    onChange={(e) => {
                      const valorFormatado = formatarCPF(e.target.value)
                      setCpf(valorFormatado)
                    }}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    inputMode="numeric"
                    autoComplete="off"
                    enterKeyHint="done"
                    className="text-base border-[#4400CC]/30 focus-visible:ring-[#4400CC]"
                  />
                  {cpf && cpf.replace(/[^\d]/g, '').length === 11 && (
                    <p className={`text-xs ${validarCPF(cpf) ? 'text-green-600' : 'text-red-600'}`}>
                      {validarCPF(cpf) ? '✓ CPF válido' : '✗ CPF inválido'}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-6 flex justify-stretch sm:justify-end">
                <Button
                  onClick={handleSalvar}
                  disabled={isUpdating || isLoading}
                  className="w-full sm:w-auto min-h-11 bg-[#4400CC] hover:bg-[#3300AA] text-white shadow-[0_0_10px_rgba(68,0,204,0.2)] disabled:opacity-50"
                >
                  <Save size={16} className="mr-2" />
                  {isUpdating ? 'Salvando...' : 'Salvar alterações'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Alteração de Senha */}
          <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)]">
            <CardContent className="p-4 sm:p-6">
              <h2 className="text-xl font-medium text-gray-800 mb-6 flex items-center">
                <Key className="w-5 h-5 mr-2 text-[#4400CC]" />
                Alteração de Senha
              </h2>
              <div className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="senha-atual" className="text-gray-700">
                    Senha atual
                  </Label>
                  <div className="relative">
                    <Input
                      id="senha-atual"
                      type={showSenhaAtual ? "text" : "password"}
                      value={senhaAtual}
                      onChange={(e) => setSenhaAtual(e.target.value)}
                      autoComplete="current-password"
                      enterKeyHint="next"
                      className="text-base border-[#4400CC]/30 focus-visible:ring-[#4400CC] pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full min-w-11 text-gray-500"
                      aria-label={showSenhaAtual ? "Ocultar senha atual" : "Mostrar senha atual"}
                      onClick={() => setShowSenhaAtual(!showSenhaAtual)}
                    >
                      {showSenhaAtual ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nova-senha" className="text-gray-700">
                    Nova senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="nova-senha"
                      type={showNovaSenha ? "text" : "password"}
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      autoComplete="new-password"
                      enterKeyHint="next"
                      className="text-base border-[#4400CC]/30 focus-visible:ring-[#4400CC] pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full min-w-11 text-gray-500"
                      aria-label={showNovaSenha ? "Ocultar nova senha" : "Mostrar nova senha"}
                      onClick={() => setShowNovaSenha(!showNovaSenha)}
                    >
                      {showNovaSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Mínimo 8 caracteres, uma letra maiúscula e uma minúscula
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmar-senha" className="text-gray-700">
                    Confirmar nova senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmar-senha"
                      type={showConfirmarSenha ? "text" : "password"}
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      autoComplete="new-password"
                      enterKeyHint="done"
                      className="text-base border-[#4400CC]/30 focus-visible:ring-[#4400CC] pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full min-w-11 text-gray-500"
                      aria-label={showConfirmarSenha ? "Ocultar confirmação da senha" : "Mostrar confirmação da senha"}
                      onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}
                    >
                      {showConfirmarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-stretch sm:justify-end">
                <Button
                  onClick={handleAlterarSenha}
                  disabled={isChangingPassword || !senhaAtual || !novaSenha || !confirmarSenha}
                  className="w-full sm:w-auto min-h-11 bg-[#4400CC] hover:bg-[#3300AA] text-white shadow-[0_0_10px_rgba(68,0,204,0.2)] disabled:opacity-50"
                >
                  <Key size={16} className="mr-2" />
                  {isChangingPassword ? 'Alterando...' : 'Alterar senha'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Gerenciamento de Conta - Oculto */}
          {false && (
          <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)]">
            <CardContent className="p-6">
              <h2 className="text-xl font-medium text-gray-800 mb-6 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                Gerenciamento de Conta
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 border border-amber-200 rounded-lg bg-amber-50">
                  <div>
                    <h3 className="font-medium text-gray-800">Desativar conta</h3>
                    <p className="text-sm text-gray-600">Sua conta ficará invisível e você não receberá notificações</p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        disabled={isUpdating}
                        className="border-amber-500 text-amber-600 hover:bg-amber-50 disabled:opacity-50"
                      >
                        {isUpdating ? 'Processando...' : 'Desativar'}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Desativar conta</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja desativar sua conta? Você pode reativá-la a qualquer momento fazendo
                          login novamente.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDesativar} className="bg-amber-500 hover:bg-amber-600">
                          Sim, desativar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <div className="flex justify-between items-center p-4 border border-red-200 rounded-lg bg-red-50">
                  <div>
                    <h3 className="font-medium text-gray-800">Excluir conta</h3>
                    <p className="text-sm text-gray-600">Todos os seus dados serão removidos permanentemente</p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        disabled={isUpdating}
                        className="border-red-500 text-red-500 hover:bg-red-50 disabled:opacity-50"
                      >
                        {isUpdating ? 'Processando...' : 'Excluir'}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir conta permanentemente</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. Isso excluirá permanentemente sua conta e removerá todos os
                          seus dados de nossos servidores.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleExcluir} className="bg-red-500 hover:bg-red-600">
                          Sim, excluir permanentemente
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
          )}
            </>
          )}
        </div>
      </div>
      </div>
    </ProtectedRoute>
  )
}
