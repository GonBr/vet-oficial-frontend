import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (stored credentials) - FAST CHECK
    const storedCredentials = localStorage.getItem('vet-auth');
    if (storedCredentials) {
      try {
        const { username } = JSON.parse(storedCredentials);
        setUser({ username, isAuthenticated: true });
      } catch (error) {
        console.error('Erro ao recuperar credenciais:', error);
        localStorage.removeItem('vet-auth');
      }
    }
    // Remove loading immediately - don't wait for API calls
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      console.log('Tentando fazer login com:', username);

      // Test authentication by making a request to the health endpoint
      const credentials = btoa(`${username}:${password}`);
      console.log('Credentials encoded:', credentials);

      const response = await fetch('/api/upload/health', {
        headers: {
          'Authorization': `Basic ${credentials}`,
        },
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const userData = { username, isAuthenticated: true };
        setUser(userData);

        // Store credentials for future requests
        localStorage.setItem('vet-auth', JSON.stringify({
          username,
          password,
          credentials
        }));

        console.log('Login bem-sucedido!');
        return true;
      } else {
        const errorText = await response.text();
        console.log('Erro na resposta:', errorText);
        return false;
      }
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('vet-auth');
    // Clear all caches on logout
    localStorage.removeItem('vet-user-info-cache');
    localStorage.removeItem('vet-consultations-cache');
  };

  const value = {
    user,
    login,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
