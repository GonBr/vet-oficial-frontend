import { 
  SavedConsultation, 
  CreateConsultationData, 
  ConsultationFilters, 
  PaginatedConsultations,
  ApiError 
} from '../types';

class ConsultationsApiService {
  private getAuthHeaders(): HeadersInit {
    const storedAuth = localStorage.getItem('vet-auth');
    if (!storedAuth) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const authData = JSON.parse(storedAuth);

      // Primeiro tenta usar as credenciais já codificadas
      if (authData.credentials) {
        return {
          'Authorization': `Basic ${authData.credentials}`,
          'Content-Type': 'application/json',
        };
      }

      // Se não tiver, tenta construir com username/password
      const username = authData.username;
      const password = authData.password;

      if (!username || !password) {
        console.error('Credenciais incompletas:', authData);
        throw new Error('Credenciais incompletas');
      }

      const credentials = btoa(`${username}:${password}`);

      return {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      };
    } catch (error) {
      console.error('Erro ao processar credenciais:', error);
      throw new Error('Erro ao processar credenciais');
    }
  }

  async saveConsultation(consultationData: CreateConsultationData): Promise<SavedConsultation> {
    try {
      const response = await fetch('/api/consultations', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(consultationData),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar consulta');
      }

      const result = await response.json();
      return result.consultation;
    } catch (error) {
      console.error('Erro ao salvar consulta:', error);
      throw error;
    }
  }

  async getUserConsultations(filters: ConsultationFilters = {}): Promise<PaginatedConsultations> {
    try {
      const queryParams = new URLSearchParams();

      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.searchTerm) queryParams.append('searchTerm', filters.searchTerm);
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());

      const url = `/api/consultations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({ error: 'Erro na requisição' }));
        throw new Error(errorData.error || 'Erro ao buscar consultas');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar consultas:', error);
      throw error;
    }
  }

  async getConsultationById(consultationId: string): Promise<SavedConsultation> {
    try {
      const response = await fetch(`/api/consultations/${consultationId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar consulta');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar consulta:', error);
      throw error;
    }
  }

  async deleteConsultation(consultationId: string): Promise<void> {
    try {
      const response = await fetch(`/api/consultations/${consultationId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.error || 'Erro ao excluir consulta');
      }
    } catch (error) {
      console.error('Erro ao excluir consulta:', error);
      throw error;
    }
  }

  async checkConsultationNameExists(consultationName: string, excludeId?: string): Promise<boolean> {
    try {
      const response = await fetch('/api/consultations/check-name', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ consultationName, excludeId }),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.error || 'Erro ao verificar nome da consulta');
      }

      const result = await response.json();
      return result.exists;
    } catch (error) {
      console.error('Erro ao verificar nome da consulta:', error);
      throw error;
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch('/api/consultations/health');
      return response.ok;
    } catch (error) {
      console.error('Erro na verificação de saúde das consultas:', error);
      return false;
    }
  }

  // Utility methods
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  formatDateTime(date: string): string {
    return new Date(date).toLocaleString('pt-BR');
  }

  downloadConsultation(consultation: SavedConsultation, type: 'transcription' | 'summary' | 'complete'): void {
    let content = '';
    let filename = '';

    const formattedDate = this.formatDate(consultation.consultationDate);
    const formattedCreatedAt = this.formatDateTime(consultation.createdAt);

    switch (type) {
      case 'transcription':
        content = `TRANSCRIÇÃO DA CONSULTA\n` +
                 `Nome: ${consultation.consultationName}\n` +
                 `Data da Consulta: ${formattedDate}\n` +
                 `Criado em: ${formattedCreatedAt}\n\n` +
                 `${consultation.transcription}`;
        filename = `transcricao-${consultation.consultationName.replace(/[^a-zA-Z0-9]/g, '_')}-${Date.now()}.txt`;
        break;

      case 'summary':
        content = `RESUMO CLÍNICO\n` +
                 `Nome: ${consultation.consultationName}\n` +
                 `Data da Consulta: ${formattedDate}\n` +
                 `Criado em: ${formattedCreatedAt}\n\n` +
                 `${consultation.summary}`;
        filename = `resumo-${consultation.consultationName.replace(/[^a-zA-Z0-9]/g, '_')}-${Date.now()}.txt`;
        break;

      case 'complete':
        content = `CONSULTA VETERINÁRIA COMPLETA\n` +
                 `Nome: ${consultation.consultationName}\n` +
                 `Data da Consulta: ${formattedDate}\n` +
                 `Criado em: ${formattedCreatedAt}\n\n` +
                 `=== TRANSCRIÇÃO COMPLETA ===\n\n` +
                 `${consultation.transcription}\n\n` +
                 `=== RESUMO CLÍNICO ===\n\n` +
                 `${consultation.summary}`;
        filename = `consulta-completa-${consultation.consultationName.replace(/[^a-zA-Z0-9]/g, '_')}-${Date.now()}.txt`;
        break;
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  copyToClipboard(text: string): Promise<void> {
    return navigator.clipboard.writeText(text);
  }
}

export const consultationsApiService = new ConsultationsApiService();
