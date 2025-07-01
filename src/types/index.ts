export interface User {
  username: string;
  isAuthenticated: boolean;
}

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  mediaRecorder: MediaRecorder | null;
  audioChunks: Blob[];
}

export interface TranscriptionResult {
  transcription: string;
  summary: string;
  success: boolean;
}

export interface ApiError {
  error: string;
  success: false;
}

export interface UploadProgress {
  isUploading: boolean;
  progress: number;
  stage: 'uploading' | 'transcribing' | 'summarizing' | 'complete';
}

export type RecordingStatus = 'idle' | 'recording' | 'paused' | 'stopped' | 'processing';

export interface AudioConstraints {
  audio: {
    echoCancellation: boolean;
    noiseSuppression: boolean;
    autoGainControl: boolean;
    sampleRate: number;
    channelCount: number;
  };
}

export interface SavedConsultation {
  id: string;
  userId: string;
  consultationName: string;
  consultationDate: string;
  transcription: string;
  summary: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateConsultationData {
  consultationName: string;
  consultationDate: string;
  transcription: string;
}

export interface ConsultationFilters {
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedConsultations {
  consultations: SavedConsultation[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SaveConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  transcription: string;
  onSave: (data: CreateConsultationData) => Promise<void>;
}
