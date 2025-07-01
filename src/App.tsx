import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useUserInfo } from './hooks/useUserInfo';
import Login from './components/Login';
import Header from './components/Header';
import Recorder from './components/Recorder';
import Results from './components/Results';
import ConsultationsHistory from './components/ConsultationsHistory';
import AudioUpload from './components/AudioUpload';
import ClinicaBranding from './components/ClinicaBranding';
import TranscriptionCounter from './components/TranscriptionCounter';
import { TranscriptionResult } from './types';
import { Mic, History, Upload, RefreshCw } from 'lucide-react';

type TabType = 'recorder' | 'upload' | 'history';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { userInfo, loading: userInfoLoading, error: userInfoError, refreshUserInfo } = useUserInfo();
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('recorder');

  const handleResult = (newResult: TranscriptionResult) => {
    setResult(newResult);
    // Atualizar informações do usuário após nova transcrição
    refreshUserInfo();
  };

  const handleNewRecording = () => {
    setResult(null);
    setActiveTab('recorder');
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === 'recorder') {
      setResult(null);
    }
  };

  // Only show loading for auth, not for userInfo - let components handle their own loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user?.isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="min-h-screen">
      <Header />

      {/* Branding da Clínica e Informações do Usuário */}
      <div className="vet-header border-b border-warm-300/30 shadow-soft">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-float-in">
            {/* Branding da Clínica */}
            <div className="lg:col-span-2">
              <ClinicaBranding
                clinica={userInfo?.clinica}
                size="medium"
                showDetails={true}
              />
              {/* Removed error display for better UX - errors handled silently */}
            </div>

            {/* Contador de Transcrições */}
            <div className="animate-slide-in-right">
              <TranscriptionCounter
                transcricoes={userInfo?.transcricoes || {
                  utilizadas: 0,
                  limite: 50,
                  restantes: 50,
                  podeTranscrever: true
                }}
                size="small"
                showDetails={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-gradient-to-r from-cream-50/80 to-warm-50/60 border-b border-sage-200/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1">
            <button
              onClick={() => handleTabChange('recorder')}
              className={`py-3 px-4 border-b-2 font-medium text-sm transition-all duration-300 rounded-t-lg hover-lift ${
                activeTab === 'recorder'
                  ? 'border-warm-500 text-warm-700 bg-gradient-to-t from-warm-50 to-transparent shadow-soft'
                  : 'border-transparent text-earth-600 hover:text-warm-700 hover:border-warm-300 hover:bg-warm-50/30'
              }`}
            >
              <div className="flex items-center gap-2">
                <Mic className={`w-4 h-4 transition-transform duration-200 ${activeTab === 'recorder' ? 'scale-110' : ''}`} />
                <span className="font-semibold">Nova Consulta</span>
              </div>
            </button>
            <button
              onClick={() => handleTabChange('upload')}
              className={`py-3 px-4 border-b-2 font-medium text-sm transition-all duration-300 rounded-t-lg hover-lift ${
                activeTab === 'upload'
                  ? 'border-warm-500 text-warm-700 bg-gradient-to-t from-warm-50 to-transparent shadow-soft'
                  : 'border-transparent text-earth-600 hover:text-warm-700 hover:border-warm-300 hover:bg-warm-50/30'
              }`}
            >
              <div className="flex items-center gap-2">
                <Upload className={`w-4 h-4 transition-transform duration-200 ${activeTab === 'upload' ? 'scale-110' : ''}`} />
                <span className="font-semibold">Enviar Arquivo</span>
              </div>
            </button>
            <button
              onClick={() => handleTabChange('history')}
              className={`py-3 px-4 border-b-2 font-medium text-sm transition-all duration-300 rounded-t-lg hover-lift ${
                activeTab === 'history'
                  ? 'border-warm-500 text-warm-700 bg-gradient-to-t from-warm-50 to-transparent shadow-soft'
                  : 'border-transparent text-earth-600 hover:text-warm-700 hover:border-warm-300 hover:bg-warm-50/30'
              }`}
            >
              <div className="flex items-center gap-2">
                <History className={`w-4 h-4 transition-transform duration-200 ${activeTab === 'history' ? 'scale-110' : ''}`} />
                <span className="font-semibold">Minhas Consultas</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="animate-fade-in-scale">
          {activeTab === 'recorder' && (
            <div className="space-y-8">
              {!result ? (
                <div className="vet-card hover-lift">
                  <Recorder
                    onResult={handleResult}
                    canTranscribe={userInfo?.transcricoes?.podeTranscrever !== false}
                    transcriptionLimitMessage={
                      userInfo?.transcricoes && !userInfo.transcricoes.podeTranscrever
                        ? `Você já utilizou ${userInfo.transcricoes.utilizadas} de ${userInfo.transcricoes.limite} transcrições este mês.`
                        : undefined
                    }
                  />
                </div>
              ) : (
                <div className="vet-card hover-lift">
                  <Results result={result} onNewRecording={handleNewRecording} />
                </div>
              )}
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="space-y-8">
              {!result ? (
                <div className="vet-card hover-lift">
                  <AudioUpload
                    onResult={handleResult}
                    canTranscribe={userInfo?.transcricoes?.podeTranscrever !== false}
                    transcriptionLimitMessage={
                      userInfo?.transcricoes && !userInfo.transcricoes.podeTranscrever
                        ? `Você já utilizou ${userInfo.transcricoes.utilizadas} de ${userInfo.transcricoes.limite} transcrições este mês.`
                        : undefined
                    }
                  />
                </div>
              ) : (
                <div className="vet-card hover-lift">
                  <Results result={result} onNewRecording={handleNewRecording} />
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="vet-card hover-lift">
              <ConsultationsHistory />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-earth-100 to-sage-100 border-t border-sage-200/50 mt-16 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-warm-500 to-sage-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <h3 className="text-lg font-semibold text-earth-800">Sistema Veterinário</h3>
            </div>
            <p className="text-sm text-earth-600 font-medium">Versão 1.0 - Plataforma Profissional</p>
            <p className="mt-2 text-xs text-earth-500">
              Desenvolvido para facilitar a documentação de consultas veterinárias com tecnologia avançada
            </p>
            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-earth-400">
              <span>🏥 Multi-clínica</span>
              <span>🎙️ IA Avançada</span>
              <span>📋 Documentação Completa</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
