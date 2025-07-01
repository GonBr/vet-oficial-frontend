import { renderHook, act } from '@testing-library/react';
import { useAudioRecorder } from '../useAudioRecorder';

// Mock MediaRecorder
const mockMediaRecorder = {
  start: jest.fn(),
  stop: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  ondataavailable: null,
  onstart: null,
  onstop: null,
  onerror: null,
  state: 'inactive',
};

// Mock getUserMedia
const mockGetUserMedia = jest.fn();

// Mock MediaStream
const mockStream = {
  getTracks: jest.fn(() => [
    { stop: jest.fn() }
  ])
};

beforeAll(() => {
  global.MediaRecorder = jest.fn().mockImplementation(() => mockMediaRecorder);
  global.navigator.mediaDevices = {
    getUserMedia: mockGetUserMedia,
  } as any;
});

beforeEach(() => {
  jest.clearAllMocks();
  mockGetUserMedia.mockResolvedValue(mockStream);
});

describe('useAudioRecorder', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAudioRecorder());

    expect(result.current.isRecording).toBe(false);
    expect(result.current.isPaused).toBe(false);
    expect(result.current.duration).toBe(0);
    expect(result.current.status).toBe('idle');
    expect(result.current.error).toBe(null);
  });

  it('should start recording successfully', async () => {
    const { result } = renderHook(() => useAudioRecorder());

    await act(async () => {
      await result.current.startRecording();
    });

    expect(mockGetUserMedia).toHaveBeenCalledWith({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 44100,
        channelCount: 1,
      },
    });

    expect(result.current.isRecording).toBe(true);
    expect(result.current.status).toBe('recording');
    expect(mockMediaRecorder.start).toHaveBeenCalledWith(1000);
  });

  it('should handle getUserMedia errors', async () => {
    mockGetUserMedia.mockRejectedValue(new Error('Permission denied'));
    
    const { result } = renderHook(() => useAudioRecorder());

    await act(async () => {
      await result.current.startRecording();
    });

    expect(result.current.error).toBe('Erro ao acessar o microfone. Verifique as permissões.');
    expect(result.current.status).toBe('idle');
  });

  it('should pause recording', () => {
    const { result } = renderHook(() => useAudioRecorder());

    // Set up recording state
    act(() => {
      result.current.startRecording();
    });

    act(() => {
      result.current.pauseRecording();
    });

    expect(mockMediaRecorder.pause).toHaveBeenCalled();
  });

  it('should resume recording', () => {
    const { result } = renderHook(() => useAudioRecorder());

    // Set up paused state
    act(() => {
      result.current.startRecording();
      result.current.pauseRecording();
    });

    act(() => {
      result.current.resumeRecording();
    });

    expect(mockMediaRecorder.resume).toHaveBeenCalled();
  });

  it('should stop recording and return blob', async () => {
    const { result } = renderHook(() => useAudioRecorder());

    // Start recording first
    await act(async () => {
      await result.current.startRecording();
    });

    // Mock audio chunks
    const mockBlob = new Blob(['audio data'], { type: 'audio/webm' });
    
    let stopPromise: Promise<Blob>;
    
    act(() => {
      stopPromise = result.current.stopRecording();
      
      // Simulate MediaRecorder stop event
      if (mockMediaRecorder.onstop) {
        mockMediaRecorder.onstop(new Event('stop'));
      }
    });

    const blob = await stopPromise!;
    
    expect(mockMediaRecorder.stop).toHaveBeenCalled();
    expect(blob).toBeInstanceOf(Blob);
  });

  it('should reset recording state', () => {
    const { result } = renderHook(() => useAudioRecorder());

    act(() => {
      result.current.resetRecording();
    });

    expect(result.current.isRecording).toBe(false);
    expect(result.current.isPaused).toBe(false);
    expect(result.current.duration).toBe(0);
    expect(result.current.status).toBe('idle');
    expect(result.current.error).toBe(null);
  });

  it('should format duration correctly', () => {
    const { result } = renderHook(() => useAudioRecorder());

    expect(result.current.formatDuration(0)).toBe('00:00');
    expect(result.current.formatDuration(65)).toBe('01:05');
    expect(result.current.formatDuration(3661)).toBe('61:01');
  });
});
