import React, { useState, useEffect } from 'react';
import {
  Search,
  Calendar,
  FileText,
  Eye,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Clock,
  AlertCircle,
  RefreshCw,
  X,
  Copy,
  CheckCircle,
  Stethoscope,
  FolderOpen
} from 'lucide-react';
import { SavedConsultation, ConsultationFilters, PaginatedConsultations } from '../types';
import { consultationsApiService } from '../services/consultationsApi';
import FichaClinica from './FichaClinica';
import ConsultationDocuments from './ConsultationDocuments';
// import ConsultationDetailModal from './ConsultationDetailModal';

// Functional consultation detail modal
const ConsultationDetailModal: React.FC<any> = ({ isOpen, onClose, consultation, onDelete }) => {
  const [activeTab, setActiveTab] = useState<'ficha-clinica' | 'outros-documentos' | 'transcription'>('ficha-clinica');
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (error) {
      console.error('Erro ao copiar texto:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (!isOpen || !consultation) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="min-h-screen flex items-start justify-center p-4 pt-8">
        <div className="bg-gradient-to-br from-cream-50/95 to-warm-50/90 rounded-xl shadow-2xl max-w-4xl w-full border-2 border-sage-200/50 backdrop-blur-sm overflow-hidden flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b-2 border-sage-200/50 bg-gradient-to-r from-sage-50 to-cream-50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-warm-500 rounded-xl flex items-center justify-center shadow-soft">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-earth-800">{consultation.consultationName}</h2>
                <div className="flex items-center gap-4 text-sm text-earth-600 mt-1">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-sage-600" />
                    <span className="font-medium">Consulta: {formatDate(consultation.consultationDate)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-sage-600" />
                    <span className="font-medium">Salva em: {formatDateTime(consultation.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-earth-400 hover:text-earth-600 transition-colors p-2 hover:bg-sage-100 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b-2 border-sage-200/50 bg-gradient-to-r from-cream-50/50 to-warm-50/30">
            <button
              onClick={() => setActiveTab('ficha-clinica')}
              className={`flex-1 px-6 py-4 text-sm font-bold transition-all duration-200 ${
                activeTab === 'ficha-clinica'
                  ? 'text-primary-700 border-b-3 border-primary-600 bg-gradient-to-t from-primary-50 to-transparent'
                  : 'text-earth-600 hover:text-earth-800 hover:bg-sage-50/50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Stethoscope className="w-4 h-4" />
                Ficha Clínica
              </div>
            </button>
            <button
              onClick={() => setActiveTab('outros-documentos')}
              className={`flex-1 px-6 py-4 text-sm font-bold transition-all duration-200 ${
                activeTab === 'outros-documentos'
                  ? 'text-primary-700 border-b-3 border-primary-600 bg-gradient-to-t from-primary-50 to-transparent'
                  : 'text-earth-600 hover:text-earth-800 hover:bg-sage-50/50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <FolderOpen className="w-4 h-4" />
                Outros Documentos
              </div>
            </button>
            <button
              onClick={() => setActiveTab('transcription')}
              className={`flex-1 px-6 py-4 text-sm font-bold transition-all duration-200 ${
                activeTab === 'transcription'
                  ? 'text-primary-700 border-b-3 border-primary-600 bg-gradient-to-t from-primary-50 to-transparent'
                  : 'text-earth-600 hover:text-earth-800 hover:bg-sage-50/50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" />
                Transcrição Completa
              </div>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto bg-gradient-to-b from-cream-50/30 to-warm-50/20">
            {activeTab === 'ficha-clinica' ? (
              <FichaClinica
                consultationId={consultation.id}
                onClose={() => {}}
              />
            ) : activeTab === 'outros-documentos' ? (
              <ConsultationDocuments consultation={consultation} />
            ) : (
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-earth-800">Transcrição Completa</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(consultation.transcription, 'transcription')}
                      className="btn-secondary flex items-center gap-2 text-sm"
                    >
                      {copySuccess === 'transcription' ? (
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
                      onClick={() => consultationsApiService.downloadConsultation(consultation, 'transcription')}
                      className="btn-secondary flex items-center gap-2 text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Baixar
                    </button>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-sage-50 to-cream-50 border-2 border-sage-200/50 rounded-xl p-6 shadow-soft">
                  <p className="text-earth-700 whitespace-pre-wrap leading-relaxed text-sm">
                    {consultation.transcription}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t-2 border-sage-200/50 bg-gradient-to-r from-cream-50/80 to-warm-50/60">
            <div className="flex items-center gap-3">
              <button
                onClick={() => consultationsApiService.downloadConsultation(consultation, 'complete')}
                className="btn-secondary flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Baixar Consulta
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (window.confirm('Tem certeza que deseja excluir esta consulta? Esta ação não pode ser desfeita.')) {
                    onDelete(consultation.id);
                    onClose();
                  }
                }}
                className="px-6 py-3 text-status-danger border-2 border-status-danger/30 rounded-xl hover:bg-red-50 transition-all duration-200 flex items-center gap-2 font-medium shadow-soft hover:shadow-lg"
              >
                <Trash2 className="w-4 h-4" />
                Excluir
              </button>
              <button
                onClick={onClose}
                className="btn-primary"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Cache for consultations - optimized duration for performance
const CONSULTATIONS_CACHE_KEY = 'vet-consultations-cache';
const CONSULTATIONS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes - optimal performance

const ConsultationsHistory: React.FC = () => {
  const [consultations, setConsultations] = useState<PaginatedConsultations>(() => {
    // Try to load from cache immediately
    try {
      const cached = localStorage.getItem(CONSULTATIONS_CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CONSULTATIONS_CACHE_DURATION) {
          return data;
        }
      }
    } catch (error) {
      console.warn('Error loading cached consultations:', error);
    }
    return {
      consultations: [],
      total: 0,
      page: 1,
      totalPages: 0,
      hasNext: false,
      hasPrev: false
    };
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedConsultation, setSelectedConsultation] = useState<SavedConsultation | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<ConsultationFilters>({
    searchTerm: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 10
  });

  const loadConsultations = async (newFilters?: ConsultationFilters, showLoading = false, forceRefresh = false) => {
    try {
      const filtersToUse = newFilters || filters;

      // Check cache first unless force refresh
      if (!forceRefresh) {
        const cached = localStorage.getItem(CONSULTATIONS_CACHE_KEY);
        if (cached) {
          try {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CONSULTATIONS_CACHE_DURATION) {
              setConsultations(data);
              return;
            }
          } catch (e) {
            // Invalid cache, continue to fetch
            localStorage.removeItem(CONSULTATIONS_CACHE_KEY);
          }
        }
      }

      // Only show loading when explicitly requested
      if (showLoading) {
        setLoading(true);
      }
      setError(null);

      const result = await consultationsApiService.getUserConsultations(filtersToUse);

      // Always cache the result for faster subsequent loads
      localStorage.setItem(CONSULTATIONS_CACHE_KEY, JSON.stringify({
        data: result,
        timestamp: Date.now()
      }));

      setConsultations(result);
    } catch (error) {
      console.error('Erro ao carregar consultas:', error);
      setError(error instanceof Error ? error.message : 'Erro ao carregar consultas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only load if we don't have cached data
    if (consultations.consultations.length === 0) {
      loadConsultations(undefined, false);
    }
  }, []);

  const handleFilterChange = (field: keyof ConsultationFilters, value: string | number) => {
    const newFilters = { ...filters, [field]: value, page: 1 };
    setFilters(newFilters);
    loadConsultations(newFilters);
  };

  const handlePageChange = (newPage: number) => {
    const newFilters = { ...filters, page: newPage };
    setFilters(newFilters);
    loadConsultations(newFilters);
  };

  const handleViewConsultation = (consultation: SavedConsultation) => {
    // Open modal instantly with existing data - no API call needed
    setSelectedConsultation(consultation);
    setShowDetailModal(true);
  };

  const handleDeleteConsultation = async (consultationId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta consulta? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await consultationsApiService.deleteConsultation(consultationId);
      loadConsultations(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao excluir consulta:', error);
      setError(error instanceof Error ? error.message : 'Erro ao excluir consulta');
    }
  };

  const clearFilters = () => {
    const clearedFilters = {
      searchTerm: '',
      startDate: '',
      endDate: '',
      page: 1,
      limit: 10
    };
    setFilters(clearedFilters);
    loadConsultations(clearedFilters);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  if (loading && consultations.consultations.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando consultas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Minhas Consultas</h1>
          <p className="text-gray-600">Histórico completo das suas consultas salvas</p>
        </div>
        <button
          onClick={() => loadConsultations(undefined, true, true)} // Force refresh with loading
          className="btn-secondary flex items-center gap-2"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-br from-cream-50/80 to-warm-50/60 rounded-xl border-2 border-sage-200/50 p-6 shadow-soft backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-earth-800">Filtros</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-primary-600 hover:text-primary-700 flex items-center gap-2 font-medium transition-colors"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
          </button>
        </div>

        {/* Search Bar - Always visible */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome da consulta..."
            value={filters.searchTerm || ''}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Inicial
              </label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Final
              </label>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results Info */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          {consultations.total > 0 
            ? `Mostrando ${((consultations.page - 1) * (filters.limit || 10)) + 1}-${Math.min(consultations.page * (filters.limit || 10), consultations.total)} de ${consultations.total} consultas`
            : 'Nenhuma consulta encontrada'
          }
        </span>
        {consultations.total > 0 && (
          <span>Página {consultations.page} de {consultations.totalPages}</span>
        )}
      </div>

      {/* Consultations List */}
      {consultations.consultations.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-cream-50/90 to-warm-50/70 rounded-xl border-2 border-sage-200/50 shadow-soft">
          <FileText className="w-16 h-16 text-sage-400 mx-auto mb-6" />
          <h3 className="text-xl font-bold text-earth-800 mb-3">Nenhuma consulta encontrada</h3>
          <p className="text-earth-600 max-w-md mx-auto leading-relaxed">
            {filters.searchTerm || filters.startDate || filters.endDate
              ? 'Tente ajustar os filtros para encontrar suas consultas.'
              : 'Você ainda não salvou nenhuma consulta. Faça uma transcrição e salve-a para começar seu histórico.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {consultations.consultations.map((consultation) => (
            <div
              key={consultation.id}
              className="bg-gradient-to-br from-cream-50/90 to-warm-50/70 rounded-xl border-2 border-sage-200/50 p-6 shadow-soft backdrop-blur-sm hover:shadow-warm hover:scale-102 transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-earth-800 mb-3">
                    {consultation.consultationName}
                  </h3>

                  <div className="flex items-center gap-4 text-sm text-earth-600 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-sage-600" />
                      <span className="font-medium">Consulta: {formatDate(consultation.consultationDate)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-sage-600" />
                      <span className="font-medium">Salva em: {formatDateTime(consultation.createdAt)}</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-sage-50 to-cream-50 rounded-lg p-4 border border-sage-200/50 shadow-soft">
                    <p className="text-sm text-earth-700 leading-relaxed">
                      <strong className="text-earth-800">Resumo:</strong> {truncateText(consultation.summary, 150)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 ml-6">
                  <button
                    onClick={() => handleViewConsultation(consultation)}
                    className="p-3 text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200 hover:scale-110 shadow-soft"
                    title="Ver detalhes"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => consultationsApiService.downloadConsultation(consultation, 'complete')}
                    className="p-3 text-status-success hover:bg-green-50 rounded-xl transition-all duration-200 hover:scale-110 shadow-soft"
                    title="Baixar consulta"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteConsultation(consultation.id)}
                    className="p-3 text-status-danger hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110 shadow-soft"
                    title="Excluir consulta"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {consultations.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handlePageChange(consultations.page - 1)}
            disabled={!consultations.hasPrev}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: consultations.totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  page === consultations.page
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => handlePageChange(consultations.page + 1)}
            disabled={!consultations.hasNext}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {selectedConsultation && (
        <ConsultationDetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedConsultation(null);
          }}
          consultation={selectedConsultation}
          onDelete={handleDeleteConsultation}
        />
      )}
    </div>
  );
};

export default ConsultationsHistory;
