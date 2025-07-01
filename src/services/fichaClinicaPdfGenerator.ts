import jsPDF from 'jspdf';
import { FichaClinica } from '../types/fichaClinica';

interface ClinicData {
  nome: string;
  razaoSocial?: string;
  telefone?: string;
  endereco?: string;
  email?: string;
}

interface VeterinarianData {
  nome: string;
  crmv?: string;
  assinatura?: string;
}

interface PDFGenerationOptions {
  clinicData?: ClinicData;
  veterinarianData?: VeterinarianData;
  includeEmptyFields?: boolean;
}

class FichaClinicaPDFGenerator {
  private pdf: jsPDF;
  private currentY: number = 0;
  private pageWidth: number = 0;
  private pageHeight: number = 0;
  private margin = { top: 20, bottom: 20, left: 20, right: 20 };
  private lineHeight = 6;
  private sectionSpacing = 8;

  constructor() {
    this.pdf = new jsPDF();
    this.pageWidth = this.pdf.internal.pageSize.getWidth();
    this.pageHeight = this.pdf.internal.pageSize.getHeight();
    this.currentY = this.margin.top;
  }

  /**
   * Gera PDF da Ficha Clínica Veterinária
   */
  async generatePDF(
    fichaClinica: FichaClinica, 
    options: PDFGenerationOptions = {}
  ): Promise<void> {
    this.currentY = this.margin.top;

    // Header com informações da clínica
    this.addClinicHeader(options.clinicData);
    
    // Título principal
    this.addMainTitle();
    
    // Dados básicos
    this.addBasicData(fichaClinica);
    
    // Dados do animal
    this.addAnimalData(fichaClinica);
    
    // Dados do proprietário
    this.addOwnerData(fichaClinica);
    
    // Diagnóstico/Procedimento
    this.addDiagnosisData(fichaClinica);
    
    // Dados do veterinário
    this.addVeterinarianData(fichaClinica, options.veterinarianData);
    
    // Queixa principal
    this.addChiefComplaint(fichaClinica);
    
    // Anamnese
    this.addAnamnesis(fichaClinica);
    
    // Sistemas corporais
    this.addBodySystems(fichaClinica);
    
    // Exame físico
    this.addPhysicalExamination(fichaClinica);
    
    // Diagnósticos diferenciais
    this.addDifferentialDiagnoses(fichaClinica);
    
    // Exame por imagem
    this.addImagingExams(fichaClinica);
    
    // Tratamento
    this.addTreatment(fichaClinica);

    // Download do PDF
    const fileName = `ficha-clinica-${fichaClinica.dadosAnimal.nome || 'animal'}-${new Date().toISOString().split('T')[0]}.pdf`;
    this.pdf.save(fileName);
  }

  private addClinicHeader(clinicData?: ClinicData): void {
    if (clinicData) {
      // Clinic name - bold and larger
      this.pdf.setFontSize(18);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(clinicData.nome, this.margin.left, this.currentY);
      this.currentY += this.lineHeight + 3;

      // Business name (razão social) if different
      if (clinicData.razaoSocial && clinicData.razaoSocial !== clinicData.nome) {
        this.pdf.setFontSize(12);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.text(clinicData.razaoSocial, this.margin.left, this.currentY);
        this.currentY += this.lineHeight + 1;
      }

      // Address
      if (clinicData.endereco) {
        this.pdf.setFontSize(10);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.text(`Endereço: ${clinicData.endereco}`, this.margin.left, this.currentY);
        this.currentY += this.lineHeight;
      }

      // Contact information
      if (clinicData.telefone) {
        this.pdf.setFontSize(10);
        this.pdf.text(`Telefone: ${clinicData.telefone}`, this.margin.left, this.currentY);
        this.currentY += this.lineHeight;
      }

      if (clinicData.email) {
        this.pdf.setFontSize(10);
        this.pdf.text(`E-mail: ${clinicData.email}`, this.margin.left, this.currentY);
        this.currentY += this.lineHeight;
      }

      // Add separator line
      this.currentY += 2;
      this.pdf.setLineWidth(0.5);
      this.pdf.line(this.margin.left, this.currentY, this.pageWidth - this.margin.right, this.currentY);
      this.currentY += this.sectionSpacing;
    } else {
      // Header template when no clinic data is available
      this.pdf.setFontSize(16);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text('CLÍNICA VETERINÁRIA', this.margin.left, this.currentY);
      this.currentY += this.lineHeight + 2;

      this.pdf.setFontSize(10);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text('Nome da Clínica: _______________________________________________', this.margin.left, this.currentY);
      this.currentY += this.lineHeight;
      this.pdf.text('Endereço: _______________________________________________', this.margin.left, this.currentY);
      this.currentY += this.lineHeight;
      this.pdf.text('Telefone: _________________ E-mail: _____________________', this.margin.left, this.currentY);
      this.currentY += this.lineHeight;

      // Add separator line
      this.currentY += 2;
      this.pdf.setLineWidth(0.5);
      this.pdf.line(this.margin.left, this.currentY, this.pageWidth - this.margin.right, this.currentY);
      this.currentY += this.sectionSpacing;
    }
  }

  private addMainTitle(): void {
    this.pdf.setFontSize(18);
    this.pdf.setFont('helvetica', 'bold');
    const title = 'FICHA CLÍNICA VETERINÁRIA';
    const titleWidth = this.pdf.getTextWidth(title);
    const centerX = (this.pageWidth - titleWidth) / 2;
    this.pdf.text(title, centerX, this.currentY);
    this.currentY += this.lineHeight + this.sectionSpacing;
  }

  private addBasicData(fichaClinica: FichaClinica): void {
    this.addSectionTitle('DADOS BÁSICOS');
    
    const basicData = [
      `Data: ${fichaClinica.dadosBasicos.dataConsulta || '_'.repeat(20)}`,
      `Hora: ${fichaClinica.dadosBasicos.horaConsulta || '_'.repeat(15)}`,
      `Atendimento: ${fichaClinica.dadosBasicos.atendimento || '_'.repeat(30)}`,
      `RGHV: ${fichaClinica.dadosBasicos.rghv || '_'.repeat(20)}`
    ];

    this.addFieldsInColumns(basicData, 2);
  }

  private addAnimalData(fichaClinica: FichaClinica): void {
    this.addSectionTitle('DADOS DO ANIMAL');
    
    const animalData = [
      `Nome: ${fichaClinica.dadosAnimal.nome || '_'.repeat(40)}`,
      `Pelagem: ${fichaClinica.dadosAnimal.pelagem || '_'.repeat(30)}`,
      `Espécie: ${fichaClinica.dadosAnimal.especie || '_'.repeat(20)}`,
      `Raça: ${fichaClinica.dadosAnimal.raca || '_'.repeat(30)}`,
      `Sexo: ${fichaClinica.dadosAnimal.sexo || '_'.repeat(15)}`,
      `Idade: ${fichaClinica.dadosAnimal.idade || '_'.repeat(15)}`,
      `Peso: ${fichaClinica.dadosAnimal.peso || '_'.repeat(15)}`
    ];

    this.addFieldsInColumns(animalData, 2);
  }

