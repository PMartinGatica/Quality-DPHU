import React from 'react';

const LoadingSpinner = ({ progress = 0, message = "Cargando...", isDarkMode = false }) => {
  const themeClasses = {
    container: isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900',
    card: isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
    text: isDarkMode ? 'text-gray-300' : 'text-gray-600'
  };

  return (
    <div className={`flex items-center justify-center h-full ${themeClasses.container}`}>
      <div className={`text-center p-8 rounded-lg shadow-lg max-w-md ${themeClasses.card}`}>
        <div className="mb-6">
          <div className="animate-spin mx-auto h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
        
        <div className={`text-lg font-medium mb-4 ${themeClasses.text}`}>
          {message}
        </div>
        
        {progress > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;