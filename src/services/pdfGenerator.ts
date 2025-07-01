import jsPDF from 'jspdf';
import { GeneratedDocument } from './documentsApi';

interface PDFGenerationOptions {
  includeHeader?: boolean;
  includeFooter?: boolean;
  fontSize?: number;
  lineHeight?: number;
  margin?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

class PDFGeneratorService {
  private defaultOptions: PDFGenerationOptions = {
    includeHeader: true,
    includeFooter: true,
    fontSize: 12,
    lineHeight: 1.5,
    margin: {
      top: 20,
      bottom: 20,
      left: 20,
      right: 20
    }
  };

  /**
   * Gera PDF de um documento veterinário
   */
  async generateDocumentPDF(
    document: GeneratedDocument, 
    options: Partial<PDFGenerationOptions> = {}
  ): Promise<void> {
    const config = { ...this.defaultOptions, ...options };
    const pdf = new jsPDF();
    
    // Configurações da página
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const contentWidth = pageWidth - config.margin!.left - config.margin!.right;
    
    let currentY = config.margin!.top;

    // Header do documento
    if (config.includeHeader) {
      currentY = this.addHeader(pdf, document, currentY, config);
    }

    // Conteúdo principal
    currentY = this.addContent(pdf, document, currentY, config, contentWidth);

    // Footer
    if (config.includeFooter) {
      this.addFooter(pdf, document, config);
    }

    // Download do PDF
    const fileName = this.generateFileName(document);
    pdf.save(fileName);
  }

  /**
   * Adiciona cabeçalho do documento com formatação profissional
   */
  private addHeader(
    pdf: jsPDF,
    document: GeneratedDocument,
    startY: number,
    config: PDFGenerationOptions
  ): number {
    let currentY = startY;
    const pageWidth = pdf.internal.pageSize.getWidth();

    // Cabeçalho da clínica com formatação profissional
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(25, 25, 112); // Azul escuro profissional
    pdf.text('CLÍNICA VETERINÁRIA', config.margin!.left, currentY);
    currentY += 8;

    // Subtítulo da clínica
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100); // Cinza
    pdf.text('Medicina Veterinária Especializada', config.margin!.left, currentY);
    currentY += 15;

    // Linha separadora dupla para aspecto profissional
    pdf.setLineWidth(1);
    pdf.setDrawColor(25, 25, 112); // Azul escuro
    pdf.line(config.margin!.left, currentY, pageWidth - config.margin!.right, currentY);
    currentY += 2;
    pdf.setLineWidth(0.3);
    pdf.line(config.margin!.left, currentY, pageWidth - config.margin!.right, currentY);
    currentY += 15;

    // Título do documento com destaque
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0); // Preto
    pdf.text(document.title.toUpperCase(), config.margin!.left, currentY);
    currentY += 12;

    // Data e hora de geração
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    const generatedDate = new Date(document.generated_at).toLocaleString('pt-BR');
    pdf.text(`Gerado em: ${generatedDate}`, config.margin!.left, currentY);
    currentY += 15;

