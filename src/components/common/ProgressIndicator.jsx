import React from 'react';
import { X, Loader2 } from 'lucide-react';

const ProgressIndicator = ({ progress, message, onCancel }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-xl max-w-md w-full">
      <div className="text-center">
        <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
        
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Cargando datos
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {message}
        </p>
        
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="text-sm font-medium text-gray-900 dark:text-white mb-4">
          {progress}%
        </div>
        
        {onCancel && (
          <button
            onClick={onCancel}
            className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors mx-auto"
          >
            <X size={16} className="mr-2" />
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
};

export default ProgressIndicator;