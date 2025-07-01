import React, { useState, useEffect } from 'react';
import { X, User, Lock, Eye, EyeOff, AlertCircle, CheckCircle, Edit, Building2, Hash } from 'lucide-react';
import { VetUser, Clinica } from '../../services/adminApi';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
  user: VetUser | null;
}

interface EditUserData {
  username: string;
  password: string;
  confirmPassword: string;
  name: string;
  email: string;
  isActive: boolean;
  changePassword: boolean;
  clinicaId: string;
  limiteTranscricoes: number;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, onUserUpdated, user }) => {
  const [formData, setFormData] = useState<EditUserData>({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    email: '',
    isActive: true,
    changePassword: false,
    clinicaId: '',
    limiteTranscricoes: 50
  });
  const [clinicas, setClinicas] = useState<Clinica[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Carregar clínicas
      fetchClinicas();

      if (user) {
        setFormData({
          username: user.username,
          password: '',
          confirmPassword: '',
          name: user.name,
          email: user.email || '',
          isActive: user.isActive,
          changePassword: false,
          clinicaId: user.clinicaId || '',
          limiteTranscricoes: user.limiteTranscricoesMensais || 50
        });
        setError(null);
        setSuccess(false);
      }
    }
  }, [user, isOpen]);

  const fetchClinicas = async () => {
    try {
      const response = await fetch('/api/admin/clinicas', {
        headers: {
          'Authorization': `Basic ${btoa('superadmin:SuperAdmin@2024!')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setClinicas(data);
      }
    } catch (error) {
      console.error('Erro ao carregar clínicas:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      confirmPassword: '',
      name: '',
      email: '',
      isActive: true,
      changePassword: false,
      clinicaId: '',
      limiteTranscricoes: 50
    });
    setError(null);
    setSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = (): string | null => {
    if (!formData.username.trim()) {
      return 'Nome de usuário é obrigatório';
    }
    if (formData.username.length < 3) {
      return 'Nome de usuário deve ter pelo menos 3 caracteres';
    }
    if (!formData.name.trim()) {
      return 'Nome completo é obrigatório';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return 'Email inválido';
    }
    if (formData.limiteTranscricoes < 1) {
      return 'Limite de transcrições deve ser pelo menos 1';
    }
    if (formData.changePassword) {
      if (!formData.password) {
        return 'Nova senha é obrigatória';
      }
      if (formData.password.length < 6) {
        return 'Nova senha deve ter pelo menos 6 caracteres';
      }
      if (formData.password !== formData.confirmPassword) {
        return 'Senhas não coincidem';
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get admin credentials from localStorage
      const adminAuth = localStorage.getItem('vet-admin-auth');
      if (!adminAuth) {
        throw new Error('Credenciais de administrador não encontradas');
      }

      const { credentials } = JSON.parse(adminAuth);

      const updateData: any = {
        username: formData.username.trim(),
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        isActive: formData.isActive,
        clinicaId: formData.clinicaId || null,
        limiteTranscricoes: formData.limiteTranscricoes
      };

      if (formData.changePassword) {
        updateData.password = formData.password;
      }

      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar usuário');
      }

      setSuccess(true);
      // Chamar callback imediatamente para atualizar a lista
      onUserUpdated();

      // Fechar modal após mostrar sucesso brevemente
      setTimeout(() => {
        handleClose();
      }, 1000);

    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      setError(error instanceof Error ? error.message : 'Erro ao atualizar usuário');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof EditUserData, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Edit className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Editar Usuário</h2>
              <p className="text-sm text-gray-600">Modificar dados do usuário</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Nome de Usuário *
            </label>
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              placeholder="Ex: dr.silva"
              disabled={isLoading}
              required
            />
          </div>

          {/* Nome Completo */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nome Completo *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              placeholder="Ex: Dr. João Silva"
              disabled={isLoading}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              placeholder="email@exemplo.com"
              disabled={isLoading}
            />
          </div>

          {/* Clínica */}
          <div>
            <label htmlFor="clinica" className="block text-sm font-medium text-gray-700 mb-2">
              <Building2 className="w-4 h-4 inline mr-1" />
              Clínica
            </label>
            <select
              id="clinica"
              value={formData.clinicaId}
              onChange={(e) => handleInputChange('clinicaId', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              disabled={isLoading}
            >
              <option value="">Selecione uma clínica</option>
              {clinicas.map((clinica) => (
                <option key={clinica.id} value={clinica.id}>
                  {clinica.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Limite de Transcrições */}
          <div>
            <label htmlFor="limite" className="block text-sm font-medium text-gray-700 mb-2">
              <Hash className="w-4 h-4 inline mr-1" />
              Limite de Transcrições Mensais *
            </label>
            <input
              type="number"
              id="limite"
              min="1"
              max="1000"
              value={formData.limiteTranscricoes}
              onChange={(e) => handleInputChange('limiteTranscricoes', parseInt(e.target.value) || 50)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              placeholder="50"
              disabled={isLoading}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Número máximo de transcrições que o usuário pode fazer por mês
            </p>
          </div>

          {/* Change Password Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="changePassword"
              checked={formData.changePassword}
              onChange={(e) => handleInputChange('changePassword', e.target.checked)}
              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              disabled={isLoading}
            />
            <label htmlFor="changePassword" className="text-sm font-medium text-gray-700">
              Alterar senha
            </label>
          </div>

          {/* Password Fields - Only show if changePassword is true */}
          {formData.changePassword && (
            <>
              {/* New Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Nova Senha *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="Mínimo 6 caracteres"
                    disabled={isLoading}
                    required={formData.changePassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Nova Senha *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="Repita a nova senha"
                    disabled={isLoading}
                    required={formData.changePassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Active Status */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => handleInputChange('isActive', e.target.checked)}
              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              disabled={isLoading}
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Usuário ativo (pode fazer login)
            </label>
          </div>

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>Usuário atualizado com sucesso!</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-orange-600 text-white px-4 py-3 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
              disabled={isLoading || success}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4" />
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
