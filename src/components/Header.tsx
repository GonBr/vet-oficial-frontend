import React, { useState } from 'react';
import { LogOut, Stethoscope, User, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserProfileModal } from './UserProfileModal';
import { useUserInfo } from '../hooks/useUserInfo';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { userInfo, refreshUserInfo } = useUserInfo();
  const [showProfileModal, setShowProfileModal] = useState(false);

  return (
    <header className="bg-gradient-to-r from-warm-600 via-warm-500 to-sage-600 shadow-warm border-b border-warm-400/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center gap-3 animate-float-in">
            <div className="relative">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/30">
                <Stethoscope className="w-5 h-5 text-white drop-shadow-lg" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-medical-cross rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">+</span>
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white drop-shadow-md">
                Sistema Veterinário
              </h1>
              <p className="text-warm-100 text-xs font-medium">
                Plataforma Profissional de Consultas
              </p>
            </div>
          </div>

          {/* User Info and Actions */}
          <div className="flex items-center gap-4 animate-slide-in-right">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/30">
                <User className="w-4 h-4" />
              </div>
              <div className="text-right">
                <div className="font-semibold text-sm">{user?.username}</div>
                {userInfo?.user?.fullName && (
                  <div className="text-warm-100 text-xs font-medium">{userInfo.user.fullName}</div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowProfileModal(true)}
                className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-medium transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/20"
                title="Editar perfil profissional"
              >
                <Settings className="w-3 h-3" />
                Perfil
              </button>

              <button
                onClick={logout}
                className="bg-white/20 hover:bg-red-500/80 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-medium transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/20"
                title="Sair do sistema"
              >
                <LogOut className="w-3 h-3" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Perfil */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        userInfo={userInfo?.user || null}
        onProfileUpdated={() => {
          refreshUserInfo();
          setShowProfileModal(false);
        }}
      />
    </header>
  );
};

export default Header;
