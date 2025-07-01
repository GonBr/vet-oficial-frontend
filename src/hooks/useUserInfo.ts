import { useState, useEffect } from 'react';

export interface UserInfo {
  user: {
    id: string;
    username: string;
    name: string;
    email?: string;
    isActive: boolean;
    crmv?: string;
    fullName?: string;
  };
  clinica?: {
    id: string;
    nome: string;
    razaoSocial?: string;
    logoPath?: string;
    telefone?: string;
    endereco?: string;
    email?: string;
  };
  transcricoes: {
    utilizadas: number;
    limite: number;
    restantes: number;
    podeTranscrever: boolean;
  };
}

// Cache key for localStorage
const USER_INFO_CACHE_KEY = 'vet-user-info-cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useUserInfo = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(() => {
    // Try to load from cache immediately
    try {
      const cached = localStorage.getItem(USER_INFO_CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          return data;
        }
      }
    } catch (error) {
      console.warn('Error loading cached user info:', error);
    }
    return null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserInfo = async (forceRefresh = false) => {
    try {
      // Check cache first unless force refresh
      if (!forceRefresh) {
        const cached = localStorage.getItem(USER_INFO_CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            setUserInfo(data);
            return;
          }
        }
      }

      setLoading(true);
      setError(null);

      // Obter credenciais do localStorage
      const authData = localStorage.getItem('vet-auth');
      if (!authData) {
        throw new Error('Usuário não autenticado');
      }

      const { username, password } = JSON.parse(authData);
      const credentials = btoa(`${username}:${password}`);

      const response = await fetch('/api/upload/user-info', {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Sessão expirada. Faça login novamente.');
        }
        throw new Error('Erro ao buscar informações do usuário');
      }

      const data = await response.json();

      // Cache the data
      localStorage.setItem(USER_INFO_CACHE_KEY, JSON.stringify({
        data,
        timestamp: Date.now()
      }));

      setUserInfo(data);

    } catch (err) {
      console.error('Erro ao buscar informações do usuário:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if we don't have cached data
    if (!userInfo) {
      fetchUserInfo();
    }
  }, []);

  const refreshUserInfo = () => {
    fetchUserInfo();
  };

  return {
    userInfo,
    loading,
    error,
    refreshUserInfo
  };
};
