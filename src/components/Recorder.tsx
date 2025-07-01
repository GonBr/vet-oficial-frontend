import React, { useState } from 'react';
import { 
  Mic, 
  Square, 
  Play, 
  Pause, 
  Upload, 
  RotateCcw,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { apiService } from '../services/api';
import { TranscriptionResult, UploadProgress } from '../types';

interface RecorderProps {
  onResult: (result: TranscriptionResult) => void;
  canTranscribe?: boolean;
  transcriptionLimitMessage?: string;
}

const Recorder: React.FC<RecorderProps> = ({ onResult, canTranscribe = true, transcriptionLimitMessage }) => {
  const {
    isRecording,
    isPaused,
    duration,
    status,
    error: recordingError,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    resetRecording,
    formatDuration,
  } = useAudioRecorder();

  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    isUploading: false,
    progress: 0,
    stage: 'uploading',
  });
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleStartRecording = async () => {
    if (!canTranscribe) {
      setUploadError(transcriptionLimitMessage || 'Limite de transcrições atingido');
      return;
    }
    setUploadError(null);
    await startRecording();
  };

  const handleStopAndUpload = async () => {
    try {
      setUploadError(null);
      setUploadProgress({
        isUploading: true,
        progress: 0,
        stage: 'uploading',
      });

      const audioBlob = await stopRecording();

      const result = await apiService.uploadAudio(
        audioBlob,
        (progress, stage) => {
          setUploadProgress({
            isUploading: true,
            progress,
            stage: stage as any,
          });
        }
      );

      setUploadProgress({
        isUploading: false,
        progress: 100,
        stage: 'complete',
      });

      onResult(result);
    } catch (error) {
      console.error('Erro no upload:', error);
      setUploadError(error instanceof Error ? error.message : 'Erro no upload');
      setUploadProgress({
        isUploading: false,
        progress: 0,
        stage: 'uploading',
      });
    }
  };

  const handleReset = () => {
    resetRecording();
    setUploadError(null);
    setUploadProgress({
      isUploading: false,
      progress: 0,
      stage: 'uploading',
    });
  };

  const getStageText = (stage: string): string => {
    switch (stage) {
      case 'uploading': return 'Enviando áudio...';
      case 'transcribing': return 'Transcrevendo...';
      case 'summarizing': return 'Gerando resumo...';
      case 'complete': return 'Concluído!';
      default: return 'Processando...';
    }
  };

  const isProcessing = uploadProgress.isUploading;
  const hasRecording = status === 'stopped' && duration > 0;
  const canRecord = status === 'idle' && !isProcessing;
  const canStop = isRecording && !isProcessing;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-warm-500 to-sage-500 rounded-lg flex items-center justify-center shadow-warm">
            <Mic className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-xl font-bold text-earth-800">
            Gravação de Consulta
          </h2>
        </div>
        <p className="text-earth-600 text-sm font-medium">
          Inicie a gravação para documentar a consulta veterinária
        </p>

        {/* Timer Display */}
        <div className="my-8">
          <div className={`inline-flex items-center gap-3 px-6 py-4 rounded-xl shadow-soft transition-all duration-500 ${
            isRecording && !isPaused
              ? 'bg-gradient-to-r from-red-50 to-warm-50 text-status-recording recording-pulse border-2 border-status-recording/30'
              : 'bg-gradient-to-r from-sage-50 to-cream-50 text-earth-700 border-2 border-sage-200'
          }`}>
            <Clock className={`w-6 h-6 transition-transform duration-300 ${isRecording && !isPaused ? 'animate-pulse' : ''}`} />
            <span className="text-2xl font-mono font-bold tracking-wider">
              {formatDuration(duration)}
            </span>
            {isRecording && !isPaused && (
              <div className="w-3 h-3 bg-status-recording rounded-full animate-pulse shadow-lg"></div>
            )}
          </div>
        </div>

        {/* Aviso de Limite de Transcrição */}
        {!canTranscribe && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-warm-50 border border-red-200 rounded-lg shadow-soft animate-fade-in-scale">
            <div className="flex items-center justify-center gap-2 text-red-700 mb-2">
              <div className="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm">Limite de transcrições atingido</span>
            </div>
            <p className="text-red-600 font-medium text-center text-sm">
              {transcriptionLimitMessage || 'Você atingiu o limite mensal de transcrições. O limite será resetado no próximo mês.'}
            </p>
          </div>
        )}

        {/* Recording Controls */}
        <div className="flex justify-center gap-4 mb-6">
          {!isRecording && !hasRecording && canRecord && (
            <button
              onClick={handleStartRecording}
              className="btn-primary flex items-center gap-3 px-8 py-4 text-lg font-bold shadow-warm hover:shadow-xl transform hover:scale-110 transition-all duration-300"
              disabled={isProcessing}
            >
              <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                <Mic className="w-4 h-4" />
              </div>
              Iniciar Gravação
            </button>
          )}

          {isRecording && (
            <div className="flex gap-3 animate-fade-in-scale">
              {!isPaused ? (
                <button
                  onClick={pauseRecording}
                  className="btn-secondary flex items-center gap-2 px-6 py-3 text-base font-semibold"
                >
                  <Pause className="w-4 h-4" />
                  Pausar
                </button>
              ) : (
                <button
                  onClick={resumeRecording}
                  className="btn-primary flex items-center gap-2 px-6 py-3 text-base font-semibold"
                >
                  <Play className="w-4 h-4" />
                  Continuar
                </button>
              )}

              <button
                onClick={handleStopAndUpload}
                className="btn-success flex items-center gap-2 px-6 py-3 text-base font-semibold"
                disabled={isProcessing}
              >
                <Square className="w-4 h-4" />
                Finalizar e Enviar
              </button>
            </div>
          )}

          {hasRecording && !isProcessing && (
            <div className="flex gap-3 animate-fade-in-scale">
              <button
                onClick={handleStopAndUpload}
                className="btn-success flex items-center gap-3 px-8 py-4 text-lg font-bold shadow-sage hover:shadow-xl transform hover:scale-110 transition-all duration-300"
              >
                <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                Enviar Gravação
              </button>

              <button
                onClick={handleReset}
                className="btn-secondary flex items-center gap-2 px-6 py-3 text-base font-semibold"
              >
                <RotateCcw className="w-4 h-4" />
                Nova Gravação
              </button>
            </div>
          )}
        </div>

        {/* Recording Status */}
        {isRecording && (
          <div className="flex items-center justify-center gap-3 mb-6 animate-fade-in-scale">
            <div className="w-4 h-4 bg-status-recording rounded-full recording-pulse shadow-lg" />
            <span className="text-base font-bold text-status-recording">
              {isPaused ? '⏸️ Gravação pausada' : '🎙️ Gravando...'}
            </span>
          </div>
        )}

        {/* Upload Progress */}
        {isProcessing && (
          <div className="mb-6 p-4 bg-gradient-to-r from-warm-50 to-sage-50 rounded-xl border border-warm-200 shadow-soft animate-fade-in-scale">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-6 h-6 border-2 border-warm-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-warm-700 font-bold text-base">
                {getStageText(uploadProgress.stage)}
              </span>
            </div>
            <div className="w-full bg-sage-200 rounded-full h-3 shadow-inner">
              <div
                className="bg-gradient-to-r from-warm-500 to-sage-500 h-3 rounded-full transition-all duration-500 shadow-soft"
                style={{ width: `${uploadProgress.progress}%` }}
              />
            </div>
            <div className="text-center text-sm font-bold text-earth-700 mt-2">
              {uploadProgress.progress}% concluído
            </div>
          </div>
        )}

        {/* Error Messages */}
        {(recordingError || uploadError) && (
          <div className="bg-gradient-to-r from-red-50 to-warm-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3 shadow-soft animate-fade-in-scale">
            <div className="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
            <span className="font-medium text-sm">{recordingError || uploadError}</span>
          </div>
        )}

        {/* Instructions */}
        {status === 'idle' && !isProcessing && (
          <div className="text-center mt-6 p-4 bg-gradient-to-r from-sage-50 to-cream-50 rounded-lg border border-sage-200 shadow-soft">
            <div className="text-earth-700 space-y-1">
              <p className="text-base font-semibold">🎯 Pronto para iniciar</p>
              <p className="text-earth-600 text-sm">Clique em "Iniciar Gravação" para começar a documentar a consulta veterinária.</p>
              <p className="text-earth-500 text-xs">🎤 Certifique-se de que o microfone está funcionando corretamente.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recorder;
