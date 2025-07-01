import React, { useState, useEffect } from 'react';
import { X, User, Mail, CreditCard, Save, AlertCircle, CheckCircle } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userInfo: {
    id: string;
    username: string;
    name: string;
    email?: string;
    crmv?: string;
    fullName?: string;
  } | null;
  onProfileUpdated: () => void;
}

interface ProfileFormData {
  crmv: string;
  fullName: string;
  email: string;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  userInfo,
  onProfileUpdated
}) => {
  const [formData, setFormData] = useState<ProfileFormData>({
    crmv: '',
    fullName: '',
    email: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Preencher formulário com dados atuais
  useEffect(() => {
    if (userInfo) {
      setFormData({
        crmv: userInfo.crmv || '',
        fullName: userInfo.fullName || '',
        email: userInfo.email || ''
      });
    }
  }, [userInfo]);

  // Limpar mensagens quando modal abre/fecha
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccess(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Obter credenciais do localStorage
      const authData = localStorage.getItem('vet-auth');
      if (!authData) {
        throw new Error('Usuário não autenticado');
      }

      const { username, password } = JSON.parse(authData);
      const credentials = btoa(`${username}:${password}`);

      const response = await fetch('/api/upload/user-profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar perfil');
      }

      const result = await response.json();
      setSuccess(result.message || 'Perfil atualizado com sucesso!');
      
      // Notificar componente pai para atualizar dados
      onProfileUpdated();

      // Fechar modal após 2 segundos
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar mensagens ao editar
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Editar Perfil Profissional
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Informações básicas (somente leitura) */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Informações da Conta</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-500">Usuário:</span>
                <span className="ml-2 font-medium">{userInfo?.username}</span>
              </div>
              <div>
                <span className="text-gray-500">Nome:</span>
                <span className="ml-2 font-medium">{userInfo?.name}</span>
              </div>
            </div>
          </div>

          {/* Formulário de edição */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome Completo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Nome Completo do Veterinário
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Ex: Dr. João Silva Veterinário"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Nome completo que aparecerá nos documentos profissionais
              </p>
            </div>

            {/* CRMV */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CreditCard className="w-4 h-4 inline mr-1" />
                CRMV (Conselho Regional de Medicina Veterinária)
              </label>
              <input
                type="text"
                value={formData.crmv}
                onChange={(e) => handleInputChange('crmv', e.target.value)}
                placeholder="Ex: SP 12345 ou RJ 67890"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Número do registro profissional (formato: UF + número)
              </p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email Profissional
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Ex: veterinario@clinica.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Email que aparecerá nos documentos profissionais
              </p>
            </div>

            {/* Mensagens de erro/sucesso */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md text-green-700">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{success}</span>
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Salvar Perfil
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
