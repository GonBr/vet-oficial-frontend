import React, { useState } from 'react';
import { Copy, Download, CheckCircle, AlertCircle, Save, FileText, RefreshCw } from 'lucide-react';
import { TranscriptionResult, CreateConsultationData } from '../types';
import { consultationsApiService } from '../services/consultationsApi';
import SaveConsultationModal from './SaveConsultationModal';
import DocumentGeneration from './DocumentGeneration';
import FichaClinica from './FichaClinica';

interface ResultsProps {
  result: TranscriptionResult;
  onNewRecording: () => void;
}

const Results: React.FC<ResultsProps> = ({ result, onNewRecording }) => {
  const [copySuccess, setCopySuccess] = useState<'transcription' | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedConsultationId, setSavedConsultationId] = useState<string | null>(null);
  const [generatingFicha, setGeneratingFicha] = useState(false);

  const handleCopy = async (text: string, type: 'transcription') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
    }
  };

  const handleDownload = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatDate = () => {
    return new Date().toLocaleString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSaveConsultation = async (consultationData: CreateConsultationData) => {
    try {
      setSaveError(null);
      const savedConsultation = await consultationsApiService.saveConsultation(consultationData);
      setSavedConsultationId(savedConsultation.id);
      setSaveSuccess(true);
      setShowSaveModal(false);

      // Gerar automaticamente a Ficha Clínica após salvar a consulta
      setGeneratingFicha(true);
      try {
        const response = await fetch(`/api/fichas-clinicas/${savedConsultation.id}/generate`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${btoa('admin:admin123')}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          console.log('✅ Ficha Clínica gerada automaticamente');
        } else {
          console.log('ℹ️ Ficha Clínica será gerada quando solicitada');
        }
      } catch (fichaError) {
        console.log('ℹ️ Ficha Clínica será gerada quando solicitada:', fichaError);
      } finally {
        setGeneratingFicha(false);
      }

      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Erro ao salvar consulta:', error);
      setSaveError(error instanceof Error ? error.message : 'Erro ao salvar consulta');
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      <div className="bg-success-50 border border-success-200 text-success-700 px-4 py-3 rounded-lg flex items-center gap-2">
        <CheckCircle className="w-5 h-5 flex-shrink-0" />
        <span>Consulta processada com sucesso!</span>
      </div>

      {/* Save Success Message */}
      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>Consulta salva com sucesso no seu histórico!</span>
        </div>
      )}

      {/* Save Error Message */}
      {saveError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Transcription Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Transcrição Completa
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => handleCopy(result.transcription, 'transcription')}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              {copySuccess === 'transcription' ? (
                <>
                  <CheckCircle className="w-4 h-4 text-success-600" />
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
              onClick={() => handleDownload(
                `TRANSCRIÇÃO DA CONSULTA\nData: ${formatDate()}\n\n${result.transcription}`,
                `transcricao-${Date.now()}.txt`
              )}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              Baixar
            </button>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto custom-scrollbar">
          <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
            {result.transcription}
          </p>
        </div>
      </div>



      {/* Ficha Clínica */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Ficha Clínica Veterinária
          </h3>
        </div>
        {savedConsultationId ? (
          generatingFicha ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <RefreshCw className="w-12 h-12 text-green-500 mx-auto mb-4 animate-spin" />
              <h4 className="text-lg font-medium text-green-900 mb-2">
                Gerando Ficha Clínica...
              </h4>
              <p className="text-green-700">
                A IA está analisando a transcrição e preenchendo automaticamente os campos da Ficha Clínica.
              </p>
            </div>
          ) : (
            <FichaClinica
              consultationId={savedConsultationId}
              onClose={() => {}}
            />
          )
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <FileText className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-blue-900 mb-2">
              Ficha Clínica Disponível
            </h4>
            <p className="text-blue-700 mb-4">
              Salve a consulta primeiro para gerar automaticamente a Ficha Clínica estruturada baseada na transcrição.
            </p>
            <p className="text-sm text-blue-600">
              A Ficha Clínica incluirá dados do animal, anamnese, exame físico, diagnóstico e tratamento extraídos automaticamente pela IA.
            </p>
          </div>
        )}
      </div>

      {/* Document Generation */}
      <DocumentGeneration
        transcription={result.transcription}
        consultationId={savedConsultationId}
      />

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setShowSaveModal(true)}
          className="btn-secondary px-6 py-3 flex items-center gap-2"
        >
          <Save className="w-5 h-5" />
          Salvar Consulta
        </button>
        <button
          onClick={onNewRecording}
          className="btn-primary px-6 py-3"
        >
          Nova Gravação
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h4 className="font-medium text-gray-900 mb-2">Instruções:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• <strong>Salve a consulta</strong> para gerar automaticamente a <strong>Ficha Clínica</strong> estruturada</li>
          <li>• A Ficha Clínica será preenchida automaticamente pela IA baseada na transcrição</li>
          <li>• Edite os campos da Ficha Clínica conforme necessário</li>
          <li>• Gere documentos complementares usando os botões na seção "Documentos Veterinários"</li>
          <li>• Use "Copiar" para colar documentos diretamente no prontuário</li>
          <li>• Use "PDF" para baixar documentos em formato profissional</li>
          <li>• Todos os documentos seguem templates configuráveis pelo administrador</li>
          <li>• Revise sempre as informações antes de usar no prontuário</li>
        </ul>
      </div>

      {/* Save Consultation Modal */}
      <SaveConsultationModal
        isOpen={showSaveModal}
        onClose={() => {
          setShowSaveModal(false);
          setSaveError(null);
        }}
        transcription={result.transcription}
        onSave={handleSaveConsultation}
      />
    </div>
  );
};

export default Results;
