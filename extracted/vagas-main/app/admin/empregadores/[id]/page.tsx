import {
  ArrowLeft,
  Building,
  Briefcase,
  Users,
  DollarSign,
  Calendar,
  Check,
  X,
  Download,
  Mail,
  Eye,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

export default function EmpregadorDetalhes({ params }: { params: { id: string } }) {
  // Dados de exemplo para o empregador
  const empregador = {
    id: params.id,
    nome: "TechCorp Solutions",
    email: "contato@techcorp.com",
    telefone: "(11) 3456-7890",
    setor: "Tecnologia",
    status: "Verificado",
    plano: "Premium",
    dataCadastro: "15/07/2023",
    ultimoAcesso: "Hoje, 10:45",
    endereco: "Av. Paulista, 1000 - Bela Vista, São Paulo - SP, 01310-100",
    cnpj: "12.345.678/0001-90",
    responsavel: "Carlos Oliveira",
    descricao:
      "A TechCorp Solutions é uma empresa líder em soluções tecnológicas, especializada em desenvolvimento de software, consultoria em TI e serviços de cloud computing.",
    site: "www.techcorp.com",
    logo: "TC",
  }

  // Estatísticas
  const stats = [
    {
      icon: Briefcase,
      color: "#4400CC",
      title: "Vagas Publicadas",
      value: "12",
      change: "+3",
      positive: true,
    },
    {
      icon: Users,
      color: "#0057FF",
      title: "Candidaturas",
      value: "245",
      change: "+18%",
      positive: true,
    },
    {
      icon: Calendar,
      color: "#00FFAE",
      title: "Dias na Plataforma",
      value: "120",
      change: "",
      positive: true,
    },
    {
      icon: DollarSign,
      color: "#FFB800",
      title: "Valor Pago",
      value: "R$ 1.290",
      change: "",
      positive: true,
    },
  ]

  // Histórico de assinatura
  const assinaturas = [
    {
      id: 1,
      plano: "Premium",
      dataInicio: "15/07/2023",
      dataFim: "15/10/2023",
      valor: "R$ 499,00",
      status: "Ativo",
      metodoPagamento: "Cartão de Crédito",
    },
    {
      id: 2,
      plano: "Standard",
      dataInicio: "15/04/2023",
      dataFim: "15/07/2023",
      valor: "R$ 299,00",
      status: "Concluído",
      metodoPagamento: "Cartão de Crédito",
    },
    {
      id: 3,
      plano: "Básico",
      dataInicio: "15/01/2023",
      dataFim: "15/04/2023",
      valor: "R$ 199,00",
      status: "Concluído",
      metodoPagamento: "Boleto Bancário",
    },
  ]

  // Vagas publicadas
  const vagas = [
    {
      id: 1,
      titulo: "Desenvolvedor Front-end",
      dataPublicacao: "10/07/2023",
      candidaturas: 45,
      status: "Ativa",
    },
    {
      id: 2,
      titulo: "Desenvolvedor Back-end",
      dataPublicacao: "05/07/2023",
      candidaturas: 38,
      status: "Ativa",
    },
    {
      id: 3,
      titulo: "UX/UI Designer",
      dataPublicacao: "01/07/2023",
      candidaturas: 27,
      status: "Ativa",
    },
    {
      id: 4,
      titulo: "Gerente de Projetos",
      dataPublicacao: "25/06/2023",
      candidaturas: 32,
      status: "Encerrada",
    },
    {
      id: 5,
      titulo: "Analista de Dados",
      dataPublicacao: "20/06/2023",
      candidaturas: 29,
      status: "Encerrada",
    },
  ]

  return (
    <div className="w-full pb-10">
      {/* Cabeçalho */}
      <div className="bg-gradient-to-r from-[#4400CC] to-[#00FFAE] h-[200px] flex flex-col justify-center px-6 md:px-10 shadow-[0_0_20px_rgba(68,0,204,0.3)]">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/admin/empregadores">
              <Button variant="ghost" className="bg-white/20 hover:bg-white/30 text-white mr-4">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">{empregador.nome}</h1>
                <Badge className="ml-4 bg-green-500 text-white">{empregador.status}</Badge>
              </div>
              <p className="text-base md:text-lg text-white/90 mt-2">{empregador.setor}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button className="bg-white text-[#4400CC] hover:bg-white/90">
              <Mail className="mr-2 h-4 w-4" />
              Contatar
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
              <div className="flex items-start">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center shadow-[0_0_10px_rgba(68,0,204,0.1)]"
                  style={{ backgroundColor: `${stat.color}10`, borderColor: `${stat.color}20` }}
                >
                  <stat.icon className="text-[#4400CC]" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-[#4400CC] mt-1">{stat.value}</p>
                  {stat.change && (
                    <p className="text-xs text-green-500 mt-1">
                      {stat.positive ? "+" : "-"}
                      {stat.change} este mês
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Informações da empresa e Tabs */}
      <div className="px-6 md:px-10 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações da empresa */}
        <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)] lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 rounded-lg bg-[#4400CC]/10 flex items-center justify-center text-[#4400CC] text-xl font-medium mr-4">
                {empregador.logo}
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800">{empregador.nome}</h3>
                <p className="text-sm text-gray-600">{empregador.setor}</p>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600">CNPJ</p>
                <p className="text-sm text-gray-800">{empregador.cnpj}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Responsável</p>
                <p className="text-sm text-gray-800">{empregador.responsavel}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Email</p>
                <p className="text-sm text-gray-800">{empregador.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Telefone</p>
                <p className="text-sm text-gray-800">{empregador.telefone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Endereço</p>
                <p className="text-sm text-gray-800">{empregador.endereco}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Site</p>
                <p className="text-sm text-gray-800">{empregador.site}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Data de Cadastro</p>
                <p className="text-sm text-gray-800">{empregador.dataCadastro}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Último Acesso</p>
                <p className="text-sm text-gray-800">{empregador.ultimoAcesso}</p>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex flex-col gap-2">
              <Button className="bg-[#4400CC] hover:bg-[#3300AA] text-white w-full">
                <Check className="mr-2 h-4 w-4" />
                Verificar empresa
              </Button>
              <Button variant="outline" className="border-[#4400CC]/30 text-[#4400CC] hover:bg-[#4400CC]/5 w-full">
                <X className="mr-2 h-4 w-4" />
                Inativar empresa
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Card className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)] lg:col-span-2">
          <CardContent className="p-6">
            <Tabs defaultValue="assinatura" className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-[#4400CC]/10">
                <TabsTrigger
                  value="assinatura"
                  className="py-2 data-[state=active]:bg-[#4400CC] data-[state=active]:text-white"
                >
                  Assinatura
                </TabsTrigger>
                <TabsTrigger
                  value="vagas"
                  className="py-2 data-[state=active]:bg-[#4400CC] data-[state=active]:text-white"
                >
                  Vagas
                </TabsTrigger>
                <TabsTrigger
                  value="documentos"
                  className="py-2 data-[state=active]:bg-[#4400CC] data-[state=active]:text-white"
                >
                  Documentos
                </TabsTrigger>
              </TabsList>

              {/* Conteúdo da tab Assinatura */}
              <TabsContent value="assinatura" className="mt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-800">Plano atual</h3>
                      <p className="text-sm text-gray-600">Detalhes da assinatura atual</p>
                    </div>
                    <Badge className="bg-purple-100 text-purple-800">Premium</Badge>
                  </div>

                  <Card className="border-[#4400CC]/20">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Plano</p>
                          <p className="text-sm text-gray-800">Premium</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Data de início</p>
                          <p className="text-sm text-gray-800">15/07/2023</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Data de término</p>
                          <p className="text-sm text-gray-800">15/10/2023</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Valor</p>
                          <p className="text-sm text-gray-800">R$ 499,00</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Histórico de assinaturas</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-[#4400CC]/20">
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Plano</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Data de início</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Data de término</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Valor</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Método de pagamento</th>
                          </tr>
                        </thead>
                        <tbody>
                          {assinaturas.map((assinatura) => (
                            <tr key={assinatura.id} className="border-b border-[#4400CC]/10 hover:bg-[#4400CC]/5">
                              <td className="py-3 px-4">
                                <Badge
                                  className={`${
                                    assinatura.plano === "Premium"
                                      ? "bg-purple-100 text-purple-800"
                                      : assinatura.plano === "Standard"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {assinatura.plano}
                                </Badge>
                              </td>
                              <td className="py-3 px-4 text-gray-600">{assinatura.dataInicio}</td>
                              <td className="py-3 px-4 text-gray-600">{assinatura.dataFim}</td>
                              <td className="py-3 px-4 text-gray-600">{assinatura.valor}</td>
                              <td className="py-3 px-4">
                                <Badge
                                  className={`${
                                    assinatura.status === "Ativo"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {assinatura.status}
                                </Badge>
                              </td>
                              <td className="py-3 px-4 text-gray-600">{assinatura.metodoPagamento}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Conteúdo da tab Vagas */}
              <TabsContent value="vagas" className="mt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-800">Vagas publicadas</h3>
                      <p className="text-sm text-gray-600">Lista de vagas publicadas pela empresa</p>
                    </div>
                    <Button className="bg-[#4400CC] hover:bg-[#3300AA] text-white">Ver todas as vagas</Button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#4400CC]/20">
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Título</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Data de publicação</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Candidaturas</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-600">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vagas.map((vaga) => (
                          <tr key={vaga.id} className="border-b border-[#4400CC]/10 hover:bg-[#4400CC]/5">
                            <td className="py-3 px-4 text-gray-800">{vaga.titulo}</td>
                            <td className="py-3 px-4 text-gray-600">{vaga.dataPublicacao}</td>
                            <td className="py-3 px-4 text-gray-600">{vaga.candidaturas}</td>
                            <td className="py-3 px-4">
                              <Badge
                                className={`${
                                  vaga.status === "Ativa" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {vaga.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>

              {/* Conteúdo da tab Documentos */}
              <TabsContent value="documentos" className="mt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-800">Documentos da empresa</h3>
                      <p className="text-sm text-gray-600">Documentos enviados para verificação</p>
                    </div>
                    <Button className="bg-[#4400CC] hover:bg-[#3300AA] text-white">Solicitar documentos</Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-[#4400CC]/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-lg bg-[#4400CC]/10 flex items-center justify-center text-[#4400CC] mr-3">
                              <Building className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-800">Contrato Social</p>
                              <p className="text-xs text-gray-600">Enviado em 15/07/2023</p>
                            </div>
                          </div>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-[#4400CC]/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-lg bg-[#4400CC]/10 flex items-center justify-center text-[#4400CC] mr-3">
                              <Building className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-800">Cartão CNPJ</p>
                              <p className="text-xs text-gray-600">Enviado em 15/07/2023</p>
                            </div>
                          </div>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-[#4400CC]/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-lg bg-[#4400CC]/10 flex items-center justify-center text-[#4400CC] mr-3">
                              <Building className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-800">Comprovante de Endereço</p>
                              <p className="text-xs text-gray-600">Enviado em 15/07/2023</p>
                            </div>
                          </div>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-[#4400CC]/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-lg bg-[#4400CC]/10 flex items-center justify-center text-[#4400CC] mr-3">
                              <Building className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-800">Documento do Responsável</p>
                              <p className="text-xs text-gray-600">Enviado em 15/07/2023</p>
                            </div>
                          </div>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex gap-2 mt-6">
                    <Button className="bg-[#4400CC] hover:bg-[#3300AA] text-white flex-1">
                      <Check className="mr-2 h-4 w-4" />
                      Aprovar documentos
                    </Button>
                    <Button
                      variant="outline"
                      className="border-[#4400CC]/30 text-[#4400CC] hover:bg-[#4400CC]/5 flex-1"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Rejeitar documentos
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
