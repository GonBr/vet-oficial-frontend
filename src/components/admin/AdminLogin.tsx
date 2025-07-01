import React, { useState } from 'react';
import { Shield, LogIn } from 'lucide-react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAdminAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(username, password);
      if (!success) {
        setError('Credenciais de administrador inválidas. Verifique seu usuário e senha.');
      }
    } catch (error) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Painel Administrativo
            </h1>
            <p className="text-gray-600">
              Acesso restrito para super administradores
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Usuário Administrador
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input"
                placeholder="Digite seu usuário de administrador"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha de Administrador
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="Digite sua senha de administrador"
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !username || !password}
              className={`w-full flex items-center justify-center gap-2 ${
                isLoading || !username || !password
                  ? 'btn-disabled'
                  : 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 btn'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Acessar Painel
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-600 text-center">
              <p className="font-medium mb-2">⚠️ Área Restrita</p>
              <p className="text-xs">
                Este painel é exclusivo para super administradores.<br />
                Acesso não autorizado será registrado e monitorado.
              </p>
            </div>
          </div>

          <div className="mt-4 text-center">
            <a 
              href="/" 
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              ← Voltar ao sistema principal
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
