import React from 'react';
import { Hash, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface TranscriptionCounterProps {
  transcricoes: {
    utilizadas: number;
    limite: number;
    restantes: number;
    podeTranscrever: boolean;
  };
  size?: 'small' | 'medium' | 'large';
  showDetails?: boolean;
}

const TranscriptionCounter: React.FC<TranscriptionCounterProps> = ({ 
  transcricoes, 
  size = 'medium',
  showDetails = true 
}) => {
  const percentage = (transcricoes.utilizadas / transcricoes.limite) * 100;
  
  const getStatusColor = () => {
    if (percentage >= 90) return 'text-status-danger bg-gradient-to-r from-red-50 to-warm-50 border-status-danger/30';
    if (percentage >= 70) return 'text-status-warning bg-gradient-to-r from-warm-50 to-cream-50 border-status-warning/30';
    return 'text-status-success bg-gradient-to-r from-sage-50 to-cream-50 border-status-success/30';
  };

  const getProgressColor = () => {
    if (percentage >= 90) return 'bg-gradient-to-r from-status-danger to-medical-red';
    if (percentage >= 70) return 'bg-gradient-to-r from-status-warning to-warm-600';
    return 'bg-gradient-to-r from-status-success to-sage-600';
  };

  const getIcon = () => {
    if (!transcricoes.podeTranscrever) return <AlertTriangle className="w-4 h-4" />;
    if (percentage >= 70) return <Clock className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  const getStatusText = () => {
    if (!transcricoes.podeTranscrever) return 'Limite atingido';
    if (percentage >= 90) return 'Quase no limite';
    if (percentage >= 70) return 'Atenção ao limite';
    return 'Dentro do limite';
  };

  return (
    <div className={`
      ${size === 'small' ? 'p-3' : size === 'medium' ? 'p-4' : 'p-6'}
      bg-gradient-to-br from-cream-50/80 to-warm-50/60 rounded-xl border-2 border-sage-200/50 shadow-soft backdrop-blur-sm hover:shadow-warm transition-all duration-500 hover:scale-102
    `}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`
            ${size === 'small' ? 'w-6 h-6' : size === 'medium' ? 'w-8 h-8' : 'w-10 h-10'}
            bg-gradient-to-br from-warm-500 to-sage-500 rounded-lg flex items-center justify-center shadow-soft
          `}>
            <Hash className={`
              ${size === 'small' ? 'w-3 h-3' : size === 'medium' ? 'w-4 h-4' : 'w-5 h-5'}
              text-white
            `} />
          </div>
          <h3 className={`
            ${size === 'small' ? 'text-sm' : size === 'medium' ? 'text-base' : 'text-lg'}
            font-bold text-earth-800
          `}>
            Transcrições
          </h3>
        </div>

        <div className={`
          flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-bold shadow-soft
          ${getStatusColor()}
        `}>
          {getIcon()}
          {showDetails && size !== 'small' && <span>{getStatusText()}</span>}
        </div>
      </div>

      {/* Contador Principal */}
      <div className="text-center mb-4">
        <div className={`
          ${size === 'small' ? 'text-xl' : size === 'medium' ? 'text-2xl' : 'text-3xl'}
          font-bold text-earth-800 mb-1
        `}>
          {transcricoes.utilizadas}
          <span className={`
            ${size === 'small' ? 'text-sm' : size === 'medium' ? 'text-base' : 'text-lg'}
            text-earth-500 font-normal
          `}>
            /{transcricoes.limite}
          </span>
        </div>
        <p className={`
          ${size === 'small' ? 'text-xs' : 'text-sm'}
          text-earth-600 font-medium
        `}>
          transcrições utilizadas este mês
        </p>
      </div>

      {/* Barra de Progresso */}
      <div className="mb-3">
        <div className={`
          w-full bg-sage-200 rounded-full shadow-inner
          ${size === 'small' ? 'h-2' : size === 'medium' ? 'h-3' : 'h-4'}
        `}>
          <div
            className={`rounded-full transition-all duration-500 shadow-soft ${getProgressColor()} ${size === 'small' ? 'h-2' : size === 'medium' ? 'h-3' : 'h-4'}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Detalhes */}
      {showDetails && (
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className={`
            ${size === 'small' ? 'p-2' : 'p-3'}
            bg-gradient-to-br from-sage-50 to-cream-50 rounded-lg border border-sage-200 shadow-soft
          `}>
            <div className={`
              ${size === 'small' ? 'text-lg' : size === 'medium' ? 'text-xl' : 'text-2xl'}
              font-bold text-sage-700 mb-0.5
            `}>
              {transcricoes.restantes}
            </div>
            <div className={`
              ${size === 'small' ? 'text-xs' : 'text-sm'}
              text-sage-600 font-medium
            `}>
              Restantes
            </div>
          </div>

          <div className={`
            ${size === 'small' ? 'p-2' : 'p-3'}
            bg-gradient-to-br from-warm-50 to-cream-50 rounded-lg border border-warm-200 shadow-soft
          `}>
            <div className={`
              ${size === 'small' ? 'text-lg' : size === 'medium' ? 'text-xl' : 'text-2xl'}
              font-bold text-warm-700 mb-0.5
            `}>
              {percentage.toFixed(0)}%
            </div>
            <div className={`
              ${size === 'small' ? 'text-xs' : 'text-sm'}
              text-warm-600 font-medium
            `}>
              Utilizado
            </div>
          </div>
        </div>
      )}

      {/* Aviso se limite atingido */}
      {!transcricoes.podeTranscrever && (
        <div className={`
          mt-3 bg-gradient-to-r from-red-50 to-warm-50 border border-red-200 rounded-lg shadow-soft animate-fade-in-scale
          ${size === 'small' ? 'p-2' : 'p-3'}
        `}>
          <div className="flex items-center gap-2 text-red-700 mb-1">
            <div className={`
              ${size === 'small' ? 'w-4 h-4' : 'w-5 h-5'}
              bg-red-100 rounded-md flex items-center justify-center
            `}>
              <AlertTriangle className={`${size === 'small' ? 'w-2 h-2' : 'w-3 h-3'}`} />
            </div>
            <span className={`${size === 'small' ? 'text-xs' : 'text-sm'} font-bold`}>
              Limite atingido
            </span>
          </div>
          <p className={`${size === 'small' ? 'text-xs' : 'text-sm'} text-red-600 font-medium`}>
            Limite mensal atingido. Resetará no próximo mês.
          </p>
        </div>
      )}
    </div>
  );
};

export default TranscriptionCounter;
