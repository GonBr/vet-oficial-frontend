import React, { useState } from 'react';
import { AdminAuthProvider, useAdminAuth } from '../../contexts/AdminAuthContext';
import AdminLogin from './AdminLogin';
import AdminLayout from './AdminLayout';
import AdminDashboard from './AdminDashboard';
import UserManagement from './UserManagement';
import ClinicaManagement from './ClinicaManagement';
import DocumentTemplatesManager from './DocumentTemplatesManager';

const AdminAppContent: React.FC = () => {
  const { admin, isLoading } = useAdminAuth();
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'users' | 'clinicas' | 'templates' | 'settings' | 'logs'>('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando painel administrativo...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return <AdminLogin />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'users':
        return <UserManagement />;
      case 'clinicas':
        return <ClinicaManagement />;
      case 'templates':
        return <DocumentTemplatesManager />;
      case 'settings':
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Configurações de IA</h2>
            <p className="text-gray-600">Funcionalidade em desenvolvimento...</p>
          </div>
        );
      case 'logs':
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Logs de Sistema</h2>
            <p className="text-gray-600">Funcionalidade em desenvolvimento...</p>
          </div>
        );
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <AdminLayout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderCurrentPage()}
    </AdminLayout>
  );
};

const AdminApp: React.FC = () => {
  return (
    <AdminAuthProvider>
      <AdminAppContent />
    </AdminAuthProvider>
  );
};

export default AdminApp;
