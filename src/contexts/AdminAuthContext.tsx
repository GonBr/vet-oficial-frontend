import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AdminUser {
  id: string;
  username: string;
  name: string;
  isSuperAdmin: boolean;
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth deve ser usado dentro de um AdminAuthProvider');
  }
  return context;
};

interface AdminAuthProviderProps {
  children: ReactNode;
}

export const AdminAuthProvider: React.FC<AdminAuthProviderProps> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if admin is already logged in (stored credentials)
    const storedCredentials = localStorage.getItem('vet-admin-auth');
    if (storedCredentials) {
      try {
        const { username } = JSON.parse(storedCredentials);
        // Validate stored credentials by making a test request
        validateStoredCredentials(storedCredentials);
      } catch (error) {
        console.error('Erro ao recuperar credenciais admin:', error);
        localStorage.removeItem('vet-admin-auth');
      }
    }
    setIsLoading(false);
  }, []);

  const validateStoredCredentials = async (storedCredentials: string) => {
    try {
      const { credentials } = JSON.parse(storedCredentials);
      const response = await fetch('/api/admin/health', {
        headers: {
          'Authorization': `Basic ${credentials}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAdmin({
          id: data.admin || 'admin',
          username: data.admin,
          name: 'Super Administrador',
          isSuperAdmin: true
        });
      } else {
        localStorage.removeItem('vet-admin-auth');
      }
    } catch (error) {
      console.error('Erro na validação de credenciais admin:', error);
      localStorage.removeItem('vet-admin-auth');
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      console.log('Tentando fazer login admin com:', username);
      
      // Test authentication by making a request to the admin health endpoint
      const credentials = btoa(`${username}:${password}`);
      console.log('Admin credentials encoded:', credentials);
      
      const response = await fetch('/api/admin/health', {
        headers: {
          'Authorization': `Basic ${credentials}`,
        },
      });

      console.log('Admin response status:', response.status);
      console.log('Admin response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        const adminData: AdminUser = {
          id: data.admin || 'admin',
          username: data.admin,
          name: 'Super Administrador',
          isSuperAdmin: true
        };
        setAdmin(adminData);
        
        // Store credentials for future requests
        localStorage.setItem('vet-admin-auth', JSON.stringify({ 
          username, 
          credentials 
        }));
        
        console.log('Login admin bem-sucedido!');
        return true;
      } else {
        const errorText = await response.text();
        console.log('Erro na resposta admin:', errorText);
        return false;
      }
    } catch (error) {
      console.error('Erro no login admin:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem('vet-admin-auth');
  };

  const value = {
    admin,
    login,
    logout,
    isLoading,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};
