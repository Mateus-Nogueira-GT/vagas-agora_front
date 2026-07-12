"use client"

import { useEffect, useState } from "react"
import { Search, Filter, Download, Plus, Edit, Trash, MoreHorizontal, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { supabase } from "@/lib/supabase"
import toast from "react-hot-toast"

interface ProfissaoAnalise {
  titulo: string
  total_candidatos?: number
  total_vagas?: number
  categoria?: string
}

export default function AdminProfissoes() {
  const [profissoesCandidatos, setProfissoesCandidatos] = useState<ProfissaoAnalise[]>([])
  const [profissoesVagas, setProfissoesVagas] = useState<ProfissaoAnalise[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProfissoesAnalise()
  }, [])

  const loadProfissoesAnalise = async () => {
    try {
      setLoading(true)
      setError(null)

      // Buscar títulos profissionais dos candidatos
      const { data: candidatosData, error: candidatosError } = await supabase
        .from('candidatos')
        .select('titulo_profissional')
        .not('titulo_profissional', 'is', null)
        .not('titulo_profissional', 'eq', '')

      if (candidatosError) {
        console.error('Erro ao buscar candidatos:', candidatosError)
      } else if (candidatosData) {
        // Agrupar e contar por título
        const contagem: Record<string, number> = {}
        candidatosData.forEach((c) => {
          const titulo = c.titulo_profissional
          if (titulo) {
            contagem[titulo] = (contagem[titulo] || 0) + 1
          }
        })
        
        const resultado = Object.entries(contagem)
          .map(([titulo, total_candidatos]) => ({ titulo, total_candidatos }))
          .sort((a, b) => b.total_candidatos - a.total_candidatos)
          .slice(0, 20)
        
        setProfissoesCandidatos(resultado)
      }

      // Buscar títulos das vagas mais comuns
      const { data: vagasData, error: vagasError } = await supabase
        .from('vagas')
        .select('titulo')

      if (vagasError) {
        console.error('Erro ao buscar vagas:', vagasError)
      } else if (vagasData) {
        // Agrupar e contar por título
        const contagem: Record<string, number> = {}
        vagasData.forEach((v) => {
          const titulo = v.titulo
          if (titulo) {
            contagem[titulo] = (contagem[titulo] || 0) + 1
          }
        })
        
        const resultado = Object.entries(contagem)
          .map(([titulo, total_vagas]) => ({ titulo, total_vagas }))
          .sort((a, b) => b.total_vagas - a.total_vagas)
          .slice(0, 20)
        
        setProfissoesVagas(resultado)
      }

    } catch (error) {
      console.error('Erro ao carregar análise de profissões:', error)
      setError('Erro ao carregar análise de profissões')
      toast.error('Erro ao carregar análise de profissões')
    } finally {
      setLoading(false)
    }
  }

  // Estatísticas
  const stats = [
    {
      title: "Total de Profissões",
      value: profissoesCandidatos.length.toString(),
      change: "+15",
      positive: true,
    },
    {
      title: "Profissões Ativas",
      value: profissoesVagas.length.toString(),
      change: "+12",
      positive: true,
    },
    {
      title: "Candidatos Analisados",
      value: profissoesCandidatos.reduce((acc, p) => acc + (p.total_candidatos || 0), 0).toString(),
      change: "+5",
      positive: true,
    },
    {
      title: "Profissão Mais Comum",
      value: profissoesCandidatos[0]?.titulo || "N/A",
      change: "",
      positive: true,
    },
  ]

  // Dados de exemplo para a tabela de profissões
  const profissoes = [
    {
      id: 1,
      nome: "Desenvolvedor Front-end",
      categoria: "Tecnologia",
      vagas: 45,
      candidatos: 120,
      status: "Ativa",
      dataCriacao: "15/07/2023",
    },
    {
      id: 2,
      nome: "Desenvolvedor Back-end",
      categoria: "Tecnologia",
      vagas: 38,
      candidatos: 95,
      status: "Ativa",
      dataCriacao: "22/05/2023",
    },
    {
      id: 3,
      nome: "UX/UI Designer",
      categoria: "Design",
      vagas: 27,
      candidatos: 85,
      status: "Ativa",
      dataCriacao: "10/06/2023",
    },
    {
      id: 4,
      nome: "Analista de Dados",
      categoria: "Tecnologia",
      vagas: 32,
      candidatos: 78,
      status: "Ativa",
      dataCriacao: "05/07/2023",
    },
    {
      id: 5,
      nome: "Gerente de Projetos",
      categoria: "Gestão",
      vagas: 18,
      candidatos: 65,
      status: "Ativa",
      dataCriacao: "18/04/2023",
    },
    {
      id: 6,
      nome: "Analista de Marketing",
      categoria: "Marketing",
      vagas: 22,
      candidatos: 70,
      status: "Ativa",
      dataCriacao: "30/05/2023",
    },
    {
      id: 7,
      nome: "Desenvolvedor Mobile",
      categoria: "Tecnologia",
      vagas: 30,
      candidatos: 85,
      status: "Ativa",
      dataCriacao: "12/06/2023",
    },
    {
      id: 8,
      nome: "Analista de RH",
      categoria: "Recursos Humanos",
      vagas: 15,
      candidatos: 60,
      status: "Inativa",
      dataCriacao: "25/05/2023",
    },
  ]

  return (
    <div className="w-full pb-10">
      {/* Cabeçalho */}
      <div className="bg-gradient-to-r from-[#4400CC] to-[#00FFAE] h-[200px] flex flex-col justify-center px-6 md:px-10 shadow-[0_0_20px_rgba(68,0,204,0.3)]">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">Gerenciar Profissões</h1>
            <p className="text-base md:text-lg text-white/90 mt-2">
              Visualize e gerencie todas as profissões da plataforma
            </p>
          </div>
          <div className="flex space-x-2">
            <Button className="bg-white text-[#4400CC] hover:bg-white/90">
              <Filter className="mr-2 h-4 w-4" />
              Filtrar
            </Button>
            <Button className="bg-white text-[#4400CC] hover:bg-white/90">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="px-6 md:px-10 mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)] hover:shadow-[0_0_20px_rgba(68,0,204,0.2)] transition-all"
          >
            <CardContent className="p-6">
              <div className="flex flex-col">
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-[#4400CC] mt-1">{stat.value}</p>
                {stat.change && (
                  <p className={`text-xs ${stat.positive ? "text-green-500" : "text-red-500"} mt-1`}>
                    {stat.positive ? "+" : ""}
                    {stat.change} este mês
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Barra de pesquisa e filtros */}
      <div className="px-6 md:px-10 mt-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Buscar profissões..."
              className="pl-10 bg-white border-[#4400CC]/30 focus-visible:ring-[#4400CC]"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-[#4400CC]/30 text-[#4400CC] hover:bg-[#4400CC]/5">
              <Filter className="mr-2 h-4 w-4" />
              Filtros avançados
            </Button>
            <Button className="bg-[#4400CC] hover:bg-[#3300AA] text-white">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar profissão
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs e Tabela */}
      <div className="px-6 md:px-10 mt-6">
        <Tabs defaultValue="todas" className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-3 h-auto p-1 bg-[#4400CC]/10">
            <TabsTrigger value="todas" className="py-2 data-[state=active]:bg-[#4400CC] data-[state=active]:text-white">
              Todas
            </TabsTrigger>
            <TabsTrigger
              value="ativas"
              className="py-2 data-[state=active]:bg-[#4400CC] data-[state=active]:text-white"
            >
              Ativas
            </TabsTrigger>
            <TabsTrigger
              value="inativas"
              className="py-2 data-[state=active]:bg-[#4400CC] data-[state=active]:text-white"
            >
              Inativas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="todas" className="mt-6">
            <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)]">
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#4400CC]/20">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          <div className="flex items-center">
                            Nome
                            <ArrowUpDown size={14} className="ml-1" />
                          </div>
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Categoria</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Vagas</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Candidatos</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          <div className="flex items-center">
                            Data de Criação
                            <ArrowUpDown size={14} className="ml-1" />
                          </div>
                        </th>
                        <th className="text-right py-3 px-4 font-medium text-gray-600">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profissoes.map((profissao) => (
                        <tr key={profissao.id} className="border-b border-[#4400CC]/10 hover:bg-[#4400CC]/5">
                          <td className="py-3 px-4 text-gray-800">{profissao.nome}</td>
                          <td className="py-3 px-4 text-gray-600">{profissao.categoria}</td>
                          <td className="py-3 px-4 text-gray-600">{profissao.vagas}</td>
                          <td className="py-3 px-4 text-gray-600">{profissao.candidatos}</td>
                          <td className="py-3 px-4">
                            <Badge
                              className={`${
                                profissao.status === "Ativa" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}
                            >
                              {profissao.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{profissao.dataCriacao}</td>
                          <td className="py-3 px-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>Editar</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  {profissao.status === "Ativa" ? (
                                    <>
                                      <Trash className="mr-2 h-4 w-4" />
                                      <span>Inativar</span>
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="mr-2 h-4 w-4" />
                                      <span>Ativar</span>
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Trash className="mr-2 h-4 w-4" />
                                  <span>Excluir</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginação */}
                <div className="flex items-center justify-center mt-6 gap-4">
                  <Button
                    variant="outline"
                    className="border-[#4400CC]/30 text-[#4400CC] hover:bg-[#4400CC]/5"
                    disabled
                  >
                    Anterior
                  </Button>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Página</span>
                    <Input
                      type="number"
                      min="1"
                      max="46"
                      defaultValue="1"
                      className="w-16 h-8 text-center border-[#4400CC]/30 focus-visible:ring-[#4400CC]"
                    />
                    <span className="text-sm text-gray-600">de 46</span>
                  </div>
                  <Button variant="outline" className="border-[#4400CC]/30 text-[#4400CC] hover:bg-[#4400CC]/5">
                    Próximo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ativas" className="mt-6">
            <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)]">
              <CardContent className="p-6">
                <p className="text-center text-gray-600">Exibindo profissões ativas</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inativas" className="mt-6">
            <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)]">
              <CardContent className="p-6">
                <p className="text-center text-gray-600">Exibindo profissões inativas</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
