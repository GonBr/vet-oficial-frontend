import { useState, useRef, useCallback, useEffect } from 'react';
import { RecordingState, RecordingStatus, AudioConstraints } from '../types';

export const useAudioRecorder = () => {
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    mediaRecorder: null,
    audioChunks: [],
  });

  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const audioConstraints: AudioConstraints = {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      sampleRate: 44100,
      channelCount: 1,
    },
  };

  const startTimer = useCallback(() => {
    intervalRef.current = setInterval(() => {
      setRecordingState(prev => ({
        ...prev,
        duration: prev.duration + 1,
      }));
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setStatus('recording');

      const stream = await navigator.mediaDevices.getUserMedia(audioConstraints);
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstart = () => {
        console.log('Gravação iniciada');
        startTimer();
      };

      mediaRecorder.onstop = () => {
        console.log('Gravação parada');
        stopTimer();
        setStatus('stopped');
      };

      mediaRecorder.onerror = (event) => {
        console.error('Erro na gravação:', event);
        setError('Erro durante a gravação');
        setStatus('idle');
        stopTimer();
      };

      setRecordingState({
        isRecording: true,
        isPaused: false,
        duration: 0,
        mediaRecorder,
        audioChunks,
      });

      mediaRecorder.start(1000); // Collect data every second
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      setError('Erro ao acessar o microfone. Verifique as permissões.');
      setStatus('idle');
    }
  }, [audioConstraints, startTimer, stopTimer]);

  const pauseRecording = useCallback(() => {
    if (recordingState.mediaRecorder && recordingState.isRecording) {
      recordingState.mediaRecorder.pause();
      setRecordingState(prev => ({ ...prev, isPaused: true }));
      stopTimer();
    }
  }, [recordingState.mediaRecorder, recordingState.isRecording, stopTimer]);

  const resumeRecording = useCallback(() => {
    if (recordingState.mediaRecorder && recordingState.isPaused) {
      recordingState.mediaRecorder.resume();
      setRecordingState(prev => ({ ...prev, isPaused: false }));
      startTimer();
    }
  }, [recordingState.mediaRecorder, recordingState.isPaused, startTimer]);

  const stopRecording = useCallback((): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!recordingState.mediaRecorder) {
        reject(new Error('Nenhuma gravação ativa'));
        return;
      }

      const mediaRecorder = recordingState.mediaRecorder;

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(recordingState.audioChunks, { 
          type: 'audio/webm' 
        });

        // Clean up
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        setRecordingState({
          isRecording: false,
          isPaused: false,
          duration: 0,
          mediaRecorder: null,
          audioChunks: [],
        });

        resolve(audioBlob);
      };

      mediaRecorder.stop();
    });
  }, [recordingState.mediaRecorder, recordingState.audioChunks]);

  const resetRecording = useCallback(() => {
    if (recordingState.mediaRecorder) {
      recordingState.mediaRecorder.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    stopTimer();
    setRecordingState({
      isRecording: false,
      isPaused: false,
      duration: 0,
      mediaRecorder: null,
      audioChunks: [],
    });
    setStatus('idle');
    setError(null);
  }, [recordingState.mediaRecorder, stopTimer]);

  const formatDuration = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTimer();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [stopTimer]);

  return {
    ...recordingState,
    status,
    error,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    resetRecording,
    formatDuration,
  };
};
