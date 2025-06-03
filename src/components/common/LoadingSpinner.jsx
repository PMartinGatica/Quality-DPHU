import React from 'react';

const LoadingSpinner = ({ progress, message, isDarkMode = true }) => {
  const themeClasses = {
    background: isDarkMode ? 'bg-gray-900' : 'bg-gray-100',
    text: {
      primary: isDarkMode ? 'text-white' : 'text-gray-900',
      secondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
      muted: isDarkMode ? 'text-gray-400' : 'text-gray-500'
    },
    progress: {
      background: isDarkMode ? 'text-gray-700' : 'text-gray-300',
      fill: isDarkMode ? 'text-blue-500' : 'text-blue-600',
      bar: isDarkMode ? 'bg-gray-700' : 'bg-gray-300',
      barFill: isDarkMode ? 'bg-blue-500' : 'bg-blue-600'
    }
  };

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 ${themeClasses.background}`}>
      <div className="text-center">
        {/* Spinner circular */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
            {/* Círculo de fondo */}
            <path
              className={themeClasses.progress.background}
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            {/* Círculo de progreso */}
            <path
              className={themeClasses.progress.fill}
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
            <span className={`text-2xl font-bold ${themeClasses.text.primary}`}>
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Logo DPHU */}
        <div className="mb-6">
          <h1 className={`text-4xl font-bold mb-2 ${themeClasses.text.primary}`}>DPHU</h1>
          <div className="text-sm bg-red-600 px-4 py-2 rounded inline-block text-white">
            Cargando Dashboard...
          </div>
        </div>

        {/* Mensaje de progreso */}
        <div className="max-w-md">
          <p className={`text-lg mb-2 ${themeClasses.text.secondary}`}>
            {message}
          </p>
          
          {/* Barra de progreso */}
          <div className={`w-full rounded-full h-2 mb-4 ${themeClasses.progress.bar}`}>
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${themeClasses.progress.barFill}`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          {/* Etapas de carga */}
          <div className={`text-sm ${themeClasses.text.muted}`}>
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