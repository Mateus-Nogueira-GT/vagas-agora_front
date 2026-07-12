"use client"

import { useState, useEffect } from "react"
import { User, Key, AlertTriangle, Save, Eye, EyeOff, Building2, Mail, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/hooks/use-auth"
import { useConfiguracoes } from "@/hooks/use-configuracoes"
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
import toast from "react-hot-toast"

export default function AdminConfiguracoesPage() {
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

  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [emailSuporte, setEmailSuporte] = useState("")
  const [whatsappSuporte, setWhatsappSuporte] = useState("")
  const [senhaAtual, setSenhaAtual] = useState("")
  const [novaSenha, setNovaSenha] = useState("")
  const [confirmarSenha, setConfirmarSenha] = useState("")
  const [showSenhaAtual, setShowSenhaAtual] = useState(false)
  const [showNovaSenha, setShowNovaSenha] = useState(false)
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false)
  const [isSavingSupport, setIsSavingSupport] = useState(false)

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
    }
  }, [dadosUsuario])

  useEffect(() => {
    if (error) {
      toast.error(error)
      clearError()
    }
  }, [error, clearError])

  // Carregar configurações de suporte
  useEffect(() => {
    const loadSupportSettings = async () => {
      try {
        const response = await fetch('/api/support-settings')
        if (response.ok) {
          const data = await response.json()
          setEmailSuporte(data.email_suporte || '')
          setWhatsappSuporte(data.whatsapp_suporte || '')
        }
      } catch (error) {
        console.error('Erro ao carregar configurações de suporte:', error)
      }
    }

    if (!authLoading && user?.role === 'admin') {
      loadSupportSettings()
    }
  }, [authLoading, user])

  const handleSalvar = async () => {
    const sucesso = await atualizarDados({
      nome_completo: nome,
      email: email
    })

    if (sucesso) {
      toast.success('Informações salvas com sucesso!')
    }
  }

  const handleAlterarSenha = async () => {
    if (novaSenha !== confirmarSenha) {
      toast.error('As senhas não coincidem!')
      return
    }

    const sucesso = await alterarSenha({
      senhaAtual,
      novaSenha
    })

    if (sucesso) {
      toast.success('Senha alterada com sucesso!')
      setSenhaAtual('')
      setNovaSenha('')
      setConfirmarSenha('')
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

  const handleSalvarSuporteSettings = async () => {
    if (!emailSuporte || !whatsappSuporte) {
      toast.error('Email e WhatsApp de suporte são obrigatórios')
      return
    }

    setIsSavingSupport(true)
    try {
      // Obter token do Supabase
      const { supabase } = await import('@/lib/supabase')
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        toast.error('Sessão expirada. Por favor, faça login novamente.')
        return
      }

      const response = await fetch('/api/support-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          email_suporte: emailSuporte,
          whatsapp_suporte: whatsappSuporte,
        }),
      })

      if (response.ok) {
        toast.success('Configurações de suporte salvas com sucesso!')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Erro ao salvar configurações de suporte')
      }
    } catch (error) {
      console.error('Erro ao salvar configurações de suporte:', error)
      toast.error('Erro ao salvar configurações de suporte')
    } finally {
      setIsSavingSupport(false)
    }
  }

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="w-full pb-16">
      {/* Banner com gradiente roxo-azul neon */}
      <div className="bg-gradient-to-r from-[#4400CC] to-[#00FFAE] h-[160px] flex flex-col justify-center px-6 md:px-10 shadow-[0_0_20px_rgba(68,0,204,0.3)]">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">Configurações</h1>
        <p className="text-base md:text-lg text-white/80 mt-2">Gerencie suas informações pessoais e preferências</p>
      </div>

      <div className="px-6 md:px-10 mt-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {authLoading || isLoading ? (
            <div className="text-center py-8 text-gray-500">Carregando configurações...</div>
          ) : (
            <>
          {/* Dados da Empresa */}
          <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)]">
            <CardContent className="p-6">
              <h2 className="text-xl font-medium text-gray-800 mb-6 flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-[#4400CC]" />
                Dados da Empresa
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nome" className="text-gray-700">
                    Nome completo
                  </Label>
                  <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="border-[#4400CC]/30 focus-visible:ring-[#4400CC]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">
                    E-mail (meio de acesso)
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled
                    className="border-[#4400CC]/30 focus-visible:ring-[#4400CC] bg-gray-50"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button
                  onClick={handleSalvar}
                  disabled={isUpdating || isLoading}
                  className="bg-[#4400CC] hover:bg-[#3300AA] text-white shadow-[0_0_10px_rgba(68,0,204,0.2)] disabled:opacity-50"
                >
                  <Save size={16} className="mr-2" />
                  {isUpdating ? 'Salvando...' : 'Salvar alterações'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Configurações de Suporte */}
          <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)]">
            <CardContent className="p-6">
              <h2 className="text-xl font-medium text-gray-800 mb-6 flex items-center">
                <MessageCircle className="w-5 h-5 mr-2 text-[#4400CC]" />
                Contatos de Suporte
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Esses contatos serão exibidos nas páginas de ajuda para candidatos e empregadores
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email-suporte" className="text-gray-700 flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-[#4400CC]" />
                    E-mail de suporte
                  </Label>
                  <Input
                    id="email-suporte"
                    type="email"
                    value={emailSuporte}
                    onChange={(e) => setEmailSuporte(e.target.value)}
                    placeholder="suporte@empresa.com"
                    className="border-[#4400CC]/30 focus-visible:ring-[#4400CC]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp-suporte" className="text-gray-700 flex items-center">
                    <MessageCircle className="w-4 h-4 mr-2 text-[#25D366]" />
                    Número de suporte (WhatsApp)
                  </Label>
                  <Input
                    id="whatsapp-suporte"
                    value={whatsappSuporte}
                    onChange={(e) => setWhatsappSuporte(e.target.value)}
                    placeholder="5511999999999"
                    className="border-[#4400CC]/30 focus-visible:ring-[#4400CC]"
                  />
                  <p className="text-xs text-gray-500">Formato: código do país + DDD + número (sem espaços)</p>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button
                  onClick={handleSalvarSuporteSettings}
                  disabled={isSavingSupport || !emailSuporte || !whatsappSuporte}
                  className="bg-[#4400CC] hover:bg-[#3300AA] text-white shadow-[0_0_10px_rgba(68,0,204,0.2)] disabled:opacity-50"
                >
                  <Save size={16} className="mr-2" />
                  {isSavingSupport ? 'Salvando...' : 'Salvar configurações de suporte'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Alteração de Senha */}
          <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)]">
            <CardContent className="p-6">
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
                      className="border-[#4400CC]/30 focus-visible:ring-[#4400CC] pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full text-gray-500"
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
                      className="border-[#4400CC]/30 focus-visible:ring-[#4400CC] pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full text-gray-500"
                      onClick={() => setShowNovaSenha(!showNovaSenha)}
                    >
                      {showNovaSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                  </div>
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
                      className="border-[#4400CC]/30 focus-visible:ring-[#4400CC] pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full text-gray-500"
                      onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}
                    >
                      {showConfirmarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button
                  onClick={handleAlterarSenha}
                  disabled={isChangingPassword || !senhaAtual || !novaSenha || !confirmarSenha}
                  className="bg-[#4400CC] hover:bg-[#3300AA] text-white shadow-[0_0_10px_rgba(68,0,204,0.2)] disabled:opacity-50"
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
