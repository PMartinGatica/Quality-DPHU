import React, { useState, useRef, useEffect } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';

const MultiModelSearch = ({ selectedModels = [], onChange, data, isDarkMode = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Obtener modelos únicos de los datos
  const availableModels = React.useMemo(() => {
    const models = [...new Set(data.map(item => item.MODELO))].filter(Boolean);
    return models.sort();
  }, [data]);

  // Filtrar modelos basado en el término de búsqueda
  const filteredModels = React.useMemo(() => {
    if (!searchTerm) return availableModels;
    return availableModels.filter(model => 
      model.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [availableModels, searchTerm]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const themeClasses = {
    container: isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900',
    dropdown: isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300',
    item: isDarkMode ? 'hover:bg-gray-600 text-white' : 'hover:bg-gray-100 text-gray-900',
    selected: isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white',
    tag: isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800',
    input: isDarkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white text-gray-900 placeholder-gray-500'
  };

  const handleModelToggle = (model) => {
    const newSelection = selectedModels.includes(model)
      ? selectedModels.filter(m => m !== model)
      : [...selectedModels, model];
    
    onChange(newSelection);
  };

  const handleRemoveModel = (modelToRemove) => {
    const newSelection = selectedModels.filter(model => model !== modelToRemove);
    onChange(newSelection);
  };

  const handleClearAll = () => {
    onChange([]);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Input principal */}
      <div 
        className={`w-full p-2 border rounded cursor-pointer flex items-center justify-between min-h-[42px] ${themeClasses.container}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex-1 flex flex-wrap gap-1">
          {selectedModels.length === 0 ? (
            <span className="text-gray-500">Seleccionar modelos...</span>
          ) : (
            selectedModels.map(model => (
              <span 
                key={model}
                className={`inline-flex items-center px-2 py-1 rounded text-xs ${themeClasses.tag}`}
              >
                {model}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveModel(model);
                  }}
                  className="ml-1 hover:bg-red-500 rounded"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {selectedModels.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClearAll();
              }}
              className="text-gray-400 hover:text-red-500"
              title="Limpiar todo"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <ChevronDown className={`h-4 w-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className={`absolute z-50 w-full mt-1 border rounded shadow-lg max-h-60 ${themeClasses.dropdown}`}>
          {/* Campo de búsqueda */}
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar modelo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-8 pr-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 ${themeClasses.input}`}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Lista de modelos */}
          <div className="max-h-40 overflow-y-auto">
            {filteredModels.length === 0 ? (
              <div className="p-3 text-gray-500 text-center">
                {searchTerm ? 'No se encontraron modelos' : 'No hay modelos disponibles'}
              </div>
            ) : (
              <>
                {/* Opción para seleccionar todos */}
                <div 
                  className={`p-2 cursor-pointer border-b ${themeClasses.item}`}
                  onClick={() => {
                    if (selectedModels.length === filteredModels.length) {
                      handleClearAll();
                    } else {
                      onChange(filteredModels);
                    }
                  }}
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedModels.length === filteredModels.length && filteredModels.length > 0}
                      onChange={() => {}}
                      className="mr-2"
                    />
                    <span className="font-medium">
                      {selectedModels.length === filteredModels.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                    </span>
                    <span className="ml-auto text-xs text-gray-500">
                      ({filteredModels.length})
                    </span>
                  </div>
                </div>

                {/* Lista de modelos individuales */}
                {filteredModels.map(model => (
                  <div 
                    key={model}
                    className={`p-2 cursor-pointer ${themeClasses.item}`}
                    onClick={() => handleModelToggle(model)}
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedModels.includes(model)}
                        onChange={() => {}}
                        className="mr-2"
                      />
                      <span className="flex-1">{model}</span>
                      <span className="text-xs text-gray-500">
                        ({data.filter(item => item.MODELO === model).length})
                      </span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiModelSearch;