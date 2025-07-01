// Interfaces para a Ficha Clínica Veterinária - Frontend

export interface DadosBasicos {
  dataConsulta: string;
  horaConsulta: string;
  atendimento: string;
  rghv: string; // Registro Geral do Hospital Veterinário
}

export interface DadosAnimal {
  nome: string;
  pelagem: string;
  especie: string;
  raca: string;
  sexo: string;
  idade: string;
  peso: string;
}

export interface DadosProprietario {
  nome: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  telefone: string;
  documentoIdentidade: string;
  localExame: string;
}

export interface DiagnosticoProcedimento {
  diagnostico: string;
  sistemaAfetado: string;
  internado: {
    marcado: boolean;
    data: string;
  };
  tratamentoDomiciliar: {
    marcado: boolean;
    data: string;
  };
  eutanasia: {
    marcado: boolean;
    data: string;
  };
  alta: string;
  obito: {
    data: string;
    hora: string;
  };
  responsavel: string;
}

export interface DadosVeterinario {
  nome: string;
  assinatura: string;
}

export interface QueixaPrincipal {
  descricao: string;
}

export interface Anamnese {
  antecedentesMorbidos: string;
  vacinacoes: string;
  vermifugacoes: string;
  ectoparasitas: string;
  comportamento: string;
  alimentacao: string;
  historicoRebanhoFamiliar: string;
  acessoRua: string;
  habitat: string;
  contactantes: string;
  contatoRoedores: string;
}

export interface SistemaDigestorio {
  alimentacao: string;
  emese: string;
  regurgitacao: string;
  diarreia: string;
  disquesia: string;
  tenesmo: string;
}

export interface SistemaRespiratorioCardiovascular {
  tosse: string;
  espirro: string;
  secrecoes: string;
  dispneia: string;
  taquipneia: string;
  cianose: string;
  cansacoFacil: string;
  sincope: string;
  emagrecimento: string;
}

export interface SistemaGenitoUrinario {
  ingestaoHidrica: string;
  urina: string;
  ultimoCio: string;
  ultimoParto: string;
  secrecaoVaginalPeniana: string;
  castracao: string;
}

export interface SistemaTegumentar {
  inicioLesao: string;
  evolucaoLesao: string;
  historico: string;
  prurido: string;
  localizacao: string;
  caracteristicas: string;
  pelePelos: string;
  secrecaoOtologica: string;
  meneiosCefalicos: string;
  banhos: string;
}

export interface SistemaNervoso {
  estadoMental: string;
  comportamento: string;
  ataxia: string;
  paresia: string;
  paralisia: string;
  convulsao: string;
  audicao: string;
  visao: string;
  evolucao: string;
}

export interface SistemaOftalmico {
  secrecaoOcular: string;
  blefaroespasmo: string;
}

export interface SistemaMusculoEsqueletico {
  claudicacao: string;
  postura: string;
  fraturas: string;
  atrofiaMuscular: string;
}

export interface ExameFisico {
  fc: string; // Frequência Cardíaca
  fr: string; // Frequência Respiratória
  mi: string; // Movimento Intestinal
  temperatura: string;
  hidratacao: string;
  linfonodos: string;
  mucosas: string;
  tpc: string; // Tempo de Preenchimento Capilar
  pulso: string;
  inspecaoGeral: string;
  pelosPele: string;
  estadoNutricional: string;
  palpacao: string;
  auscultacaoCardioPulmonar: string;
  percussao: string;
  observacoesComplementares: string;
}

export interface DiagnosticosDiferenciais {
  diagnosticos: string;
}

export interface ExamePorImagem {
  rx: boolean;
  us: boolean;
  tomografia: boolean;
  regiaoExaminada: string;
  numeroRadiografia: string;
  quantidade: string;
  data: string;
}

export interface Tratamento {
  prescricao: string;
  retorno: string;
}

export interface FichaClinica {
  id: string;
  consultationId: string;
  userId: string;
  dadosBasicos: DadosBasicos;
  dadosAnimal: DadosAnimal;
  dadosProprietario: DadosProprietario;
  diagnosticoProcedimento: DiagnosticoProcedimento;
  dadosVeterinario: DadosVeterinario;
  queixaPrincipal: QueixaPrincipal;
  anamnese: Anamnese;
  sistemaDigestorio: SistemaDigestorio;
  sistemaRespiratorioCardiovascular: SistemaRespiratorioCardiovascular;
  sistemaGenitoUrinario: SistemaGenitoUrinario;
  sistemaTegumentar: SistemaTegumentar;
  sistemaNervoso: SistemaNervoso;
  sistemaOftalmico: SistemaOftalmico;
  sistemaMusculoEsqueletico: SistemaMusculoEsqueletico;
  exameFisico: ExameFisico;
  diagnosticosDiferenciais: DiagnosticosDiferenciais;
  examePorImagem: ExamePorImagem;
  tratamento: Tratamento;
  createdAt: string;
  updatedAt: string;
}

// Interface para resposta da API
export interface FichaClinicaResponse {
  success: boolean;
  data?: FichaClinica | null;
  message?: string;
}

// Interface para listagem de fichas
export interface ListFichasClinicasResponse {
  success: boolean;
  data?: FichaClinica[];
  total?: number;
  message?: string;
}
