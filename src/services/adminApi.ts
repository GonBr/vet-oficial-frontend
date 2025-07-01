export interface VetUser {
  id: string;
  username: string;
  name: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  transcriptionCount: number;
  clinicaId?: string;
  clinicaNome?: string;
  limiteTranscricoesMensais?: number;
  transcricoesUtilizadasMesAtual?: number;
  dataUltimoReset?: string;
}

export interface Clinica {
  id: string;
  nome: string;
  razaoSocial?: string;
  logoPath?: string;
  telefone?: string;
  endereco?: string;
  email?: string;
  totalUsuarios: number;
  createdAt: string;
}

export interface TranscriptionLog {
  id: string;
  userId: string;
  username: string;
  timestamp: string;
  duration: number;
  success: boolean;
  errorMessage?: string;
}

export interface DashboardData {
  stats: {
    totalUsers: number;
    totalTranscriptions: number;
    totalActiveUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    usersWithTranscriptions: number;
    lastUpdated: string;
  };
  userStats: Array<{
    id: string;
    username: string;
    name: string;
    transcriptionCount: number;
    lastLogin?: string;
    isActive: boolean;
    createdAt: string;
  }>;
  recentActivity: Array<{
    id: string;
    username: string;
    timestamp: string;
    success: boolean;
    duration: number;
    errorMessage?: string;
  }>;
  topUsers: Array<{
    id: string;
    username: string;
    name: string;
    transcriptionCount: number;
    lastLogin?: string;
    isActive: boolean;
    createdAt: string;
  }>;
}

export interface UserDetail {
  user: VetUser;
  logs: TranscriptionLog[];
}

class AdminApiService {
  private getAuthHeaders(): HeadersInit {
    const storedAuth = localStorage.getItem('vet-admin-auth');
    if (!storedAuth) {
      throw new Error('Administrador não autenticado');
    }

    const { credentials } = JSON.parse(storedAuth);
    return {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
    };
  }

  async getDashboard(): Promise<DashboardData> {
    try {
      const response = await fetch('/api/admin/dashboard', {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar dados do dashboard');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro no dashboard:', error);
      throw error;
    }
  }

  async getUsers(): Promise<VetUser[]> {
    try {
      const response = await fetch('/api/admin/users', {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar usuários');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
  }

  async getUser(id: string): Promise<UserDetail> {
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar usuário');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      throw error;
    }
  }

  async createUser(userData: {
    username: string;
    password: string;
    name: string;
    email?: string;
  }): Promise<VetUser> {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar usuário');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  }

  async updateUser(id: string, userData: {
    username?: string;
    password?: string;
    name?: string;
    email?: string;
    isActive?: boolean;
  }): Promise<VetUser> {
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar usuário');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao deletar usuário');
      }
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      throw error;
    }
  }

  async getLogs(limit?: number): Promise<TranscriptionLog[]> {
    try {
      const url = limit ? `/api/admin/logs?limit=${limit}` : '/api/admin/logs';
      const response = await fetch(url, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar logs');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
      throw error;
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch('/api/admin/health', {
        headers: this.getAuthHeaders(),
      });
      return response.ok;
    } catch (error) {
      console.error('Erro na verificação de saúde admin:', error);
      return false;
    }
  }

  // ==========================================
  // MÉTODOS PARA GERENCIAMENTO DE CLÍNICAS
  // ==========================================

  async getClinicas(): Promise<Clinica[]> {
    const response = await fetch('/api/admin/clinicas', {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar clínicas');
    }

    return response.json();
  }

  async getClinica(id: string): Promise<Clinica> {
    const response = await fetch(`/api/admin/clinicas/${id}`, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar clínica');
    }

    return response.json();
  }

  async createClinica(formData: FormData): Promise<void> {
    const response = await fetch('/api/admin/clinicas', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa('superadmin:SuperAdmin@2024!')}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao criar clínica');
    }
  }

  async updateClinica(id: string, formData: FormData): Promise<void> {
    const response = await fetch(`/api/admin/clinicas/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${btoa('superadmin:SuperAdmin@2024!')}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao atualizar clínica');
    }
  }

  async deleteClinica(id: string): Promise<void> {
    const response = await fetch(`/api/admin/clinicas/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao excluir clínica');
    }
  }
}

export const adminApiService = new AdminApiService();
