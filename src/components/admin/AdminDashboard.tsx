import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Activity, 
  TrendingUp, 
  Clock,
  UserCheck,
  UserX,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { adminApiService, DashboardData } from '../../services/adminApi';

const AdminDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminApiService.getDashboard();
      setDashboardData(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao carregar dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span>Carregando dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p className="font-medium">Erro ao carregar dashboard</p>
        <p className="text-sm mt-1">{error}</p>
        <button 
          onClick={loadDashboard}
          className="mt-2 text-sm underline hover:no-underline"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!dashboardData) {
    return <div>Nenhum dado disponível</div>;
  }

  const { stats, userStats, recentActivity, topUsers } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrativo</h1>
        <button
          onClick={loadDashboard}
          className="btn-secondary flex items-center gap-2"
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Transcrições</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTranscriptions}</p>
            </div>
            <Activity className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Usuários Ativos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
            </div>
            <UserCheck className="w-8 h-8 text-emerald-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Usuários Inativos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inactiveUsers}</p>
            </div>
            <UserX className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Users */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Top 5 Usuários</h2>
          </div>
          <div className="space-y-3">
            {topUsers.map((user, index) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-600">@{user.username}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600">{user.transcriptionCount}</p>
                  <p className="text-xs text-gray-500">transcrições</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Atividade Recente</h2>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    activity.success ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <p className="font-medium text-gray-900">{activity.username}</p>
                    <p className="text-sm text-gray-600">
                      {activity.success ? 'Transcrição realizada' : 'Erro na transcrição'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{formatDuration(activity.duration)}</p>
                  <p className="text-xs text-gray-500">
                    {formatDate(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* All Users Table */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">Todos os Usuários</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Usuário</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Nome</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Transcrições</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Último Acesso</th>
              </tr>
            </thead>
            <tbody>
              {userStats.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900">@{user.username}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-gray-900">{user.name}</p>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {user.transcriptionCount}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-gray-600">
                      {user.lastLogin ? formatDate(user.lastLogin) : 'Nunca'}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center text-sm text-gray-500">
        <p>Última atualização: {formatDate(stats.lastUpdated)}</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
