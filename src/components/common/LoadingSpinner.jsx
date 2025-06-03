import React from 'react';

const LoadingSpinner = ({ progress, message }) => {
  return (
    <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50">
      <div className="text-center">
        {/* Spinner circular */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
            {/* Círculo de fondo */}
            <path
              className="text-gray-700"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            {/* Círculo de progreso */}
            <path
              className="text-blue-500"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray={`${progress}, 100`}
              strokeLinecap="round"
              fill="none"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          
          {/* Porcentaje en el centro */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Logo DPHU */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">DPHU</h1>
          <div className="text-sm bg-red-600 px-4 py-2 rounded inline-block">
            Cargando Dashboard...
          </div>
        </div>

        {/* Mensaje de progreso */}
        <div className="max-w-md">
          <p className="text-lg text-gray-300 mb-2">
            {message}
          </p>
          
          {/* Barra de progreso */}
          <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          {/* Etapas de carga */}
          <div className="text-sm text-gray-400">
            {progress < 30 && "🔗 Conectando con Google Sheets..."}
            {progress >= 30 && progress < 50 && "📡 Descargando datos..."}
            {progress >= 50 && progress < 70 && "📊 Procesando información..."}
            {progress >= 70 && progress < 90 && "🧹 Limpiando y validando datos..."}
            {progress >= 90 && "✅ Preparando dashboard..."}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;