"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ChevronRight,
  Eye,
  Users,
  Clock,
  MousePointer,
  Calendar,
  Search,
  UserPlus,
  ExternalLink,
  ArrowLeft,
  ChevronDown,
  Filter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import dynamic from 'next/dynamic'

const AreaChart = dynamic(
  () => import('@/components/charts').then(mod => ({ default: mod.AreaChart })),
  { 
    loading: () => <div className="h-[300px] animate-pulse bg-gray-100 rounded" />,
    ssr: false 
  }
)

const BarChart = dynamic(
  () => import('@/components/charts').then(mod => ({ default: mod.BarChart })),
  { 
    loading: () => <div className="h-[300px] animate-pulse bg-gray-100 rounded" />,
    ssr: false 
  }
)

export default function ResumeViews() {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("7d")
  
  const handlePeriodChange = (value: string) => {
    if (value === "7d" || value === "30d" || value === "90d") {
      setPeriod(value)
    }
  }

  // Dados de exemplo para o gráfico
  const chartData = {
    "7d": [
      { date: "Seg", views: 3 },
      { date: "Ter", views: 5 },
      { date: "Qua", views: 2 },
      { date: "Qui", views: 7 },
      { date: "Sex", views: 4 },
      { date: "Sáb", views: 1 },
      { date: "Dom", views: 2 },
    ],
    "30d": [
      { date: "Semana 1", views: 12 },
      { date: "Semana 2", views: 19 },
      { date: "Semana 3", views: 15 },
      { date: "Semana 4", views: 22 },
    ],
    "90d": [
      { date: "Janeiro", views: 45 },
      { date: "Fevereiro", views: 58 },
      { date: "Março", views: 37 },
    ],
  }

  // Estatísticas
  const stats = [
    {
      icon: Eye,
      color: "#4400CC",
      title: "Total de visualizações",
      value: "124",
      change: "+15%",
      positive: true,
    },
    {
      icon: Users,
      color: "#0057FF",
      title: "Visualizações únicas",
      value: "87",
      change: "+8%",
      positive: true,
    },
    {
      icon: Clock,
      color: "#00FFAE",
      title: "Tempo médio",
      value: "2m 45s",
      change: "+12%",
      positive: true,
    },
    {
      icon: MousePointer,
      color: "#FFB800",
      title: "Taxa de cliques",
      value: "18%",
      change: "-3%",
      positive: false,
    },
  ]

  // Dados de exemplo para visualizações recentes
  const recentViews = [
    {
      id: 1,
      company: "TechCorp Solutions",
      logo: "TC",
      date: "Hoje, 10:30",
      duration: "3m 12s",
      source: "Busca",
      sourceIcon: Search,
      sourceColor: "#4400CC",
    },
    {
      id: 2,
      company: "Design Studio",
      logo: "DS",
      date: "Hoje, 08:15",
      duration: "1m 45s",
      source: "Indicação",
      sourceIcon: UserPlus,
      sourceColor: "#00FFAE",
    },
    {
      id: 3,
      company: "Startup XYZ",
      logo: "SX",
      date: "Ontem, 16:20",
      duration: "4m 30s",
      source: "Link direto",
      sourceIcon: ExternalLink,
      sourceColor: "#0057FF",
    },
    {
      id: 4,
      company: "Big Tech Inc",
      logo: "BT",
      date: "Ontem, 11:05",
      duration: "2m 10s",
      source: "Busca",
      sourceIcon: Search,
      sourceColor: "#4400CC",
    },
    {
      id: 5,
      company: "Recrutador anônimo",
      logo: "?",
      date: "22/04/2023, 14:30",
      duration: "1m 55s",
      source: "Busca",
      sourceIcon: Search,
      sourceColor: "#4400CC",
    },
  ]

  // Dados de exemplo para empresas que mais visualizaram
  const topCompanies = [
    { name: "TechCorp Solutions", views: 12 },
    { name: "Design Studio", views: 8 },
    { name: "Startup XYZ", views: 6 },
    { name: "Big Tech Inc", views: 5 },
  ]

  return (
    <div className="w-full pb-10">
      {/* Banner com gradiente roxo-azul neon */}
      <div className="bg-gradient-to-r from-[#4400CC] to-[#00FFAE] min-h-[144px] sm:min-h-[160px] flex flex-col justify-center px-4 sm:px-6 md:px-10 py-6 shadow-[0_0_20px_rgba(68,0,204,0.3)]">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">Visualizações do Currículo</h1>
        <p className="text-base md:text-lg text-white/80 mt-2">Acompanhe quem visualizou seu currículo</p>
      </div>

      {/* Breadcrumb */}
      <div className="px-4 sm:px-6 md:px-10 py-4 flex items-center text-sm min-w-0 overflow-hidden">
        <Link href="/curriculo" className="text-[#4400CC] hover:text-[#3300AA] flex items-center">
          <ArrowLeft size={14} className="mr-1" />
          Voltar para Currículo
        </Link>
        <ChevronRight size={14} className="mx-2 text-gray-400" />
        <span className="text-gray-600">Visualizações</span>
      </div>

      <div className="px-4 sm:px-6 md:px-10">
        {/* Filtros por período */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h2 className="text-xl font-medium text-gray-800 mb-4 md:mb-0">Análise de visualizações</h2>
          <div className="flex flex-wrap gap-2">
            <Tabs defaultValue="7d" value={period} onValueChange={handlePeriodChange} className="w-auto">
              <TabsList className="bg-white border border-[#4400CC]/20 p-1">
                <TabsTrigger
                  value="7d"
                  className="data-[state=active]:bg-[#4400CC] data-[state=active]:text-white px-4"
                >
                  7 dias
                </TabsTrigger>
                <TabsTrigger
                  value="30d"
                  className="data-[state=active]:bg-[#4400CC] data-[state=active]:text-white px-4"
                >
                  30 dias
                </TabsTrigger>
                <TabsTrigger
                  value="90d"
                  className="data-[state=active]:bg-[#4400CC] data-[state=active]:text-white px-4"
                >
                  90 dias
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Button variant="outline" className="border-[#4400CC]/30 text-[#4400CC] hover:bg-[#4400CC]/5">
              <Calendar size={16} className="mr-2" /> Período personalizado
            </Button>

            <Button variant="outline" className="border-[#4400CC]/30 text-[#4400CC] hover:bg-[#4400CC]/5">
              <Filter size={16} className="mr-2" /> Filtros <ChevronDown size={14} className="ml-1" />
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)] hover:shadow-[0_0_20px_rgba(68,0,204,0.2)] transition-all"
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${stat.color}20` }}
                  >
                    <stat.icon size={20} style={{ color: stat.color }} />
                  </div>
                  <div
                    className={`text-xs font-medium px-2 py-1 rounded-full flex items-center ${
                      stat.positive ? "bg-[#4400CC]/20 text-[#4400CC]" : "bg-[#FF4D4D]/20 text-[#FF4D4D]"
                    }`}
                  >
                    {stat.change}
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold" style={{ color: stat.color }}>
                    {stat.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Gráfico de visualizações */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)] lg:col-span-2">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800">Visualizações ao longo do tempo</h3>
                <Select defaultValue="area">
                  <SelectTrigger className="w-[140px] border-[#4400CC]/30 focus:ring-[#4400CC] h-8">
                    <SelectValue placeholder="Tipo de gráfico" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="area">Área</SelectItem>
                    <SelectItem value="bar">Barras</SelectItem>
                    <SelectItem value="line">Linha</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="h-[300px] w-full">
                <AreaChart
                  data={chartData[period]}
                  xField="date"
                  yField="views"
                  color="#4400CC"
                  gradientFrom="#4400CC"
                  gradientTo="#4400CC10"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)]">
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Empresas que mais visualizaram</h3>
              <div className="h-[300px] w-full">
                <BarChart
                  data={topCompanies}
                  xField="name"
                  yField="views"
                  color="#0057FF"
                  gradientFrom="#0057FF"
                  gradientTo="#0057FF10"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de visualizações recentes */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Visualizações recentes</h3>
          <div className="space-y-4">
            {recentViews.map((view) => (
              <Card
                key={view.id}
                className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)] hover:shadow-[0_0_20px_rgba(68,0,204,0.2)] transition-all"
              >
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-start">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-[#4400CC]/10 to-[#0057FF]/10 flex items-center justify-center">
                      <span className="text-lg font-bold text-[#4400CC]">{view.logo}</span>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                          <h4 className="font-medium text-gray-800">{view.company}</h4>
                          <div className="flex items-center text-gray-600 text-sm mt-1">
                            <Calendar size={14} className="mr-1" />
                            <span>{view.date}</span>
                            <span className="mx-2">•</span>
                            <Clock size={14} className="mr-1" />
                            <span>{view.duration}</span>
                          </div>
                        </div>
                        <div className="mt-2 md:mt-0 flex items-center">
                          <Badge
                            className="flex items-center"
                            style={{
                              backgroundColor: `${view.sourceColor}20`,
                              color: view.sourceColor,
                            }}
                          >
                            <view.sourceIcon size={12} className="mr-1" />
                            {view.source}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge variant="outline" className="border-[#4400CC]/30 text-gray-700 text-xs">
                          Visualizou seção de experiência
                        </Badge>
                        <Badge variant="outline" className="border-[#4400CC]/30 text-gray-700 text-xs">
                          Visualizou seção de habilidades
                        </Badge>
                        <Badge variant="outline" className="border-[#4400CC]/30 text-gray-700 text-xs">
                          Baixou currículo
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-6 flex justify-center">
            <Button variant="outline" className="border-[#4400CC]/30 text-[#4400CC] hover:bg-[#4400CC]/5">
              Carregar mais visualizações
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
