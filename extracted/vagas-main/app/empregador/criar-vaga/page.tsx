"use client"

import { useState, useEffect } from "react"
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  Building,
  CheckCircle,
  Mail,
  Phone,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrencyInput, parseCurrency } from "@/lib/utils/currency"
import { formatarTelefone, limparTelefone } from "@/lib/utils/format-phone"
import { useVagas } from "@/hooks/use-vagas"
import { useEmpresas } from "@/hooks/use-empresas"
import { CreateVagaRequest, UpdateVagaRequest, type NivelExperiencia } from "@/lib/vagas/vagas-types"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { geocodingService } from "@/lib/services/geocoding-service"
import { ESTADOS_BRASIL, CIDADES_PRINCIPAIS, filterCidades } from "@/lib/data/brazil-locations"
import toast from "react-hot-toast"
import LanguageManager, { type Idioma } from "@/components/form/language-manager"

interface VagaFormProps {
  vagaId?: string
}

type VagaFormData = Omit<CreateVagaRequest, 'nivel'> & {
  id?: string
  empresa_nome: string
  nivel: NivelExperiencia | ''
}

export default function CriarVaga({ vagaId }: VagaFormProps = {}) {
  const router = useRouter()
  const { createVaga, updateVaga, loadVagaById, currentVaga, isLoading, error, clearError } = useVagas()
  const { currentEmpresa, loadCurrentEmpresa, loading: empresaLoading } = useEmpresas()

  const isEditing = !!vagaId

  // Form state - MUST be declared before useEffect hooks that reference it
  const [formData, setFormData] = useState<VagaFormData>({
    titulo: "",
    descricao: "",
    empresa_nome: "",
    cidade: "",
    estado: "",
    localizacao: "",
    nivel: "",
    tipo_contratacao: "",
    modelo_trabalho: "",
    area_atuacao: "",
    responsabilidades: [],
    requisitos: [],
    diferenciais: [],
    beneficios: [],
    etapas_processo: [],
    sobre_empresa: "",
    salario_de: undefined,
    salario_ate: undefined,
    contato_email: "",
    contato_whatsapp: "",
    data_expiracao: (() => {
      // Define data de expiração padrão de 30 dias
      const defaultDate = new Date()
      defaultDate.setDate(defaultDate.getDate() + 30)
      return defaultDate.toISOString().split('T')[0]
    })(),
    remoto: false,
    num_vagas: 1,
    status: 'Rascunho'
  })

  // Estados para valores formatados dos inputs de salário
  const [salarioDeFormatado, setSalarioDeFormatado] = useState<string>('')
  const [salarioAteFormatado, setSalarioAteFormatado] = useState<string>('')

  // Estados para localização (declarar ANTES dos useEffect)
  const [usarEnderecoEmpresa, setUsarEnderecoEmpresa] = useState(true)
  const [latitude, setLatitude] = useState<number | undefined>()
  const [longitude, setLongitude] = useState<number | undefined>()
  const [buscandoCoordenadas, setBuscandoCoordenadas] = useState(false)

  // Estados para autocomplete de cidades
  const [cidadeBusca, setCidadeBusca] = useState("")
  const [cidadesSugestoes, setCidadesSugestoes] = useState<string[]>([])
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false)

  // Função para buscar coordenadas automaticamente (MUST be declared before useEffect)
  const buscarCoordenadasCidade = async (cidade: string, estado: string) => {
    if (!cidade || !estado) return

    setBuscandoCoordenadas(true)

    try {
      const result = await geocodingService.getCityCoordinates(cidade, estado)

      if (result.success && result.latitude && result.longitude) {
        setLatitude(result.latitude)
        setLongitude(result.longitude)
      }
    } catch (error) {
      console.error('Erro ao buscar coordenadas:', error)
    } finally {
      setBuscandoCoordenadas(false)
    }
  }

  // Load empresa data on component mount
  useEffect(() => {
    loadCurrentEmpresa()
  }, [loadCurrentEmpresa])

  // Load vaga data if editing
  useEffect(() => {
    if (isEditing && vagaId) {
      loadVagaById(vagaId)
    }
  }, [isEditing, vagaId, loadVagaById])

  // Update form data with empresa information when loaded (only if not editing)
  useEffect(() => {
    if (currentEmpresa && !isEditing) {
      setFormData(prev => ({
        ...prev,
        empresa_nome: currentEmpresa.nome || "",
        sobre_empresa: currentEmpresa.descricao || "",
        cidade: currentEmpresa.endereco?.cidade || "",
        estado: currentEmpresa.endereco?.estado || "",
        beneficios: currentEmpresa.beneficios || []
      }))

      // Set coordenadas se disponíveis
      if (currentEmpresa.endereco?.latitude && currentEmpresa.endereco?.longitude) {
        setLatitude(currentEmpresa.endereco.latitude)
        setLongitude(currentEmpresa.endereco.longitude)
      }

      // Set beneficios from empresa data
      if (currentEmpresa.beneficios && currentEmpresa.beneficios.length > 0) {
        setBeneficios(currentEmpresa.beneficios)
      }
    } else {
    }
  }, [currentEmpresa, isEditing])

  // Gerenciar checkbox "Usar endereço da empresa"
  useEffect(() => {
    if (usarEnderecoEmpresa && currentEmpresa?.endereco && !isEditing) {
      // Preencher com dados da empresa quando marcado
      setFormData(prev => ({
        ...prev,
        cidade: currentEmpresa.endereco?.cidade || "",
        estado: currentEmpresa.endereco?.estado || ""
      }))

      if (currentEmpresa.endereco?.latitude && currentEmpresa.endereco?.longitude) {
        setLatitude(currentEmpresa.endereco.latitude)
        setLongitude(currentEmpresa.endereco.longitude)
      } else if (currentEmpresa.endereco?.cidade && currentEmpresa.endereco?.estado) {
        // Buscar coordenadas se não tiver
        buscarCoordenadasCidade(currentEmpresa.endereco.cidade, currentEmpresa.endereco.estado)
      }
    } else if (!usarEnderecoEmpresa && !isEditing) {
      // Limpar campos quando desmarcado
      setFormData(prev => ({
        ...prev,
        cidade: "",
        estado: ""
      }))
      setLatitude(undefined)
      setLongitude(undefined)
      setCidadeBusca("")
    }
  }, [usarEnderecoEmpresa, currentEmpresa, isEditing])

  // Buscar coordenadas quando mudar cidade/estado (se não estiver usando endereço da empresa)
  useEffect(() => {
    if (!usarEnderecoEmpresa && formData.cidade && formData.estado && !isEditing) {
      buscarCoordenadasCidade(formData.cidade, formData.estado)
    }
  }, [formData.cidade, formData.estado, usarEnderecoEmpresa, isEditing])

  // Update form data with vaga information when loaded (only if editing)
  useEffect(() => {
    if (isEditing && currentVaga) {
      setFormData(prev => ({
        ...prev,
        titulo: currentVaga.titulo || "",
        descricao: currentVaga.descricao || "",
        empresa_nome: currentVaga.empresa?.nome || currentVaga.empresa_nome || "",
        cidade: currentVaga.cidade || "",
        estado: currentVaga.estado || "",
        localizacao: currentVaga.localizacao || "",
        nivel: currentVaga.nivel || "",
        tipo_contratacao: currentVaga.tipo_contratacao || "",
        modelo_trabalho: currentVaga.modelo_trabalho || "",
        area_atuacao: currentVaga.area_atuacao || "",
        responsabilidades: currentVaga.responsabilidades || [],
        requisitos: currentVaga.requisitos || [],
        diferenciais: currentVaga.diferenciais || [],
        beneficios: currentVaga.beneficios || [],
        etapas_processo: currentVaga.etapas_processo || [],
        sobre_empresa: currentVaga.empresa?.descricao || "",
        salario_de: currentVaga.salario_de,
        salario_ate: currentVaga.salario_ate,
        contato_email: currentVaga.contato_email || "",
        contato_whatsapp: currentVaga.contato_whatsapp || "",
        data_expiracao: currentVaga.data_expiracao ? new Date(currentVaga.data_expiracao).toISOString().split('T')[0] : undefined,
        remoto: currentVaga.remoto || false,
        num_vagas: currentVaga.num_vagas || 1
      }))

      // Update arrays
      setResponsabilidades(currentVaga.responsabilidades || [])
      setRequisitos(currentVaga.requisitos || [])
      setDiferenciais(currentVaga.diferenciais || [])
      setBeneficios(currentVaga.beneficios || [])
      setEtapasProcesso(currentVaga.etapas_processo || [])

      // Atualizar valores formatados dos salários
      if (currentVaga.salario_de) {
        setSalarioDeFormatado(formatCurrencyInput(currentVaga.salario_de.toString()))
      }
      if (currentVaga.salario_ate) {
        setSalarioAteFormatado(formatCurrencyInput(currentVaga.salario_ate.toString()))
      }

      // Atualizar WhatsApp formatado
      if (currentVaga.contato_whatsapp) {
        setWhatsappFormatado(formatarTelefone(currentVaga.contato_whatsapp))
      }
    }
  }, [currentVaga, isEditing])

  // Sincronizar cidadeBusca com formData.cidade
  useEffect(() => {
    if (formData.cidade) {
      setCidadeBusca(formData.cidade)
    }
  }, [formData.cidade])

  // Atualizar sugestões quando estado ou busca mudar
  useEffect(() => {
    if (formData.estado && cidadeBusca) {
      const sugestoes = filterCidades(formData.estado, cidadeBusca, 15)
      setCidadesSugestoes(sugestoes)
    } else if (formData.estado) {
      // Mostrar primeiras cidades se não houver busca
      setCidadesSugestoes(CIDADES_PRINCIPAIS[formData.estado]?.slice(0, 15) || [])
    } else {
      setCidadesSugestoes([])
    }
  }, [formData.estado, cidadeBusca])

  const [responsabilidades, setResponsabilidades] = useState<string[]>([])
  const [novaResponsabilidade, setNovaResponsabilidade] = useState("")

  const [requisitos, setRequisitos] = useState<string[]>([])
  const [novoRequisito, setNovoRequisito] = useState("")

  const [diferenciais, setDiferenciais] = useState<string[]>([])
  const [novoDiferencial, setNovoDiferencial] = useState("")

  const [beneficios, setBeneficios] = useState<string[]>([])
  const [novoBeneficio, setNovoBeneficio] = useState("")

  const [etapasProcesso, setEtapasProcesso] = useState<string[]>([])
  const [novaEtapa, setNovaEtapa] = useState("")

  const [idiomas, setIdiomas] = useState<Idioma[]>([
    { idioma: "Português", nivel: "nativo" }
  ])

  const [activeTab, setActiveTab] = useState("informacoes")

  // Estado para WhatsApp formatado
  const [whatsappFormatado, setWhatsappFormatado] = useState("")

  // Estado para erros de validação
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Validação por etapas
  const validateStep = (step: string): boolean => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 'informacoes':
        // Validações da aba de informações básicas
        if (!formData.titulo?.trim()) {
          newErrors.titulo = 'Título da vaga é obrigatório'
        } else if (formData.titulo.trim().length < 5) {
          newErrors.titulo = 'Título deve ter pelo menos 5 caracteres'
        }

        if (!formData.empresa_nome?.trim()) {
          newErrors.empresa_nome = 'Nome da empresa é obrigatório'
        }

        if (!formData.descricao?.trim()) {
          newErrors.descricao = 'Descrição da vaga é obrigatória'
        } else if (formData.descricao.trim().length < 50) {
          newErrors.descricao = 'Descrição deve ter pelo menos 50 caracteres'
        }

        if (responsabilidades.length === 0) {
          newErrors.responsabilidades = 'Adicione pelo menos uma responsabilidade'
        }

        if (!formData.estado?.trim()) {
          newErrors.estado = 'Estado é obrigatório'
        }

        if (!formData.cidade?.trim()) {
          newErrors.cidade = 'Cidade é obrigatória'
        }

        if (!formData.nivel?.trim()) {
          newErrors.nivel = 'Nível de experiência é obrigatório'
        }

        if (!formData.num_vagas || formData.num_vagas < 1) {
          newErrors.num_vagas = 'Número de vagas deve ser pelo menos 1'
        } else if (formData.num_vagas > 100) {
          newErrors.num_vagas = 'Número de vagas não pode exceder 100'
        }
        break

      case 'requisitos':
        // Validações da aba de requisitos
        if (requisitos.length === 0) {
          newErrors.requisitos = 'Adicione pelo menos um requisito'
        }
        break

      case 'detalhes':
        // Validações da aba de detalhes
        if (!formData.area_atuacao?.trim()) {
          newErrors.area_atuacao = 'Área de atuação é obrigatória'
        }

        if (!formData.tipo_contratacao?.trim()) {
          newErrors.tipo_contratacao = 'Tipo de contratação é obrigatório'
        }

        if (!formData.modelo_trabalho?.trim()) {
          newErrors.modelo_trabalho = 'Modelo de trabalho é obrigatório'
        }

        // Validação de email (se fornecido)
        if (formData.contato_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contato_email)) {
          newErrors.contato_email = 'E-mail inválido'
        }

        // Validação de salário (se preenchido)
        if (formData.salario_de && formData.salario_ate && formData.salario_de > formData.salario_ate) {
          newErrors.salario = 'Salário mínimo não pode ser maior que o máximo'
        }

        if (formData.salario_de && formData.salario_de < 0) {
          newErrors.salario = 'Salário não pode ser negativo'
        }

        if (formData.salario_ate && formData.salario_ate < 0) {
          newErrors.salario = 'Salário não pode ser negativo'
        }

        if (formData.salario_de && formData.salario_de < 500) {
          newErrors.salario = 'Salário deve ser pelo menos R$ 500'
        }
        break

      case 'configuracoes':
        // Validações da aba de configurações
        if (!formData.data_expiracao) {
          newErrors.data_expiracao = 'Data de expiração é obrigatória'
        } else {
          const expirationDate = new Date(formData.data_expiracao)
          const today = new Date()
          today.setHours(0, 0, 0, 0) // Reset time to start of day
          
          if (expirationDate < today) {
            newErrors.data_expiracao = 'Data de expiração deve ser futura'
          }
        }
        break
    }

    // Atualiza apenas os erros da etapa atual
    setErrors(prev => ({ ...prev, ...newErrors }))
    return Object.keys(newErrors).length === 0
  }

  // Função de validação completa (para o envio final)
  const validateForm = (): boolean => {
    const steps = ['informacoes', 'requisitos', 'detalhes', 'configuracoes']
    let isValid = true

    // Limpa erros anteriores
    setErrors({})

    // Valida cada etapa
    steps.forEach(step => {
      if (!validateStep(step)) {
        isValid = false
      }
    })

    return isValid
  }

  // Limpar erro quando campo for alterado
  const clearFieldError = (fieldName: string) => {
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
    }
  }

  // Função para navegar para a próxima aba com validação
  const goToNextTab = () => {
    const tabOrder = ['informacoes', 'requisitos', 'detalhes', 'configuracoes']
    const currentIndex = tabOrder.indexOf(activeTab)
    
    // Valida a aba atual antes de prosseguir
    if (validateStep(activeTab)) {
      if (currentIndex < tabOrder.length - 1) {
        setActiveTab(tabOrder[currentIndex + 1])
      }
    } else {
      // Se houver erros, rola para o primeiro campo com erro
      setTimeout(() => {
        const firstError = document.querySelector('.border-red-500')
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 100)
    }
  }

  // Função para navegar para a aba anterior
  const goToPreviousTab = () => {
    const tabOrder = ['informacoes', 'requisitos', 'detalhes', 'configuracoes']
    const currentIndex = tabOrder.indexOf(activeTab)
    
    if (currentIndex > 0) {
      setActiveTab(tabOrder[currentIndex - 1])
    }
  }

  // Função para verificar se uma aba tem erros
  const hasTabErrors = (tab: string): boolean => {
    const tabErrors: Record<string, string[]> = {
      'informacoes': ['titulo', 'empresa_nome', 'descricao', 'responsabilidades', 'localizacao', 'nivel', 'num_vagas'],
      'requisitos': ['requisitos'],
      'detalhes': ['tipo_contratacao', 'modelo_trabalho', 'salario'],
      'configuracoes': ['data_expiracao']
    }

    return tabErrors[tab]?.some(field => errors[field]) || false
  }

  const adicionarResponsabilidade = () => {
    if (novaResponsabilidade.trim() !== "" && !responsabilidades.includes(novaResponsabilidade.trim())) {
      setResponsabilidades([...responsabilidades, novaResponsabilidade.trim()])
      setNovaResponsabilidade("")
      clearFieldError('responsabilidades')
    }
  }

  const removerResponsabilidade = (responsabilidade: string) => {
    setResponsabilidades(responsabilidades.filter((r) => r !== responsabilidade))
  }

  const adicionarRequisito = () => {
    if (novoRequisito.trim() !== "" && !requisitos.includes(novoRequisito.trim())) {
      setRequisitos([...requisitos, novoRequisito.trim()])
      setNovoRequisito("")
      clearFieldError('requisitos')
    }
  }

  const removerRequisito = (requisito: string) => {
    setRequisitos(requisitos.filter((r) => r !== requisito))
  }

  const adicionarDiferencial = () => {
    if (novoDiferencial.trim() !== "" && !diferenciais.includes(novoDiferencial.trim())) {
      setDiferenciais([...diferenciais, novoDiferencial.trim()])
      setNovoDiferencial("")
    }
  }

  const removerDiferencial = (diferencial: string) => {
    setDiferenciais(diferenciais.filter((d) => d !== diferencial))
  }

  const adicionarBeneficio = () => {
    if (novoBeneficio.trim() !== "" && !beneficios.includes(novoBeneficio.trim())) {
      setBeneficios([...beneficios, novoBeneficio.trim()])
      setNovoBeneficio("")
    }
  }

  const removerBeneficio = (beneficio: string) => {
    setBeneficios(beneficios.filter((b) => b !== beneficio))
  }

  const adicionarEtapa = () => {
    if (novaEtapa.trim() !== "" && !etapasProcesso.includes(novaEtapa.trim())) {
      setEtapasProcesso([...etapasProcesso, novaEtapa.trim()])
      setNovaEtapa("")
    }
  }

  const removerEtapa = (etapa: string) => {
    setEtapasProcesso(etapasProcesso.filter((e) => e !== etapa))
  }


  // Handlers para autocomplete de cidade
  const handleCidadeChange = (value: string) => {
    setCidadeBusca(value)
    setMostrarSugestoes(true)
  }

  const handleCidadeSelect = (cidadeSelecionada: string) => {
    handleInputChange('cidade', cidadeSelecionada)
    setCidadeBusca(cidadeSelecionada)
    setMostrarSugestoes(false)
    // Limpar coordenadas ao mudar cidade
    setLatitude(undefined)
    setLongitude(undefined)
  }

  // Form handlers
  const handleInputChange = (field: keyof VagaFormData, value: VagaFormData[keyof VagaFormData]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Limpar erro do campo quando usuário começar a digitar
    clearFieldError(field as string)
  }

  const handleSalvarVaga = async () => {
    // Validar formulário antes de prosseguir
    if (!validateForm()) {
      
      // Scroll para o primeiro erro
      const firstErrorField = Object.keys(errors)[0]
      const errorElement = document.getElementById(firstErrorField)
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        errorElement.focus()
      }
      
      return
    }

    setIsSubmitting(true)
    
    // Clear any previous errors
    clearError()

    try {
      const { empresa_nome: _empresaNome, id: _formId, ...requestFields } = formData

      if (isEditing && vagaId) {
        // Update existing vaga
        const vagaData: UpdateVagaRequest = {
          id: vagaId,
          ...requestFields,
          nivel: formData.nivel || undefined,
          responsabilidades,
          requisitos,
          diferenciais,
          beneficios,
          etapas_processo: etapasProcesso,
          salario_de: formData.salario_de ? Number(formData.salario_de) : undefined,
          salario_ate: formData.salario_ate ? Number(formData.salario_ate) : undefined,
          latitude,
          longitude,
        }

        if (formData.data_expiracao) {
          vagaData.data_expiracao = new Date(formData.data_expiracao).toISOString()
        }

        
        const success = await updateVaga(vagaData)
        
        if (success) {
          router.push(`/empregador/vagas/${vagaId}`)
        } else {
        }
      } else {
        // Create new vaga
        const vagaData: CreateVagaRequest = {
          ...requestFields,
          nivel: formData.nivel || undefined,
          responsabilidades,
          requisitos,
          diferenciais,
          beneficios,
          etapas_processo: etapasProcesso,
          salario_de: formData.salario_de ? Number(formData.salario_de) : undefined,
          salario_ate: formData.salario_ate ? Number(formData.salario_ate) : undefined,
          latitude,
          longitude,
        }

        if (formData.data_expiracao) {
          vagaData.data_expiracao = new Date(formData.data_expiracao).toISOString()
        }

        
        const success = await createVaga(vagaData)
        
        if (success) {
          router.push('/empregador/vagas')
        } else {
        }
      }
    } catch (error) {
      console.error('❌ Erro inesperado ao salvar vaga:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSalvarRascunho = async () => {
    // For now, we'll save as an active job but could add a status field later
    await handleSalvarVaga()
  }

  return (
    <ProtectedRoute allowedRoles={['empregador']}>
      <div className="w-full pb-10">
        {/* Error display */}
        {error && (
          <div className="px-4 pt-4 sm:px-6 md:px-10">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
              <Button 
                onClick={clearError}
                variant="outline" 
                size="sm" 
                className="mt-2"
              >
                Fechar
              </Button>
            </div>
          </div>
        )}

        {/* Cabeçalho */}
      <div className="flex min-h-[136px] flex-col justify-center bg-gradient-to-r from-[#4400CC] to-[#00FFAE] px-4 py-6 shadow-[0_0_20px_rgba(68,0,204,0.3)] sm:px-6 md:min-h-[160px] md:px-10">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
          {isEditing ? `Editar Vaga: ${currentVaga?.titulo || 'Carregando...'}` : 'Criar nova vaga'}
        </h1>
        <p className="text-base md:text-lg text-white/80 mt-2">
          {isEditing ? 'Atualize as informações da sua vaga publicada' : 'Preencha as informações para publicar sua vaga'}
        </p>
      </div>

      {/* Breadcrumb */}
      <div className="flex min-w-0 items-center overflow-hidden px-4 py-4 text-sm sm:px-6 md:px-10">
        {isEditing ? (
          <>
            <Link href="/empregador/vagas" className="text-[#4400CC] hover:text-[#3300AA] hover:underline">
              Vagas
            </Link>
            <span className="mx-2 text-gray-400">›</span>
            <Link 
              href={`/empregador/vagas/${vagaId}`} 
              className="text-[#4400CC] hover:text-[#3300AA] hover:underline"
            >
              {currentVaga?.titulo || 'Vaga'}
            </Link>
            <span className="mx-2 text-gray-400">›</span>
            <span className="text-gray-600">Editar</span>
          </>
        ) : (
          <Link href="/empregador/vagas" className="text-[#4400CC] hover:text-[#3300AA] flex items-center">
            <ArrowLeft size={14} className="mr-1" />
            Voltar para Gerenciar Vagas
          </Link>
        )}
      </div>

      {/* Formulário */}
      <div className="relative z-10 px-4 sm:px-6 md:px-10">
        <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)]">
          <CardContent className="p-4 sm:p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="-mx-1 mb-6 overflow-x-auto px-1 pb-2" aria-label="Etapas do formulário da vaga">
              <TabsList className="flex h-auto w-max min-w-full justify-start gap-1 bg-[#4400CC]/5 p-1">
                <TabsTrigger 
                  value="informacoes" 
                  className={`min-h-11 min-w-[150px] flex-1 whitespace-nowrap ${hasTabErrors('informacoes') ? 'text-red-600 border-b-2 border-red-500' : ''}`}
                >
                  Informações básicas
                  {hasTabErrors('informacoes') && <span className="ml-1 text-red-500">•</span>}
                </TabsTrigger>
                <TabsTrigger 
                  value="requisitos"
                  className={`min-h-11 min-w-[120px] flex-1 whitespace-nowrap ${hasTabErrors('requisitos') ? 'text-red-600 border-b-2 border-red-500' : ''}`}
                >
                  Requisitos
                  {hasTabErrors('requisitos') && <span className="ml-1 text-red-500">•</span>}
                </TabsTrigger>
                <TabsTrigger 
                  value="detalhes"
                  className={`min-h-11 min-w-[145px] flex-1 whitespace-nowrap ${hasTabErrors('detalhes') ? 'text-red-600 border-b-2 border-red-500' : ''}`}
                >
                  Detalhes da vaga
                  {hasTabErrors('detalhes') && <span className="ml-1 text-red-500">•</span>}
                </TabsTrigger>
                <TabsTrigger 
                  value="configuracoes"
                  className={`min-h-11 min-w-[135px] flex-1 whitespace-nowrap ${hasTabErrors('configuracoes') ? 'text-red-600 border-b-2 border-red-500' : ''}`}
                >
                  Configurações
                  {hasTabErrors('configuracoes') && <span className="ml-1 text-red-500">•</span>}
                </TabsTrigger>
              </TabsList>
              </div>

              {/* Aba de Informações Básicas */}
              <TabsContent value="informacoes" className="space-y-6">
                <div>
                  <h2 className="text-xl font-medium text-[#4400CC] mb-4">Informações básicas da vaga</h2>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="titulo" className="text-base">
                        Título da vaga *
                      </Label>
                      <Input
                        id="titulo"
                        autoComplete="off"
                        placeholder="Ex: Desenvolvedor Frontend React Senior"
                        className={`mt-1 ${errors.titulo ? 'border-red-500 focus:border-red-500' : ''}`}
                        value={formData.titulo}
                        onChange={(e) => handleInputChange('titulo', e.target.value)}
                        required
                      />
                      {errors.titulo ? (
                        <p className="text-sm text-red-600 mt-1">{errors.titulo}</p>
                      ) : (
                        <p className="text-sm text-gray-500 mt-1">Seja específico para atrair os candidatos certos</p>
                      )}
                    </div>

                    {/* Nome da Empresa - Linha completa */}
                    <div>
                      <Label htmlFor="empresa" className="text-base">
                        Empresa *
                        {empresaLoading && <span className="text-sm text-blue-600">(carregando...)</span>}
                        {currentEmpresa && <span className="text-sm text-green-600">(✓ {currentEmpresa.nome})</span>}
                        {!currentEmpresa && !empresaLoading && <span className="text-sm text-red-600">(não encontrada)</span>}
                      </Label>
                      <div className="flex items-center mt-1">
                        <Building size={18} className="text-gray-500 mr-2" />
                        <Input
                          id="empresa_nome"
                          placeholder={currentEmpresa ? currentEmpresa.nome : "Nome da empresa"}
                          value={formData.empresa_nome}
                          onChange={(e) => handleInputChange('empresa_nome', e.target.value)}
                          className={`flex-grow ${errors.empresa_nome ? 'border-red-500 focus:border-red-500' : ''} ${(usarEnderecoEmpresa || !!currentEmpresa) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                          required
                          readOnly={!!currentEmpresa}
                          disabled={empresaLoading || usarEnderecoEmpresa}
                        />
                      </div>
                      {errors.empresa_nome ? (
                        <p className="text-sm text-red-600 mt-1">{errors.empresa_nome}</p>
                      ) : currentEmpresa ? (
                        <p className="text-xs text-gray-600 mt-1">
                          Este campo foi preenchido automaticamente com os dados da sua empresa cadastrada.
                        </p>
                      ) : null}
                    </div>

                    {/* Localização - Estado e Cidade */}
                    <div className="space-y-4">
                      {/* Checkbox para usar endereço da empresa */}
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="usar-endereco-empresa"
                          checked={usarEnderecoEmpresa}
                          onCheckedChange={(checked) => setUsarEnderecoEmpresa(checked as boolean)}
                        />
                        <Label htmlFor="usar-endereco-empresa" className="text-sm font-normal cursor-pointer">
                          Usar endereço cadastrado da empresa
                        </Label>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Estado */}
                          <div>
                            <Label htmlFor="estado" className="text-base">
                              Estado *
                            </Label>
                            <Select
                              value={formData.estado}
                              onValueChange={(value) => {
                                handleInputChange('estado', value)
                                // Limpar cidade ao mudar estado
                                handleInputChange('cidade', '')
                                setCidadeBusca('')
                              }}
                              disabled={usarEnderecoEmpresa}
                            >
                              <SelectTrigger className={`mt-1 ${errors.estado ? 'border-red-500' : ''} ${usarEnderecoEmpresa ? 'bg-gray-100 cursor-not-allowed' : ''}`}>
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
                            {errors.estado && (
                              <p className="text-red-500 text-sm mt-1">{errors.estado}</p>
                            )}
                          </div>

                          {/* Cidade - ocupa 2 colunas no grid */}
                          <div className="relative md:col-span-2">
                            <Label htmlFor="cidade" className="text-base">
                              Cidade *
                            </Label>
                            <Input
                              id="cidade"
                              value={cidadeBusca}
                              onChange={(e) => handleCidadeChange(e.target.value)}
                              onFocus={() => !usarEnderecoEmpresa && setMostrarSugestoes(true)}
                              onBlur={() => setTimeout(() => setMostrarSugestoes(false), 200)}
                              placeholder={formData.estado ? "Digite para buscar..." : "Selecione o estado primeiro"}
                              disabled={usarEnderecoEmpresa || !formData.estado}
                              className={`mt-1 ${errors.cidade ? 'border-red-500' : ''} ${(usarEnderecoEmpresa || !formData.estado) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                            />
                            {mostrarSugestoes && !usarEnderecoEmpresa && formData.estado && cidadesSugestoes.length > 0 && (
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
                            {formData.estado && cidadesSugestoes.length === 0 && cidadeBusca && !usarEnderecoEmpresa && (
                              <p className="text-xs text-gray-500 mt-1">
                                Nenhuma cidade encontrada. Tente outra busca.
                              </p>
                            )}
                            {errors.cidade && (
                              <p className="text-red-500 text-sm mt-1">{errors.cidade}</p>
                            )}
                          </div>
                        </div>

                        {/* Mostrar sucesso na validação de coordenadas - só quando cidade e estado estiverem preenchidos */}
                        {latitude && longitude && formData.cidade && formData.estado && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <p className="text-sm text-green-800 flex items-center">
                              <MapPin size={16} className="mr-2" />
                              Localização encontrada com sucesso!
                            </p>
                          </div>
                        )}

                        {/* Mostrar loading quando estiver buscando */}
                        {buscandoCoordenadas && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-sm text-blue-800 flex items-center">
                              <MapPin size={16} className="mr-2 animate-pulse" />
                              Buscando localização...
                            </p>
                          </div>
                        )}
                      </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="num_vagas" className="text-base">
                          Número de vagas *
                        </Label>
                        <div className="flex items-center mt-1">
                          <Users size={18} className="text-gray-500 mr-2" />
                          <Input 
                            id="num_vagas" 
                            type="number" 
                            inputMode="numeric"
                            min="1" 
                            value={formData.num_vagas}
                            onChange={(e) => handleInputChange('num_vagas', parseInt(e.target.value) || 1)}
                            className={`flex-grow ${errors.num_vagas ? 'border-red-500 focus:ring-red-500' : ''}`}
                          />
                        </div>
                        {errors.num_vagas && (
                          <p className="text-red-500 text-sm mt-1">{errors.num_vagas}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="nivel" className="text-base">
                          Nível de Experiência *
                        </Label>
                        <Select
                          value={formData.nivel}
                          onValueChange={(value) => handleInputChange('nivel', value)}
                        >
                          <SelectTrigger className={`mt-1 ${errors.nivel ? 'border-red-500' : ''}`}>
                            <SelectValue placeholder="Selecione o nível de experiência" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="estagio">Estágio / Trainee</SelectItem>
                            <SelectItem value="assistente">Assistente / Auxiliar</SelectItem>
                            <SelectItem value="operacional">Operacional</SelectItem>
                            <SelectItem value="analista">Analista</SelectItem>
                            <SelectItem value="coordenacao">Coordenação</SelectItem>
                            <SelectItem value="gerencia">Gerência</SelectItem>
                            <SelectItem value="diretoria">Diretoria</SelectItem>
                            <SelectItem value="especialista">Especialista</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.nivel && (
                          <p className="text-red-500 text-sm mt-1">{errors.nivel}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="descricao" className="text-base">
                        Descrição da vaga *
                      </Label>
                      <Textarea
                        id="descricao"
                        placeholder="Descreva as responsabilidades e o dia a dia do profissional..."
                        className={`mt-1 min-h-[150px] ${errors.descricao ? 'border-red-500 focus:border-red-500' : ''}`}
                        value={formData.descricao}
                        onChange={(e) => handleInputChange('descricao', e.target.value)}
                        required
                      />
                      {errors.descricao && (
                        <p className="text-sm text-red-600 mt-1">{errors.descricao}</p>
                      )}
                    </div>

                    <div>
                      <Label className="text-base">Responsabilidades principais *</Label>
                      <div className="flex mt-1 mb-2">
                        <Input
                          value={novaResponsabilidade}
                          onChange={(e) => setNovaResponsabilidade(e.target.value)}
                          placeholder="Ex: Desenvolver interfaces de usuário, Realizar testes..."
                          className="flex-grow"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              adicionarResponsabilidade()
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={adicionarResponsabilidade}
                          className="ml-2 bg-[#4400CC] hover:bg-[#3300AA]"
                        >
                          <Plus size={16} />
                        </Button>
                      </div>

                      <div className="space-y-2 mt-2">
                        {responsabilidades.map((responsabilidade, index) => (
                          <div key={index} className="flex items-start">
                            <CheckCircle size={18} className="text-[#4400CC] mr-2 mt-0.5 flex-shrink-0" />
                            <div className="flex-grow">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-700">{responsabilidade}</span>
                                <button
                                  type="button"
                                  onClick={() => removerResponsabilidade(responsabilidade)}
                                  aria-label={`Remover responsabilidade: ${responsabilidade}`}
                                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center text-gray-500 hover:text-red-500"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                        {errors.responsabilidades ? (
                          <p className="text-sm text-red-600">{errors.responsabilidades}</p>
                        ) : responsabilidades.length === 0 ? (
                          <p className="text-sm text-gray-500 italic">
                            Adicione as principais responsabilidades da função
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="sobre_empresa" className="text-base">
                        Sobre a empresa {currentEmpresa && <span className="text-sm text-gray-500 font-normal">(preenchido automaticamente)</span>}
                      </Label>
                      <Textarea
                        id="sobre_empresa"
                        placeholder={currentEmpresa?.descricao || "Conte um pouco sobre a empresa, cultura, valores..."}
                        className={`mt-1 min-h-[100px] ${currentEmpresa ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        value={formData.sobre_empresa}
                        onChange={(e) => handleInputChange('sobre_empresa', e.target.value)}
                        readOnly={!!currentEmpresa}
                        disabled={empresaLoading || !!currentEmpresa}
                      />
                      {currentEmpresa && (
                        <p className="text-xs text-gray-500 mt-1">
                          Este campo foi preenchido automaticamente com as informações da sua empresa. Para alterar, vá em Configurações.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
                  <Button variant="outline" className="w-full sm:w-auto" onClick={() => router.push('/empregador/vagas')}>Cancelar</Button>
                  <Button onClick={goToNextTab} className="w-full sm:w-auto bg-[#4400CC] hover:bg-[#3300AA]">
                    Próximo
                  </Button>
                </div>
              </TabsContent>

              {/* Aba de Requisitos */}
              <TabsContent value="requisitos" className="space-y-6">
                <div>
                  <h2 className="text-xl font-medium text-[#4400CC] mb-4">Requisitos da vaga</h2>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-base">Requisitos *</Label>
                      <div className="flex mt-1 mb-2">
                        <Input
                          value={novoRequisito}
                          onChange={(e) => setNovoRequisito(e.target.value)}
                          placeholder="Ex: Experiência com React, Conhecimento em JavaScript..."
                          className={`flex-grow ${errors.requisitos ? 'border-red-500 focus:ring-red-500' : ''}`}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              adicionarRequisito()
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={adicionarRequisito}
                          className="ml-2 bg-[#4400CC] hover:bg-[#3300AA]"
                        >
                          <Plus size={16} />
                        </Button>
                      </div>
                      {errors.requisitos && (
                        <p className="text-red-500 text-sm mb-2">{errors.requisitos}</p>
                      )}

                      <div className="space-y-2 mt-2">
                        {requisitos.map((requisito, index) => (
                          <div key={index} className="flex items-start">
                            <CheckCircle size={18} className="text-[#0057FF] mr-2 mt-0.5 flex-shrink-0" />
                            <div className="flex-grow">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-700">{requisito}</span>
                                <button
                                  type="button"
                                  onClick={() => removerRequisito(requisito)}
                                  aria-label={`Remover requisito: ${requisito}`}
                                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center text-gray-500 hover:text-red-500"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                        {requisitos.length === 0 && (
                          <p className="text-sm text-gray-500 italic">Adicione os requisitos necessários para a vaga</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label className="text-base">Desejáveis</Label>
                      <div className="flex mt-1 mb-2">
                        <Input
                          value={novoDiferencial}
                          onChange={(e) => setNovoDiferencial(e.target.value)}
                          placeholder="Ex: Experiência com Next.js, Conhecimento em DevOps..."
                          className="flex-grow"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              adicionarDiferencial()
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={adicionarDiferencial}
                          className="ml-2 bg-[#4400CC] hover:bg-[#3300AA]"
                        >
                          <Plus size={16} />
                        </Button>
                      </div>

                      <div className="space-y-2 mt-2">
                        {diferenciais.map((diferencial, index) => (
                          <div key={index} className="flex items-start">
                            <CheckCircle size={18} className="text-[#4400CC] mr-2 mt-0.5 flex-shrink-0" />
                            <div className="flex-grow">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-700">{diferencial}</span>
                                <button
                                  type="button"
                                  onClick={() => removerDiferencial(diferencial)}
                                  aria-label={`Remover diferencial: ${diferencial}`}
                                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center text-gray-500 hover:text-red-500"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                        {diferenciais.length === 0 && (
                          <p className="text-sm text-gray-500 italic">
                            Adicione os diferenciais desejáveis para a vaga
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <LanguageManager
                        languages={idiomas}
                        onChange={setIdiomas}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
                  <Button variant="outline" className="w-full sm:w-auto" onClick={goToPreviousTab}>
                    Voltar
                  </Button>
                  <Button onClick={goToNextTab} className="w-full sm:w-auto bg-[#4400CC] hover:bg-[#3300AA]">
                    Próximo
                  </Button>
                </div>
              </TabsContent>

              {/* Aba de Detalhes da Vaga */}
              <TabsContent value="detalhes" className="space-y-6">
                <div>
                  <h2 className="text-xl font-medium text-[#4400CC] mb-4">Detalhes da vaga</h2>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="area_atuacao" className="text-base">
                        Área de Atuação *
                      </Label>
                      <Select
                        value={formData.area_atuacao || ''}
                        onValueChange={(value) => handleInputChange('area_atuacao', value)}
                      >
                        <SelectTrigger className={`mt-1 ${errors.area_atuacao ? 'border-red-500' : ''}`}>
                          <SelectValue placeholder="Selecione a área de atuação" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tecnologia">Tecnologia</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="vendas">Vendas</SelectItem>
                          <SelectItem value="financeiro">Financeiro</SelectItem>
                          <SelectItem value="rh">Recursos Humanos</SelectItem>
                          <SelectItem value="operacoes">Operações</SelectItem>
                          <SelectItem value="atendimento">Atendimento ao Cliente</SelectItem>
                          <SelectItem value="design">Design</SelectItem>
                          <SelectItem value="engenharia">Engenharia</SelectItem>
                          <SelectItem value="juridico">Jurídico</SelectItem>
                          <SelectItem value="saude">Saúde</SelectItem>
                          <SelectItem value="educacao">Educação</SelectItem>
                          <SelectItem value="administracao">Administração</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.area_atuacao && (
                        <p className="text-red-500 text-sm mt-1">{errors.area_atuacao}</p>
                      )}
                    </div>

                    <Separator className="my-4" />

                    <div>
                      <h3 className="text-base font-medium text-gray-800 mb-3">Contatos para esta vaga (opcional)</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Adicione contatos específicos para esta vaga. Esses contatos serão exibidos na página de detalhes da vaga para facilitar o contato dos candidatos.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="contato_email" className="text-base">
                            E-mail de contato
                          </Label>
                          <div className="flex items-center mt-1">
                            <Mail size={18} className="text-gray-500 mr-2" />
                            <Input
                              id="contato_email"
                              type="email"
                              inputMode="email"
                              autoComplete="email"
                              placeholder="contato@empresa.com"
                              value={formData.contato_email || ''}
                              onChange={(e) => handleInputChange('contato_email', e.target.value)}
                              className="flex-grow"
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Os candidatos poderão enviar e-mails diretamente para este endereço
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="contato_whatsapp" className="text-base">
                            WhatsApp
                          </Label>
                          <div className="flex items-center mt-1">
                            <Phone size={18} className="text-gray-500 mr-2" />
                            <Input
                              id="contato_whatsapp"
                              type="tel"
                              inputMode="tel"
                              autoComplete="tel"
                              placeholder="(11) 9 1234-5678"
                              value={whatsappFormatado}
                              onChange={(e) => {
                                const formatado = formatarTelefone(e.target.value)
                                setWhatsappFormatado(formatado)
                                // Salva apenas números no formData
                                const limpo = limparTelefone(e.target.value)
                                handleInputChange('contato_whatsapp', limpo)
                              }}
                              className="flex-grow"
                              maxLength={16}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Os candidatos poderão entrar em contato via WhatsApp (formato: DDD + número)
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="tipo_contrato" className="text-base">
                          Tipo de contrato *
                        </Label>
                        <RadioGroup
                          value={formData.tipo_contratacao}
                          onValueChange={(value) => handleInputChange('tipo_contratacao', value)}
                          className="mt-2 space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="clt" id="clt" />
                            <Label htmlFor="clt" className="font-normal cursor-pointer">
                              CLT
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="pj" id="pj" />
                            <Label htmlFor="pj" className="font-normal cursor-pointer">
                              PJ
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="freelancer" id="freelancer" />
                            <Label htmlFor="freelancer" className="font-normal cursor-pointer">
                              Freelancer
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="estagio" id="estagio" />
                            <Label htmlFor="estagio" className="font-normal cursor-pointer">
                              Estágio
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="temporario" id="temporario" />
                            <Label htmlFor="temporario" className="font-normal cursor-pointer">
                              Temporário
                            </Label>
                          </div>
                        </RadioGroup>
                        {errors.tipo_contratacao && (
                          <p className="text-red-500 text-sm mt-1">{errors.tipo_contratacao}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="modelo_trabalho" className="text-base">
                          Modelo de trabalho *
                        </Label>
                        <RadioGroup 
                          value={formData.modelo_trabalho} 
                          onValueChange={(value) => handleInputChange('modelo_trabalho', value)}
                          className="mt-2 space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="presencial" id="presencial" />
                            <Label htmlFor="presencial" className="font-normal cursor-pointer">
                              Presencial
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="hibrido" id="hibrido" />
                            <Label htmlFor="hibrido" className="font-normal cursor-pointer">
                              Híbrido
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="remoto" id="remoto" />
                            <Label htmlFor="remoto" className="font-normal cursor-pointer">
                              Remoto
                            </Label>
                          </div>
                        </RadioGroup>
                        {errors.modelo_trabalho && (
                          <p className="text-red-500 text-sm mt-1">{errors.modelo_trabalho}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="faixa_salarial" className="text-base">
                        Faixa salarial (em R$)
                      </Label>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center flex-grow">
                          <DollarSign size={18} className="text-gray-500 mr-2" />
                          <Input
                            placeholder="Ex: 5.000"
                            type="text"
                            value={salarioDeFormatado}
                            onChange={(e) => {
                              const formatted = formatCurrencyInput(e.target.value)
                              setSalarioDeFormatado(formatted)
                              const numericValue = parseCurrency(formatted)
                              handleInputChange('salario_de', numericValue || undefined)
                            }}
                            className={`${errors.salario ? 'border-red-500 focus:ring-red-500' : ''}`}
                          />
                        </div>
                        <span>-</span>
                        <Input
                          placeholder="Ex: 10.000"
                          type="text"
                          value={salarioAteFormatado}
                          onChange={(e) => {
                            const formatted = formatCurrencyInput(e.target.value)
                            setSalarioAteFormatado(formatted)
                            const numericValue = parseCurrency(formatted)
                            handleInputChange('salario_ate', numericValue || undefined)
                          }}
                          className={`flex-grow ${errors.salario ? 'border-red-500 focus:ring-red-500' : ''}`}
                        />
                      </div>
                      {errors.salario && (
                        <p className="text-red-500 text-sm mt-1">{errors.salario}</p>
                      )}
                      <div className="mt-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="ocultar_salario" />
                          <label
                            htmlFor="ocultar_salario"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Não exibir faixa salarial no anúncio
                          </label>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div>
                      <Label className="text-base">Benefícios</Label>
                      <div className="flex mt-1 mb-2">
                        <Input
                          value={novoBeneficio}
                          onChange={(e) => setNovoBeneficio(e.target.value)}
                          placeholder="Ex: Vale refeição, Plano de saúde..."
                          className="flex-grow"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              adicionarBeneficio()
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={adicionarBeneficio}
                          className="ml-2 bg-[#4400CC] hover:bg-[#3300AA]"
                        >
                          <Plus size={16} />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        {beneficios.map((beneficio, index) => (
                          <div key={index} className="flex items-start">
                            <CheckCircle size={18} className="text-[#4400CC] mr-2 mt-0.5 flex-shrink-0" />
                            <div className="flex-grow">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-700">{beneficio}</span>
                                <button
                                  type="button"
                                  onClick={() => removerBeneficio(beneficio)}
                                  aria-label={`Remover benefício: ${beneficio}`}
                                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center text-gray-500 hover:text-red-500"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                        {beneficios.length === 0 && (
                          <p className="text-sm text-gray-500 italic">Adicione os benefícios oferecidos</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
                  <Button variant="outline" className="w-full sm:w-auto" onClick={goToPreviousTab}>
                    Voltar
                  </Button>
                  <Button onClick={goToNextTab} className="w-full sm:w-auto bg-[#4400CC] hover:bg-[#3300AA]">
                    Próximo
                  </Button>
                </div>
              </TabsContent>

              {/* Aba de Configurações */}
              <TabsContent value="configuracoes" className="space-y-6">
                <div>
                  <h2 className="text-xl font-medium text-[#4400CC] mb-4">Configurações da vaga</h2>

                  <div className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Status da vaga</Label>
                        <p className="text-sm text-gray-500">
                          Defina se a vaga estará ativa imediatamente após publicação
                        </p>
                      </div>
                      <Select defaultValue="Rascunho" onValueChange={(value) => handleInputChange('status', value)}>
                        <SelectTrigger className="w-full sm:w-[220px]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Rascunho">Rascunho (Não Publicado)</SelectItem>
                          <SelectItem value="Ativa">Ativa (Publicar Agora)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <div>
                      <Label htmlFor="prazo" className="text-base">
                        Prazo de expiração *
                      </Label>
                      <div className="flex items-center mt-1">
                        <Calendar size={18} className="text-gray-500 mr-2" />
                        <div className="flex-grow">
                          <Input
                            type="date"
                            id="data_expiracao"
                            value={formData.data_expiracao || ''}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={(e) => handleInputChange('data_expiracao', e.target.value)}
                            className={errors.data_expiracao ? 'border-red-500 focus:border-red-500' : ''}
                          />
                        </div>
                      </div>
                      {formData.data_expiracao && (
                        <p className="text-sm text-gray-500 mt-1">
                          A vaga expirará em {Math.ceil((new Date(formData.data_expiracao).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} dias
                        </p>
                      )}
                      {errors.data_expiracao && (
                        <p className="text-red-500 text-sm mt-1">{errors.data_expiracao}</p>
                      )}
                      <div className="mt-2">
                        <p className="text-xs text-gray-600 mb-2">Atalhos rápidos:</p>
                        <div className="flex flex-wrap gap-2">
                          {[15, 30, 45, 60, 90].map((days) => (
                            <Button
                              key={days}
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const expirationDate = new Date()
                                expirationDate.setDate(expirationDate.getDate() + days)
                                handleInputChange('data_expiracao', expirationDate.toISOString().split('T')[0])
                              }}
                              className="text-xs"
                            >
                              {days} dias
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Separator />
                  </div>
                </div>

                {/* Botões de ação */}
                <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
                  <Button variant="outline" className="w-full sm:w-auto order-2 sm:order-1" onClick={goToPreviousTab}>
                    Voltar
                  </Button>
                  <div className="flex flex-col sm:flex-row gap-2 order-1 sm:order-2">
                    {!isEditing && (
                      <Button
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={handleSalvarRascunho}
                        disabled={isLoading}
                      >
                        Salvar como rascunho
                      </Button>
                    )}
                    <Button
                      className="w-full sm:w-auto bg-[#4400CC] hover:bg-[#3300AA]"
                      onClick={handleSalvarVaga}
                      disabled={isSubmitting || isLoading}
                    >
                      <Save size={16} className="mr-2" />
                      {isSubmitting ?
                        (isEditing ? 'Salvando alterações...' : 'Validando e salvando...')
                        : isLoading ? 'Salvando...'
                        : isEditing ? 'Salvar Alterações' : 'Publicar vaga'}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      </div>
    </ProtectedRoute>
  )
}
