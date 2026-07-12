// PDF Generator Service for Curriculum
import jsPDF from 'jspdf'
import { Candidato } from '../candidatos/candidatos-types'

export class PDFGeneratorService {
  private doc: jsPDF
  private readonly pageWidth = 210 // A4 width in mm
  private readonly pageHeight = 297 // A4 height in mm
  private readonly margin = 15
  private yPosition = 15
  private currentPage = 1

  constructor() {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })
  }

  private checkPageBreak(neededSpace: number = 10) {
    if (this.yPosition + neededSpace > this.pageHeight - 20) {
      this.doc.addPage()
      this.yPosition = 15
      this.currentPage++
    }
  }

  private addGradientHeader(candidato: Candidato) {
    // Create gradient background (purple to cyan)
    const gradientHeight = 40
    const steps = 100

    for (let i = 0; i < steps; i++) {
      const ratio = i / (steps - 1)
      const r = Math.round(68 + (0 - 68) * ratio)
      const g = Math.round(0 + (255 - 0) * ratio)
      const b = Math.round(204 + (174 - 204) * ratio)

      this.doc.setFillColor(r, g, b)
      const x = (this.pageWidth / steps) * i
      const width = (this.pageWidth / steps) + 0.2
      this.doc.rect(x, 0, width, gradientHeight, 'F')
    }

    // Add candidate name and title
    const textStartX = this.margin

    this.doc.setTextColor(255, 255, 255)
    this.doc.setFontSize(18)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(candidato.nome_completo, textStartX, 16)

    if (candidato.titulo_profissional) {
      this.doc.setFontSize(11)
      this.doc.setFont('helvetica', 'normal')
      this.doc.text(candidato.titulo_profissional, textStartX, 23)
    }

    // Add contact info
    this.doc.setFontSize(8)
    const contactY = 32
    const contactParts = []

    if (candidato.email) contactParts.push(`E-mail: ${candidato.email}`)
    if (candidato.telefone) contactParts.push(`Tel: ${candidato.telefone}`)
    if (candidato.endereco?.cidade && candidato.endereco?.estado) {
      contactParts.push(`${candidato.endereco.cidade}, ${candidato.endereco.estado}`)
    }

    this.doc.text(contactParts.join('  |  '), textStartX, contactY)

    this.yPosition = gradientHeight + 10
  }

  private addSectionTitle(title: string) {
    this.checkPageBreak(15)

    const sectionY = this.yPosition
    const sectionWidth = this.pageWidth - (2 * this.margin)

    // Purple background bar
    this.doc.setFillColor(68, 0, 204)
    this.doc.roundedRect(this.margin, sectionY - 5, sectionWidth, 8, 1, 1, 'F')

    // White text
    this.doc.setTextColor(255, 255, 255)
    this.doc.setFontSize(11)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(title, this.margin + 2, sectionY)

    // Reset text color
    this.doc.setTextColor(0, 0, 0)
    this.yPosition += 10
  }

  private addSimpleText(text: string, fontSize: number = 9, bold: boolean = false) {
    if (!text || text.trim() === '') return

    this.doc.setFontSize(fontSize)
    this.doc.setFont('helvetica', bold ? 'bold' : 'normal')

    const maxWidth = this.pageWidth - (2 * this.margin)
    const lines = this.doc.splitTextToSize(text, maxWidth)

    lines.forEach((line: string) => {
      this.checkPageBreak()
      this.doc.text(line, this.margin, this.yPosition)
      this.yPosition += 4
    })
  }

  private addLabelValue(label: string, value: string) {
    this.checkPageBreak()

    this.doc.setFontSize(9)
    this.doc.setFont('helvetica', 'bold')
    const labelText = `${label}:`
    this.doc.text(labelText, this.margin, this.yPosition)

    const labelWidth = this.doc.getTextWidth(labelText)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(value, this.margin + labelWidth + 2, this.yPosition)

    this.yPosition += 5
  }

  private addLink(label: string, url: string) {
    this.checkPageBreak()

    this.doc.setFontSize(9)
    this.doc.setFont('helvetica', 'bold')
    const labelText = `${label}:`
    this.doc.text(labelText, this.margin, this.yPosition)

    const labelWidth = this.doc.getTextWidth(labelText)
    this.doc.setFont('helvetica', 'normal')
    this.doc.setTextColor(0, 87, 255)
    this.doc.textWithLink(url, this.margin + labelWidth + 2, this.yPosition, { url })
    this.doc.setTextColor(0, 0, 0)

    this.yPosition += 5
  }

  public generatePDF(candidato: Candidato): void {
    // Header
    this.addGradientHeader(candidato)

    // Bio/Sobre
    if (candidato.bio) {
      this.addSectionTitle('Sobre')
      this.addSimpleText(candidato.bio)
      this.yPosition += 5
    }

    // Experiências
    if (candidato.experiencias && candidato.experiencias.length > 0) {
      this.addSectionTitle('Experiência Profissional')

      candidato.experiencias.forEach((exp, index) => {
        if (index > 0) this.yPosition += 3

        this.checkPageBreak(20)

        this.doc.setFont('helvetica', 'bold')
        this.doc.setFontSize(10)
        this.doc.text(exp.cargo, this.margin, this.yPosition)
        this.yPosition += 4

        this.doc.setFont('helvetica', 'normal')
        this.doc.setFontSize(9)
        this.doc.setTextColor(68, 0, 204)
        this.doc.text(exp.empresa, this.margin, this.yPosition)
        this.doc.setTextColor(0, 0, 0)
        this.yPosition += 4

        const startDate = new Date(exp.data_inicio).toLocaleDateString('pt-BR', {
          month: 'short',
          year: 'numeric'
        })
        const endDate = exp.data_fim
          ? new Date(exp.data_fim).toLocaleDateString('pt-BR', {
              month: 'short',
              year: 'numeric'
            })
          : 'Atual'

        this.doc.setFontSize(8)
        this.doc.setTextColor(100, 100, 100)
        this.doc.text(`${startDate} - ${endDate}`, this.margin, this.yPosition)
        this.doc.setTextColor(0, 0, 0)
        this.yPosition += 4

        if (exp.descricao) {
          this.addSimpleText(exp.descricao, 8)
        }
      })

      this.yPosition += 5
    }

    // Formação
    if (candidato.formacao && candidato.formacao.length > 0) {
      this.addSectionTitle('Formação Acadêmica')

      candidato.formacao.forEach((form, index) => {
        if (index > 0) this.yPosition += 3

        this.checkPageBreak(20)

        this.doc.setFont('helvetica', 'bold')
        this.doc.setFontSize(10)
        this.doc.text(form.curso, this.margin, this.yPosition)
        this.yPosition += 4

        this.doc.setFont('helvetica', 'normal')
        this.doc.setFontSize(9)
        this.doc.setTextColor(68, 0, 204)
        this.doc.text(form.instituicao, this.margin, this.yPosition)
        this.doc.setTextColor(0, 0, 0)
        this.yPosition += 4

        const nivelMap: Record<string, string> = {
          'graduacao': 'Graduação',
          'pos_graduacao': 'Pós-Graduação',
          'mestrado': 'Mestrado',
          'doutorado': 'Doutorado',
          'tecnico': 'Técnico',
          'tecnólogo': 'Tecnólogo'
        }

        const statusMap: Record<string, string> = {
          'concluido': 'Concluído',
          'cursando': 'Cursando',
          'interrompido': 'Interrompido'
        }

        this.doc.setFontSize(8)
        this.doc.setTextColor(100, 100, 100)
        const nivel = nivelMap[form.nivel] || form.nivel
        const status = statusMap[form.status] || form.status
        this.doc.text(`${nivel} • ${status}`, this.margin, this.yPosition)
        this.doc.setTextColor(0, 0, 0)
        this.yPosition += 4

        if (form.data_inicio || form.data_fim) {
          const startDate = form.data_inicio
            ? new Date(form.data_inicio).toLocaleDateString('pt-BR', {
                month: 'short',
                year: 'numeric'
              })
            : ''
          const endDate = form.data_fim
            ? new Date(form.data_fim).toLocaleDateString('pt-BR', {
                month: 'short',
                year: 'numeric'
              })
            : 'Presente'

          this.doc.setFontSize(8)
          this.doc.text(`${startDate} - ${endDate}`, this.margin, this.yPosition)
          this.yPosition += 4
        }
      })

      this.yPosition += 5
    }

    // Idiomas
    if (candidato.idiomas && candidato.idiomas.length > 0) {
      this.addSectionTitle('Idiomas')

      candidato.idiomas.forEach((idioma) => {
        const idiomaMap: Record<string, string> = {
          'portugues': 'Português',
          'ingles': 'Inglês',
          'espanhol': 'Espanhol',
          'frances': 'Francês',
          'alemao': 'Alemão',
          'italiano': 'Italiano',
          'catalao': 'Catalão'
        }

        const nivelMap: Record<string, string> = {
          'basico': 'Básico',
          'intermediario': 'Intermediário',
          'avancado': 'Avançado',
          'fluente': 'Fluente',
          'nativo': 'Nativo'
        }

        const idiomaNome = idiomaMap[idioma.idioma] || idioma.idioma
        const nivel = nivelMap[idioma.nivel] || idioma.nivel

        this.addLabelValue(idiomaNome, nivel)
      })

      this.yPosition += 5
    }

    // Informações de Diversidade
    if (candidato.genero || candidato.raca_etnia || candidato.orientacao_sexual || candidato.pcd) {
      this.addSectionTitle('Informações de Diversidade')

      if (candidato.genero) {
        const generoMap: Record<string, string> = {
          'masculino': 'Masculino',
          'feminino': 'Feminino',
          'nao_binario': 'Não-binário',
          'outro': 'Outro'
        }
        this.addLabelValue('Gênero', generoMap[candidato.genero] || candidato.genero)
      }

      if (candidato.raca_etnia) {
        const racaMap: Record<string, string> = {
          'branco': 'Branco',
          'preto': 'Preto',
          'pardo': 'Pardo',
          'amarelo': 'Amarelo',
          'indigena': 'Indígena'
        }
        this.addLabelValue('Raça/Etnia', racaMap[candidato.raca_etnia] || candidato.raca_etnia)
      }

      if (candidato.orientacao_sexual) {
        const orientacaoMap: Record<string, string> = {
          'heterossexual': 'Heterossexual',
          'homossexual': 'Homossexual',
          'bissexual': 'Bissexual',
          'outro': 'Outro'
        }
        this.addLabelValue('Orientação Sexual', orientacaoMap[candidato.orientacao_sexual] || candidato.orientacao_sexual)
      }

      if (candidato.pcd) {
        this.addLabelValue('PcD', candidato.pcd === 'sim' ? 'Sim' : 'Não')
      }

      this.yPosition += 5
    }

    // Habilitação
    if (candidato.possui_cnh || candidato.categoria_cnh || candidato.veiculo_proprio) {
      this.addSectionTitle('Habilitação')

      if (candidato.possui_cnh) {
        this.addLabelValue('Possui CNH', candidato.possui_cnh === 'sim' ? 'Sim' : 'Não')
      }

      if (candidato.categoria_cnh) {
        this.addLabelValue('Categoria', candidato.categoria_cnh.toUpperCase())
      }

      if (candidato.veiculo_proprio) {
        this.addLabelValue('Veículo Próprio', candidato.veiculo_proprio === 'sim' ? 'Sim' : 'Não')
      }

      this.yPosition += 5
    }

    // Redes Sociais e Portfólio
    const hasSocialMedia = candidato.linkedin_url || candidato.github_url ||
                           candidato.portfolio_url || candidato.site_pessoal ||
                           candidato.instagram_url || candidato.facebook_url ||
                           candidato.youtube_url

    if (hasSocialMedia) {
      this.addSectionTitle('Redes Sociais e Portfólio')

      if (candidato.linkedin_url) {
        this.addLink('LinkedIn', candidato.linkedin_url)
      }

      if (candidato.github_url) {
        this.addLink('GitHub', candidato.github_url)
      }

      if (candidato.portfolio_url || candidato.site_pessoal) {
        this.addLink('Portfólio', candidato.portfolio_url || candidato.site_pessoal || '')
      }

      if (candidato.instagram_url) {
        this.addLink('Instagram', candidato.instagram_url)
      }

      if (candidato.facebook_url) {
        this.addLink('Facebook', candidato.facebook_url)
      }

      if (candidato.youtube_url) {
        this.addLink('YouTube', candidato.youtube_url)
      }

      this.yPosition += 5
    }

    // Footer
    const totalPages = this.doc.getNumberOfPages()

    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i)
      this.doc.setFontSize(7)
      this.doc.setTextColor(150, 150, 150)

      this.doc.text(
        `Página ${i} de ${totalPages}`,
        this.pageWidth / 2,
        this.pageHeight - 10,
        { align: 'center' }
      )

      const date = new Date().toLocaleDateString('pt-BR')
      this.doc.text(
        `Gerado em ${date} via Vagas Agora`,
        this.pageWidth / 2,
        this.pageHeight - 6,
        { align: 'center' }
      )
    }

    // Save PDF
    const fileName = `curriculo-${candidato.nome_completo.toLowerCase().replace(/\s+/g, '-')}.pdf`
    this.doc.save(fileName)
  }
}

export const pdfGeneratorService = new PDFGeneratorService()
