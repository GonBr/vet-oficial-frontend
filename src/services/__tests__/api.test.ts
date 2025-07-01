import { apiService } from '../api';

// Mock fetch
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ApiService', () => {
  describe('uploadAudio', () => {
    it('should upload audio successfully', async () => {
      const mockResponse = {
        transcription: 'Test transcription',
        summary: 'Test summary',
        success: true,
      };

      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify({ credentials: 'dGVzdDp0ZXN0' })
      );

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const audioBlob = new Blob(['audio data'], { type: 'audio/webm' });
      const progressCallback = jest.fn();

      const result = await apiService.uploadAudio(audioBlob, progressCallback);

      expect(result).toEqual(mockResponse);
      expect(progressCallback).toHaveBeenCalledWith(10, 'Preparando upload...');
      expect(progressCallback).toHaveBeenCalledWith(100, 'Concluído!');
      
      expect(mockFetch).toHaveBeenCalledWith('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': 'Basic dGVzdDp0ZXN0',
        },
        body: expect.any(FormData),
      });
    });

    it('should handle upload errors', async () => {
      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify({ credentials: 'dGVzdDp0ZXN0' })
      );

      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Upload failed' }),
      } as Response);

      const audioBlob = new Blob(['audio data'], { type: 'audio/webm' });

      await expect(apiService.uploadAudio(audioBlob))
        .rejects.toThrow('Upload failed');
    });

    it('should handle missing authentication', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const audioBlob = new Blob(['audio data'], { type: 'audio/webm' });

      await expect(apiService.uploadAudio(audioBlob))
        .rejects.toThrow('Usuário não autenticado');
    });

    it('should handle network errors', async () => {
      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify({ credentials: 'dGVzdDp0ZXN0' })
      );

      mockFetch.mockRejectedValue(new Error('Network error'));

      const audioBlob = new Blob(['audio data'], { type: 'audio/webm' });

      await expect(apiService.uploadAudio(audioBlob))
        .rejects.toThrow('Network error');
    });
  });

  describe('checkHealth', () => {
    it('should return true for healthy service', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
      } as Response);

      const result = await apiService.checkHealth();

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith('/api/health');
    });

    it('should return false for unhealthy service', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
      } as Response);

      const result = await apiService.checkHealth();

      expect(result).toBe(false);
    });

    it('should return false on network error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await apiService.checkHealth();

      expect(result).toBe(false);
    });
  });

  describe('checkAuthHealth', () => {
    it('should return true for valid authentication', async () => {
      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify({ credentials: 'dGVzdDp0ZXN0' })
      );

      mockFetch.mockResolvedValue({
        ok: true,
      } as Response);

      const result = await apiService.checkAuthHealth();

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith('/api/upload/health', {
        headers: {
          'Authorization': 'Basic dGVzdDp0ZXN0',
        },
      });
    });

    it('should return false for invalid authentication', async () => {
      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify({ credentials: 'aW52YWxpZDppbnZhbGlk' })
      );

      mockFetch.mockResolvedValue({
        ok: false,
      } as Response);

      const result = await apiService.checkAuthHealth();

      expect(result).toBe(false);
    });

    it('should handle missing credentials', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = await apiService.checkAuthHealth();

      expect(result).toBe(false);
    });
  });
});