  private addOwnerData(fichaClinica: FichaClinica): void {
    this.addSectionTitle('DADOS DO PROPRIETÁRIO');
    
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    
    // Nome do proprietário (linha completa)
    this.pdf.text(`Proprietário: ${fichaClinica.dadosProprietario.nome || '_'.repeat(60)}`, this.margin.left, this.currentY);
    this.currentY += this.lineHeight;
    
    // Endereço (linha completa)
    this.pdf.text(`Endereço: ${fichaClinica.dadosProprietario.endereco || '_'.repeat(70)}`, this.margin.left, this.currentY);
    this.currentY += this.lineHeight;
    
    // Cidade, Estado, CEP
    const cityStateZip = `Cidade: ${fichaClinica.dadosProprietario.cidade || '_'.repeat(20)}  Estado: ${fichaClinica.dadosProprietario.estado || '_'.repeat(10)}  CEP: ${fichaClinica.dadosProprietario.cep || '_'.repeat(15)}`;
    this.pdf.text(cityStateZip, this.margin.left, this.currentY);
    this.currentY += this.lineHeight;
    
    // Telefone e Documento
    const phoneDoc = `Fone: ${fichaClinica.dadosProprietario.telefone || '_'.repeat(20)}  Doc. Identidade: ${fichaClinica.dadosProprietario.documentoIdentidade || '_'.repeat(20)}`;
    this.pdf.text(phoneDoc, this.margin.left, this.currentY);
    this.currentY += this.lineHeight;
    
    // Local do Exame
    this.pdf.text(`Local do Exame: ${fichaClinica.dadosProprietario.localExame || '_'.repeat(30)}`, this.margin.left, this.currentY);
    this.currentY += this.lineHeight + this.sectionSpacing;
  }

  private addDiagnosisData(fichaClinica: FichaClinica): void {
    this.addSectionTitle('DIAGNÓSTICO/PROCEDIMENTO');
    
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    
    // Diagnóstico
    this.pdf.text(`DIAGNÓSTICO: ${fichaClinica.diagnosticoProcedimento.diagnostico || '_'.repeat(60)}`, this.margin.left, this.currentY);
    this.currentY += this.lineHeight;
    
    // Sistema afetado
    this.pdf.text(`SISTEMA AFETADO: ${fichaClinica.diagnosticoProcedimento.sistemaAfetado || '_'.repeat(50)}`, this.margin.left, this.currentY);
    this.currentY += this.lineHeight;
    
    // Checkboxes e datas
    const checkboxes = [
      `Internado ${fichaClinica.diagnosticoProcedimento.internado.marcado ? '(X)' : '( )'} ${fichaClinica.diagnosticoProcedimento.internado.data || '___/___/___'}`,
      `Tratamento domiciliar ${fichaClinica.diagnosticoProcedimento.tratamentoDomiciliar.marcado ? '(X)' : '( )'} ${fichaClinica.diagnosticoProcedimento.tratamentoDomiciliar.data || '___/___/___'}`,
      `Eutanásia ${fichaClinica.diagnosticoProcedimento.eutanasia.marcado ? '(X)' : '( )'} ${fichaClinica.diagnosticoProcedimento.eutanasia.data || '___/___/___'}`
    ];
    
    this.pdf.text(checkboxes.join('   '), this.margin.left, this.currentY);
    this.currentY += this.lineHeight;
    
    // Alta, Óbito, Responsável
    const altaObito = `Alta ${fichaClinica.diagnosticoProcedimento.alta || '___/___/___'}   Óbito ${fichaClinica.diagnosticoProcedimento.obito.data || '___/___/___'} ${fichaClinica.diagnosticoProcedimento.obito.hora || '___:___'} Horas   Responsável ${fichaClinica.diagnosticoProcedimento.responsavel || '_'.repeat(20)}`;
    this.pdf.text(altaObito, this.margin.left, this.currentY);
    this.currentY += this.lineHeight + this.sectionSpacing;
  }

  private addVeterinarianData(fichaClinica: FichaClinica, veterinarianData?: VeterinarianData): void {
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    
    const vetName = veterinarianData?.nome || fichaClinica.dadosVeterinario.nome || '_'.repeat(40);
    const vetSignature = veterinarianData?.assinatura || fichaClinica.dadosVeterinario.assinatura || '_'.repeat(30);
    
    this.pdf.text(`Médico Veterinário: ${vetName}`, this.margin.left, this.currentY);
    this.currentY += this.lineHeight;
    this.pdf.text(`Assinatura: ${vetSignature}`, this.margin.left, this.currentY);
    this.currentY += this.lineHeight + this.sectionSpacing;
  }

