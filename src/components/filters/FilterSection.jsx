import React from 'react';
import { FilterIcon } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const FilterSection = () => {
  const {
    filters,
    handleFilterChange,
    handleFilterApply,
    clearFilters
  } = useAppContext();

  const {
    startDate,
    endDate,
    selectedModel,
    minDate,
    maxDate,
    uniqueModels = []
  } = filters || {};

  return (
    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 flex-shrink-0">
      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center">
        <FilterIcon size={24} className="mr-2 text-blue-600 dark:text-blue-400" />
        Filtros
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <div className="flex flex-col">
          <label htmlFor="startDate" className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
            Desde:
          </label>
          <input 
            type="date" 
            id="startDate" 
            value={startDate || ''} 
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            style={{ colorScheme: 'light' }} // Fuerza el esquema light para mejor visibilidad
            min={minDate || ''} 
            max={endDate || maxDate || ''} 
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="endDate" className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
            Hasta:
          </label>
          <input 
            type="date" 
            id="endDate" 
            value={endDate || ''} 
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            style={{ colorScheme: 'light' }} // Fuerza el esquema light para mejor visibilidad
            min={startDate || minDate || ''} 
            max={maxDate || ''} 
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="modelFilter" className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
            Modelo:
          </label>
          <select 
            id="modelFilter" 
            value={selectedModel || ''} 
            onChange={(e) => handleFilterChange('selectedModel', e.target.value)}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 h-[42px]"
          >
            <option value="">Todos los Modelos</option>
            {uniqueModels.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={handleFilterApply}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-150 ease-in-out flex items-center justify-center"
          >
            Aplicar
          </button>
          <button 
            onClick={clearFilters}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-150 ease-in-out"
          >
            Limpiar
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterSection;