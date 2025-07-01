import React, { useState } from 'react';
import {
  Shield,
  LogOut,
  BarChart3,
  Users,
  Activity,
  Menu,
  X,
  Home,
  Building2,
  FileText,
  Settings
} from 'lucide-react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage: 'dashboard' | 'users' | 'clinicas' | 'templates' | 'logs';
  onPageChange: (page: 'dashboard' | 'users' | 'clinicas' | 'templates' | 'logs') => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, currentPage, onPageChange }) => {
  const { admin, logout } = useAdminAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'clinicas', label: 'Clínicas', icon: Building2 },
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'settings', label: 'Configurações', icon: Settings },
    { id: 'logs', label: 'Logs', icon: Activity },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 bg-gray-800">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-red-400" />
            <span className="text-white font-bold">Admin Panel</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-8">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onPageChange(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-6 py-3 text-left transition-colors ${
                  currentPage === item.id
                    ? 'bg-red-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="border-t border-gray-700 pt-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-medium">{admin?.name}</p>
                <p className="text-gray-400 text-sm">@{admin?.username}</p>
              </div>
            </div>
            
            <a
              href="/"
              className="flex items-center gap-2 text-gray-400 hover:text-white mb-2 text-sm"
            >
              <Home className="w-4 h-4" />
              Sistema Principal
            </a>
            
            <button
              onClick={logout}
              className="flex items-center gap-2 text-gray-400 hover:text-white text-sm"
            >
              <LogOut className="w-4 h-4" />
              Sair do Admin
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-gray-600 hover:text-gray-900"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Painel Administrativo</p>
                <p className="text-xs text-gray-600">Sistema de Consultas Veterinárias</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
