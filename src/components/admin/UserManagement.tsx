import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  UserCheck, 
  UserX,
  RefreshCw,
  Search
} from 'lucide-react';
import { adminApiService, VetUser } from '../../services/adminApi';
import CreateUserModal from './CreateUserModal';
import EditUserModal from './EditUserModal';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<VetUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<VetUser | null>(null);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminApiService.getUsers();
      setUsers(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao carregar usuários');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleEditUser = (user: VetUser) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleDeleteUser = async (user: VetUser) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${user.username}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      await adminApiService.deleteUser(user.id);
      await loadUsers(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      setError(error instanceof Error ? error.message : 'Erro ao excluir usuário');
    }
  };

  const handleUserCreated = () => {
    loadUsers(); // Recarregar lista após criar usuário
  };

  const handleUserUpdated = () => {
    loadUsers(); // Recarregar lista após atualizar usuário
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleStatus = async (user: VetUser) => {
    try {
      await adminApiService.updateUser(user.id, { isActive: !user.isActive });
      await loadUsers();
    } catch (error) {
      alert('Erro ao alterar status do usuário');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span>Carregando usuários...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={loadUsers}
            className="btn-secondary flex items-center gap-2"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Usuário
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar usuários..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 input"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Erro ao carregar usuários</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Users Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Usuário</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Nome</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Clínica</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Status</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Limite Mensal</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Último Acesso</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900">@{user.username}</p>
                      <p className="text-xs text-gray-500">ID: {user.id.slice(0, 8)}...</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email || 'Sem email'}</p>
                  </td>
                  <td className="py-3 px-4">
                    {user.clinicaNome ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-red-100 rounded flex items-center justify-center">
                          <span className="text-xs text-red-600 font-medium">
                            {user.clinicaNome.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm text-gray-900">{user.clinicaNome}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">Sem clínica</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleToggleStatus(user)}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {user.isActive ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                      {user.isActive ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-900">
                        {user.limiteTranscricoesMensais || 50}/mês
                      </div>
                      <div className="text-xs text-gray-500">
                        {user.transcricoesUtilizadasMesAtual || 0} utilizadas
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-gray-600">
                      {user.lastLogin ? formatDate(user.lastLogin) : 'Nunca'}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Editar usuário"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Excluir usuário"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && !isLoading && (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'Nenhum usuário encontrado com esse termo' : 'Nenhum usuário cadastrado'}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-600">Total de Usuários</p>
          <p className="text-2xl font-bold text-blue-900">{users.length}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm font-medium text-green-600">Usuários Ativos</p>
          <p className="text-2xl font-bold text-green-900">
            {users.filter(u => u.isActive).length}
          </p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-sm font-medium text-purple-600">Com Transcrições</p>
          <p className="text-2xl font-bold text-purple-900">
            {users.filter(u => u.transcriptionCount > 0).length}
          </p>
        </div>
      </div>

      {/* Modals */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onUserCreated={handleUserCreated}
      />

      <EditUserModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onUserUpdated={handleUserUpdated}
        user={selectedUser}
      />
    </div>
  );
};

export default UserManagement;
