import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, CheckCircle, Calendar, FileText } from 'lucide-react';
import { SaveConsultationModalProps, CreateConsultationData } from '../types';
import { consultationsApiService } from '../services/consultationsApi';

const SaveConsultationModal: React.FC<SaveConsultationModalProps> = ({
  isOpen,
  onClose,
  transcription,
  onSave
}) => {
  const [formData, setFormData] = useState<CreateConsultationData>({
    consultationName: '',
    consultationDate: new Date().toISOString().split('T')[0],
    transcription
  });
  const [isLoading, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameExists, setNameExists] = useState(false);
  const [checkingName, setCheckingName] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        consultationName: '',
        consultationDate: new Date().toISOString().split('T')[0],
        transcription
      });
      setError(null);
      setNameExists(false);
    }
  }, [isOpen, transcription]);

  // Check if consultation name exists
  useEffect(() => {
    const checkName = async () => {
      if (!formData.consultationName.trim()) {
        setNameExists(false);
        return;
      }

      setCheckingName(true);
      try {
        const exists = await consultationsApiService.checkConsultationNameExists(formData.consultationName);
        setNameExists(exists);
      } catch (error) {
        console.error('Erro ao verificar nome:', error);
      } finally {
        setCheckingName(false);
      }
    };

    const timeoutId = setTimeout(checkName, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.consultationName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.consultationName.trim()) {
      setError('Nome da consulta é obrigatório');
      return;
    }

    if (!formData.consultationDate) {
      setError('Data da consulta é obrigatória');
      return;
    }

    if (nameExists) {
      setError('Já existe uma consulta com este nome. Escolha um nome diferente.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar consulta:', error);
      setError(error instanceof Error ? error.message : 'Erro ao salvar consulta');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof CreateConsultationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Save className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Salvar Consulta</h2>
              <p className="text-sm text-gray-600">Salve esta consulta para acessar posteriormente</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nome da Consulta */}
          <div>
            <label htmlFor="consultationName" className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Consulta *
            </label>
            <div className="relative">
              <input
                type="text"
                id="consultationName"
                value={formData.consultationName}
                onChange={(e) => handleInputChange('consultationName', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                  nameExists ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Ex: Consulta Golden Retriever - Vômito"
                disabled={isLoading}
                required
              />
              {checkingName && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            {nameExists && (
              <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Já existe uma consulta com este nome</span>
              </div>
            )}
            {!nameExists && formData.consultationName.trim() && !checkingName && (
              <div className="mt-2 flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>Nome disponível</span>
              </div>
            )}
          </div>

          {/* Data da Consulta */}
          <div>
            <label htmlFor="consultationDate" className="block text-sm font-medium text-gray-700 mb-2">
              Data da Consulta *
            </label>
            <div className="relative">
              <input
                type="date"
                id="consultationDate"
                value={formData.consultationDate}
                onChange={(e) => handleInputChange('consultationDate', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                disabled={isLoading}
                required
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Preview da Transcrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preview da Transcrição
            </label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-32 overflow-y-auto">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {transcription.length > 200 
                  ? `${transcription.substring(0, 200)}...` 
                  : transcription
                }
              </p>
            </div>
          </div>

          {/* Preview da Transcrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preview da Transcrição
            </label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-32 overflow-y-auto">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {transcription.length > 200
                  ? `${transcription.substring(0, 200)}...`
                  : transcription
                }
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary flex items-center justify-center gap-2 py-3"
              disabled={isLoading || nameExists || !formData.consultationName.trim()}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar Consulta
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaveConsultationModal;
