import { TranscriptionResult, ApiError } from '../types';

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const storedAuth = localStorage.getItem('vet-auth');
    if (!storedAuth) {
      throw new Error('Usuário não autenticado');
    }

    const { credentials } = JSON.parse(storedAuth);
    return {
      'Authorization': `Basic ${credentials}`,
    };
  }

  async uploadAudio(
    audioBlob: Blob,
    onProgress?: (progress: number, stage: string) => void
  ): Promise<TranscriptionResult> {
    try {
      onProgress?.(10, 'Preparando upload...');

      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      onProgress?.(20, 'Enviando áudio...');

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: formData,
      });

      onProgress?.(50, 'Processando áudio...');

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.error || 'Erro no upload');
      }

      onProgress?.(80, 'Finalizando...');

      const result: TranscriptionResult = await response.json();
      
      onProgress?.(100, 'Concluído!');

      return result;
    } catch (error) {
      console.error('Erro no upload:', error);
      throw error;
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch('/api/health');
      return response.ok;
    } catch (error) {
      console.error('Erro na verificação de saúde:', error);
      return false;
    }
  }

  async checkAuthHealth(): Promise<boolean> {
    try {
      const response = await fetch('/api/upload/health', {
        headers: this.getAuthHeaders(),
      });
      return response.ok;
    } catch (error) {
      console.error('Erro na verificação de autenticação:', error);
      return false;
    }
  }

  async get<T>(url: string): Promise<T> {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro na requisição' }));
        throw new Error(errorData.error || errorData.message || 'Erro na requisição');
      }

      return await response.json();
    } catch (error) {
      console.error(`Erro na requisição GET ${url}:`, error);
      throw error;
    }
  }

  async post<T>(url: string, data: any): Promise<T> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro na requisição' }));
        throw new Error(errorData.error || errorData.message || 'Erro na requisição');
      }

      return await response.json();
    } catch (error) {
      console.error(`Erro na requisição POST ${url}:`, error);
      throw error;
    }
  }

  async put<T>(url: string, data: any): Promise<T> {
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro na requisição' }));
        throw new Error(errorData.error || errorData.message || 'Erro na requisição');
      }

      return await response.json();
    } catch (error) {
      console.error(`Erro na requisição PUT ${url}:`, error);
      throw error;
    }
  }

  async delete<T>(url: string): Promise<T> {
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro na requisição' }));
        throw new Error(errorData.error || errorData.message || 'Erro na requisição');
      }

      return await response.json();
    } catch (error) {
      console.error(`Erro na requisição DELETE ${url}:`, error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
