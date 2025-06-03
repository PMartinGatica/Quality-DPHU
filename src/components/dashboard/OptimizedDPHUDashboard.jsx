import React, { useState, useEffect } from 'react';
import { useOptimizedGoogleSheetsAPI } from '../../hooks/useOptimizedGoogleSheetsAPI';
import { useOptimizedPivotTable } from '../../hooks/useOptimizedPivotTable';
import FilterSection from '../filters/FilterSection';
import PivotTable from '../pivot/PivotTable';
import ProgressIndicator from '../common/ProgressIndicator';
import { Download, X } from 'lucide-react';

const OptimizedDPHUDashboard = () => {
  const { 
    allData, 
    filteredData, 
    loading, 
    error, 
    progress, 
    loadingMessage,
    fetchAllData, 
    applyFilters, 
    getUniqueModels,
    cancelLoad
  } = useOptimizedGoogleSheetsAPI();
  
  const [filters, setFilters] = useState({
    fecha_desde: '',
    fecha_hasta: '',
    modelo: 'Todos los Modelos',
  });

  const [pivotDepth, setPivotDepth] = useState(3);
  const pivotData = useOptimizedPivotTable(filteredData, pivotDepth);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const handleFilterApply = () => {
    applyFilters(filters);
  };

  const handleClearFilters = () => {
    const clearedFilters = { fecha_desde: '', fecha_hasta: '', modelo: 'Todos los Modelos' };
    setFilters(clearedFilters);
    applyFilters(clearedFilters);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <ProgressIndicator 
          progress={progress} 
          message={loadingMessage}
          onCancel={cancelLoad}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 mb-4">
            Error: {error}
          </div>
          <div className="space-x-2">
            <button
              onClick={fetchAllData}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Reintentar
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Recargar Página
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-6">
      <FilterSection
        filters={filters}
        onFilterChange={handleFilterChange}
        onApply={handleFilterApply}
        onClear={handleClearFilters}
        loading={loading}
        models={getUniqueModels()}
      />

      {/* Controles de profundidad */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium">Profundidad del análisis:</label>
            <select 
              value={pivotDepth} 
              onChange={(e) => setPivotDepth(parseInt(e.target.value))}
              className="px-3 py-1 border rounded"
            >
              <option value={2}>Rápido (2 niveles)</option>
              <option value={3}>Normal (3 niveles)</option>
              <option value={4}>Completo (4 niveles)</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {allData.length.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">
                {filteredData.length.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">Filtrados</div>
            </div>
          </div>
        </div>
      </div>

      <PivotTable data={pivotData} loading={loading} />
    </div>
  );
};

export default OptimizedDPHUDashboard;