  private addChiefComplaint(fichaClinica: FichaClinica): void {
    this.addSectionTitle('QUEIXA PRINCIPAL/EVOLUÇÃO');
    this.addTextArea(fichaClinica.queixaPrincipal.descricao, 3);
  }

  private addAnamnesis(fichaClinica: FichaClinica): void {
    this.addSectionTitle('ANAMNESE');
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'italic');
    this.pdf.text('(antecedentes mórbidos, vacinações, vermifugações, ectoparasitas, comportamento, alimentação, histórico do rebanho/familiar, acesso à rua, habitat, contactantes, contato com roedores)', this.margin.left, this.currentY);
    this.currentY += this.lineHeight + 2;

    // Individual labeled fields
    this.addLabeledField('Antecedentes Mórbidos', fichaClinica.anamnese.antecedentesMorbidos);
    this.addLabeledField('Vacinações', fichaClinica.anamnese.vacinacoes);
    this.addLabeledField('Vermifugações', fichaClinica.anamnese.vermifugacoes);
    this.addLabeledField('Ectoparasitas', fichaClinica.anamnese.ectoparasitas);
    this.addLabeledField('Comportamento', fichaClinica.anamnese.comportamento);
    this.addLabeledField('Alimentação', fichaClinica.anamnese.alimentacao);
    this.addLabeledField('Histórico do Rebanho/Familiar', fichaClinica.anamnese.historicoRebanhoFamiliar);
    this.addLabeledField('Acesso à Rua', fichaClinica.anamnese.acessoRua);
    this.addLabeledField('Habitat', fichaClinica.anamnese.habitat);
    this.addLabeledField('Contactantes', fichaClinica.anamnese.contactantes);
    this.addLabeledField('Contato com Roedores', fichaClinica.anamnese.contatoRoedores);

