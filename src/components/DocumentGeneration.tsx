import React, { useState, useEffect } from 'react';
import { FileText, UserCheck, FlaskConical, Pill, Copy, Download, CheckCircle, AlertCircle, Loader2, FileDown } from 'lucide-react';
import { documentsApiService } from '../services/documentsApi';
import { pdfGeneratorService } from '../services/pdfGenerator';

interface DocumentGenerationProps {
  transcription: string;
  consultationId?: string;
}

interface DocumentType {
  type: string;
  name: string;
  description: string;
  icon: string;
}

interface GeneratedDocument {
  id: string;
  consultation_id: string;
  document_type: string;
  title: string;
  content: string;
  generated_at: string;
}

const DocumentGeneration: React.FC<DocumentGenerationProps> = ({ 
  transcription, 
  consultationId 
}) => {
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [generatedDocuments, setGeneratedDocuments] = useState<Record<string, GeneratedDocument>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pdfGenerating, setPdfGenerating] = useState<Record<string, boolean>>({});

  // Ícones para cada tipo de documento
  const iconMap = {
    'clinical_summary': FileText,
    'specialist_referral': UserCheck,
    'exam_requests': FlaskConical,
    'prescription': Pill
  };

  useEffect(() => {
    loadDocumentTypes();
    if (consultationId) {
      loadExistingDocuments();
    }
  }, [consultationId]);

  const loadDocumentTypes = async () => {
    try {
      console.log('🔍 Carregando tipos de documentos...');
      const types = await documentsApiService.getDocumentTypes();
      console.log('✅ Tipos de documentos carregados:', types);
      setDocumentTypes(types);
    } catch (error) {
      console.error('❌ Erro ao carregar tipos de documentos:', error);
    }
  };

  const loadExistingDocuments = async () => {
    if (!consultationId) return;
    
    try {
      const documents = await documentsApiService.getConsultationDocuments(consultationId);
      const documentsMap: Record<string, GeneratedDocument> = {};
      documents.forEach(doc => {
        documentsMap[doc.document_type] = doc;
      });
      setGeneratedDocuments(documentsMap);
    } catch (error) {
      console.error('Erro ao carregar documentos existentes:', error);
    }
  };

  const generateDocument = async (documentType: string) => {
    if (!consultationId) {
      setErrors(prev => ({
        ...prev,
        [documentType]: 'É necessário salvar a consulta antes de gerar documentos'
      }));
      return;
    }

    setLoadingStates(prev => ({ ...prev, [documentType]: true }));
    setErrors(prev => ({ ...prev, [documentType]: '' }));

    try {
      const document = await documentsApiService.generateDocument({
        consultation_id: consultationId,
        document_type: documentType,
        transcription
      });

      setGeneratedDocuments(prev => ({
        ...prev,
        [documentType]: document
      }));
    } catch (error: any) {
      if (error.response?.data?.code === 'DOCUMENT_ALREADY_EXISTS') {
        setErrors(prev => ({
          ...prev,
          [documentType]: 'Este documento já foi gerado para esta consulta'
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          [documentType]: 'Erro ao gerar documento. Tente novamente.'
        }));
      }
    } finally {
      setLoadingStates(prev => ({ ...prev, [documentType]: false }));
    }
  };

  const handleCopy = async (content: string, documentType: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopySuccess(documentType);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
    }
  };

  const handleDownloadText = (content: string, title: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = async (document: GeneratedDocument, documentType: string) => {
    setPdfGenerating(prev => ({ ...prev, [documentType]: true }));

    try {
      await pdfGeneratorService.generateSpecializedPDF(document);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      setErrors(prev => ({
        ...prev,
        [documentType]: 'Erro ao gerar PDF. Tente novamente.'
      }));
    } finally {
      setPdfGenerating(prev => ({ ...prev, [documentType]: false }));
    }
  };

  const handleGenerateCompleteReport = async () => {
    setPdfGenerating(prev => ({ ...prev, 'complete_report': true }));

    try {
      const documents = Object.values(generatedDocuments);
      await pdfGeneratorService.generateConsultationReport(documents);
    } catch (error) {
      console.error('Erro ao gerar relatório completo:', error);
      setErrors(prev => ({
        ...prev,
        'complete_report': 'Erro ao gerar relatório. Tente novamente.'
      }));
    } finally {
      setPdfGenerating(prev => ({ ...prev, 'complete_report': false }));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (documentTypes.length === 0) {
    return (
      <div className="card">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Documentos Veterinários Especializados
          </h3>
          <p className="text-sm text-gray-600">
            Carregando tipos de documentos disponíveis...
          </p>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Documentos Veterinários Especializados
        </h3>
        <p className="text-sm text-gray-600">
          Gere documentos profissionais baseados na transcrição da consulta
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documentTypes.map((docType) => {
          const IconComponent = iconMap[docType.type as keyof typeof iconMap] || FileText;
          const isGenerated = generatedDocuments[docType.type];
          const isLoading = loadingStates[docType.type];
          const error = errors[docType.type];
          const isPdfGenerating = pdfGenerating[docType.type];

          return (
            <div key={docType.type} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-shrink-0 p-2 bg-blue-50 rounded-lg">
                  <IconComponent className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 mb-1">
                    {docType.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {docType.description}
                  </p>
                </div>
              </div>

              {error && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {!isGenerated ? (
                <button
                  onClick={() => generateDocument(docType.type)}
                  disabled={isLoading || !consultationId}
                  className="w-full btn-primary flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <IconComponent className="w-4 h-4" />
                      Gerar {docType.name}
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    Gerado em {formatDate(isGenerated.generated_at)}
                  </div>
                  
                  <div className="bg-gray-50 rounded p-3 max-h-32 overflow-y-auto text-sm">
                    <div className="text-gray-800 whitespace-pre-wrap">
                      {isGenerated.content.substring(0, 200)}
                      {isGenerated.content.length > 200 && '...'}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopy(isGenerated.content, docType.type)}
                      className="flex-1 btn-secondary flex items-center justify-center gap-2 text-sm"
                    >
                      {copySuccess === docType.type ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copiar
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDownloadPDF(isGenerated, docType.type)}
                      disabled={isPdfGenerating}
                      className="flex-1 btn-secondary flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isPdfGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Gerando...
                        </>
                      ) : (
                        <>
                          <FileDown className="w-4 h-4" />
                          PDF
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDownloadText(isGenerated.content, isGenerated.title)}
                      className="btn-secondary flex items-center justify-center gap-1 text-sm px-3"
                      title="Download como texto"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!consultationId && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
          <AlertCircle className="w-4 h-4 inline mr-2" />
          Salve a consulta primeiro para poder gerar documentos especializados
        </div>
      )}

      {/* Relatório Completo */}
      {consultationId && Object.keys(generatedDocuments).length > 1 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Relatório Completo da Consulta
          </h4>
          <p className="text-sm text-blue-700 mb-3">
            Gere um PDF único contendo todos os documentos desta consulta
          </p>
          <button
            onClick={() => handleGenerateCompleteReport()}
            disabled={pdfGenerating['complete_report']}
            className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pdfGenerating['complete_report'] ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Gerando Relatório...
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                Gerar Relatório Completo (PDF)
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default DocumentGeneration;