    return currentY;
  }

  /**
   * Adiciona conteúdo principal do documento com formatação profissional
   */
  private addContent(
    pdf: jsPDF,
    document: GeneratedDocument,
    startY: number,
    config: PDFGenerationOptions,
    contentWidth: number
  ): number {
    let currentY = startY;

    // Resetar cor do texto para preto
    pdf.setTextColor(0, 0, 0);

    // Processar conteúdo com formatação especial
    const formattedContent = this.formatContentForPDF(document.content);

    for (const section of formattedContent) {
      // Verifica se precisa de nova página
      if (currentY + (config.fontSize! * config.lineHeight! * 2) > pdf.internal.pageSize.getHeight() - config.margin!.bottom - 30) {
        pdf.addPage();
        currentY = config.margin!.top + 20; // Margem extra no topo de páginas novas
      }

      if (section.type === 'title') {
        // Títulos de seções em negrito e maior
        pdf.setFontSize(config.fontSize! + 2);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(25, 25, 112); // Azul escuro
        pdf.text(section.text, config.margin!.left, currentY);
        currentY += (config.fontSize! + 2) * config.lineHeight! + 3;

      } else if (section.type === 'subtitle') {
        // Subtítulos em negrito
        pdf.setFontSize(config.fontSize!);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text(section.text, config.margin!.left, currentY);
        currentY += config.fontSize! * config.lineHeight! + 2;

      } else if (section.type === 'content') {
        // Conteúdo normal
        pdf.setFontSize(config.fontSize!);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);

        const lines = this.splitTextIntoLines(pdf, section.text, contentWidth);
        for (const line of lines) {
          // Verifica novamente se precisa de nova página
          if (currentY + (config.fontSize! * config.lineHeight!) > pdf.internal.pageSize.getHeight() - config.margin!.bottom - 30) {
            pdf.addPage();
            currentY = config.margin!.top + 20;
          }

          pdf.text(line, config.margin!.left, currentY);
          currentY += config.fontSize! * config.lineHeight!;
        }
        currentY += 3; // Espaço extra após parágrafos

      } else if (section.type === 'list_item') {
        // Itens de lista com bullet points
        pdf.setFontSize(config.fontSize!);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);

        const bulletText = `• ${section.text}`;
        const lines = this.splitTextIntoLines(pdf, bulletText, contentWidth - 10);

        for (let i = 0; i < lines.length; i++) {
          if (currentY + (config.fontSize! * config.lineHeight!) > pdf.internal.pageSize.getHeight() - config.margin!.bottom - 30) {
            pdf.addPage();
            currentY = config.margin!.top + 20;
          }

          const xOffset = i === 0 ? config.margin!.left : config.margin!.left + 10;
          pdf.text(lines[i], xOffset, currentY);
          currentY += config.fontSize! * config.lineHeight!;
        }
        currentY += 1; // Espaço menor entre itens de lista
      }
    }

    return currentY;
  }

  /**
   * Adiciona rodapé do documento com formatação profissional
   */
  private addFooter(
    pdf: jsPDF,
    document: GeneratedDocument,
    config: PDFGenerationOptions
  ): void {
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth();

    // Linha separadora dupla profissional
    const footerY = pageHeight - config.margin!.bottom - 20;
    pdf.setLineWidth(0.3);
    pdf.setDrawColor(25, 25, 112);
    pdf.line(config.margin!.left, footerY, pageWidth - config.margin!.right, footerY);
    pdf.setLineWidth(1);
    pdf.line(config.margin!.left, footerY + 2, pageWidth - config.margin!.right, footerY + 2);

    // Informações do rodapé
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);

    // Data de geração
    const generatedDate = new Date(document.generated_at).toLocaleString('pt-BR');
    pdf.text(`Gerado em: ${generatedDate}`, config.margin!.left, footerY + 10);

    // Número da página
    const pageNumber = `Página ${pdf.getCurrentPageInfo().pageNumber}`;
    const pageNumberWidth = pdf.getTextWidth(pageNumber);
    pdf.text(pageNumber, pageWidth - config.margin!.right - pageNumberWidth, footerY + 10);

    // ID do documento (centralizado)
    pdf.setFontSize(7);
    const docId = `ID: ${document.id}`;
    const docIdWidth = pdf.getTextWidth(docId);
    pdf.text(docId, (pageWidth - docIdWidth) / 2, footerY + 10);

    // Informações da clínica (placeholder)
    pdf.setFontSize(7);
    const clinicInfo = 'Clínica Veterinária • Tel: (11) 9999-9999 • email@clinica.com.br';
    const clinicInfoWidth = pdf.getTextWidth(clinicInfo);
    pdf.text(clinicInfo, (pageWidth - clinicInfoWidth) / 2, footerY + 16);
  }

  /**
   * Formata conteúdo para PDF com estrutura profissional
   */
  private formatContentForPDF(content: string): Array<{type: string, text: string}> {
    const sections: Array<{type: string, text: string}> = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (!line) continue;

      // Detectar títulos principais (linhas em maiúsculo ou com **texto**)
      if (line.match(/^[A-ZÁÊÇÕ\s]+:?$/) || line.match(/^\*\*.*\*\*$/)) {
        const cleanTitle = line.replace(/\*\*/g, '').replace(/:$/, '');
        sections.push({ type: 'title', text: cleanTitle });

      // Detectar subtítulos (linhas que terminam com :)
      } else if (line.endsWith(':') && line.length < 50) {
        sections.push({ type: 'subtitle', text: line });

      // Detectar itens de lista (começam com -, *, •, ou números)
      } else if (line.match(/^[\-\*•]\s/) || line.match(/^\d+[\.\)]\s/)) {
        const cleanItem = line.replace(/^[\-\*•]\s/, '').replace(/^\d+[\.\)]\s/, '');
        sections.push({ type: 'list_item', text: cleanItem });

      // Conteúdo normal
      } else {
        sections.push({ type: 'content', text: line });
      }
    }

    return sections;
  }

  /**
   * Quebra texto em linhas que cabem na largura especificada
   */
  private splitTextIntoLines(pdf: jsPDF, text: string, maxWidth: number): string[] {
    const lines: string[] = [];
    const paragraphs = text.split('\n');

    for (const paragraph of paragraphs) {
      if (paragraph.trim() === '') {
        lines.push('');
        continue;
      }

      const words = paragraph.split(' ');
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = pdf.getTextWidth(testLine);

        if (testWidth <= maxWidth) {
          currentLine = testLine;
        } else {
          if (currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            // Palavra muito longa, força quebra
            lines.push(word);
          }
        }
      }

      if (currentLine) {
        lines.push(currentLine);
      }
    }

    return lines;
  }

  /**
   * Gera nome do arquivo PDF
   */
  private generateFileName(document: GeneratedDocument): string {
    const date = new Date(document.generated_at);
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
    
    const sanitizedTitle = document.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 30);

    return `${sanitizedTitle}-${dateStr}-${timeStr}.pdf`;
  }

  /**
   * Gera PDF com layout específico por tipo de documento
   */
  async generateSpecializedPDF(document: GeneratedDocument): Promise<void> {
    let options: Partial<PDFGenerationOptions> = {};

    switch (document.document_type) {
      case 'clinical_summary':
        options = {
          fontSize: 11,
          lineHeight: 1.4
        };
        break;
      
      case 'prescription':
        options = {
          fontSize: 12,
          lineHeight: 1.6,
          includeHeader: true
        };
        break;
      
      case 'exam_requests':
        options = {
          fontSize: 11,
          lineHeight: 1.5
        };
        break;
      
      case 'specialist_referral':
        options = {
          fontSize: 11,
          lineHeight: 1.4
        };
        break;
    }

    await this.generateDocumentPDF(document, options);
  }

  /**
   * Gera PDF com múltiplos documentos de uma consulta
   */
  async generateConsultationReport(documents: GeneratedDocument[]): Promise<void> {
    if (documents.length === 0) return;

    const pdf = new jsPDF();
    const config = this.defaultOptions;
    let currentY = config.margin!.top;

    // Capa do relatório
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('RELATÓRIO COMPLETO DA CONSULTA', config.margin!.left, currentY);
    currentY += 20;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    const consultationDate = new Date(documents[0].generated_at).toLocaleDateString('pt-BR');
    pdf.text(`Data da Consulta: ${consultationDate}`, config.margin!.left, currentY);
    currentY += 10;

    pdf.text(`Total de Documentos: ${documents.length}`, config.margin!.left, currentY);
    currentY += 30;

    // Adiciona cada documento
    for (let i = 0; i < documents.length; i++) {
      const document = documents[i];
      
      // Nova página para cada documento (exceto o primeiro)
      if (i > 0) {
        pdf.addPage();
        currentY = config.margin!.top;
      }

      // Título do documento
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${i + 1}. ${document.title}`, config.margin!.left, currentY);
      currentY += 15;

      // Conteúdo do documento
      const contentWidth = pdf.internal.pageSize.getWidth() - config.margin!.left - config.margin!.right;
      currentY = this.addContent(pdf, document, currentY, config, contentWidth);
      currentY += 20;
    }

    // Download do relatório completo
    const fileName = `relatorio-consulta-${consultationDate.replace(/\//g, '-')}.pdf`;
    pdf.save(fileName);
  }
}

export const pdfGeneratorService = new PDFGeneratorService();
