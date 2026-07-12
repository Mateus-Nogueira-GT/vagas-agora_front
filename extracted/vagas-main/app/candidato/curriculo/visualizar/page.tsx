"use client"

import Link from "next/link"
import {
  ChevronRight,
  Edit,
  Download,
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Github,
  Calendar,
  ArrowLeft,
  FileText,
  Eye,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"

export default function ViewResume() {
  const { user } = useAuth()
  const [isVerified, setIsVerified] = useState(false)

  // Verificar status da assinatura
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
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
    }

    checkSubscriptionStatus()
  }, [user?.id])
  // Dados de exemplo para o currículo
  const resume = {
    personalInfo: {
      name: "João Silva",
      title: "Desenvolvedor Frontend Senior",
      email: "joao.silva@email.com",
      phone: "(11) 98765-4321",
      location: "São Paulo, SP",
      website: "joaosilva.dev",
      linkedin: "linkedin.com/in/joaosilva",
      github: "github.com/joaosilva",
    },
    summary:
      "Desenvolvedor Frontend com mais de 5 anos de experiência em criação de interfaces modernas e responsivas. Especialista em React, TypeScript e UI/UX. Apaixonado por criar experiências de usuário intuitivas e de alta performance. Busco constantemente aprender novas tecnologias e metodologias para aprimorar meu trabalho.",
    experience: [
      {
        company: "TechCorp Solutions",
        position: "Desenvolvedor Frontend Senior",
        period: "Jan 2021 - Presente",
        description:
          "Desenvolvimento de aplicações web utilizando React, TypeScript e Next.js. Implementação de arquitetura de componentes reutilizáveis e design system. Mentoria de desenvolvedores juniores e participação em decisões técnicas.",
        achievements: [
          "Reduzi o tempo de carregamento da aplicação principal em 40%",
          "Implementei testes automatizados aumentando a cobertura para 85%",
          "Liderei a migração do projeto para TypeScript e Next.js",
        ],
      },
      {
        company: "Design Studio",
        position: "Desenvolvedor Frontend Pleno",
        period: "Mar 2019 - Dez 2020",
        description:
          "Desenvolvimento de interfaces para aplicações web e mobile utilizando React e React Native. Colaboração com designers UX/UI para implementação de protótipos e melhorias de usabilidade.",
        achievements: [
          "Desenvolvi componentes reutilizáveis que reduziram o tempo de desenvolvimento em 30%",
          "Implementei melhorias de acessibilidade em toda a plataforma",
          "Participei da criação de um design system utilizado em múltiplos projetos",
        ],
      },
      {
        company: "Startup XYZ",
        position: "Desenvolvedor Frontend Júnior",
        period: "Jun 2017 - Fev 2019",
        description:
          "Desenvolvimento de interfaces utilizando HTML, CSS e JavaScript. Implementação de designs responsivos e otimização para diferentes dispositivos.",
        achievements: [
          "Contribuí para o redesign completo do site principal da empresa",
          "Implementei melhorias de SEO que aumentaram o tráfego orgânico em 25%",
          "Desenvolvi landing pages para campanhas de marketing",
        ],
      },
    ],
    education: [
      {
        institution: "Universidade Federal",
        degree: "Bacharelado em Ciência da Computação",
        period: "2013 - 2017",
        description: "Formação com ênfase em desenvolvimento de software e experiência do usuário.",
      },
      {
        institution: "Bootcamp de Desenvolvimento Web",
        degree: "Certificação em Desenvolvimento Frontend",
        period: "2017",
        description: "Curso intensivo focado em tecnologias web modernas.",
      },
    ],
    languages: [
      { language: "Português", level: "Nativo" },
      { language: "Inglês", level: "Fluente" },
      { language: "Espanhol", level: "Intermediário" },
    ],
    skills: [
      "React",
      "TypeScript",
      "JavaScript",
      "HTML5",
      "CSS3",
      "Sass",
      "Styled Components",
      "Redux",
      "Next.js",
      "Jest",
      "Testing Library",
      "Git",
      "Webpack",
      "UI/UX",
      "Design Responsivo",
      "Acessibilidade Web",
    ],
    certifications: [
      {
        name: "React Advanced Patterns",
        issuer: "Frontend Masters",
        date: "2022",
      },
      {
        name: "TypeScript Professional",
        issuer: "Udemy",
        date: "2021",
      },
      {
        name: "Web Accessibility",
        issuer: "Google",
        date: "2020",
      },
    ],
    additionalInfo:
      "Participação em eventos e conferências de tecnologia. Contribuições para projetos open source. Mentor em programas de desenvolvimento para iniciantes na área de tecnologia.",
  }

  return (
    <div className="w-full pb-16">
      {/* Banner com gradiente roxo-azul neon */}
      <div className="bg-gradient-to-r from-[#4400CC] to-[#00FFAE] min-h-[160px] flex flex-col justify-center px-4 sm:px-6 md:px-10 py-6 shadow-[0_0_20px_rgba(68,0,204,0.3)]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">Visualização do Currículo</h1>
            <p className="text-base md:text-lg text-white/80 mt-2">Veja como seu currículo aparece para recrutadores</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 md:mt-0">
            <Link href="/candidato/curriculo">
              <Button className="w-full min-h-11 bg-[#4400CC] hover:bg-[#3300AA] text-white shadow-[0_0_10px_rgba(68,0,204,0.2)]">
                <Edit size={16} className="mr-2" /> Editar
              </Button>
            </Link>
            <Button className="w-full min-h-11 bg-[#0057FF] hover:bg-[#0044CC] text-white shadow-[0_0_10px_rgba(0,87,255,0.2)]">
              <Download size={16} className="mr-2" /> Baixar PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="px-4 sm:px-6 md:px-10 py-4 flex items-center text-sm min-w-0 overflow-hidden">
        <Link href="/curriculo" className="text-[#4400CC] hover:text-[#3300AA] flex items-center">
          <ArrowLeft size={14} className="mr-1" />
          Voltar para Currículo
        </Link>
        <ChevronRight size={14} className="mx-2 text-gray-400" />
        <span className="text-gray-600">Visualizar</span>
      </div>

      {/* Visualização do currículo */}
      <div className="px-4 sm:px-6 md:px-10">
        <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)]">
          <CardContent className="p-4 sm:p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Bloco lateral com foto de perfil */}
              <div className="w-full md:w-64 flex-shrink-0">
                <div className="flex flex-col items-center">
                  {/* Foto de perfil */}
                  <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-[#4400CC]/20 shadow-lg mb-4">
                    <img
                      src="/black-man-business-headshot.png"
                      alt="Foto de perfil"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>

                  {/* Nome e profissão */}
                  <h2 className="text-2xl font-bold text-gray-800 text-center">{resume.personalInfo.name}</h2>
                  <p className="text-lg text-[#4400CC] font-medium mb-2 text-center">{resume.personalInfo.title}</p>

                  {/* Status de verificado */}
                  {isVerified ? (
                    <div className="flex items-center bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium mb-6">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1.5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Verificado
                    </div>
                  ) : (
                    <div className="flex items-center bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full text-sm font-medium mb-6">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1.5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Não verificado
                    </div>
                  )}

                  {/* Informações de contato */}
                  <div className="w-full space-y-2 border-t border-gray-200 pt-4">
                    <div className="flex items-center text-gray-600">
                      <Mail size={14} className="text-[#4400CC] mr-2" />
                      <span>{resume.personalInfo.email}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Phone size={14} className="text-[#4400CC] mr-2" />
                      <span>{resume.personalInfo.phone}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin size={14} className="text-[#4400CC] mr-2" />
                      <span>{resume.personalInfo.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Globe size={14} className="text-[#4400CC] mr-2" />
                      <a
                        href={`https://${resume.personalInfo.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#4400CC] hover:underline"
                      >
                        {resume.personalInfo.website}
                      </a>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Linkedin size={14} className="text-[#4400CC] mr-2" />
                      <a
                        href={`https://${resume.personalInfo.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#4400CC] hover:underline"
                      >
                        {resume.personalInfo.linkedin}
                      </a>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Github size={14} className="text-[#4400CC] mr-2" />
                      <a
                        href={`https://${resume.personalInfo.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#4400CC] hover:underline"
                      >
                        {resume.personalInfo.github}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Conteúdo principal do currículo */}
              <div className="flex-1 min-w-0">
                <Separator className="my-6 bg-[#4400CC]/10" />

                {/* Resumo profissional */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-[#4400CC] mb-3">Sobre você</h3>
                  <p className="text-gray-700">
                    Profissional com mais de 5 anos de experiência em desenvolvimento de software, especializado em
                    tecnologias web e mobile. Busco oportunidades para aplicar minhas habilidades em projetos inovadores
                    e desafiadores.
                  </p>
                </div>

                {/* Experiência profissional */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-[#4400CC] mb-4">Experiência Profissional</h3>
                  <div className="p-4 border border-[#4400CC]/20 rounded-lg bg-[#4400CC]/5 mb-4">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                      <div>
                        <h4 className="font-medium text-gray-800">Desenvolvedor Full Stack</h4>
                        <p className="text-[#0057FF] font-medium">Tech Solutions Ltda</p>
                      </div>
                      <div className="flex items-center mt-2 md:mt-0 text-gray-600">
                        <Calendar size={14} className="mr-1" />
                        <span>Mar 2020 - Jan 2023</span>
                      </div>
                    </div>
                    <p className="text-gray-700 mt-2">
                      Desenvolvimento de aplicações web e mobile utilizando React, React Native e Node.js. Implementação
                      de APIs RESTful e integração com serviços de terceiros. Participação em todo o ciclo de
                      desenvolvimento, desde o planejamento até a implantação.
                    </p>
                  </div>
                </div>

                {/* Formação acadêmica */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-[#4400CC] mb-4">Formação Acadêmica</h3>
                  <div className="p-4 border border-[#4400CC]/20 rounded-lg bg-[#4400CC]/5">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                      <div>
                        <h4 className="font-medium text-gray-800">Ciência da Computação</h4>
                        <p className="text-[#4400CC] font-medium">Universidade Federal de São Paulo</p>
                      </div>
                      <div className="flex items-center mt-2 md:mt-0 text-gray-600">
                        <span>Graduação • Concluído</span>
                      </div>
                    </div>
                    <div className="flex items-center mt-2 text-gray-600">
                      <Calendar size={14} className="mr-1" />
                      <span>Fev 2014 - Dez 2018</span>
                    </div>
                  </div>
                </div>

                {/* Idiomas */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-[#4400CC] mb-4">Idiomas</h3>
                  <div className="p-4 border border-[#4400CC]/20 rounded-lg bg-[#4400CC]/5">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <p className="font-medium text-gray-800">Inglês</p>
                      <p className="text-gray-600">Avançado</p>
                    </div>
                  </div>
                </div>

                {/* Diversidade */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-[#4400CC] mb-4">Diversidade</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-[#4400CC]/20 rounded-lg bg-[#4400CC]/5">
                      <p className="font-medium text-gray-800">Gênero</p>
                      <p className="text-gray-600">Masculino</p>
                    </div>
                    <div className="p-4 border border-[#4400CC]/20 rounded-lg bg-[#4400CC]/5">
                      <p className="font-medium text-gray-800">Raça/Etnia</p>
                      <p className="text-gray-600">Preto</p>
                    </div>
                    <div className="p-4 border border-[#4400CC]/20 rounded-lg bg-[#4400CC]/5">
                      <p className="font-medium text-gray-800">Orientação Sexual</p>
                      <p className="text-gray-600">Prefiro não informar</p>
                    </div>
                    <div className="p-4 border border-[#4400CC]/20 rounded-lg bg-[#4400CC]/5">
                      <p className="font-medium text-gray-800">Pessoa com Deficiência (PcD)</p>
                      <p className="text-gray-600">Não</p>
                    </div>
                  </div>
                </div>

                {/* Redes Sociais */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-[#4400CC] mb-4">Redes Sociais</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-[#4400CC]/20 rounded-lg bg-[#4400CC]/5">
                      <div className="flex items-center">
                        <Linkedin size={16} className="text-[#0077B5] mr-2" />
                        <p className="font-medium text-gray-800">LinkedIn</p>
                      </div>
                      <a href="https://linkedin.com/in/joao-silva" className="text-[#4400CC] hover:underline">
                        linkedin.com/in/joao-silva
                      </a>
                    </div>
                    <div className="p-4 border border-[#4400CC]/20 rounded-lg bg-[#4400CC]/5">
                      <div className="flex items-center">
                        <Github size={16} className="text-gray-800 mr-2" />
                        <p className="font-medium text-gray-800">GitHub</p>
                      </div>
                      <a href="https://github.com/joaosilva-dev" className="text-[#4400CC] hover:underline">
                        github.com/joaosilva-dev
                      </a>
                    </div>
                    <div className="p-4 border border-[#4400CC]/20 rounded-lg bg-[#4400CC]/5 md:col-span-2">
                      <div className="flex items-center">
                        <Globe size={16} className="text-[#4400CC] mr-2" />
                        <p className="font-medium text-gray-800">Site/Portfólio</p>
                      </div>
                      <a href="https://joaosilva.dev" className="text-[#4400CC] hover:underline">
                        joaosilva.dev
                      </a>
                    </div>
                  </div>
                </div>

                {/* Habilitação */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-[#4400CC] mb-4">Habilitação</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border border-[#4400CC]/20 rounded-lg bg-[#4400CC]/5">
                      <p className="font-medium text-gray-800">Possui CNH?</p>
                      <p className="text-gray-600">Sim</p>
                    </div>
                    <div className="p-4 border border-[#4400CC]/20 rounded-lg bg-[#4400CC]/5">
                      <p className="font-medium text-gray-800">Categoria</p>
                      <p className="text-gray-600">B</p>
                    </div>
                    <div className="p-4 border border-[#4400CC]/20 rounded-lg bg-[#4400CC]/5">
                      <p className="font-medium text-gray-800">Veículo próprio</p>
                      <p className="text-gray-600">Sim</p>
                    </div>
                  </div>
                </div>

                {/* Disponibilidade */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-[#4400CC] mb-4">Disponibilidade</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <p className="font-medium text-gray-800">Disponibilidade para mudança</p>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded-sm bg-[#4400CC] mr-2 flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-white"
                            >
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </div>
                          <p className="text-gray-700">Disponível para mudar de cidade</p>
                        </div>
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded-sm bg-[#4400CC] mr-2 flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-white"
                            >
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </div>
                          <p className="text-gray-700">Disponível para mudar de estado</p>
                        </div>
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded-sm border border-gray-300 mr-2"></div>
                          <p className="text-gray-700">Disponível para mudar de país</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="font-medium text-gray-800">Modalidade de trabalho</p>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded-sm bg-[#4400CC] mr-2 flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-white"
                            >
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </div>
                          <p className="text-gray-700">Presencial</p>
                        </div>
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded-sm bg-[#4400CC] mr-2 flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-white"
                            >
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </div>
                          <p className="text-gray-700">Híbrido</p>
                        </div>
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded-sm bg-[#4400CC] mr-2 flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-white"
                            >
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </div>
                          <p className="text-gray-700">Remoto</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Currículo PDF */}
                <div>
                  <h3 className="text-lg font-medium text-[#4400CC] mb-4">Currículo em PDF</h3>
                  <div className="p-4 border border-[#4400CC]/20 rounded-lg bg-[#4400CC]/5 flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText size={20} className="text-[#4400CC] mr-3" />
                      <div>
                        <p className="font-medium text-gray-800">curriculo-joao-silva.pdf</p>
                        <p className="text-sm text-gray-600">Última atualização: 15/05/2023</p>
                      </div>
                    </div>
                    <Button variant="outline" className="border-[#4400CC] text-[#4400CC]">
                      <Eye size={16} className="mr-2" /> Visualizar PDF
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
