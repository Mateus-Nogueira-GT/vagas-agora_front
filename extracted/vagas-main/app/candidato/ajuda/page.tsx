"use client"

import { useEffect, useState } from "react"
import { Search, Mail, UserCircle, FileText, Briefcase, Building, CreditCard, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function Help() {
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
  // Categorias de FAQ com ícones - todas com a mesma cor #4400CC
  const faqCategories = [
    {
      title: "Cadastro e Perfil",
      icon: UserCircle,
      color: "#4400CC",
      questions: [
        {
          question: "Como criar uma conta no sistema?",
          answer:
            "Para criar uma conta, clique no botão 'Cadastrar' na página inicial. Preencha o formulário com seus dados pessoais e profissionais, aceite os termos de uso e clique em 'Criar conta'. Você receberá um e-mail de confirmação para ativar sua conta.",
        },
        {
          question: "Como alterar minha senha?",
          answer:
            "Para alterar sua senha, acesse a página de 'Configurações' no menu lateral, clique na aba 'Segurança' e selecione a opção 'Alterar senha'. Você precisará informar sua senha atual e a nova senha desejada.",
        },
        {
          question: "Como excluir minha conta?",
          answer:
            "Para excluir sua conta, acesse a página de 'Configurações' no menu lateral, clique na aba 'Privacidade' e selecione a opção 'Excluir conta'. Você precisará confirmar a exclusão digitando sua senha. Atenção: essa ação é irreversível e todos os seus dados serão removidos do sistema.",
        },
      ],
    },
    {
      title: "Currículo",
      icon: FileText,
      color: "#4400CC",
      questions: [
        {
          question: "Como atualizar meu currículo?",
          answer:
            "Para atualizar seu currículo, acesse a página 'Currículo' no menu lateral. Lá você encontrará todas as seções do seu currículo organizadas em abas. Navegue entre as abas, atualize as informações desejadas e clique em 'Salvar' ao final de cada seção.",
        },
        {
          question: "Como fazer upload do meu currículo em PDF?",
          answer:
            "Para fazer upload do seu currículo em PDF, acesse a página 'Currículo' no menu lateral e clique na aba 'Currículo PDF'. Clique no botão 'Selecionar arquivo' ou arraste e solte seu arquivo na área indicada. O arquivo deve estar no formato PDF e ter no máximo 5MB.",
        },
        {
          question: "Como verificar meu currículo?",
          answer:
            "A verificação de currículo é um serviço premium que destaca seu perfil para recrutadores. Para verificar seu currículo, clique na opção 'Verificar currículo' no menu lateral ou no card de verificação na página inicial. Escolha o plano desejado e siga as instruções para pagamento.",
        },
      ],
    },
    {
      title: "Candidaturas",
      icon: Briefcase,
      color: "#4400CC",
      questions: [
        {
          question: "Como me candidatar a uma vaga?",
          answer:
            "Para se candidatar a uma vaga, acesse a página 'Pesquisar Vagas' no menu lateral, encontre a vaga desejada e clique no botão 'Candidatar-se'. Você será direcionado para uma página de confirmação onde poderá revisar seus dados e finalizar a candidatura.",
        },
        {
          question: "Como acompanhar minhas candidaturas?",
          answer:
            "Para acompanhar suas candidaturas, acesse a página 'Minhas Candidaturas' no menu lateral. Lá você encontrará todas as suas candidaturas organizadas por status (Em análise, Entrevista, Aprovadas, Recusadas). Clique em 'Ver detalhes' para mais informações sobre cada candidatura.",
        },
        {
          question: "Como cancelar uma candidatura?",
          answer:
            "Para cancelar uma candidatura, acesse a página 'Minhas Candidaturas' no menu lateral, encontre a candidatura que deseja cancelar e clique em 'Ver detalhes'. Na página de detalhes, clique no botão 'Cancelar candidatura' e confirme a ação.",
        },
      ],
    },
    {
      title: "Vagas",
      icon: Building,
      color: "#4400CC",
      questions: [
        {
          question: "Como filtrar vagas por localização?",
          answer:
            "Para filtrar vagas por localização, acesse a página 'Pesquisar Vagas' no menu lateral. No painel de filtros à esquerda, selecione a localização desejada no campo 'Localização'. Você pode selecionar cidades específicas ou optar por vagas remotas.",
        },
        {
          question: "Como salvar vagas para visualizar depois?",
          answer:
            "Para salvar vagas para visualizar depois, clique no ícone de coração que aparece em cada card de vaga. As vagas salvas podem ser acessadas na seção 'Vagas Salvas' dentro da página 'Pesquisar Vagas'.",
        },
        {
          question: "Como receber alertas de novas vagas?",
          answer:
            "Para receber alertas de novas vagas, acesse a página 'Configurações' no menu lateral e clique na aba 'Notificações'. Ative a opção 'Alertas de novas vagas' e configure os critérios de interesse, como área de atuação, localização e faixa salarial.",
        },
      ],
    },
    {
      title: "Pagamentos",
      icon: CreditCard,
      color: "#4400CC",
      questions: [
        {
          question: "Quais são os planos disponíveis?",
          answer:
            "Oferecemos três planos: Básico (gratuito), Premium (mensal) e Anual. O plano Básico permite candidaturas ilimitadas. O plano Premium adiciona destaque no perfil, prioridade nas buscas e verificação de currículo. O plano Anual inclui todos os benefícios do Premium com desconto.",
        },
        {
          question: "Como alterar meu plano?",
          answer:
            "Para alterar seu plano, acesse a página 'Configurações' no menu lateral e clique na aba 'Assinatura'. Lá você encontrará informações sobre seu plano atual e opções para upgrade ou downgrade. Selecione o plano desejado e siga as instruções para pagamento.",
        },
        {
          question: "Quais formas de pagamento são aceitas?",
          answer:
            "Aceitamos pagamentos via cartão de crédito (Visa, Mastercard, American Express), boleto bancário e PIX. Para pagamentos recorrentes, apenas cartão de crédito é aceito. Todas as transações são processadas de forma segura através de gateways de pagamento criptografados.",
        },
      ],
    },
  ]

  return (
    <ProtectedRoute allowedRoles={['candidato']}>
      <div className="w-full pb-16">
        {/* Banner com gradiente roxo-azul neon */}
        <div className="bg-gradient-to-r from-[#4400CC] to-[#00FFAE] min-h-[144px] sm:min-h-[160px] flex flex-col justify-center px-4 sm:px-6 md:px-10 py-6 shadow-[0_0_20px_rgba(68,0,204,0.3)]">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">Central de Ajuda</h1>
          <p className="text-base md:text-lg text-white/80 mt-2">Encontre respostas para suas dúvidas</p>
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
      <div className="px-4 sm:px-6 md:px-10 mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Left column - Contact form */}
        <div>
          <h2 className="text-xl font-medium text-[#4400CC] mb-6">Entre em contato</h2>
          <div className="lg:sticky lg:top-8">
            <Card className="bg-gradient-to-r from-[#4400CC]/5 to-[#0057FF]/5 border-[#4400CC]/30 shadow-[0_0_15px_rgba(68,0,204,0.1)]">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <div>
                  <h3 className="text-xl font-medium text-[#4400CC] mb-4">Não encontrou o que procurava?</h3>
                  <p className="text-gray-600 mb-6">
                    Entre em contato com nossa equipe de suporte. Estamos disponíveis de segunda a sexta, das 9h às 18h.
                  </p>

                  <form className="space-y-4" onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    const email = formData.get('email')
                    const mensagem = formData.get('mensagem')

                    // Abrir cliente de email
                    window.location.href = `mailto:${emailSuporte}?subject=Contato do Site - Ajuda&body=${encodeURIComponent(String(mensagem))}`
                  }}>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-gray-700">Seu e-mail</label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="seu@email.com"
                        required
                        autoComplete="email"
                        inputMode="email"
                        enterKeyHint="next"
                        className="text-base border-[#4400CC]/30 focus-visible:ring-[#4400CC]"
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
                        className="text-base border-[#4400CC]/30 focus-visible:ring-[#4400CC]"
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
