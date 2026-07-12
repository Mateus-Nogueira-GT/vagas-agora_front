"use client"

import type React from "react"
import toast from "react-hot-toast"

import {
  Eye,
  Linkedin,
  Upload,
  User,
  Save,
  X,
  Briefcase,
  FileText,
  MapPin,
  Car,
  GraduationCap,
  Languages,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Menu,
  ChevronUp,
  ChevronDown,
  Building,
  Clock,
  UserCheck,
  Globe,
  BookOpen,
  Github,
  Instagram,
  Facebook,
  Youtube,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { createRef, useCallback, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useCandidatos } from "@/hooks/use-candidatos"
import { useAuth } from "@/hooks/use-auth"
import { uploadApiService } from "@/lib/api/upload-api"
import {
  Idioma,
  Formacao,
  ExperienciaProfissional,
  Endereco,
  CreateCandidatoRequest,
  Candidato
} from "@/lib/candidatos/candidatos-types"
import { supabase } from "@/lib/supabase"
import { PhoneInput } from "@/components/form/phone-input"
import { SimpleLocationSelector } from "@/components/form/simple-location-selector"
import { AvailabilityRadio } from "@/components/form/availability-radio"
import { SocialMediaLinks } from "@/components/form/social-media-links"
import { PDFUpload } from "@/components/form/pdf-upload"
import { ExperienceManager } from "@/components/form/experience-manager"
import EducationManager from "@/components/form/education-manager"
import LanguageManager from "@/components/form/language-manager"

// Tipo específico para o formulário que inclui email para exibição
type CurriculoFormData = CreateCandidatoRequest & {
  email?: string
}

export default function Resume() {
  const { user } = useAuth()
  const { 
    candidato, 
    isLoading, 
    error, 
    loadCandidatoPerfil, 
    createCandidatoPerfil, 
    updateCandidatoPerfilByUserId,
    clearError 
  } = useCandidatos()

  const [activeTab, setActiveTab] = useState("dados-pessoais")
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [isVerified, setIsVerified] = useState(false) // Começa como false, será atualizado pelo banco
  const [editMode, setEditMode] = useState(false)
  const [pdfShared, setPdfShared] = useState(true)
  const [mobileTocOpen, setMobileTocOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("dados-pessoais")
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  // Form data state
  const [formData, setFormData] = useState<Partial<CurriculoFormData>>({
    nome_completo: '',
    email: '',
    telefone: '',
    data_nascimento: '',
    genero: '',
    titulo_profissional: '',
    bio: '',
    anos_experiencia: 0,
    nivel_senioridade: '',
    endereco: {
      cidade: '',
      estado: ''
    },
    salario_pretendido_de: undefined,
    salario_pretendido_ate: undefined,
    tipo_contratacao_preferido: '',
    modelo_trabalho_preferido: '',
    portfolio_url: '',
    linkedin_url: '',
    github_url: '',
    site_pessoal: '',
    data_disponibilidade: '',
    disponivel_remoto: true,
    disponivel_relocacao: false,
    habilidades_tecnicas: [],
    idiomas: [],
    formacao: [],
    certificacoes: [],
    experiencias: [],
    disponivel_trabalho: true,
    aceita_propostas: true,
    visibilidade_perfil: 'publico'
  })

  // Additional state for form checkboxes/switches
  const [availabilitySettings, setAvailabilitySettings] = useState({
    mudanca_cidade: false,
    mudanca_estado: false,
    mudanca_pais: false,
    inicio_imediato: false,
    aviso_previo: false,
    presencial: true,
    hibrido: true,
    remoto: true
  })

  // Estados para redes sociais
  const [redesSociais, setRedesSociais] = useState({
    linkedin_url: '',
    github_url: '',
    site_pessoal: '',
    portfolio_url: '',
    instagram_url: '',
    facebook_url: '',
    youtube_url: ''
  })

  // Estado para disponibilidade como radio
  const [disponibilidadeTipo, setDisponibilidadeTipo] = useState<'imediato' | 'com_aviso_previo'>('imediato')

  // Show empty state message when no candidate data and not loading
  const showEmptyState = !isLoading && !candidato && !editMode

  // Refs para cada seção para scroll
  const sectionRefs = useMemo(() => ({
    "dados-pessoais": createRef<HTMLDivElement>(),
    experiencia: createRef<HTMLDivElement>(),
    formacao: createRef<HTMLDivElement>(),
    idiomas: createRef<HTMLDivElement>(),
    diversidade: createRef<HTMLDivElement>(),
    "redes-sociais": createRef<HTMLDivElement>(),
    habilitacao: createRef<HTMLDivElement>(),
    disponibilidade: createRef<HTMLDivElement>(),
    "curriculo-pdf": createRef<HTMLDivElement>(),
  }), [])

  // Load candidato data on mount
  useEffect(() => {
    if (user?.id && user.role === 'candidato') {
      loadCandidatoPerfil()
      checkSubscriptionStatus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.role])

  // Verificar status da assinatura
  const checkSubscriptionStatus = useCallback(async () => {
    if (!user?.id) return

    try {
      const { data: subscription, error } = await supabase
        .from('asaas_subscriptions')
        .select('status, verification_active, verification_expires_at')
        .eq('user_id', user.id)
        .eq('subscription_type', 'CURRICULO_VERIFICACAO')
        .eq('status', 'ACTIVE')
        .eq('verification_active', true)
        .maybeSingle()

      if (!error && subscription) {
        // Verificar se ainda não expirou
        const now = new Date()
        const expiresAt = new Date(subscription.verification_expires_at)
        setIsVerified(expiresAt > now)
      } else {
        setIsVerified(false)
      }
    } catch (error) {
      console.error('Erro ao verificar assinatura:', error)
      setIsVerified(false)
    }
  }, [user?.id])

  // Realtime listener para atualizar selo quando assinatura mudar
  useEffect(() => {
    if (!user?.id) return


    const channel = supabase
      .channel('curriculo-subscription-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'asaas_subscriptions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {

          // Recarregar status da assinatura
          checkSubscriptionStatus()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [checkSubscriptionStatus, user?.id])

  // Update form data when candidato data loads
  useEffect(() => {
    if (candidato) {
      setFormData({
        nome_completo: candidato.nome_completo || '',
        email: candidato.email || '',
        telefone: candidato.telefone || '',
        data_nascimento: candidato.data_nascimento || '',
        genero: candidato.genero || '',
        raca_etnia: candidato.raca_etnia || '',
        orientacao_sexual: candidato.orientacao_sexual || '',
        pcd: candidato.pcd || '',
        titulo_profissional: candidato.titulo_profissional || '',
        bio: candidato.bio || '',
        anos_experiencia: candidato.anos_experiencia || 0,
        nivel_senioridade: candidato.nivel_senioridade || '',
        endereco: {
          cidade: candidato.endereco?.cidade || '',
          estado: candidato.endereco?.estado || '',
          latitude: candidato.endereco?.latitude,
          longitude: candidato.endereco?.longitude
        },
        salario_pretendido_de: candidato.salario_pretendido_de,
        salario_pretendido_ate: candidato.salario_pretendido_ate,
        tipo_contratacao_preferido: candidato.tipo_contratacao_preferido || '',
        modelo_trabalho_preferido: candidato.modelo_trabalho_preferido || '',
        portfolio_url: candidato.portfolio_url || '',
        linkedin_url: candidato.linkedin_url || '',
        github_url: candidato.github_url || '',
        site_pessoal: candidato.site_pessoal || '',
        data_disponibilidade: candidato.data_disponibilidade || '',
        disponivel_remoto: candidato.disponivel_remoto ?? true,
        disponivel_relocacao: candidato.disponivel_relocacao ?? false,
        habilidades_tecnicas: candidato.habilidades_tecnicas || [],
        idiomas: candidato.idiomas || [],
        formacao: candidato.formacao || [],
        certificacoes: candidato.certificacoes || [],
        experiencias: candidato.experiencias || [],
        disponivel_trabalho: candidato.disponivel_trabalho ?? true,
        aceita_propostas: candidato.aceita_propostas ?? true,
        visibilidade_perfil: candidato.visibilidade_perfil || 'publico',
        foto_url: candidato.foto_url || '',
        possui_cnh: candidato.possui_cnh || '',
        categoria_cnh: candidato.categoria_cnh || '',
        veiculo_proprio: candidato.veiculo_proprio || '',
        curriculo_pdf_url: candidato.curriculo_pdf_url || '',
        curriculo_pdf_nome: candidato.curriculo_pdf_nome || ''
      })

      // Atualizar foto de perfil
      setProfileImage(candidato.foto_url || null)

      // Carregar redes sociais
      setRedesSociais({
        linkedin_url: candidato.linkedin_url || '',
        github_url: candidato.github_url || '',
        site_pessoal: candidato.site_pessoal || '',
        portfolio_url: candidato.portfolio_url || '',
        instagram_url: candidato.instagram_url || '',
        facebook_url: candidato.facebook_url || '',
        youtube_url: candidato.youtube_url || ''
      })

      // Carregar disponibilidade
      setDisponibilidadeTipo(candidato.disponibilidade_tipo || 'imediato')
      setAvailabilitySettings({
        mudanca_cidade: candidato.mudanca_cidade || false,
        mudanca_estado: candidato.mudanca_estado || false,
        mudanca_pais: candidato.mudanca_pais || false,
        inicio_imediato: candidato.disponibilidade_tipo === 'imediato',
        aviso_previo: candidato.disponibilidade_tipo === 'com_aviso_previo',
        presencial: candidato.aceita_presencial ?? true,
        hibrido: candidato.aceita_hibrido ?? true,
        remoto: candidato.aceita_remoto ?? true
      })
    } else if (!isLoading && user?.email) {
      // Se não há candidato mas há usuário logado, preencher email
      setFormData(prev => ({
        ...prev,
        email: user.email || ''
      }))
    }
  }, [candidato, isLoading, user?.email])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user?.id) return

    setIsUploadingImage(true)

    try {
      // Upload da imagem para o Supabase Storage
      const uploadResult = await uploadApiService.uploadProfileImage(user.id, file)

      // Atualizar preview local
      setProfileImage(uploadResult.url)

      // Atualizar form data
      handleInputChange('foto_url', uploadResult.url)

      toast.success('Foto enviada com sucesso!')
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Erro ao enviar foto')
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Lógica para upload de PDF
    const file = e.target.files?.[0]
    if (file) {
      // Aqui você implementaria a lógica real de upload
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleEnderecoChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      endereco: {
        ...prev.endereco,
        [field]: value
      }
    }))
  }

  const handleSaveDadosPessoais = async () => {
    if (!user?.id || !formData.nome_completo) {
      toast.error('Nome completo é obrigatório')
      return
    }

    setIsSaving(true)
    clearError()

    try {
      // Salvar APENAS os campos de dados pessoais
      const dadosPessoais = {
        nome_completo: formData.nome_completo,
        telefone: formData.telefone,
        data_nascimento: formData.data_nascimento,
        titulo_profissional: formData.titulo_profissional,
        bio: formData.bio,
        endereco: formData.endereco,
        foto_url: formData.foto_url
      }

      let success = false

      if (candidato) {
        success = await updateCandidatoPerfilByUserId(dadosPessoais)
      } else {
        // Se não existe candidato, precisa criar com dados mínimos
        const dadosCompletos = {
          ...dadosPessoais,
          anos_experiencia: 0,
          disponivel_remoto: true,
          disponivel_relocacao: false,
          disponivel_trabalho: true,
          aceita_propostas: true,
          visibilidade_perfil: 'publico' as const
        }
        success = await createCandidatoPerfil(dadosCompletos as CreateCandidatoRequest)
      }

      if (success) {
        setEditMode(false)
        toast.success('Dados pessoais salvos com sucesso!')

        // Recarregar dados do candidato para atualizar sidebar e outras partes da UI
        await loadCandidatoPerfil()
      } else {
        toast.error('Erro ao salvar os dados. Tente novamente.')
      }
    } catch (error) {
      console.error('Save dados pessoais error:', error)
      toast.error('Erro ao salvar os dados. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveChanges = async () => {
    if (!user?.id || !formData.nome_completo) {
      return
    }

    setIsSaving(true)
    clearError()

    try {
      let success = false

      if (candidato) {
        // Update existing candidato - remove email from formData and add redes sociais
        const { email, ...updateData } = formData as CurriculoFormData

        // Filtrar campos vazios para evitar erros de validação (especialmente datas vazias)
        const cleanedData = Object.fromEntries(
          Object.entries(updateData).filter(([_, value]) => {
            // Remove strings vazias e valores undefined/null
            if (value === '' || value === undefined || value === null) return false
            return true
          })
        )

        const dataToSave = {
          ...cleanedData,
          // Adicionar redes sociais (apenas se não forem vazias)
          ...(redesSociais.linkedin_url && { linkedin_url: redesSociais.linkedin_url }),
          ...(redesSociais.github_url && { github_url: redesSociais.github_url }),
          ...(redesSociais.site_pessoal && { site_pessoal: redesSociais.site_pessoal }),
          ...(redesSociais.portfolio_url && { portfolio_url: redesSociais.portfolio_url }),
          ...(redesSociais.instagram_url && { instagram_url: redesSociais.instagram_url }),
          ...(redesSociais.facebook_url && { facebook_url: redesSociais.facebook_url }),
          ...(redesSociais.youtube_url && { youtube_url: redesSociais.youtube_url }),
          // Adicionar disponibilidade
          disponibilidade_tipo: disponibilidadeTipo,
          mudanca_cidade: availabilitySettings.mudanca_cidade,
          mudanca_estado: availabilitySettings.mudanca_estado,
          mudanca_pais: availabilitySettings.mudanca_pais,
          aceita_presencial: availabilitySettings.presencial,
          aceita_hibrido: availabilitySettings.hibrido,
          aceita_remoto: availabilitySettings.remoto
        }
        success = await updateCandidatoPerfilByUserId(dataToSave)
      } else {
        // Create new candidato - remove email from formData and add redes sociais
        const { email, ...createData } = formData as CurriculoFormData
        const dataToSave = {
          ...createData,
          // Adicionar redes sociais
          linkedin_url: redesSociais.linkedin_url,
          github_url: redesSociais.github_url,
          site_pessoal: redesSociais.site_pessoal,
          portfolio_url: redesSociais.portfolio_url,
          instagram_url: redesSociais.instagram_url,
          facebook_url: redesSociais.facebook_url,
          youtube_url: redesSociais.youtube_url,
          // Adicionar disponibilidade
          disponibilidade_tipo: disponibilidadeTipo,
          mudanca_cidade: availabilitySettings.mudanca_cidade,
          mudanca_estado: availabilitySettings.mudanca_estado,
          mudanca_pais: availabilitySettings.mudanca_pais,
          aceita_presencial: availabilitySettings.presencial,
          aceita_hibrido: availabilitySettings.hibrido,
          aceita_remoto: availabilitySettings.remoto
        }
        success = await createCandidatoPerfil(dataToSave as CreateCandidatoRequest)
      }

      if (success) {
        setEditMode(false)
        toast.success('Dados do currículo salvos com sucesso!')
      } else {
        toast.error('Erro ao salvar os dados. Tente novamente.')
      }
    } catch (error) {
      console.error('Save changes error:', error)
      toast.error('Erro ao salvar os dados. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelChanges = () => {
    if (candidato) {
      // Reset form data to original candidato data
      setFormData({
        nome_completo: candidato.nome_completo || '',
        email: candidato.email || '',
        telefone: candidato.telefone || '',
        data_nascimento: candidato.data_nascimento || '',
        genero: candidato.genero || '',
        raca_etnia: candidato.raca_etnia || '',
        orientacao_sexual: candidato.orientacao_sexual || '',
        pcd: candidato.pcd || '',
        titulo_profissional: candidato.titulo_profissional || '',
        bio: candidato.bio || '',
        anos_experiencia: candidato.anos_experiencia || 0,
        nivel_senioridade: candidato.nivel_senioridade || '',
        endereco: {
          cidade: candidato.endereco?.cidade || '',
          estado: candidato.endereco?.estado || '',
          latitude: candidato.endereco?.latitude,
          longitude: candidato.endereco?.longitude
        },
        salario_pretendido_de: candidato.salario_pretendido_de,
        salario_pretendido_ate: candidato.salario_pretendido_ate,
        tipo_contratacao_preferido: candidato.tipo_contratacao_preferido || '',
        modelo_trabalho_preferido: candidato.modelo_trabalho_preferido || '',
        portfolio_url: candidato.portfolio_url || '',
        linkedin_url: candidato.linkedin_url || '',
        github_url: candidato.github_url || '',
        site_pessoal: candidato.site_pessoal || '',
        data_disponibilidade: candidato.data_disponibilidade || '',
        disponivel_remoto: candidato.disponivel_remoto ?? true,
        disponivel_relocacao: candidato.disponivel_relocacao ?? false,
        habilidades_tecnicas: candidato.habilidades_tecnicas || [],
        idiomas: candidato.idiomas || [],
        formacao: candidato.formacao || [],
        certificacoes: candidato.certificacoes || [],
        experiencias: candidato.experiencias || [],
        disponivel_trabalho: candidato.disponivel_trabalho ?? true,
        aceita_propostas: candidato.aceita_propostas ?? true,
        visibilidade_perfil: candidato.visibilidade_perfil || 'publico',
        possui_cnh: candidato.possui_cnh || '',
        categoria_cnh: candidato.categoria_cnh || '',
        veiculo_proprio: candidato.veiculo_proprio || '',
        curriculo_pdf_url: candidato.curriculo_pdf_url || '',
        curriculo_pdf_nome: candidato.curriculo_pdf_nome || ''
      } as CurriculoFormData)

      // Reset disponibilidade
      setDisponibilidadeTipo(candidato.disponibilidade_tipo || 'imediato')
      setAvailabilitySettings({
        mudanca_cidade: candidato.mudanca_cidade || false,
        mudanca_estado: candidato.mudanca_estado || false,
        mudanca_pais: candidato.mudanca_pais || false,
        inicio_imediato: candidato.disponibilidade_tipo === 'imediato',
        aviso_previo: candidato.disponibilidade_tipo === 'com_aviso_previo',
        presencial: candidato.aceita_presencial ?? true,
        hibrido: candidato.aceita_hibrido ?? true,
        remoto: candidato.aceita_remoto ?? true
      })

      // Reset redes sociais
      setRedesSociais({
        linkedin_url: candidato.linkedin_url || '',
        github_url: candidato.github_url || '',
        site_pessoal: candidato.site_pessoal || '',
        portfolio_url: candidato.portfolio_url || '',
        instagram_url: candidato.instagram_url || '',
        facebook_url: candidato.facebook_url || '',
        youtube_url: candidato.youtube_url || ''
      })
    }
    setEditMode(false)
    clearError()
  }

  const scrollToSection = (sectionId: string) => {
    setActiveTab(sectionId)
    setActiveSection(sectionId)

    // Scroll suave para a seção
    const ref = (sectionRefs as any)[sectionId]
    if (ref?.current) {
      ref.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }

    // Fechar o TOC mobile após clicar
    if (window.innerWidth < 768) {
      setMobileTocOpen(false)
    }
  }

  // Observar qual seção está visível na tela
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id
            if (id) {
              setActiveSection(id)
            }
          }
        })
      },
      { threshold: 0.5 },
    )

    // Observar cada seção
    Object.keys(sectionRefs).forEach((key) => {
      const ref = (sectionRefs as any)[key]
      if (ref.current) {
        observer.observe(ref.current!)
      }
    })

    return () => {
      Object.keys(sectionRefs).forEach((key) => {
        const ref = (sectionRefs as any)[key]
        if (ref.current) {
          observer.unobserve(ref.current!)
        }
      })
    }
  }, [sectionRefs])

  // Skeleton loader component
  const CurriculoSkeleton = () => (
    <div className="w-full pb-16 relative">
      {/* Banner Skeleton */}
      <div className="bg-gradient-to-r from-[#4400CC] to-[#00FFAE] h-auto min-h-[144px] sm:min-h-[160px] flex flex-col justify-center px-4 sm:px-6 md:px-10 shadow-[0_0_20px_rgba(68,0,204,0.3)] relative py-6">
        <div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-32 bg-white/20" />
            <Skeleton className="h-6 w-20 bg-white/20 ml-2" />
          </div>
          <Skeleton className="h-5 w-64 bg-white/20 mt-2" />
        </div>
        <div className="absolute right-6 md:right-10 bottom-4">
          <Skeleton className="h-10 w-40 bg-white/20" />
        </div>
      </div>

      <div className="px-4 sm:px-6 md:px-10 mt-6 sm:mt-8 flex flex-col md:flex-row gap-4 sm:gap-6">
        {/* Desktop TOC Skeleton */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <div className="sticky top-4 bg-white rounded-lg border border-[#4400CC]/20 shadow-sm overflow-hidden">
            <div className="p-4">
              {/* Profile skeleton */}
              <div className="flex flex-col items-center text-center mb-6">
                <Skeleton className="w-24 h-24 rounded-full mb-3" />
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-6 w-20" />
              </div>

              {/* Navigation skeleton */}
              <div className="space-y-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-grow min-w-0">
          <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)]">
            <CardContent className="p-4 sm:p-6">
              {/* Tabs skeleton */}
              <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 mb-6 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>

              {/* Form content skeleton */}
              <div className="space-y-6">
                <div className="flex items-center mb-6">
                  <Skeleton className="h-6 w-6 mr-2" />
                  <Skeleton className="h-6 w-48" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Profile image section */}
                  <div className="space-y-4 md:col-span-2">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <div className="flex items-center gap-4">
                      <Skeleton className="w-24 h-24 rounded-full" />
                      <div>
                        <Skeleton className="h-10 w-32 mb-2" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                    </div>
                  </div>

                  {/* Form fields skeleton */}
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}

                  {/* Large text area */}
                  <div className="space-y-2 md:col-span-2">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                </div>

                {/* Action buttons skeleton */}
                <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
                  <Skeleton className="h-10 w-32" />
                  <div className="flex flex-col sm:flex-row gap-3 sm:space-x-1">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-36" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )

  // Show skeleton when loading
  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={['candidato']}>
        <CurriculoSkeleton />
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={['candidato']}>
      {/* Banner com gradiente roxo-azul neon */}
      <div className="bg-gradient-to-r from-[#4400CC] to-[#00FFAE] h-auto min-h-[144px] sm:min-h-[160px] px-4 sm:px-6 md:px-10 shadow-[0_0_20px_rgba(68,0,204,0.3)] py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">Currículo</h1>
              {isVerified && (
                <Badge className="bg-[#00FFAE] text-[#4400CC] hover:bg-[#00FFAE]/90 ml-2 flex items-center gap-1">
                  <CheckCircle2 size={14} /> Verificado
                </Badge>
              )}
            </div>
            <p className="text-base md:text-lg text-white/80 mt-2">
              Mantenha seu currículo atualizado para aumentar suas chances
            </p>
          </div>
          <div className="flex-shrink-0">
            {candidato?.id ? (
              <Link href={`/candidato/curriculo/visualizar/${candidato.id}`}>
                <Button className="bg-[#4400CC] hover:bg-[#3300AA] text-white font-medium shadow-[0_0_10px_rgba(68,0,204,0.3)] w-full md:w-auto">
                  <Eye size={16} className="mr-2" /> Visualizar Currículo
                </Button>
              </Link>
            ) : (
              <Button
                disabled
                className="bg-gray-400 text-white font-medium opacity-50 cursor-not-allowed w-full md:w-auto"
              >
                <Eye size={16} className="mr-2" /> Visualizar Currículo
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile TOC Toggle */}
      <div className="mobile-sticky-below-header md:hidden z-10 bg-white shadow-md p-3 [padding-left:max(0.75rem,env(safe-area-inset-left))] [padding-right:max(0.75rem,env(safe-area-inset-right))]">
        <Button
          variant="outline"
          className="w-full flex justify-between items-center border-[#4400CC]/30"
          onClick={() => setMobileTocOpen(!mobileTocOpen)}
          aria-expanded={mobileTocOpen}
          aria-controls="curriculo-mobile-navigation"
        >
          <div className="flex items-center">
            <Menu size={16} className="mr-2 text-[#4400CC]" />
            <span>Navegação do Currículo</span>
          </div>
          {mobileTocOpen ? (
            <ChevronUp size={16} className="text-[#4400CC]" />
          ) : (
            <ChevronDown size={16} className="text-[#4400CC]" />
          )}
        </Button>

        {mobileTocOpen && (
          <div id="curriculo-mobile-navigation" className="bg-white border border-[#4400CC]/20 rounded-md mt-1 shadow-lg p-2 max-h-[min(60dvh,28rem)] overflow-y-auto overscroll-contain">
            <div className="space-y-1">
              {Object.keys(sectionRefs).map((section) => (
                <Button
                  key={section}
                  variant="ghost"
                  className={`w-full justify-start text-left ${
                    activeSection === section ? "bg-[#4400CC]/10 text-[#4400CC] font-medium" : "text-gray-600"
                  }`}
                  onClick={() => scrollToSection(section)}
                >
                  {getTocIcon(section)}
                  <span className="ml-2">{getTocLabel(section)}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="px-4 sm:px-6 md:px-10 mt-6 sm:mt-8 flex flex-col md:flex-row gap-4 sm:gap-6">
        {/* Desktop Table of Contents - Visível apenas em telas maiores */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <div className="sticky top-4 bg-white rounded-lg border border-[#4400CC]/20 shadow-sm overflow-hidden">
            <div className="p-4">
              {/* Bloco 1: Perfil do candidato */}
              <div className="flex flex-col items-center text-center mb-6">
                {/* Foto de perfil */}
                <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden border border-[#4400CC]/30 flex items-center justify-center relative mb-3">
                  {profileImage ? (
                    <Image
                      src={profileImage || "/placeholder.svg"}
                      alt="Foto de perfil"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <User size={36} className="text-gray-400" />
                  )}
                </div>

                {/* Nome do Candidato */}
                <h3 className="font-medium text-gray-800 text-lg">{formData.nome_completo || "Nome não informado"}</h3>

                {/* Profissão */}
                <p className="text-sm text-gray-600 mb-2">{formData.titulo_profissional || "Profissão não informada"}</p>

                {/* Status de verificação */}
                {isVerified ? (
                  <Badge className="bg-[#00FFAE] text-[#4400CC] hover:bg-[#00FFAE]/90 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Verificado
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="border-amber-400 text-amber-600 hover:bg-amber-50 flex items-center gap-1"
                  >
                    <AlertCircle size={12} /> Não verificado
                  </Badge>
                )}
              </div>

              {/* Separador entre os blocos */}
              <div className="h-px bg-[#4400CC]/10 my-4"></div>

              {/* Bloco 2: Links de navegação */}
              <div className="space-y-1">
                {Object.keys(sectionRefs).map((section) => (
                  <Button
                    key={section}
                    variant="ghost"
                    className={`w-full justify-start text-left ${
                      activeSection === section ? "bg-[#4400CC]/10 text-[#4400CC] font-medium" : "text-gray-600"
                    }`}
                    onClick={() => scrollToSection(section)}
                  >
                    {getTocIcon(section)}
                    <span className="ml-2">{getTocLabel(section)}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="flex-grow min-w-0">
          <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)]">
            <CardContent className="p-4 sm:p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-6 flex h-auto w-full max-w-full justify-start gap-1 overflow-x-auto overscroll-x-contain bg-[#4400CC]/5 p-1 pb-2 [scrollbar-width:thin]">
                  <TabsTrigger
                    value="dados-pessoais"
                    className="min-h-11 min-w-max shrink-0 px-3 data-[state=active]:bg-[#4400CC] data-[state=active]:text-white"
                  >
                    <User size={16} className="mr-2 hidden md:inline" />
                    <span>Dados Pessoais</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="experiencia"
                    className="min-h-11 min-w-max shrink-0 px-3 data-[state=active]:bg-[#4400CC] data-[state=active]:text-white"
                  >
                    <Briefcase size={16} className="mr-2 hidden md:inline" />
                    <span>Experiência</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="formacao"
                    className="min-h-11 min-w-max shrink-0 px-3 data-[state=active]:bg-[#4400CC] data-[state=active]:text-white"
                  >
                    <GraduationCap size={16} className="mr-2 hidden md:inline" />
                    <span>Formação</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="idiomas"
                    className="min-h-11 min-w-max shrink-0 px-3 data-[state=active]:bg-[#4400CC] data-[state=active]:text-white"
                  >
                    <Languages size={16} className="mr-2 hidden md:inline" />
                    <span>Idiomas</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="diversidade"
                    className="min-h-11 min-w-max shrink-0 px-3 data-[state=active]:bg-[#4400CC] data-[state=active]:text-white"
                  >
                    <User size={16} className="mr-2 hidden md:inline" />
                    <span>Diversidade</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="redes-sociais"
                    className="min-h-11 min-w-max shrink-0 px-3 data-[state=active]:bg-[#4400CC] data-[state=active]:text-white"
                  >
                    <Linkedin size={16} className="mr-2 hidden md:inline" />
                    <span>Redes Sociais</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="habilitacao"
                    className="min-h-11 min-w-max shrink-0 px-3 data-[state=active]:bg-[#4400CC] data-[state=active]:text-white"
                  >
                    <Car size={16} className="mr-2 hidden md:inline" />
                    <span>Habilitação</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="disponibilidade"
                    className="min-h-11 min-w-max shrink-0 px-3 data-[state=active]:bg-[#4400CC] data-[state=active]:text-white"
                  >
                    <MapPin size={16} className="mr-2 hidden md:inline" />
                    <span>Disponibilidade</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="curriculo-pdf"
                    className="min-h-11 min-w-max shrink-0 px-3 data-[state=active]:bg-[#4400CC] data-[state=active]:text-white"
                  >
                    <Upload size={16} className="mr-2 hidden md:inline" />
                    <span>Currículo PDF</span>
                  </TabsTrigger>
                </TabsList>

                {/* Conteúdo das tabs */}
                <TabsContent value="dados-pessoais" id="dados-pessoais" ref={sectionRefs["dados-pessoais"]}>
                  <div>
                    <h2 className="text-xl font-medium text-gray-800 mb-6 flex items-center">
                      <User size={20} className="mr-2 text-[#4400CC]" />
                      Informações Pessoais
                      {editMode && <Badge className="ml-3 bg-[#00FFAE] text-[#4400CC]">Editando</Badge>}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4 md:col-span-2">
                        <Label className="text-gray-700">Foto de perfil</Label>
                        <div className="flex items-center gap-4">
                          <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden border border-[#4400CC]/30 flex items-center justify-center relative">
                            {profileImage ? (
                              <Image
                                src={profileImage || "/placeholder.svg"}
                                alt="Foto de perfil"
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <User size={32} className="text-gray-400" />
                            )}
                          </div>
                          {editMode && (
                            <div>
                              <label htmlFor="profile-upload-tab" className={`cursor-pointer ${isUploadingImage ? 'pointer-events-none' : ''}`}>
                                <div className={`flex items-center gap-2 bg-[#4400CC]/10 hover:bg-[#4400CC]/20 text-[#4400CC] px-4 py-2 rounded-md ${isUploadingImage ? 'opacity-50' : ''}`}>
                                  <Upload size={16} />
                                  <span>{isUploadingImage ? 'Enviando...' : 'Carregar foto'}</span>
                                </div>
                                <input
                                  type="file"
                                  id="profile-upload-tab"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={handleImageUpload}
                                  disabled={!editMode || isUploadingImage}
                                />
                              </label>
                              <p className="text-xs text-gray-500 mt-2">Recomendado: JPG, PNG. Máx 5MB</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="nome" className="text-gray-700">
                          Nome completo
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="nome"
                            placeholder="Seu nome completo"
                            autoComplete="name"
                            enterKeyHint="next"
                            className="text-base border-[#4400CC]/30 focus-visible:ring-[#4400CC]"
                            disabled={!editMode}
                            value={formData.nome_completo || ''}
                            onChange={(e) => handleInputChange('nome_completo', e.target.value)}
                          />
                          {isVerified && (
                            <CheckCircle2
                              size={20}
                              className="text-[#4400CC] flex-shrink-0"
                            />
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="titulo_profissional" className="text-gray-700">
                          Título Profissional
                        </Label>
                        <Input
                          id="titulo_profissional"
                          placeholder="Ex: Desenvolvedor Full Stack, Analista de Dados, Designer UX/UI"
                          autoComplete="organization-title"
                          enterKeyHint="next"
                          className="text-base border-[#4400CC]/30 focus-visible:ring-[#4400CC]"
                          disabled={!editMode}
                          value={formData.titulo_profissional || ''}
                          onChange={(e) => handleInputChange('titulo_profissional', e.target.value)}
                        />
                        <p className="text-xs text-gray-500">
                          Como você gostaria de ser encontrado por recrutadores
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700">
                          E-mail
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="seu@email.com"
                          autoComplete="email"
                          inputMode="email"
                          className="text-base border-gray-300 bg-gray-50 focus-visible:ring-gray-300"
                          disabled={true}
                          value={(formData as CurriculoFormData).email || ''}
                          readOnly
                        />
                        <p className="text-xs text-gray-500">
                          O e-mail não pode ser alterado aqui. Para alterar o e-mail, acesse as configurações da conta.
                        </p>
                      </div>

                      <div>
                        <PhoneInput
                          value={formData.telefone || ''}
                          onChange={(value) => handleInputChange('telefone', value)}
                          disabled={!editMode}
                          label="Telefone"
                          placeholder="(00) 0 0000-0000"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="nascimento" className="text-gray-700">
                          Data de nascimento
                        </Label>
                        <Input
                          id="nascimento"
                          type="date"
                          className="border-[#4400CC]/30 focus-visible:ring-[#4400CC]"
                          disabled={!editMode}
                          value={formData.data_nascimento || ''}
                          onChange={(e) => handleInputChange('data_nascimento', e.target.value)}
                        />
                      </div>

                      <div className="space-y-4 md:col-span-2">
                        <h3 className="font-medium text-gray-800 flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-[#4400CC]" />
                          Endereço
                        </h3>

                        {editMode ? (
                          <SimpleLocationSelector
                            value={{
                              cidade: formData.endereco?.cidade || '',
                              estado: formData.endereco?.estado || '',
                              latitude: formData.endereco?.latitude,
                              longitude: formData.endereco?.longitude
                            }}
                            onChange={(location) => {
                              setFormData(prev => ({
                                ...prev,
                                endereco: {
                                  cidade: location.cidade,
                                  estado: location.estado,
                                  latitude: location.latitude,
                                  longitude: location.longitude
                                }
                              }))
                            }}
                            disabled={!editMode}
                          />
                        ) : (
                          <div className="text-gray-700">
                            {formData.endereco?.cidade && formData.endereco?.estado ? (
                              <p>{formData.endereco.cidade}, {formData.endereco.estado}</p>
                            ) : (
                              <p className="text-gray-400">Endereço não informado</p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="sobre" className="text-gray-700">
                          Sobre você
                        </Label>
                        <Textarea
                          id="sobre"
                          placeholder="Descreva brevemente sua experiência e objetivos profissionais"
                          className="border-[#4400CC]/30 focus-visible:ring-[#4400CC] min-h-[120px]"
                          disabled={!editMode}
                          value={formData.bio || ''}
                          onChange={(e) => handleInputChange('bio', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="experiencia" id="experiencia" ref={sectionRefs["experiencia"]}>
                  <div>
                    <h2 className="text-xl font-medium text-gray-800 mb-6 flex items-center">
                      <Briefcase size={20} className="mr-2 text-[#4400CC]" />
                      Experiência Profissional
                    </h2>
                    <ExperienceManager
                      experiences={formData.experiencias || []}
                      onChange={(experiences) => handleInputChange('experiencias', experiences)}
                      disabled={!editMode}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="formacao" id="formacao" ref={sectionRefs["formacao"]}>
                  <div>
                    <h2 className="text-xl font-medium text-gray-800 mb-6 flex items-center">
                      <GraduationCap size={20} className="mr-2 text-[#4400CC]" />
                      Formação Acadêmica
                    </h2>
                    <EducationManager
                      educations={formData.formacao || []}
                      onChange={(educations) => handleInputChange('formacao', educations)}
                      disabled={!editMode}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="idiomas" id="idiomas" ref={sectionRefs["idiomas"]}>
                  <div>
                    <h2 className="text-xl font-medium text-gray-800 mb-6 flex items-center">
                      <Languages size={20} className="mr-2 text-[#4400CC]" />
                      Idiomas
                    </h2>
                    <LanguageManager
                      languages={formData.idiomas || []}
                      onChange={(languages) => handleInputChange('idiomas', languages)}
                      disabled={!editMode}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="diversidade" id="diversidade" ref={sectionRefs["diversidade"]}>
                  <div>
                    <h2 className="text-xl font-medium text-gray-800 mb-6 flex items-center">
                      <UserCheck size={20} className="mr-2 text-[#4400CC]" />
                      Diversidade
                      {editMode && <Badge className="ml-3 bg-[#00FFAE] text-[#4400CC]">Editando</Badge>}
                    </h2>
                    <div className="space-y-6">
                      <p className="text-gray-600 mb-4">
                        Estas informações são opcionais e ajudam empresas com programas de diversidade e inclusão a
                        encontrar seu perfil.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="genero" className="text-gray-700">
                            Gênero
                          </Label>
                          <Select 
                            disabled={!editMode} 
                            value={formData.genero || ''}
                            onValueChange={(value) => handleInputChange('genero', value)}
                          >
                            <SelectTrigger id="genero" className="border-[#4400CC]/30 focus:ring-[#4400CC]">
                              <SelectValue placeholder="Selecione seu gênero" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="masculino">Masculino</SelectItem>
                              <SelectItem value="feminino">Feminino</SelectItem>
                              <SelectItem value="nao-binario">Não-binário</SelectItem>
                              <SelectItem value="outro">Outro</SelectItem>
                              <SelectItem value="prefiro-nao-informar">Prefiro não informar</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-gray-700">
                            Raça/Etnia
                          </Label>
                          <Select
                            disabled={!editMode}
                            value={formData.raca_etnia || ''}
                            onValueChange={(value) => handleInputChange('raca_etnia', value)}
                          >
                            <SelectTrigger className="border-[#4400CC]/30 focus:ring-[#4400CC]">
                              <SelectValue placeholder="Selecione sua raça/etnia" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="branco">Branco</SelectItem>
                              <SelectItem value="preto">Preto</SelectItem>
                              <SelectItem value="pardo">Pardo</SelectItem>
                              <SelectItem value="amarelo">Amarelo</SelectItem>
                              <SelectItem value="indigena">Indígena</SelectItem>
                              <SelectItem value="prefiro-nao-informar">Prefiro não informar</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-gray-700">
                            Orientação Sexual
                          </Label>
                          <Select
                            disabled={!editMode}
                            value={formData.orientacao_sexual || ''}
                            onValueChange={(value) => handleInputChange('orientacao_sexual', value)}
                          >
                            <SelectTrigger className="border-[#4400CC]/30 focus:ring-[#4400CC]">
                              <SelectValue placeholder="Selecione sua orientação sexual" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="heterossexual">Heterossexual</SelectItem>
                              <SelectItem value="homossexual">Homossexual</SelectItem>
                              <SelectItem value="bissexual">Bissexual</SelectItem>
                              <SelectItem value="pansexual">Pansexual</SelectItem>
                              <SelectItem value="assexual">Assexual</SelectItem>
                              <SelectItem value="outro">Outro</SelectItem>
                              <SelectItem value="prefiro-nao-informar">Prefiro não informar</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-gray-700">
                            Pessoa com Deficiência (PcD)
                          </Label>
                          <Select
                            disabled={!editMode}
                            value={formData.pcd || ''}
                            onValueChange={(value) => handleInputChange('pcd', value)}
                          >
                            <SelectTrigger className="border-[#4400CC]/30 focus:ring-[#4400CC]">
                              <SelectValue placeholder="Você é uma pessoa com deficiência?" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sim">Sim</SelectItem>
                              <SelectItem value="nao">Não</SelectItem>
                              <SelectItem value="prefiro-nao-informar">Prefiro não informar</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="redes-sociais" id="redes-sociais" ref={sectionRefs["redes-sociais"]}>
                  <div>
                    <h2 className="text-xl font-medium text-gray-800 mb-6 flex items-center">
                      <Globe size={20} className="mr-2 text-[#4400CC]" />
                      Redes Sociais e Links
                      {editMode && <Badge className="ml-3 bg-[#00FFAE] text-[#4400CC]">Editando</Badge>}
                    </h2>
                    <div className="space-y-6">
                      {editMode ? (
                        <SocialMediaLinks
                          value={redesSociais}
                          onChange={(data) => {
                            setRedesSociais({
                              linkedin_url: data.linkedin_url || '',
                              github_url: data.github_url || '',
                              site_pessoal: data.site_pessoal || '',
                              portfolio_url: data.portfolio_url || '',
                              instagram_url: data.instagram_url || '',
                              facebook_url: data.facebook_url || '',
                              youtube_url: data.youtube_url || ''
                            })
                          }}
                          disabled={!editMode}
                        />
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(redesSociais).map(([key, value]) => {
                            if (!value) return null

                            const socialConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
                              linkedin_url: { label: 'LinkedIn', icon: <Linkedin className="h-4 w-4" />, color: '#0A66C2' },
                              github_url: { label: 'GitHub', icon: <Github className="h-4 w-4" />, color: '#181717' },
                              site_pessoal: { label: 'Site Pessoal', icon: <Globe className="h-4 w-4" />, color: '#4400CC' },
                              portfolio_url: { label: 'Portfólio', icon: <Globe className="h-4 w-4" />, color: '#4400CC' },
                              instagram_url: { label: 'Instagram', icon: <Instagram className="h-4 w-4" />, color: '#E4405F' },
                              facebook_url: { label: 'Facebook', icon: <Facebook className="h-4 w-4" />, color: '#1877F2' },
                              youtube_url: { label: 'YouTube', icon: <Youtube className="h-4 w-4" />, color: '#FF0000' }
                            }

                            const config = socialConfig[key]
                            if (!config) return null

                            return (
                              <div key={key} className="flex items-center gap-2">
                                <span style={{ color: config.color }}>{config.icon}</span>
                                <a href={value} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: config.color }}>
                                  {config.label}
                                </a>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="habilitacao" id="habilitacao" ref={sectionRefs["habilitacao"]}>
                  <div>
                    <h2 className="text-xl font-medium text-gray-800 mb-6 flex items-center">
                      <Car size={20} className="mr-2 text-[#4400CC]" />
                      Habilitação
                      {editMode && <Badge className="ml-3 bg-[#00FFAE] text-[#4400CC]">Editando</Badge>}
                    </h2>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="possui-cnh" className="text-gray-700">
                            Possui CNH?
                          </Label>
                          <Select
                            disabled={!editMode}
                            value={formData.possui_cnh || ''}
                            onValueChange={(value) => handleInputChange('possui_cnh', value)}
                          >
                            <SelectTrigger id="possui-cnh" className="border-[#4400CC]/30 focus:ring-[#4400CC]">
                              <SelectValue placeholder="Selecione uma opção" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sim">Sim</SelectItem>
                              <SelectItem value="nao">Não</SelectItem>
                              <SelectItem value="em-andamento">Em andamento</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="categoria-cnh" className="text-gray-700">
                            Categoria
                          </Label>
                          <Select
                            disabled={!editMode}
                            value={formData.categoria_cnh || ''}
                            onValueChange={(value) => handleInputChange('categoria_cnh', value)}
                          >
                            <SelectTrigger id="categoria-cnh" className="border-[#4400CC]/30 focus:ring-[#4400CC]">
                              <SelectValue placeholder="Selecione a categoria" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="a">A</SelectItem>
                              <SelectItem value="b">B</SelectItem>
                              <SelectItem value="ab">AB</SelectItem>
                              <SelectItem value="c">C</SelectItem>
                              <SelectItem value="d">D</SelectItem>
                              <SelectItem value="e">E</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="veiculo-proprio" className="text-gray-700">
                            Possui veículo próprio?
                          </Label>
                          <Select
                            disabled={!editMode}
                            value={formData.veiculo_proprio || ''}
                            onValueChange={(value) => handleInputChange('veiculo_proprio', value)}
                          >
                            <SelectTrigger id="veiculo-proprio" className="border-[#4400CC]/30 focus:ring-[#4400CC]">
                              <SelectValue placeholder="Selecione uma opção" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sim">Sim</SelectItem>
                              <SelectItem value="nao">Não</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="disponibilidade" id="disponibilidade" ref={sectionRefs["disponibilidade"]}>
                  <div>
                    <h2 className="text-xl font-medium text-gray-800 mb-6 flex items-center">
                      <MapPin size={20} className="mr-2 text-[#4400CC]" />
                      Disponibilidade
                      {editMode && <Badge className="ml-3 bg-[#00FFAE] text-[#4400CC]">Editando</Badge>}
                    </h2>

                    <div className="space-y-8">
                      {/* Disponibilidade para início */}
                      <Card className="p-4 sm:p-6 border-[#4400CC]/20 bg-[#4400CC]/5">
                        <div className="space-y-4">
                          <Label className="text-base font-semibold text-gray-900 flex items-center">
                            <Clock size={18} className="mr-2 text-[#4400CC]" />
                            Disponibilidade para Início
                          </Label>
                          <AvailabilityRadio
                            value={disponibilidadeTipo}
                            onChange={(tipo) => setDisponibilidadeTipo(tipo)}
                            disabled={!editMode}
                          />
                        </div>
                      </Card>

                      {/* Modalidade de trabalho */}
                      <Card className="p-4 sm:p-6 border-[#4400CC]/20 bg-[#4400CC]/5">
                        <div className="space-y-4">
                          <Label className="text-base font-semibold text-gray-900 flex items-center">
                            <Briefcase size={18} className="mr-2 text-[#4400CC]" />
                            Modalidade de Trabalho
                          </Label>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 bg-white">
                              <Checkbox
                                id="presencial"
                                disabled={!editMode}
                                checked={availabilitySettings.presencial}
                                onCheckedChange={(checked) =>
                                  setAvailabilitySettings(prev => ({ ...prev, presencial: !!checked }))
                                }
                              />
                              <Label htmlFor="presencial" className="text-sm font-medium cursor-pointer flex-1">
                                Presencial
                              </Label>
                            </div>
                            <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 bg-white">
                              <Checkbox
                                id="hibrido"
                                disabled={!editMode}
                                checked={availabilitySettings.hibrido}
                                onCheckedChange={(checked) =>
                                  setAvailabilitySettings(prev => ({ ...prev, hibrido: !!checked }))
                                }
                              />
                              <Label htmlFor="hibrido" className="text-sm font-medium cursor-pointer flex-1">
                                Híbrido
                              </Label>
                            </div>
                            <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 bg-white">
                              <Checkbox
                                id="remoto"
                                disabled={!editMode}
                                checked={availabilitySettings.remoto}
                                onCheckedChange={(checked) => {
                                  setAvailabilitySettings(prev => ({ ...prev, remoto: !!checked }))
                                }}
                              />
                              <Label htmlFor="remoto" className="text-sm font-medium cursor-pointer flex-1">
                                Remoto
                              </Label>
                            </div>
                          </div>
                        </div>
                      </Card>

                      {/* Disponibilidade para mudança */}
                      <Card className="p-4 sm:p-6 border-[#4400CC]/20 bg-[#4400CC]/5">
                        <div className="space-y-4">
                          <Label className="text-base font-semibold text-gray-900 flex items-center">
                            <Building size={18} className="mr-2 text-[#4400CC]" />
                            Disponibilidade para Mudança
                          </Label>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 bg-white">
                              <Checkbox
                                id="mudanca-cidade"
                                disabled={!editMode}
                                checked={availabilitySettings.mudanca_cidade}
                                onCheckedChange={(checked) =>
                                  setAvailabilitySettings(prev => ({ ...prev, mudanca_cidade: !!checked }))
                                }
                              />
                              <Label htmlFor="mudanca-cidade" className="text-sm font-medium cursor-pointer flex-1">
                                Disponível para mudar de cidade
                              </Label>
                            </div>
                            <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 bg-white">
                              <Checkbox
                                id="mudanca-estado"
                                disabled={!editMode}
                                checked={availabilitySettings.mudanca_estado}
                                onCheckedChange={(checked) =>
                                  setAvailabilitySettings(prev => ({ ...prev, mudanca_estado: !!checked }))
                                }
                              />
                              <Label htmlFor="mudanca-estado" className="text-sm font-medium cursor-pointer flex-1">
                                Disponível para mudar de estado
                              </Label>
                            </div>
                            <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 bg-white">
                              <Checkbox
                                id="mudanca-pais"
                                disabled={!editMode}
                                checked={availabilitySettings.mudanca_pais}
                                onCheckedChange={(checked) =>
                                  setAvailabilitySettings(prev => ({ ...prev, mudanca_pais: !!checked }))
                                }
                              />
                              <Label htmlFor="mudanca-pais" className="text-sm font-medium cursor-pointer flex-1">
                                Disponível para mudar de país
                              </Label>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="curriculo-pdf" id="curriculo-pdf" ref={sectionRefs["curriculo-pdf"]}>
                  <div>
                    <h2 className="text-xl font-medium text-gray-800 mb-6 flex items-center">
                      <FileText size={20} className="mr-2 text-[#4400CC]" />
                      Currículo em PDF
                      {editMode && <Badge className="ml-3 bg-[#00FFAE] text-[#4400CC]">Editando</Badge>}
                    </h2>
                    <div className="space-y-6">
                      {editMode ? (
                        <PDFUpload
                          userId={user!.id}
                          currentPdfUrl={formData.curriculo_pdf_url}
                          currentPdfName={formData.curriculo_pdf_nome}
                          onUploadSuccess={(url: string, fileName: string) => {
                            setFormData(prev => ({
                              ...prev,
                              curriculo_pdf_url: url,
                              curriculo_pdf_nome: fileName
                            }))
                          }}
                          onRemove={() => {
                            setFormData(prev => ({
                              ...prev,
                              curriculo_pdf_url: '',
                              curriculo_pdf_nome: ''
                            }))
                          }}
                          disabled={!editMode}
                        />
                      ) : formData.curriculo_pdf_url ? (
                        <div className="flex items-center gap-3 p-4 border border-[#4400CC]/20 rounded-lg bg-[#4400CC]/5">
                          <FileText className="h-6 w-6 text-[#4400CC]" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{formData.curriculo_pdf_nome}</p>
                            <p className="text-sm text-gray-600">Currículo em PDF</p>
                          </div>
                          <Link href={formData.curriculo_pdf_url} target="_blank">
                            <Button className="bg-[#4400CC] text-white">Visualizar</Button>
                          </Link>
                        </div>
                      ) : (
                        <p className="text-gray-400">Nenhum currículo em PDF enviado</p>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* Botões de ação (aparecem em todas as tabs) */}
                <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                    {!editMode && (
                      <Button 
                        variant="outline" 
                        className="w-full sm:w-auto min-h-11 border-[#4400CC] text-[#4400CC] hover:bg-[#4400CC]/5"
                        onClick={() => setEditMode(true)}
                      >
                        <User size={16} className="mr-2" /> Editar Perfil
                      </Button>
                    )}
                    {error && (
                      <div className="text-red-600 text-sm">
                        {error}
                      </div>
                    )}
                  </div>
                  {editMode && (
                    <div className="flex flex-col-reverse sm:flex-row gap-3">
                      <Button
                        variant="outline"
                        className="w-full sm:w-auto min-h-11 border-[#0057FF] text-[#0057FF] hover:bg-[#0057FF]/5"
                        onClick={handleCancelChanges}
                        disabled={isSaving}
                      >
                        <X size={16} className="mr-2" /> Cancelar
                      </Button>
                      <Button
                        className="w-full sm:w-auto min-h-11 bg-[#4400CC] hover:bg-[#3300AA] text-white shadow-[0_0_10px_rgba(68,0,204,0.2)]"
                        onClick={() => {
                          // Salvar apenas os dados da aba ativa
                          if (activeTab === 'dados-pessoais') {
                            handleSaveDadosPessoais()
                          } else {
                            handleSaveChanges()
                          }
                        }}
                        disabled={isSaving || isLoading}
                      >
                        <Save size={16} className="mr-2" />
                        {isSaving ? 'Salvando...' : 'Salvar alterações'}
                      </Button>
                    </div>
                  )}
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}

// Função auxiliar para obter o ícone correto para cada seção no TOC
function getTocIcon(section: string) {
  switch (section) {
    case "dados-pessoais":
      return <User size={16} className="text-[#4400CC]" />
    case "experiencia":
      return <Briefcase size={16} className="text-[#4400CC]" />
    case "formacao":
      return <GraduationCap size={16} className="text-[#4400CC]" />
    case "idiomas":
      return <Languages size={16} className="text-[#4400CC]" />
    case "diversidade":
      return <UserCheck size={16} className="text-[#4400CC]" />
    case "redes-sociais":
      return <Linkedin size={16} className="text-[#4400CC]" />
    case "habilitacao":
      return <Car size={16} className="text-[#4400CC]" />
    case "disponibilidade":
      return <MapPin size={16} className="text-[#4400CC]" />
    case "curriculo-pdf":
      return <Upload size={16} className="text-[#4400CC]" />
    default:
      return <ChevronRight size={16} className="text-[#4400CC]" />
  }
}

// Função auxiliar para obter o rótulo correto para cada seção no TOC
function getTocLabel(section: string) {
  switch (section) {
    case "dados-pessoais":
      return "Dados Pessoais"
    case "experiencia":
      return "Experiência Profissional"
    case "formacao":
      return "Formação Acadêmica"
    case "idiomas":
      return "Idiomas"
    case "diversidade":
      return "Diversidade"
    case "redes-sociais":
      return "Redes Sociais"
    case "habilitacao":
      return "Habilitação"
    case "disponibilidade":
      return "Disponibilidade"
    case "curriculo-pdf":
      return "Currículo PDF"
    default:
      return section
  }
}
