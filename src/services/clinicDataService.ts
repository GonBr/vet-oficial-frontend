interface ClinicData {
  id: string;
  nome: string;
  razaoSocial?: string;
  telefone?: string;
  endereco?: string;
  email?: string;
}

interface VeterinarianData {
  id: string;
  name: string;
  username: string;
  email?: string;
  crmv?: string;
  assinatura?: string;
  clinicaId?: string;
}

interface UserProfile {
  id: string;
  username: string;
  name: string;
  email?: string;
  clinicaId?: string;
  clinicaNome?: string;
}

class ClinicDataService {
  private baseUrl = '/api';

  /**
   * Busca dados da clínica do usuário atual
   */
  async getCurrentUserClinic(): Promise<ClinicData | null> {
    try {
      // Get stored credentials for authentication
      const storedCredentials = localStorage.getItem('vet-auth');
      if (!storedCredentials) {
        console.warn('Credenciais não encontradas');
        return null;
      }

      const { credentials } = JSON.parse(storedCredentials);

      // Buscar dados do usuário e clínica através do endpoint correto
      const response = await fetch(`${this.baseUrl}/upload/user-info`, {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.warn('Erro ao buscar dados do usuário/clínica:', response.status);
        return null;
      }

      const data = await response.json();

      // Extract clinic data from the response
      if (data.clinica) {
        return {
          id: data.clinica.id,
          nome: data.clinica.nome,
          razaoSocial: data.clinica.razaoSocial,
          telefone: data.clinica.telefone,
          endereco: data.clinica.endereco,
          email: data.clinica.email
        };
      }

      console.warn('Usuário não possui clínica associada');
      return null;
    } catch (error) {
      console.error('Erro ao buscar dados da clínica:', error);
      return null;
    }
  }

  /**
   * Busca perfil do usuário atual
   */
  async getCurrentUserProfile(): Promise<UserProfile | null> {
    try {
      // Get stored credentials for authentication
      const storedCredentials = localStorage.getItem('vet-auth');
      if (!storedCredentials) {
        console.warn('Credenciais não encontradas');
        return null;
      }

      const { credentials } = JSON.parse(storedCredentials);

      const response = await fetch(`${this.baseUrl}/upload/user-info`, {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.warn('Erro ao buscar perfil do usuário:', response.status);
        return null;
      }

      const data = await response.json();

      // Extract user profile from the response
      if (data.user) {
        return {
          id: data.user.id,
          username: data.user.username,
          name: data.user.name,
          email: data.user.email,
          clinicaId: data.clinica?.id,
          clinicaNome: data.clinica?.nome
        };
      }

      return null;
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
      return null;
    }
  }

  /**
   * Busca dados do veterinário atual
   */
  async getCurrentVeterinarianData(): Promise<VeterinarianData | null> {
    try {
      // Get stored credentials for authentication
      const storedCredentials = localStorage.getItem('vet-auth');
      if (!storedCredentials) {
        console.warn('Credenciais não encontradas');
        return null;
      }

      const { credentials } = JSON.parse(storedCredentials);

      // Buscar dados do usuário através do endpoint correto
      const response = await fetch(`${this.baseUrl}/upload/user-info`, {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.warn('Erro ao buscar dados do veterinário:', response.status);
        return null;
      }

      const data = await response.json();

      // Extract veterinarian data from the response
      if (data.user) {
        const user = data.user;
        return {
          id: user.id,
          name: user.fullName || user.name,
          username: user.username,
          email: user.email,
          clinicaId: data.clinica?.id,
          crmv: user.crmv,
          assinatura: user.crmv ? `${user.fullName || user.name} - ${user.crmv}` : undefined
        };
      }

      return null;
    } catch (error) {
      console.error('Erro ao buscar dados do veterinário:', error);
      return null;
    }
  }

  /**
   * Busca dados completos para geração de PDF
   */
  async getDataForPDF(): Promise<{
    clinic: ClinicData | null;
    veterinarian: VeterinarianData | null;
  }> {
    try {
      const [clinic, veterinarian] = await Promise.all([
        this.getCurrentUserClinic(),
        this.getCurrentVeterinarianData()
      ]);

      return {
        clinic,
        veterinarian
      };
    } catch (error) {
      console.error('Erro ao buscar dados para PDF:', error);
      return {
        clinic: null,
        veterinarian: null
      };
    }
  }

  /**
   * Busca dados da clínica por ID (para uso administrativo)
   */
  async getClinicById(clinicId: string): Promise<ClinicData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/clinicas/${clinicId}`, {
        headers: {
          'Authorization': `Basic ${btoa('admin:admin123')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.warn('Erro ao buscar clínica por ID:', response.status);
        return null;
      }

      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Erro ao buscar clínica por ID:', error);
      return null;
    }
  }

  /**
   * Busca lista de todas as clínicas (para uso administrativo)
   */
  async getAllClinics(): Promise<ClinicData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/clinicas`, {
        headers: {
          'Authorization': `Basic ${btoa('admin:admin123')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.warn('Erro ao buscar lista de clínicas:', response.status);
        return [];
      }

      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Erro ao buscar lista de clínicas:', error);
      return [];
    }
  }

  /**
   * Busca dados do usuário por ID (para uso administrativo)
   */
  async getUserById(userId: string): Promise<VeterinarianData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/users/${userId}`, {
        headers: {
          'Authorization': `Basic ${btoa('admin:admin123')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.warn('Erro ao buscar usuário por ID:', response.status);
        return null;
      }

      const data = await response.json();
      if (!data.success) {
        return null;
      }

      const user = data.data;
      return {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        clinicaId: user.clinicaId,
        crmv: user.crmv, // Se existir no futuro
        assinatura: user.assinatura // Se existir no futuro
      };
    } catch (error) {
      console.error('Erro ao buscar usuário por ID:', error);
      return null;
    }
  }

  /**
   * Busca dados específicos para uma consulta (clinic + veterinarian da consulta)
   */
  async getDataForConsultation(consultationId: string): Promise<{
    clinic: ClinicData | null;
    veterinarian: VeterinarianData | null;
  }> {
    try {
      // Buscar dados da consulta para obter o userId
      const consultationResponse = await fetch(`${this.baseUrl}/consultations/${consultationId}`, {
        headers: {
          'Authorization': `Basic ${btoa('admin:admin123')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!consultationResponse.ok) {
        console.warn('Erro ao buscar consulta:', consultationResponse.status);
        return { clinic: null, veterinarian: null };
      }

      const consultationData = await consultationResponse.json();
      if (!consultationData.success) {
        return { clinic: null, veterinarian: null };
      }

      const consultation = consultationData.data;
      const userId = consultation.userId;

      // Buscar dados do veterinário da consulta
      const veterinarian = await this.getUserById(userId);
      
      // Buscar dados da clínica do veterinário
      let clinic: ClinicData | null = null;
      if (veterinarian && veterinarian.clinicaId) {
        clinic = await this.getClinicById(veterinarian.clinicaId);
      }

      return {
        clinic,
        veterinarian
      };
    } catch (error) {
      console.error('Erro ao buscar dados para consulta:', error);
      return { clinic: null, veterinarian: null };
    }
  }
}

export const clinicDataService = new ClinicDataService();
export type { ClinicData, VeterinarianData, UserProfile };
