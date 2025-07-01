import React from 'react';
import { Building2, Phone, Mail, MapPin } from 'lucide-react';

interface ClinicaBrandingProps {
  clinica?: {
    id: string;
    nome: string;
    razaoSocial?: string;
    logoPath?: string;
    telefone?: string;
    endereco?: string;
    email?: string;
  };
  size?: 'small' | 'medium' | 'large';
  showDetails?: boolean;
}

const ClinicaBranding: React.FC<ClinicaBrandingProps> = ({
  clinica,
  size = 'medium',
  showDetails = false
}) => {
  if (!clinica) {
    return (
      <div className="flex items-center gap-3">
        <div className={`
          ${size === 'small' ? 'w-8 h-8' : size === 'medium' ? 'w-10 h-10' : 'w-12 h-12'}
          bg-gradient-to-br from-medical-red to-warm-600 rounded-lg flex items-center justify-center shadow-soft border-2 border-white/30
        `}>
          <Building2 className={`
            ${size === 'small' ? 'w-4 h-4' : size === 'medium' ? 'w-5 h-5' : 'w-6 h-6'}
            text-white drop-shadow-md
          `} />
        </div>
        <div>
          <h2 className={`
            ${size === 'small' ? 'text-base' : size === 'medium' ? 'text-lg' : 'text-xl'}
            font-bold text-white drop-shadow-md leading-tight
          `}>
            Sistema Veterinário
          </h2>
          {size !== 'small' && (
            <p className="text-warm-100 font-medium text-sm">🏥 Plataforma Profissional de Consultas</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Logo e Nome */}
      <div className="flex items-center gap-3">
        {clinica.logoPath ? (
          <div className="relative">
            <img
              src={clinica.logoPath}
              alt={clinica.nome}
              className={`
                ${size === 'small' ? 'w-8 h-8' : size === 'medium' ? 'w-10 h-10' : 'w-12 h-12'}
                object-cover rounded-lg border-2 border-white/30 shadow-soft
              `}
              loading="eager"
              onError={(e) => {
                // Fallback to default icon if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div
              className={`
                ${size === 'small' ? 'w-8 h-8' : size === 'medium' ? 'w-10 h-10' : 'w-12 h-12'}
                bg-gradient-to-br from-warm-500 to-sage-500 rounded-lg flex items-center justify-center shadow-soft border-2 border-white/30 absolute top-0 left-0
              `}
              style={{ display: 'none' }}
            >
              <Building2 className={`
                ${size === 'small' ? 'w-4 h-4' : size === 'medium' ? 'w-5 h-5' : 'w-6 h-6'}
                text-white drop-shadow-md
              `} />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-gradient-to-br from-warm-500 to-sage-500 rounded-md flex items-center justify-center border border-white">
              <Building2 className="w-2 h-2 text-white" />
            </div>
          </div>
        ) : (
          <div className={`
            ${size === 'small' ? 'w-8 h-8' : size === 'medium' ? 'w-10 h-10' : 'w-12 h-12'}
            bg-gradient-to-br from-warm-500 to-sage-500 rounded-lg flex items-center justify-center shadow-soft border-2 border-white/30
          `}>
            <Building2 className={`
              ${size === 'small' ? 'w-4 h-4' : size === 'medium' ? 'w-5 h-5' : 'w-6 h-6'}
              text-white drop-shadow-md
            `} />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h2 className={`
            ${size === 'small' ? 'text-base' : size === 'medium' ? 'text-lg' : 'text-xl'}
            font-bold text-white drop-shadow-md leading-tight
          `}>
            🏥 {clinica.nome}
          </h2>
          {clinica.razaoSocial && size !== 'small' && (
            <p className="text-warm-100 font-medium text-sm mt-0.5 truncate">{clinica.razaoSocial}</p>
          )}
        </div>
      </div>

      {/* Detalhes de Contato */}
      {showDetails && (
        <div className="space-y-2 text-white/90">
          {clinica.telefone && (
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/20">
              <div className="w-6 h-6 bg-white/20 rounded-md flex items-center justify-center">
                <Phone className="w-3 h-3 text-white" />
              </div>
              <span className="font-medium text-sm">{clinica.telefone}</span>
            </div>
          )}

          {clinica.email && (
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/20">
              <div className="w-6 h-6 bg-white/20 rounded-md flex items-center justify-center">
                <Mail className="w-3 h-3 text-white" />
              </div>
              <span className="font-medium text-sm truncate">{clinica.email}</span>
            </div>
          )}

          {clinica.endereco && (
            <div className="flex items-start gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/20">
              <div className="w-6 h-6 bg-white/20 rounded-md flex items-center justify-center mt-0.5">
                <MapPin className="w-3 h-3 text-white" />
              </div>
              <span className="font-medium text-sm leading-relaxed">{clinica.endereco}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClinicaBranding;
