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

  // Obtener mensaje dinámico basado en el progreso
  const getProgressMessage = (progress) => {
    if (progress < 10) return "🔗 Conectando con Google Sheets...";
    if (progress < 25) return "📡 Descargando primer lote de datos...";
    if (progress < 50) return "📊 Cargando datos (esto puede tomar unos minutos)...";
    if (progress < 75) return "🔄 Continuando descarga de registros...";
    if (progress < 95) return "🧹 Finalizando carga y procesando datos...";
    return "✅ Preparando dashboard...";
  };

  const getDataLoadingInfo = (progress) => {
    const estimatedRecords = Math.floor((progress / 100) * 100000); // Estimación
    return `Aproximadamente ${estimatedRecords.toLocaleString()} registros cargados`;
  };

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 ${themeClasses.background}`}>
      <div className="text-center max-w-lg">
        {/* Spinner circular */}
        <div className="relative w-40 h-40 mx-auto mb-8">
          <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 36 36">
            {/* Círculo de fondo */}
            <path
              className={themeClasses.progress.background}
              stroke="currentColor"
              strokeWidth="1.5"
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
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className={`text-3xl font-bold ${themeClasses.text.primary}`}>
              {Math.round(progress)}%
            </span>
            <span className={`text-xs ${themeClasses.text.muted}`}>
              completado
            </span>
          </div>
        </div>

        {/* Logo DPHU */}
        <div className="mb-8">
          <h1 className={`text-5xl font-bold mb-3 ${themeClasses.text.primary}`}>DPHU</h1>
          <div className="text-sm bg-red-600 px-4 py-2 rounded-lg inline-block text-white font-semibold">
            Cargando Dashboard de Calidad
          </div>
        </div>

        {/* Información de progreso */}
        <div className="space-y-4">
          <p className={`text-lg font-medium ${themeClasses.text.secondary}`}>
            {getProgressMessage(progress)}
          </p>
          
          {/* Barra de progreso */}
          <div className={`w-full rounded-full h-3 ${themeClasses.progress.bar}`}>
            <div 
              className={`h-3 rounded-full transition-all duration-500 ease-out ${themeClasses.progress.barFill}`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          {/* Información detallada */}
          <div className="space-y-2">
            <div className={`text-sm ${themeClasses.text.muted}`}>
              {progress > 10 && getDataLoadingInfo(progress)}
            </div>
            
            {progress > 25 && (
              <div className={`text-xs ${themeClasses.text.muted}`}>
                ⚡ Los datos se cargan automáticamente por lotes para un mejor rendimiento
              </div>
            )}
            
            {progress > 50 && (
              <div className={`text-xs ${themeClasses.text.muted}`}>
                📊 Todos los registros con NS válido serán incluidos en el análisis
              </div>
            )}
          </div>
        </div>

        {/* Mensaje de paciencia */}
        {progress > 10 && progress < 90 && (
          <div className={`mt-6 p-3 rounded-lg ${isDarkMode ? 'bg-blue-900 bg-opacity-30' : 'bg-blue-100'}`}>
            <p className={`text-sm ${themeClasses.text.secondary}`}>
              ⏳ Por favor espere mientras se cargan todos los datos...
              <br />
              <span className={`text-xs ${themeClasses.text.muted}`}>
                Este proceso puede tomar varios minutos dependiendo del volumen de datos
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;