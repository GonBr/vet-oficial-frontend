import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, 
  File, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Music,
  FileAudio
} from 'lucide-react';

interface AudioUploadProps {
  onResult: (result: any) => void;
  canTranscribe?: boolean;
  transcriptionLimitMessage?: string;
}

interface UploadState {
  isUploading: boolean;
  progress: number;
  stage: string;
  error: string | null;
}

interface FileInfo {
  file: File;
  name: string;
  size: number;
  duration?: number;
  format: string;
}

const AudioUpload: React.FC<AudioUploadProps> = ({ 
  onResult, 
  canTranscribe = true, 
  transcriptionLimitMessage 
}) => {
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null);
  const [consultationName, setConsultationName] = useState('');
  const [consultationDate, setConsultationDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    stage: '',
    error: null
  });
  const [isDragOver, setIsDragOver] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Supported audio formats
  const supportedFormats = ['mp3', 'wav', 'm4a', 'ogg', 'flac'];
  const maxFileSize = 50 * 1024 * 1024; // 50MB

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize) {
      return `Arquivo muito grande. Tamanho máximo: 50MB (arquivo: ${(file.size / 1024 / 1024).toFixed(1)}MB)`;
    }

    // Check file format
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !supportedFormats.includes(extension)) {
      return `Formato não suportado. Use: ${supportedFormats.join(', ').toUpperCase()}`;
    }

    return null;
  };

  const handleFileSelect = useCallback((file: File) => {
    const error = validateFile(file);
    if (error) {
      setUploadState(prev => ({ ...prev, error }));
      return;
    }

    const fileInfo: FileInfo = {
      file,
      name: file.name,
      size: file.size,
      format: file.name.split('.').pop()?.toLowerCase() || 'unknown'
    };

    setSelectedFile(fileInfo);
    setUploadState(prev => ({ ...prev, error: null }));

    // Auto-generate consultation name if empty
    if (!consultationName) {
      const baseName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
      setConsultationName(baseName);
    }
  }, [consultationName]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !canTranscribe) {
      if (!canTranscribe) {
        setUploadState(prev => ({ 
          ...prev, 
          error: transcriptionLimitMessage || 'Limite de transcrições atingido' 
        }));
      }
      return;
    }

    if (!consultationName.trim()) {
      setUploadState(prev => ({ 
        ...prev, 
        error: 'Nome da consulta é obrigatório' 
      }));
      return;
    }

    try {
      setUploadState({
        isUploading: true,
        progress: 0,
        stage: 'Preparando upload...',
        error: null
      });

      const formData = new FormData();
      formData.append('audioFile', selectedFile.file);
      formData.append('consultationName', consultationName.trim());
      formData.append('consultationDate', consultationDate);

      // Get auth headers
      const storedAuth = localStorage.getItem('vet-auth');
      if (!storedAuth) {
        throw new Error('Usuário não autenticado');
      }

      const { credentials } = JSON.parse(storedAuth);

      setUploadState(prev => ({ 
        ...prev, 
        progress: 20, 
        stage: 'Enviando arquivo...' 
      }));

      const response = await fetch('/api/audio-upload', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
        },
        body: formData,
      });

      setUploadState(prev => ({ 
        ...prev, 
        progress: 60, 
        stage: 'Processando áudio...' 
      }));

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro no upload');
      }

      setUploadState(prev => ({ 
        ...prev, 
        progress: 90, 
        stage: 'Finalizando...' 
      }));

      const result = await response.json();

      setUploadState({
        isUploading: false,
        progress: 100,
        stage: 'Concluído!',
        error: null
      });

      // Call the result callback
      onResult({
        transcription: result.transcription,
        summary: result.summary,
        consultationName: result.consultationName,
        consultationDate: result.consultationDate,
        source: 'upload'
      });

    } catch (error) {
      console.error('Erro no upload:', error);
      setUploadState({
        isUploading: false,
        progress: 0,
        stage: '',
        error: error instanceof Error ? error.message : 'Erro no upload'
      });
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setConsultationName('');
    setConsultationDate(new Date().toISOString().split('T')[0]);
    setUploadState({
      isUploading: false,
      progress: 0,
      stage: '',
      error: null
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <FileAudio className="w-6 h-6 text-blue-600" />
          Enviar Arquivo de Áudio
        </h2>
        <p className="text-gray-600">
          Envie um arquivo de áudio pré-gravado para transcrição e geração de resumo clínico
        </p>
      </div>

      {/* File Drop Zone */}
      <div
        ref={dropZoneRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : selectedFile 
              ? 'border-green-500 bg-green-50' 
              : 'border-gray-300 hover:border-gray-400'
          }
        `}
      >
        {selectedFile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">
                {formatFileSize(selectedFile.size)} • {selectedFile.format.toUpperCase()}
              </p>
            </div>
            <button
              onClick={handleReset}
              className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1 mx-auto"
            >
              <X className="w-4 h-4" />
              Remover arquivo
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <Upload className="w-12 h-12 text-gray-400" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                Arraste um arquivo de áudio aqui
              </p>
              <p className="text-sm text-gray-500 mt-1">
                ou clique para selecionar
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-primary inline-flex items-center gap-2"
            >
              <File className="w-4 h-4" />
              Selecionar Arquivo
            </button>
            <p className="text-xs text-gray-400">
              Formatos suportados: {supportedFormats.join(', ').toUpperCase()} • Máx: 50MB
            </p>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={supportedFormats.map(f => `.${f}`).join(',')}
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Consultation Details */}
      {selectedFile && (
        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Consulta *
            </label>
            <input
              type="text"
              value={consultationName}
              onChange={(e) => setConsultationName(e.target.value)}
              placeholder="Ex: Consulta - Rex - Vacinação"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={uploadState.isUploading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data da Consulta
            </label>
            <input
              type="date"
              value={consultationDate}
              onChange={(e) => setConsultationDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={uploadState.isUploading}
            />
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploadState.isUploading && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-2 text-blue-600">
            <Clock className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">{uploadState.stage}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadState.progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 text-center">
            {uploadState.progress}% concluído
          </p>
        </div>
      )}

      {/* Error Message */}
      {uploadState.error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Erro</span>
          </div>
          <p className="text-sm text-red-600 mt-1">{uploadState.error}</p>
        </div>
      )}

      {/* Action Buttons */}
      {selectedFile && !uploadState.isUploading && (
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleUpload}
            disabled={!canTranscribe || !consultationName.trim()}
            className="btn-success flex items-center gap-2 px-6 py-3 flex-1"
          >
            <Upload className="w-5 h-5" />
            Processar Arquivo
          </button>
          <button
            onClick={handleReset}
            className="btn-secondary flex items-center gap-2 px-4 py-3"
          >
            <X className="w-5 h-5" />
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
};

export default AudioUpload;
