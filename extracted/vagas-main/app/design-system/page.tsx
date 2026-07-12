"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import {
  Search,
  User,
  Briefcase,
  MapPin,
  Calendar,
  Star,
  Heart,
  Eye,
  Download,
  Settings,
  Bell,
  Mail,
  Phone,
  Globe,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  Filter,
  SortAsc,
} from "lucide-react"

export default function DesignSystemPage() {
  const [sliderValue, setSliderValue] = useState([50])

  const colors = [
    { name: "Roxo Principal", value: "#4400CC", description: "Cor primária do sistema" },
    { name: "Verde Sucesso", value: "#00FFAE", description: "Indicadores de sucesso e ações positivas" },
    { name: "Azul Informação", value: "#0057FF", description: "Links e informações importantes" },
    { name: "Amarelo Alerta", value: "#FFB800", description: "Alertas e avisos importantes" },
    { name: "Cinza Escuro", value: "#1F2937", description: "Textos principais" },
    { name: "Cinza Médio", value: "#6B7280", description: "Textos secundários" },
    { name: "Cinza Claro", value: "#F3F4F6", description: "Backgrounds e divisores" },
    { name: "Branco", value: "#FFFFFF", description: "Background principal" },
  ]

  const typography = [
    { name: "Heading 1", class: "text-4xl font-bold", sample: "Título Principal" },
    { name: "Heading 2", class: "text-3xl font-bold", sample: "Título Secundário" },
    { name: "Heading 3", class: "text-2xl font-bold", sample: "Título Terciário" },
    { name: "Heading 4", class: "text-xl font-bold", sample: "Subtítulo" },
    { name: "Body Large", class: "text-lg font-normal", sample: "Texto corpo grande" },
    { name: "Body Regular", class: "text-base font-normal", sample: "Texto corpo regular" },
    { name: "Body Small", class: "text-sm font-normal", sample: "Texto corpo pequeno" },
    { name: "Caption", class: "text-xs font-normal", sample: "Texto de legenda" },
  ]

  const spacing = [
    { name: "xs", value: "0.25rem", class: "p-1" },
    { name: "sm", value: "0.5rem", class: "p-2" },
    { name: "md", value: "1rem", class: "p-4" },
    { name: "lg", value: "1.5rem", class: "p-6" },
    { name: "xl", value: "2rem", class: "p-8" },
    { name: "2xl", value: "3rem", class: "p-12" },
  ]

  const icons = [
    { name: "Search", icon: Search },
    { name: "User", icon: User },
    { name: "Briefcase", icon: Briefcase },
    { name: "MapPin", icon: MapPin },
    { name: "Calendar", icon: Calendar },
    { name: "Star", icon: Star },
    { name: "Heart", icon: Heart },
    { name: "Eye", icon: Eye },
    { name: "Download", icon: Download },
    { name: "Settings", icon: Settings },
    { name: "Bell", icon: Bell },
    { name: "Mail", icon: Mail },
    { name: "Phone", icon: Phone },
    { name: "Globe", icon: Globe },
    { name: "ChevronRight", icon: ChevronRight },
    { name: "Plus", icon: Plus },
    { name: "Edit", icon: Edit },
    { name: "Trash2", icon: Trash2 },
    { name: "Filter", icon: Filter },
    { name: "SortAsc", icon: SortAsc },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-[#4400CC] mb-4">Design System</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Guia completo de estilos e componentes do sistema <strong>Vagas Agora</strong>
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="colors" className="space-y-8">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="colors">Cores</TabsTrigger>
            <TabsTrigger value="typography">Tipografia</TabsTrigger>
            <TabsTrigger value="components">Componentes</TabsTrigger>
            <TabsTrigger value="spacing">Espaçamento</TabsTrigger>
            <TabsTrigger value="icons">Ícones</TabsTrigger>
            <TabsTrigger value="layouts">Layouts</TabsTrigger>
          </TabsList>

          {/* Cores */}
          <TabsContent value="colors" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Paleta de Cores</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {colors.map((color, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="h-24 w-full" style={{ backgroundColor: color.value }} />
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-gray-800">{color.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{color.value}</p>
                      <p className="text-xs text-gray-500 mt-2">{color.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Tipografia */}
          <TabsContent value="typography" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Tipografia</h2>
              <Card>
                <CardContent className="p-6 space-y-6">
                  {typography.map((type, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-b-0"
                    >
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-2">{type.name}</p>
                        <p className={type.class + " text-gray-800"}>{type.sample}</p>
                      </div>
                      <code className="text-sm bg-gray-100 px-3 py-1 rounded">{type.class}</code>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Componentes */}
          <TabsContent value="components" className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Componentes</h2>

              {/* Botões */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Botões</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-3">Variações Principais</h4>
                    <div className="flex flex-wrap gap-4">
                      <Button className="bg-[#4400CC] hover:bg-[#3300AA] text-white">Primário</Button>
                      <Button variant="outline" className="border-[#4400CC]/30 text-[#4400CC] hover:bg-[#4400CC]/5">
                        Secundário
                      </Button>
                      <Button variant="ghost" className="text-[#4400CC] hover:bg-[#4400CC]/5">
                        Ghost
                      </Button>
                      <Button disabled>Desabilitado</Button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-800 mb-3">Tamanhos</h4>
                    <div className="flex flex-wrap items-center gap-4">
                      <Button size="sm" className="bg-[#4400CC] hover:bg-[#3300AA] text-white">
                        Pequeno
                      </Button>
                      <Button className="bg-[#4400CC] hover:bg-[#3300AA] text-white">Padrão</Button>
                      <Button size="lg" className="bg-[#4400CC] hover:bg-[#3300AA] text-white">
                        Grande
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-800 mb-3">Com Ícones</h4>
                    <div className="flex flex-wrap gap-4">
                      <Button className="bg-[#4400CC] hover:bg-[#3300AA] text-white">
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar
                      </Button>
                      <Button variant="outline" className="border-[#4400CC]/30 text-[#4400CC] hover:bg-[#4400CC]/5">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Inputs */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Campos de Entrada</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="input-normal">Input Normal</Label>
                      <Input
                        id="input-normal"
                        placeholder="Digite aqui..."
                        className="border-[#4400CC]/30 focus-visible:ring-[#4400CC]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="input-disabled">Input Desabilitado</Label>
                      <Input id="input-disabled" placeholder="Desabilitado" disabled />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="input-search">Input com Ícone</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="input-search"
                          placeholder="Buscar..."
                          className="pl-10 border-[#4400CC]/30 focus-visible:ring-[#4400CC]"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Badges */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Badges</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    <Badge className="bg-[#4400CC] text-white">Primário</Badge>
                    <Badge className="bg-[#00FFAE] text-[#4400CC]">Sucesso</Badge>
                    <Badge className="bg-[#0057FF] text-white">Informação</Badge>
                    <Badge className="bg-[#FFB800] text-white">Alerta</Badge>
                    <Badge variant="outline" className="border-[#4400CC]/30 text-[#4400CC]">
                      Outline
                    </Badge>
                    <Badge variant="secondary">Secundário</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Controles */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Controles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-3">Checkbox e Radio</h4>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="checkbox1" />
                        <Label htmlFor="checkbox1">Checkbox padrão</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="checkbox2" checked />
                        <Label htmlFor="checkbox2">Checkbox marcado</Label>
                      </div>
                      <RadioGroup defaultValue="option1" className="flex space-x-6">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="option1" id="option1" />
                          <Label htmlFor="option1">Opção 1</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="option2" id="option2" />
                          <Label htmlFor="option2">Opção 2</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-800 mb-3">Switch</h4>
                    <div className="flex items-center space-x-2">
                      <Switch id="switch1" />
                      <Label htmlFor="switch1">Ativar notificações</Label>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-800 mb-3">Slider</h4>
                    <div className="space-y-2">
                      <Label>Faixa salarial: R$ {sliderValue[0] * 100}</Label>
                      <Slider
                        value={sliderValue}
                        onValueChange={setSliderValue}
                        max={100}
                        step={1}
                        className="w-full max-w-sm"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cards */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Cards</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)]">
                      <CardHeader>
                        <CardTitle className="text-[#4400CC]">Card Padrão</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600">Conteúdo do card com estilo padrão do sistema.</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-[#4400CC] to-[#3300AA] text-white">
                      <CardHeader>
                        <CardTitle>Card com Gradiente</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>Card com fundo gradiente para destaque especial.</p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Espaçamento */}
          <TabsContent value="spacing" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Sistema de Espaçamento</h2>
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {spacing.map((space, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">{space.name}</code>
                          <span className="text-gray-600">{space.value}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="bg-[#4400CC] h-4" style={{ width: space.value }} />
                          <code className="text-sm text-gray-500">{space.class}</code>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Ícones */}
          <TabsContent value="icons" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Biblioteca de Ícones</h2>
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {icons.map((icon, index) => {
                      const IconComponent = icon.icon
                      return (
                        <div
                          key={index}
                          className="flex flex-col items-center space-y-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          <IconComponent className="h-6 w-6 text-[#4400CC]" />
                          <span className="text-xs text-gray-600 text-center">{icon.name}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Layouts */}
          <TabsContent value="layouts" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Estruturas de Layout</h2>

              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Grid System</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-3">Grid 12 Colunas</h4>
                    <div className="grid grid-cols-12 gap-4">
                      {Array.from({ length: 12 }, (_, i) => (
                        <div key={i} className="bg-[#4400CC]/10 border border-[#4400CC]/30 p-2 text-center text-xs">
                          {i + 1}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-800 mb-3">Layouts Responsivos</h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-[#4400CC]/10 border border-[#4400CC]/30 p-4 text-center">
                          <p className="text-sm">1 col mobile</p>
                          <p className="text-sm">2 col tablet</p>
                          <p className="text-sm">4 col desktop</p>
                        </div>
                        <div className="bg-[#4400CC]/10 border border-[#4400CC]/30 p-4 text-center">
                          <p className="text-sm">Card 2</p>
                        </div>
                        <div className="bg-[#4400CC]/10 border border-[#4400CC]/30 p-4 text-center">
                          <p className="text-sm">Card 3</p>
                        </div>
                        <div className="bg-[#4400CC]/10 border border-[#4400CC]/30 p-4 text-center">
                          <p className="text-sm">Card 4</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Estrutura de Página</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-[#4400CC] text-white p-4 text-center">Header / Navegação</div>
                    <div className="flex">
                      <div className="bg-gray-100 p-4 w-64 hidden md:block">Sidebar</div>
                      <div className="flex-1 p-4">
                        <div className="bg-gray-50 p-4 rounded mb-4">Conteúdo Principal</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-4 rounded">Card 1</div>
                          <div className="bg-gray-50 p-4 rounded">Card 2</div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-200 p-4 text-center">Footer</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
