import { apiService } from './api';

export interface DocumentType {
  type: string;
  name: string;
  description: string;
  icon: string;
}

export interface GenerateDocumentRequest {
  consultation_id: string;
  document_type: string;
  transcription: string;
}

export interface GeneratedDocument {
  id: string;
  consultation_id: string;
  document_type: string;
  title: string;
  content: string;
  generated_at: string;
}

export interface DocumentsApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
}

class DocumentsApiService {
  private baseUrl = '/api/documents';

  /**
   * Buscar tipos de documentos disponíveis
   */
  async getDocumentTypes(): Promise<DocumentType[]> {
    try {
      const response = await apiService.get<{ success: boolean; types: DocumentType[] }>(
        `${this.baseUrl}/types/available`
      );
      
      if (response.success) {
        return response.types;
      }
      
      throw new Error(response.message || 'Erro ao buscar tipos de documentos');
    } catch (error: any) {
      console.error('Erro ao buscar tipos de documentos:', error);
      throw error;
    }
  }

  /**
   * Gerar documento baseado em template e transcrição
   */
  async generateDocument(request: GenerateDocumentRequest): Promise<GeneratedDocument> {
    try {
      const response = await apiService.post<{ 
        success: boolean; 
        document: GeneratedDocument;
        message?: string;
        code?: string;
      }>(`${this.baseUrl}/generate`, request);
      
      if (response.success) {
        return response.document;
      }
      
      const error: any = new Error(response.message || 'Erro ao gerar documento');
      error.response = { data: { code: response.code, message: response.message } };
      throw error;
    } catch (error: any) {
      console.error('Erro ao gerar documento:', error);
      
      // Preservar informações de erro da API
      if (error.response?.data) {
        const apiError: any = new Error(error.response.data.message || 'Erro ao gerar documento');
        apiError.response = error.response;
        throw apiError;
      }
      
      throw error;
    }
  }

  /**
   * Buscar todos os documentos de uma consulta
   */
  async getConsultationDocuments(consultationId: string): Promise<GeneratedDocument[]> {
    try {
      const response = await apiService.get<{ 
        success: boolean; 
        documents: GeneratedDocument[];
        message?: string;
      }>(`${this.baseUrl}/consultation/${consultationId}`);
      
      if (response.success) {
        return response.documents;
      }
      
      throw new Error(response.message || 'Erro ao buscar documentos da consulta');
    } catch (error: any) {
      console.error('Erro ao buscar documentos da consulta:', error);
      throw error;
    }
  }

  /**
   * Buscar documento específico
   */
  async getConsultationDocument(
    consultationId: string, 
    documentType: string
  ): Promise<GeneratedDocument | null> {
    try {
      const response = await apiService.get<{ 
        success: boolean; 
        document: GeneratedDocument;
        message?: string;
      }>(`${this.baseUrl}/${consultationId}/${documentType}`);
      
      if (response.success) {
        return response.document;
      }
      
      return null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      
      console.error('Erro ao buscar documento específico:', error);
      throw error;
    }
  }

  /**
   * Verificar se documento já foi gerado
   */
  async hasDocument(consultationId: string, documentType: string): Promise<boolean> {
    try {
      const document = await this.getConsultationDocument(consultationId, documentType);
      return document !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Gerar PDF do documento (placeholder para implementação futura com jsPDF)
   */
  async generatePDF(doc: GeneratedDocument): Promise<void> {
    // TODO: Implementar geração de PDF com jsPDF
    // Por enquanto, faz download como texto
    const blob = new Blob([doc.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `${doc.title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.txt`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const documentsApiService = new DocumentsApiService();