    this.currentY += this.sectionSpacing;
  }

  private addBodySystems(fichaClinica: FichaClinica): void {
    // Sistema Digestório
    this.addSectionTitle('SISTEMA DIGESTÓRIO E GLÂNDULAS ANEXAS');
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'italic');
    this.pdf.text('(alimentação, emese, regurgitação, diarréia, disquesia, tenesmo)', this.margin.left, this.currentY);
    this.currentY += this.lineHeight;



    // Individual fields
    this.addLabeledField('Alimentação', fichaClinica.sistemaDigestorio.alimentacao);
    this.addLabeledField('Emese', fichaClinica.sistemaDigestorio.emese);
    this.addLabeledField('Regurgitação', fichaClinica.sistemaDigestorio.regurgitacao);
    this.addLabeledField('Diarréia', fichaClinica.sistemaDigestorio.diarreia);
    this.addLabeledField('Disquesia', fichaClinica.sistemaDigestorio.disquesia);
    this.addLabeledField('Tenesmo', fichaClinica.sistemaDigestorio.tenesmo);
    this.currentY += this.sectionSpacing;

    // Sistema Respiratório e Cardiovascular
    this.addSectionTitle('SISTEMA RESPIRATÓRIO E CARDIOVASCULAR');
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'italic');
    this.pdf.text('(tosse, espirro, secreções, dispnéia, taquipnéia, cianose, tosse, cansaço fácil, síncope, emagrecimento e cianose)', this.margin.left, this.currentY);
    this.currentY += this.lineHeight + 2;

    // Individual fields
    this.addLabeledField('Tosse', fichaClinica.sistemaRespiratorioCardiovascular.tosse);
    this.addLabeledField('Espirro', fichaClinica.sistemaRespiratorioCardiovascular.espirro);
    this.addLabeledField('Secreções', fichaClinica.sistemaRespiratorioCardiovascular.secrecoes);
    this.addLabeledField('Dispnéia', fichaClinica.sistemaRespiratorioCardiovascular.dispneia);
    this.addLabeledField('Taquipnéia', fichaClinica.sistemaRespiratorioCardiovascular.taquipneia);
    this.addLabeledField('Cianose', fichaClinica.sistemaRespiratorioCardiovascular.cianose);
    this.addLabeledField('Cansaço Fácil', fichaClinica.sistemaRespiratorioCardiovascular.cansacoFacil);
    this.addLabeledField('Síncope', fichaClinica.sistemaRespiratorioCardiovascular.sincope);
    this.addLabeledField('Emagrecimento', fichaClinica.sistemaRespiratorioCardiovascular.emagrecimento);
    this.currentY += this.sectionSpacing;

    // Sistema Gênito Urinário
    this.addSectionTitle('SISTEMA GÊNITO URINÁRIO E GLÂNDULAS MAMÁRIAS');
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'italic');
    this.pdf.text('(ingestão hídrica, urina, último cio, último parto, secreção vaginal ou peniana, castração)', this.margin.left, this.currentY);
    this.currentY += this.lineHeight;



    // Individual fields
    this.addLabeledField('Ingestão Hídrica', fichaClinica.sistemaGenitoUrinario.ingestaoHidrica);
    this.addLabeledField('Urina', fichaClinica.sistemaGenitoUrinario.urina);
    this.addLabeledField('Último Cio', fichaClinica.sistemaGenitoUrinario.ultimoCio);
    this.addLabeledField('Último Parto', fichaClinica.sistemaGenitoUrinario.ultimoParto);
    this.addLabeledField('Secreção Vaginal ou Peniana', fichaClinica.sistemaGenitoUrinario.secrecaoVaginalPeniana);
    this.addLabeledField('Castração', fichaClinica.sistemaGenitoUrinario.castracao);
    this.currentY += this.sectionSpacing;

    // Sistema Tegumentar
    this.addSectionTitle('SISTEMA TEGUMENTAR');
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'italic');
    this.pdf.text('(início da lesão e evolução, histórico, prurido, localização, características, pele e pêlos, secreção otológica, meneios cefálicos, banhos)', this.margin.left, this.currentY);
    this.currentY += this.lineHeight;



    // Individual fields
    this.addLabeledField('Início da Lesão', fichaClinica.sistemaTegumentar.inicioLesao);
    this.addLabeledField('Evolução da Lesão', fichaClinica.sistemaTegumentar.evolucaoLesao);
    this.addLabeledField('Histórico', fichaClinica.sistemaTegumentar.historico);
    this.addLabeledField('Prurido', fichaClinica.sistemaTegumentar.prurido);
    this.addLabeledField('Localização', fichaClinica.sistemaTegumentar.localizacao);
    this.addLabeledField('Características', fichaClinica.sistemaTegumentar.caracteristicas);
    this.addLabeledField('Pele e Pêlos', fichaClinica.sistemaTegumentar.pelePelos);
    this.addLabeledField('Secreção Otológica', fichaClinica.sistemaTegumentar.secrecaoOtologica);
    this.addLabeledField('Meneios Cefálicos', fichaClinica.sistemaTegumentar.meneiosCefalicos);
    this.addLabeledField('Banhos', fichaClinica.sistemaTegumentar.banhos);
    this.currentY += this.sectionSpacing;

    // Sistema Nervoso
    this.addSectionTitle('SISTEMA NERVOSO');
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'italic');
    this.pdf.text('(estado mental, comportamento, ataxia, paresia, paralisia, convulsão, audição, visão, evolução)', this.margin.left, this.currentY);
    this.currentY += this.lineHeight;



    // Individual fields
    this.addLabeledField('Estado Mental', fichaClinica.sistemaNervoso.estadoMental);
    this.addLabeledField('Comportamento', fichaClinica.sistemaNervoso.comportamento);
    this.addLabeledField('Ataxia', fichaClinica.sistemaNervoso.ataxia);
    this.addLabeledField('Paresia', fichaClinica.sistemaNervoso.paresia);
    this.addLabeledField('Paralisia', fichaClinica.sistemaNervoso.paralisia);
    this.addLabeledField('Convulsão', fichaClinica.sistemaNervoso.convulsao);
    this.addLabeledField('Audição', fichaClinica.sistemaNervoso.audicao);
    this.addLabeledField('Visão', fichaClinica.sistemaNervoso.visao);
    this.addLabeledField('Evolução', fichaClinica.sistemaNervoso.evolucao);
    this.currentY += this.sectionSpacing;

    // Sistema Oftálmico
    this.addSectionTitle('SISTEMA OFTÁLMICO');
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'italic');
    this.pdf.text('(secreção ocular, blefaroespasmo)', this.margin.left, this.currentY);
    this.currentY += this.lineHeight;



    // Individual fields
    this.addLabeledField('Secreção Ocular', fichaClinica.sistemaOftalmico.secrecaoOcular);
    this.addLabeledField('Blefaroespasmo', fichaClinica.sistemaOftalmico.blefaroespasmo);
    this.currentY += this.sectionSpacing;

    // Sistema Músculo-Esquelético
    this.addSectionTitle('SISTEMA MÚSCULO-ESQUELÉTICO');
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'italic');
    this.pdf.text('(claudicação, postura, fraturas, atrofia muscular)', this.margin.left, this.currentY);
    this.currentY += this.lineHeight;



    // Individual fields
    this.addLabeledField('Claudicação', fichaClinica.sistemaMusculoEsqueletico.claudicacao);
    this.addLabeledField('Postura', fichaClinica.sistemaMusculoEsqueletico.postura);
    this.addLabeledField('Fraturas', fichaClinica.sistemaMusculoEsqueletico.fraturas);
    this.addLabeledField('Atrofia Muscular', fichaClinica.sistemaMusculoEsqueletico.atrofiaMuscular);
    this.currentY += this.sectionSpacing;

    this.checkPageBreak();
  }



  private addPhysicalExamination(fichaClinica: FichaClinica): void {
    this.addSectionTitle('EXAME FÍSICO');
    
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    
    // Vital signs in table format
    const vitalSigns = `FC ${fichaClinica.exameFisico.fc || '______'}   FR ${fichaClinica.exameFisico.fr || '______'}   MI ${fichaClinica.exameFisico.mi || '______'}`;
    this.pdf.text(vitalSigns, this.margin.left, this.currentY);
    this.currentY += this.lineHeight + 2;
    
    // Other physical exam data
    const physicalData = [
      `T° C ${fichaClinica.exameFisico.temperatura || '____________'}   Hidratação ${fichaClinica.exameFisico.hidratacao || '____________'}        Linfonodos ${fichaClinica.exameFisico.linfonodos || '____________'}`,
      `Mucosas ${fichaClinica.exameFisico.mucosas || '____________'}   TPC ${fichaClinica.exameFisico.tpc || '____________'}`,
      `Pulso ${fichaClinica.exameFisico.pulso || '____________'}   Inspeção geral ${fichaClinica.exameFisico.inspecaoGeral || '____________'}`,
      `Pêlos e pele ${fichaClinica.exameFisico.pelosPele || '____________'}   Estado Nutricional ${fichaClinica.exameFisico.estadoNutricional || '____________'}`,
      `Palpação ${fichaClinica.exameFisico.palpacao || '____________'}`
    ];
    
    physicalData.forEach(line => {
      this.pdf.text(line, this.margin.left, this.currentY);
      this.currentY += this.lineHeight;
    });
    
    this.pdf.text(`Auscultação cardio-pulmonar ${fichaClinica.exameFisico.auscultacaoCardioPulmonar || '_'.repeat(40)}`, this.margin.left, this.currentY);
    this.currentY += this.lineHeight;
    this.pdf.text(`Percussão ${fichaClinica.exameFisico.percussao || '_'.repeat(40)}`, this.margin.left, this.currentY);
    this.currentY += this.lineHeight + 2;
    
    // Observações complementares
    this.pdf.text('Observações complementares:', this.margin.left, this.currentY);
    this.currentY += this.lineHeight;
    this.addTextArea(fichaClinica.exameFisico.observacoesComplementares, 6);
  }

  private addDifferentialDiagnoses(fichaClinica: FichaClinica): void {
    this.addSectionTitle('DIAGNÓSTICOS DIFERENCIAIS');
    this.addTextArea(fichaClinica.diagnosticosDiferenciais.diagnosticos, 2);
  }

  private addImagingExams(fichaClinica: FichaClinica): void {
    this.addSectionTitle('EXAME POR IMAGEM');
    
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    
    const imaging = `RX ${fichaClinica.examePorImagem.rx ? '☑' : '☐'}    US ${fichaClinica.examePorImagem.us ? '☑' : '☐'}    Tomografia ${fichaClinica.examePorImagem.tomografia ? '☑' : '☐'}`;
    this.pdf.text(imaging, this.margin.left, this.currentY);
    this.currentY += this.lineHeight;
    
    this.pdf.text(`Região a ser examinada: ${fichaClinica.examePorImagem.regiaoExaminada || '_'.repeat(40)}`, this.margin.left, this.currentY);
    this.currentY += this.lineHeight;
    
    const imagingDetails = `Nº da radiografia ${fichaClinica.examePorImagem.numeroRadiografia || '____________'}   Quantidade ${fichaClinica.examePorImagem.quantidade || '____________'}   Data ${fichaClinica.examePorImagem.data || '___/___/____'}`;
    this.pdf.text(imagingDetails, this.margin.left, this.currentY);
    this.currentY += this.lineHeight + this.sectionSpacing;
  }

  private addTreatment(fichaClinica: FichaClinica): void {
    this.addSectionTitle('TRATAMENTO');
    this.addTextArea(fichaClinica.tratamento.prescricao, 6);
    
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(`RETORNO: ${fichaClinica.tratamento.retorno || '_'.repeat(30)}`, this.margin.left, this.currentY);
    this.currentY += this.lineHeight;
  }

  private addSectionTitle(title: string): void {
    this.checkPageBreak();
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(title, this.margin.left, this.currentY);
    this.currentY += this.lineHeight + 2;
  }

  private addFieldsInColumns(fields: string[], columns: number): void {
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    
    const columnWidth = (this.pageWidth - this.margin.left - this.margin.right) / columns;
    
    fields.forEach((field, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      const x = this.margin.left + (column * columnWidth);
      const y = this.currentY + (row * this.lineHeight);
      
      this.pdf.text(field, x, y);
    });
    
    const rows = Math.ceil(fields.length / columns);
    this.currentY += (rows * this.lineHeight) + this.sectionSpacing;
  }

  private addLabeledField(label: string, value: string | undefined, lineLength: number = 60): void {
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');

    const fieldText = `${label}: ${value || '_'.repeat(lineLength - label.length - 2)}`;
    this.pdf.text(fieldText, this.margin.left, this.currentY);
    this.currentY += this.lineHeight;
  }

  private addTextArea(text: string, lines: number): void {
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');

    if (text && text.trim()) {
      const maxWidth = this.pageWidth - this.margin.left - this.margin.right;
      const splitText = this.pdf.splitTextToSize(text, maxWidth);

      splitText.forEach((line: string, index: number) => {
        if (index < lines) {
          this.pdf.text(line, this.margin.left, this.currentY);
          this.currentY += this.lineHeight;
        }
      });

      // Add remaining empty lines
      const remainingLines = lines - splitText.length;
      for (let i = 0; i < remainingLines; i++) {
        this.pdf.text('_'.repeat(80), this.margin.left, this.currentY);
        this.currentY += this.lineHeight;
      }
    } else {
      // Add empty lines
      for (let i = 0; i < lines; i++) {
        this.pdf.text('_'.repeat(80), this.margin.left, this.currentY);
        this.currentY += this.lineHeight;
      }
    }

    this.currentY += this.sectionSpacing;
  }

  private checkPageBreak(): void {
    if (this.currentY > this.pageHeight - this.margin.bottom - 20) {
      this.pdf.addPage();
      this.currentY = this.margin.top;
    }
  }
}

export const fichaClinicaPdfGenerator = new FichaClinicaPDFGenerator();
