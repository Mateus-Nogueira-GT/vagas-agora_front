"use client"

import { useState } from "react"
import { Building, Key, AlertTriangle, Save, Eye, EyeOff, Phone, MapPin, Upload, Search } from "lucide-react"
import Image from "next/image"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { uploadApiService } from "@/lib/api/upload-api"
import { useAuth } from "@/hooks/use-auth"
import { useEmpresas } from "@/hooks/use-empresas"
import { useConfiguracoes } from "@/hooks/use-configuracoes"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useEffect } from "react"
import { geocodingService } from "@/lib/services/geocoding-service"
import { ESTADOS_BRASIL, CIDADES_PRINCIPAIS, formatCEP, formatTelefone, filterCidades } from "@/lib/data/brazil-locations"
import { SETORES_EMPRESARIAIS } from "@/lib/data/setores-empresariais"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function EmployerSettings() {
  const { user } = useAuth()
  const {
    currentEmpresa,
    loading,
    updating,
    loadCurrentEmpresa,
    updateEmpresa,
  } = useEmpresas()

  const {
    alterarSenha,
    isChangingPassword,
    error: configError,
    clearError: clearConfigError
  } = useConfiguracoes()

  const [razaoSocial, setRazaoSocial] = useState("")
  const [nomeFantasia, setNomeFantasia] = useState("")
  const [email, setEmail] = useState("")
  const [cnpj, setCnpj] = useState("")
  const [telefone, setTelefone] = useState("")
  const [setor, setSetor] = useState("")
  const [descricao, setDescricao] = useState("")
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)

  // Campos de endereço separados
  const [cep, setCep] = useState("")
  const [logradouro, setLogradouro] = useState("")
  const [numero, setNumero] = useState("")
  const [complemento, setComplemento] = useState("")
  const [bairro, setBairro] = useState("")
  const [cidade, setCidade] = useState("")
  const [estado, setEstado] = useState("")
  const [latitude, setLatitude] = useState<number | undefined>()
  const [longitude, setLongitude] = useState<number | undefined>()
  const [isBuscandoCEP, setIsBuscandoCEP] = useState(false)

  // Estados para autocomplete de cidades
  const [cidadeBusca, setCidadeBusca] = useState("")
  const [cidadesSugestoes, setCidadesSugestoes] = useState<string[]>([])
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false)

  const [senhaAtual, setSenhaAtual] = useState("")
  const [novaSenha, setNovaSenha] = useState("")
  const [confirmarSenha, setConfirmarSenha] = useState("")
  const [showSenhaAtual, setShowSenhaAtual] = useState(false)
  const [showNovaSenha, setShowNovaSenha] = useState(false)
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false)

  // Load empresa data on mount
  useEffect(() => {
    if (user?.id && user.role === 'empregador') {
      loadCurrentEmpresa()
    }
  }, [user?.id, user?.role, loadCurrentEmpresa])

  // Update form data when empresa data loads
  useEffect(() => {
    if (currentEmpresa) {
      setRazaoSocial(currentEmpresa.razao_social || currentEmpresa.nome || '')
      setNomeFantasia(currentEmpresa.nome || '')
      setEmail(currentEmpresa.email || '')
      setCnpj(currentEmpresa.cnpj || '')
      setTelefone(currentEmpresa.telefone || '')
      setSetor(currentEmpresa.setor || '')
      setDescricao(currentEmpresa.descricao || '')
      setLogoUrl(currentEmpresa.logo_url || null)

      // Carregar dados de endereço se existirem
      if (currentEmpresa.endereco) {
        setCep(currentEmpresa.endereco.cep || '')
        setLogradouro(currentEmpresa.endereco.logradouro || '')
        setNumero(currentEmpresa.endereco.numero || '')
        setComplemento(currentEmpresa.endereco.complemento || '')
        setBairro(currentEmpresa.endereco.bairro || '')
        setCidade(currentEmpresa.endereco.cidade || '')
        setCidadeBusca(currentEmpresa.endereco.cidade || '')
        setEstado(currentEmpresa.endereco.estado || '')
        setLatitude(currentEmpresa.endereco.latitude)
        setLongitude(currentEmpresa.endereco.longitude)
      }
    }
  }, [currentEmpresa])

  // Atualizar sugestões quando estado ou busca mudar
  useEffect(() => {
    if (estado && cidadeBusca) {
      const sugestoes = filterCidades(estado, cidadeBusca, 15)
      setCidadesSugestoes(sugestoes)
    } else if (estado) {
      // Mostrar primeiras cidades se não houver busca
      setCidadesSugestoes(CIDADES_PRINCIPAIS[estado]?.slice(0, 15) || [])
    } else {
      setCidadesSugestoes([])
    }
  }, [estado, cidadeBusca])

  // Show error toast when configError changes
  useEffect(() => {
    if (configError) {
      toast.error(configError)
      clearConfigError()
    }
  }, [configError, clearConfigError])

  const handleBuscarCEP = async () => {
    if (!cep || cep.replace(/\D/g, '').length !== 8) {
      toast.error('CEP inválido')
      return
    }

    setIsBuscandoCEP(true)

    try {
      // Mostrar toast informativo se houver fila
      const queueSize = geocodingService.getQueueSize()
      if (queueSize > 0) {
        toast.loading(`Aguardando na fila... (${queueSize} na frente)`, { duration: 2000 })
      }

      const result = await geocodingService.getFullAddressByCEP(cep, numero)

      if (result.success && result.address) {
        const addr = result.address
        setLogradouro(addr.logradouro || '')
        setBairro(addr.bairro || '')
        setCidade(addr.cidade)
        setEstado(addr.estado)
        setLatitude(addr.latitude)
        setLongitude(addr.longitude)

        if (addr.latitude && addr.longitude) {
          toast.success('Endereço encontrado com localização!')
        } else {
          toast.success('Endereço encontrado!')
        }
      } else {
        toast.error(result.error || 'CEP não encontrado')
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
      toast.error('Erro ao buscar CEP')
    } finally {
      setIsBuscandoCEP(false)
    }
  }

  const handleBuscarCoordenadas = async () => {
    if (!cidade || !estado) {
      toast.error('Preencha cidade e estado primeiro')
      return
    }

    try {
      // Mostrar toast informativo se houver fila
      const queueSize = geocodingService.getQueueSize()
      if (queueSize > 0) {
        toast.loading(`Aguardando na fila... (${queueSize} requisição(ões) na frente)`, { duration: 2000 })
      } else {
        toast.loading('Buscando localização...', { duration: 1000 })
      }

      const result = await geocodingService.getCityCoordinates(cidade, estado)

      if (result.success && result.latitude && result.longitude) {
        setLatitude(result.latitude)
        setLongitude(result.longitude)
        toast.success('Localização encontrada!')
      } else {
        toast.error('Não foi possível encontrar as coordenadas')
      }
    } catch (error) {
      console.error('Erro ao buscar coordenadas:', error)
      toast.error('Erro ao buscar localização')
    }
  }

  const handleCidadeChange = (value: string) => {
    setCidadeBusca(value)
    setMostrarSugestoes(true)
  }

  const handleCidadeSelect = (cidadeSelecionada: string) => {
    setCidade(cidadeSelecionada)
    setCidadeBusca(cidadeSelecionada)
    setMostrarSugestoes(false)
    // Limpar coordenadas ao mudar cidade
    setLatitude(undefined)
    setLongitude(undefined)
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user?.id || !currentEmpresa) return

    setIsUploadingLogo(true)

    try {
      // Upload do logo para o Supabase Storage
      const uploadResult = await uploadApiService.uploadCompanyLogo(user.id, file)

      // Atualizar preview local
      setLogoUrl(uploadResult.url)

      // Salvar automaticamente no banco de dados
      const result = await updateEmpresa({
        id: currentEmpresa.id,
        logo_url: uploadResult.url
      })

      if (result.success) {
        toast.success('Logo enviado e salvo com sucesso!')
      } else {
        toast.error('Logo enviado mas erro ao salvar no banco')
      }
    } catch (error: unknown) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao enviar logo')
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const handleSalvar = async () => {
    if (!currentEmpresa) {
      toast.error('Dados da empresa não encontrados')
      return
    }

    // Montar objeto de endereço
    const enderecoData = cidade && estado ? {
      cep,
      logradouro,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      latitude,
      longitude
    } : undefined

    // Validar setor obrigatório
    if (!setor) {
      toast.error('Setor de atuação é obrigatório')
      return
    }

    try {
      const result = await updateEmpresa({
        id: currentEmpresa.id,
        razao_social: razaoSocial,
        nome: nomeFantasia,
        cnpj: cnpj,
        telefone: telefone,
        setor: setor,
        descricao: descricao || undefined,
        logo_url: logoUrl || undefined,
        endereco: enderecoData
      })

      if (result.success) {
        toast.success('Informações salvas com sucesso!')
      } else {
        console.error('Erro detalhado:', result.errors)
        toast.error(`Erro ao salvar: ${Object.values(result.errors || {}).join(', ')}`)
      }
    } catch (error) {
      console.error('Exception no save:', error)
      toast.error(`Erro ao salvar as informações: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
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
    // TODO: Implementar desativação de conta
    toast.success("Conta desativada com sucesso!")
  }

  const handleExcluir = async () => {
    // TODO: Implementar exclusão de conta
    toast.success("Conta excluída com sucesso!")
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['empregador']}>
        <div className="w-full pb-16">
          <div className="flex min-h-[136px] flex-col justify-center bg-gradient-to-r from-[#4400CC] to-[#00FFAE] px-4 py-6 shadow-[0_0_20px_rgba(68,0,204,0.3)] sm:px-6 md:min-h-[160px] md:px-10">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">Configurações</h1>
            <p className="text-base md:text-lg text-white/80 mt-2">Carregando...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={['empregador']}>
      <div className="w-full pb-16">
        {/* Banner com gradiente roxo-azul neon */}
        <div className="flex min-h-[136px] flex-col justify-center bg-gradient-to-r from-[#4400CC] to-[#00FFAE] px-4 py-6 shadow-[0_0_20px_rgba(68,0,204,0.3)] sm:px-6 md:min-h-[160px] md:px-10">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">Configurações</h1>
          <p className="text-base md:text-lg text-white/80 mt-2">Gerencie as informações da sua empresa</p>
        </div>

        <div className="mt-6 px-4 sm:px-6 md:mt-8 md:px-10">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Dados da Empresa */}
            <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)]">
              <CardContent className="p-4 sm:p-6">
                <h2 className="text-xl font-medium text-gray-800 mb-6 flex items-center">
                  <Building className="w-5 h-5 mr-2 text-[#4400CC]" />
                  Dados da Empresa
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4 md:col-span-2">
                    <Label className="text-gray-700">Logo da empresa</Label>
                    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                      <div className="w-24 h-24 rounded-lg bg-gray-100 overflow-hidden border border-[#4400CC]/30 flex items-center justify-center relative">
                        {logoUrl ? (
                          <Image
                            src={logoUrl}
                            alt="Logo da empresa"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <Building size={32} className="text-gray-400" />
                        )}
                      </div>
                      <div>
                        <label htmlFor="logo-upload" className={`cursor-pointer ${isUploadingLogo ? 'pointer-events-none' : ''}`}>
                          <div className={`flex items-center gap-2 bg-[#4400CC]/10 hover:bg-[#4400CC]/20 text-[#4400CC] px-4 py-2 rounded-md ${isUploadingLogo ? 'opacity-50' : ''}`}>
                            <Upload size={16} />
                            <span>{isUploadingLogo ? 'Enviando...' : 'Carregar logo'}</span>
                          </div>
                          <input
                            type="file"
                            id="logo-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            disabled={isUploadingLogo}
                          />
                        </label>
                        <p className="text-xs text-gray-500 mt-2">Recomendado: PNG, JPG. Máx 5MB</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="razao-social" className="text-gray-700">
                      Razão Social
                    </Label>
                    <Input
                      id="razao-social"
                      autoComplete="organization"
                      value={razaoSocial}
                      onChange={(e) => setRazaoSocial(e.target.value)}
                      className="border-[#4400CC]/30 focus-visible:ring-[#4400CC]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nome-fantasia" className="text-gray-700">
                      Nome Fantasia
                    </Label>
                    <Input
                      id="nome-fantasia"
                      autoComplete="organization"
                      value={nomeFantasia}
                      onChange={(e) => setNomeFantasia(e.target.value)}
                      className="border-[#4400CC]/30 focus-visible:ring-[#4400CC]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700">
                      E-mail
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={email}
                      disabled
                      className="border-[#4400CC]/30 focus-visible:ring-[#4400CC] bg-gray-100 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500">O e-mail não pode ser alterado</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cnpj" className="text-gray-700">
                      CNPJ
                    </Label>
                    <Input
                      id="cnpj"
                      inputMode="numeric"
                      value={cnpj}
                      onChange={(e) => setCnpj(e.target.value)}
                      className="border-[#4400CC]/30 focus-visible:ring-[#4400CC]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="setor" className="text-gray-700">
                      Setor de Atuação *
                    </Label>
                    <Select value={setor} onValueChange={setSetor}>
                      <SelectTrigger className="border-[#4400CC]/30 focus:ring-[#4400CC]">
                        <SelectValue placeholder="Selecione o setor" />
                      </SelectTrigger>
                      <SelectContent>
                        {SETORES_EMPRESARIAIS.map((setorItem) => (
                          <SelectItem key={setorItem} value={setorItem}>
                            {setorItem}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone" className="text-gray-700">
                      Telefone
                    </Label>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-500" />
                      <Input
                        id="telefone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        value={telefone}
                        onChange={(e) => setTelefone(formatTelefone(e.target.value))}
                        placeholder="(00) 00000-0000"
                        className="border-[#4400CC]/30 focus-visible:ring-[#4400CC]"
                      />
                    </div>
                  </div>

                  {/* Sobre a Empresa */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="descricao" className="text-gray-700">
                      Sobre a Empresa
                    </Label>
                    <Textarea
                      id="descricao"
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                      placeholder="Conte um pouco sobre a empresa, cultura, valores e missão..."
                      className="border-[#4400CC]/30 focus-visible:ring-[#4400CC] min-h-[120px]"
                    />
                    <p className="text-xs text-gray-500">Esta informação será exibida nas vagas publicadas pela empresa</p>
                  </div>

                  {/* Seção de Endereço */}
                  <div className="md:col-span-2 pt-4 border-t border-gray-200">
                    <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-[#4400CC]" />
                      Endereço
                    </h3>
                  </div>

                  {/* CEP */}
                  <div className="space-y-2">
                    <Label htmlFor="cep" className="text-gray-700">
                      CEP
                    </Label>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Input
                        id="cep"
                        inputMode="numeric"
                        autoComplete="postal-code"
                        value={cep}
                        onChange={(e) => setCep(formatCEP(e.target.value))}
                        placeholder="00000-000"
                        maxLength={9}
                        className="border-[#4400CC]/30 focus-visible:ring-[#4400CC]"
                      />
                      <Button
                        type="button"
                        onClick={handleBuscarCEP}
                        disabled={isBuscandoCEP || !cep}
                        variant="outline"
                        className="w-full border-[#4400CC]/30 text-[#4400CC] sm:w-auto"
                      >
                        <Search size={16} className="mr-2" />
                        {isBuscandoCEP ? 'Buscando...' : 'Buscar'}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">Digite o CEP e clique em Buscar para preencher automaticamente</p>
                  </div>

                  {/* Logradouro */}
                  <div className="space-y-2 md:col-span-1">
                    <Label htmlFor="logradouro" className="text-gray-700">
                      Logradouro
                    </Label>
                    <Input
                      id="logradouro"
                      autoComplete="street-address"
                      value={logradouro}
                      onChange={(e) => setLogradouro(e.target.value)}
                      placeholder="Rua, Avenida, etc"
                      className="border-[#4400CC]/30 focus-visible:ring-[#4400CC]"
                    />
                  </div>

                  {/* Número */}
                  <div className="space-y-2">
                    <Label htmlFor="numero" className="text-gray-700">
                      Número
                    </Label>
                    <Input
                      id="numero"
                      inputMode="numeric"
                      autoComplete="address-line2"
                      value={numero}
                      onChange={(e) => setNumero(e.target.value)}
                      placeholder="123"
                      className="border-[#4400CC]/30 focus-visible:ring-[#4400CC]"
                    />
                  </div>

                  {/* Complemento */}
                  <div className="space-y-2">
                    <Label htmlFor="complemento" className="text-gray-700">
                      Complemento
                    </Label>
                    <Input
                      id="complemento"
                      value={complemento}
                      onChange={(e) => setComplemento(e.target.value)}
                      placeholder="Sala, Andar, etc (opcional)"
                      className="border-[#4400CC]/30 focus-visible:ring-[#4400CC]"
                    />
                  </div>

                  {/* Bairro */}
                  <div className="space-y-2">
                    <Label htmlFor="bairro" className="text-gray-700">
                      Bairro
                    </Label>
                    <Input
                      id="bairro"
                      value={bairro}
                      onChange={(e) => setBairro(e.target.value)}
                      placeholder="Centro, Jardim, etc"
                      className="border-[#4400CC]/30 focus-visible:ring-[#4400CC]"
                    />
                  </div>

                  {/* Estado */}
                  <div className="space-y-2">
                    <Label htmlFor="estado" className="text-gray-700">
                      Estado
                    </Label>
                    <Select value={estado} onValueChange={setEstado}>
                      <SelectTrigger className="border-[#4400CC]/30 focus:ring-[#4400CC]">
                        <SelectValue placeholder="Selecione o estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {ESTADOS_BRASIL.map((uf) => (
                          <SelectItem key={uf.sigla} value={uf.sigla}>
                            {uf.nome} ({uf.sigla})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Cidade */}
                  <div className="space-y-2 relative">
                    <Label htmlFor="cidade" className="text-gray-700">
                      Cidade
                    </Label>
                    <Input
                      id="cidade"
                      value={cidadeBusca}
                      onChange={(e) => handleCidadeChange(e.target.value)}
                      onFocus={() => setMostrarSugestoes(true)}
                      onBlur={() => setTimeout(() => setMostrarSugestoes(false), 200)}
                      placeholder={estado ? "Digite para buscar..." : "Selecione o estado primeiro"}
                      disabled={!estado}
                      className="border-[#4400CC]/30 focus-visible:ring-[#4400CC]"
                    />
                    {mostrarSugestoes && estado && cidadesSugestoes.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {cidadesSugestoes.map((cidadeSugestao, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleCidadeSelect(cidadeSugestao)}
                            className="min-h-11 w-full cursor-pointer px-4 py-2 text-left transition-colors hover:bg-[#4400CC]/10"
                          >
                            {cidadeSugestao}
                          </button>
                        ))}
                      </div>
                    )}
                    {estado && cidadesSugestoes.length === 0 && cidadeBusca && (
                      <p className="text-xs text-gray-500 mt-1">
                        Nenhuma cidade encontrada. Tente outra busca.
                      </p>
                    )}
                  </div>

                  {/* Botão para buscar coordenadas manualmente */}
                  {cidade && estado && !latitude && (
                    <div className="md:col-span-2">
                      <Button
                        type="button"
                        onClick={handleBuscarCoordenadas}
                        variant="outline"
                        size="sm"
                        className="border-[#4400CC]/30 text-[#4400CC]"
                      >
                        <MapPin size={16} className="mr-2" />
                        Buscar localização da cidade
                      </Button>
                    </div>
                  )}

                  {/* Mostrar sucesso na validação de coordenadas */}
                  {latitude && longitude && cidade && estado && (
                    <div className="md:col-span-2 bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-800 flex items-center">
                        <MapPin size={16} className="mr-2" />
                        Localização encontrada com sucesso!
                      </p>
                    </div>
                  )}
                </div>
                <div className="mt-6 flex justify-stretch sm:justify-end">
                  <Button
                    onClick={handleSalvar}
                    disabled={updating}
                    className="w-full bg-[#4400CC] text-white shadow-[0_0_10px_rgba(68,0,204,0.2)] hover:bg-[#3300AA] sm:w-auto"
                  >
                    <Save size={16} className="mr-2" />
                    {updating ? 'Salvando...' : 'Salvar alterações'}
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
                        autoComplete="current-password"
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
                        autoComplete="new-password"
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
                        autoComplete="new-password"
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
                <div className="mt-6 flex justify-stretch sm:justify-end">
                  <Button
                    onClick={handleAlterarSenha}
                    disabled={isChangingPassword || !senhaAtual || !novaSenha || !confirmarSenha}
                    className="w-full bg-[#4400CC] text-white shadow-[0_0_10px_rgba(68,0,204,0.2)] hover:bg-[#3300AA] disabled:opacity-50 sm:w-auto"
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
                <CardContent className="p-4 sm:p-6">
                  <h2 className="text-xl font-medium text-gray-800 mb-6 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                    Gerenciamento de Conta
                  </h2>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-4 rounded-lg border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="font-medium text-gray-800">Desativar conta</h3>
                        <p className="text-sm text-gray-600">
                          Sua empresa ficará invisível e você não receberá notificações
                        </p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" className="border-amber-500 text-amber-600 hover:bg-amber-50">
                            Desativar
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

                    <div className="flex flex-col gap-4 rounded-lg border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="font-medium text-gray-800">Excluir conta</h3>
                        <p className="text-sm text-gray-600">
                          Todos os dados da sua empresa serão removidos permanentemente
                        </p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-50">
                            Excluir
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir conta permanentemente</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. Isso excluirá permanentemente sua conta e removerá todos os
                              dados da sua empresa de nossos servidores.
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
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
