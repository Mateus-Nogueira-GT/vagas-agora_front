"use client"

import { useEffect, useState } from "react"
import { Search, Mail, UserCircle, FileText, Briefcase, Building, CreditCard, MessageCircle, Users, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function EmployerHelp() {
  const [emailSuporte, setEmailSuporte] = useState("suporte@agiovagas.com.br")
  const [whatsappSuporte, setWhatsappSuporte] = useState("5533999999999")
  const [isLoadingSettings, setIsLoadingSettings] = useState(true)

  useEffect(() => {
    const loadSupportSettings = async () => {
      try {
        const response = await fetch('/api/support-settings')
        if (response.ok) {
          const data = await response.json()
          if (data.email_suporte) setEmailSuporte(data.email_suporte)
          if (data.whatsapp_suporte) setWhatsappSuporte(data.whatsapp_suporte)
        }
      } catch (error) {
        console.error('Erro ao carregar configurações de suporte:', error)
      } finally {
        setIsLoadingSettings(false)
      }
    }

    loadSupportSettings()
  }, [])
  // Categorias de FAQ para empregadores - todas com a mesma cor #4400CC
  const faqCategories = [
    {
      title: "Cadastro e Perfil da Empresa",
      icon: Building,
      color: "#4400CC",
      questions: [
        {
          question: "Como criar uma conta de empregador?",
          answer:
            "Para criar uma conta de empregador, clique no botão 'Cadastrar' na página inicial e selecione 'Sou Empregador'. Preencha o formulário com os dados da sua empresa (CNPJ, razão social, dados de contato), aceite os termos de uso e clique em 'Criar conta'. Você receberá um e-mail de confirmação para ativar sua conta.",
        },
        {
          question: "Como atualizar os dados da minha empresa?",
          answer:
            "Para atualizar os dados da sua empresa, acesse a página 'Configurações' no menu lateral. Lá você poderá editar informações como nome fantasia, descrição da empresa, logo, endereço, telefone e redes sociais. Não esqueça de clicar em 'Salvar alterações' ao finalizar.",
        },
        {
          question: "Como adicionar o logo da minha empresa?",
          answer:
            "Para adicionar o logo da sua empresa, acesse 'Configurações' no menu lateral e clique na opção 'Logo da Empresa'. Faça o upload de uma imagem em formato PNG ou JPG (máximo 2MB). O logo aparecerá nas suas vagas publicadas e no perfil da empresa.",
        },
      ],
    },
    {
      title: "Publicação de Vagas",
      icon: Briefcase,
      color: "#4400CC",
      questions: [
        {
          question: "Como publicar uma nova vaga?",
          answer:
            "Para publicar uma vaga, acesse 'Gerenciar Vagas' no menu lateral e clique em 'Criar Nova Vaga'. Preencha todos os campos obrigatórios: título da vaga, descrição, requisitos, benefícios, salário, localização e tipo de contratação. Revise as informações e clique em 'Publicar Vaga'. A vaga ficará visível para candidatos imediatamente.",
        },
        {
          question: "Como editar ou pausar uma vaga publicada?",
          answer:
            "Para editar uma vaga, acesse 'Gerenciar Vagas', encontre a vaga desejada e clique em 'Editar'. Para pausar uma vaga temporariamente, clique no botão de status e selecione 'Pausar'. A vaga pausada não aparecerá nas buscas dos candidatos, mas você poderá reativá-la a qualquer momento.",
        },
        {
          question: "Quantas vagas posso publicar?",
          answer:
            "O número de vagas ativas que você pode publicar depende do seu plano de assinatura. O plano Básico permite até 3 vagas simultâneas, o plano Profissional até 10 vagas, e o plano Empresarial oferece vagas ilimitadas. Vagas pausadas ou encerradas não contam no limite.",
        },
        {
          question: "Como destacar minhas vagas nas buscas?",
          answer:
            "Para destacar suas vagas, você pode contratar o recurso 'Vaga Premium' disponível nos planos Profissional e Empresarial. Vagas premium aparecem no topo dos resultados de busca e recebem até 5x mais visualizações. Acesse a página da vaga e clique em 'Promover Vaga' para ativar esse recurso.",
        },
      ],
    },
    {
      title: "Gerenciamento de Candidaturas",
      icon: Users,
      color: "#4400CC",
      questions: [
        {
          question: "Como visualizar candidatos para minhas vagas?",
          answer:
            "Para visualizar candidatos, acesse 'Gerenciar Vagas' no menu lateral, clique na vaga desejada e depois em 'Ver Candidatos'. Você verá uma lista com todos os candidatos que se aplicaram, com informações resumidas do perfil. Clique em 'Ver Perfil Completo' para acessar o currículo detalhado.",
        },
        {
          question: "Como organizar e filtrar candidaturas?",
          answer:
            "Na página de candidatos de cada vaga, você pode organizá-los por status: 'Novos', 'Em Análise', 'Entrevista Agendada', 'Aprovados' e 'Recusados'. Use os filtros por experiência, escolaridade, localização e data de candidatura para encontrar candidatos específicos. Você também pode adicionar notas e avaliações personalizadas.",
        },
        {
          question: "Como entrar em contato com candidatos?",
          answer:
            "Para entrar em contato com um candidato, acesse o perfil dele e clique em 'Contatar Candidato'. Você poderá enviar mensagens pelo sistema ou visualizar as informações de contato (e-mail e telefone) para comunicação direta. Candidatos com perfil verificado possuem dados de contato validados.",
        },
        {
          question: "Posso exportar os dados dos candidatos?",
          answer:
            "Sim, você pode exportar a lista de candidatos em formato CSV ou PDF. Na página de candidatos da vaga, clique no botão 'Exportar' no canto superior direito e selecione o formato desejado. O arquivo incluirá informações básicas como nome, experiência, escolaridade e status da candidatura.",
        },
      ],
    },
    {
      title: "Visualização de Currículos",
      icon: Eye,
      color: "#4400CC",
      questions: [
        {
          question: "Como funciona o sistema de visualização de currículos?",
          answer:
            "Nosso sistema permite que você visualize currículos completos dos candidatos que se aplicaram às suas vagas. Candidatos são notificados quando você visualiza o currículo deles, aumentando o engajamento. Você pode salvar currículos favoritos e adicionar notas para consulta posterior.",
        },
        {
          question: "O que são currículos verificados?",
          answer:
            "Currículos verificados são de candidatos que contrataram nosso serviço premium de verificação. Esses perfis possuem um selo de autenticidade, indicando que as informações foram validadas. Currículos verificados aparecem em destaque nos resultados de busca e têm maior credibilidade.",
        },
        {
          question: "Como buscar candidatos fora das minhas vagas?",
          answer:
            "Com os planos Profissional e Empresarial, você tem acesso ao Banco de Talentos, onde pode buscar candidatos ativamente mesmo que não tenham se candidatado às suas vagas. Use filtros avançados por habilidades, experiência, localização e disponibilidade para encontrar o candidato ideal.",
        },
      ],
    },
    {
      title: "Assinatura e Pagamentos",
      icon: CreditCard,
      color: "#4400CC",
      questions: [
        {
          question: "Quais são os planos disponíveis para empregadores?",
          answer:
            "Oferecemos três planos: Básico (gratuito - até 3 vagas), Profissional (R$ 99/mês - até 10 vagas + destaque + banco de talentos) e Empresarial (R$ 299/mês - vagas ilimitadas + todos os recursos premium + suporte prioritário). Você pode comparar os planos na página 'Assinatura'.",
        },
        {
          question: "Como alterar meu plano de assinatura?",
          answer:
            "Para alterar seu plano, acesse a página 'Assinatura' no menu lateral. Você verá seu plano atual e opções para upgrade ou downgrade. Selecione o plano desejado e siga as instruções de pagamento. Mudanças de plano entram em vigor imediatamente após a confirmação do pagamento.",
        },
        {
          question: "Quais formas de pagamento são aceitas?",
          answer:
            "Aceitamos pagamentos via cartão de crédito (Visa, Mastercard, American Express), boleto bancário e PIX. Para assinaturas recorrentes, recomendamos o cartão de crédito para renovação automática. Todas as transações são processadas de forma segura através do gateway Asaas.",
        },
        {
          question: "Posso cancelar minha assinatura a qualquer momento?",
          answer:
            "Sim, você pode cancelar sua assinatura a qualquer momento sem multas ou taxas de cancelamento. Acesse 'Assinatura' no menu lateral e clique em 'Cancelar Assinatura'. Você continuará tendo acesso aos recursos do plano até o final do período já pago. Após o cancelamento, sua conta retornará ao plano Básico gratuito.",
        },
      ],
    },
    {
      title: "Conta e Segurança",
      icon: UserCircle,
      color: "#4400CC",
      questions: [
        {
          question: "Como alterar minha senha?",
          answer:
            "Para alterar sua senha, acesse 'Configurações' no menu lateral e clique na opção 'Segurança'. Selecione 'Alterar senha', digite sua senha atual e a nova senha desejada (mínimo 8 caracteres). Confirme a alteração e faça login novamente com a nova senha.",
        },
        {
          question: "Como adicionar outros usuários da minha empresa?",
          answer:
            "Nos planos Profissional e Empresarial, você pode adicionar usuários adicionais para gerenciar vagas e candidaturas. Acesse 'Configurações' > 'Equipe' e clique em 'Adicionar Usuário'. Defina o nome, e-mail e nível de permissão (visualizar, editar ou administrador) para cada membro da equipe.",
        },
        {
          question: "Como excluir minha conta de empregador?",
          answer:
            "Para excluir sua conta, acesse 'Configurações' no menu lateral e clique em 'Privacidade'. Selecione 'Excluir conta' e confirme a ação digitando sua senha. Atenção: essa ação é irreversível e todos os dados da empresa, vagas e histórico de candidaturas serão removidos permanentemente do sistema.",
        },
      ],
    },
  ]

  return (
    <ProtectedRoute allowedRoles={['empregador']}>
      <div className="w-full pb-16">
        {/* Banner com gradiente roxo-azul neon */}
        <div className="flex min-h-[136px] flex-col justify-center bg-gradient-to-r from-[#4400CC] to-[#00FFAE] px-4 py-6 shadow-[0_0_20px_rgba(68,0,204,0.3)] sm:px-6 md:min-h-[160px] md:px-10">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">Central de Ajuda para Empregadores</h1>
          <p className="text-base md:text-lg text-white/80 mt-2">Encontre respostas sobre como recrutar talentos</p>
        </div>

      {/* Barra de pesquisa - Oculta temporariamente */}
      {false && (
      <div className="px-6 md:px-10 -mt-6 relative z-10">
        <div className="bg-white rounded-lg border border-[#4400CC]/30 shadow-lg p-2 flex items-center">
          <Input
            type="text"
            placeholder="Pesquisar por dúvidas frequentes"
            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-800"
          />
          <Button size="icon" className="bg-[#4400CC] hover:bg-[#3300AA] text-white ml-2">
            <Search size={18} />
          </Button>
        </div>
      </div>
      )}

      {/* Main content - 2 column grid */}
      <div className="mt-6 grid grid-cols-1 gap-6 px-4 sm:px-6 md:mt-8 md:gap-8 md:px-10 lg:grid-cols-2">
        {/* Left column - Contact form */}
        <div>
          <h2 className="text-xl font-medium text-[#4400CC] mb-6">Entre em contato</h2>
          <div className="lg:sticky lg:top-8">
            <Card className="bg-gradient-to-r from-[#4400CC]/5 to-[#0057FF]/5 border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)]">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <div>
                  <h3 className="text-xl font-medium text-[#4400CC] mb-4">Precisa de ajuda personalizada?</h3>
                  <p className="text-gray-600 mb-6">
                    Nossa equipe de suporte está pronta para ajudar sua empresa a encontrar os melhores talentos. Atendimento de segunda a sexta, das 9h às 18h.
                  </p>

                  <form className="space-y-4" onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    const email = formData.get('email')
                    const mensagem = formData.get('mensagem')

                    // Abrir cliente de email
                    window.location.href = `mailto:${emailSuporte}?subject=Contato Empregador - Ajuda&body=${encodeURIComponent(String(mensagem))}`
                  }}>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-gray-700">Seu e-mail</label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        placeholder="seu@empresa.com"
                        required
                        className="border-[#4400CC]/30 focus-visible:ring-[#4400CC]"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="mensagem" className="text-sm font-medium text-gray-700">Mensagem</label>
                      <Textarea
                        id="mensagem"
                        name="mensagem"
                        placeholder="Descreva sua dúvida ou problema..."
                        required
                        rows={4}
                        className="border-[#4400CC]/30 focus-visible:ring-[#4400CC]"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="bg-[#4400CC] hover:bg-[#3300AA] text-white font-medium w-full"
                    >
                      <Mail size={18} className="mr-2" /> Enviar Mensagem
                    </Button>
                  </form>

                  <div className="mt-6 text-center">
                    <p className="text-gray-500 text-sm mb-3">Ou</p>
                    <Button
                      variant="outline"
                      className="border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10 font-medium w-full"
                      onClick={() => window.open(`https://wa.me/${whatsappSuporte}`, "_blank")}
                    >
                      <MessageCircle size={18} className="mr-2" /> Fale Conosco no WhatsApp
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right column - FAQ */}
        <div>
          <div>
            <h2 className="text-xl font-medium text-[#4400CC] mb-6">Perguntas Frequentes</h2>
            <div className="space-y-6">
              {faqCategories.map((category, index) => (
                <Card
                  key={index}
                  className="bg-white border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)] hover:shadow-[0_0_20px_rgba(68,0,204,0.2)] transition-all"
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center mb-4">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                        style={{ backgroundColor: "#4400CC20" }}
                      >
                        <category.icon size={20} className="text-[#4400CC]" />
                      </div>
                      <h3 className="text-lg font-medium text-[#4400CC]">{category.title}</h3>
                    </div>
                    <Accordion type="single" collapsible className="w-full">
                      {category.questions.map((faq, faqIndex) => (
                        <AccordionItem
                          key={faqIndex}
                          value={`item-${index}-${faqIndex}`}
                          className="border-b border-[#4400CC]/20"
                        >
                          <AccordionTrigger className="text-gray-800 hover:text-[#4400CC] text-left font-medium py-4">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-gray-600 pb-4">{faq.answer}</AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
      </div>
    </ProtectedRoute>
  )
}
