import React from 'react';

const FilterControls = ({
  startDate,
  endDate,
  selectedModel,
  onStartDateChange,
  onEndDateChange,
  onModelChange,
  onApply,
  onClear,
  minDate,
  maxDate,
  uniqueModels
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Fecha Inicio
        </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          min={minDate}
          max={maxDate}
          className="border rounded-md p-2 dark:bg-gray-700 dark:border-gray-600"
        />
      </div>

      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Fecha Fin
        </label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          min={minDate}
          max={maxDate}
          className="border rounded-md p-2 dark:bg-gray-700 dark:border-gray-600"
        />
      </div>

      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Modelo
        </label>
        <select
          value={selectedModel}
          onChange={(e) => onModelChange(e.target.value)}
          className="border rounded-md p-2 dark:bg-gray-700 dark:border-gray-600"
        >
          <option value="">Todos</option>
          {uniqueModels.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
      </div>

      <div className="md:col-span-3 flex justify-end gap-4 mt-4">
        <button
          onClick={onClear}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
        >
          Limpiar
        </button>
        <button
          onClick={onApply}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          Aplicar
        </button>
      </div>
    </div>
  );
};

export default FilterControls;