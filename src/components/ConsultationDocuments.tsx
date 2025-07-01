import React, { useState, useEffect } from 'react';
import {
  FileText,
  UserCheck,
  TestTube,
  Pill,
  Plus,
  Eye,
  Download,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Copy,
  X
} from 'lucide-react';
import { SavedConsultation } from '../types';

interface DocumentType {
  type: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
}

interface GeneratedDocument {
  id: string;
  consultation_id: string;
  document_type: string;
  title: string;
  content: string;
  generated_at: string;
}

interface ConsultationDocumentsProps {
  consultation: SavedConsultation;
}

const ConsultationDocuments: React.FC<ConsultationDocumentsProps> = ({ consultation }) => {
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingType, setGeneratingType] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<GeneratedDocument | null>(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const documentTypes: DocumentType[] = [
    {
      type: 'exam_requests',
      name: 'Pedidos de Exames',
      icon: TestTube,
      description: 'Solicitação de exames complementares'
    },
    {
      type: 'specialist_referral',
      name: 'Encaminhamento para Especialista',
      icon: UserCheck,
      description: 'Encaminhamento para especialista'
    },
    {
      type: 'prescription',
      name: 'Prescrição Veterinária',
      icon: Pill,
      description: 'Prescrição veterinária'
    }
  ];

  useEffect(() => {
    loadDocuments();
  }, [consultation.id]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);

      const storedAuth = localStorage.getItem('vet-auth');
      if (!storedAuth) {
        throw new Error('Usuário não autenticado');
      }

      const { credentials } = JSON.parse(storedAuth);

      const response = await fetch(`/api/consultations/${consultation.id}/documents`, {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar documentos');
      }

      const data = await response.json();
      if (data.success) {
        setDocuments(data.documents || []);
      } else {
        throw new Error(data.message || 'Erro ao carregar documentos');
      }

    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
      setError(error instanceof Error ? error.message : 'Erro ao carregar documentos');
    } finally {
      setLoading(false);
    }
  };

  const generateDocument = async (documentType: string) => {
    try {
      setGeneratingType(documentType);
      setError(null);

      const storedAuth = localStorage.getItem('vet-auth');
      if (!storedAuth) {
        throw new Error('Usuário não autenticado');
      }

      const { credentials } = JSON.parse(storedAuth);

      const response = await fetch(`/api/consultations/${consultation.id}/documents/${documentType}/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          petName: '',
          tutorName: '',
          additionalContext: ''
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao gerar documento');
      }

      const data = await response.json();
      if (data.success) {
        await loadDocuments(); // Recarregar lista de documentos
      } else {
        throw new Error(data.message || 'Erro ao gerar documento');
      }

    } catch (error) {
      console.error('Erro ao gerar documento:', error);
      setError(error instanceof Error ? error.message : 'Erro ao gerar documento');
    } finally {
      setGeneratingType(null);
    }
  };

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
    }
  };

  const handleDownload = (document: GeneratedDocument) => {
    const blob = new Blob([document.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `${document.title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.txt`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getDocumentByType = (type: string) => {
    return documents.find(doc => doc.document_type === type);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <Clock className="w-4 h-4 animate-spin" />
          Carregando...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadDocuments}
            className="btn-secondary flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Outros Documentos</h3>
          <p className="text-sm text-gray-500 mt-1">Gere documentos complementares para esta consulta</p>
        </div>
        <button
          onClick={loadDocuments}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documentTypes.map((docType) => {
          const existingDoc = getDocumentByType(docType.type);
          const isGenerating = generatingType === docType.type;
          const IconComponent = docType.icon;

          return (
            <div
              key={docType.type}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    existingDoc ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{docType.name}</h4>
                    <p className="text-sm text-gray-500">{docType.description}</p>
                  </div>
                </div>
                
                {existingDoc && (
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-green-600">Gerado</span>
                  </div>
                )}
              </div>

              {existingDoc ? (
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    <strong>{existingDoc.title}</strong>
                  </div>
                  <div className="text-xs text-gray-500">
                    Gerado em: {new Date(existingDoc.generated_at).toLocaleString('pt-BR')}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedDocument(existingDoc);
                        setShowDocumentModal(true);
                      }}
                      className="btn-secondary flex items-center gap-1 text-xs"
                    >
                      <Eye className="w-3 h-3" />
                      Ver
                    </button>
                    <button
                      onClick={() => handleCopy(existingDoc.content, existingDoc.id)}
                      className="btn-secondary flex items-center gap-1 text-xs"
                    >
                      {copySuccess === existingDoc.id ? (
                        <>
                          <CheckCircle className="w-3 h-3 text-green-600" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copiar
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDownload(existingDoc)}
                      className="btn-secondary flex items-center gap-1 text-xs"
                    >
                      <Download className="w-3 h-3" />
                      Baixar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500">Documento não gerado</p>
                  <button
                    onClick={() => generateDocument(docType.type)}
                    disabled={isGenerating}
                    className="btn-primary flex items-center gap-2 text-sm w-full"
                  >
                    {isGenerating ? (
                      <>
                        <Clock className="w-4 h-4 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Gerar Documento
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal de visualização de documento */}
      {showDocumentModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">{selectedDocument.title}</h2>
              <button
                onClick={() => setShowDocumentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="whitespace-pre-wrap text-gray-700">
                {selectedDocument.content}
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => handleCopy(selectedDocument.content, 'modal')}
                className="btn-secondary flex items-center gap-2"
              >
                {copySuccess === 'modal' ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
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
                onClick={() => handleDownload(selectedDocument)}
                className="btn-primary flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Baixar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultationDocuments;
